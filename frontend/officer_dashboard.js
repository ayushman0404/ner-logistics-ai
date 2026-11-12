/**
 * Field Officer Operations Center Controller
 * Frontline Tactical Intervention, District Connectivity, Verification Queue,
 * Disaster Red Alert Broadcaster, and Essential Supplies Tracking.
 */

document.addEventListener("DOMContentLoaded", () => {
  loadOfficerProfile();
  setupOfficerPage();
  setupHeroicDirectives();
  refreshOfficerData();
});

async function loadOfficerProfile() {
  try {
    const resp = await fetch("/api/auth/current");
    const data = await resp.json();
    if (data.authenticated && data.user) {
      const nameEl = document.getElementById("officer-header-name");
      const deptEl = document.getElementById("officer-header-dept");
      if (nameEl) nameEl.innerText = data.user.name;
      if (deptEl && data.user.department) deptEl.innerText = data.user.department;

      // Show Admin link if user is administrator
      const adminLink = document.getElementById("officer-nav-admin-link");
      if (adminLink && data.user.role === "admin") {
        adminLink.classList.remove("hidden");
      }
    } else {
      window.location.href = "/login?redirect=/officer";
    }
  } catch (err) {
    console.error("Profile load error:", err);
  }
}

function setupOfficerPage() {
  // Mature Tab Switching
  document.querySelectorAll(".mature-tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".mature-tab-btn").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.tab;
      document.querySelectorAll(".dashboard-pane").forEach(p => p.classList.add("hidden"));
      const targetPane = document.getElementById(`officer-pane-${target}`);
      if (targetPane) {
        targetPane.classList.remove("hidden");
      }
    });
  });

  // Sign Out Button
  const btnLogout = document.getElementById("btn-officer-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      if (confirm("Sign out of Field Operations Center?")) {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {}
        window.location.href = "/login";
      }
    });
  }

  // Broadcast Alert Form Submit
  const alertForm = document.getElementById("broadcast-alert-form");
  if (alertForm) {
    alertForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("alert-input-title").value.trim();
      const district = document.getElementById("alert-select-district").value;
      const target_highway = document.getElementById("alert-input-highway").value.trim();
      const severity = document.getElementById("alert-select-severity").value;
      const message = document.getElementById("alert-input-message").value.trim();

      const payload = {
        title,
        district,
        target_highway: target_highway || "Regional Arterial",
        severity,
        message,
        issued_by: "Inspector M. Kharkongor (Meghalaya PWD)"
      };

      try {
        const resp = await fetch("/api/officer/broadcast-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const res = await resp.json();
        if (res.success) {
          alert(`Official Red Alert broadcasted: "${title}" transmitted to active convoys in ${district}.`);
          alertForm.reset();
          await fetchBroadcastAlerts();
        }
      } catch (err) {
        alert("Broadcast failed to dispatch. Check server connection.");
      }
    });
  }
}

function setupHeroicDirectives() {
  // Hero Action 1: Sector Lockdown
  const btnLockdown = document.getElementById("btn-hero-lockdown");
  if (btnLockdown) {
    btnLockdown.addEventListener("click", async () => {
      if (confirm("AUTHORIZE EMERGENCY SECTOR HALT: Issue immediate halt directive for multi-axle freight approaching NH-6 East Jaintia Hills?")) {
        try {
          const resp = await fetch("/api/officer/emergency-action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action_type: "lockdown",
              sector: "NH-6 East Jaintia Hills",
              details: "Severe active rockfall & heavy rainfall detected. Immediate halt directive transmitted to regional freight dispatchers."
            })
          });
          const res = await resp.json();
          alert(res.message);
          await refreshOfficerData();
        } catch (err) {
          alert("Emergency directive failed to transmit.");
        }
      }
    });
  }

  // Hero Action 2: Green Corridor Clearance
  const btnGreenCorridor = document.getElementById("btn-hero-greencorridor");
  if (btnGreenCorridor) {
    btnGreenCorridor.addEventListener("click", async () => {
      if (confirm("AUTHORIZE GREEN CORRIDOR: Clear emergency right-of-way for Liquid Medical Oxygen & vaccine convoys across NH-27/NH-29 corridors?")) {
        try {
          const resp = await fetch("/api/officer/emergency-action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action_type: "green_corridor",
              sector: "NH-27 / NH-29 Nagaon-Dimapur Corridor",
              details: "Priority Medical Green Corridor enacted. Commercial freight instructed to yield and clear passage for Oxygen Tanker AS-01-OX-9941."
            })
          });
          const res = await resp.json();
          alert(res.message);
          await refreshOfficerData();
        } catch (err) {
          alert("Emergency directive failed to transmit.");
        }
      }
    });
  }

  // Hero Action 3: Mountain Parking Bay Directives
  const btnParking = document.getElementById("btn-hero-parking");
  if (btnParking) {
    btnParking.addEventListener("click", async () => {
      if (confirm("DISPATCH PARKING BAY DIRECTIVE: Direct all trucks on mountain highways into engineered roadside bays with verified slope stability?")) {
        try {
          const resp = await fetch("/api/officer/emergency-action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action_type: "parking_directive",
              sector: "Regional Mountain Passes",
              details: "Heavy monsoonal cloudburst alert. All drivers directed to pull into reinforced concrete holding bays at KM 42, 68, and 104."
            })
          });
          const res = await resp.json();
          alert(res.message);
          await refreshOfficerData();
        } catch (err) {
          alert("Emergency directive failed to transmit.");
        }
      }
    });
  }
}

async function refreshOfficerData() {
  await Promise.all([
    fetchDistrictMatrix(),
    fetchPendingIncidents(),
    fetchBroadcastAlerts(),
    fetchEssentialSupplies()
  ]);
}

/**
 * 1. Fetch & Render District-Wise Connectivity Matrix
 */
async function fetchDistrictMatrix() {
  try {
    const resp = await fetch("/api/officer/districts");
    const data = await resp.json();
    const container = document.getElementById("district-matrix-grid");
    if (!container) return;

    container.innerHTML = data.districts.map(d => `
      <div class="district-status-card" style="border-left: 4px solid ${d.color};">
        <div class="district-card-header">
          <div>
            <h4 class="district-name">${d.district}</h4>
            <span class="district-state">${d.state} • ${d.primary_highway}</span>
          </div>
          <span class="status-pill" style="background:${d.color}15; color:${d.color}; border: 1px solid ${d.color}44;">
            ${d.badge}
          </span>
        </div>
        <div class="district-bottleneck-text">
          <b>Chokepoint:</b> ${d.bottleneck}
        </div>
        <div class="district-detour-text">
          <b>Detour Protocol:</b> ${d.recommended_detour}
        </div>
        <div class="district-card-footer">
          <span>Freight Load: <b>${d.active_trucks_affected} Convoys</b></span>
          <span class="passable-indicator ${d.passable ? 'text-green' : 'text-red'}">
            ${d.passable ? 'Passable' : 'Severely Impassable'}
          </span>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Failed to fetch district matrix:", err);
  }
}

/**
 * 2. Fetch & Render Pending Incidents Verification Queue
 */
async function fetchPendingIncidents() {
  try {
    const resp = await fetch("/api/officer/pending-incidents");
    const data = await resp.json();
    const container = document.getElementById("pending-incidents-queue");
    const badgeCount = document.getElementById("pending-queue-badge");
    const statPendingCount = document.getElementById("stat-pending-count");
    const officerQueueBadge = document.getElementById("officer-queue-badge");

    const pendingCount = (data.pending || []).length;

    if (badgeCount) {
      badgeCount.innerText = pendingCount;
      badgeCount.classList.toggle("hidden", pendingCount === 0);
    }
    if (statPendingCount) {
      statPendingCount.innerText = pendingCount;
    }
    if (officerQueueBadge) {
      officerQueueBadge.innerText = pendingCount;
      officerQueueBadge.classList.toggle("hidden", pendingCount === 0);
    }

    if (!container) return;

    if (pendingCount === 0) {
      container.innerHTML = `
        <div class="empty-queue-notice">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="margin-bottom:8px;">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
          <p>No unverified citizen reports pending. All regional corridors operating smoothly.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = data.pending.map(inc => `
      <div class="verification-incident-card">
        <div class="verif-card-header">
          <div class="verif-title-wrap">
            <div class="verif-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <h4 class="verif-title">${inc.title}</h4>
              <span class="verif-source">${inc.highway} • Reported by: <b>${inc.reported_by}</b> (${inc.created_at})</span>
            </div>
          </div>
          <span class="status-pill status-pill-pending">Pending Review</span>
        </div>
        <p class="verif-desc">${inc.description}</p>
        ${(inc.lat && inc.lon) ? `
          <div class="verif-geotag-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            <span>Latched GPS: ${typeof inc.lat === 'number' ? inc.lat.toFixed(4) : inc.lat}, ${typeof inc.lon === 'number' ? inc.lon.toFixed(4) : inc.lon} (Accuracy: ±${inc.geo_accuracy_m || 10}m)</span>
          </div>
        ` : ''}
        ${inc.photo_url ? `
          <div class="verif-photo-attachment">
            <span class="verif-attachment-label">📷 Ground Photograph Evidence:</span>
            <img src="${inc.photo_url}" alt="Incident Damage Evidence" class="verif-thumbnail" onclick="window.open('${inc.photo_url}', '_blank')" title="Click to inspect full photo" />
          </div>
        ` : ''}
        <div class="verif-actions-row">
          <button class="btn-verify-approve" data-id="${inc.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Approve & Broadcast to Map</span>
          </button>
          <button class="btn-verify-reject" data-id="${inc.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span>Reject (False Report)</span>
          </button>
        </div>
      </div>
    `).join("");

    container.querySelectorAll(".btn-verify-approve").forEach(btn => {
      btn.addEventListener("click", () => handleVerifyAction(btn.dataset.id, "approve"));
    });
    container.querySelectorAll(".btn-verify-reject").forEach(btn => {
      btn.addEventListener("click", () => handleVerifyAction(btn.dataset.id, "reject"));
    });
  } catch (err) {
    console.error("Failed to fetch pending incidents:", err);
  }
}

async function handleVerifyAction(incidentId, action) {
  try {
    const resp = await fetch("/api/officer/verify-incident", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: incidentId, action, officer_name: "Inspector M. Kharkongor" })
    });
    const res = await resp.json();
    if (res.success) {
      await fetchPendingIncidents();
      alert(`Report ${action === 'approve' ? 'APPROVED: Dispatched to live navigation map and rerouting engine.' : 'REJECTED and archived.'}`);
    }
  } catch (err) {
    alert("Verification action failed");
  }
}

/**
 * 3. Fetch & Render Emergency Red Alerts
 */
async function fetchBroadcastAlerts() {
  try {
    const resp = await fetch("/api/officer/alerts");
    const data = await resp.json();
    const container = document.getElementById("active-alerts-stream");
    const statAlertsCount = document.getElementById("stat-alerts-count");

    if (statAlertsCount && data.alerts) {
      statAlertsCount.innerText = data.alerts.length;
    }

    if (!container) return;

    if (!data.alerts || data.alerts.length === 0) {
      container.innerHTML = `<p style="color:#64748b; font-size:13px;">No active emergency broadcasts at this time.</p>`;
      return;
    }

    container.innerHTML = data.alerts.map(a => `
      <div class="broadcast-alert-card ${a.severity === 'critical' ? 'critical-border' : ''}">
        <div class="alert-top">
          <span class="alert-tag">${a.severity.toUpperCase()} ALERT</span>
          <span class="alert-time">${a.timestamp}</span>
        </div>
        <h4 class="alert-title">${a.title}</h4>
        <div class="alert-target"><b>Sector:</b> ${a.district} (${a.target_highway})</div>
        <p class="alert-body">${a.message}</p>
        <div class="alert-signer">Authorized by: <b>${a.issued_by}</b></div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Failed to fetch alerts:", err);
  }
}

/**
 * 4. Fetch & Render Essential Supplies Tracking
 */
async function fetchEssentialSupplies() {
  try {
    const resp = await fetch("/api/officer/supplies");
    const data = await resp.json();
    const tbody = document.getElementById("supplies-table-body");
    if (!tbody) return;

    tbody.innerHTML = data.supplies.map(s => `
      <tr>
        <td>
          <b>${s.cargo}</b><br/>
          <span class="supplies-sub">${s.category}</span>
        </td>
        <td>
          <code>${s.vehicle}</code><br/>
          <span class="supplies-sub">Driver: ${s.driver_phone}</span>
        </td>
        <td>
          ${s.origin} &rarr; <b>${s.destination}</b><br/>
          <span class="supplies-sub">Current: ${s.current_location}</span>
        </td>
        <td>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width: ${s.progress_pct}%;"></div>
          </div>
          <span class="supplies-sub">${s.progress_pct}% (${s.eta} left)</span>
        </td>
        <td>
          <span class="status-pill" style="color:${s.status_color}; background:${s.status_color}18; border:1px solid ${s.status_color}44;">
            ${s.status}
          </span>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Failed to fetch supplies:", err);
  }
}
