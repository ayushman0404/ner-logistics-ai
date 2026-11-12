/**
 * NER Logistics Intelligence Platform - Multilingual Emergency Notification Engine
 * Implements Problem Statement 26002 Requirement (h):
 * - Real-time regional safety broadcast alerts (East Jaintia Hills, NH-6, NH-29, etc.)
 * - Multilingual audio-visual announcements (Assamese, Hindi, Bengali, Manipuri, English)
 * - Browser Web Speech API regional synthesis + Web Audio warning chimes
 * - Telecom cell-broadcast SMS simulation in native regional dialects
 */

const EmergencyNotificationEngine = {
  activeAlerts: [],
  voiceMuted: false,
  audioCtx: null,

  init() {
    this.bindEvents();
    this.fetchAlerts();
    // Poll for emergency officer broadcasts every 12 seconds
    setInterval(() => this.fetchAlerts(), 12000);

    // Re-render text on regional language changes
    window.addEventListener("ner_language_changed", () => {
      this.renderNotificationTray();
      this.updateBannerLanguage();
    });
  },

  bindEvents() {
    const btnBell = document.getElementById("btn-notif-bell");
    const tray = document.getElementById("notif-dropdown");
    if (btnBell && tray) {
      btnBell.addEventListener("click", (e) => {
        e.stopPropagation();
        tray.classList.toggle("hidden");
      });

      document.addEventListener("click", (e) => {
        if (!tray.contains(e.target) && !btnBell.contains(e.target)) {
          tray.classList.add("hidden");
        }
      });
    }

    const btnVoice = document.getElementById("btn-toggle-voice");
    if (btnVoice) {
      btnVoice.addEventListener("click", (e) => {
        e.stopPropagation();
        this.voiceMuted = !this.voiceMuted;
        btnVoice.classList.toggle("muted", this.voiceMuted);
        const label = document.getElementById("voice-label");
        if (label) {
          label.innerText = this.voiceMuted ? (typeof t === "function" ? t("voice_alert_toggle", "Voice Alert") + " (Muted)" : "Voice Muted") : (typeof t === "function" ? t("voice_alert_toggle", "Voice Alert") : "Voice Alert");
        }
      });
    }

    const btnSimSms = document.getElementById("btn-sim-sms");
    if (btnSimSms) {
      btnSimSms.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showSmsModal();
      });
    }

    const btnCloseSms = document.getElementById("btn-close-sms-modal");
    if (btnCloseSms) {
      btnCloseSms.addEventListener("click", () => {
        const modal = document.getElementById("sms-simulation-modal");
        if (modal) modal.classList.add("hidden");
      });
    }

    // Emergency Banner Action Buttons
    const btnBannerDismiss = document.getElementById("btn-alert-dismiss");
    if (btnBannerDismiss) {
      btnBannerDismiss.addEventListener("click", () => {
        const banner = document.getElementById("emergency-alert-banner");
        if (banner) banner.classList.add("hidden");
      });
    }

    const btnBannerVoice = document.getElementById("btn-alert-voice");
    if (btnBannerVoice) {
      btnBannerVoice.addEventListener("click", () => {
        if (this.activeAlerts.length > 0) {
          this.announceAlert(this.activeAlerts[0]);
        }
      });
    }

    const btnBannerDivert = document.getElementById("btn-alert-divert");
    if (btnBannerDivert) {
      btnBannerDivert.addEventListener("click", () => {
        // Trigger auto-diversion to safe bypass
        if (typeof triggerRouteCalculation === "function") {
          const originInput = document.getElementById("origin-input");
          const destInput = document.getElementById("dest-input");
          if (originInput && destInput && (!originInput.value || !destInput.value)) {
            originInput.value = "Guwahati, Assam";
            destInput.value = "Silchar, Assam";
            if (typeof state !== "undefined") {
              state.origin = "Guwahati, Assam";
              state.destination = "Silchar, Assam";
            }
          }
          triggerRouteCalculation();
        }
      });
    }
  },

  async fetchAlerts() {
    try {
      const resp = await fetch("/api/officer/alerts");
      if (!resp.ok) return;
      const data = await resp.json();
      const alerts = data.alerts || [];
      const hadPrevious = this.activeAlerts.length > 0;
      this.activeAlerts = alerts;

      this.renderNotificationTray();
      this.updateBadge();

      // If active critical alert and banner is hidden, pop up emergency banner
      if (alerts.length > 0 && alerts[0].severity === "critical") {
        this.showEmergencyBanner(alerts[0], !hadPrevious);
      }
    } catch (err) {
      console.warn("Failed to query emergency broadcast alerts:", err);
    }
  },

  updateBadge() {
    const badge = document.getElementById("notif-badge");
    const countLabel = document.getElementById("notif-count-label");
    const count = this.activeAlerts.length;

    if (badge) {
      badge.innerText = count;
      badge.style.display = count > 0 ? "flex" : "none";
    }
    if (countLabel) {
      countLabel.innerText = `${count} ${typeof t === "function" ? t("notif_counter_active", "Active") : "Active"}`;
    }
  },

  renderNotificationTray() {
    const list = document.getElementById("notif-items-list");
    if (!list) return;

    if (this.activeAlerts.length === 0) {
      list.innerHTML = `<div class="notif-empty">${typeof t === "function" ? t("notif_title", "Highway Safety Alerts") : "No alerts active"}</div>`;
      return;
    }

    const currentL = (typeof currentLang !== "undefined") ? currentLang : (localStorage.getItem("ner_lang") || "en");

    list.innerHTML = this.activeAlerts.map(a => {
      // Localize message if standard landslide message
      let displayMsg = a.message;
      let displayTitle = a.title;
      if (typeof t === "function") {
        displayTitle = `⚠️ ${t("alert_emergency_prefix", a.title)}: ${a.district} (${a.target_highway})`;
        displayMsg = t("alert_divert_msg", a.message);
      }

      return `
        <div class="notif-item-card ${a.severity}">
          <div class="notif-item-header">
            <span class="notif-item-badge">${a.target_highway}</span>
            <span class="notif-item-time">${a.timestamp}</span>
          </div>
          <h4 class="notif-item-title">${displayTitle}</h4>
          <p class="notif-item-msg">${displayMsg}</p>
          <div class="notif-item-issuer">Officer: ${a.issued_by}</div>
        </div>
      `;
    }).join("");
  },

  showEmergencyBanner(alert, shouldChime = false) {
    const banner = document.getElementById("emergency-alert-banner");
    const heading = document.getElementById("alert-banner-heading");
    const msg = document.getElementById("alert-banner-msg");
    if (!banner || !heading || !msg) return;

    const prefix = typeof t === "function" ? t("alert_emergency_prefix", "EMERGENCY HIGHWAY BROADCAST") : "EMERGENCY HIGHWAY BROADCAST";
    const body = typeof t === "function" ? t("alert_divert_msg", alert.message) : alert.message;

    heading.innerText = `${prefix} • ${alert.target_highway} (${alert.district})`;
    msg.innerText = body;
    banner.classList.remove("hidden");

    if (shouldChime && !this.voiceMuted) {
      this.playAlertChime();
    }
  },

  updateBannerLanguage() {
    if (this.activeAlerts.length > 0) {
      const banner = document.getElementById("emergency-alert-banner");
      if (banner && !banner.classList.contains("hidden")) {
        this.showEmergencyBanner(this.activeAlerts[0], false);
      }
    }
  },

  playAlertChime() {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      // Tone 1: 587.33 Hz (D5)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Tone 2: 880 Hz (A5)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.18);
      gain2.gain.setValueAtTime(0.25, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.55);
    } catch (e) {
      // Audio not permitted without interaction
    }
  },

  announceAlert(alert) {
    this.playAlertChime();
    if (!window.speechSynthesis) return;

    const lang = (typeof currentLang !== "undefined") ? currentLang : (localStorage.getItem("ner_lang") || "en");
    let speechText = "";
    if (typeof t === "function") {
      speechText = `${t("alert_emergency_prefix", "Emergency Warning")}. ${t("alert_divert_msg", "Landslide ahead. Divert to valley bypass.")}`;
    } else {
      speechText = alert.message || "Emergency warning on highway.";
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Set regional BCP-47 language tag
    if (lang === "hi") utterance.lang = "hi-IN";
    else if (lang === "bn") utterance.lang = "bn-IN";
    else if (lang === "as") utterance.lang = "as-IN";
    else if (lang === "mn") utterance.lang = "mni-IN";
    else utterance.lang = "en-IN";

    window.speechSynthesis.speak(utterance);
  },

  showSmsModal() {
    const modal = document.getElementById("sms-simulation-modal");
    if (!modal) return;

    const lang = (typeof currentLang !== "undefined") ? currentLang : (localStorage.getItem("ner_lang") || "en");
    const langNames = {
      en: "English (EN)",
      as: "অসমীয়া / Assamese (AS)",
      hi: "हिंदी / Hindi (HI)",
      bn: "বাংলা / Bengali (BN)",
      mn: "মৈতৈলোন্ / Manipuri (MN)"
    };

    const smsText = typeof t === "function" ? t("sms_sample_text", "Govt of India Warning: NH-6 blocked. Divert to NH-27.") : "Govt of India Emergency Warning";
    const smsBox = document.getElementById("sms-preview-body");
    const smsLangBadge = document.getElementById("sms-lang-badge");

    if (smsBox) smsBox.innerText = smsText;
    if (smsLangBadge) smsLangBadge.innerText = langNames[lang] || lang;

    modal.classList.remove("hidden");
  }
};

// Initialize when DOM is ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => EmergencyNotificationEngine.init());
  } else {
    EmergencyNotificationEngine.init();
  }
}
