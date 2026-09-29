from typing import Any, Optional
import time

class TTLCache:
    def __init__(self, ttl_seconds: int = 3600):
        self.ttl = ttl_seconds
        self._cache = {}

    def get(self, key: str) -> Optional[Any]:
        """Return data only if it is still within TTL. Deletes expired entries."""
        if key in self._cache:
            entry = self._cache[key]
            if time.time() - entry['timestamp'] < self.ttl:
                return entry['data']
            else:
                # Expired: remove from cache so next successful fetch repopulates it.
                # NOTE: do NOT call get_stale() here; the raw _cache entry is gone
                # after this point for normal reads.
                del self._cache[key]
        return None

    def get_stale(self, key: str) -> Optional[Any]:
        """Emergency fallback: return data even if TTL has expired, without deleting it.
        Use ONLY when the upstream provider is unavailable and any data is better than none."""
        entry = self._cache.get(key)
        if entry is not None:
            return entry['data']
        return None

    def set(self, key: str, data: Any) -> None:
        self._cache[key] = {
            'data': data,
            'timestamp': time.time()
        }

    def clear(self) -> None:
        self._cache.clear()

# Global instances for weather and NDVI to use across the app
from app.core.config import settings
weather_cache = TTLCache(ttl_seconds=settings.CACHE_WEATHER_TTL)
ndvi_cache = TTLCache(ttl_seconds=settings.CACHE_NDVI_TTL)
