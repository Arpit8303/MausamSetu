import math
import random
from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.data_ingestion.base import BaseWeatherProvider

class DemoWeatherProvider(BaseWeatherProvider):
    @property
    def provider_name(self) -> str:
        return "MausamSetu High-Fidelity Demo Ingestion Engine"

    async def fetch_block_forecast(self, latitude: float, longitude: float, days: int = 7) -> List[Dict[str, Any]]:
        forecasts = []
        now = datetime.utcnow()

        # Seed pseudo-random generator with location for deterministic realistic weather pattern
        loc_seed = int((latitude * 1000) + (longitude * 1000))
        rnd = random.Random(loc_seed)

        # Baseline seasonal temperature estimation (North/Central/South India seasonality)
        day_of_year = now.timetuple().tm_yday
        seasonal_temp_base = 25.0 + 8.0 * math.sin(math.radians((day_of_year - 80) * (360 / 365)))
        lat_adjustment = (28.0 - latitude) * 0.4 # Colder up North, warmer South

        base_temp = seasonal_temp_base + lat_adjustment

        for day in range(days):
            date_obj = now + timedelta(days=day)
            
            # Daily noise variation
            day_noise = rnd.uniform(-2.5, 2.5)
            t_max = round(base_temp + 6.0 + day_noise, 1)
            t_min = round(base_temp - 6.0 + (day_noise * 0.5), 1)

            # Rainfall probability and amount simulation (Monsoon seasonality peak)
            is_monsoon = 150 <= day_of_year <= 270 # June to Sept
            rain_chance = rnd.uniform(40, 85) if is_monsoon else rnd.uniform(5, 30)
            
            precip_mm = 0.0
            if rain_chance > 45:
                precip_mm = round(rnd.uniform(4.0, 48.0) if is_monsoon else rnd.uniform(1.0, 12.0), 1)
            
            humidity = round(rnd.uniform(70, 95) if precip_mm > 0 else rnd.uniform(45, 75), 1)
            wind_speed = round(rnd.uniform(6.0, 22.0), 1)
            wind_dir = round(rnd.uniform(0, 360), 0)
            pressure = round(1013.25 - (latitude - 20) * 0.2, 1)

            forecasts.append({
                "date": date_obj.strftime("%Y-%m-%d"),
                "lead_time_hours": day * 24,
                "temp_min_c": t_min,
                "temp_max_c": t_max,
                "humidity_pct": humidity,
                "precipitation_mm": precip_mm,
                "precipitation_prob_pct": round(rain_chance, 1),
                "wind_speed_kmh": wind_speed,
                "wind_direction_deg": wind_dir,
                "pressure_hpa": pressure,
                "is_simulated": True,
                "provider": self.provider_name
            })

        return forecasts
