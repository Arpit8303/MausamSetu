import asyncio
from app.data_ingestion.open_meteo import OpenMeteoProvider

async def main():
    try:
        data = await OpenMeteoProvider.fetch_weather(lat=26.8467, lon=80.9462, days=7)
        print("SUCCESS:")
        print(data)
    except Exception as e:
        print("ERROR:")
        print(type(e))
        print(e)
        if hasattr(e, 'response') and e.response:
            print("RESPONSE BODY:")
            print(e.response.text)

if __name__ == "__main__":
    asyncio.run(main())
