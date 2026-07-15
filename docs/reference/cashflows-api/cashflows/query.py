"""Polars query over cdz parquet in ADLS.

Lazily scans only the requested AsOf/AsAt snapshot and pushes the instrument filter and
column selection down into the parquet scan (predicate + projection pushdown), so only
the needed row-groups/columns leave blob. The workload is an additive aggregation (SUM of
member cashflows bucketed by date), which a columnar engine resolves in hundreds of ms
even for a ~100-300 MB snapshot.

Polars is the default engine for compute-on-read on this platform (already in production
use elsewhere in the stack) — see ../../detail-data-serving-architecture.md for the
Polars-vs-DuckDB comparison and rationale.

Adapt the column names (instrument_id, bucket_date, amount) to the real cdz schema.
"""

from __future__ import annotations

from typing import Optional

import polars as pl
from azure.identity import DefaultAzureCredential

from .config import Config

_AZURE_STORAGE_SCOPE = "https://storage.azure.com/.default"


def _storage_options(cfg: Config, credential: object) -> dict[str, str]:
    # DefaultAzureCredential caches the token in-process until near expiry, so this is
    # cheap on warm invocations (Managed Identity in Azure, dev creds locally).
    token = credential.get_token(_AZURE_STORAGE_SCOPE).token
    return {"account_name": cfg.adls_account, "bearer_token": token}


def aggregate_group(
    cfg: Config,
    as_of: str,
    as_at: str,
    instrument_ids: list[str],
    credential: Optional[object] = None,
) -> list[dict]:
    """Return [{bucketDate, cashflow}, ...] summed across the given instruments."""
    ids = sorted(set(instrument_ids))
    if not ids:
        return []

    storage_options = _storage_options(cfg, credential or DefaultAzureCredential())

    lf = pl.scan_parquet(
        cfg.cashflows_glob(as_of, as_at),
        storage_options=storage_options,
    )
    result = (
        lf.filter(pl.col("instrument_id").is_in(ids))
        .group_by("bucket_date")
        .agg(pl.col("amount").sum().alias("cashflow"))
        .sort("bucket_date")
        .collect()  # lazy: filter/projection are pushed down into the scan
    )

    return [
        {"bucketDate": bucket_date.isoformat(), "cashflow": float(cashflow)}
        for bucket_date, cashflow in result.iter_rows()
    ]
