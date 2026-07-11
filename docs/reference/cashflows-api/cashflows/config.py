"""Environment-driven configuration for the cashflows API.

All values come from app settings (env vars) so the same code runs locally and in Azure.
No secrets live here — auth uses DefaultAzureCredential.
"""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Config:
    adls_account: str
    cdz_container: str
    cashflows_prefix: str
    cache_container: str
    cache_prefix: str
    max_instruments: int

    @property
    def adls_dfs_host(self) -> str:
        return f"{self.adls_account}.dfs.core.windows.net"

    @property
    def blob_account_url(self) -> str:
        return f"https://{self.adls_account}.blob.core.windows.net"

    def cashflows_glob(self, as_of: str, as_at: str) -> str:
        """abfss glob for a single immutable snapshot, partitioned by AsOf/AsAt."""
        return (
            f"abfss://{self.cdz_container}@{self.adls_dfs_host}/"
            f"{self.cashflows_prefix}/AsOf={as_of}/AsAt={as_at}/*.parquet"
        )


def load_config() -> Config:
    return Config(
        adls_account=_require("ADLS_ACCOUNT"),
        cdz_container=os.getenv("CDZ_CONTAINER", "cdz"),
        cashflows_prefix=os.getenv("CASHFLOWS_PREFIX", "cashflows"),
        cache_container=os.getenv("CACHE_CONTAINER", "mdz-cache"),
        cache_prefix=os.getenv("CACHE_PREFIX", "cashflows-groups"),
        max_instruments=int(os.getenv("MAX_INSTRUMENTS", "5000")),
    )


def _require(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required app setting: {name}")
    return value
