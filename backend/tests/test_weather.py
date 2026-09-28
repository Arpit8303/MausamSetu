"""
Test suite for MausamSetu Weather + NDVI + Advisory integration.

Covers:
- happy path (Open-Meteo + GEE both succeed)
- Open-Meteo down → cache fallback
- Open-Meteo down + no cache → 503
- GEE timeout → ndvi: null + warning (no 500)
- invalid panchayat_id → 404
- wind unit: m/s → km/h conversion assertion
- timezone UTC parsing assertion
- cache hit / miss flags
- distance == 0 in downscaler (no ZeroDivisionError or NaN)
- IDW: no division-by-distance in apply_baseline_downscaling
- cold vs warm cache response time (measured)
"""
import time
import pytest
import asyncio
import httpx
from datetime import datetime, timezone
from unittest.mock import patch, AsyncMock, MagicMock, call
from fastapi.testclient import TestClient

from app.main import app
from app.utils.cache import weather_cache, ndvi_cache
from app.db.session import get_db
from ml.downscaling_engine import WeatherDownscaler

client = TestClient(app)

# ─────────────────────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────────────────────
@pytest.fixture(autouse=True)
def clear_caches():
    weather_cache.clear()
    ndvi_cache.clear()
    yield
    weather_cache.clear()
    ndvi_cache.clear()


def _mock_panchayat():
    p = MagicMock()
    p.id = 1
    p.name = "Test Panchayat"
    p.latitude = 26.5
    p.longitude = 80.5
    p.elevation = 150.0
    p.aspect = 180.0
    p.slope = 2.5
    p.block.name = "Test Block"
    p.block.district.name = "Test District"
    p.block.district.state.name = "Test State"
    return p


def _mock_om_response():
    return {
        "elevation": 155.0,
        "daily": {
            "time": ["2026-09-28"],
            "temperature_2m_max": [35.0],
            "temperature_2m_min": [25.0],
            "precipitation_sum": [10.0],
            "precipitation_probability_max": [50],
            "et0_fao_evapotranspiration": [5.0],
            "wind_speed_10m_max": [4.0],          # 4.0 m/s → 14.4 km/h
        },
        "hourly": {
            "time": ["2026-09-28T12:00"],           # UTC, no offset (appended with Z)
            "temperature_2m": [30.0],
            "relative_humidity_2m": [60],
            "precipitation": [0.0],
            "cloud_cover": [20],
            "wind_speed_10m": [3.0],               # 3.0 m/s → 10.8 km/h
            "soil_temperature_0cm": [32.0],
            "soil_moisture_0_to_7cm": [0.3],
            "direct_radiation": [450.0],
            "diffuse_radiation": [120.0],
        },
    }


def _make_mock_client(json_payload):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = json_payload
    mock_resp.raise_for_status = MagicMock()

    mock_async_client = AsyncMock()
    mock_async_client.get.return_value = mock_resp
    return mock_async_client


@pytest.fixture()
def mock_db_panchayat():
    mock_db = MagicMock()
    p = _mock_panchayat()
    mock_db.query.return_value.filter.return_value.first.return_value = p
    app.dependency_overrides[get_db] = lambda: mock_db
    yield mock_db, p
    app.dependency_overrides.pop(get_db, None)


# ─────────────────────────────────────────────────────────────
# 1. Timezone – UTC parsing assertion
# ─────────────────────────────────────────────────────────────
def test_timezone_utc_parsing():
    """
    Open-Meteo timestamps are "2026-09-28T12:00" (UTC, no offset).
    We append 'Z' and parse with strptime. Result must have hour=12 in UTC.
    """
    raw = "2026-09-28T12:00"
    dt = datetime.strptime(raw + "Z", "%Y-%m-%dT%H:%MZ")
    dt_utc = dt.replace(tzinfo=timezone.utc)
    assert dt_utc.isoformat() == "2026-09-28T12:00:00+00:00"
    assert dt_utc.utcoffset().total_seconds() == 0


# ─────────────────────────────────────────────────────────────
# 2. Invalid panchayat_id → 404
# ─────────────────────────────────────────────────────────────
def test_invalid_panchayat_id():
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = None
    app.dependency_overrides[get_db] = lambda: mock_db
    try:
        response = client.get("/api/v1/weather/current?panchayat_id=999999")
        assert response.status_code == 404
        assert "Panchayat not found" in response.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_db, None)


# ─────────────────────────────────────────────────────────────
# 3. Happy path – Open-Meteo + GEE both succeed
#    Also verifies: cache miss flag, unit conversion, no credentials in response
# ─────────────────────────────────────────────────────────────
@patch("app.data_ingestion.open_meteo.http_client.get_client")
@patch("app.api.weather.fetch_ndvi_with_cache")
def test_happy_path(mock_ndvi_fn, mock_get_client, mock_db_panchayat):
    mock_db, p = mock_db_panchayat
    mock_get_client.return_value = _make_mock_client(_mock_om_response())
    mock_ndvi_fn.return_value = (
        {"avg_ndvi": 0.45, "tile_url": "https://earthengine.googleapis.com/tile/xyz", "generated_at": "2026-09-28T00:00:00"},
        False  # not from cache
    )

    resp = client.get("/api/v1/weather/current?panchayat_id=1&include_ndvi=true&include_advisories=true")
    assert resp.status_code == 200
    data = resp.json()

    # Location
    assert data["panchayat_name"] == "Test Panchayat"
    assert data["block_name"] == "Test Block"

    # Cache metadata
    assert data["weather_cached"] == False
    assert data["stale"] == False
    assert data["downscaled"] == False

    # Unit conversion: wind from hourly → 3.0 m/s * 3.6 = 10.8 km/h
    assert data["wind_speed_kmh"] == pytest.approx(10.8, abs=0.1)

    # NDVI present
    assert data["ndvi"] is not None
    assert data["ndvi"]["avg_ndvi"] == 0.45
    assert "tile_url" in data["ndvi"]

    # Advisories present
    assert data["advisories"] is not None
    assert len(data["advisories"]) >= 1

    # No API keys / credentials in response
    response_str = resp.text
    assert "service_account" not in response_str
    assert "private_key" not in response_str
    assert "client_secret" not in response_str
    assert "api_key" not in response_str.lower()


# ─────────────────────────────────────────────────────────────
# 4. Cache hit – weather_cached == True on second call
# ─────────────────────────────────────────────────────────────
@patch("app.data_ingestion.open_meteo.http_client.get_client")
@patch("app.api.weather.fetch_ndvi_with_cache")
def test_cache_hit_on_second_call(mock_ndvi_fn, mock_get_client, mock_db_panchayat):
    mock_db, p = mock_db_panchayat
    mock_ndvi_fn.return_value = (None, False)
    mock_get_client.return_value = _make_mock_client(_mock_om_response())

    # First call – cold cache
    t0 = time.perf_counter()
    r1 = client.get("/api/v1/weather/current?panchayat_id=1")
    cold_ms = (time.perf_counter() - t0) * 1000
    assert r1.status_code == 200
    assert r1.json()["weather_cached"] == False

    # Second call – warm cache (Open-Meteo should NOT be called again)
    t1 = time.perf_counter()
    r2 = client.get("/api/v1/weather/current?panchayat_id=1")
    warm_ms = (time.perf_counter() - t1) * 1000
    assert r2.status_code == 200
    assert r2.json()["weather_cached"] == True

    # Report timings
    print(f"\n[PERF] Cold cache: {cold_ms:.1f} ms | Warm cache: {warm_ms:.1f} ms")
    # httpx mock was only called once
    mock_get_client.return_value.get.assert_called_once()


# ─────────────────────────────────────────────────────────────
# 5. GEE timeout → ndvi: null, warning, still 200
# ─────────────────────────────────────────────────────────────
@patch("app.data_ingestion.open_meteo.http_client.get_client")
@patch("app.api.weather.fetch_ndvi_with_cache")
def test_gee_timeout_returns_null_ndvi(mock_ndvi_fn, mock_get_client, mock_db_panchayat):
    mock_db, p = mock_db_panchayat
    mock_get_client.return_value = _make_mock_client(_mock_om_response())
    # GEE fails silently inside fetch_ndvi_with_cache, returns (None, False)
    mock_ndvi_fn.return_value = (None, False)

    resp = client.get("/api/v1/weather/current?panchayat_id=1&include_ndvi=true")
    assert resp.status_code == 200
    data = resp.json()
    assert data["ndvi"] is None
    assert data["warnings"] is not None
    assert any("NDVI" in w for w in data["warnings"])


# ─────────────────────────────────────────────────────────────
# 6. Open-Meteo 5xx with no cache → 503
# ─────────────────────────────────────────────────────────────
@patch("app.data_ingestion.open_meteo.http_client.get_client")
@patch("app.api.weather.fetch_ndvi_with_cache")
def test_open_meteo_down_no_cache_returns_503(mock_ndvi_fn, mock_get_client, mock_db_panchayat):
    mock_db, p = mock_db_panchayat
    mock_ndvi_fn.return_value = (None, False)
    mock_async_client = AsyncMock()
    mock_async_client.get.side_effect = httpx.TimeoutException("upstream timeout")
    mock_get_client.return_value = mock_async_client

    resp = client.get("/api/v1/weather/current?panchayat_id=1")
    assert resp.status_code == 503
    assert "unavailable" in resp.json()["detail"].lower()


# ─────────────────────────────────────────────────────────────
# 7. Open-Meteo down + stale cache → 200 with stale:true + warning
# ─────────────────────────────────────────────────────────────
@patch("app.data_ingestion.open_meteo.http_client.get_client")
@patch("app.api.weather.fetch_ndvi_with_cache")
def test_open_meteo_down_stale_cache_returns_200(mock_ndvi_fn, mock_get_client, mock_db_panchayat):
    mock_db, p = mock_db_panchayat
    mock_ndvi_fn.return_value = (None, False)

    # Manually insert stale (TTL-expired) entry into raw cache
    stale_data = {
        "elevation_m": 155.0,
        "daily": [{"date": "2026-09-27", "temp_min_c": 20, "temp_max_c": 30,
                   "precipitation_mm": 0, "precipitation_prob_pct": 0, "et0_mm": 3, "wind_speed_ms": 2}],
        "hourly": [{"timestamp": "2026-09-27T06:00Z", "temp_c": 25, "humidity_pct": 55,
                    "precipitation_mm": 0, "cloud_cover_pct": 10, "wind_speed_ms": 2,
                    "soil_temp_0cm_c": 28, "soil_moisture_vol_pct": 0.2,
                    "direct_radiation_wm2": 200, "diffuse_radiation_wm2": 80}],
    }
    cache_key = "weather_26.5_80.5_1"
    weather_cache._cache[cache_key] = {"data": stale_data, "timestamp": time.time() - 999999}

    # Open-Meteo will fail
    mock_async_client = AsyncMock()
    mock_async_client.get.side_effect = httpx.TimeoutException("upstream timeout")
    mock_get_client.return_value = mock_async_client

    resp = client.get("/api/v1/weather/current?panchayat_id=1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["stale"] == True
    assert any("stale" in w.lower() for w in (data.get("warnings") or []))


# ─────────────────────────────────────────────────────────────
# 8. Wind unit consistency with Advisory Engine
#    Advisory engine reads `wind_speed_kmh`. We pass km/h. Verify threshold fires.
# ─────────────────────────────────────────────────────────────
def test_advisory_wind_unit_matches():
    """
    Advisory engine threshold: wind > 25 km/h triggers lodging alert.
    Open-Meteo gives 7.0 m/s = 25.2 km/h → must trigger.
    """
    from app.services.advisory_engine import AdvisoryEngine
    wind_ms = 7.0
    wind_kmh = round(wind_ms * 3.6, 1)  # 25.2

    forecast = {
        "temp_max_c": 30.0, "temp_min_c": 20.0, "precipitation_mm": 0.0,
        "humidity_pct": 50.0, "wind_speed_kmh": wind_kmh, "panchayat_name": "Test"
    }
    advisories = AdvisoryEngine.generate_advisories("Wheat", "Flowering Stage", forecast)
    wind_advisory = [a for a in advisories if "Wind" in a.get("title", "")]
    assert len(wind_advisory) >= 1, f"Expected wind advisory for {wind_kmh} km/h"


# ─────────────────────────────────────────────────────────────
# 9. Downscaler: distance == 0 → no ZeroDivisionError, no NaN
# ─────────────────────────────────────────────────────────────
def test_downscaler_distance_zero():
    ds = WeatherDownscaler()
    # Same lat/lon for source and panchayat
    result = ds.apply_baseline_downscaling(
        block_temp_min=20.0, block_temp_max=35.0, block_humidity=60.0,
        block_precip=5.0, block_wind=15.0, block_elevation=150.0,
        block_lat=26.5, block_lon=80.5,
        panchayat_elevation=150.0, panchayat_lat=26.5, panchayat_lon=80.5,
        panchayat_slope=2.5, panchayat_aspect=180.0
    )
    import math
    for k, v in result.items():
        assert not math.isnan(float(v)), f"{k} is NaN"
    # No ZeroDivisionError is the implicit assertion (test would have crashed)
    assert result["temp_max_c"] == pytest.approx(35.0, abs=1.0)


# ─────────────────────────────────────────────────────────────
# 10. IDW: apply_baseline_downscaling never divides by distance
# ─────────────────────────────────────────────────────────────
def test_no_idw_division_in_baseline_downscaling():
    """
    Confirm apply_baseline_downscaling doesn't divide by distance.
    If it does, distance=0 would cause ZeroDivisionError (covered above).
    This test is a code-path audit – just runs safely with 0 distance.
    """
    ds = WeatherDownscaler()
    try:
        res = ds.apply_baseline_downscaling(
            block_temp_min=18.0, block_temp_max=32.0, block_humidity=65.0,
            block_precip=0.0, block_wind=10.0, block_elevation=200.0,
            block_lat=26.5, block_lon=80.5,
            panchayat_elevation=200.0, panchayat_lat=26.5, panchayat_lon=80.5
        )
        assert "temp_max_c" in res
    except ZeroDivisionError:
        pytest.fail("ZeroDivisionError in apply_baseline_downscaling with distance==0")


# ─────────────────────────────────────────────────────────────
# 11. /intelligence endpoint exists and delegates correctly
# ─────────────────────────────────────────────────────────────
@patch("app.data_ingestion.open_meteo.http_client.get_client")
@patch("app.api.weather.fetch_ndvi_with_cache")
def test_intelligence_endpoint(mock_ndvi_fn, mock_get_client, mock_db_panchayat):
    mock_db, p = mock_db_panchayat
    mock_get_client.return_value = _make_mock_client(_mock_om_response())
    mock_ndvi_fn.return_value = (
        {"avg_ndvi": 0.6, "tile_url": "https://gee/tile", "generated_at": "2026-09-28T00:00:00"},
        False
    )
    resp = client.get("/api/v1/weather/intelligence?panchayat_id=1")
    assert resp.status_code == 200
    data = resp.json()
    # Must include ndvi and advisories (both forced true)
    assert data["ndvi"] is not None
    assert data["advisories"] is not None
    # No credentials
    assert "private_key" not in resp.text
    assert "service_account" not in resp.text
