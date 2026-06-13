var API_BASE = "https://localhost:44322";

// ═══════════════════════════════════════════════════════
// 1. NAVBAR – Mobile toggle
// ═══════════════════════════════════════════════════════
function initNavbar() {
  var toggle = document.getElementById("nav-toggle");
  var links = document.getElementById("nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      if (links.className.indexOf("open") === -1) {
        links.className = links.className + " open";
      } else {
        links.className = links.className.replace(" open", "");
      }
    });

    // Close menu when a link is clicked
    var navAnchors = links.querySelectorAll("a");
    for (var i = 0; i < navAnchors.length; i++) {
      navAnchors[i].addEventListener("click", function () {
        links.className = links.className.replace(" open", "");
      });
    }
  }
}

// ═══════════════════════════════════════════════════════
// 2. ACTIVE LINK TRACKING on scroll
// ═══════════════════════════════════════════════════════
function initActiveLink() {
  var sectionIds = ["hero", "about", "projects", "team", "contact"];
  var navLinks = document.getElementById("nav-links");
  if (!navLinks) return;

  window.addEventListener("scroll", function () {
    var scrollPos = window.scrollY + 200;

    for (var i = 0; i < sectionIds.length; i++) {
      var section = document.getElementById(sectionIds[i]);
      if (!section) continue;

      var link = navLinks.querySelector('a[href="#' + sectionIds[i] + '"]');
      if (!link) continue;

      // Check if scroll position is within this section
      var sectionTop = section.offsetTop;
      var sectionHeight = section.offsetHeight;

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        link.className = "active";
      } else {
        link.className = "";
      }
    }
  });
}

// ═══════════════════════════════════════════════════════
// 3. SMOOTH SCROLL (for anchor links)
// ═══════════════════════════════════════════════════════
function initSmoothScroll() {
  var allLinks = document.querySelectorAll('a[href^="#"]');

  for (var i = 0; i < allLinks.length; i++) {
    allLinks[i].addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      if (href === "#") return;

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      var offset = 72; // navbar height
      var targetTop = target.offsetTop - offset;

      window.scrollTo({
        top: targetTop,
        behavior: "smooth"
      });
    });
  }
}

// ═══════════════════════════════════════════════════════
// 4. STAT NUMBERS – Set values
// ═══════════════════════════════════════════════════════
function initStats() {
  var statData = [
    { id: "stat-members", value: 50 },
    { id: "stat-workshops", value: 15 },
    { id: "stat-events", value: 7 }
  ];

  for (var i = 0; i < statData.length; i++) {
    var el = document.getElementById(statData[i].id);
    if (el) {
      el.innerHTML = statData[i].value;
    }
  }
}

// ═══════════════════════════════════════════════════════
// 5. PROJECT CARD HOVER EFFECTS (using JS for interactivity)
// ═══════════════════════════════════════════════════════
function initCardHover() {
  var cards = document.querySelectorAll(".project-card");

  for (var i = 0; i < cards.length; i++) {
    cards[i].addEventListener("mouseenter", function () {
      this.style.borderColor = "rgba(0, 200, 83, 0.3)";
    });

    cards[i].addEventListener("mouseleave", function () {
      this.style.borderColor = "rgba(255, 255, 255, 0.04)";
    });
  }

  var teamCards = document.querySelectorAll(".team-card");

  for (var j = 0; j < teamCards.length; j++) {
    teamCards[j].addEventListener("mouseenter", function () {
      this.style.borderColor = "rgba(0, 200, 83, 0.3)";
    });

    teamCards[j].addEventListener("mouseleave", function () {
      this.style.borderColor = "rgba(255, 255, 255, 0.04)";
    });
  }
}

// ═══════════════════════════════════════════════════════
// 6. CONTACT FORM – Send message to backend via fetch()
// ═══════════════════════════════════════════════════════
function initContactForm() {
  // Grab the <form> element by its id
  var form = document.getElementById("contact-form");
  if (!form) return; // Safety check: exit if no form found

  // Listen for the form's "submit" event
  form.addEventListener("submit", function (e) {
    // Prevent the browser from reloading the page
    e.preventDefault();

    // ── Grab each input element ──
    var nameInput    = document.getElementById("contact-name");
    var emailInput   = document.getElementById("contact-email");
    var messageInput = document.getElementById("contact-message");
    var submitBtn    = document.getElementById("contact-submit");
    var btnText      = document.getElementById("btn-text");
    var btnLoading   = document.getElementById("btn-loading");
    var statusEl     = document.getElementById("form-status");

    // ── Switch button to loading state ──
    submitBtn.disabled       = true;
    btnText.style.display    = "none";
    btnLoading.style.display = "inline";
    statusEl.innerHTML       = "";
    statusEl.className       = "form-status"; // reset any success/error class

    // ── Build a plain JS object with the form values ──
    var formData = {
      name:    nameInput.value,
      email:   emailInput.value,
      message: messageInput.value
    };

    // ─────────────────────────────────────────────────────────
    // IMPORTANT: Change this URL to match the port that
    // Visual Studio assigns to your ASP.NET backend.
    // You can find the port in:
    //   Project Properties > Debug > App URL
    // or in the browser URL bar when the backend starts.
    // ─────────────────────────────────────────────────────────
    var apiUrl = API_BASE + "/api/Contact";

    // ── Send the POST request using fetch() ──
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"  // tell the server we're sending JSON
      },
      body: JSON.stringify(formData)          // convert our object to a JSON string
    })
    .then(function (response) {
      // Check if the server returned an error status code
      if (!response.ok) {
        throw new Error("Server returned status " + response.status);
      }
      return response.json(); // parse the JSON body
    })
    .then(function (data) {
      // ── SUCCESS: update the status message and alert the user ──
      statusEl.innerHTML  = "\u2713 Message sent successfully!";
      statusEl.className  = "form-status success";
      alert("Message sent successfully! Thank you for reaching out.");

      // Clear the form fields
      form.reset();
    })
    .catch(function (error) {
      // ── ERROR: show what went wrong ──
      statusEl.innerHTML  = "\u2717 Failed to send. Please try again.";
      statusEl.className  = "form-status error";
      alert("Error: " + error.message);
    })
    .finally(function () {
      // ── Always re-enable the button whether it succeeded or failed ──
      submitBtn.disabled       = false;
      btnText.style.display    = "inline";
      btnLoading.style.display = "none";
    });
  });
}

// ═══════════════════════════════════════════════════════
// 7. LOAD PROJECTS – Fetch from API and render cards
// ═══════════════════════════════════════════════════════
function loadProjects() {
  var apiUrl = API_BASE + "/api/projects";
  var grid = document.getElementById("projects-grid");
  if (!grid) return;

  fetch(apiUrl)
  .then(function (response) {
    if (!response.ok) throw new Error("Failed to load projects");
    return response.json();
  })
  .then(function (projects) {
    if (projects.length === 0) {
      grid.innerHTML = '<p style="color:#9a9ab0;text-align:center;padding:2rem;">No projects yet.</p>';
      return;
    }

    var html = "";
    for (var i = 0; i < projects.length; i++) {
      var p = projects[i];
      html += '<div class="project-card" id="project-' + p.id + '">';
      html += '  <div class="project-img">';
      if (p.imageUrl) {
        html += '    <img src="' + p.imageUrl + '" alt="' + p.title + '" />';
      }
      html += '  </div>';
      html += '  <div class="project-info">';
      html += '    <h3>' + p.title + '</h3>';
      html += '    <p>' + p.description + '</p>';
      html += '  </div>';
      html += '</div>';
    }
    grid.innerHTML = html;

    // Re-attach hover effects to new cards
    initCardHover();
  })
  .catch(function (err) {
    console.error("Error loading projects:", err);
    grid.innerHTML = '<p style="color:#9a9ab0;text-align:center;padding:2rem;">Failed to load projects.</p>';
  });
}

// ═══════════════════════════════════════════════════════
// 8. CHECK ADMIN STATUS – Show Admin link for authenticated admins
// ═══════════════════════════════════════════════════════
function checkAdminStatus() {
  fetch(API_BASE + "/api/auth/status", {
    method: "GET",
    credentials: "include"
  })
  .then(function (response) { return response.json(); })
  .then(function (data) {
    if (data.authenticated && data.role === "Admin") {
      var adminItem = document.getElementById("nav-admin-item");
      if (adminItem) {
        adminItem.style.display = "";
      }
    }
  })
  .catch(function () {
    // Not logged in or backend unreachable – admin link stays hidden
  });
}

// ═══════════════════════════════════════════════════════
// INIT – Run when page loads
// ═══════════════════════════════════════════════════════
window.addEventListener("load", function () {
  initNavbar();
  initActiveLink();
  initSmoothScroll();
  initStats();
  initCardHover();
  initContactForm();
  loadProjects();
  checkAdminStatus();
});
