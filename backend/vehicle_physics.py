"""
Vehicle Physics and ETA Calibration Engine for North Eastern Region (NER)
Calibrates speed based on vehicle category, gross vehicle weight (GVW),
cargo sensitivity, mountain gradient, and weather conditions.
"""

VEHICLE_PROFILES = {
    "heavy_truck": {
        "label": "Heavy Multi-Axle Truck (16-25T)",
        "icon": "🚛",
        "base_plain_speed": 60.0,     # km/h on plain highway (NH-27 Assam valley)
        "base_hill_speed": 34.0,      # km/h on mountain ghats (NH-6, NH-2)
        "hairpin_speed": 20.0,        # km/h on sharp switchbacks
        "fuel_consumption_rate": 3.2, # km per liter (diesel)
        "weight_sensitivity": 0.12,   # % speed reduction under maximum payload
        "rain_speed_penalty": 0.20,   # speed drop under heavy rain (>15mm/hr)
        "max_recommended_gvw": 25.0   # tons
    },
    "medium_truck": {
        "label": "Medium / LCV Truck (7-12T)",
        "icon": "🚚",
        "base_plain_speed": 70.0,
        "base_hill_speed": 42.0,
        "hairpin_speed": 26.0,
        "fuel_consumption_rate": 4.8,
        "weight_sensitivity": 0.08,
        "rain_speed_penalty": 0.15,
        "max_recommended_gvw": 12.0
    },
    "bus": {
        "label": "Heavy Passenger Bus",
        "icon": "🚌",
        "base_plain_speed": 75.0,
        "base_hill_speed": 45.0,
        "hairpin_speed": 28.0,
        "fuel_consumption_rate": 4.0,
        "weight_sensitivity": 0.05,
        "rain_speed_penalty": 0.12,
        "max_recommended_gvw": 16.0
    },
    "car": {
        "label": "Rapid Response / Car / SUV (4x4)",
        "icon": "🚗",
        "base_plain_speed": 90.0,
        "base_hill_speed": 58.0,
        "hairpin_speed": 38.0,
        "fuel_consumption_rate": 14.0,
        "weight_sensitivity": 0.02,
        "rain_speed_penalty": 0.10,
        "max_recommended_gvw": 3.0
    }
}

CARGO_TYPES = {
    "medicines_oxygen": {
        "label": "Medical Supplies & Liquid Oxygen",
        "priority": "Critical Emergency",
        "vibration_sensitive": True,
        "spoilage_hours": 24,
        "risk_multiplier": 1.4
    },
    "perishables": {
        "label": "Perishable Agro (Pineapple, Kiwi, Ginger)",
        "priority": "High Priority",
        "vibration_sensitive": False,
        "spoilage_hours": 36,
        "risk_multiplier": 1.25
    },
    "essential_pds": {
        "label": "Essential Public Supplies (Rations, Fuel, Salt)",
        "priority": "Strategic Priority",
        "vibration_sensitive": False,
        "spoilage_hours": 120,
        "risk_multiplier": 1.1
    },
    "construction": {
        "label": "Infrastructure & Construction (Cement, Steel)",
        "priority": "Standard Freight",
        "vibration_sensitive": False,
        "spoilage_hours": 999,
        "risk_multiplier": 1.0
    }
}

def calculate_segment_travel_time(
    distance_km: float,
    is_mountainous: bool,
    vehicle_type: str = "heavy_truck",
    gvw_tons: float = 20.0,
    cargo_type: str = "essential_pds",
    traffic_level: str = "normal", # "normal", "moderate", "heavy"
    rainfall_mm_hr: float = 0.0,
    has_caution: bool = False
) -> dict:
    profile = VEHICLE_PROFILES.get(vehicle_type, VEHICLE_PROFILES["heavy_truck"])
    base_speed = profile["base_hill_speed"] if is_mountainous else profile["base_plain_speed"]

    # Weight penalty: heavier loads reduce climbing speeds
    max_weight = profile["max_recommended_gvw"]
    weight_ratio = min(1.2, max(0.4, gvw_tons / max_weight))
    weight_factor = 1.0 - (weight_ratio * profile["weight_sensitivity"] * (1.5 if is_mountainous else 0.5))

    # Traffic multiplier
    traffic_mult = 1.0
    if traffic_level == "moderate":
        traffic_mult = 1.15
    elif traffic_level == "heavy":
        traffic_mult = 1.40

    # Rain slowdown
    rain_factor = 1.0
    if rainfall_mm_hr > 25: # Severe/torrential
        rain_factor = 1.0 - profile["rain_speed_penalty"]
    elif rainfall_mm_hr > 8: # Moderate
        rain_factor = 1.0 - (profile["rain_speed_penalty"] * 0.5)
    elif rainfall_mm_hr > 2: # Light
        rain_factor = 1.0 - (profile["rain_speed_penalty"] * 0.2)

    # Caution penalty (landslide debris, road repair, single lane)
    caution_factor = 0.88 if has_caution else 1.0

    # Effective speed (min threshold 15 km/h)
    speed = (base_speed * weight_factor * rain_factor * caution_factor) / traffic_mult
    speed = max(15.0, min(100.0, speed))

    duration_hours = distance_km / speed
    fuel_liters = distance_km / profile["fuel_consumption_rate"]

    return {
        "speed_kmh": round(speed, 1),
        "duration_hours": duration_hours,
        "duration_minutes": round(duration_hours * 60, 1),
        "fuel_liters": round(fuel_liters, 1),
        "traffic_level": traffic_level,
        "rainfall_mm_hr": rainfall_mm_hr
    }

def format_eta_string(total_minutes: float) -> str:
    hours = int(total_minutes // 60)
    mins = int(round(total_minutes % 60))
    if hours > 0:
        return f"{hours} hr {mins} min"
    return f"{mins} min"
