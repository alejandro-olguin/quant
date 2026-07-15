"""Blob cache for materialized dynamic-group cashflow curves.

The cache is lazily-materialized mrdz: the first request for a group computes the curve
and writes it here; subsequent identical requests read it back directly.

The key is a hash of the *normalized* request (sorted, de-duplicated instrument ids +
AsOf + AsAt). Because AsAt snapshots are immutable, a key never needs invalidation.
"""

from __future__ import annotations

import hashlib
import json
from typing import Optional

from azure.core.exceptions import ResourceNotFoundError
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient

from .config import Config


def cache_key(as_of: str, as_at: str, instrument_ids: list[str]) -> str:
    """Deterministic key. Order/duplicates in the request must not change the key."""
    normalized = sorted(set(instrument_ids))
    payload = json.dumps(
        {"asOf": as_of, "asAt": as_at, "instrumentIds": normalized},
        separators=(",", ":"),
        sort_keys=True,
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


class ResultCache:
    def __init__(self, cfg: Config, credential: Optional[object] = None):
        self._cfg = cfg
        self._client = BlobServiceClient(
            account_url=cfg.blob_account_url,
            credential=credential or DefaultAzureCredential(),
        )

    def _blob_name(self, key: str) -> str:
        # shard by first 2 hex chars to avoid a single hot prefix
        return f"{self._cfg.cache_prefix}/{key[:2]}/{key}.json"

    def get(self, key: str) -> Optional[dict]:
        blob = self._client.get_blob_client(self._cfg.cache_container, self._blob_name(key))
        try:
            data = blob.download_blob().readall()
        except ResourceNotFoundError:
            return None
        return json.loads(data)

    def put(self, key: str, result: dict) -> None:
        blob = self._client.get_blob_client(self._cfg.cache_container, self._blob_name(key))
        blob.upload_blob(
            json.dumps(result, separators=(",", ":")).encode("utf-8"),
            overwrite=True,
            content_type="application/json",
        )
