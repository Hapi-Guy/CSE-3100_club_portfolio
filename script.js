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
// INIT – Run when page loads
// ═══════════════════════════════════════════════════════
window.addEventListener("load", function () {
  initNavbar();
  initActiveLink();
  initSmoothScroll();
  initStats();
  initCardHover();
});
