# cashflows-api — reference implementation

A thin Azure Function that serves aggregated cashflow curves for **dynamic groups** of
instruments, following [detail-data-serving-architecture.md](../../detail-data-serving-architecture.md).

It is the **compute-on-read** path: no pre-materialized result. On each request it
either serves a cached JSON (hash of the instrument set + snapshot) or computes the
aggregation with DuckDB directly over the cdz parquet, then persists the result as JSON
so the next identical request is a cheap cache hit.

```
HTTP request ─► cache lookup (blob, keyed by hash(set+AsOf+AsAt))
                   │ hit  ─► return cached JSON            (ms)
                   │ miss ─► DuckDB over cdz parquet ─► JSON ─► write to cache
```

This is a **reference skeleton**, not production code: auth, input validation limits,
observability, and error contracts should be hardened before deployment. Cashflow amounts
here are synthetic-schema placeholders — adapt column names to the real cdz layout.

## Layout

```
function_app.py         HTTP trigger + orchestration (cache → compute → cache)
cashflows/config.py     env-driven configuration
cashflows/cache.py      blob cache: deterministic key, get, put
cashflows/query.py      DuckDB query over ADLS parquet (predicate pushdown)
requirements.txt        deps (azure-functions, duckdb, azure-storage-blob)
host.json               Functions host config
local.settings.example.json   local env template (do NOT commit real secrets)
```

## Request contract

`POST /api/cashflows`

```json
{
  "asOf": "2026-07-06",
  "asAt": "2026-07-06",
  "instrumentIds": ["INS-001", "INS-014", "INS-220"]
}
```

Response:

```json
{
  "asOf": "2026-07-06",
  "asAt": "2026-07-06",
  "cacheKey": "b1946ac9…",
  "cached": false,
  "curve": [
    { "bucketDate": "2026-08-31", "cashflow": 1250000.0 },
    { "bucketDate": "2026-09-30", "cashflow":  980000.0 }
  ]
}
```

## Config (env / app settings)

| Setting | Meaning |
|---|---|
| `ADLS_ACCOUNT` | ADLS Gen2 account name (e.g. `micuenta`) |
| `CDZ_CONTAINER` | container/filesystem holding cdz (e.g. `cdz`) |
| `CASHFLOWS_PREFIX` | path prefix of the cashflows dataset (e.g. `cashflows`) |
| `CACHE_CONTAINER` | blob container for materialized results (e.g. `mdz-cache`) |
| `CACHE_PREFIX` | key prefix inside the cache container (e.g. `cashflows-groups`) |
| `MAX_INSTRUMENTS` | guardrail on group size per request (e.g. `5000`) |

Auth to ADLS and blob uses `DefaultAzureCredential` (Managed Identity in Azure, dev
credentials locally) — no secrets in code.

## Why the cache never needs invalidation

The key includes `AsAt`, and `AsAt` snapshots are **immutable** by construction. A given
`(instrument_set, AsOf, AsAt)` always maps to the same result, so a cached entry is valid
forever. New snapshots simply produce new keys.
