// ═══════════════════════════════════════════════════════
// ADMIN DASHBOARD – JavaScript
// ═══════════════════════════════════════════════════════

var API_BASE = "https://localhost:44322";

// ─────────────────────────────────────────────────────────
// 1. AUTH CHECK – Removed. Admin panel is open access.
// ─────────────────────────────────────────────────────────
function checkAuth() {
  // Authentication removed – admin panel accessible directly by URL
  return Promise.resolve({ authenticated: true, username: "Admin", role: "Admin", visitCount: 0 });
}

// ─────────────────────────────────────────────────────────
// 2. SIDEBAR NAVIGATION
// ─────────────────────────────────────────────────────────
function initNavigation() {
  var navLinks = document.querySelectorAll(".sidebar-nav a");
  var pages = document.querySelectorAll(".admin-page");

  for (var i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener("click", function (e) {
      e.preventDefault();
      var pageName = this.getAttribute("data-page");

      // Update active link
      for (var j = 0; j < navLinks.length; j++) {
        navLinks[j].className = navLinks[j].className.replace(" active", "").replace("active", "");
      }
      this.className = this.className + " active";

      // Show corresponding page
      for (var k = 0; k < pages.length; k++) {
        pages[k].className = pages[k].className.replace(" active", "").replace("active", "");
      }
      var targetPage = document.getElementById("page-" + pageName);
      if (targetPage) {
        targetPage.className = targetPage.className + " active";
      }

      // Load data for the page
      if (pageName === "dashboard") loadDashboard();
      if (pageName === "projects") loadProjects();
      if (pageName === "messages") loadMessages();
    });
  }
}

// ─────────────────────────────────────────────────────────
// 3. LOGOUT
// ─────────────────────────────────────────────────────────
function initLogout() {
  var btn = document.getElementById("btn-logout");
  if (!btn) return;

  btn.addEventListener("click", function () {
    fetch(API_BASE + "/api/auth/logout", {
      method: "POST",
      credentials: "include"
    })
    .then(function () {
      window.location.href = "login.html";
    })
    .catch(function () {
      window.location.href = "login.html";
    });
  });
}

// ─────────────────────────────────────────────────────────
// 4. DASHBOARD – Load stats
// ─────────────────────────────────────────────────────────
function loadDashboard() {
  fetch(API_BASE + "/api/dashboard", {
    method: "GET",
    credentials: "include"
  })
  .then(function (response) { return response.json(); })
  .then(function (data) {
    document.getElementById("dash-username").textContent = data.username;
    document.getElementById("dash-role").textContent = data.role;
    document.getElementById("dash-projects").textContent = data.totalProjects;
    document.getElementById("dash-messages").textContent = data.totalMessages;
    document.getElementById("dash-visits").textContent = data.visitCount;
    document.getElementById("visit-count").textContent = data.visitCount;
  })
  .catch(function (err) {
    console.error("Dashboard load error:", err);
  });
}

// ─────────────────────────────────────────────────────────
// 5. PROJECTS – CRUD
// ─────────────────────────────────────────────────────────
var allProjects = [];

function loadProjects() {
  fetch(API_BASE + "/api/projects", {
    method: "GET",
    credentials: "include"
  })
  .then(function (response) { return response.json(); })
  .then(function (data) {
    allProjects = data;
    renderProjects(data);
  })
  .catch(function (err) {
    console.error("Projects load error:", err);
  });
}

function renderProjects(projects) {
  var tbody = document.getElementById("projects-tbody");

  if (projects.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No projects found.</td></tr>';
    return;
  }

  var html = "";
  for (var i = 0; i < projects.length; i++) {
    var p = projects[i];
    html += "<tr>";
    html += "<td>" + escapeHtml(String(p.id)) + "</td>";
    html += "<td>" + escapeHtml(p.title) + "</td>";
    html += '<td title="' + escapeHtml(p.description) + '">' + escapeHtml(truncate(p.description, 50)) + "</td>";
    html += "<td>" + escapeHtml(p.imageUrl || "—") + "</td>";
    html += "<td>";
    html += '<button class="btn-action" onclick="editProject(' + p.id + ')">Edit</button>';
    html += '<button class="btn-action btn-danger" onclick="deleteProject(' + p.id + ')">Delete</button>';
    html += "</td>";
    html += "</tr>";
  }
  tbody.innerHTML = html;
}

function initProjectSearch() {
  var searchInput = document.getElementById("project-search");
  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    var term = this.value.toLowerCase();
    var filtered = [];
    for (var i = 0; i < allProjects.length; i++) {
      if (allProjects[i].title.toLowerCase().indexOf(term) !== -1 ||
          allProjects[i].description.toLowerCase().indexOf(term) !== -1) {
        filtered.push(allProjects[i]);
      }
    }
    renderProjects(filtered);
  });
}

// ── Project Modal ──

function initProjectModal() {
  var addBtn = document.getElementById("btn-add-project");
  var cancelBtn = document.getElementById("btn-cancel-project");
  var modal = document.getElementById("project-modal");
  var form = document.getElementById("project-form");

  addBtn.addEventListener("click", function () {
    document.getElementById("project-modal-title").textContent = "Add Project";
    document.getElementById("project-edit-id").value = "";
    form.reset();
    modal.className = "modal-overlay active";
  });

  cancelBtn.addEventListener("click", function () {
    modal.className = "modal-overlay";
  });

  // Click outside to close
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.className = "modal-overlay";
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var editId = document.getElementById("project-edit-id").value;
    var projectData = {
      title: document.getElementById("project-title").value.trim(),
      description: document.getElementById("project-description").value.trim(),
      imageUrl: document.getElementById("project-image").value.trim()
    };

    var url = API_BASE + "/api/projects";
    var method = "POST";

    if (editId) {
      url = API_BASE + "/api/projects/" + editId;
      method = "PUT";
    }

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(projectData)
    })
    .then(function (response) {
      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
      }
      if (response.status === 403) {
        alert("Access denied. Admin role required.");
        return;
      }
      if (!response.ok) throw new Error("Save failed");
      return response.json();
    })
    .then(function (data) {
      if (data) {
        modal.className = "modal-overlay";
        loadProjects();
        loadDashboard();
      }
    })
    .catch(function (err) {
      alert("Error saving project: " + err.message);
    });
  });
}

function editProject(id) {
  // Find the project in our cached list
  var project = null;
  for (var i = 0; i < allProjects.length; i++) {
    if (allProjects[i].id === id) {
      project = allProjects[i];
      break;
    }
  }
  if (!project) return;

  document.getElementById("project-modal-title").textContent = "Edit Project";
  document.getElementById("project-edit-id").value = id;
  document.getElementById("project-title").value = project.title;
  document.getElementById("project-description").value = project.description;
  document.getElementById("project-image").value = project.imageUrl || "";

  document.getElementById("project-modal").className = "modal-overlay active";
}

function deleteProject(id) {
  if (!confirm("Are you sure you want to delete this project?")) return;

  fetch(API_BASE + "/api/projects/" + id, {
    method: "DELETE",
    credentials: "include"
  })
  .then(function (response) {
    if (response.status === 401) {
      alert("Session expired. Please log in again.");
      window.location.href = "login.html";
      return;
    }
    if (response.status === 403) {
      alert("Access denied. Admin role required.");
      return;
    }
    if (!response.ok) throw new Error("Delete failed");
    return response.json();
  })
  .then(function (data) {
    if (data) {
      loadProjects();
      loadDashboard();
    }
  })
  .catch(function (err) {
    alert("Error deleting project: " + err.message);
  });
}

// ─────────────────────────────────────────────────────────
// 6. MESSAGES – Read, View & Delete (Enhanced)
// ─────────────────────────────────────────────────────────
var allMessages = [];
var currentViewMessageId = null;

function loadMessages() {
  fetch(API_BASE + "/api/contact", {
    method: "GET",
    credentials: "include"
  })
  .then(function (response) {
    if (response.status === 401 || response.status === 403) {
      return [];
    }
    return response.json();
  })
  .then(function (data) {
    allMessages = data || [];
    renderMessages(allMessages);
    updateMessageCount(allMessages.length);
  })
  .catch(function (err) {
    console.error("Messages load error:", err);
    var tbody = document.getElementById("messages-tbody");
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Failed to load messages.</td></tr>';
    }
  });
}

function updateMessageCount(count) {
  var el = document.getElementById("message-count");
  if (el) {
    el.textContent = count + (count === 1 ? " message" : " messages");
  }
}

function formatRelativeTime(dateStr) {
  var date = new Date(dateStr);
  var now = new Date();
  var diffMs = now - date;
  var diffMins = Math.floor(diffMs / 60000);
  var diffHrs = Math.floor(diffMs / 3600000);
  var diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return diffMins + "m ago";
  if (diffHrs < 24) return diffHrs + "h ago";
  if (diffDays < 7) return diffDays + "d ago";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function renderMessages(messages) {
  var tbody = document.getElementById("messages-tbody");

  if (!messages || messages.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">' +
      '<div class="empty-state-icon">✉️</div>' +
      '<div>No messages found.</div>' +
      '</td></tr>';
    updateMessageCount(0);
    return;
  }

  updateMessageCount(messages.length);

  var html = "";
  for (var i = 0; i < messages.length; i++) {
    var m = messages[i];
    var fullDate = new Date(m.submittedAt).toLocaleString();
    var relTime = formatRelativeTime(m.submittedAt);

    html += '<tr class="msg-row" data-id="' + m.id + '">';
    html += '<td class="col-id">' + escapeHtml(String(m.id)) + '</td>';
    html += '<td class="col-name"><span class="msg-sender-name">' + escapeHtml(m.name) + '</span></td>';
    html += '<td class="col-email"><span class="msg-email-text">' + escapeHtml(m.email) + '</span></td>';
    html += '<td class="col-message"><span class="msg-preview" title="' + escapeHtml(m.message) + '">' + escapeHtml(truncate(m.message, 60)) + '</span></td>';
    html += '<td class="col-date"><span class="msg-time" title="' + escapeHtml(fullDate) + '">' + escapeHtml(relTime) + '</span></td>';
    html += '<td class="col-actions">';
    html += '<button class="btn-action btn-view" onclick="viewMessage(' + m.id + ')" title="View full message">View</button>';
    html += '<button class="btn-action btn-danger" onclick="deleteMessage(' + m.id + ')" title="Delete message">Delete</button>';
    html += '</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
}

function initMessageSearch() {
  var searchInput = document.getElementById("message-search");
  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    var term = this.value.toLowerCase();
    var filtered = [];
    for (var i = 0; i < allMessages.length; i++) {
      if (allMessages[i].name.toLowerCase().indexOf(term) !== -1 ||
          allMessages[i].email.toLowerCase().indexOf(term) !== -1 ||
          allMessages[i].message.toLowerCase().indexOf(term) !== -1) {
        filtered.push(allMessages[i]);
      }
    }
    renderMessages(filtered);
  });
}

// ── View Message Modal ──

function viewMessage(id) {
  var msg = null;
  for (var i = 0; i < allMessages.length; i++) {
    if (allMessages[i].id === id) {
      msg = allMessages[i];
      break;
    }
  }
  if (!msg) return;

  currentViewMessageId = id;

  document.getElementById("modal-msg-name").textContent = msg.name;
  document.getElementById("modal-msg-email").textContent = msg.email;
  document.getElementById("modal-msg-date").textContent = new Date(msg.submittedAt).toLocaleString();
  document.getElementById("modal-msg-body").textContent = msg.message;

  document.getElementById("message-modal").className = "modal-overlay active";
}

function closeMessageModal() {
  document.getElementById("message-modal").className = "modal-overlay";
  currentViewMessageId = null;
}

function initMessageModal() {
  var closeBtn = document.getElementById("btn-close-message");
  var dismissBtn = document.getElementById("btn-dismiss-message");
  var deleteBtn = document.getElementById("btn-delete-from-modal");
  var modal = document.getElementById("message-modal");

  if (closeBtn) closeBtn.addEventListener("click", closeMessageModal);
  if (dismissBtn) dismissBtn.addEventListener("click", closeMessageModal);

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeMessageModal();
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", function () {
      if (currentViewMessageId !== null) {
        closeMessageModal();
        deleteMessage(currentViewMessageId);
      }
    });
  }
}

function deleteMessage(id) {
  if (!confirm("Are you sure you want to delete this message?")) return;

  fetch(API_BASE + "/api/contact/" + id, {
    method: "DELETE",
    credentials: "include"
  })
  .then(function (response) {
    if (!response.ok) throw new Error("Delete failed");
    return response.json();
  })
  .then(function (data) {
    if (data) {
      loadMessages();
      loadDashboard();
    }
  })
  .catch(function (err) {
    alert("Error deleting message: " + err.message);
  });
}

// ─────────────────────────────────────────────────────────
// 7. UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
}

function truncate(str, maxLen) {
  if (!str) return "";
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen) + "...";
}

// ─────────────────────────────────────────────────────────
// 8. INIT
// ─────────────────────────────────────────────────────────
window.addEventListener("load", function () {
  initNavigation();
  initLogout();
  initProjectSearch();
  initMessageSearch();
  initProjectModal();
  initMessageModal();

  // Load initial data
  loadDashboard();
});
