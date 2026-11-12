/**
 * NER Geographic Layers: National Waterway 2 (NW-2 Brahmaputra River Corridor)
 * and Key Regional Inter-State Logistics Boundaries
 */

const NER_WATERWAY_NW2 = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "National Waterway 2 (NW-2) - Brahmaputra River",
        "length_km": 891,
        "type": "multimodal_waterway",
        "description": "Strategic 891 km inland freight waterway from Dhubri (Bangladesh border) to Sadiya, connecting major ports at Pandu (Guwahati), Tezpur, Silghat, Neamati (Jorhat), and Dibrugarh."
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [89.97, 26.02], // Dhubri
          [90.35, 26.10], // Jogighopa Multi-Modal Logistics Park
          [90.62, 26.17], // Goalpara
          [91.35, 26.12], // Palashbari
          [91.70, 26.15], // Pandu Port (Guwahati Hub)
          [92.20, 26.25], // Morigaon Ghat
          [92.80, 26.63], // Tezpur Port
          [92.93, 26.61], // Silghat Terminal
          [93.50, 26.75], // Gamiri
          [94.22, 26.85], // Neamati Ghat (Jorhat / Majuli Ferry)
          [94.58, 27.15], // Desangmukh
          [94.91, 27.48], // Dibrugarh Inland Terminal
          [95.33, 27.65], // Oriumghat / Saikhowaghat
          [95.66, 27.83]  // Sadiya Terminal
        ]
      }
    }
  ]
};

const NER_STATE_HUBS = [
  { "state": "Assam", "lat": 26.2006, "lon": 92.9376, "capital": "Dispur" },
  { "state": "Meghalaya", "lat": 25.4670, "lon": 91.3662, "capital": "Shillong" },
  { "state": "Manipur", "lat": 24.6637, "lon": 93.9063, "capital": "Imphal" },
  { "state": "Nagaland", "lat": 26.1584, "lon": 94.5624, "capital": "Kohima" },
  { "state": "Mizoram", "lat": 23.1645, "lon": 92.9376, "capital": "Aizawl" },
  { "state": "Tripura", "lat": 23.9408, "lon": 91.9882, "capital": "Agartala" },
  { "state": "Arunachal Pradesh", "lat": 28.2180, "lon": 94.7278, "capital": "Itanagar" },
  { "state": "Sikkim", "lat": 27.5330, "lon": 88.5122, "capital": "Gangtok" }
];
