from abc import ABC, abstractmethod
from typing import Dict, Any, List
from datetime import datetime

class BaseWeatherProvider(ABC):
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    async def fetch_block_forecast(self, latitude: float, longitude: float, days: int = 7) -> List[Dict[str, Any]]:
        """
        Fetch forecast data for a Block location.
        Returns normalized dictionary containing:
        - timestamp / date
        - temp_min_c, temp_max_c
        - humidity_pct
        - precipitation_mm
        - wind_speed_kmh
        - wind_direction_deg
        - pressure_hpa
        """
        pass
