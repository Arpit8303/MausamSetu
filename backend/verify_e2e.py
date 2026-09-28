"""
End-to-end verification: tests /weather/intelligence and /weather/forecast
for multiple Panchayat IDs. Prints detailed pass/fail results.
Run from backend/ with the venv activated and uvicorn running on port 8000.
"""
import urllib.request
import urllib.error
import json
import sys

API_BASE = "http://127.0.0.1:8000/api/v1"

def get(path, timeout=60):
    """HTTP GET helper. Returns (status_code, parsed_body) or (None, error_str)."""
    req = urllib.request.Request(f"{API_BASE}{path}")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        try:
            body = json.loads(e.read().decode())
        except Exception:
            body = {}
        return e.code, body
    except Exception as e:
        return None, str(e)

def banner(msg):
    print("\n" + "=" * 60)
    print(msg)
    print("=" * 60)

# ── Step 1: discover valid Panchayat IDs ────────────────────────────────────
# The actual route is /api/v1/locations/panchayats  (NOT /admin/panchayats)
banner("STEP 1 — Listing Panchayats from /locations/panchayats")
status, data = get("/locations/panchayats")
if status == 200 and isinstance(data, list) and len(data) > 0:
    # Take first 3 IDs from the real panchayat table
    valid_ids = [p["id"] for p in data[:3]]
    print(f"  /locations/panchayats returned {len(data)} panchayats.")
    for p in data[:3]:
        print(f"    id={p['id']} | name={p.get('name')} | block_id={p.get('block_id')}")
else:
    print(f"  /locations/panchayats returned status={status}. Falling back to direct probe...")
    print(f"  (This may take up to 60s per probe — waiting for GEE cold-start)")
    valid_ids = []
    for pid in range(1, 20):
        print(f"    Probing panchayat_id={pid}...", end=" ", flush=True)
        s, _ = get(f"/weather/intelligence?panchayat_id={pid}", timeout=60)
        if s == 200:
            valid_ids.append(pid)
            print("✅")
        elif s == 404:
            print("404 (not found)")
        else:
            print(f"status={s}")
        if len(valid_ids) >= 3:
            break
    if not valid_ids:
        print("\n  ❌ No valid Panchayat IDs found. Is the backend running at port 8000?")
        sys.exit(1)

print(f"\n  Will test Panchayat IDs: {valid_ids}")

# ── Step 2: for each ID, test both endpoints ─────────────────────────────────
all_passed = True

for pid in valid_ids:
    banner(f"PANCHAYAT ID = {pid}")

    # ─── Intelligence ──────────────────────────────────────────────────────
    print(f"\n  GET /weather/intelligence?panchayat_id={pid}")
    s, d = get(f"/weather/intelligence?panchayat_id={pid}", timeout=60)
    print(f"  Status : {s}")
    if s == 200:
        print(f"  Name   : {d.get('panchayat_name')} | Block: {d.get('block_name')} | District: {d.get('district_name')} | State: {d.get('state_name')}")
        print(f"  LatLon : {d.get('latitude')}, {d.get('longitude')}")
        print(f"  Temp   : {d.get('temp_c')}°C | Feels: {d.get('feels_like_c')}°C | Min: {d.get('temp_min_c')} Max: {d.get('temp_max_c')}")
        print(f"  Humid  : {d.get('humidity_pct')}% | Wind: {d.get('wind_speed_kmh')} km/h | Pressure: {d.get('pressure_hpa')} hPa")
        print(f"  Precip : {d.get('precipitation_mm')} mm | Prob: {d.get('precipitation_prob_pct')}%")
        print(f"  Cond   : {d.get('weather_condition')}")
        print(f"  Source : {d.get('data_source')} | Provider: {d.get('provider_source')}")
        print(f"  Flags  : cached={d.get('weather_cached')} stale={d.get('stale')} downscaled={d.get('downscaled')} is_simulated={d.get('is_simulated')}")

        ndvi = d.get("ndvi")
        if ndvi:
            print(f"  NDVI   : avg_ndvi={ndvi.get('avg_ndvi'):.4f} | tile_url={'present ✅' if ndvi.get('tile_url') else 'MISSING ❌'}")
        else:
            print(f"  NDVI   : null (GEE may be unavailable — acceptable)")

        advisories = d.get("advisories") or []
        print(f"  Advs   : {len(advisories)} advisory(ies)")
        for adv in advisories[:3]:
            print(f"           [{adv.get('risk_level')}] {adv.get('title')}")

        warnings = d.get("warnings") or []
        if warnings:
            for w in warnings:
                print(f"  ⚠️  {w}")

        # Validate panchayat_id echo
        if d.get("panchayat_id") != pid:
            print(f"  ❌ FAIL: panchayat_id echo mismatch — got {d.get('panchayat_id')}, expected {pid}")
            all_passed = False
        else:
            print(f"  ✅ INTELLIGENCE PASS — panchayat_id={d.get('panchayat_id')} matches")
    else:
        print(f"  ❌ INTELLIGENCE FAIL — status={s} body={d}")
        all_passed = False

    # ─── Forecast ──────────────────────────────────────────────────────────
    print(f"\n  GET /weather/forecast?panchayat_id={pid}")
    s2, d2 = get(f"/weather/forecast?panchayat_id={pid}", timeout=60)
    print(f"  Status : {s2}")
    if s2 == 200:
        hourly = d2.get("hourly", [])
        daily  = d2.get("daily", [])
        print(f"  Hourly : {len(hourly)} items")
        if hourly:
            h0 = hourly[0]
            print(f"    [0]  ts={h0.get('timestamp')} | temp_c={h0.get('temp_c')} | humidity={h0.get('humidity_pct')} | wind={h0.get('wind_speed_kmh')}")
        else:
            print(f"  ⚠️  WARNING: hourly array is empty")
            all_passed = False

        print(f"  Daily  : {len(daily)} items")
        if daily:
            d0 = daily[0]
            print(f"    [0]  date={d0.get('date')} ({d0.get('day_name')}) | tmin={d0.get('temp_min_c')} tmax={d0.get('temp_max_c')} | precip={d0.get('precipitation_mm')}mm")
        else:
            print(f"  ⚠️  WARNING: daily array is empty")
            all_passed = False

        print(f"  Meta   : model_version={d2.get('model_version')} | cached={d2.get('weather_cached')} | stale={d2.get('stale')}")

        if d2.get("panchayat_id") != pid:
            print(f"  ❌ FAIL: panchayat_id echo mismatch — got {d2.get('panchayat_id')}, expected {pid}")
            all_passed = False
        else:
            print(f"  ✅ FORECAST PASS — panchayat_id={d2.get('panchayat_id')} matches")
    else:
        print(f"  ❌ FORECAST FAIL — status={s2} body={d2}")
        all_passed = False

banner("FINAL RESULT")
if all_passed:
    print(f"  ✅ ALL {len(valid_ids)} PANCHAYAT(S) PASSED BOTH ENDPOINTS.")
else:
    print(f"  ❌ ONE OR MORE TESTS FAILED. See details above.")
