import httpx
from typing import Optional

class HttpClient:
    client: Optional[httpx.AsyncClient] = None

    @classmethod
    def get_client(cls) -> httpx.AsyncClient:
        if cls.client is None:
            # Connect: 3s, Read: 8s
            timeout = httpx.Timeout(8.0, connect=3.0)
            cls.client = httpx.AsyncClient(timeout=timeout)
        return cls.client

    @classmethod
    async def close(cls):
        if cls.client is not None:
            await cls.client.aclose()
            cls.client = None

http_client = HttpClient()
