"""
Field Officer Operations Service
Implements Problem Statement Point (g):
- District-wise connectivity matrix
- Logistics bottlenecks & supply chain gaps
- Emergency Red Alert broadcasting
- Real-time essential supply delivery status
"""

import time

DISTRICT_CONNECTIVITY = [
    {
        "district": "East Jaintia Hills",
        "state": "Meghalaya",
        "status": "disrupted",
        "status_label": "Severely Disrupted",
        "color": "#ef4444",
        "badge": "🔴 Road Blocked",
        "primary_highway": "NH-6",
        "bottleneck": "Lumshnong Slope Collapse & Mud Washout",
        "passable": False,
        "recommended_detour": "Divert via NH-27 (Haflong/Umrangso) or NH-29 (Assam plains)",
        "active_trucks_affected": 84
    },
    {
        "district": "Kohima",
        "state": "Nagaland",
        "status": "restricted",
        "status_label": "Restricted (Single Lane)",
        "color": "#f59e0b",
        "badge": "🟡 Slow Crawl",
        "primary_highway": "NH-29",
        "bottleneck": "Zubza Hill Subsidence & Sinking Zone",
        "passable": True,
        "recommended_detour": "Alternating convoy movement; 45 min delay expected",
        "active_trucks_affected": 62
    },
    {
        "district": "Dima Hasao",
        "state": "Assam",
        "status": "restricted",
        "status_label": "Restricted (Runoff)",
        "color": "#f59e0b",
        "badge": "🟡 Caution",
        "primary_highway": "NH-27 East-West",
        "bottleneck": "Heavy mountain runoff & debris clearing near Haflong",
        "passable": True,
        "recommended_detour": "Exercise caution on hairpin bridges; speed capped at 25 km/h",
        "active_trucks_affected": 38
    },
    {
        "district": "Cachar (Silchar)",
        "state": "Assam",
        "status": "accessible",
        "status_label": "Fully Accessible",
        "color": "#10b981",
        "badge": "🟢 Normal Flow",
        "primary_highway": "NH-37 / NH-6",
        "bottleneck": "None (Barak Valley freight transit normal)",
        "passable": True,
        "recommended_detour": "Direct transit open",
        "active_trucks_affected": 112
    },
    {
        "district": "Imphal West",
        "state": "Manipur",
        "status": "accessible",
        "status_label": "Fully Accessible",
        "color": "#10b981",
        "badge": "🟢 Normal Flow",
        "primary_highway": "NH-2 / NH-37",
        "bottleneck": "None (Valley logistics operating normally)",
        "passable": True,
        "recommended_detour": "Direct transit open",
        "active_trucks_affected": 95
    },
    {
        "district": "Kamrup Metropolitan (Guwahati)",
        "state": "Assam",
        "status": "accessible",
        "status_label": "Fully Accessible",
        "color": "#10b981",
        "badge": "🟢 4-Lane Arterial",
        "primary_highway": "NH-27 / NH-17",
        "bottleneck": "Moderate city congestion at Khanapara/Jorabat junction",
        "passable": True,
        "recommended_detour": "Direct transit open",
        "active_trucks_affected": 240
    },
    {
        "district": "Aizawl",
        "state": "Mizoram",
        "status": "accessible",
        "status_label": "Fully Accessible",
        "color": "#10b981",
        "badge": "🟢 Normal Flow",
        "primary_highway": "NH-306",
        "bottleneck": "Vairengte checkpost minor queue",
        "passable": True,
        "recommended_detour": "Direct transit open",
        "active_trucks_affected": 45
    },
    {
        "district": "Papum Pare (Itanagar)",
        "state": "Arunachal Pradesh",
        "status": "accessible",
        "status_label": "Fully Accessible",
        "color": "#10b981",
        "badge": "🟢 Open",
        "primary_highway": "NH-415 / Trans-Arunachal",
        "bottleneck": "Clear mountain highway",
        "passable": True,
        "recommended_detour": "Direct transit open",
        "active_trucks_affected": 28
    }
]

ESSENTIAL_SUPPLIES_TRACKER = [
    {
        "id": "convoy-med-01",
        "cargo": "Medical Oxygen & Dialysis Fluids",
        "category": "Critical Medical",
        "vehicle": "Refrigerated Multi-Axle (NL-01-AA-8821)",
        "origin": "Guwahati Central Depot",
        "destination": "Jawaharlal Nehru Hospital, Imphal",
        "progress_pct": 74,
        "status": "In Transit (En Route)",
        "status_color": "#10b981",
        "current_location": "Bypassing Kohima (NH-29)",
        "eta": "4 hr 15 min",
        "driver_phone": "+91 94350 44556"
    },
    {
        "id": "convoy-pds-02",
        "cargo": "Essential Public Rice & Salt (FCI)",
        "category": "PDS Food Supply",
        "vehicle": "Freight Fleet #8 (AS-11-BC-1090)",
        "origin": "Silchar Central Granary",
        "destination": "Churachandpur District Depot",
        "progress_pct": 48,
        "status": "Slowed by Jiribam Weight Limit",
        "status_color": "#f59e0b",
        "current_location": "Crossing Jiribam Bridge",
        "eta": "7 hr 40 min",
        "driver_phone": "+91 98620 11223"
    },
    {
        "id": "convoy-fuel-03",
        "cargo": "Motor Spirit & Aviation Turbine Fuel",
        "category": "Strategic Fuel",
        "vehicle": "Petroleum Tanker (AS-01-EC-9932)",
        "origin": "Numaligarh Refinery (NRL)",
        "destination": "Civil Aviation Fuel Depot, Shillong",
        "progress_pct": 91,
        "status": "Approving Final Hill Leg",
        "status_color": "#10b981",
        "current_location": "Nongpoh (Ri-Bhoi)",
        "eta": "45 min",
        "driver_phone": "+91 97740 88990"
    }
]

class OfficerService:
    def __init__(self):
        self.districts = list(DISTRICT_CONNECTIVITY)
        self.supplies = list(ESSENTIAL_SUPPLIES_TRACKER)
        self.emergency_alerts = [
            {
                "id": "alert-1",
                "title": "RED ALERT: Active Landslide at Lumshnong (NH-6)",
                "severity": "critical",
                "district": "East Jaintia Hills",
                "issued_by": "Inspector M. Kharkongor (Disaster Response)",
                "message": "NH-6 completely severed. All multi-axle freight traffic directed to halt at Jowai / Badarpur or divert via NH-27 East-West corridor.",
                "timestamp": "Today, 07:15 AM",
                "target_highway": "NH-6"
            }
        ]

    def get_district_matrix(self):
        return self.districts

    def get_essential_supplies(self):
        return self.supplies

    def get_supplies_tracking(self):
        return self.supplies

    def get_alerts(self):
        return self.emergency_alerts

    def broadcast_alert(self, data: dict):
        new_alert = {
            "id": f"alert-{len(self.emergency_alerts) + 1}",
            "title": data.get("title", "Emergency Disaster Warning"),
            "severity": data.get("severity", "critical"),
            "district": data.get("district", "East Jaintia Hills"),
            "issued_by": data.get("issued_by", "Field Patrol Officer"),
            "message": data.get("message", "Precautionary alert for all transit vehicles in this corridor."),
            "timestamp": "Just now",
            "target_highway": data.get("target_highway", "Arterial Highway")
        }
        self.emergency_alerts.insert(0, new_alert)
        return new_alert

officer_service = OfficerService()
