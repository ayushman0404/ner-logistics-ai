"""
NER Logistics Intelligence Platform - GPS Fleet Tracking Service
Tracks real-time movement of essential commodities:
1. Liquid Medical Oxygen Cryo-Tankers
2. Emergency Medicines & Pediatric Vaccines (Cold-Chain)
3. FCI PDS Grains & Essential Food Supplies
4. Perishable Agro Produce (Kiwi, Ginger, Pineapples)
5. Border Infrastructure Construction Materials (Cement, TMT Steel)
"""

import time
import math
import random

# Pre-defined essential freight fleet convoys operating on NER Highway Corridors
FLEET_CONVOYS = [
    {
        "vehicle_id": "AS-01-OX-9901",
        "driver_name": "Rupen Deka",
        "driver_phone": "+91 94350 11223",
        "cargo_type": "medicines_oxygen",
        "cargo_label": "Liquid Medical Oxygen (Cryo-Tanker)",
        "cargo_details": "18.5 KL Cryogenic Medical Oxygen • Priority 1 Green Corridor",
        "vehicle_class": "Heavy Multi-Axle Cryo-Tanker (28T)",
        "origin": "Guwahati, Assam",
        "destination": "Silchar Medical College & Hospital (SMCH), Assam",
        "corridor": "NH-27 Nagaon • Lumding Bypass Corridor",
        "speed_kmh": 46.2,
        "temperature_c": -182.4, # Cryogenic
        "gvw_tons": 28.0,
        "progress_pct": 58,
        "status": "in_transit",
        "priority": "critical_emergency",
        "delay_minutes": 0,
        "ai_diverted": True,
        "divert_reason": "Diverted from NH-6 Lumshnong landslide zone via safe valley bypass",
        # Route polyline segment along NH-27 (Nagaon to Silchar via Lumding)
        "waypoints": [
            [26.1445, 91.7362], # Guwahati
            [26.3450, 92.6840], # Nagaon
            [25.7500, 93.1700], # Lumding
            [25.0400, 93.0200], # Haflong
            [24.8333, 92.7789]  # Silchar
        ],
        "current_coords": [25.7210, 93.1650] # Near Lumding
    },
    {
        "vehicle_id": "ML-05-MD-4022",
        "driver_name": "Donbok Lyngdoh",
        "driver_phone": "+91 98630 44556",
        "cargo_type": "medicines_oxygen",
        "cargo_label": "Emergency Pediatric Vaccines & Antivenom",
        "cargo_details": "4,500 Doses JE/Snake Antivenom + Refrigerated Cold-Chain",
        "vehicle_class": "Refrigerated Medium LCV (7.5T)",
        "origin": "Shillong, Meghalaya",
        "destination": "Jowai Civil Hospital, West Jaintia Hills",
        "corridor": "NH-6 Shillong - Jowai Highway",
        "speed_kmh": 41.5,
        "temperature_c": 3.8, # +2 to +8 C cold chain
        "gvw_tons": 7.5,
        "progress_pct": 72,
        "status": "in_transit",
        "priority": "high",
        "delay_minutes": 15,
        "ai_diverted": False,
        "divert_reason": "Operating on cleared single-lane section under escort",
        "waypoints": [
            [25.5788, 91.8933], # Shillong
            [25.5100, 92.0500], # Mawryngkneng
            [25.4500, 92.2000]  # Jowai
        ],
        "current_coords": [25.4850, 92.1250] # Near Thadlaskein Lake
    },
    {
        "vehicle_id": "AS-25-PDS-8810",
        "driver_name": "Bikash Gogoi",
        "driver_phone": "+91 94351 77889",
        "cargo_type": "essential_pds",
        "cargo_label": "FCI Essential Grain (Fortified Rice Rations)",
        "cargo_details": "22 Metric Tons PDS Rice for National Food Security Mission",
        "vehicle_class": "10-Wheel Commercial Freight (24T)",
        "origin": "Guwahati Central Depot, Assam",
        "destination": "Imphal FCI Base Depot, Manipur",
        "corridor": "NH-29 Kohima • Karbi Anglong Corridor",
        "speed_kmh": 38.0,
        "temperature_c": 26.5,
        "gvw_tons": 23.5,
        "progress_pct": 44,
        "status": "in_transit",
        "priority": "normal",
        "delay_minutes": 35,
        "ai_diverted": True,
        "divert_reason": "Preemptively routed via NH-29 to bypass NH-37 landslide alert",
        "waypoints": [
            [26.1445, 91.7362], # Guwahati
            [26.3450, 92.6840], # Nagaon
            [26.0000, 93.4000], # Diphu
            [25.9000, 93.7300], # Dimapur
            [25.6700, 94.1100], # Kohima
            [24.8170, 93.9368]  # Imphal
        ],
        "current_coords": [25.9120, 93.7250] # Approaching Dimapur
    },
    {
        "vehicle_id": "AR-01-AG-5040",
        "driver_name": "Tashi Norbu",
        "driver_phone": "+91 94360 88990",
        "cargo_type": "perishables",
        "cargo_label": "High-Value Perishable Agro (Organic Kiwi & Ginger)",
        "cargo_details": "8.5T Premium Export Kiwi & Fresh Lakadong Turmeric",
        "vehicle_class": "Insulated Ventilated LCV (11T)",
        "origin": "Ziro Valley, Arunachal Pradesh",
        "destination": "Guwahati Borjhar Air Cargo Terminal, Assam",
        "corridor": "NH-13 Trans-Arunachal Highway to NH-15",
        "speed_kmh": 35.8,
        "temperature_c": 11.2,
        "gvw_tons": 10.8,
        "progress_pct": 32,
        "status": "in_transit",
        "priority": "high",
        "delay_minutes": 20,
        "ai_diverted": False,
        "divert_reason": "Mountain ghat section caution; road wet with drizzle",
        "waypoints": [
            [27.5450, 93.8300], # Ziro
            [27.2000, 93.9000], # Yazali
            [27.0000, 94.0000], # Kimin
            [26.9000, 93.5000], # Tezpur
            [26.1445, 91.7362]  # Guwahati
        ],
        "current_coords": [27.1850, 93.9200] # Near Yazali Ghat
    },
    {
        "vehicle_id": "TR-01-CN-1200",
        "driver_name": "Pranab Debbarma",
        "driver_phone": "+91 98620 33221",
        "cargo_type": "construction",
        "cargo_label": "Strategic Border Highway Pre-Cast Culverts & TMT Steel",
        "cargo_details": "32 Metric Tons TMT Steel Bars for NHIDCL Bridge Rebuild",
        "vehicle_class": "Heavy Multi-Axle Trailer (35T)",
        "origin": "Guwahati Logistics Park, Assam",
        "destination": "Sabroom Special Economic Zone, South Tripura",
        "corridor": "NH-8 Assam - Tripura Arterial Highway",
        "speed_kmh": 39.5,
        "temperature_c": 28.0,
        "gvw_tons": 34.5,
        "progress_pct": 65,
        "status": "in_transit",
        "priority": "normal",
        "delay_minutes": 10,
        "ai_diverted": False,
        "divert_reason": "Steady movement on four-lane stretch",
        "waypoints": [
            [24.8333, 92.7789], # Silchar
            [24.4000, 92.2000], # Karimganj
            [24.1600, 92.0000], # Dharmanagar
            [23.8315, 91.2868], # Agartala
            [23.0000, 91.7000]  # Sabroom
        ],
        "current_coords": [24.1200, 91.9500] # Between Dharmanagar & Agartala
    }
]

class FleetTrackingService:
    def __init__(self):
        self.convoys = [dict(c) for c in FLEET_CONVOYS]
        self.last_update_ts = time.time()

    def get_live_fleet(self, cargo_filter=None):
        """
        Returns live GPS telemetry for all convoys, with subtle time-based jitter
        simulating actual movement along highway corridors.
        """
        now = time.time()
        dt = (now - self.last_update_ts)
        self.last_update_ts = now

        results = []
        for c in self.convoys:
            if cargo_filter and c["cargo_type"] != cargo_filter:
                continue

            # Simulate tiny forward movement along waypoint direction
            coords = list(c["current_coords"])
            # Small natural GPS drift/speed advancement: ~0.0002 deg (~20m)
            drift_lat = (random.random() - 0.48) * 0.0004
            drift_lon = (random.random() - 0.48) * 0.0004
            c["current_coords"] = [round(coords[0] + drift_lat, 6), round(coords[1] + drift_lon, 6)]
            
            # Subtle speed variance (+/- 1.5 km/h)
            base_speed = c["speed_kmh"]
            c["speed_kmh"] = round(max(20.0, min(65.0, base_speed + (random.random() - 0.5) * 1.5)), 1)
            c["last_telemetry_ts"] = int(now)

            results.append(dict(c))

        return {
            "timestamp": int(now),
            "total_convoys": len(self.convoys),
            "active_convoys": len(results),
            "convoys": results
        }

fleet_service = FleetTrackingService()
