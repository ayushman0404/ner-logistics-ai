"""
NER Logistics Intelligence Platform - Strategic Bridge Telemetry Service
Monitors structural health, load capacity, and flood clearance across critical river bridges in NER.
"""

CRITICAL_BRIDGES = [
    {
        "bridge_id": "br-bogibeel",
        "name": "Bogibeel Rail-Road Bridge",
        "river": "Brahmaputra River",
        "district": "Dibrugarh - Dhemaji, Assam",
        "highway": "NH-15 Connectivity",
        "coords": [27.4042, 94.7556],
        "length_km": 4.94,
        "max_gross_weight_tons": 70.0,
        "status": "operational",
        "status_label": "Fully Operational",
        "clearance_level_m": 8.5,
        "danger_mark_m": 12.0,
        "structural_health_pct": 98.4,
        "alert": None
    },
    {
        "bridge_id": "br-dhola-sadiya",
        "name": "Bhupen Hazarika Setu (Dhola-Sadiya Bridge)",
        "river": "Lohit River",
        "district": "Tinsukia, Assam to Arunachal Border",
        "highway": "NH-115 Connectivity",
        "coords": [27.8015, 95.6698],
        "length_km": 9.15,
        "max_gross_weight_tons": 60.0,
        "status": "operational",
        "status_label": "Fully Operational",
        "clearance_level_m": 7.2,
        "danger_mark_m": 10.5,
        "structural_health_pct": 97.2,
        "alert": None
    },
    {
        "bridge_id": "br-saraighat",
        "name": "Saraighat Rail-Road Dual Bridges",
        "river": "Brahmaputra River",
        "district": "Kamrup (Guwahati), Assam",
        "highway": "NH-27 Western Gateway",
        "coords": [26.1833, 91.6833],
        "length_km": 1.49,
        "max_gross_weight_tons": 50.0,
        "status": "operational",
        "status_label": "Normal Traffic Flow",
        "clearance_level_m": 6.8,
        "danger_mark_m": 11.2,
        "structural_health_pct": 94.0,
        "alert": None
    },
    {
        "bridge_id": "br-barak-silchar",
        "name": "Barak River Bridge (Sadargat)",
        "river": "Barak River",
        "district": "Cachar (Silchar), Assam",
        "highway": "NH-37 / NH-6 Convergence",
        "coords": [24.8385, 92.8025],
        "length_km": 0.42,
        "max_gross_weight_tons": 25.0,
        "status": "caution",
        "status_label": "Single-Lane Restricted (Heavy Chokepoint)",
        "clearance_level_m": 2.1,
        "danger_mark_m": 3.0,
        "structural_health_pct": 76.5,
        "alert": "Overweight vehicles (>25T) must use bypass road. Slower transit times ~35 min."
    },
    {
        "bridge_id": "br-lumshnong-culvert",
        "name": "Sonapur-Lumshnong Major Box Culvert",
        "river": "Lubha River Tributary",
        "district": "East Jaintia Hills, Meghalaya",
        "highway": "NH-6 Critical Lifeline",
        "coords": [25.1762, 92.3685],
        "length_km": 0.08,
        "max_gross_weight_tons": 16.0,
        "status": "critical",
        "status_label": "Impending Scour Damage (Under Active Repair)",
        "clearance_level_m": 0.6,
        "danger_mark_m": 1.2,
        "structural_health_pct": 52.0,
        "alert": "Flash runoff weakened western abutment. Multi-axle freight halted; light vehicles escorted."
    },
    {
        "bridge_id": "br-kolodyne-mizoram",
        "name": "Chhimtuipui (Kolodyne) Suspension Bridge",
        "river": "Chhimtuipui River",
        "district": "Lawngtlai, Mizoram",
        "highway": "Kaladan Multi-Modal Transit Corridor",
        "coords": [22.4500, 92.9800],
        "length_km": 0.28,
        "max_gross_weight_tons": 20.0,
        "status": "operational",
        "status_label": "Operational (Periodic Maintenance)",
        "clearance_level_m": 4.5,
        "danger_mark_m": 8.0,
        "structural_health_pct": 88.0,
        "alert": None
    }
]

class BridgeTelemetryService:
    def __init__(self):
        self.bridges = [dict(b) for b in CRITICAL_BRIDGES]

    def get_all_bridges(self):
        return {
            "total_bridges": len(self.bridges),
            "operational_count": len([b for b in self.bridges if b["status"] == "operational"]),
            "caution_count": len([b for b in self.bridges if b["status"] == "caution"]),
            "critical_count": len([b for b in self.bridges if b["status"] == "critical"]),
            "bridges": self.bridges
        }

bridge_service = BridgeTelemetryService()
