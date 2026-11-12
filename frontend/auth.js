/**
 * Authentication and Role-Based Access Control (RBAC) Client Controller
 * Enforces session verification, role visibility, and logout termination.
 */

let currentUser = null;

async function initAuth() {
  try {
    const resp = await fetch("/api/auth/current");
    const data = await resp.json();
    if (!data.authenticated || !data.user) {
      // Unauthenticated, redirect to login page
      const currentPath = window.location.pathname;
      if (!currentPath.endsWith("login.html") && currentPath !== "/login") {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        return;
      }
    }
    currentUser = data.user;
    updateUserNavBadge();
  } catch (err) {
    console.error("Auth init error:", err);
  }
}

function updateUserNavBadge() {
  if (!currentUser) return;

  // Update Driver Portal Profile Badge
  const dName = document.getElementById("driver-nav-name");
  const dRole = document.getElementById("driver-nav-role");
  if (dName) dName.innerText = currentUser.name;
  if (dRole) dRole.innerText = currentUser.role_label || currentUser.role;

  // Adapt top navigation links according to Role
  const navOfficer = document.getElementById("nav-officer-link");
  const navAdmin = document.getElementById("nav-admin-link");

  if (currentUser.role === "admin") {
    if (navOfficer) navOfficer.classList.remove("hidden");
    if (navAdmin) navAdmin.classList.remove("hidden");
  } else if (currentUser.role === "officer") {
    if (navOfficer) navOfficer.classList.remove("hidden");
    if (navAdmin) navAdmin.classList.add("hidden");
  } else {
    // Driver or Citizen
    if (navOfficer) navOfficer.classList.add("hidden");
    if (navAdmin) navAdmin.classList.add("hidden");
  }
}

function setupAuthEventListeners() {
  // Driver Portal Logout
  const btnLogout = document.getElementById("btn-driver-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      if (confirm("Terminate session and return to secure gateway?")) {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {}
        window.location.href = "/login";
      }
    });
  }
}
