import urllib.request
import json
import traceback

try:
    req = urllib.request.Request("http://127.0.0.1:8000/api/v1/weather/forecast?panchayat_id=1")
    with urllib.request.urlopen(req) as response:
        print("STATUS:", response.status)
        data = json.loads(response.read().decode())
        print("KEYS:", data.keys())
        print("HOURLY LENGTH:", len(data["hourly"]))
        print("DAILY LENGTH:", len(data["daily"]))
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code)
    try:
        print("ERROR BODY:", e.read().decode())
    except Exception:
        pass
except Exception as e:
    print("General Error:")
    traceback.print_exc()
