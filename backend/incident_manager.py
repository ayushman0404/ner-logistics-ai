"""
Field Officer Incident & Landslide Hazard Manager for NER
Handles real-time reported blockages, landslides, road damage, and caution markers.
Supports Citizen Incident Reporting with Field Officer Verification & Dynamic Divergence.
"""

import math
import time

DEFAULT_INCIDENTS = [
    {
        "id": "inc-lumshnong-nh6",
        "title": "Lumshnong Major Landslide (NH-6)",
        "type": "landslide",
        "severity": "critical",
        "status": "approved",
        "road_blocked": True,
        "lat": 25.1833,
        "lon": 92.3833,
        "highway": "NH-6 (East Jaintia Hills)",
        "reported_by": "Inspector M. Kharkongor (Meghalaya PWD / Disaster Wing)",
        "verified_by": "State Disaster Control Room, Shillong",
        "description": "Slope collapse following continuous rainfall. Entire carriage-way washed out. Multi-axle trucks stranded. Direct Shillong-Silchar corridor severed.",
        "radius_km": 15.0,
        "created_at": "Today, 06:45 AM",
        "icon": "landslide"
    },
    {
        "id": "inc-zubza-nh29",
        "title": "Zubza Sinking Zone & Mud Debris (NH-29)",
        "type": "hazard",
        "severity": "warning",
        "status": "approved",
        "road_blocked": False, # Caution, slow crawl
        "lat": 25.7100,
        "lon": 94.0200,
        "highway": "NH-29 (Dimapur-Kohima)",
        "reported_by": "Sub-Divisional Officer K. Angami",
        "verified_by": "Nagaland PWD Highway Division",
        "description": "Hill subsidence near Zubza. Single-lane alternating traffic. Expected delay 45-60 minutes for heavy vehicles.",
        "radius_km": 8.0,
        "created_at": "Today, 08:30 AM",
        "icon": "hazard"
    },
    {
        "id": "inc-haflong-nh27",
        "title": "Haflong Valley Flash Flooding & Slush (NH-27)",
        "type": "flood",
        "severity": "warning",
        "status": "approved",
        "road_blocked": False,
        "lat": 25.1667,
        "lon": 93.0167,
        "highway": "NH-27 East-West Corridor",
        "reported_by": "Dima Hasao Disaster Response Force (DRF)",
        "verified_by": "Dima Hasao Disaster Wing",
        "description": "Heavy runoff depositing boulders on road margin. Speed restricted to 20 km/h for heavy trucks.",
        "radius_km": 10.0,
        "created_at": "Today, 09:15 AM",
        "icon": "flood"
    },
    {
        "id": "inc-jiribam-bridge",
        "title": "Jiribam River Bridge Structural Caution (NH-37)",
        "type": "bridge_caution",
        "severity": "caution",
        "status": "approved",
        "road_blocked": False,
        "lat": 24.8000,
        "lon": 93.1167,
        "highway": "NH-37 (Silchar-Imphal)",
        "reported_by": "Manipur Border Roads Task Force",
        "verified_by": "Border Roads Organization (BRO)",
        "description": "Water level near high danger mark. Gross vehicle weight strictly capped at 22 tons per axle.",
        "radius_km": 5.0,
        "created_at": "Today, 10:00 AM",
        "icon": "bridge_caution"
    },
    {
        "id": "inc-pending-1",
        "title": "Boulder Obstruction on Noney-Tupul Hill Stretch",
        "type": "hazard",
        "severity": "warning",
        "status": "pending_verification",
        "road_blocked": False,
        "lat": 24.8100,
        "lon": 93.6800,
        "highway": "NH-37 (Imphal-Jiribam Pass)",
        "reported_by": "Truck Driver Mohan Das (Logistics Operator)",
        "verified_by": None,
        "description": "Fallen tree and rock debris occupying half of carriage-way after heavy thunderstorm. Passing vehicles facing single-lane congestion.",
        "radius_km": 6.0,
        "created_at": "15 minutes ago",
        "icon": "boulder"
    }
]

class IncidentManager:
    def __init__(self):
        self.incidents = [dict(item) for item in DEFAULT_INCIDENTS]

    def get_all(self):
        return self.incidents

    def get_approved(self):
        return [inc for inc in self.incidents if inc.get("status", "approved") == "approved"]

    def get_pending(self):
        return [inc for inc in self.incidents if inc.get("status") == "pending_verification"]

    def verify_incident(self, incident_id: str, action: str, officer_name: str = "Field Officer"):
        for inc in self.incidents:
            if inc["id"] == incident_id:
                if action == "approve":
                    inc["status"] = "approved"
                    inc["verified_by"] = f"{officer_name} (Verified & Authorized)"
                elif action == "reject":
                    inc["status"] = "rejected"
                    inc["verified_by"] = f"{officer_name} (Rejected: False Alarm)"
                return inc
        return None

    def toggle_incident_blockage(self, incident_id: str):
        for inc in self.incidents:
            if inc["id"] == incident_id:
                inc["road_blocked"] = not inc["road_blocked"]
                return inc
        return None

    def add_incident(self, data: dict, is_officer: bool = False):
        new_id = f"inc-field-{len(self.incidents) + 1}"
        status = "approved" if is_officer else "pending_verification"
        
        incident = {
            "id": new_id,
            "title": data.get("title", "Field Incident Reported"),
            "type": data.get("type", "landslide"),
            "severity": data.get("severity", "critical" if data.get("road_blocked") else "warning"),
            "status": status,
            "road_blocked": bool(data.get("road_blocked", False)),
            "lat": float(data.get("lat", 25.0)),
            "lon": float(data.get("lon", 92.5)),
            "highway": data.get("highway", "NER Corridor"),
            "reported_by": data.get("reported_by", "Citizen / Truck Driver"),
            "verified_by": "Auto-authorized by Field Officer" if is_officer else None,
            "description": data.get("description", "Reported obstacle or landslide on route."),
            "radius_km": float(data.get("radius_km", 8.0)),
            "photo_url": data.get("photo_url") or data.get("photo_data"),
            "geo_accuracy_m": float(data.get("geo_accuracy_m", 12.5)),
            "created_at": "Just now",
            "icon": data.get("type", "hazard")
        }
        self.incidents.append(incident)
        return incident

    def reset_defaults(self):
        self.incidents = [dict(item) for item in DEFAULT_INCIDENTS]
        return self.incidents

    def check_polyline_intersection(self, coords: list, buffer_km: float = 8.0) -> list:
        """Only checks approved incidents for public route intersection."""
        matched = []
        approved_list = self.get_approved()

        for inc in approved_list:
            i_lat = inc["lat"]
            i_lon = inc["lon"]
            for pt in coords[::5]:
                p_lat = pt[1] if abs(pt[1]) <= 90 else pt[0]
                p_lon = pt[0] if abs(pt[1]) <= 90 else pt[1]
                d_lat = math.radians(p_lat - i_lat)
                d_lon = math.radians(p_lon - i_lon)
                a = math.sin(d_lat/2)**2 + math.cos(math.radians(i_lat)) * math.cos(math.radians(p_lat)) * math.sin(d_lon/2)**2
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                dist = 6371.0 * c
                if dist <= (inc["radius_km"] + buffer_km):
                    matched.append(inc)
                    break
        return matched

incident_manager = IncidentManager()
