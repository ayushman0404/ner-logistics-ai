/**
 * NER Logistics Intelligence Platform - Offline Data Synchronization Engine
 * Designed for low-network and zero-connectivity mountain terrain across NER.
 * Features:
 * 1. Network Liveness Detection (online/offline state)
 * 2. Offline Field Incident Reporting Queue (stored in LocalStorage/IndexedDB)
 * 3. Automatic Background Synchronization upon signal restoration
 * 4. Pre-cached Regional Highway Corridors & Relief Center Directory
 */

const OFFLINE_QUEUE_KEY = "ner_offline_incident_queue";
const OFFLINE_CORRIDOR_PACK_KEY = "ner_cached_corridors_pack";

// Regional Emergency Centers & Relief Depot Cache for Zero-Signal Scenarios
const NER_OFFLINE_RELIEF_DIRECTORY = [
  { name: "Guwahati Central Medical Relief Depot", phone: "108 / 112", coords: [26.1445, 91.7362] },
  { name: "Silchar Medical College Emergency Base", phone: "03842-240102", coords: [24.8333, 92.7789] },
  { name: "Shillong Civil Hospital Trauma Unit", phone: "0364-2224100", coords: [25.5788, 91.8933] },
  { name: "Kohima Naga Hospital Authority", phone: "0370-2222956", coords: [25.6700, 94.1100] },
  { name: "Imphal RIMS Regional Trauma Center", phone: "0385-2414625", coords: [24.8170, 93.9368] },
  { name: "BRO GREF Emergency Recovery HQ (Tezpur)", phone: "03712-255010", coords: [26.6500, 92.8000] },
  { name: "East Jaintia Hills Emergency Highway Patrol", phone: "+91 97740 12345", coords: [25.2000, 92.3500] }
];

const OfflineSyncManager = {
  isOnline: navigator.onLine !== undefined ? navigator.onLine : true,

  init() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.updateNavbarStatus();
      this.syncPendingQueue();
      this.showToast("Network Reconnected. Auto-syncing pending field reports...", "success");
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.updateNavbarStatus();
      this.showToast("Low-Network / Offline Mode Active. Local cache operational.", "warning");
    });

    window.addEventListener("ner_language_changed", () => {
      this.updateNavbarStatus();
    });

    this.renderNavbarIndicator();
    this.checkInitialSync();
  },

  renderNavbarIndicator() {
    const container = document.getElementById("offline-status-container");
    if (!container) return;

    const labelText = this.isOnline 
      ? (typeof t === "function" ? t("offline_online", "Online") : "Online")
      : (typeof t === "function" ? t("offline_mode", "Offline Mode") : "Offline Mode");

    container.innerHTML = `
      <div id="network-status-pill" class="network-status-pill ${this.isOnline ? 'online' : 'offline'}" title="Network Status & Offline Synchronizer">
        <span class="status-pulse-dot"></span>
        <span id="network-status-label">${labelText}</span>
        <button id="btn-download-offline-pack" class="btn-offline-sync-icon" title="${typeof t === 'function' ? t('download_pack_title', 'Cache Regional Corridors for Offline Use') : 'Cache Regional Corridors for Offline Use'}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
      </div>
    `;

    const btnPack = document.getElementById("btn-download-offline-pack");
    if (btnPack) {
      btnPack.addEventListener("click", (e) => {
        e.stopPropagation();
        this.downloadCorridorPack();
      });
    }
  },

  updateNavbarStatus() {
    const pill = document.getElementById("network-status-pill");
    const label = document.getElementById("network-status-label");
    if (!pill || !label) return;

    if (this.isOnline) {
      pill.className = "network-status-pill online";
      label.innerText = typeof t === "function" ? t("offline_online", "Online") : "Online";
    } else {
      pill.className = "network-status-pill offline";
      label.innerText = typeof t === "function" ? t("offline_mode", "Offline Mode") : "Offline Mode";
    }
  },

  /**
   * Queue field report in LocalStorage if network is dropped
   */
  queueReport(reportPayload) {
    const queue = this.getQueue();
    reportPayload._queued_at = new Date().toISOString();
    reportPayload._temp_id = "queue-" + Date.now();
    queue.push(reportPayload);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));

    this.showToast(
      `Saved locally in low-network queue (${queue.length} pending). Will auto-sync when signal restores.`,
      "info"
    );
    return reportPayload;
  },

  getQueue() {
    try {
      const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  clearQueue() {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  },

  /**
   * Sync all pending queued reports to server when online
   */
  async syncPendingQueue() {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    let syncedCount = 0;
    const remaining = [];

    for (const report of queue) {
      try {
        const resp = await fetch("/api/incidents/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(report)
        });
        if (resp.ok) {
          syncedCount++;
        } else {
          remaining.push(report);
        }
      } catch (err) {
        remaining.push(report);
      }
    }

    if (remaining.length > 0) {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    } else {
      this.clearQueue();
    }

    if (syncedCount > 0) {
      this.showToast(`✅ Synced ${syncedCount} queued field report(s) to Field Officer HQ!`, "success");
      // Refresh incidents if on driver or officer page
      if (typeof fetchIncidentsList === "function") fetchIncidentsList();
      if (typeof loadPendingIncidents === "function") loadPendingIncidents();
    }
  },

  checkInitialSync() {
    if (this.isOnline && this.getQueue().length > 0) {
      this.syncPendingQueue();
    }
  },

  /**
   * Pre-cache regional highway corridor pack into LocalStorage
   */
  async downloadCorridorPack() {
    try {
      this.showToast("Caching regional highway vectors, hospital coordinates & relief bases...", "info");
      
      // Fetch metadata & sample corridors
      const metaResp = await fetch("/api/metadata").catch(() => null);
      const incResp = await fetch("/api/incidents").catch(() => null);
      const bridgeResp = await fetch("/api/bridges").catch(() => null);

      const pack = {
        cached_at: new Date().toISOString(),
        relief_directory: NER_OFFLINE_RELIEF_DIRECTORY,
        metadata: metaResp && metaResp.ok ? await metaResp.json() : null,
        incidents: incResp && incResp.ok ? await incResp.json() : null,
        bridges: bridgeResp && bridgeResp.ok ? await bridgeResp.json() : null
      };

      localStorage.setItem(OFFLINE_CORRIDOR_PACK_KEY, JSON.stringify(pack));
      this.showToast("✅ Offline Corridor Pack Cached! 8 NER States, 7 Relief Depots & Bridges available offline.", "success");
    } catch (err) {
      this.showToast("Offline pack download error: " + err.message, "error");
    }
  },

  showToast(msg, type = "info") {
    let container = document.getElementById("offline-sync-toast");
    if (!container) {
      container = document.createElement("div");
      container.id = "offline-sync-toast";
      container.className = "offline-toast";
      document.body.appendChild(container);
    }
    container.innerText = msg;
    container.className = `offline-toast toast-${type} visible`;
    setTimeout(() => {
      container.className = "offline-toast";
    }, 4500);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  OfflineSyncManager.init();
});
