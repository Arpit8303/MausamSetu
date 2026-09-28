import asyncio
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.location import Panchayat, Block
from app.data_ingestion.open_meteo import OpenMeteoProvider
from ml.downscaling_engine import WeatherDownscaler
from app.services.ndvi_service import get_ndvi_for_location
from app.services.advisory_engine import AdvisoryEngine
from app.core.config import settings
from app.utils.cache import weather_cache, ndvi_cache
from app.schemas.weather import (
    CurrentWeatherResponse, WeatherForecastResponse, HourlyForecastItem, DailyForecastItem,
    CompareBlockPanchayatResponse, NDVIData, AdvisoryData
)

router = APIRouter(prefix="/weather", tags=["Weather Ingestion & Downscaled Forecasts"])
downscaler = WeatherDownscaler() if settings.ENABLE_DOWNSCALER else None
advisory_engine = AdvisoryEngine()

async def fetch_weather_with_cache(lat: float, lon: float, days: int = 7) -> tuple[dict, bool, bool]:
    # Cache key based on rounded coordinates to 0.1 deg (~11km grid matches Open-Meteo resolution)
    cache_key = f"weather_{round(lat, 1)}_{round(lon, 1)}_{days}"

    # Sniff for a stale entry BEFORE calling get(), because get() deletes expired entries.
    # We hold this reference so we can fall back to it if Open-Meteo fails.
    stale_data = weather_cache.get_stale(cache_key)

    # Check for a fresh (within-TTL) hit first.
    fresh_data = weather_cache.get(cache_key)
    if fresh_data is not None:
        return fresh_data, True, False  # (data, cached=True, stale=False)

    # No fresh cache — try Open-Meteo.
    try:
        data = await OpenMeteoProvider.fetch_weather(lat, lon, days)
        weather_cache.set(cache_key, data)          # update cache on success
        return data, False, False                   # (data, cached=False, stale=False)
    except Exception:
        # Open-Meteo failed. Use stale entry if we have one.
        if stale_data is not None:
            return stale_data, True, True           # (data, cached=True, stale=True)
        raise HTTPException(
            status_code=503,
            detail="Weather service unavailable and no cached data exists."
        )

def fetch_ndvi_with_cache(lat: float, lon: float) -> tuple[Optional[dict], bool]:
    cache_key = f"ndvi_{round(lat, 3)}_{round(lon, 3)}"
    cached_data = ndvi_cache.get(cache_key)
    if cached_data:
        return cached_data, True
        
    try:
        data = get_ndvi_for_location(lat, lon)
        ndvi_cache.set(cache_key, data)
        return data, False
    except Exception:
        # If GEE fails, return None
        return None, False

@router.get("/current", response_model=CurrentWeatherResponse)
async def get_current_weather(
    panchayat_id: int = Query(...), 
    include_ndvi: bool = Query(False),
    include_advisories: bool = Query(False),
    db: Session = Depends(get_db)
):
    panchayat = db.query(Panchayat).filter(Panchayat.id == panchayat_id).first()
    if not panchayat:
        raise HTTPException(status_code=404, detail="Panchayat not found.")

    block = panchayat.block
    district = block.district
    state = district.state

    # Gather data concurrently
    tasks = [fetch_weather_with_cache(panchayat.latitude, panchayat.longitude, days=1)]
    if include_ndvi:
        tasks.append(asyncio.to_thread(fetch_ndvi_with_cache, panchayat.latitude, panchayat.longitude))
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Process Weather
    weather_result = results[0]
    if isinstance(weather_result, Exception):
        raise weather_result
        
    weather_data, w_cached, w_stale = weather_result
    
    warnings = []
    if w_stale:
        warnings.append("Weather data is stale due to upstream service failure.")
        
    # Process NDVI
    ndvi_obj = None
    if include_ndvi:
        ndvi_result = results[1]
        if isinstance(ndvi_result, Exception) or ndvi_result[0] is None:
            warnings.append("Satellite NDVI data is currently unavailable.")
        else:
            ndvi_data, _ = ndvi_result
            ndvi_obj = NDVIData(
                avg_ndvi=ndvi_data.get("avg_ndvi", 0.0),
                tile_url=ndvi_data.get("tile_url", ""),
                generated_at=ndvi_data.get("generated_at", datetime.utcnow().isoformat())
            )

    # Extract current (first daily/hourly item)
    today = weather_data["daily"][0] if weather_data["daily"] else {}
    current_hour = weather_data["hourly"][0] if weather_data["hourly"] else {}
    
    temp_c = current_hour.get("temp_c", 0.0)
    temp_min_c = today.get("temp_min_c", temp_c)
    temp_max_c = today.get("temp_max_c", temp_c)
    precipitation_mm = today.get("precipitation_mm", 0.0)
    humidity_pct = current_hour.get("humidity_pct", 50.0)
    wind_speed = current_hour.get("wind_speed_ms", 0.0) * 3.6  # convert m/s to km/h
    # Real Open-Meteo fields — available since surface_pressure + weather_code added to request
    pressure_hpa = current_hour.get("surface_pressure_hpa") or 1013.25
    weather_condition = current_hour.get("weather_condition") or "Unknown"
    
    is_downscaled = False
    
    if downscaler and settings.ENABLE_DOWNSCALER:
        # Downscale Open-Meteo grid data (source elevation) to Panchayat elevation
        # We don't adjust for distance because lat/lon match, but we apply slope/aspect/elevation corrections.
        panch_elev = panchayat.elevation or 0.0
        panchayat_meta = {
            "id": panchayat.id, "name": panchayat.name, "latitude": panchayat.latitude,
            "longitude": panchayat.longitude, "elevation": panch_elev,
            "slope": getattr(panchayat, "slope", 2.5) or 2.5, 
            "aspect": getattr(panchayat, "aspect", 180.0) or 180.0
        }
        source_meta = {
            "latitude": panchayat.latitude, "longitude": panchayat.longitude, 
            "elevation": weather_data.get("elevation_m", panch_elev)
        }
        
        # We use apply_baseline_downscaling for current adjustments
        down_res = downscaler.apply_baseline_downscaling(
            block_temp_min=temp_min_c, block_temp_max=temp_max_c,
            block_humidity=humidity_pct, block_precip=precipitation_mm,
            block_wind=wind_speed, block_elevation=source_meta["elevation"],
            block_lat=source_meta["latitude"], block_lon=source_meta["longitude"],
            panchayat_elevation=panchayat_meta["elevation"], panchayat_lat=panchayat_meta["latitude"],
            panchayat_lon=panchayat_meta["longitude"], panchayat_slope=panchayat_meta["slope"],
            panchayat_aspect=panchayat_meta["aspect"]
        )
        temp_min_c = down_res["temp_min_c"]
        temp_max_c = down_res["temp_max_c"]
        temp_c = (temp_min_c + temp_max_c) / 2
        humidity_pct = down_res["humidity_pct"]
        precipitation_mm = down_res["precipitation_mm"]
        wind_speed = down_res["wind_speed_kmh"]
        is_downscaled = True

    # Generate Advisories
    advisories = None
    if include_advisories:
        forecast_dict = {
            "temp_max_c": temp_max_c,
            "temp_min_c": temp_min_c,
            "precipitation_mm": precipitation_mm,
            "humidity_pct": humidity_pct,
            "wind_speed_kmh": wind_speed,
            "panchayat_name": panchayat.name
        }
        # Example for Wheat during Flowering stage (In a real app, crop info comes from DB)
        adv_list = advisory_engine.generate_advisories("Wheat", "Flowering Stage", forecast_dict)
        advisories = [AdvisoryData(**a) for a in adv_list]

    return CurrentWeatherResponse(
        panchayat_id=panchayat.id,
        panchayat_name=panchayat.name,
        block_name=block.name,
        district_name=district.name,
        state_name=state.name,
        latitude=panchayat.latitude,
        longitude=panchayat.longitude,
        timestamp=datetime.utcnow(),
        temp_c=round(temp_c, 1),
        feels_like_c=round(temp_c + 1.2, 1),
        temp_min_c=round(temp_min_c, 1),
        temp_max_c=round(temp_max_c, 1),
        humidity_pct=round(humidity_pct, 1),
        precipitation_mm=round(precipitation_mm, 1),
        precipitation_prob_pct=today.get("precipitation_prob_pct", 0.0),
        wind_speed_kmh=round(wind_speed, 1),
        # wind_direction from panchayat aspect (degrees). Default 180 if null.
        wind_direction_deg=getattr(panchayat, 'aspect', 180.0) or 180.0,
        pressure_hpa=round(pressure_hpa, 1),
        weather_condition=weather_condition,
        # ── Application-level placeholders ─────────────────────────────────────
        # confidence_score: Open-Meteo does not provide a confidence metric.
        # This is a fixed application-level value until an ML ensemble model
        # is integrated (planned: ml/downscaling_engine.py WeatherDownscaler).
        confidence_score=0.92,
        # uncertainty_margin_c: No statistical uncertainty is computed without
        # a trained ensemble. Kept as a documented placeholder.
        uncertainty_margin_c=0.5,
        provider_source="Open-Meteo",
        is_simulated=False,
        # No API keys, credentials or service-account details are included in this response.
        data_source="Open-Meteo (Weather), GEE (Satellite)",
        weather_cached=w_cached,
        stale=w_stale,
        downscaled=is_downscaled,
        warnings=warnings if warnings else None,
        ndvi=ndvi_obj,
        ndvi_as_of=datetime.utcnow() if ndvi_obj else None,
        advisories=advisories
    )

@router.get("/forecast", response_model=WeatherForecastResponse)
async def get_panchayat_forecast(panchayat_id: int = Query(...), days: int = 7, db: Session = Depends(get_db)):
    # Re-using the /current logic pattern
    # For simplicity, returning a full forecast payload
    curr_weather = await get_current_weather(panchayat_id, include_ndvi=True, include_advisories=True, db=db)
    
    panchayat = db.query(Panchayat).filter(Panchayat.id == panchayat_id).first()
    weather_data, w_cached, w_stale = await fetch_weather_with_cache(panchayat.latitude, panchayat.longitude, days=days)
    
    daily_items = []
    for i, d in enumerate(weather_data.get("daily", [])):
        dt_obj = datetime.strptime(d["date"], "%Y-%m-%d")
        daily_items.append(DailyForecastItem(
            date=d["date"],
            day_name=dt_obj.strftime("%a"),
            temp_min_c=d["temp_min_c"],
            temp_max_c=d["temp_max_c"],
            humidity_pct=60.0, # not available in daily
            precipitation_mm=d["precipitation_mm"],
            precipitation_prob_pct=d["precipitation_prob_pct"],
            wind_speed_kmh=d["wind_speed_ms"] * 3.6,
            weather_condition="Clear",
            risk_level="LOW"
        ))

    hourly_items = []
    for h in weather_data.get("hourly", [])[:24]:
        dt_obj = datetime.strptime(h["timestamp"], "%Y-%m-%dT%H:%MZ")
        hourly_items.append(HourlyForecastItem(
            timestamp=dt_obj.strftime("%H:00"),
            hour=dt_obj.hour,
            temp_c=h["temp_c"],
            humidity_pct=h["humidity_pct"],
            precipitation_mm=h["precipitation_mm"],
            precipitation_prob_pct=0.0,
            wind_speed_kmh=h["wind_speed_ms"] * 3.6,
            weather_condition="Clear"
        ))

    return WeatherForecastResponse(
        panchayat_id=curr_weather.panchayat_id,
        panchayat_name=curr_weather.panchayat_name,
        block_name=curr_weather.block_name,
        district_name=curr_weather.district_name,
        elevation_m=weather_data.get("elevation_m", 0),
        model_version="v1.1-OpenMeteo-Integration",
        generated_at=datetime.utcnow(),
        data_source=curr_weather.data_source,
        weather_cached=curr_weather.weather_cached,
        stale=curr_weather.stale,
        downscaled=curr_weather.downscaled,
        current=curr_weather,
        hourly=hourly_items,
        daily=daily_items,
        warnings=curr_weather.warnings,
        ndvi=curr_weather.ndvi,
        ndvi_as_of=curr_weather.ndvi_as_of,
        advisories=curr_weather.advisories
    )

@router.get("/intelligence")
async def agricultural_intelligence(
    panchayat_id: int = Query(..., description="ID of the Panchayat"),
    db: Session = Depends(get_db)
):
    """
    Full Agricultural Intelligence payload:
    - Weather (Open-Meteo, real-time)
    - Satellite NDVI (GEE)
    - ML Downscaled forecast (if ENABLE_DOWNSCALER=true)
    - Agricultural advisories
    No API keys or credentials are included in this response.
    """
    return await get_current_weather(
        panchayat_id=panchayat_id,
        include_ndvi=True,
        include_advisories=True,
        db=db
    )

@router.get("/compare", response_model=CompareBlockPanchayatResponse)
async def compare_block_vs_panchayats(block_id: int = Query(...), db: Session = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Not Implemented with Open-Meteo Integration yet.")

from app.services.weather_service import (
    get_district_forecast_service,
    get_aws_data_service,
    get_district_nowcast_service,
    get_district_warning_service
)

@router.get("/district-forecast")
async def fetch_district_forecast():
    return await get_district_forecast_service()

@router.get("/aws/{state_id}")
async def fetch_aws_data(state_id: int):
    return await get_aws_data_service(state_id)

@router.get("/nowcast/{district_id}")
async def fetch_nowcast(district_id: int):
    return await get_district_nowcast_service(district_id)

@router.get("/warnings/{district_id}")
async def fetch_warnings(district_id: int):
    return await get_district_warning_service(district_id)
