/**
 * Login & Identity Gateway Controller
 * Handles Unified Sign-In, New Registration, Free Simulated OTP Verification,
 * Alphanumeric Security Captcha, and Quick Evaluator Demo Logins.
 */

let currentCaptchaId = null;
let currentSimulatedOtp = null;
let otpVerified = false;

document.addEventListener("DOMContentLoaded", () => {
  setupAuthTabs();
  loadCaptcha();
  setupQuickDemoLogins();
  setupSignInForm();
  setupRegisterForm();
  setupForgotPasswordForm();
  setupOtpModal();
});

function showAlert(message, isError = true) {
  const alertBox = document.getElementById("auth-alert-box");
  if (!alertBox) return;
  alertBox.className = `auth-alert-box ${isError ? 'alert-error' : 'alert-success'}`;
  alertBox.innerText = message;
  alertBox.classList.remove("hidden");
  setTimeout(() => {
    alertBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 50);
}

function hideAlert() {
  const alertBox = document.getElementById("auth-alert-box");
  if (alertBox) alertBox.classList.add("hidden");
}

function setupAuthTabs() {
  document.querySelectorAll(".auth-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      hideAlert();
      document.querySelectorAll(".auth-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      document.querySelectorAll(".auth-pane").forEach(p => p.classList.add("hidden"));
      const target = document.getElementById(`auth-pane-${tab}`);
      if (target) target.classList.remove("hidden");
      if (tab === "register") loadCaptcha();
    });
  });

  const linkForgot = document.getElementById("link-forgot-pwd");
  if (linkForgot) {
    linkForgot.addEventListener("click", (e) => {
      e.preventDefault();
      const forgotTab = document.querySelector('.auth-tab-btn[data-tab="forgot"]');
      if (forgotTab) forgotTab.click();
    });
  }
}

async function loadCaptcha() {
  try {
    const resp = await fetch("/api/auth/captcha");
    const data = await resp.json();
    currentCaptchaId = data.captcha_id;
    const container = document.getElementById("captcha-svg-container");
    if (container) {
      container.innerHTML = data.captcha_svg;
    }
  } catch (err) {
    console.error("Failed to load captcha:", err);
  }
}

const btnReload = document.getElementById("btn-reload-captcha");
if (btnReload) {
  btnReload.addEventListener("click", loadCaptcha);
}

function setupQuickDemoLogins() {
  document.querySelectorAll(".demo-role-card").forEach(card => {
    card.addEventListener("click", async () => {
      const role = card.dataset.role;
      try {
        const resp = await fetch("/api/auth/demo-switch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role })
        });
        const res = await resp.json();
        if (res.success) {
          // Check URL for custom redirect
          const urlParams = new URLSearchParams(window.location.search);
          const redirect = urlParams.get("redirect") || res.redirect_url;
          window.location.href = redirect;
        } else {
          showAlert(res.error || "Demo login failed.");
        }
      } catch (err) {
        showAlert("Network connection error.");
      }
    });
  });
}

function setupSignInForm() {
  const form = document.getElementById("form-signin");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();
    const identifier = document.getElementById("signin-identifier").value.trim();
    const password = document.getElementById("signin-password").value;

    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });
      const res = await resp.json();
      if (res.success) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get("redirect") || res.redirect_url;
        window.location.href = redirect;
      } else {
        showAlert(res.error || "Invalid username, email, or password credentials.");
      }
    } catch (err) {
      showAlert("Authentication service unreachable. Please retry.");
    }
  });
}

function setupRegisterForm() {
  const roleSelect = document.getElementById("reg-role");
  const driverFields = document.getElementById("reg-driver-fields");
  const officerFields = document.getElementById("reg-officer-fields");

  if (roleSelect) {
    roleSelect.addEventListener("change", (e) => {
      const r = e.target.value;
      if (driverFields) driverFields.classList.toggle("hidden", r !== "driver");
      if (officerFields) officerFields.classList.toggle("hidden", r !== "officer");
    });
  }

  // Request OTP Button
  const btnRequestOtp = document.getElementById("btn-request-otp");
  if (btnRequestOtp) {
    btnRequestOtp.addEventListener("click", async () => {
      const phone = document.getElementById("reg-phone").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const contact = phone || email;

      if (!contact) {
        showAlert("Please enter your Email or Mobile Number first to receive verification code.");
        return;
      }

      try {
        const resp = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact })
        });
        const res = await resp.json();
        if (res.success) {
          currentSimulatedOtp = res.simulated_otp;
          document.getElementById("otp-input-row").classList.remove("hidden");
          showOtpModal(res.simulated_otp);
        }
      } catch (err) {
        showAlert("Failed to dispatch verification code.");
      }
    });
  }

  // Confirm OTP Button
  const btnConfirmOtp = document.getElementById("btn-confirm-otp");
  if (btnConfirmOtp) {
    btnConfirmOtp.addEventListener("click", async () => {
      const phone = document.getElementById("reg-phone").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const contact = phone || email;
      const code = document.getElementById("reg-otp-code").value.trim();

      if (!code) {
        showAlert("Please type the 6-digit OTP code.");
        return;
      }

      try {
        const resp = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact, code })
        });
        const res = await resp.json();
        if (res.verified) {
          otpVerified = true;
          const badge = document.getElementById("otp-status-badge");
          badge.classList.remove("hidden");
          showAlert("Contact number successfully verified via OTP.", false);
        } else {
          showAlert("Invalid or expired OTP code.");
        }
      } catch (err) {
        showAlert("Verification check failed.");
      }
    });
  }

  // Submit Registration Form
  const regForm = document.getElementById("form-register");
  if (regForm) {
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideAlert();

      const name = document.getElementById("reg-name").value.trim();
      const role = document.getElementById("reg-role").value;
      const email = document.getElementById("reg-email").value.trim();
      const phone = document.getElementById("reg-phone").value.trim();
      const password = document.getElementById("reg-password").value;
      const confirmPwd = document.getElementById("reg-confirm-pwd").value;
      const captchaCode = document.getElementById("reg-captcha-input").value.trim();

      if (password !== confirmPwd) {
        showAlert("Passwords do not match. Please re-enter.");
        return;
      }
      if (password.length < 6) {
        showAlert("Password must be at least 6 characters.");
        return;
      }

      const payload = {
        name,
        role,
        email,
        phone,
        password,
        captcha_id: currentCaptchaId,
        captcha_code: captchaCode
      };

      if (role === "driver") {
        payload.vehicle_class = document.getElementById("reg-veh-class").value;
        payload.vehicle_reg = document.getElementById("reg-veh-reg").value.trim();
      } else if (role === "officer") {
        payload.officer_id = document.getElementById("reg-officer-id").value.trim();
        payload.assigned_district = document.getElementById("reg-officer-district").value;
      }

      try {
        const resp = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const res = await resp.json();
        if (res.success) {
          window.location.href = res.redirect_url;
        } else {
          showAlert(res.error || "Registration could not be completed.");
          loadCaptcha();
        }
      } catch (err) {
        showAlert("Network error during registration.");
      }
    });
  }
}

function setupForgotPasswordForm() {
  const btnForgotSend = document.getElementById("btn-forgot-send-otp");
  if (btnForgotSend) {
    btnForgotSend.addEventListener("click", async () => {
      const contact = document.getElementById("forgot-contact").value.trim();
      if (!contact) {
        showAlert("Please enter your registered Email or Mobile Number.");
        return;
      }

      try {
        const resp = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact })
        });
        const res = await resp.json();
        if (res.success) {
          document.getElementById("forgot-reset-section").classList.remove("hidden");
          currentSimulatedOtp = res.simulated_otp;
          showOtpModal(res.simulated_otp);
        }
      } catch (err) {
        showAlert("Could not issue password reset OTP.");
      }
    });
  }

  const forgotForm = document.getElementById("form-forgot");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const contact = document.getElementById("forgot-contact").value.trim();
      const otp_code = document.getElementById("forgot-otp-code").value.trim();
      const new_password = document.getElementById("forgot-new-pwd").value;

      try {
        const resp = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact, otp_code, new_password })
        });
        const res = await resp.json();
        if (res.success) {
          // Switch to sign in tab
          const signinTab = document.querySelector('.auth-tab-btn[data-tab="signin"]');
          if (signinTab) signinTab.click();
          showAlert("Password successfully updated. You may now sign in.", false);
        } else {
          showAlert(res.error || "Failed to reset password.");
        }
      } catch (err) {
        showAlert("Network error updating password.");
      }
    });
  }
}

function showOtpModal(code) {
  const modal = document.getElementById("otp-simulation-modal");
  const codeBox = document.getElementById("modal-otp-code");
  if (modal && codeBox) {
    codeBox.innerText = code;
    modal.classList.remove("hidden");
  }
}

function setupOtpModal() {
  const modal = document.getElementById("otp-simulation-modal");
  const btnClose = document.getElementById("btn-close-otp-modal");
  const btnCopy = document.getElementById("btn-copy-otp");

  if (btnClose && modal) {
    btnClose.addEventListener("click", () => modal.classList.add("hidden"));
  }

  if (btnCopy && modal) {
    btnCopy.addEventListener("click", () => {
      const code = document.getElementById("modal-otp-code").innerText;
      const regInput = document.getElementById("reg-otp-code");
      const forgotInput = document.getElementById("forgot-otp-code");
      if (regInput && !regInput.closest(".auth-pane").classList.contains("hidden")) {
        regInput.value = code;
        const btnConfirm = document.getElementById("btn-confirm-otp");
        if (btnConfirm) btnConfirm.click();
      } else if (forgotInput) {
        forgotInput.value = code;
      }
      modal.classList.add("hidden");
    });
  }
}
