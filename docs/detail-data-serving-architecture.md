# Serving Detail Data (Cashflows) — Architecture Recommendation

Status: proposed
Scope: how to expose semi-aggregated, heavy detail data (e.g. cashflows per instrument or per group of instruments) on the Quant platform without breaking the low-cost premise of the current parquet-based backend.

## Context

The backend lives in Synapse and works primarily off parquet files, readable via
Serverless SQL or directly from ADLS with Python. The data lake is organized in three zones:

- **rdz (raw data zone)** — raw data as it lands from sources (Excel, JSON, CSV, on-prem DB queries, etc.).
- **cdz (curated data zone)** — cleaned and structured data, typically partitioned by `AsOf`, other business variables, and finally `AsAt` (the snapshot date).
- **mdz (model data zone)** — JSON files with aggregated results, ready to display. This is the normal data source for a platform like this: pre-computed, display-ready outputs.

The mdz→JSON pattern is cheap and fast, but it only works for **outputs you can enumerate ahead of time**. Some data we want to expose is less aggregated — cashflows tied to a specific instrument or to an arbitrary group of instruments — and part of the requirement is **dynamic grouping** (the user picks instruments freely), on a portfolio of ~20,000 assets.

## The key decision variable

The question is not "JSON vs SQL". It is:

> Are the "groups" a finite, predefined set (portfolios, asset classes, regulatory buckets), or arbitrary combinations the user assembles on the fly?

- **Individual instrument** → always enumerable. One entity per instrument.
- **Predefined groups** → also enumerable. Pre-generate one per group.
- **Ad-hoc / dynamic groups** → combinatorial explosion. Pre-generated JSON cannot cover `2^N` combinations of 20,000 assets. This case **requires a query engine**.

Because the requirement includes dynamic groups, we need compute-on-read for that path. Predefined groups and single instruments stay on the cheap pre-computed path.

## Why storage cost is not the deciding factor

Duplicating data into mdz is often feared as "filling mdz with repeated data". In cost terms this fear is miscalibrated:

- ADLS / blob storage costs ~US$0.018–0.02 / GB / month. Repeating cashflows per `AsAt` snapshot is economically negligible.
- The real cost of the JSON option is **(1) regeneration compute** and **(2) rigidity** against queries you did not anticipate — not storage.

So the choice should be driven by the **access pattern**, not by storage duplication.

## Sizing the "heavy" data

Cashflows are the heaviest dataset we have, but they are small for a columnar engine. Worst realistic case (monthly buckets, ~30-year horizon ≈ 360 flows per instrument):

- ~7.2M rows **per AsAt snapshot**
- ~100–300 MB in compressed parquet per snapshot

A columnar engine (DuckDB / parquet) filters `instrument_id IN (...)` and aggregates by date over that in **hundreds of milliseconds**. What is heavy for JSON is light for columnar — this is exactly what parquet was designed for.

## Why columnar over parquet beats Azure SQL here

A group's cashflow is **additive**: the group curve = sum of member instruments' flows bucketed by date. That is a pure `GROUP BY` over columns. A columnar engine beats a row-store SQL database on this workload **by design**, not just on price. Azure SQL would cost always-on billing to do *worse* what parquet does cheaply.

Azure SQL is only justified under very high concurrency (thousands of simultaneous users), which is not the profile of an internal investment portal. Do not adopt it as the default; adopt it only if measurements prove the parquet path cannot meet latency/concurrency targets.

## Options compared

| Option | Latency | Cost | When |
|---|---|---|---|
| **JSON in mdz** (per instrument / predefined group) | ~ms (CDN-cacheable, static serve) | minimal (storage + generation compute) | Enumerable entities, known hot path |
| **Serverless SQL over parquet** (already available) | seconds, cold start | US$5 / TB scanned | Ad-hoc, low concurrency, tolerates latency |
| **Azure Function + DuckDB/Polars over parquet** | ~hundreds of ms | ephemeral compute only, no always-on DB | Ad-hoc + interactive, low cost |
| **Azure SQL DB** | single-digit ms, indexed | vCore always-on (does not pause when customer-facing) | Ad-hoc + interactive + very high concurrency |

## Recommended architecture

**1. Cashflows in cdz as a parquet dataset, partitioned by `AsOf / AsAt`.**
Do **not** partition by instrument (20k partitions = thousands of tiny files, an anti-pattern). Within each snapshot, **sort/cluster by `instrument_id`** so the engine can do predicate pushdown via row-group statistics. Aim for one (or few) files per `AsAt`.

**2. A thin API (Azure Function) running DuckDB over that parquet.**
It receives the dynamic group's instrument list → filters → aggregates by date → returns the curve. No always-on database; you pay only for execution.

**3. A hash-keyed cache that bridges dynamic flexibility with JSON speed — the key piece.**
When a dynamic group arrives, compute it with DuckDB and **write the result as JSON to blob, keyed by `hash(instrument_set + AsAt)`**. Because `AsAt` snapshots are **immutable**, this cache **never needs invalidation** for a given `AsAt`. The next identical request serves JSON from blob/CDN in milliseconds at zero compute cost. This is effectively **lazily materialized mdz** — you only materialize what was actually requested, not the full combinatorial universe.

**4. Predefined groups (portfolios, asset classes) are pre-generated as JSON in mdz** during the batch run. Same cache, just warmed ahead of time — zero wait for the known hot path.

### Decision rule

```
Individual instrument / fixed groups  → pre-generated JSON in mdz (batch)
Dynamic groups                        → Azure Function + DuckDB over parquet (cdz)
                                        → result cached as JSON keyed by hash(set + AsAt)
Azure SQL                             → NO, unless measurements prove extreme concurrency
```

## The core concept: compute-on-read vs precompute-on-write

The difference from mdz is not technology — it is **when the compute happens**.

| | mdz (today) | Function + DuckDB/Polars |
|---|---|---|
| **When it computes** | On write (batch, ahead of time) | On read (per request, on demand) |
| **What it stores** | The final aggregated result | Nothing new — reads the detail in cdz |
| **Read path** | Fetch a dumb file (no CPU) | Runs a query in the moment |
| **Good for** | Known, enumerable outputs | Unknown / dynamic outputs |

mdz materializes results you already know someone will ask for: the batch runs once, leaves the JSON ready, and the web just does a `GET` of a static file. Fast and cheap — but only works if you can enumerate everything in advance. Dynamic groups cannot be enumerated.

The Function + DuckDB path inverts this: there is no pre-materialized result. When the request arrives with the instrument list, only then is the cdz parquet read, filtered, and aggregated. The hash cache is the bridge: compute on-read once, then persist as JSON so that group behaves like mdz from then on.

Analogy: mdz = "cook the dish and leave it served"; Function + DuckDB = "cook to order from the ingredients in cdz, and store the plate in the fridge (cache) in case it's ordered again."

## Request flow (dynamic group)

```
User selects instruments [A, B, C...] in the web, at a given AsAt
        │
        ▼
1. Front calls the API  ──►  does a cached JSON exist for hash(set + AsAt)?
        │                          │ yes → return JSON (ms, from blob/CDN). DONE.
        │                          │ no ↓
        ▼
2. Azure Function starts DuckDB (in-process, no DB server)
        │
3. DuckDB reads ONLY the requested AsAt parquet, in ADLS,
   with predicate pushdown: pulls only the needed row-groups and
   columns (not the whole file)
        │
4. Filters instrument_id IN (...), GROUP BY date, SUM(amount)
        │
5. Returns the aggregated curve (hundreds of ms)
        │
6. Writes that result as JSON to blob keyed by hash(set + AsAt)
   → the next identical hit short-circuits at step 1. Never invalidated
     because AsAt is immutable.
```

Key point at step 3: DuckDB does **not** load the whole parquet into memory or copy it. It reads byte ranges directly from blob, using the parquet's row-group statistics to skip everything that does not match the filter. That is why a 100–300 MB snapshot resolves in hundreds of ms even when it lives in ADLS.

## Reference code

**DuckDB:**
```python
import duckdb

con = duckdb.connect()
con.sql("INSTALL azure; LOAD azure;")
con.sql("CREATE SECRET (TYPE AZURE, PROVIDER CREDENTIAL_CHAIN, ACCOUNT_NAME 'myaccount');")

path = f"abfss://cdz@myaccount.dfs.core.windows.net/cashflows/AsOf={asof}/AsAt={asat}/*.parquet"
query = f"""
    SELECT bucket_date, SUM(amount) AS cashflow
    FROM read_parquet('{path}')
    WHERE instrument_id IN ({','.join(['?']*len(ids))})
    GROUP BY bucket_date ORDER BY bucket_date
"""
result = con.execute(query, ids).fetch_arrow_table()
```

**Polars (same logic):**
```python
import polars as pl

lf = pl.scan_parquet(
    f"abfss://cdz@myaccount.dfs.core.windows.net/cashflows/AsOf={asof}/AsAt={asat}/*.parquet",
    storage_options={"account_name": "myaccount"},
)
result = (
    lf.filter(pl.col("instrument_id").is_in(ids))
      .group_by("bucket_date")
      .agg(pl.col("amount").sum().alias("cashflow"))
      .sort("bucket_date")
      .collect()   # lazy: filter/projection are pushed down into the scan
)
```

Note: `scan_parquet` + `.collect()` is *lazy* — Polars pushes the filter and column selection into the read, just like DuckDB. Using `read_parquet` (eager) would read everything first; `scan_` avoids that.

## DuckDB vs Polars for this case

Both work. For "serve aggregations from remote parquet on ADLS", DuckDB has the edge:

**DuckDB advantages here:**
- More mature, battle-tested remote parquet reading with pushdown and **partition pruning**. The `azure` extension reads blob byte ranges tightly.
- `GROUP BY` / `SUM` is native SQL — the workload *is* an additive aggregation, natural fit.
- Handles larger-than-memory gracefully via streaming.
- Single embedded binary, near-instant startup (good for Function cold start).

**Polars is preferable when:**
- The logic becomes a complex chained transformation pipeline (feature engineering, joins, windows) — the DataFrame API is more composable than SQL for that.
- The stack is already standardized on Polars.
- You want the result as a DataFrame for further Python processing.

**Recommendation:** for "filter by instruments + aggregate by date + serve", use **DuckDB**. Reserve Polars if cashflow transformation grows in complexity (e.g. discounting flows, applying scenarios, curves). They compose: DuckDB to read/filter → Arrow (zero-copy) → Polars to transform. They share Arrow without serializing.

## Operational notes

- **Function cold start:** on the Consumption plan, the first invocation after idle takes a few seconds to spin up the runtime. DuckDB itself starts in milliseconds; the cost is the Python/Function host. If first-hit latency matters, use a **Premium plan with one warm instance** or a Consumption health-ping. The hash cache amortizes this — repeat hits never touch the Function.
- **Memory:** size the Function for the largest AsAt snapshot × concurrency. With 100–300 MB per snapshot and pushdown, a modest plan is plenty. Monte Carlo scenarios (see open questions) would change this.
- **Concurrency:** each invocation is isolated and stateless — they scale horizontally on their own. No shared-DB contention.
- **Auth:** `CREDENTIAL_CHAIN` / Managed Identity from the Function to ADLS, no secrets in code.

## Open questions that would refine partitioning/sizing

1. **Are cashflows deterministic (contractual calendar) or stochastic (N Monte Carlo trajectories)?** Scenarios multiply volume by N and change the partitioning strategy.
2. **Are all daily AsAt snapshots retained, or only milestones?** This defines how the history grows over time.
