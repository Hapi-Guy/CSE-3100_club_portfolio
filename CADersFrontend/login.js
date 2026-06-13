// ═══════════════════════════════════════════════════════
// LOGIN PAGE – Cookie utilities & authentication
// ═══════════════════════════════════════════════════════

var API_BASE = "https://localhost:44322";

// ─── Cookie Helpers ──────────────────────────────────

function getCookie(name) {
  var cookies = document.cookie.split(";");
  for (var i = 0; i < cookies.length; i++) {
    var c = cookies[i].trim();
    if (c.indexOf(name + "=") === 0) {
      return decodeURIComponent(c.substring(name.length + 1));
    }
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// ─── Auto-populate from Remember Me cookie ───────────

function initRememberMe() {
  var savedUsername = getCookie("Username");
  if (savedUsername) {
    var usernameInput = document.getElementById("login-username");
    if (usernameInput) {
      usernameInput.value = savedUsername;
    }
    // Also check the remember me checkbox
    var rememberCheckbox = document.getElementById("remember-me");
    if (rememberCheckbox) {
      rememberCheckbox.checked = true;
    }
  }
}

// ─── Show Last Visit banner ──────────────────────────

function initLastVisit() {
  var lastVisit = getCookie("LastVisit");
  if (lastVisit) {
    var banner = document.getElementById("last-visit-banner");
    var timeEl = document.getElementById("last-visit-time");
    if (banner && timeEl) {
      var date = new Date(lastVisit);
      timeEl.textContent = "Last Visit: " + date.toLocaleString();
      banner.style.display = "block";
    }
  }
}

// ─── Login form submission ───────────────────────────

function initLoginForm() {
  var form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var usernameInput = document.getElementById("login-username");
    var passwordInput = document.getElementById("login-password");
    var rememberCheckbox = document.getElementById("remember-me");
    var submitBtn = document.getElementById("login-submit");
    var btnText = document.getElementById("login-btn-text");
    var btnLoading = document.getElementById("login-btn-loading");
    var errorEl = document.getElementById("login-error");

    // Reset error
    errorEl.textContent = "";

    // Disable button
    submitBtn.disabled = true;
    btnText.style.display = "none";
    btnLoading.style.display = "inline";

    var loginData = {
      username: usernameInput.value.trim(),
      password: passwordInput.value,
      rememberMe: rememberCheckbox.checked
    };

    fetch(API_BASE + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(loginData)
    })
    .then(function (response) {
      if (response.status === 401) {
        throw new Error("Invalid username or password.");
      }
      if (!response.ok) {
        throw new Error("Server error (" + response.status + ")");
      }
      return response.json();
    })
    .then(function (data) {
      // Success – redirect to admin dashboard
      window.location.href = "admin.html";
    })
    .catch(function (error) {
      errorEl.textContent = error.message;
    })
    .finally(function () {
      submitBtn.disabled = false;
      btnText.style.display = "inline";
      btnLoading.style.display = "none";
    });
  });
}

// ─── Check if already logged in ──────────────────────

function checkExistingSession() {
  fetch(API_BASE + "/api/auth/status", {
    method: "GET",
    credentials: "include"
  })
  .then(function (response) { return response.json(); })
  .then(function (data) {
    if (data.authenticated) {
      window.location.href = "admin.html";
    }
  })
  .catch(function () {
    // Not logged in, stay on login page
  });
}

// ─── Init ────────────────────────────────────────────

window.addEventListener("load", function () {
  initRememberMe();
  initLastVisit();
  initLoginForm();
  checkExistingSession();
});
