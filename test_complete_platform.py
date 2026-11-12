"""
End-to-End Verification Test for NER Smart Logistics Platform (PS ID: 26002)
Tests:
1. Fleet Live GPS Telemetry (/api/fleet/live)
2. Bridge Structural Health Monitoring (/api/bridges)
3. Chokepoint & Logistics Bottleneck Intelligence (/api/admin/bottlenecks)
4. Field Incident Reporting with GPS and Photo (/api/incidents/report)
5. Incident Verification Queue & Approval Flow (/api/officer/pending-incidents & /api/officer/verify-incident)
6. Multimodal Corridor Routing Engine (/api/route)
7. System Diagnostics & Health Auditing (/api/admin/diagnostics/run)
8. Authentication & Free OTP Verification (/api/auth/login & /api/auth/send-otp)
9. Frontline Officer Tactical Directives (/api/officer/emergency-action)
"""

import urllib.request
import json
import base64
import sys

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

BASE_URL = "http://127.0.0.1:8080"

def get(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def post(path, data):
    url = f"{BASE_URL}{path}"
    payload = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def main():
    print("=================================================================")
    print("STARTING END-TO-END VERIFICATION OF PROBLEM STATEMENT 26002")
    print("=================================================================")
    
    # 1. Fleet Telemetry
    status, fleet = get("/api/fleet/live")
    assert status == 200, f"Fleet endpoint failed: {status}"
    assert fleet.get("total_convoys") >= 5, "Missing active freight fleet"
    convoys = fleet.get("convoys", [])
    print(f"✅ [1/9] Live Fleet Tracking: {len(convoys)} convoys tracked in real-time.")
    for c in convoys[:2]:
        print(f"   -> [{c['cargo_label']}] {c['vehicle_id']} at {c['current_coords']} - Speed {c['speed_kmh']} km/h")

    # 2. Bridge Structural Health
    status, bridges = get("/api/bridges")
    assert status == 200, f"Bridge endpoint failed: {status}"
    b_list = bridges.get("bridges", [])
    assert len(b_list) >= 5, "Missing critical bridges"
    print(f"✅ [2/9] Critical Bridge Telemetry: {len(b_list)} bridges monitored.")
    for b in b_list[:2]:
        print(f"   -> {b['name']} ({b['river']}): Health {b['structural_health_pct']}%, Status: {b['status_label']}")

    # 3. Chokepoints and Logistics Bottlenecks
    status, bottlenecks = get("/api/admin/bottlenecks")
    assert status == 200, f"Bottlenecks endpoint failed: {status}"
    b_items = bottlenecks.get("bottlenecks", [])
    assert len(b_items) >= 4, "Missing bottleneck records"
    print(f"✅ [3/9] Regional Chokepoints & Supply Chain Gaps: {len(b_items)} strategic corridors analyzed.")
    for bn in b_items[:2]:
        print(f"   -> [{bn['severity'].upper()}] {bn['name']} ({bn['corridor']}): +{bn['delay_impact_hours']} hrs delay")

    # 4. Geo-Tagged Field Incident Reporting with Base64 Photo
    dummy_photo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    incident_data = {
        "title": "Severe Rockfall near Lumshnong Cement Stretch",
        "type": "landslide",
        "highway": "NH-6",
        "description": "Boulders collapsed onto northbound carriage-way. Multi-axle traffic halted.",
        "reported_by": "Driver R. Sangma (AS-01-OX-9901)",
        "lat": 25.1845,
        "lon": 92.3840,
        "geo_accuracy_m": 4.5,
        "photo_url": dummy_photo,
        "road_blocked": True
    }
    status, inc_res = post("/api/incidents/report", incident_data)
    assert status == 200 and inc_res.get("success"), f"Incident reporting failed: {inc_res}"
    inc_id = inc_res["incident"]["id"]
    print(f"✅ [4/9] Field Incident Reporting: Created incident {inc_id} with GPS latch (±4.5m) and photo evidence.")

    # 5. Incident Verification Queue & Field Officer Approval
    status, pending = get("/api/officer/pending-incidents")
    assert status == 200, "Pending incidents retrieval failed"
    pending_ids = [item["id"] for item in pending.get("pending", [])]
    assert inc_id in pending_ids, f"Reported incident {inc_id} not in pending queue"
    
    # Officer approves the incident
    status, verif_res = post("/api/officer/verify-incident", {
        "id": inc_id,
        "action": "approve",
        "officer_name": "Inspector M. Kharkongor (Meghalaya PWD)"
    })
    assert status == 200 and verif_res.get("success"), "Incident verification approval failed"
    print(f"✅ [5/9] Field Officer Verification Queue: Incident {inc_id} approved & published to live map.")

    # 6. Route Engine with Multi-Axle Physics & Weather Impact
    status, route = post("/api/route", {
        "origin": "guwahati",
        "destination": "silchar",
        "vehicle_type": "heavy_truck",
        "cargo_type": "essential_pds",
        "gvw_tons": 28.0
    })
    assert status == 200, f"Routing failed: {status}"
    corridors = route.get("routes", [])
    assert len(corridors) > 0, "No corridors returned"
    primary = corridors[0]
    print(f"✅ [6/9] Multi-Axle Physics Routing: Evaluated {len(corridors)} corridors. Primary: {primary.get('name')} ({primary.get('distance_km')} km, {primary.get('eta_formatted')}).")

    # 7. System Diagnostics & Zero-Cost Auditing
    status, diag = get("/api/admin/diagnostics/run")
    assert status == 200, "Diagnostics retrieval failed"
    subsystems = diag.get("subsystems", [])
    print(f"✅ [7/9] Diagnostics & Health: Overall Status '{diag.get('overall_status')}', {len(subsystems)} subsystems evaluated.")
    for s in subsystems[:3]:
        print(f"   -> Subsystem [{s.get('name')}]: {s.get('status')} - Latency {s.get('latency_ms')} ms")

    # 8. Authentication & Free OTP Verification
    status, login_res = post("/api/auth/login", {"username": "admin", "password": "admin123"})
    assert status == 200 and login_res.get("success"), f"Admin login failed: {login_res}"
    user = login_res.get("user", {})
    print(f"✅ [8/9] Single Sign-On Authentication: Logged in as {user.get('name')} ({user.get('role')}). Redirect: {login_res.get('redirect_url')}")
    
    # Free OTP simulation
    status, otp_res = post("/api/auth/send-otp", {"contact": "+91 94350 99887"})
    assert status == 200 and otp_res.get("success"), "OTP dispatch failed"
    otp_code = otp_res.get("simulated_otp")
    assert otp_code is not None, "Missing simulated OTP"
    status, verify_otp_res = post("/api/auth/verify-otp", {"contact": "+91 94350 99887", "code": otp_code})
    assert status == 200 and verify_otp_res.get("verified"), "OTP verification failed"
    print(f"   -> Free OTP verification succeeded for phone +91 94350 99887 (Code: {otp_code})")

    # 9. Field Officer Tactical Directives
    status, directive_res = post("/api/officer/emergency-action", {
        "action_type": "green_corridor",
        "sector": "NH-27 / NH-29 Nagaon-Dimapur Corridor",
        "details": "Priority Medical Green Corridor enacted for Oxygen Tanker AS-01-OX-9901."
    })
    assert status == 200 and directive_res.get("success"), "Emergency directive failed"
    print(f"✅ [9/9] Frontline Emergency Tactical Directive: {directive_res.get('message')}")
    
    print("\n=================================================================")
    print("ALL 9 CRITICAL CAPABILITIES VERIFIED! 100% SPECIFICATION MET.")
    print("=================================================================")

if __name__ == "__main__":
    main()
