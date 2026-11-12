/**
 * NER AI Logistics Intelligence Platform - Interactive Frontend Controller
 * Implements Google Maps UI with 100% Real-Highway routing, Mountain Relief basemap (default),
 * RainViewer Live Doppler Radar, Open-Meteo temporal weather radar circles,
 * Landslide hazard markers, National Waterway 2 GIS layer, and dynamic re-routing.
 */

// Application State
const state = {
  origin: "",
  destination: "",
  originCoords: null,
  destCoords: null,
  vehicleType: "heavy_truck",
  gvwTons: 22.0,
  cargoType: "essential_pds",
  activeRouteId: null,
  routesData: null,
  incidentsData: [],
  weatherVisible: true,
  trafficVisible: true,
  dopplerVisible: false,
  boundariesVisible: true,
  waterwayVisible: false,
  fleetVisible: false,
  bridgesVisible: true,
  currentTileLayer: "gmaps", // Google Maps Road Tiles: 100% Free, Zero API Keys, Zero Watermarks!
  isSimulating: false,
  simMarker: null,
  latchedGps: null,
  hazardPhotoData: null
};

// Map & Layer References
let map = null;
let routeLayersGroup = null;
let badgeMarkersGroup = null;
let weatherCirclesGroup = null;
let dopplerRadarLayer = null;
let waterwayLayerGroup = null;
let fleetLayerGroup = null;
let bridgesLayerGroup = null;
let fleetInterval = null;
let incidentsMarkersGroup = null;
let originDestMarkersGroup = null;
let stateBoundariesGroup = null;
let intlBoundariesGroup = null;
let regionalLabelsGroup = null;
let tileLayers = {};
let dopplerUserRequested = false;
let radarToastTimeout = null;

function showSmartRadarToast(msg, durationMs = 2800) {
  const toast = document.getElementById("smart-radar-toast");
  const text = document.getElementById("smart-radar-toast-text");
  if (!toast || !text) return;
  text.innerText = msg;
  toast.classList.remove("hidden");
  if (radarToastTimeout) clearTimeout(radarToastTimeout);
  radarToastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, durationMs);
}

// Initialization on DOM load
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  initNerBoundaries();
  initWaterwayLayer();
  initLiveDopplerRadar();
  initBridgesLayer();
  initFleetTracking();
  if (typeof initAuth === "function") initAuth();
  if (typeof setupAuthEventListeners === "function") setupAuthEventListeners();
  if (typeof setupOfficerEventListeners === "function") setupOfficerEventListeners();
  if (typeof setupAdminEventListeners === "function") setupAdminEventListeners();
  setupEventListeners();
  fetchIncidentsList();
  // Clear default state: focus view directly on the 8 NER states
  resetMapToNerOverview();
});

/**
 * Center map view to frame all 8 North Eastern States of India
 */
function resetMapToNerOverview() {
  if (map) {
    map.fitBounds([[21.8, 88.0], [29.5, 97.5]], {
      padding: [40, 40]
    });
  }
}

/**
 * Initialize Survey GIS Boundaries:
 * - Subtle & delicate International Boundaries of India (Google Maps Style: 1.6px dashed line)
 * - Removes heavy state polygon fills to maintain crisp, natural vector cartography
 * - Google Maps typography country labels
 */
function initNerBoundaries() {
  intlBoundariesGroup = L.layerGroup().addTo(map);
  regionalLabelsGroup = L.layerGroup().addTo(map);

  // 1. Subtle & Refined International Boundaries of India (Google Maps Style)
  if (typeof NER_INTERNATIONAL_BOUNDARIES !== "undefined" && NER_INTERNATIONAL_BOUNDARIES.features) {
    L.geoJSON(NER_INTERNATIONAL_BOUNDARIES, {
      style: {
        color: "#5f6368", // Subtle Google neutral gray
        weight: 1.6,
        opacity: 0.85,
        dashArray: "4, 4",
        lineCap: "round",
        lineJoin: "round"
      }
    }).addTo(intlBoundariesGroup);
  }

  // 2. Sovereign Country Typography Labels (Google Maps style)
  if (typeof NER_COUNTRY_LABELS !== "undefined") {
    NER_COUNTRY_LABELS.forEach(c => {
      const countryLabelIcon = L.divIcon({
        className: "ner-country-map-label",
        html: `<span>${c.name}</span>`,
        iconSize: [160, 24],
        iconAnchor: [80, 12]
      });
      L.marker([c.lat, c.lon], { icon: countryLabelIcon, interactive: false }).addTo(regionalLabelsGroup);
    });
  }
}

/**
 * Initialize Leaflet Map over North East India
 */
function initMap() {
  map = L.map("map", {
    center: [26.15, 93.10],
    zoom: 6.4,
    zoomSnap: 0.1,
    zoomDelta: 0.5,
    zoomControl: false
  });

  // Zoom control on bottom right
  L.control.zoom({ position: "bottomright" }).addTo(map);

  window.addEventListener("resize", () => {
    if (map) map.invalidateSize();
  });

  // 100% Free, Zero-Quota Basemaps (Zero API Keys required, Zero Watermarks)
  // 1. Google Maps Road (Default: Authentic Google vector road network, zero watermarks)
  tileLayers.gmaps = L.tileLayer("https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    attribution: '&copy; Google Maps',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20
  }).addTo(map);

  // 2. Official OpenStreetMap Standard (High-Density Road Network)
  tileLayers.roads = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  });

  // 3. High-Resolution World Satellite Imagery
  tileLayers.satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri, Earthstar Geographics",
    maxZoom: 18
  });

  // Layer Groups
  routeLayersGroup = L.layerGroup().addTo(map);
  badgeMarkersGroup = L.layerGroup().addTo(map);
  weatherCirclesGroup = L.layerGroup().addTo(map);
  incidentsMarkersGroup = L.layerGroup().addTo(map);
  originDestMarkersGroup = L.layerGroup().addTo(map);
  fleetLayerGroup = L.layerGroup(); // Added to map when toggled on
  bridgesLayerGroup = L.layerGroup().addTo(map); // Visible by default
}

/**
 * Initialize Live Doppler Radar Layer (RainViewer Real Ground Stations)
 */
async function initLiveDopplerRadar() {
  try {
    const resp = await fetch("https://api.rainviewer.com/public/weather-maps.json");
    if (!resp.ok) return;
    const data = await resp.json();
    const past = data.radar && data.radar.past;
    if (past && past.length > 0) {
      const latest = past[past.length - 1];
      const radarTileUrl = `${data.host}${latest.path}/512/{z}/{x}/{y}/2/1_1.png`;
      if (dopplerRadarLayer) map.removeLayer(dopplerRadarLayer);
      dopplerRadarLayer = L.tileLayer(radarTileUrl, {
        opacity: 0.65,
        zIndex: 400,
        minZoom: 4,
        maxNativeZoom: 7, // RainViewer regional ground stations cover up to zoom 7; Leaflet upscales smoothly above 7 without requesting invalid tiles
        maxZoom: 18
      });
      if (state.dopplerVisible && dopplerUserRequested) {
        dopplerRadarLayer.addTo(map);
      }
    }
  } catch (err) {
    console.error("RainViewer live radar fetch failed:", err);
  }
}

/**
 * Initialize National Waterway 2 (Brahmaputra) Multimodal Logistics Layer
 */
function initWaterwayLayer() {
  waterwayLayerGroup = L.layerGroup();
  if (typeof NER_WATERWAY_NW2 !== "undefined") {
    L.geoJSON(NER_WATERWAY_NW2, {
      style: {
        color: "#0284c7",
        weight: 5,
        dashArray: "8, 6",
        opacity: 0.9
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <div style="font-size:12px; line-height:1.4;">
            <b style="color:#0284c7; font-size:14px;">${feature.properties.name}</b><br/>
            <b>Corridor Length:</b> ${feature.properties.length_km} km (National Multimodal Arterial)<br/>
            <p style="margin-top:4px; color:#444;">${feature.properties.description}</p>
          </div>
        `);
      }
    }).addTo(waterwayLayerGroup);

    // Major River Cargo Terminals along Brahmaputra
    const ports = [
      { name: "Dhubri Port", lat: 26.02, lon: 89.97, cap: "International Cargo / Bangladesh Border Terminal" },
      { name: "Jogighopa MMLP", lat: 26.10, lon: 90.35, cap: "Multi-Modal Logistics Park (Rail/Road/River)" },
      { name: "Pandu Port (Guwahati Hub)", lat: 26.15, lon: 91.70, cap: "Primary NER Container & Bulk Cargo Terminal" },
      { name: "Tezpur Terminal", lat: 26.63, lon: 92.80, cap: "Fertilizer & Agricultural Outflow Terminal" },
      { name: "Silghat Terminal", lat: 26.61, lon: 92.93, cap: "Petroleum & Jute Logistics Jetty" },
      { name: "Neamati Ghat (Jorhat)", lat: 26.85, lon: 94.22, cap: "Upper Assam Essential Supplies & Ferry Hub" },
      { name: "Dibrugarh Terminal", lat: 27.48, lon: 94.91, cap: "Heavy Machinery & Coal Riverport" }
    ];

    ports.forEach(port => {
      const portIcon = L.divIcon({
        className: "port-custom-icon",
        html: `<div style="background:#0284c7; color:#fff; width:26px; height:26px; border-radius:50%; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
        </div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      L.marker([port.lat, port.lon], { icon: portIcon })
        .addTo(waterwayLayerGroup)
        .bindPopup(`<b>${port.name}</b><br/><span style="font-size:11px; color:#555;">${port.cap}</span>`);
    });
  }
}

/**
 * Initialize Live GPS Fleet Tracking for Essential Commodities (Oxygen, Meds, PDS, Agro, Construction)
 */
async function initFleetTracking() {
  try {
    const resp = await fetch("/api/fleet/live");
    if (!resp.ok) return;
    const data = await resp.json();
    renderFleetMarkers(data.convoys || []);
    
    // Auto-refresh GPS telemetry every 4 seconds
    if (fleetInterval) clearInterval(fleetInterval);
    fleetInterval = setInterval(async () => {
      if (state.fleetVisible) {
        try {
          const liveResp = await fetch("/api/fleet/live");
          if (liveResp.ok) {
            const liveData = await liveResp.json();
            renderFleetMarkers(liveData.convoys || []);
          }
        } catch (e) {
          console.warn("Fleet GPS telemetry update paused:", e);
        }
      }
    }, 4000);
  } catch (err) {
    console.error("Fleet tracking fetch failed:", err);
  }
}

function renderFleetMarkers(convoys) {
  if (!fleetLayerGroup) return;
  fleetLayerGroup.clearLayers();

  const cargoConfig = {
    medicines_oxygen: { icon: "🚑", color: "#0284c7", badge: "Oxygen / Medicine" },
    essential_pds: { icon: "🚛", color: "#d97706", badge: "PDS Grain Supply" },
    perishables: { icon: "🍎", color: "#16a34a", badge: "Cold-Chain Agro" },
    construction: { icon: "🏗️", color: "#7c3aed", badge: "Strategic Construction" }
  };

  convoys.forEach(c => {
    const cfg = cargoConfig[c.cargo_type] || { icon: "🚚", color: "#1e293b", badge: "Commercial Freight" };
    
    const fleetIcon = L.divIcon({
      className: "fleet-vehicle-marker",
      html: `
        <div class="fleet-marker-bubble" style="background:${cfg.color};">
          <span class="fleet-glyph">${cfg.icon}</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker(c.current_coords, { icon: fleetIcon }).addTo(fleetLayerGroup);

    const divertBanner = c.ai_diverted 
      ? `<div class="popup-ai-divert">🤖 <b>AI Route Divergence:</b> ${c.divert_reason}</div>`
      : "";

    marker.bindPopup(`
      <div class="fleet-telemetry-popup">
        <div class="fleet-popup-top">
          <span class="fleet-popup-tag" style="background:${cfg.color}20; color:${cfg.color}; border:1px solid ${cfg.color}40;">
            ${cfg.badge}
          </span>
          <span class="fleet-popup-speed">${c.speed_kmh} km/h</span>
        </div>
        <h4 class="fleet-popup-title">${c.cargo_label}</h4>
        <div class="fleet-popup-sub">${c.vehicle_id} • ${c.vehicle_class}</div>
        
        <div class="fleet-popup-route">
          <b>${c.origin.split(",")[0]} &rarr; ${c.destination.split(",")[0]}</b><br/>
          <span style="font-size:11px; color:#64748b;">🛣️ ${c.corridor}</span>
        </div>

        <div class="fleet-telemetry-grid">
          <div class="t-cell">
            <span class="t-lbl">Payload</span>
            <span class="t-val">${c.gvw_tons} Tons</span>
          </div>
          <div class="t-cell">
            <span class="t-lbl">Cargo Temp</span>
            <span class="t-val ${c.temperature_c < 0 ? 'text-blue' : ''}">${c.temperature_c}°C</span>
          </div>
          <div class="t-cell">
            <span class="t-lbl">Progress</span>
            <span class="t-val">${c.progress_pct}%</span>
          </div>
          <div class="t-cell">
            <span class="t-lbl">Delay</span>
            <span class="t-val ${c.delay_minutes > 0 ? 'text-amber' : 'text-green'}">+${c.delay_minutes} min</span>
          </div>
        </div>

        <div class="fleet-driver-bar">
          👤 Driver: <b>${c.driver_name}</b> • <a href="tel:${c.driver_phone}">${c.driver_phone}</a>
        </div>

        ${divertBanner}
      </div>
    `, { minWidth: 280, maxWidth: 320 });
  });
}

/**
 * Initialize Critical Strategic Bridges Telemetry Layer
 */
async function initBridgesLayer() {
  try {
    const resp = await fetch("/api/bridges");
    if (!resp.ok) return;
    const data = await resp.json();
    renderBridgesMarkers(data.bridges || []);
  } catch (err) {
    console.error("Bridges telemetry fetch failed:", err);
  }
}

function renderBridgesMarkers(bridges) {
  if (!bridgesLayerGroup) return;
  bridgesLayerGroup.clearLayers();

  bridges.forEach(b => {
    let color = "#16a34a"; // Green
    let pulseClass = "";
    if (b.status === "caution") {
      color = "#f59e0b"; // Amber
    } else if (b.status === "critical") {
      color = "#dc2626"; // Red
      pulseClass = "pulse-critical-bridge";
    }

    const bridgeIcon = L.divIcon({
      className: "bridge-custom-marker",
      html: `
        <div class="bridge-marker-badge ${pulseClass}" style="background:${color};">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2">
            <path d="M4 19V5M20 19V5M4 10h16M4 14h16M2 19h20"/>
          </svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const alertHtml = b.alert 
      ? `<div class="bridge-popup-alert" style="background:${color}15; color:${color}; border:1px solid ${color}40; margin-top:6px; padding:6px 8px; border-radius:6px; font-size:11px;">⚠️ ${b.alert}</div>`
      : "";

    L.marker(b.coords, { icon: bridgeIcon })
      .addTo(bridgesLayerGroup)
      .bindPopup(`
        <div class="bridge-telemetry-popup">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:11px; font-weight:700; color:${color}; text-transform:uppercase;">${b.status_label}</span>
            <span style="font-size:11px; font-weight:700; background:#f1f5f9; padding:2px 6px; border-radius:4px;">Max ${b.max_gross_weight_tons}T</span>
          </div>
          <h4 style="margin:0 0 4px 0; font-size:13.5px; color:#1e293b;">${b.name}</h4>
          <div style="font-size:11.5px; color:#475569; margin-bottom:6px;">
            🌊 <b>${b.river}</b> • ${b.district}<br/>
            🛣️ ${b.highway} • Span: ${b.length_km} km
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; background:#f8fafc; padding:6px 8px; border-radius:6px; font-size:11px;">
            <div>Structural Health: <b style="color:${color};">${b.structural_health_pct}%</b></div>
            <div>Clearance: <b>${b.clearance_level_m}m</b> (Danger: ${b.danger_mark_m}m)</div>
          </div>
          ${alertHtml}
        </div>
      `, { minWidth: 260, maxWidth: 300 });
  });
}

/**
 * Setup UI Event Listeners
 */
function setupEventListeners() {
  // Search inputs
  const originInput = document.getElementById("origin-input");
  const destInput = document.getElementById("dest-input");
  const clearOriginBtn = document.getElementById("clear-origin");
  const clearDestBtn = document.getElementById("clear-dest");
  const swapBtn = document.getElementById("swap-btn");
  const searchBtn = document.getElementById("search-btn");

  clearOriginBtn.addEventListener("click", () => {
    originInput.value = "";
    originInput.focus();
    state.origin = "";
    state.originCoords = null;
    if (!destInput.value.trim()) clearActiveRoutes();
  });

  clearDestBtn.addEventListener("click", () => {
    destInput.value = "";
    destInput.focus();
    state.destination = "";
    state.destCoords = null;
    if (!originInput.value.trim()) clearActiveRoutes();
  });

  swapBtn.addEventListener("click", () => {
    const temp = originInput.value;
    originInput.value = destInput.value;
    destInput.value = temp;

    const tempCoords = state.originCoords;
    state.originCoords = state.destCoords;
    state.destCoords = tempCoords;

    state.origin = originInput.value.trim();
    state.destination = destInput.value.trim();
    if (state.origin && state.destination) {
      triggerRouteCalculation();
    }
  });

  searchBtn.addEventListener("click", () => {
    const orig = originInput.value.trim();
    const dest = destInput.value.trim();
    if (!orig || !dest) {
      showSmartRadarToast("Please select both Origin and Destination to route");
      if (!orig) originInput.focus();
      else destInput.focus();
      return;
    }
    state.origin = orig;
    state.destination = dest;
    triggerRouteCalculation();
  });

  // Quick-Select Popular Corridor Chips
  document.querySelectorAll(".quick-corridor-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const orig = chip.dataset.orig;
      const dest = chip.dataset.dest;
      originInput.value = orig;
      destInput.value = dest;
      state.origin = orig;
      state.destination = dest;
      state.originCoords = null;
      state.destCoords = null;
      
      // Expand directions card so user sees selection and has the '✕' close button
      const fullSearchCard = document.getElementById("full-search-card");
      const minPill = document.getElementById("minimized-search-pill");
      if (fullSearchCard) fullSearchCard.classList.remove("hidden");
      if (minPill) minPill.classList.add("hidden");

      triggerRouteCalculation();
    });
  });

  // Autocomplete typing with Nominatim support
  originInput.addEventListener("input", (e) => handleSearchInput(e.target.value, "origin"));
  destInput.addEventListener("input", (e) => handleSearchInput(e.target.value, "destination"));

  // Hide suggestions on outside click
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-card")) {
      document.getElementById("suggestions-dropdown").classList.add("hidden");
    }
  });

  // Vehicle selector tabs
  document.querySelectorAll(".vehicle-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".vehicle-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      state.vehicleType = tab.dataset.vehicle;
      if (state.origin && state.destination) {
        triggerRouteCalculation();
      }
    });
  });

  // Freight controls
  document.getElementById("cargo-select").addEventListener("change", (e) => {
    state.cargoType = e.target.value;
    if (state.origin && state.destination) triggerRouteCalculation();
  });

  document.getElementById("weight-input").addEventListener("change", (e) => {
    state.gvwTons = parseFloat(e.target.value) || 22.0;
    if (state.origin && state.destination) triggerRouteCalculation();
  });

  // Right Map Controls
  // 1. Live Doppler Radar (Smart Auto-Zoom & Auto-Suspend Intelligence)
  const btnDoppler = document.getElementById("btn-doppler-toggle");
  if (btnDoppler) {
    btnDoppler.addEventListener("click", function() {
      dopplerUserRequested = !dopplerUserRequested;
      state.dopplerVisible = dopplerUserRequested;
      
      if (dopplerUserRequested) {
        this.classList.add("active");
        this.classList.remove("auto-suspended");
        
        // Smart auto-zoom: If zoomed in beyond supported native radar view (Zoom 7), automatically fly to 7
        const curZoom = map.getZoom();
        if (curZoom > 7) {
          map.flyTo(map.getCenter(), 7, { duration: 1.0 });
          showSmartRadarToast("Doppler Radar Active • Auto-adjusted to regional weather radar view (Zoom 7)");
        } else if (curZoom < 5) {
          map.flyTo(map.getCenter(), 6, { duration: 1.0 });
          showSmartRadarToast("Doppler Radar Active • Zoomed into North Eastern Region");
        } else {
          showSmartRadarToast("Live Doppler Radar Active • Real Ground Station Feed");
        }
        
        if (dopplerRadarLayer && !map.hasLayer(dopplerRadarLayer)) {
          dopplerRadarLayer.addTo(map);
        }
      } else {
        this.classList.remove("active");
        this.classList.remove("auto-suspended");
        if (dopplerRadarLayer && map.hasLayer(dopplerRadarLayer)) {
          map.removeLayer(dopplerRadarLayer);
        }
        showSmartRadarToast("Live Doppler Radar Deactivated");
      }
    });
  }

  // Map Zoom Intelligence:
  // When user zooms in deep (Zoom >= 9) to inspect roads and terrain bends,
  // automatically suspend Doppler radar so highway vectors and details are crystal clear.
  // When user zooms back out (Zoom <= 8), automatically resume radar.
  map.on("zoomend", function() {
    if (!dopplerUserRequested) return;
    const currentZoom = map.getZoom();
    const btn = document.getElementById("btn-doppler-toggle");
    
    if (currentZoom >= 9) {
      if (dopplerRadarLayer && map.hasLayer(dopplerRadarLayer)) {
        map.removeLayer(dopplerRadarLayer);
        if (btn) {
          btn.classList.remove("active");
          btn.classList.add("auto-suspended");
          btn.title = `Doppler Radar Auto-Suspended for Road Inspection (Zoom ${currentZoom})`;
        }
        showSmartRadarToast(`Radar Auto-Suspended for Clear Road Inspection (Zoom ${currentZoom})`);
      }
    } else {
      if (dopplerRadarLayer && !map.hasLayer(dopplerRadarLayer)) {
        dopplerRadarLayer.addTo(map);
        if (btn) {
          btn.classList.add("active");
          btn.classList.remove("auto-suspended");
          btn.title = "Toggle Live Doppler Radar (Active)";
        }
        showSmartRadarToast(`Radar Auto-Resumed • Regional Overview (Zoom ${currentZoom})`);
      }
    }
  });

  // 2. Open-Meteo Predictive Route Rain Buffers
  document.getElementById("btn-weather-toggle").addEventListener("click", function() {
    state.weatherVisible = !state.weatherVisible;
    this.classList.toggle("active", state.weatherVisible);
    if (state.weatherVisible) {
      map.addLayer(weatherCirclesGroup);
    } else {
      map.removeLayer(weatherCirclesGroup);
    }
  });

  // 3. National Waterway 2 Multimodal Corridor
  const btnWaterway = document.getElementById("btn-waterway-toggle");
  if (btnWaterway) {
    btnWaterway.addEventListener("click", function() {
      state.waterwayVisible = !state.waterwayVisible;
      this.classList.toggle("active", state.waterwayVisible);
      if (state.waterwayVisible) {
        map.addLayer(waterwayLayerGroup);
      } else {
        map.removeLayer(waterwayLayerGroup);
      }
    });
  }

  // 4. Traffic Layer Toggle
  document.getElementById("btn-traffic-toggle").addEventListener("click", function() {
    state.trafficVisible = !state.trafficVisible;
    this.classList.toggle("active", state.trafficVisible);
    renderRoutesOnMap(state.routesData);
  });

  // 5. Basemap Cycle: Google Maps Road -> OSM Roads -> Satellite -> Google Maps Road
  document.getElementById("btn-basemap-toggle").addEventListener("click", function() {
    if (state.currentTileLayer === "gmaps") {
      map.removeLayer(tileLayers.gmaps);
      tileLayers.roads.addTo(map);
      state.currentTileLayer = "roads";
      this.title = "Current: OSM Road Network (Click to switch to Satellite)";
    } else if (state.currentTileLayer === "roads") {
      map.removeLayer(tileLayers.roads);
      tileLayers.satellite.addTo(map);
      state.currentTileLayer = "satellite";
      this.title = "Current: Satellite Imagery (Click to switch to Google Maps Road)";
    } else {
      map.removeLayer(tileLayers.satellite);
      tileLayers.gmaps.addTo(map);
      state.currentTileLayer = "gmaps";
      this.title = "Current: Google Maps Road Network (Click to switch to OSM Roads)";
    }
  });

  // 6. Live GPS Fleet Tracking Toggle (Req d, g)
  const btnFleet = document.getElementById("btn-fleet-toggle");
  if (btnFleet) {
    btnFleet.addEventListener("click", function() {
      state.fleetVisible = !state.fleetVisible;
      this.classList.toggle("active", state.fleetVisible);
      if (state.fleetVisible) {
        map.addLayer(fleetLayerGroup);
        initFleetTracking();
        showSmartRadarToast("Live GPS Fleet Tracking Active • Oxygen, Meds, PDS & Agro Convoys");
      } else {
        map.removeLayer(fleetLayerGroup);
      }
    });
  }

  // 7. Critical Bridge Telemetry Toggle (Req a)
  const btnBridges = document.getElementById("btn-bridges-toggle");
  if (btnBridges) {
    btnBridges.classList.toggle("active", state.bridgesVisible);
    btnBridges.addEventListener("click", function() {
      state.bridgesVisible = !state.bridgesVisible;
      this.classList.toggle("active", state.bridgesVisible);
      if (state.bridgesVisible) {
        map.addLayer(bridgesLayerGroup);
      } else {
        map.removeLayer(bridgesLayerGroup);
      }
    });
  }

  // Search Panel Collapse / Expand (Google Maps Style)
  const btnCloseDirections = document.getElementById("btn-close-directions");
  const btnExpandSearch = document.getElementById("btn-expand-search");
  const fullSearchCard = document.getElementById("full-search-card");
  const minimizedSearchPill = document.getElementById("minimized-search-pill");

  function openDirectionsPanel() {
    if (minimizedSearchPill) minimizedSearchPill.classList.add("hidden");
    if (fullSearchCard) fullSearchCard.classList.remove("hidden");
    const origInput = document.getElementById("origin-input");
    if (origInput && !origInput.value) origInput.focus();
    if (state.routesData) {
      renderRoutesOnMap(state.routesData);
    }
  }

  function closeDirectionsAndReset() {
    const originInput = document.getElementById("origin-input");
    const destInput = document.getElementById("dest-input");
    if (originInput) originInput.value = "";
    if (destInput) destInput.value = "";
    state.origin = "";
    state.destination = "";
    state.originCoords = null;
    state.destCoords = null;
    clearActiveRoutes();
    if (fullSearchCard) fullSearchCard.classList.add("hidden");
    if (minimizedSearchPill) minimizedSearchPill.classList.remove("hidden");
    resetMapToNerOverview();
  }

  if (minimizedSearchPill) {
    minimizedSearchPill.addEventListener("click", openDirectionsPanel);
  }

  if (btnExpandSearch) {
    btnExpandSearch.addEventListener("click", (e) => {
      e.stopPropagation();
      openDirectionsPanel();
    });
  }

  if (btnCloseDirections) {
    btnCloseDirections.addEventListener("click", (e) => {
      e.stopPropagation();
      closeDirectionsAndReset();
    });
  }

  // Bottom Navigation Drawer Collapse / Expand
  const bottomDrawer = document.getElementById("bottom-drawer");
  const drawerHandleBar = document.getElementById("drawer-handle-bar");
  const btnToggleDetails = document.getElementById("btn-toggle-details");

  if (drawerHandleBar && bottomDrawer) {
    drawerHandleBar.addEventListener("click", () => {
      bottomDrawer.classList.toggle("collapsed");
    });
  }

  if (btnToggleDetails && bottomDrawer) {
    btnToggleDetails.addEventListener("click", () => {
      bottomDrawer.classList.toggle("collapsed");
    });
  }

  // Driver Hazard Report Modal & Submit
  const btnDriverReport = document.getElementById("btn-driver-report-hazard");
  const driverModal = document.getElementById("driver-report-modal");
  const driverModalClose = document.getElementById("driver-report-close");
  const driverForm = document.getElementById("driver-hazard-form");

  if (btnDriverReport && driverModal) {
    btnDriverReport.addEventListener("click", () => {
      driverModal.classList.remove("hidden");
    });
  }

  if (driverModalClose && driverModal) {
    driverModalClose.addEventListener("click", () => {
      driverModal.classList.add("hidden");
    });
  }

  if (driverModal) {
    driverModal.addEventListener("click", (e) => {
      if (e.target === driverModal) driverModal.classList.add("hidden");
    });
  }

  // GPS Latch Button (Req f)
  const btnLatchGps = document.getElementById("btn-latch-gps");
  const latlonInput = document.getElementById("driver-hazard-latlon");
  const geoStatus = document.getElementById("geo-status-indicator");

  if (btnLatchGps) {
    btnLatchGps.addEventListener("click", () => {
      if (geoStatus) geoStatus.innerText = "Acquiring GPS fix via satellite triangulation...";
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude.toFixed(5);
            const lon = pos.coords.longitude.toFixed(5);
            const acc = Math.round(pos.coords.accuracy || 10);
            if (latlonInput) latlonInput.value = `${lat}, ${lon}`;
            if (geoStatus) geoStatus.innerHTML = `✅ <b style="color:#059669;">GPS Latched:</b> Lat ${lat}, Lon ${lon} (±${acc}m)`;
            state.latchedGps = { lat: parseFloat(lat), lon: parseFloat(lon), acc };
          },
          (err) => {
            const center = map.getCenter();
            const lat = center.lat.toFixed(5);
            const lon = center.lng.toFixed(5);
            if (latlonInput) latlonInput.value = `${lat}, ${lon}`;
            if (geoStatus) geoStatus.innerHTML = `📍 <b style="color:#0284c7;">Map Crosshair Latched:</b> Lat ${lat}, Lon ${lon}`;
            state.latchedGps = { lat: parseFloat(lat), lon: parseFloat(lon), acc: 25 };
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      }
    });
  }

  // Photograph Upload & Thumbnail Preview (Req f)
  const photoInput = document.getElementById("driver-hazard-photo");
  const photoPreviewBox = document.getElementById("photo-preview-container");
  const photoPreviewImg = document.getElementById("photo-preview-img");
  const btnRemovePhoto = document.getElementById("btn-remove-photo");

  if (photoInput) {
    photoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          state.hazardPhotoData = loadEvt.target.result;
          if (photoPreviewImg) photoPreviewImg.src = state.hazardPhotoData;
          if (photoPreviewBox) photoPreviewBox.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (btnRemovePhoto) {
    btnRemovePhoto.addEventListener("click", () => {
      state.hazardPhotoData = null;
      if (photoInput) photoInput.value = "";
      if (photoPreviewImg) photoPreviewImg.src = "";
      if (photoPreviewBox) photoPreviewBox.classList.add("hidden");
    });
  }

  if (driverForm) {
    driverForm.addEventListener("submit", handleDriverHazardSubmit);
  }

  // Transit Simulation
  const startNavBtn = document.getElementById("btn-start-nav");
  if (startNavBtn) {
    startNavBtn.addEventListener("click", simulateVehicleTransit);
  }
}

/**
 * Autocomplete Search for All NER Places, Towns & Villages
 */
let debounceTimeout = null;
function handleSearchInput(query, targetType) {
  clearTimeout(debounceTimeout);
  if (!query || query.length < 2) {
    document.getElementById("suggestions-dropdown").classList.add("hidden");
    return;
  }

  debounceTimeout = setTimeout(async () => {
    try {
      const resp = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
      const data = await resp.json();
      const dropdown = document.getElementById("suggestions-dropdown");

      if (data.places && data.places.length > 0) {
        dropdown.innerHTML = data.places.map(p => {
          const badgeHtml = p.is_live_geocoded
            ? `<span class="suggestion-state" style="background:#fef3c7; color:#92400e;">Village/Circle</span>`
            : `<span class="suggestion-state">${p.elevation}m</span>`;

          return `
            <div class="suggestion-item" data-name="${p.name}" data-state="${p.state}" data-lat="${p.lat}" data-lon="${p.lon}" data-target="${targetType}">
              <span class="suggestion-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${p.is_capital ? '#0284c7' : '#64748b'}" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <span class="suggestion-title"><b>${p.name}</b>, ${p.state}</span>
              ${badgeHtml}
            </div>
          `;
        }).join("");
        dropdown.classList.remove("hidden");

        dropdown.querySelectorAll(".suggestion-item").forEach(item => {
          item.addEventListener("click", () => {
            const fullName = `${item.dataset.name}, ${item.dataset.state}`;
            const coords = [parseFloat(item.dataset.lat), parseFloat(item.dataset.lon)];

            if (item.dataset.target === "origin") {
              document.getElementById("origin-input").value = fullName;
              state.origin = fullName;
              state.originCoords = coords;
            } else {
              document.getElementById("dest-input").value = fullName;
              state.destination = fullName;
              state.destCoords = coords;
            }
            dropdown.classList.add("hidden");
            if (state.origin && state.destination) {
              triggerRouteCalculation();
            } else if (!state.origin) {
              document.getElementById("origin-input").focus();
            } else if (!state.destination) {
              document.getElementById("dest-input").focus();
            }
          });
        });
      } else {
        dropdown.classList.add("hidden");
      }
    } catch (err) {
      console.error("Places search error:", err);
    }
  }, 220);
}

/**
 * Clear Active Routes & Restore Clean 8-State NER Overview
 */
function clearActiveRoutes() {
  routeLayersGroup.clearLayers();
  badgeMarkersGroup.clearLayers();
  weatherCirclesGroup.clearLayers();
  originDestMarkersGroup.clearLayers();
  state.routesData = null;
  state.activeRouteId = null;
  const bottomDrawer = document.getElementById("bottom-drawer");
  if (bottomDrawer) bottomDrawer.classList.add("hidden");
  const minRouteLabel = document.getElementById("minimized-route-label");
  if (minRouteLabel) minRouteLabel.innerText = "No active route • Click to search";
  resetMapToNerOverview();
}

/**
 * Trigger AI Multi-Route Calculation from Backend
 */
async function triggerRouteCalculation() {
  if (!state.origin || !state.destination) return;

  const bottomDrawer = document.getElementById("bottom-drawer");
  if (bottomDrawer) bottomDrawer.classList.remove("hidden");
  document.getElementById("summary-eta").innerText = "Calculating...";
  document.getElementById("summary-dist").innerText = "(AI Engine Optimizing Real Highways)";

  try {
    const payload = {
      origin: state.origin,
      destination: state.destination,
      vehicle_type: state.vehicleType,
      gvw_tons: state.gvwTons,
      cargo_type: state.cargoType
    };

    if (state.originCoords) payload.origin_coords = state.originCoords;
    if (state.destCoords) payload.dest_coords = state.destCoords;

    const resp = await fetch("/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) throw new Error("Routing failed");
    const data = await resp.json();
    state.routesData = data;
    state.activeRouteId = data.active_route_id;

    renderRoutesOnMap(data);
    updateBottomDrawer(data);
    fetchIncidentsList();
  } catch (err) {
    console.error("Routing error:", err);
    document.getElementById("summary-eta").innerText = "Route Error";
    document.getElementById("summary-status").innerText = "Unable to compute route corridors. Verify inputs or network.";
  }
}

/**
 * Render 100% Real-Highway Routes on Leaflet Map
 */
function renderRoutesOnMap(data) {
  if (!data || !data.routes || data.routes.length === 0) return;

  routeLayersGroup.clearLayers();
  badgeMarkersGroup.clearLayers();
  weatherCirclesGroup.clearLayers();
  originDestMarkersGroup.clearLayers();

  const routes = data.routes;
  const activeRoute = routes.find(r => r.id === state.activeRouteId) || routes[0];

  // Google Maps Style Origin & Destination Markers
  const oCoord = [data.origin.lat, data.origin.lon];
  const dCoord = [data.destination.lat, data.destination.lon];

  const originIcon = L.divIcon({
    className: "gmaps-orig-pin",
    html: `<div style="background:#ffffff; width:16px; height:16px; border-radius:50%; border:3.5px solid #1a73e8; box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
  L.marker(oCoord, { icon: originIcon }).addTo(originDestMarkersGroup).bindPopup(`<b>Origin:</b> ${data.origin.name}`);

  const destIcon = L.divIcon({
    className: "gmaps-dest-pin",
    html: `<svg width="26" height="36" viewBox="0 0 24 32" fill="none" style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.35));">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill="#ea4335"/>
      <circle cx="12" cy="11" r="4.5" fill="#ffffff"/>
    </svg>`,
    iconSize: [26, 36],
    iconAnchor: [13, 36]
  });
  L.marker(dCoord, { icon: destIcon }).addTo(originDestMarkersGroup).bindPopup(`<b>Destination:</b> ${data.destination.name}`);

  // 1. Render Alternate Routes (Background Layer)
  routes.forEach(route => {
    if (route.id === activeRoute.id) return;

    const latlngs = route.coordinates.map(pt => [pt[1], pt[0]]);
    const isBlocked = route.is_blocked;

    const altLine = L.polyline(latlngs, {
      color: isBlocked ? "#ef4444" : "#94a3b8",
      weight: 6,
      opacity: 0.70,
      dashArray: isBlocked ? "6, 8" : null,
      lineCap: "round",
      lineJoin: "round"
    }).addTo(routeLayersGroup);

    altLine.on("click", () => {
      state.activeRouteId = route.id;
      renderRoutesOnMap(state.routesData);
      updateBottomDrawer(state.routesData);
    });

    renderRouteBadge(route, latlngs, false);
  });

  // 2. Render Active Route on top
  const activeLatLngs = activeRoute.coordinates.map(pt => [pt[1], pt[0]]);
  const isActiveBlocked = activeRoute.is_blocked;

  // White casing glow
  L.polyline(activeLatLngs, {
    color: "#ffffff",
    weight: 10,
    opacity: 0.95
  }).addTo(routeLayersGroup);

  if (state.trafficVisible && activeRoute.traffic_segments && !isActiveBlocked) {
    // Dynamic traffic colored micro-segments
    activeRoute.traffic_segments.forEach(seg => {
      const segLatLngs = seg.coordinates.map(pt => [pt[1], pt[0]]);
      L.polyline(segLatLngs, {
        color: seg.color,
        weight: 6,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round"
      }).addTo(routeLayersGroup);
    });
  } else {
    L.polyline(activeLatLngs, {
      color: isActiveBlocked ? "#dc2626" : "#1a73e8",
      weight: 7,
      opacity: 0.95,
      dashArray: isActiveBlocked ? "8, 8" : null,
      lineCap: "round",
      lineJoin: "round"
    }).addTo(routeLayersGroup);
  }

  // Active Route Badge
  renderRouteBadge(activeRoute, activeLatLngs, true);

  // 3. Render Temporal Weather Radar Circles
  if (state.weatherVisible && activeRoute.weather_alerts) {
    activeRoute.weather_alerts.forEach(alert => {
      if (alert.precipitation_mm_hr > 0.3 || alert.severity !== "clear") {
        const circle = L.circle([alert.lat, alert.lon], {
          radius: alert.radius_meters,
          color: alert.color,
          weight: 1.5,
          opacity: 0.8,
          fillColor: alert.color,
          fillOpacity: 0.25,
          className: "rainfall-pulse-marker"
        }).addTo(weatherCirclesGroup);

        circle.bindTooltip(`
          <div style="font-size:12px; line-height:1.4;">
            <b>${alert.condition}</b><br/>
            Precipitation: <b>${alert.precipitation_mm_hr} mm/hr</b> (${alert.severity})<br/>
            Projected Arrival: <b>+${alert.arrival_hours} hrs</b>
          </div>
        `, { sticky: true });
      }
    });
  }

  // Fit bounds to view whole corridor framed cleanly in open canvas to the right of the search card
  if (activeLatLngs.length > 0) {
    const fullSearchCard = document.getElementById("full-search-card");
    const isSearchExpanded = fullSearchCard && !fullSearchCard.classList.contains("hidden");
    const leftPad = isSearchExpanded ? 440 : 80;
    map.fitBounds(L.polyline(activeLatLngs).getBounds(), {
      paddingTopLeft: [leftPad, 60],
      paddingBottomRight: [60, 120],
      maxZoom: 14
    });
  }
}

/**
 * Render Floating Google Maps Style ETA Badges on Route Polylines
 */
function renderRouteBadge(route, latlngs, isActive) {
  if (!latlngs || latlngs.length === 0) return;

  const midIdx = Math.floor(latlngs.length * 0.48);
  const midCoord = latlngs[midIdx];

  const pillClass = isActive ? "route-eta-pill active-pill" : "route-eta-pill";
  const iconCar = isActive ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-1px; margin-right:3px;"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>` : "";

  const badgeIcon = L.divIcon({
    className: "route-eta-marker",
    html: `<div class="${pillClass}" title="Click to view this corridor">
      ${iconCar}<span>${route.eta_formatted}</span>
      <span class="pill-dist">${route.distance_km} km</span>
    </div>`,
    iconSize: [120, 28],
    iconAnchor: [60, 14]
  });

  const marker = L.marker(midCoord, { icon: badgeIcon }).addTo(badgeMarkersGroup);
  marker.on("click", () => {
    state.activeRouteId = route.id;
    renderRoutesOnMap(state.routesData);
    updateBottomDrawer(state.routesData);
  });
}

/**
 * Update Bottom Drawer with Verified Distance & ETA
 */
function updateBottomDrawer(data) {
  const bottomDrawer = document.getElementById("bottom-drawer");
  if (bottomDrawer) bottomDrawer.classList.remove("hidden");

  const routes = data.routes;
  const activeRoute = routes.find(r => r.id === state.activeRouteId) || routes[0];

  const summaryEta = document.getElementById("summary-eta");
  const summaryDist = document.getElementById("summary-dist");
  const summaryStatus = document.getElementById("summary-status");

  summaryEta.innerText = activeRoute.eta_formatted;
  summaryDist.innerText = `(${activeRoute.distance_km} km)`;

  // Update Minimized Search Pill Text
  const minRouteLabel = document.getElementById("minimized-route-label");
  if (minRouteLabel) {
    const oName = (state.origin || "").split(",")[0].trim();
    const dName = (state.destination || "").split(",")[0].trim();
    minRouteLabel.innerHTML = `<b>${oName} &rarr; ${dName}</b>: ${activeRoute.eta_formatted} (${activeRoute.distance_km} km)`;
  }

  if (activeRoute.is_blocked) {
    summaryEta.style.color = "#dc2626";
    const impassableLabel = typeof t === "function" ? t("corridor_impassable", "CORRIDOR IMPASSABLE:") : "CORRIDOR IMPASSABLE:";
    summaryStatus.innerHTML = `<span style="color:#dc2626; font-weight:bold;">${impassableLabel}</span> Blocked by landslide/disruption. Click an alternate route to divert.`;
  } else if (data.ai_optimization_summary && data.ai_optimization_summary.disruption_avoided) {
    summaryEta.style.color = "#059669";
    const avoidedProb = (data.ai_optimization_summary.primary_ml_risk && data.ai_optimization_summary.primary_ml_risk.disruption_probability_pct) || 85;
    const aiDivergenceLabel = typeof t === "function" ? t("ai_divergence_active", "AI Route Divergence Active:") : "AI Route Divergence Active:";
    summaryStatus.innerHTML = `<span style="color:#059669; font-weight:bold;">${aiDivergenceLabel}</span> Diverting to safe valley bypass to avoid ${avoidedProb}% predicted mudslide on mountain pass.`;
  } else {
    summaryEta.style.color = "#059669";
    const fastestStr = typeof t === "function" ? t("fastest_route", "Fastest verified real-highway route") : "Fastest verified real-highway route";
    summaryStatus.innerText = `${fastestStr} • ${data.vehicle_profile ? data.vehicle_profile.label : ""} • Avg speed ${activeRoute.average_speed_kmh} km/h`;
  }

  // Corridors Comparison Grid
  const grid = document.getElementById("corridors-comparison-section");
  grid.innerHTML = routes.map(r => {
    const isCurActive = r.id === activeRoute.id;
    let cardClass = isCurActive ? "corridor-card active-corridor" : "corridor-card";
    if (r.is_blocked) cardClass += " blocked-corridor";

    let tagHtml = "";
    if (r.is_blocked) {
      tagHtml = `<span class="corridor-tag tag-blocked">Blocked</span>`;
    } else if (isCurActive) {
      tagHtml = `<span class="corridor-tag tag-fastest">${r.status_badge || 'Active Path'}</span>`;
    } else {
      tagHtml = `<span class="corridor-tag tag-alternate">Alternate</span>`;
    }

    const ml = r.ml_prediction || {};
    const probPct = ml.disruption_probability_pct !== undefined ? ml.disruption_probability_pct : 0;
    const statusColor = ml.status_color || "#10b981";
    const cause = ml.predicted_cause || "Passable Flow";
    const drivers = ml.top_risk_drivers || [];
    const news = ml.historical_precedent_news || null;
    const advice = ml.ai_optimization_advice || "";

    let mlBlockHtml = `
      <div class="ml-predictor-block">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <span class="ml-risk-badge" style="background:${statusColor}18; color:${statusColor}; border:1px solid ${statusColor}44;">
            AI Disruption Risk: <b>${probPct}%</b> (${cause})
          </span>
          <span style="font-size:10px; color:#64748b; font-weight:600;">Gradient Boosting ML</span>
        </div>
        <div class="ml-drivers-list">
          <b>Key Drivers:</b> ${drivers.join(" • ")}
        </div>
    `;

    if (news) {
      mlBlockHtml += `
        <div class="ml-news-box">
          <span class="news-tag">Historical Precedent (${news.date}):</span>
          <div class="news-headline">"${news.headline}"</div>
          <div class="news-impact">${news.impact_summary.substring(0, 140)}...</div>
        </div>
      `;
    }

    if (advice) {
      mlBlockHtml += `
        <div class="ai-advice-box" style="border-left: 3px solid ${statusColor};">
          ${advice}
        </div>
      `;
    }

    mlBlockHtml += `</div>`;

    return `
      <div class="${cardClass}" data-id="${r.id}">
        <div class="card-top-header">
          <div class="card-corridor-title">${r.name}</div>
          ${tagHtml}
        </div>
        <div class="corridor-stats-row">
          <div class="corridor-stat"><b>${r.eta_formatted}</b></div>
          <div class="corridor-stat"><b>${r.distance_km} km</b></div>
          <div class="corridor-stat">Safety: <b>${r.safety_score}/100</b></div>
        </div>
        <div class="corridor-desc">${r.description}</div>
        ${mlBlockHtml}
      </div>
    `;
  }).join("");

  grid.querySelectorAll(".corridor-card").forEach(card => {
    card.addEventListener("click", () => {
      state.activeRouteId = card.dataset.id;
      renderRoutesOnMap(state.routesData);
      updateBottomDrawer(state.routesData);
    });
  });
}

/**
 * Fetch and Render Incident Markers
 */
async function fetchIncidentsList() {
  try {
    const resp = await fetch("/api/incidents");
    const data = await resp.json();
    state.incidentsData = data.incidents || [];

    incidentsMarkersGroup.clearLayers();

    state.incidentsData.forEach(inc => {
      const isBlocked = inc.road_blocked;
      const markerHtml = `<div style="
        background:${isBlocked ? '#dc2626' : '#f59e0b'};
        color:#fff;
        width:32px;
        height:32px;
        border-radius:50%;
        border:2px solid #fff;
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
        display:flex;
        align-items:center;
        justify-content:center;
        cursor:pointer;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>`;

      const incIcon = L.divIcon({
        className: "incident-custom-marker",
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([inc.lat, inc.lon], { icon: incIcon }).addTo(incidentsMarkersGroup);
      marker.bindPopup(`
        <div style="font-size:13px; line-height:1.4; max-width:240px;">
          <b style="color:${isBlocked ? '#dc2626' : '#d97706'}; font-size:14px;">${inc.title}</b><br/>
          <b>Location:</b> ${inc.highway}<br/>
          <b>Status:</b> ${isBlocked ? '<span style="color:#dc2626; font-weight:bold;">Road Closed (Blockage)</span>' : 'Caution / Slow Crawl'}<br/>
          <b>Reported By:</b> ${inc.reported_by}<br/>
          <p style="margin-top:4px; font-size:11px; color:#555;">${inc.description}</p>
        </div>
      `);
    });

    const modalList = document.getElementById("active-incidents-list");
    if (modalList) {
      modalList.innerHTML = state.incidentsData.map(inc => `
        <div class="incident-row-card">
          <div class="incident-row-info">
            <div class="incident-row-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${inc.road_blocked ? '#dc2626' : '#f59e0b'}" stroke-width="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>${inc.title}</span>
            </div>
            <div class="incident-row-desc">${inc.highway} • ${inc.reported_by}</div>
          </div>
          <button class="incident-toggle-btn ${inc.road_blocked ? 'btn-toggle-unblock' : 'btn-toggle-block'}" data-id="${inc.id}">
            ${inc.road_blocked ? 'Clear Blockage' : 'Simulate Blockage'}
          </button>
        </div>
      `).join("");

      modalList.querySelectorAll(".incident-toggle-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          await toggleIncidentBlockage(btn.dataset.id);
        });
      });
    }
  } catch (err) {
    console.error("Failed to fetch incidents:", err);
  }
}

/**
 * Toggle Incident Blockage and Re-Route
 */
async function toggleIncidentBlockage(incidentId) {
  try {
    const resp = await fetch("/api/incidents/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: incidentId })
    });
    if (resp.ok) {
      await fetchIncidentsList();
      await triggerRouteCalculation();
    }
  } catch (err) {
    console.error("Failed to toggle incident:", err);
  }
}

/**
 * Transmit Driver Road Hazard Report to Field Officer Queue
 */
async function handleDriverHazardSubmit(e) {
  e.preventDefault();
  const title = document.getElementById("driver-hazard-title").value.trim();
  const type = document.getElementById("driver-hazard-type").value;
  const severity = document.getElementById("driver-hazard-severity").value;
  const desc = document.getElementById("driver-hazard-desc").value.trim();

  if (!title) {
    alert("Please enter a description for the road obstacle.");
    return;
  }

  let lat, lon, acc = 15;
  if (state.latchedGps) {
    lat = state.latchedGps.lat;
    lon = state.latchedGps.lon;
    acc = state.latchedGps.acc || 15;
  } else {
    const center = map.getCenter();
    lat = center.lat;
    lon = center.lng;
  }

  const reporter = (typeof currentUser !== "undefined" && currentUser) ? currentUser.name : "Driver Ramesh Sharma";

  const payload = {
    title,
    type,
    severity,
    road_blocked: (severity === "critical"),
    description: desc || "Reported live by Driver on route.",
    lat,
    lon,
    geo_accuracy_m: acc,
    photo_url: state.hazardPhotoData || null,
    highway: "Active Logistics Corridor",
    reported_by: reporter
  };

  // Offline Handling (Req h)
  if (!navigator.onLine || (typeof OfflineSyncManager !== "undefined" && !OfflineSyncManager.isOnline)) {
    if (typeof OfflineSyncManager !== "undefined") {
      OfflineSyncManager.queueReport(payload);
    }
    document.getElementById("driver-report-modal").classList.add("hidden");
    document.getElementById("driver-hazard-form").reset();
    state.hazardPhotoData = null;
    state.latchedGps = null;
    if (document.getElementById("photo-preview-container")) {
      document.getElementById("photo-preview-container").classList.add("hidden");
    }
    return;
  }

  try {
    const resp = await fetch("/api/incidents/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const res = await resp.json();
    if (res.success) {
      alert("✅ Hazard report with geo-tag & damage photograph transmitted to Field Officer Operations Center for verification.");
      document.getElementById("driver-report-modal").classList.add("hidden");
      document.getElementById("driver-hazard-form").reset();
      state.hazardPhotoData = null;
      state.latchedGps = null;
      if (document.getElementById("photo-preview-container")) {
        document.getElementById("photo-preview-container").classList.add("hidden");
      }
      if (typeof fetchPendingIncidents === "function") {
        fetchPendingIncidents();
      }
    } else {
      alert(res.message || "Failed to submit hazard report.");
    }
  } catch (err) {
    console.error("Failed to add incident:", err);
    if (typeof OfflineSyncManager !== "undefined") {
      OfflineSyncManager.queueReport(payload);
    } else {
      alert("Network error transmitting hazard report.");
    }
    document.getElementById("driver-report-modal").classList.add("hidden");
  }
}

/**
 * Reset Incidents to Defaults
 */
async function handleResetIncidents() {
  try {
    const resp = await fetch("/api/incidents/reset", { method: "POST" });
    if (resp.ok) {
      await fetchIncidentsList();
      await triggerRouteCalculation();
    }
  } catch (err) {
    console.error("Failed to reset incidents:", err);
  }
}

/**
 * Simulate Vehicle Moving Along Active Route
 */
function simulateVehicleTransit() {
  if (!state.routesData || !state.activeRouteId) return;
  const activeRoute = state.routesData.routes.find(r => r.id === state.activeRouteId);
  if (!activeRoute || activeRoute.is_blocked) {
    alert("Cannot simulate transit on a blocked corridor!");
    return;
  }

  if (state.isSimulating) return;
  state.isSimulating = true;

  const latlngs = activeRoute.coordinates.map(pt => [pt[1], pt[0]]);
  let step = 0;
  const totalSteps = latlngs.length;

  if (state.simMarker) {
    map.removeLayer(state.simMarker);
  }

  const truckIcon = L.divIcon({
    className: "sim-truck-marker",
    html: `<div style="background:#0f172a; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 10px rgba(0,0,0,0.4); border:2px solid #38bdf8;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <polygon points="16 8 20 8 23 11 23 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  state.simMarker = L.marker(latlngs[0], { icon: truckIcon }).addTo(map);

  const interval = setInterval(() => {
    step += Math.max(1, Math.floor(totalSteps / 100));
    if (step >= totalSteps) {
      step = totalSteps - 1;
      clearInterval(interval);
      state.isSimulating = false;
      alert("Transit complete! Shipment arrived at destination.");
    }

    const curPos = latlngs[step];
    state.simMarker.setLatLng(curPos);
    map.panTo(curPos, { animate: true, duration: 0.1 });
  }, 100);
}

// Re-render UI components on language switch
window.addEventListener("ner_language_changed", (e) => {
  if (state.routesData) {
    updateBottomDrawer(state.routesData);
  } else {
    const minRouteLabel = document.getElementById("minimized-route-label");
    if (minRouteLabel && (!state.origin || !state.destination)) {
      minRouteLabel.innerText = typeof t === "function" ? t("search_placeholder", "Search destination or pick a regional corridor...") : "Search destination or pick a regional corridor...";
    }
  }
});

