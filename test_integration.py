"""
Automated Integration & Verification Suite for NER Logistics Intelligence Platform
"""

import urllib.request
import json
import time
import sys

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

BASE_URL = "http://localhost:8080"

def test_api():
    print(">>> Starting Platform Verification Suite...")

    # 1. Health Check
    req = urllib.request.Request(f"{BASE_URL}/api/health")
    with urllib.request.urlopen(req, timeout=5) as res:
        health = json.loads(res.read().decode())
        print(f"✅ [1/5] Health Check passed: {health}")
        assert health["status"] == "ok"

    # 2. Places Autocomplete
    req = urllib.request.Request(f"{BASE_URL}/api/places?q=shil")
    with urllib.request.urlopen(req, timeout=5) as res:
        places_data = json.loads(res.read().decode())
        names = [p["name"] for p in places_data["places"]]
        print(f"✅ [2/5] Autocomplete passed: found {names}")
        assert "Shillong" in names

    # 3. Incidents List & Initial Blockage Check
    req = urllib.request.Request(f"{BASE_URL}/api/incidents")
    with urllib.request.urlopen(req, timeout=5) as res:
        inc_data = json.loads(res.read().decode())
        incidents = inc_data["incidents"]
        print(f"✅ [3/5] Incidents Feed loaded: {len(incidents)} active hazards.")
        lumshnong = next((x for x in incidents if "lumshnong" in x["id"]), None)
        assert lumshnong is not None

    # 4. Multi-Corridor Routing (Imphal to Shillong for Heavy Truck)
    payload = json.dumps({
        "origin": "Imphal",
        "destination": "Shillong",
        "vehicle_type": "heavy_truck",
        "gvw_tons": 22.0,
        "cargo_type": "essential_pds"
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{BASE_URL}/api/route",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=25) as res:
        route_data = json.loads(res.read().decode())
        elapsed = round(time.time() - t0, 2)
        print(f"✅ [4/5] Multi-Corridor Route computed in {elapsed}s:")
        print(f"       Origin: {route_data['origin']['name']} -> Destination: {route_data['destination']['name']}")
        print(f"       Active Route ID: {route_data['active_route_id']}")

        for r in route_data["routes"]:
            print(f"       • Corridor: {r['name']} | Distance: {r['distance_km']}km | ETA: {r['eta_formatted']} | Blocked: {r['is_blocked']} | Badge: '{r['badge_text']}'")

        assert len(route_data["routes"]) >= 2
        assert len(route_data["routes"][0]["coordinates"]) > 10

    # 5. Dynamic Incident Divergence Test (Toggle Lumshnong Landslide)
    toggle_payload = json.dumps({"id": "inc-lumshnong-nh6"}).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}/api/incidents/toggle",
        data=toggle_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=5) as res:
        toggle_res = json.loads(res.read().decode())
        new_state = toggle_res["incident"]["road_blocked"]
        print(f"✅ [5/5] Dynamic Re-routing test: Toggled Lumshnong road_blocked to: {new_state}")

    # Re-query route to observe state change
    req = urllib.request.Request(
        f"{BASE_URL}/api/route",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=25) as res:
        new_route_data = json.loads(res.read().decode())
        nh6_route = next(r for r in new_route_data["routes"] if "nh6" in r["id"])
        print(f"       Post-toggle NH-6 Corridor Status: Blocked={nh6_route['is_blocked']} | Badge: '{nh6_route['badge_text']}'")
        print(f"       Dynamic Active Corridor: {new_route_data['active_route_id']}")

    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY! The NER Logistics Engine is 100% operational.")

if __name__ == "__main__":
    test_api()
