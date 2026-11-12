"""
Main Backend Server for NER AI Logistics Platform
Provides REST APIs for Role-Based Portals (Driver, Field Officer, Admin),
Real-Road Multi-Routing, Open-Meteo Weather, RainViewer Doppler Radar,
Incident Verification Workflows, End-to-End System Diagnostics, and Serves Static Frontend Assets.
"""

import os
import sys
import json
import urllib.parse
from http.server import SimpleHTTPRequestHandler, HTTPServer
from http import cookies
from socketserver import ThreadingMixIn

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from places import search_places, get_place_by_id_or_name, NER_PLACES
from routing_engine import generate_multi_routes
from incident_manager import incident_manager
from vehicle_physics import VEHICLE_PROFILES, CARGO_TYPES
from auth_manager import auth_manager
from officer_service import officer_service
from admin_service import admin_service
from diagnostics_service import diagnostics_service
from fleet_service import fleet_service
from bridge_service import bridge_service

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class LogisticsRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def _get_session_user(self):
        """Extracts and verifies session cookie."""
        cookie_header = self.headers.get("Cookie", "")
        if not cookie_header:
            return None
        c = cookies.SimpleCookie()
        try:
            c.load(cookie_header)
            if "ner_session_id" in c:
                session_id = c["ner_session_id"].value
                return auth_manager.verify_session(session_id)
        except Exception:
            pass
        return None

    def _send_redirect(self, location):
        self.send_response(302)
        self.send_header("Location", location)
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.end_headers()

    def _send_json(self, data, status=200, set_cookie=None, clear_cookie=False):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

        if set_cookie:
            self.send_header("Set-Cookie", f"ner_session_id={set_cookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400")
        elif clear_cookie:
            self.send_header("Set-Cookie", "ner_session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly")

        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # -------------------------------------------------------------
        # 1. Open / Unrestricted Public Assets & APIs
        # -------------------------------------------------------------
        if path == "/api/health":
            self._send_json({"status": "ok", "platform": "NER AI Logistics Intelligence", "version": "2.1.0"})
            return

        elif path == "/api/auth/captcha":
            captcha_data = auth_manager.generate_captcha()
            self._send_json(captcha_data)
            return

        elif path == "/api/auth/current":
            user = self._get_session_user()
            self._send_json({"authenticated": user is not None, "user": user})
            return

        # Serve static assets directly (css, js, images, svgs)
        static_exts = (".css", ".js", ".png", ".jpg", ".jpeg", ".svg", ".ico", ".woff", ".woff2", ".ttf")
        if any(path.endswith(ext) for ext in static_exts):
            return super().do_GET()

        # Login page is publicly accessible
        if path in ["/login", "/login/", "/login.html"]:
            self.path = "/login.html"
            return super().do_GET()

        # -------------------------------------------------------------
        # 2. Security Wall & Gatekeeping for Web Pages
        # -------------------------------------------------------------
        user = self._get_session_user()
        is_page_request = path in ["/", "/driver", "/driver/", "/index.html",
                                   "/officer", "/officer/", "/officer.html",
                                   "/admin", "/admin/", "/admin.html"]

        if is_page_request:
            if not user:
                # Redirect unauthenticated users to /login
                redirect_target = urllib.parse.quote(path)
                return self._send_redirect(f"/login?redirect={redirect_target}")

            # Role-Based Routing & Access Control
            role = user.get("role", "driver")

            if path in ["/admin", "/admin/", "/admin.html"]:
                if role != "admin":
                    # Non-admins forbidden from Admin Command
                    return self._send_redirect("/officer" if role == "officer" else "/driver")
                self.path = "/admin.html"
                return super().do_GET()

            elif path in ["/officer", "/officer/", "/officer.html"]:
                if role not in ["officer", "admin"]:
                    # Drivers forbidden from Officer Command
                    return self._send_redirect("/driver")
                self.path = "/officer.html"
                return super().do_GET()

            elif path in ["/", "/driver", "/driver/", "/index.html"]:
                self.path = "/index.html"
                return super().do_GET()

        # -------------------------------------------------------------
        # 3. Authenticated & Protected APIs
        # -------------------------------------------------------------
        # Places Autocomplete
        if path == "/api/places":
            q = query.get("q", [""])[0]
            limit = int(query.get("limit", [15])[0])
            results = search_places(q, limit)
            self._send_json({"places": results})
            return

        # Incidents
        elif path == "/api/incidents":
            incidents = incident_manager.get_approved()
            self._send_json({"incidents": incidents})
            return

        # Metadata
        elif path == "/api/metadata":
            self._send_json({
                "vehicle_profiles": VEHICLE_PROFILES,
                "cargo_types": CARGO_TYPES
            })
            return

        # Field Officer Endpoints
        elif path == "/api/officer/districts":
            self._send_json({"districts": officer_service.get_district_matrix()})
            return

        elif path == "/api/officer/pending-incidents":
            self._send_json({"pending": incident_manager.get_pending()})
            return

        elif path == "/api/officer/alerts":
            self._send_json({"alerts": officer_service.get_alerts()})
            return

        elif path == "/api/officer/supplies":
            self._send_json({"supplies": officer_service.get_supplies_tracking()})
            return

        # Admin Telemetry & Diagnostics Endpoints
        elif path == "/api/admin/diagnostics":
            self._send_json({"diagnostics": admin_service.get_system_diagnostics()})
            return

        elif path == "/api/admin/diagnostics/run":
            # Real-time active probe of all 7 subsystems
            probe_results = diagnostics_service.run_full_probe()
            self._send_json(probe_results)
            return

        elif path == "/api/admin/error-analysis":
            # Comprehensive ML error analysis & validation report
            error_data = diagnostics_service.get_ml_error_analysis()
            self._send_json(error_data)
            return

        elif path == "/api/admin/analytics":
            self._send_json({"analytics": admin_service.get_fleet_analytics()})
            return

        elif path == "/api/admin/logs":
            self._send_json({"logs": admin_service.get_logs()})
            return

        elif path == "/api/admin/bottlenecks":
            self._send_json({"bottlenecks": admin_service.get_logistics_bottlenecks()})
            return

        # Fleet Tracking (GPS Live Feeds)
        elif path == "/api/fleet/live":
            query_params = urllib.parse.parse_qs(parsed.query)
            cargo = query_params.get("cargo", [None])[0]
            self._send_json(fleet_service.get_live_fleet(cargo_filter=cargo))
            return

        # Critical Bridge Infrastructure Telemetry
        elif path == "/api/bridges":
            self._send_json(bridge_service.get_all_bridges())
            return

        # Default fallback to static file
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_length).decode("utf-8")
        try:
            payload = json.loads(post_body) if post_body else {}
        except Exception:
            payload = {}

        # -------------------------------------------------------------
        # AUTHENTICATION POST ENDPOINTS
        # -------------------------------------------------------------
        if path == "/api/auth/login":
            identifier = payload.get("username") or payload.get("identifier") or ""
            password = payload.get("password")
            is_quick_demo = bool(payload.get("is_quick_demo", False))

            res = auth_manager.login(identifier, password, is_quick_demo=is_quick_demo)
            if res.get("success"):
                session_id = res.get("session_id")
                admin_service.log_event("AUTH", "Security", f"User logged in: {res['user']['name']} ({res['user']['role']}).")
                self._send_json(res, set_cookie=session_id)
            else:
                self._send_json(res, status=401)
            return

        elif path == "/api/auth/logout":
            cookie_header = self.headers.get("Cookie", "")
            if cookie_header:
                c = cookies.SimpleCookie()
                try:
                    c.load(cookie_header)
                    if "ner_session_id" in c:
                        auth_manager.logout(c["ner_session_id"].value)
                except Exception:
                    pass
            admin_service.log_event("AUTH", "Security", "User signed out.")
            self._send_json({"success": True, "message": "Signed out successfully."}, clear_cookie=True)
            return

        elif path == "/api/auth/send-otp":
            contact = payload.get("contact", "").strip()
            if not contact:
                self._send_json({"success": False, "error": "Phone number or email required."}, status=400)
                return
            otp_res = auth_manager.generate_otp(contact)
            self._send_json(otp_res)
            return

        elif path == "/api/auth/verify-otp":
            contact = payload.get("contact", "").strip()
            code = payload.get("code", "").strip()
            is_valid = auth_manager.verify_otp(contact, code)
            self._send_json({"success": is_valid, "verified": is_valid})
            return

        elif path == "/api/auth/register":
            # Optional captcha verification
            captcha_id = payload.get("captcha_id")
            captcha_code = payload.get("captcha_code")
            if captcha_id and captcha_code:
                if not auth_manager.verify_captcha(captcha_id, captcha_code):
                    self._send_json({"success": False, "error": "Invalid Security Captcha code."}, status=400)
                    return

            res = auth_manager.register(payload)
            if res.get("success"):
                session_id = res.get("session_id")
                admin_service.log_event("AUTH", "Security", f"New user registered: {res['user']['name']} as {res['user']['role']}.")
                self._send_json(res, set_cookie=session_id)
            else:
                self._send_json(res, status=400)
            return

        elif path == "/api/auth/forgot-password":
            contact = payload.get("contact", "").strip()
            otp_res = auth_manager.generate_otp(contact)
            self._send_json(otp_res)
            return

        elif path == "/api/auth/reset-password":
            contact = payload.get("contact", "").strip()
            otp_code = payload.get("otp_code", "").strip()
            new_password = payload.get("new_password", "").strip()

            if not auth_manager.verify_otp(contact, otp_code):
                self._send_json({"success": False, "error": "Invalid or expired OTP verification code."}, status=400)
                return
            if len(new_password) < 6:
                self._send_json({"success": False, "error": "Password must be at least 6 characters."}, status=400)
                return

            res = auth_manager.reset_password(contact, new_password)
            self._send_json(res)
            return

        elif path == "/api/auth/demo-switch":
            role = payload.get("role", "driver")
            # Lookup default user for role
            target_user = auth_manager.users.get(role)
            if not target_user:
                for u in auth_manager.users.values():
                    if u.get("role") == role:
                        target_user = u
                        break
            if target_user:
                session_id = auth_manager.create_session(target_user)
                redirect_map = { "admin": "/admin", "officer": "/officer", "driver": "/driver" }
                self._send_json({
                    "success": True,
                    "user": auth_manager._safe_user(target_user),
                    "session_id": session_id,
                    "redirect_url": redirect_map.get(role, "/driver")
                }, set_cookie=session_id)
            else:
                self._send_json({"success": False, "error": f"Role {role} not found."}, status=404)
            return

        # -------------------------------------------------------------
        # ROUTING & HAZARD APIs
        # -------------------------------------------------------------
        if path == "/api/route":
            origin = payload.get("origin", "imphal")
            destination = payload.get("destination", "shillong")
            vehicle_type = payload.get("vehicle_type", "heavy_truck")
            gvw_tons = float(payload.get("gvw_tons", 22.0))
            cargo_type = payload.get("cargo_type", "essential_pds")
            origin_coords = payload.get("origin_coords")
            dest_coords = payload.get("dest_coords")

            route_result = generate_multi_routes(
                origin_input=origin,
                dest_input=destination,
                vehicle_type=vehicle_type,
                gvw_tons=gvw_tons,
                cargo_type=cargo_type,
                origin_coords=origin_coords,
                dest_coords=dest_coords
            )
            admin_service.log_event("ROUTING", "RoutingEngine", f"Route calculated: {origin} -> {destination} ({vehicle_type}).")
            self._send_json(route_result)
            return

        elif path == "/api/incidents/report":
            user = self._get_session_user()
            if user:
                payload["reported_by"] = f"{user['name']} ({user['role_label']})"
            new_inc = incident_manager.add_incident(payload, is_officer=False)
            admin_service.log_event("INCIDENT", "CitizenReport", f"Driver reported: '{new_inc['title']}' awaiting officer verification.")
            self._send_json({"success": True, "incident": new_inc, "message": "Report logged. Field Officer will review and verify shortly."})
            return

        elif path == "/api/officer/report-incident":
            user = self._get_session_user()
            officer_name = user['name'] if user else "Field Officer"
            payload["reported_by"] = f"{officer_name} (Field Official)"
            new_inc = incident_manager.add_incident(payload, is_officer=True)
            admin_service.log_event("OFFICER", "OfficialIncident", f"Officer posted verified hazard: '{new_inc['title']}' with geo-tag & photo.")
            self._send_json({"success": True, "incident": new_inc, "message": "Official incident published directly to regional maps."})
            return

        elif path == "/api/officer/verify-incident":
            inc_id = payload.get("id")
            action = payload.get("action", "approve")
            officer_name = payload.get("officer_name", "Inspector M. Kharkongor")
            updated = incident_manager.verify_incident(inc_id, action, officer_name)
            admin_service.log_event("OFFICER", "IncidentVerification", f"Officer {action}d incident {inc_id}.")
            self._send_json({"success": True, "incident": updated})
            return

        elif path == "/api/officer/broadcast-alert":
            new_alert = officer_service.broadcast_alert(payload)
            admin_service.log_event("ALERT", "DisasterBroadcast", f"EMERGENCY BROADCAST: {new_alert['title']} to district drivers.")
            self._send_json({"success": True, "alert": new_alert})
            return

        elif path == "/api/officer/emergency-action":
            # Heroic emergency intervention powers
            action_type = payload.get("action_type") # 'lockdown', 'green_corridor', 'parking_directive'
            sector = payload.get("sector", "Regional Corridor")
            details = payload.get("details", "")

            admin_service.log_event("EMERGENCY", "OfficerDirective", f"Officer enacted {action_type.upper()} on sector '{sector}': {details}")
            self._send_json({
                "success": True,
                "action_type": action_type,
                "sector": sector,
                "message": f"Officer Emergency Directive [{action_type.upper()}] transmitted across regional carrier network."
            })
            return

        elif path in ["/api/incidents/toggle", "/api/admin/drill-toggle"]:
            inc_id = payload.get("id")
            updated = incident_manager.toggle_incident_blockage(inc_id)
            admin_service.log_event("ADMIN", "DisasterDrill", f"Mock blockage toggled on incident {inc_id} -> Blocked: {updated.get('road_blocked') if updated else 'N/A'}.")
            self._send_json({"success": True, "incident": updated})
            return

        elif path == "/api/incidents/reset":
            reset_list = incident_manager.reset_defaults()
            admin_service.log_event("ADMIN", "SystemReset", "Incident baseline restored to defaults.")
            self._send_json({"success": True, "incidents": reset_list})
            return

        self._send_json({"error": "Endpoint not found"}, status=404)

def run_server(port=8080):
    server_address = ("0.0.0.0", port)
    httpd = ThreadedHTTPServer(server_address, LogisticsRequestHandler)
    print(f"NER Logistics Intelligence Platform server running on http://localhost:{port}")
    httpd.serve_forever()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    run_server(port)
