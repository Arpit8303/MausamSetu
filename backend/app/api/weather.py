import random
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.location import Panchayat, Block, District, State
from app.data_ingestion.demo_provider import DemoWeatherProvider
from ml.downscaling_engine import WeatherDownscaler
from app.schemas.weather import CurrentWeatherResponse, WeatherForecastResponse, HourlyForecastItem, DailyForecastItem, CompareBlockPanchayatResponse

router = APIRouter(prefix="/weather", tags=["Weather Ingestion & Downscaled Forecasts"])
downscaler = WeatherDownscaler()
demo_provider = DemoWeatherProvider()

@router.get("/current", response_model=CurrentWeatherResponse)
async def get_current_weather(panchayat_id: int = Query(..., description="ID of the Panchayat"), db: Session = Depends(get_db)):
    panchayat = db.query(Panchayat).filter(Panchayat.id == panchayat_id).first()
    if not panchayat:
        raise HTTPException(status_code=404, detail=f"Panchayat with ID {panchayat_id} not found.")

    block = panchayat.block
    district = block.district
    state = district.state

    # Fetch raw block forecast
    raw_block_data = await demo_provider.fetch_block_forecast(block.latitude, block.longitude, days=1)
    b_forecast = raw_block_data[0]

    panchayat_meta = {
        "id": panchayat.id, "name": panchayat.name, "latitude": panchayat.latitude,
        "longitude": panchayat.longitude, "elevation": panchayat.elevation,
        "slope": panchayat.slope, "aspect": panchayat.aspect
    }
    block_meta = {
        "id": block.id, "name": block.name, "latitude": block.latitude,
        "longitude": block.longitude, "elevation": block.elevation
    }

    downscaled = downscaler.predict_panchayat_forecast(b_forecast, block_meta, panchayat_meta)

    return CurrentWeatherResponse(
        panchayat_id=panchayat.id,
        panchayat_name=panchayat.name,
        block_name=block.name,
        district_name=district.name,
        state_name=state.name,
        timestamp=datetime.utcnow(),
        temp_c=downscaled["temp_max_c"],
        feels_like_c=round(downscaled["temp_max_c"] + 1.2, 1),
        temp_min_c=downscaled["temp_min_c"],
        temp_max_c=downscaled["temp_max_c"],
        humidity_pct=downscaled["humidity_pct"],
        precipitation_mm=downscaled["precipitation_mm"],
        precipitation_prob_pct=downscaled["precipitation_prob_pct"],
        wind_speed_kmh=downscaled["wind_speed_kmh"],
        wind_direction_deg=downscaled["wind_direction_deg"],
        pressure_hpa=1012.8,
        weather_condition=downscaled["weather_condition"],
        confidence_score=downscaled["confidence_score"],
        uncertainty_margin_c=downscaled["uncertainty_margin_c"],
        provider_source="MausamSetu AI Downscaler (IMD/NASA Base)",
        is_simulated=downscaled["is_simulated"]
    )

@router.get("/forecast", response_model=WeatherForecastResponse)
async def get_panchayat_forecast(panchayat_id: int = Query(...), days: int = 7, db: Session = Depends(get_db)):
    panchayat = db.query(Panchayat).filter(Panchayat.id == panchayat_id).first()
    if not panchayat:
        raise HTTPException(status_code=404, detail=f"Panchayat with ID {panchayat_id} not found.")

    block = panchayat.block
    district = block.district
    
    raw_block_data = await demo_provider.fetch_block_forecast(block.latitude, block.longitude, days=days)

    panchayat_meta = {
        "id": panchayat.id, "name": panchayat.name, "latitude": panchayat.latitude,
        "longitude": panchayat.longitude, "elevation": panchayat.elevation,
        "slope": panchayat.slope, "aspect": panchayat.aspect
    }
    block_meta = {
        "id": block.id, "name": block.name, "latitude": block.latitude,
        "longitude": block.longitude, "elevation": block.elevation
    }

    daily_items: List[DailyForecastItem] = []
    hourly_items: List[HourlyForecastItem] = []
    now = datetime.utcnow()

    # Generate 7-day daily predictions
    for idx, b_item in enumerate(raw_block_data):
        d_res = downscaler.predict_panchayat_forecast(b_item, block_meta, panchayat_meta)
        dt_obj = now + timedelta(days=idx)
        
        daily_items.append(DailyForecastItem(
            date=dt_obj.strftime("%Y-%m-%d"),
            day_name=dt_obj.strftime("%a"),
            temp_min_c=d_res["temp_min_c"],
            temp_max_c=d_res["temp_max_c"],
            humidity_pct=d_res["humidity_pct"],
            precipitation_mm=d_res["precipitation_mm"],
            precipitation_prob_pct=d_res["precipitation_prob_pct"],
            wind_speed_kmh=d_res["wind_speed_kmh"],
            weather_condition=d_res["weather_condition"],
            risk_level="HIGH" if d_res["precipitation_mm"] > 25 or d_res["temp_max_c"] > 38 else ("MEDIUM" if d_res["precipitation_mm"] > 5 else "LOW")
        ))

    # Generate 24-hour diurnal temperature cycle curve
    curr_d = daily_items[0]
    for h in range(24):
        # Sine diurnal temp curve peaking at 14:00
        temp_cycle = curr_d.temp_min_c + (curr_d.temp_max_c - curr_d.temp_min_c) * (0.5 + 0.5 * random.uniform(-0.1, 0.1) if h in [1, 2] else (0.5 + 0.5 * (1 - abs((h - 14) / 10))))
        temp_cycle = round(max(curr_d.temp_min_c, min(curr_d.temp_max_c, temp_cycle)), 1)
        
        hourly_items.append(HourlyForecastItem(
            timestamp=f"{h:02d}:00",
            hour=h,
            temp_c=temp_cycle,
            humidity_pct=curr_d.humidity_pct,
            precipitation_mm=round(curr_d.precipitation_mm / 24.0, 1),
            precipitation_prob_pct=curr_d.precipitation_prob_pct,
            wind_speed_kmh=curr_d.wind_speed_kmh,
            weather_condition=curr_d.weather_condition
        ))

    curr_weather = await get_current_weather(panchayat_id=panchayat.id, db=db)

    return WeatherForecastResponse(
        panchayat_id=panchayat.id,
        panchayat_name=panchayat.name,
        block_name=block.name,
        district_name=district.name,
        elevation_m=panchayat.elevation,
        model_version="v1.0-XGBoost/RandomForest",
        generated_at=now,
        current=curr_weather,
        hourly=hourly_items,
        daily=daily_items
    )

@router.get("/compare", response_model=CompareBlockPanchayatResponse)
async def compare_block_vs_panchayats(block_id: int = Query(...), db: Session = Depends(get_db)):
    block = db.query(Block).filter(Block.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")

    panchayats = db.query(Panchayat).filter(Panchayat.block_id == block_id).all()
    raw_block = await demo_provider.fetch_block_forecast(block.latitude, block.longitude, days=1)
    b_forecast = raw_block[0]

    panchayat_list = []
    for p in panchayats:
        p_meta = {"id": p.id, "name": p.name, "latitude": p.latitude, "longitude": p.longitude, "elevation": p.elevation, "slope": p.slope, "aspect": p.aspect}
        b_meta = {"id": block.id, "name": block.name, "latitude": block.latitude, "longitude": block.longitude, "elevation": block.elevation}
        
        down = downscaler.predict_panchayat_forecast(b_forecast, b_meta, p_meta)
        panchayat_list.append({
            "panchayat_id": p.id,
            "panchayat_name": p.name,
            "elevation_m": p.elevation,
            "temp_min_c": down["temp_min_c"],
            "temp_max_c": down["temp_max_c"],
            "delta_temp_max": round(down["temp_max_c"] - b_forecast["temp_max_c"], 1),
            "precipitation_mm": down["precipitation_mm"],
            "humidity_pct": down["humidity_pct"],
            "confidence_score": down["confidence_score"]
        })

    return CompareBlockPanchayatResponse(
        block_name=block.name,
        block_temp_min=b_forecast["temp_min_c"],
        block_temp_max=b_forecast["temp_max_c"],
        block_rainfall_mm=b_forecast["precipitation_mm"],
        panchayats=panchayat_list
    )
