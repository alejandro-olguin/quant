"""DuckDB query over cdz parquet in ADLS.

Reads only the requested AsOf/AsAt snapshot and pushes the instrument filter and column
projection down into the parquet scan, so only the needed row-groups/columns leave blob.
The workload is an additive aggregation (SUM of member cashflows bucketed by date), which
a columnar engine resolves in hundreds of ms even for a ~100-300 MB snapshot.

Adapt the column names (instrument_id, bucket_date, amount) to the real cdz schema.
"""

from __future__ import annotations

from typing import Optional

import duckdb
from azure.identity import DefaultAzureCredential

from .config import Config


def _connect(cfg: Config, credential: Optional[object]) -> duckdb.DuckDBPyConnection:
    con = duckdb.connect()
    con.execute("INSTALL azure; LOAD azure;")
    # Use the Azure credential chain (Managed Identity in Azure, dev creds locally).
    # For the CREDENTIAL_CHAIN provider DuckDB resolves the identity itself; passing an
    # explicit token is also possible if you prefer to control the credential.
    con.execute(
        f"""
        CREATE OR REPLACE SECRET cdz (
            TYPE AZURE,
            PROVIDER CREDENTIAL_CHAIN,
            ACCOUNT_NAME '{cfg.adls_account}'
        );
        """
    )
    return con


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

    con = _connect(cfg, credential or DefaultAzureCredential())
    try:
        placeholders = ", ".join("?" for _ in ids)
        sql = f"""
            SELECT
                CAST(bucket_date AS DATE) AS bucket_date,
                SUM(amount)               AS cashflow
            FROM read_parquet('{cfg.cashflows_glob(as_of, as_at)}')
            WHERE instrument_id IN ({placeholders})
            GROUP BY bucket_date
            ORDER BY bucket_date
        """
        rows = con.execute(sql, ids).fetchall()
    finally:
        con.close()

    return [
        {"bucketDate": bucket_date.isoformat(), "cashflow": float(cashflow)}
        for bucket_date, cashflow in rows
    ]
