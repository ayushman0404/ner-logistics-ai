"""
Comprehensive North Eastern Region (NER) Places, Districts, Towns & Villages Database
Covers all 8 states: Assam, Meghalaya, Manipur, Nagaland, Mizoram, Tripura, Arunachal Pradesh, Sikkim.
Integrated with live OpenStreetMap Nominatim fallback for universal village-level resolution.
"""

import urllib.request
import urllib.parse
import json
import time

# Pre-indexed comprehensive directory of NER District Headquarters, Major Logistics Hubs,
# Border Checkposts, Industrial Centers & Prominent Towns
NER_PLACES_EXPANDED = [
    # --- ASSAM ---
    {"id": "guwahati", "name": "Guwahati", "state": "Assam", "lat": 26.1445, "lon": 91.7362, "elevation": 55, "is_capital": False},
    {"id": "dispur", "name": "Dispur", "state": "Assam", "lat": 26.1500, "lon": 91.7800, "elevation": 55, "is_capital": True},
    {"id": "dibrugarh", "name": "Dibrugarh", "state": "Assam", "lat": 27.4728, "lon": 94.9120, "elevation": 108, "is_capital": False},
    {"id": "silchar", "name": "Silchar (Barak Valley Hub)", "state": "Assam", "lat": 24.8333, "lon": 92.7789, "elevation": 22, "is_capital": False},
    {"id": "jorhat", "name": "Jorhat", "state": "Assam", "lat": 26.7509, "lon": 94.2037, "elevation": 116, "is_capital": False},
    {"id": "nagaon", "name": "Nagaon", "state": "Assam", "lat": 26.3452, "lon": 92.6840, "elevation": 60, "is_capital": False},
    {"id": "tezpur", "name": "Tezpur", "state": "Assam", "lat": 26.6338, "lon": 92.7926, "elevation": 48, "is_capital": False},
    {"id": "tinsukia", "name": "Tinsukia", "state": "Assam", "lat": 27.4922, "lon": 95.3468, "elevation": 125, "is_capital": False},
    {"id": "bongaigaon", "name": "Bongaigaon", "state": "Assam", "lat": 26.5000, "lon": 90.5333, "elevation": 62, "is_capital": False},
    {"id": "sivasagar", "name": "Sivasagar", "state": "Assam", "lat": 26.9835, "lon": 94.6394, "elevation": 95, "is_capital": False},
    {"id": "north_lakhimpur", "name": "North Lakhimpur", "state": "Assam", "lat": 27.2300, "lon": 94.1000, "elevation": 101, "is_capital": False},
    {"id": "karimganj", "name": "Karimganj", "state": "Assam", "lat": 24.8667, "lon": 92.3500, "elevation": 13, "is_capital": False},
    {"id": "hailakandi", "name": "Hailakandi", "state": "Assam", "lat": 24.6800, "lon": 92.5600, "elevation": 21, "is_capital": False},
    {"id": "diphu", "name": "Diphu (Karbi Anglong)", "state": "Assam", "lat": 25.8372, "lon": 93.4384, "elevation": 186, "is_capital": False},
    {"id": "haflong", "name": "Haflong (Dima Hasao)", "state": "Assam", "lat": 25.1667, "lon": 93.0167, "elevation": 680, "is_capital": False},
    {"id": "goalpara", "name": "Goalpara", "state": "Assam", "lat": 26.1700, "lon": 90.6200, "elevation": 35, "is_capital": False},
    {"id": "barpeta", "name": "Barpeta", "state": "Assam", "lat": 26.3200, "lon": 91.0000, "elevation": 35, "is_capital": False},
    {"id": "dhubri", "name": "Dhubri (Port & Border)", "state": "Assam", "lat": 26.0200, "lon": 89.9700, "elevation": 34, "is_capital": False},
    {"id": "kokrajhar", "name": "Kokrajhar (BTR)", "state": "Assam", "lat": 26.4000, "lon": 90.2700, "elevation": 38, "is_capital": False},
    {"id": "golaghat", "name": "Golaghat", "state": "Assam", "lat": 26.5200, "lon": 93.9700, "elevation": 95, "is_capital": False},
    {"id": "dhemaji", "name": "Dhemaji", "state": "Assam", "lat": 27.4800, "lon": 94.5800, "elevation": 104, "is_capital": False},
    {"id": "majuli", "name": "Majuli (River Island)", "state": "Assam", "lat": 26.9500, "lon": 94.2200, "elevation": 84, "is_capital": False},
    {"id": "numaligarh", "name": "Numaligarh (Refinery)", "state": "Assam", "lat": 26.6100, "lon": 93.7600, "elevation": 90, "is_capital": False},
    {"id": "digboi", "name": "Digboi (Oil City)", "state": "Assam", "lat": 27.3800, "lon": 95.6300, "elevation": 165, "is_capital": False},
    {"id": "badarpur", "name": "Badarpur (Railway Junction)", "state": "Assam", "lat": 24.9000, "lon": 92.5900, "elevation": 16, "is_capital": False},
    {"id": "jagiroad", "name": "Jagiroad (NH-27 Corridor)", "state": "Assam", "lat": 26.1200, "lon": 92.2100, "elevation": 53, "is_capital": False},

    # --- MEGHALAYA ---
    {"id": "shillong", "name": "Shillong", "state": "Meghalaya", "lat": 25.5788, "lon": 91.8933, "elevation": 1525, "is_capital": True},
    {"id": "jowai", "name": "Jowai (West Jaintia Hills)", "state": "Meghalaya", "lat": 25.4520, "lon": 92.2030, "elevation": 1380, "is_capital": False},
    {"id": "tura", "name": "Tura (West Garo Hills)", "state": "Meghalaya", "lat": 25.5140, "lon": 90.2200, "elevation": 349, "is_capital": False},
    {"id": "nongpoh", "name": "Nongpoh (Ri-Bhoi)", "state": "Meghalaya", "lat": 25.9037, "lon": 91.8804, "elevation": 485, "is_capital": False},
    {"id": "lumshnong", "name": "Lumshnong (NH-6 Landslide Zone)", "state": "Meghalaya", "lat": 25.1833, "lon": 92.3833, "elevation": 650, "is_capital": False},
    {"id": "khliehriat", "name": "Khliehriat (East Jaintia Hills)", "state": "Meghalaya", "lat": 25.3500, "lon": 92.3600, "elevation": 1200, "is_capital": False},
    {"id": "cherrapunji", "name": "Cherrapunji / Sohra", "state": "Meghalaya", "lat": 25.2700, "lon": 91.7300, "elevation": 1430, "is_capital": False},
    {"id": "dawki", "name": "Dawki (International Border)", "state": "Meghalaya", "lat": 25.1900, "lon": 92.0200, "elevation": 20, "is_capital": False},
    {"id": "mawlynnong", "name": "Mawlynnong Village", "state": "Meghalaya", "lat": 25.2019, "lon": 91.9155, "elevation": 490, "is_capital": False},
    {"id": "byrnihat", "name": "Byrnihat (Industrial Border)", "state": "Meghalaya", "lat": 26.0500, "lon": 91.8800, "elevation": 85, "is_capital": False},
    {"id": "williamnagar", "name": "Williamnagar (East Garo)", "state": "Meghalaya", "lat": 25.5000, "lon": 90.6200, "elevation": 280, "is_capital": False},
    {"id": "baghmara", "name": "Baghmara (South Garo)", "state": "Meghalaya", "lat": 25.2000, "lon": 90.6300, "elevation": 115, "is_capital": False},
    {"id": "mawkyrwat", "name": "Mawkyrwat (South West Khasi)", "state": "Meghalaya", "lat": 25.3600, "lon": 91.4500, "elevation": 1500, "is_capital": False},

    # --- MANIPUR ---
    {"id": "imphal", "name": "Imphal", "state": "Manipur", "lat": 24.8170, "lon": 93.9368, "elevation": 786, "is_capital": True},
    {"id": "churachandpur", "name": "Churachandpur (Lamka)", "state": "Manipur", "lat": 24.3333, "lon": 93.6833, "elevation": 914, "is_capital": False},
    {"id": "jiribam", "name": "Jiribam (Railhead & Border)", "state": "Manipur", "lat": 24.8000, "lon": 93.1167, "elevation": 120, "is_capital": False},
    {"id": "senapati", "name": "Senapati (NH-2 Corridor)", "state": "Manipur", "lat": 25.2667, "lon": 94.0167, "elevation": 1200, "is_capital": False},
    {"id": "ukhrul", "name": "Ukhrul", "state": "Manipur", "lat": 25.0979, "lon": 94.3611, "elevation": 1660, "is_capital": False},
    {"id": "moreh", "name": "Moreh (International Border Post)", "state": "Manipur", "lat": 24.2500, "lon": 94.3000, "elevation": 300, "is_capital": False},
    {"id": "thoubal", "name": "Thoubal", "state": "Manipur", "lat": 24.6300, "lon": 93.9900, "elevation": 775, "is_capital": False},
    {"id": "bishnupur", "name": "Bishnupur", "state": "Manipur", "lat": 24.6300, "lon": 93.7600, "elevation": 790, "is_capital": False},
    {"id": "moirang", "name": "Moirang (Loktak Lake)", "state": "Manipur", "lat": 24.5000, "lon": 93.7700, "elevation": 770, "is_capital": False},
    {"id": "kangpokpi", "name": "Kangpokpi", "state": "Manipur", "lat": 25.1500, "lon": 93.9700, "elevation": 990, "is_capital": False},
    {"id": "tamenglong", "name": "Tamenglong", "state": "Manipur", "lat": 24.9800, "lon": 93.4900, "elevation": 1260, "is_capital": False},
    {"id": "chandel", "name": "Chandel", "state": "Manipur", "lat": 24.3200, "lon": 94.0300, "elevation": 820, "is_capital": False},
    {"id": "kakching", "name": "Kakching", "state": "Manipur", "lat": 24.4800, "lon": 93.9800, "elevation": 776, "is_capital": False},
    {"id": "noney", "name": "Noney / Tupul (NH-37)", "state": "Manipur", "lat": 24.8100, "lon": 93.6800, "elevation": 450, "is_capital": False},

    # --- NAGALAND ---
    {"id": "kohima", "name": "Kohima", "state": "Nagaland", "lat": 25.6751, "lon": 94.1086, "elevation": 1444, "is_capital": True},
    {"id": "dimapur", "name": "Dimapur (Railhead Logistics Hub)", "state": "Nagaland", "lat": 25.9060, "lon": 93.7270, "elevation": 145, "is_capital": False},
    {"id": "mokokchung", "name": "Mokokchung", "state": "Nagaland", "lat": 26.3250, "lon": 94.5200, "elevation": 1325, "is_capital": False},
    {"id": "tuensang", "name": "Tuensang", "state": "Nagaland", "lat": 26.2800, "lon": 94.8300, "elevation": 1370, "is_capital": False},
    {"id": "wokha", "name": "Wokha", "state": "Nagaland", "lat": 26.1000, "lon": 94.2600, "elevation": 1313, "is_capital": False},
    {"id": "mon", "name": "Mon", "state": "Nagaland", "lat": 26.7500, "lon": 95.0500, "elevation": 897, "is_capital": False},
    {"id": "phek", "name": "Phek", "state": "Nagaland", "lat": 25.6600, "lon": 94.4800, "elevation": 1524, "is_capital": False},
    {"id": "zunheboto", "name": "Zunheboto", "state": "Nagaland", "lat": 25.9700, "lon": 94.5200, "elevation": 1852, "is_capital": False},
    {"id": "chumukedima", "name": "Chumukedima", "state": "Nagaland", "lat": 25.8200, "lon": 93.7800, "elevation": 170, "is_capital": False},
    {"id": "peren", "name": "Peren", "state": "Nagaland", "lat": 25.5200, "lon": 93.7300, "elevation": 1445, "is_capital": False},
    {"id": "zubza", "name": "Zubza (NH-29 Sinking Zone)", "state": "Nagaland", "lat": 25.7100, "lon": 94.0200, "elevation": 850, "is_capital": False},

    # --- MIZORAM ---
    {"id": "aizawl", "name": "Aizawl", "state": "Mizoram", "lat": 23.7271, "lon": 92.7176, "elevation": 1132, "is_capital": True},
    {"id": "lunglei", "name": "Lunglei", "state": "Mizoram", "lat": 22.8670, "lon": 92.7330, "elevation": 1222, "is_capital": False},
    {"id": "champhai", "name": "Champhai (Zokhawthar Border)", "state": "Mizoram", "lat": 23.4700, "lon": 93.3300, "elevation": 1678, "is_capital": False},
    {"id": "kolasib", "name": "Kolasib (NH-306 Gateway)", "state": "Mizoram", "lat": 24.2300, "lon": 92.6800, "elevation": 610, "is_capital": False},
    {"id": "serchhip", "name": "Serchhip", "state": "Mizoram", "lat": 23.3100, "lon": 92.8300, "elevation": 1294, "is_capital": False},
    {"id": "vairengte", "name": "Vairengte (Checkpost)", "state": "Mizoram", "lat": 24.5100, "lon": 92.7600, "elevation": 140, "is_capital": False},
    {"id": "mamit", "name": "Mamit", "state": "Mizoram", "lat": 23.9300, "lon": 92.4900, "elevation": 718, "is_capital": False},
    {"id": "saiha", "name": "Saiha", "state": "Mizoram", "lat": 22.4800, "lon": 92.9700, "elevation": 729, "is_capital": False},

    # --- TRIPURA ---
    {"id": "agartala", "name": "Agartala", "state": "Tripura", "lat": 23.8315, "lon": 91.2868, "elevation": 15, "is_capital": True},
    {"id": "dharmanagar", "name": "Dharmanagar (Railhead)", "state": "Tripura", "lat": 24.3800, "lon": 92.1700, "elevation": 21, "is_capital": False},
    {"id": "udaipur", "name": "Udaipur (Gomati)", "state": "Tripura", "lat": 23.5333, "lon": 91.4833, "elevation": 25, "is_capital": False},
    {"id": "kailashahar", "name": "Kailashahar", "state": "Tripura", "lat": 24.3300, "lon": 92.0000, "elevation": 19, "is_capital": False},
    {"id": "belonia", "name": "Belonia (South Tripura)", "state": "Tripura", "lat": 23.2500, "lon": 91.4500, "elevation": 23, "is_capital": False},
    {"id": "ambassa", "name": "Ambassa (Dhalai)", "state": "Tripura", "lat": 23.9200, "lon": 91.8500, "elevation": 50, "is_capital": False},
    {"id": "sabroom", "name": "Sabroom (Maitri Setu Port)", "state": "Tripura", "lat": 23.0000, "lon": 91.7000, "elevation": 24, "is_capital": False},

    # --- ARUNACHAL PRADESH ---
    {"id": "itanagar", "name": "Itanagar", "state": "Arunachal Pradesh", "lat": 27.0844, "lon": 93.6053, "elevation": 320, "is_capital": True},
    {"id": "naharlagun", "name": "Naharlagun (Railhead)", "state": "Arunachal Pradesh", "lat": 27.1000, "lon": 93.6900, "elevation": 200, "is_capital": False},
    {"id": "pasighat", "name": "Pasighat (Siang Valley)", "state": "Arunachal Pradesh", "lat": 28.0667, "lon": 95.3333, "elevation": 155, "is_capital": False},
    {"id": "tawang", "name": "Tawang", "state": "Arunachal Pradesh", "lat": 27.5861, "lon": 91.8594, "elevation": 3048, "is_capital": False},
    {"id": "ziro", "name": "Ziro (Lower Subansiri)", "state": "Arunachal Pradesh", "lat": 27.5387, "lon": 93.8154, "elevation": 1572, "is_capital": False},
    {"id": "bomdila", "name": "Bomdila (West Kameng)", "state": "Arunachal Pradesh", "lat": 27.2500, "lon": 92.4000, "elevation": 2217, "is_capital": False},
    {"id": "along", "name": "Along / Aalo (West Siang)", "state": "Arunachal Pradesh", "lat": 28.1700, "lon": 94.8000, "elevation": 619, "is_capital": False},
    {"id": "tezu", "name": "Tezu (Lohit)", "state": "Arunachal Pradesh", "lat": 27.9200, "lon": 96.1700, "elevation": 185, "is_capital": False},
    {"id": "roing", "name": "Roing (Lower Dibang)", "state": "Arunachal Pradesh", "lat": 28.1400, "lon": 95.8400, "elevation": 390, "is_capital": False},
    {"id": "namsai", "name": "Namsai", "state": "Arunachal Pradesh", "lat": 27.6700, "lon": 95.8700, "elevation": 135, "is_capital": False},

    # --- SIKKIM ---
    {"id": "gangtok", "name": "Gangtok", "state": "Sikkim", "lat": 27.3389, "lon": 88.6065, "elevation": 1650, "is_capital": True},
    {"id": "namchi", "name": "Namchi (South Sikkim)", "state": "Sikkim", "lat": 27.1700, "lon": 88.3500, "elevation": 1315, "is_capital": False},
    {"id": "geyzing", "name": "Geyzing (West Sikkim)", "state": "Sikkim", "lat": 27.2800, "lon": 88.2500, "elevation": 1900, "is_capital": False},
    {"id": "mangan", "name": "Mangan (North Sikkim)", "state": "Sikkim", "lat": 27.5200, "lon": 88.5300, "elevation": 956, "is_capital": False},
    {"id": "rangpo", "name": "Rangpo (Border Checkpost)", "state": "Sikkim", "lat": 27.1800, "lon": 88.5300, "elevation": 330, "is_capital": False},
    {"id": "siliguri", "name": "Siliguri (Chicken's Neck Gateway)", "state": "West Bengal / Gateway", "lat": 26.7271, "lon": 88.3953, "elevation": 122, "is_capital": False}
]

# In-memory search cache for Nominatim results
_NOMINATIM_CACHE = {}

def search_nominatim_ner(query: str, limit: int = 5):
    """
    Search OpenStreetMap Nominatim for any remote village or address in the 8 NER states.
    Bounding box: West 88.0, South 21.5, East 97.5, North 29.8
    """
    q_clean = query.strip()
    cache_key = q_clean.lower()
    if cache_key in _NOMINATIM_CACHE:
        return _NOMINATIM_CACHE[cache_key]

    # Append India if not present
    search_q = f"{q_clean}, India" if "india" not in q_clean.lower() else q_clean
    encoded_q = urllib.parse.quote(search_q)
    
    # Bounded to North East India
    url = (
        f"https://nominatim.openstreetmap.org/search?q={encoded_q}&"
        f"countrycodes=in&format=json&addressdetails=1&limit={limit}&"
        f"viewbox=88.0,29.8,97.5,21.5"
    )

    req = urllib.request.Request(
        url,
        headers={"User-Agent": "NER-Logistics-Intelligence-Platform/1.5 (Academic/Field-Ops)"}
    )

    results = []
    try:
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            data = json.loads(resp.read().decode())
            for item in data:
                addr = item.get("address", {})
                state = addr.get("state", "NER")
                name = item.get("name") or q_clean.title()
                display_name = item.get("display_name", "")
                
                # Extract clean village/town name
                clean_title = display_name.split(",")[0].strip()
                if not clean_title:
                    clean_title = name

                results.append({
                    "id": f"geo-{item.get('osm_id', int(time.time()))}",
                    "name": clean_title,
                    "state": state,
                    "lat": float(item["lat"]),
                    "lon": float(item["lon"]),
                    "elevation": 250, # Default estimate
                    "is_capital": False,
                    "is_live_geocoded": True
                })
        _NOMINATIM_CACHE[cache_key] = results
    except Exception as e:
        print(f"[Places] Nominatim query error for '{query}': {e}")

    return results

def search_places(query: str, limit: int = 12):
    q = query.strip().lower()
    if not q:
        return NER_PLACES_EXPANDED[:limit]

    # 1. Local fast search
    local_matches = []
    for p in NER_PLACES_EXPANDED:
        name_lower = p["name"].lower()
        state_lower = p["state"].lower()
        if q in name_lower or q in state_lower:
            score = 3 if name_lower.startswith(q) else 1
            local_matches.append((score, p))

    local_matches.sort(key=lambda x: x[0], reverse=True)
    results = [p for _, p in local_matches]

    # 2. If fewer than 4 local matches or exact village search, query Nominatim
    if len(results) < 5 and len(q) >= 3:
        live_results = search_nominatim_ner(query, limit=5)
        # Append unique live results
        existing_coords = {(round(r["lat"], 2), round(r["lon"], 2)) for r in results}
        for lr in live_results:
            coord_key = (round(lr["lat"], 2), round(lr["lon"], 2))
            if coord_key not in existing_coords:
                results.append(lr)
                existing_coords.add(coord_key)

    return results[:limit]

def get_place_by_id_or_name(term: str):
    term_clean = term.strip().lower()
    # Check local index
    for p in NER_PLACES_EXPANDED:
        if p["id"] == term_clean or p["name"].lower() == term_clean:
            return p
        if term_clean in p["name"].lower():
            return p
            
    # Check Nominatim cache or query live
    live_matches = search_nominatim_ner(term, limit=1)
    if live_matches:
        return live_matches[0]

    return None

NER_PLACES = NER_PLACES_EXPANDED
