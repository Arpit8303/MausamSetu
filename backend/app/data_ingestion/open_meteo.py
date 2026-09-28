import asyncio
import httpx
import logging
from datetime import datetime
from typing import Dict, Any, List
from app.core.client import http_client
from fastapi import HTTPException

logger = logging.getLogger(__name__)

# NOTE: Open-Meteo's free tier is strictly for non-commercial use,
# and has rate limits (e.g., 10,000 requests per day).

# WMO Weather Interpretation Code → human-readable condition
# Source: https://open-meteo.com/en/docs (WMO Weather interpretation codes)
# Only the most common codes for Indian subcontinent climate are mapped;
# unmapped codes fall back to "Overcast".
WMO_CODE_MAP: Dict[int, str] = {
    0:  "Clear",
    1:  "Mainly Clear",
    2:  "Partly Cloudy",
    3:  "Overcast",
    45: "Foggy",
    48: "Icy Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    80: "Slight Showers",
    81: "Moderate Showers",
    82: "Violent Showers",
    85: "Slight Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Thunderstorm with Heavy Hail",
}


def wmo_to_condition(code: Any) -> str:
    """Convert an Open-Meteo WMO weather_code integer to a readable condition string."""
    if code is None:
        return "Unknown"
    return WMO_CODE_MAP.get(int(code), "Overcast")

class OpenMeteoProvider:
    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    @classmethod
    async def fetch_weather(cls, lat: float, lon: float, days: int = 7) -> Dict[str, Any]:
        params = {
            "latitude": round(lat, 4),
            "longitude": round(lon, 4),
            "timezone": "UTC",
            "wind_speed_unit": "ms",
            "forecast_days": days,
            "hourly": "temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m,surface_pressure,weather_code,soil_temperature_0cm,soil_moisture_0_to_7cm,direct_radiation,diffuse_radiation",
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration,wind_speed_10m_max,weather_code"
        }

        client = http_client.get_client()
        max_retries = 2
        
        for attempt in range(max_retries + 1):
            try:
                response = await client.get(cls.BASE_URL, params=params)
                if response.status_code >= 500:
                    raise httpx.HTTPStatusError("Server Error", request=response.request, response=response)
                response.raise_for_status()
                data = response.json()
                return cls._parse_response(data)
            except (httpx.TimeoutException, httpx.HTTPStatusError, httpx.RequestError) as e:
                logger.error("[OpenMeteo] attempt=%d exception=%s message=%s",
                             attempt, type(e).__name__, str(e))
                if attempt == max_retries:
                    logger.error("[OpenMeteo] All %d attempts exhausted. Re-raising.", max_retries + 1)
                    raise e
                await asyncio.sleep(2 ** attempt)

    @classmethod
    def _parse_response(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parses Open-Meteo format into MausamSetu standard format.
        """
        daily = data.get("daily", {})
        hourly = data.get("hourly", {})
        
        # We need the elevation returned by the grid
        elevation = data.get("elevation", 0.0)

        # Build daily items
        daily_wmo = daily.get("weather_code", [])
        daily_items = []
        if daily and "time" in daily:
            for i in range(len(daily["time"])):
                d_wmo = daily_wmo[i] if i < len(daily_wmo) else None
                daily_items.append({
                    "date": daily["time"][i],
                    "temp_min_c": daily.get("temperature_2m_min", [])[i],
                    "temp_max_c": daily.get("temperature_2m_max", [])[i],
                    "precipitation_mm": daily.get("precipitation_sum", [])[i],
                    "precipitation_prob_pct": daily.get("precipitation_probability_max", [])[i],
                    "et0_mm": daily.get("et0_fao_evapotranspiration", [])[i],
                    "wind_speed_ms": daily.get("wind_speed_10m_max", [])[i],
                    # Real weather condition derived from WMO code
                    "weather_code": d_wmo,
                    "weather_condition": wmo_to_condition(d_wmo),
                })

        # Build hourly items
        hourly_items = []
        if hourly and "time" in hourly:
            wmo_codes  = hourly.get("weather_code", [])
            pressures  = hourly.get("surface_pressure", [])
            for i in range(len(hourly["time"])):
                wmo_code  = wmo_codes[i]  if i < len(wmo_codes)  else None
                pressure  = pressures[i]  if i < len(pressures)  else None
                hourly_items.append({
                    "timestamp": hourly["time"][i] + "Z",
                    "temp_c": hourly.get("temperature_2m", [])[i],
                    "humidity_pct": hourly.get("relative_humidity_2m", [])[i],
                    "precipitation_mm": hourly.get("precipitation", [])[i],
                    "cloud_cover_pct": hourly.get("cloud_cover", [])[i],
                    "wind_speed_ms": hourly.get("wind_speed_10m", [])[i],
                    # Real values from Open-Meteo (newly added)
                    "surface_pressure_hpa": pressure,
                    "weather_code": wmo_code,
                    "weather_condition": wmo_to_condition(wmo_code),
                    "soil_temp_0cm_c": hourly.get("soil_temperature_0cm", [])[i],
                    "soil_moisture_vol_pct": hourly.get("soil_moisture_0_to_7cm", [])[i],
                    "direct_radiation_wm2": hourly.get("direct_radiation", [])[i] if "direct_radiation" in hourly else 0.0,
                    "diffuse_radiation_wm2": hourly.get("diffuse_radiation", [])[i] if "diffuse_radiation" in hourly else 0.0
                })

        return {
            "elevation_m": elevation,
            "daily": daily_items,
            "hourly": hourly_items,
            "units": {
                "wind_speed": "m/s",
                "temperature": "Celsius",
                "precipitation": "mm",
                "et0": "mm"
            }
        }
