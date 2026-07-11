"""Azure Function (Python v2 model): serve aggregated cashflow curves for dynamic groups.

Orchestration only — the interesting logic lives in the cashflows package:

    request ─► validate ─► cache.get(key)
                              │ hit  ─► return cached JSON
                              │ miss ─► query.aggregate_group ─► cache.put ─► return

The cache turns the dynamic long-tail into cheap repeat hits; the compute path keeps the
low-cost premise (ephemeral compute over parquet, no always-on database).
"""

from __future__ import annotations

import json
import logging

import azure.functions as func

from cashflows.cache import ResultCache, cache_key
from cashflows.config import load_config
from cashflows.query import aggregate_group

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

# Loaded once per worker; cheap to keep warm across invocations.
_CFG = load_config()
_CACHE = ResultCache(_CFG)

logger = logging.getLogger("cashflows")


@app.route(route="cashflows", methods=["POST"])
def cashflows(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except ValueError:
        return _error(400, "Body must be valid JSON")

    error = _validate(body)
    if error:
        return _error(400, error)

    as_of = body["asOf"]
    as_at = body["asAt"]
    instrument_ids = body["instrumentIds"]

    key = cache_key(as_of, as_at, instrument_ids)

    cached = _CACHE.get(key)
    if cached is not None:
        cached["cached"] = True
        return _ok(cached)

    logger.info("cache miss %s — computing (%d instruments)", key, len(instrument_ids))
    curve = aggregate_group(_CFG, as_of, as_at, instrument_ids)

    result = {
        "asOf": as_of,
        "asAt": as_at,
        "cacheKey": key,
        "cached": False,
        "curve": curve,
    }

    # Persist for future identical requests. AsAt is immutable → never needs invalidation.
    try:
        _CACHE.put(key, result)
    except Exception:  # caching is best-effort; never fail the request on a cache write
        logger.exception("failed to write cache for %s", key)

    return _ok(result)


def _validate(body: object) -> str | None:
    if not isinstance(body, dict):
        return "Body must be a JSON object"
    for field in ("asOf", "asAt", "instrumentIds"):
        if field not in body:
            return f"Missing field: {field}"
    ids = body["instrumentIds"]
    if not isinstance(ids, list) or not ids:
        return "instrumentIds must be a non-empty array"
    if not all(isinstance(x, str) for x in ids):
        return "instrumentIds must be an array of strings"
    if len(set(ids)) > _CFG.max_instruments:
        return f"Too many instruments (max {_CFG.max_instruments})"
    return None


def _ok(payload: dict) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps(payload, separators=(",", ":")),
        status_code=200,
        mimetype="application/json",
    )


def _error(status: int, message: str) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps({"error": message}),
        status_code=status,
        mimetype="application/json",
    )
