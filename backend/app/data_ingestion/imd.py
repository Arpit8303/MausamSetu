import httpx
import logging
from fastapi import HTTPException
from typing import Dict, Any, List
from app.data_ingestion.base import BaseWeatherProvider
from app.data_ingestion.demo_provider import DemoWeatherProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

# Standard headers to include in all IMD requests
_IMD_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; MausamSetu/1.0; +https://mausamsetu.in)",
    "Accept": "application/json",
}

class IMDWeatherProvider(BaseWeatherProvider):
    @property
    def provider_name(self) -> str:
        return "India Meteorological Department (IMD) API"

    async def fetch_block_forecast(self, latitude: float, longitude: float, days: int = 7) -> List[Dict[str, Any]]:
        if settings.IMD_API_KEY:
            pass
        
        demo = DemoWeatherProvider()
        result = await demo.fetch_block_forecast(latitude, longitude, days)
        for item in result:
            item["provider"] = f"{self.provider_name} (Simulated Demo Mode)"
        return result

    async def get_district_rainfall_forecast(self) -> List[Dict[str, Any]]:
        url = "https://api.imd.gov.in/api/v1/state_district_rainfall_forecast"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=_IMD_HEADERS)
                response.raise_for_status()
                logger.info("IMD district_rainfall_forecast: live data fetched successfully.")
                return response.json()
        except httpx.HTTPStatusError as e:
            imd_error = e.response.text[:200]
            logger.warning(f"IMD district_rainfall_forecast returned {e.response.status_code} — raw error: {imd_error}. Serving demo fallback.")
        except Exception as e:
            logger.warning(f"IMD district_rainfall_forecast request failed: {e}. Serving demo fallback.")
        return [
            {"state": "Uttar Pradesh", "district": "Lucknow", "day1": "Widespread", "day1_color": "green", "day2": "Scattered", "day2_color": "yellow", "day3": "Isolated", "day3_color": "orange", "day4": "Isolated", "day4_color": "orange", "day5": "No Rain", "day5_color": "white", "data_source": "demo_fallback", "provider": f"{self.provider_name} (Simulated Demo Mode — IMD API key not configured)"},
            {"state": "Uttar Pradesh", "district": "Varanasi", "day1": "Scattered", "day1_color": "yellow", "day2": "Scattered", "day2_color": "yellow", "day3": "Widespread", "day3_color": "green", "day4": "Isolated", "day4_color": "orange", "day5": "Isolated", "day5_color": "orange", "data_source": "demo_fallback", "provider": f"{self.provider_name} (Simulated Demo Mode — IMD API key not configured)"},
            {"state": "Bihar", "district": "Patna", "day1": "Isolated", "day1_color": "orange", "day2": "Widespread", "day2_color": "green", "day3": "Scattered", "day3_color": "yellow", "day4": "No Rain", "day4_color": "white", "day5": "No Rain", "day5_color": "white", "data_source": "demo_fallback", "provider": f"{self.provider_name} (Simulated Demo Mode — IMD API key not configured)"},
        ]

    async def get_aws_data(self, state_id: int) -> List[Dict[str, Any]]:
        url = f"https://api.imd.gov.in/api/v1/aws_data?sid={state_id}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=_IMD_HEADERS)
                response.raise_for_status()
                logger.info(f"IMD aws_data (state_id={state_id}): live data fetched successfully.")
                return response.json()
        except httpx.HTTPStatusError as e:
            imd_error = e.response.text[:200]
            logger.warning(f"IMD aws_data (state_id={state_id}) returned {e.response.status_code} — raw error: {imd_error}. Serving demo fallback.")
        except Exception as e:
            logger.warning(f"IMD aws_data request failed: {e}. Serving demo fallback.")
        return [
            {"station_id": f"AWS-{state_id}-001", "station_name": "Demo AWS Station 1", "temp_c": 32.4, "humidity_pct": 68.0, "wind_speed_kmh": 12.0, "rainfall_mm": 2.5, "timestamp": "2026-09-27T12:00:00Z", "data_source": "demo_fallback", "provider": f"{self.provider_name} (Simulated Demo Mode)"},
            {"station_id": f"AWS-{state_id}-002", "station_name": "Demo AWS Station 2", "temp_c": 30.1, "humidity_pct": 74.0, "wind_speed_kmh": 8.0, "rainfall_mm": 0.0, "timestamp": "2026-09-27T12:00:00Z", "data_source": "demo_fallback", "provider": f"{self.provider_name} (Simulated Demo Mode)"},
        ]

    async def get_district_nowcast(self, district_id: int) -> Dict[str, Any]:
        url = f"https://api.imd.gov.in/api/v1/districtnowcast?id={district_id}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=_IMD_HEADERS)
                response.raise_for_status()
                logger.info(f"IMD district_nowcast (district_id={district_id}): live data fetched successfully.")
                return response.json()
        except httpx.HTTPStatusError as e:
            imd_error = e.response.text[:200]
            logger.warning(f"IMD district_nowcast (district_id={district_id}) returned {e.response.status_code} — raw error: {imd_error}. Serving demo fallback.")
        except Exception as e:
            logger.warning(f"IMD district_nowcast request failed: {e}. Serving demo fallback.")
        return {"district_id": district_id, "alert_type": "Thunderstorm", "severity": "MODERATE", "valid_from": "2026-09-27T14:00:00Z", "valid_to": "2026-09-27T18:00:00Z", "description": "Thunderstorm with lightning likely.", "data_source": "demo_fallback", "provider": f"{self.provider_name} (Simulated Demo Mode)"}

    async def get_district_warning(self, district_id: int) -> Dict[str, Any]:
        url = f"https://api.imd.gov.in/api/v1/districtwarning?id={district_id}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=_IMD_HEADERS)
                response.raise_for_status()
                logger.info(f"IMD district_warning (district_id={district_id}): live data fetched successfully.")
                return response.json()
        except httpx.HTTPStatusError as e:
            imd_error = e.response.text[:200]
            logger.warning(f"IMD district_warning (district_id={district_id}) returned {e.response.status_code} — raw error: {imd_error}. Serving demo fallback.")
        except Exception as e:
            logger.warning(f"IMD district_warning request failed: {e}. Serving demo fallback.")
        return {"district_id": district_id, "warnings": [{"day": 1, "warning_type": "Heavy Rain", "color_code": "YELLOW", "description": "Heavy to very heavy rainfall expected."}, {"day": 2, "warning_type": "No Warning", "color_code": "GREEN", "description": "Normal weather conditions."}], "data_source": "demo_fallback", "provider": f"{self.provider_name} (Simulated Demo Mode)"}
