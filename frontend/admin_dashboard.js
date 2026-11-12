/**
 * Admin Central Command & Analytical Intelligence Controller
 * Handles End-to-End Subsystem Probing, Machine Learning Error Analysis,
 * Telemetry SLA, Corridor Disruption Drills, and Session Sign-Out.
 */

document.addEventListener("DOMContentLoaded", () => {
  setupAdminPage();
  loadAdminProfile();
  refreshAdminData();
  runFullSystemProbe();
  loadModelErrorAnalysis();
  fetchLogisticsBottlenecks();
});

async function loadAdminProfile() {
  try {
    const resp = await fetch("/api/auth/current");
    const data = await resp.json();
    if (data.authenticated && data.user) {
      const nameEl = document.getElementById("admin-header-name");
      if (nameEl) nameEl.innerText = data.user.name;
    } else {
      // Unauthenticated, redirect to login
      window.location.href = "/login?redirect=/admin";
    }
  } catch (err) {
    console.error("Profile check error:", err);
  }
}

function setupAdminPage() {
  // 1. Mature Tab Switching
  document.querySelectorAll(".mature-tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".mature-tab-btn").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.tab;
      document.querySelectorAll(".dashboard-pane").forEach(p => p.classList.add("hidden"));
      const targetPane = document.getElementById(`admin-pane-${target}`);
      if (targetPane) {
        targetPane.classList.remove("hidden");
      }
    });
  });

  // 2. Run Full System Probe Button
  const btnRunProbe = document.getElementById("btn-run-full-probe");
  if (btnRunProbe) {
    btnRunProbe.addEventListener("click", async () => {
      btnRunProbe.disabled = true;
      btnRunProbe.innerHTML = `
        <span class="pulse-dot" style="display:inline-block; width:6px; height:6px; margin-right:6px;"></span>
        <span>Probing Subsystems...</span>
      `;
      await runFullSystemProbe();
      btnRunProbe.disabled = false;
      btnRunProbe.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        <span>Run Full System Probe</span>
      `;
    });
  }

  // 3. Sign Out Button
  const btnLogout = document.getElementById("btn-admin-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      if (confirm("Terminate administrative session and return to secure gateway?")) {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {}
        window.location.href = "/login";
      }
    });
  }

  // 4. Disruption Drill Baseline Reset
  const resetBtn = document.getElementById("admin-btn-reset-drills");
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      if (confirm("Reset all simulated corridor blockages and restore baseline logistics routes?")) {
        const resp = await fetch("/api/incidents/reset", { method: "POST" });
        if (resp.ok) {
          alert("All corridors restored to normal passable baseline.");
          await refreshAdminData();
          await runFullSystemProbe();
        }
      }
    });
  }
}

async function refreshAdminData() {
  await Promise.all([
    fetchSystemDiagnostics(),
    fetchFleetAnalytics(),
    fetchAdminLogs(),
    fetchAdminDrillIncidents(),
    fetchLogisticsBottlenecks()
  ]);
}

/**
 * 1. Live Active Diagnostic Probe across All 7 Subsystems
 */
async function runFullSystemProbe() {
  try {
    const resp = await fetch("/api/admin/diagnostics/run");
    const data = await resp.json();

    // Update Health Banner
    const banner = document.getElementById("health-summary-banner");
    const statusText = document.getElementById("banner-status-text");
    const statusDot = document.getElementById("banner-status-dot");
    const counts = document.getElementById("banner-counts");
    const timestamp = document.getElementById("banner-timestamp");

    const isHealthy = data.overall_status === "HEALTHY";
    if (banner) {
      banner.className = `health-summary-banner ${isHealthy ? 'banner-healthy' : 'banner-warning'}`;
    }
    if (statusDot) {
      statusDot.className = `pulse-dot ${isHealthy ? 'bg-green' : 'bg-red'}`;
    }
    if (statusText) {
      statusText.innerHTML = isHealthy
        ? `<b>SYSTEM HEALTHY:</b> All ${data.healthy_count}/${data.total_probes} Subsystems Fully Operational (${data.probe_duration_ms} ms probe cycle)`
        : `<b>ATTENTION REQUIRED:</b> ${data.fault_count} subsystem fault(s) detected. Self-healing fallbacks active.`;
    }
    if (counts) {
      counts.innerText = `${data.healthy_count} Healthy • ${data.warning_count} Degraded • ${data.fault_count} Faults`;
    }
    if (timestamp) {
      timestamp.innerText = `Checked: ${data.timestamp}`;
    }

    // Render Subsystem Probe Cards
    const container = document.getElementById("subsystems-probe-grid");
    if (container && data.subsystems) {
      container.innerHTML = data.subsystems.map(sub => {
        let statusPillClass = "pill-op";
        if (sub.status === "DEGRADED") statusPillClass = "pill-deg";
        if (sub.status === "FAULT") statusPillClass = "pill-fault";

        return `
          <div class="probe-card-glass ${sub.status === 'FAULT' ? 'card-fault-border' : ''}">
            <div class="probe-card-header">
              <div>
                <span class="probe-category">${sub.category}</span>
                <h4 class="probe-title">${sub.name}</h4>
              </div>
              <span class="status-pill ${statusPillClass}">${sub.status}</span>
            </div>
            
            <div class="probe-metrics-line">
              <span>Latency: <b>${sub.latency_ms} ms</b></span>
              <span class="probe-file-tag">Source: <code>${sub.file_location}</code></span>
            </div>

            <div class="probe-details-box">
              ${sub.details}
            </div>

            <div class="probe-fallback-line">
              <b>Protocol:</b> <span class="text-blue">${sub.fallback_status}</span>
            </div>
          </div>
        `;
      }).join("");
    }

    // Render Anomaly Log Table
    const tbody = document.getElementById("anomaly-log-tbody");
    if (tbody && data.anomalies) {
      tbody.innerHTML = data.anomalies.map(a => `
        <tr>
          <td><code>${a.timestamp}</code></td>
          <td><b>${a.component}</b></td>
          <td>
            <span class="status-pill ${a.severity === 'fault' ? 'pill-fault' : 'pill-op'}">${a.severity.toUpperCase()}</span>
          </td>
          <td>${a.event}</td>
          <td><span class="text-green">${a.action}</span></td>
        </tr>
      `).join("");
    }
  } catch (err) {
    console.error("Probe run failed:", err);
  }
}

/**
 * 2. Load Machine Learning Error Analysis Metrics & Feature Importances
 */
async function loadModelErrorAnalysis() {
  try {
    const resp = await fetch("/api/admin/error-analysis");
    const data = await resp.json();

    // Render Feature Weights
    const container = document.getElementById("feature-weights-list");
    if (container && data.feature_importances) {
      container.innerHTML = data.feature_importances.map(f => `
        <div class="feature-bar-row">
          <div class="feature-bar-label">
            <span>${f.feature}</span>
            <b>${f.importance_pct}%</b>
          </div>
          <div class="feature-progress-track">
            <div class="feature-progress-fill" style="width: ${Math.max(4, f.importance_pct)}%;"></div>
          </div>
        </div>
      `).join("");
    }
  } catch (err) {
    console.error("Failed to load ML error analysis:", err);
  }
}

/**
 * 3. Fetch & Render System Diagnostics (Legacy / SLA Stream)
 */
async function fetchSystemDiagnostics() {
  try {
    const resp = await fetch("/api/admin/diagnostics");
    const data = await resp.json();
    const container = document.getElementById("system-diagnostics-grid");
    if (!container) return;

    const d = data.diagnostics;
    const services = [
      {
        key: "routing_engine",
        svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`
      },
      {
        key: "weather_service",
        svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`
      },
      {
        key: "radar_service",
        svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M4.93 4.93A10 10 0 0 0 4 12h8V4a10 10 0 0 0-7.07.93z"/><circle cx="12" cy="12" r="10"/></svg>`
      },
      {
        key: "road_graph_cache",
        svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`
      }
    ];

    container.innerHTML = services.map(s => {
      const item = d[s.key];
      if (!item) return "";
      return `
        <div class="diag-card">
          <div class="diag-card-top">
            <div class="diag-icon-box">${s.svg}</div>
            <span class="diag-badge-online">
              <span class="pulse-dot" style="display:inline-block; width:6px; height:6px; margin-right:4px;"></span>
              ${item.status}
            </span>
          </div>
          <h4 class="diag-title">${item.name}</h4>
          <div class="diag-stats-row">
            <div>Response Latency: <b>${item.latency_ms} ms</b></div>
            <div>Uptime SLA: <b>${item.uptime_pct}%</b></div>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Failed to fetch diagnostics:", err);
  }
}

/**
 * 4. Fetch & Render Fleet Analytics
 */
async function fetchFleetAnalytics() {
  try {
    const resp = await fetch("/api/admin/analytics");
    const data = await resp.json();
    const a = data.analytics;

    const kpiTrucks = document.getElementById("stat-active-trucks");
    const kpiMedical = document.getElementById("stat-medical-convoys");
    const kpiBlocked = document.getElementById("stat-blocked-corridors");
    const kpiOfficers = document.getElementById("stat-field-officers");

    if (kpiTrucks) kpiTrucks.innerText = (a.active_freight_trucks || 1428).toLocaleString();
    if (kpiMedical) kpiMedical.innerText = a.emergency_medical_convoys || 42;
    if (kpiBlocked) kpiBlocked.innerText = a.blocked_corridors_count !== undefined ? a.blocked_corridors_count : 2;
    if (kpiOfficers) kpiOfficers.innerText = a.active_field_officers_on_patrol || 34;
  } catch (err) {
    console.error("Failed to fetch analytics:", err);
  }
}

/**
 * 5. Fetch & Render Disruption Drill Controls
 */
async function fetchAdminDrillIncidents() {
  try {
    const resp = await fetch("/api/incidents");
    const data = await resp.json();
    const container = document.getElementById("admin-drills-list");
    if (!container) return;

    container.innerHTML = data.incidents.map(inc => `
      <div class="admin-drill-row">
        <div class="drill-info">
          <div class="drill-icon-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${inc.road_blocked ? '#dc2626' : '#d97706'}" stroke-width="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <h4 class="drill-title">${inc.title}</h4>
            <span class="drill-meta">${inc.highway} • ${inc.reported_by}</span>
          </div>
        </div>
        <div class="drill-action-wrap">
          <span class="status-pill ${inc.road_blocked ? 'pill-blocked' : 'pill-open'}">
            ${inc.road_blocked ? 'Closed (Disruption Active)' : 'Passable (Open Corridor)'}
          </span>
          <button class="btn-drill-toggle ${inc.road_blocked ? 'btn-unblock' : 'btn-block'}" data-id="${inc.id}">
            ${inc.road_blocked ? 'Restore Corridor' : 'Simulate Blockage'}
          </button>
        </div>
      </div>
    `).join("");

    container.querySelectorAll(".btn-drill-toggle").forEach(btn => {
      btn.addEventListener("click", async () => {
        await toggleAdminDrillBlockage(btn.dataset.id);
      });
    });
  } catch (err) {
    console.error("Failed to fetch drill incidents:", err);
  }
}

async function toggleAdminDrillBlockage(incidentId) {
  try {
    const resp = await fetch("/api/admin/drill-toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: incidentId })
    });
    if (resp.ok) {
      await fetchAdminDrillIncidents();
      await fetchFleetAnalytics();
      await runFullSystemProbe();
    }
  } catch (err) {
    alert("Drill toggle failed");
  }
}

/**
 * 6. Fetch & Render System Audit Logs
 */
async function fetchAdminLogs() {
  try {
    const resp = await fetch("/api/admin/logs");
    const data = await resp.json();
    const container = document.getElementById("admin-logs-stream");
    if (!container) return;

    container.innerHTML = data.logs.map(l => `
      <div class="log-line">
        <span class="log-time">[${l.time}]</span>
        <span class="log-type log-${l.type.toLowerCase()}">${l.type}</span>
        <span class="log-source">&lt;${l.source}&gt;</span>
        <span class="log-msg">${l.message}</span>
      </div>
    `).join("");
  } catch (err) {
    console.error("Failed to fetch admin logs:", err);
  }
}

/**
 * 7. Fetch & Render Strategic Logistics Bottlenecks & Supply Chain Gaps (Req g)
 */
async function fetchLogisticsBottlenecks() {
  try {
    const resp = await fetch("/api/admin/bottlenecks");
    if (!resp.ok) return;
    const data = await resp.json();
    const container = document.getElementById("bottlenecks-cards-grid");
    if (!container) return;

    container.innerHTML = data.bottlenecks.map(b => {
      let sevColor = "#16a34a";
      if (b.severity === "CRITICAL") sevColor = "#dc2626";
      else if (b.severity === "HIGH") sevColor = "#ea580c";
      else if (b.severity === "MEDIUM") sevColor = "#d97706";

      return `
        <div class="probe-card" style="border-top: 3.5px solid ${sevColor};">
          <div class="probe-card-header">
            <div>
              <span style="font-size:10px; font-weight:800; color:${sevColor}; text-transform:uppercase; letter-spacing:0.05em;">
                ${b.severity} VULNERABILITY
              </span>
              <h4 style="margin:2px 0 0 0; font-size:14px; font-weight:700; color:#0f172a;">${b.name}</h4>
              <span style="font-size:11.5px; color:#64748b;">${b.corridor} (${b.state})</span>
            </div>
            <div style="text-align:right;">
              <span style="font-size:16px; font-weight:800; color:${sevColor};">+${b.delay_impact_hours} hrs</span>
              <div style="font-size:10px; color:#64748b;">Avg Delay Impact</div>
            </div>
          </div>

          <div style="margin:8px 0; font-size:12px; color:#334155; line-height:1.45;">
            <b>Root Cause:</b> ${b.root_cause}
          </div>

          <div style="background:#f8fafc; padding:8px; border-radius:6px; font-size:11.5px; color:#1e293b; margin-bottom:8px;">
            <span style="font-size:10.5px; font-weight:700; color:#64748b; text-transform:uppercase; display:block; margin-bottom:4px;">Affected Commodities:</span>
            <div style="display:flex; flex-wrap:wrap; gap:4px;">
              ${b.affected_commodities.map(c => `<span style="background:#e2e8f0; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:500;">${c}</span>`).join("")}
            </div>
          </div>

          <div style="background:rgba(2,132,199,0.08); border:1px solid rgba(2,132,199,0.25); border-radius:6px; padding:8px; font-size:11.5px; color:#0369a1; line-height:1.4;">
            🤖 <b>Strategic AI Mitigation:</b> ${b.mitigation}
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Failed to fetch bottlenecks:", err);
  }
}
