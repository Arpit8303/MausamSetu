from cachetools import TTLCache
from app.data_ingestion.earth_engine_adapter import EarthEngineProvider

ndvi_cache = TTLCache(maxsize=128, ttl=21600)
_ee_provider = None

def _get_provider() -> EarthEngineProvider:
    global _ee_provider
    if _ee_provider is None:
        _ee_provider = EarthEngineProvider()
    return _ee_provider

def get_ndvi_for_location(lat: float, lng: float, radius_m: int = 2000) -> dict:
    cache_key = f"{round(lat, 3)}_{round(lng, 3)}_{radius_m}"
    if cache_key in ndvi_cache:
        return ndvi_cache[cache_key]
        
    result = _get_provider().get_ndvi(lat, lng, radius_m)
    ndvi_cache[cache_key] = result
    return result
