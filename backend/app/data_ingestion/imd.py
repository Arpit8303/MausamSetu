from typing import Dict, Any, List
from app.data_ingestion.base import BaseWeatherProvider
from app.data_ingestion.demo_provider import DemoWeatherProvider
from app.core.config import settings

class IMDWeatherProvider(BaseWeatherProvider):
    @property
    def provider_name(self) -> str:
        return "India Meteorological Department (IMD) API"

    async def fetch_block_forecast(self, latitude: float, longitude: float, days: int = 7) -> List[Dict[str, Any]]:
        # Check if IMD API key is configured
        if settings.IMD_API_KEY:
            # Placeholder for authorized IMD API HTTP request
            pass
        
        # When no API key is provided, return high-fidelity demo data clearly marked with provider source
        demo = DemoWeatherProvider()
        result = await demo.fetch_block_forecast(latitude, longitude, days)
        for item in result:
            item["provider"] = f"{self.provider_name} (Simulated Demo Mode)"
        return result
