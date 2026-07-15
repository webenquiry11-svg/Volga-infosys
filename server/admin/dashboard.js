// ── HTML ESCAPE HELPER (prevents XSS / CWE-94) ─────────────
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s ?? '';
  return d.innerHTML;
}

// ── TOAST NOTIFICATIONS ─────────────────────────────────────
function showToast(title, message = '', type = 'info', duration = 5000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  // Limit visible toasts to 4
  const existing = container.querySelectorAll('.toast:not(.hiding)');
  if (existing.length >= 4) existing[0].dispatchEvent(new Event('animationend'));

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button class="toast-close" aria-label="Close toast">&times;</button>
  `;

  container.appendChild(toast);

  // Close button click handler
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => removeToast(toast));

  // Auto remove after duration
  let timer;
  if (duration > 0) {
    timer = setTimeout(() => removeToast(toast), duration);
  }

  function removeToast(el) {
    if (timer) clearTimeout(timer);
    el.classList.add('hiding');
    el.addEventListener('animationend', () => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
  }
}

// ── THEME TOGGLE ─────────────────────────────────────────
(function initTheme() {
  const saved = localStorage.getItem('volgaTheme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  }
  // Update dashboard sidebar label
  const label = document.getElementById('themeLabel');
  if (label) {
    label.textContent = saved === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
  // Update login page floating toggle icon
  const loginToggleIcon = document.getElementById('loginThemeIcon');
  if (loginToggleIcon && saved === 'dark') {
    loginToggleIcon.textContent = '☀️';
  }
})();

// ── MOBILE SIDEBAR TOGGLE ────────────────────────────────
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('open');
  });
}

if (sidebarCloseBtn) {
  sidebarCloseBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
  });
}

// Close sidebar when clicking a nav item on mobile
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 700) {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('open');
    }
  });
});

document.getElementById('themeToggle')?.addEventListener('click', async (e) => {
  // Check if View Transitions API is supported
  if (!document.startViewTransition) {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('volgaTheme', isDark ? 'dark' : 'light');
    const label = document.getElementById('themeLabel');
    if (label) label.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    return;
  }

  // Get click position
  const x = e.clientX;
  const y = e.clientY;

  // Calculate the maximum radius needed to cover the entire viewport
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y)
  );

  // Start the view transition
  const transition = document.startViewTransition(() => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('volgaTheme', isDark ? 'dark' : 'light');
    const label = document.getElementById('themeLabel');
    if (label) label.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  });

  // Wait for the transition to be ready
  await transition.ready;

  // Always animate the new root with expanding circle - consistent feel
  const keyframes = [
    { clipPath: `circle(0px at ${x}px ${y}px)` },
    { clipPath: `circle(${endRadius * 1.05}px at ${x}px ${y}px)` }, // Slight overshoot
    { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` }
  ];

  // Animate the new root with the clip-path
  document.documentElement.animate(keyframes, {
    duration: 550,
    easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
    pseudoElement: '::view-transition-new(root)'
  });
});

document.getElementById('loginThemeToggle')?.addEventListener('click', async (e) => {
  // Check if View Transitions API is supported
  if (!document.startViewTransition) {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('volgaTheme', isDark ? 'dark' : 'light');
    const icon = document.getElementById('loginThemeIcon');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
    return;
  }

  // Get click position
  const x = e.clientX;
  const y = e.clientY;

  // Calculate the maximum radius needed to cover the entire viewport
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y)
  );

  // Start the view transition
  const transition = document.startViewTransition(() => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('volgaTheme', isDark ? 'dark' : 'light');
    const icon = document.getElementById('loginThemeIcon');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
  });

  // Wait for the transition to be ready
  await transition.ready;

  // Always animate the new root with expanding circle - consistent feel
  const keyframes = [
    { clipPath: `circle(0px at ${x}px ${y}px)` },
    { clipPath: `circle(${endRadius * 1.05}px at ${x}px ${y}px)` }, // Slight overshoot
    { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` }
  ];

  // Animate the new root with the clip-path
  document.documentElement.animate(keyframes, {
    duration: 550,
    easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
    pseudoElement: '::view-transition-new(root)'
  });
});

const API = window.location.protocol.startsWith('http')
  ? `${window.location.origin}/api`
  : 'http://localhost:5000/api';

// Session handling defaults (must match server defaults)
const INACTIVITY_TIMEOUT_MS = parseInt(window.INACTIVITY_TIMEOUT_MS || String(30 * 60 * 1000)); // 30m
const SESSION_WARNING_MS = 60 * 1000; // 1 minute before expiry


// Toggle password visibility
function togglePasswordVisibility(inputId, button) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    button.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    `;
  } else {
    input.type = 'password';
    button.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    `;
  }
}

// ── RICH TEXT EDITORS ─────────────────────────────────────
let editors = {};

async function initEditors() {
  // Custom upload adapter for CKEditor
  class MyUploadAdapter {
    constructor(loader) {
      this.loader = loader;
    }

    upload() {
      return this.loader.file
        .then(file => new Promise((resolve, reject) => {
          this._initRequest();
          this._initListeners(resolve, reject, file);
          this._sendRequest(file);
        }));
    }

    abort() {
      if (this.xhr) {
        this.xhr.abort();
      }
    }

    _initRequest() {
      const xhr = this.xhr = new XMLHttpRequest();
      xhr.open('POST', `${API}/media/upload`, true);
      xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);
      xhr.responseType = 'json';
    }

    _initListeners(resolve, reject, file) {
      const xhr = this.xhr;
      const loader = this.loader;
      const genericErrorText = `Couldn't upload file: ${file.name}.`;

      xhr.addEventListener('error', () => reject(genericErrorText));
      xhr.addEventListener('abort', () => reject());
      xhr.addEventListener('load', () => {
        const response = xhr.response;

        if (!response || response.error) {
          return reject(response && response.error ? response.error.message : genericErrorText);
        }

        resolve({
          default: response.url
        });
      });

      if (xhr.upload) {
        xhr.upload.addEventListener('progress', evt => {
          if (evt.lengthComputable) {
            loader.uploadTotal = evt.total;
            loader.uploaded = evt.loaded;
          }
        });
      }
    }

    _sendRequest(file) {
      const data = new FormData();
      data.append('file', file);
      this.xhr.send(data);
    }
  }

  function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader);
    };
  }

  // Blog content editor - with full rich text and image support
  if (document.getElementById('bl-content')) {
    editors.blogContent = await ClassicEditor.create(document.getElementById('bl-content'), {
      extraPlugins: [MyCustomUploadAdapterPlugin],
      toolbar: [
        'heading', '|', 
        'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 
        'blockQuote', 'insertTable', 'imageUpload', '|', 
        'undo', 'redo'
      ],
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
          { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
          { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
        ]
      },
      image: {
        toolbar: ['imageTextAlternative', 'toggleImageCaption', '|', 'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight']
      }
    });
  }
  
  // Case study description editor
  if (document.getElementById('cs-description')) {
    editors.csDescription = await ClassicEditor.create(document.getElementById('cs-description'), {
      extraPlugins: [MyCustomUploadAdapterPlugin],
      toolbar: [
        'heading', '|', 
        'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 
        'blockQuote', 'insertTable', 'imageUpload', '|', 
        'undo', 'redo'
      ],
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
          { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
        ]
      },
      image: {
        toolbar: ['imageTextAlternative', 'toggleImageCaption', '|', 'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight']
      }
    });
  }
  
  // Client story testimonial editor
  if (document.getElementById('st-testimonial')) {
    editors.stTestimonial = await ClassicEditor.create(document.getElementById('st-testimonial'), {
      toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'blockQuote', '|', 'undo', 'redo'],
    });
  }
}

// ── AUTH HELPERS ──────────────────────────────────────────
const getToken = () => localStorage.getItem("volgaToken");
const setToken = (t) => localStorage.setItem("volgaToken", t);
const clearToken = () => localStorage.removeItem("volgaToken");

async function apiFetch(path, options = {}) {
  console.log("apiFetch called for:", path);
  console.log("Token:", getToken() ? "Present" : "Missing");
  
  const headers = {
    "Authorization": `Bearer ${getToken()}`,
  };
  
  // Only add Content-Type if body is not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  // Merge any additional headers
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  console.log("Request options:", { ...options, headers });
  
  const res = await fetch(API + path, {
    ...options,
    headers,
  });
  
  console.log("Response status:", res.status);
  
  if (res.status === 401) { 
    console.log("401 response - logging out");
    clearToken(); 
    location.href = "index.html"; 
    return null; 
  }
  
  const data = await res.json();
  console.log("Response data:", data);
  
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// ── LOGIN PAGE ────────────────────────────────────────────
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  if (getToken()) location.href = "dashboard.html";
  
  // Check for reset token in URL
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('reset');
  if (resetToken) {
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('resetPasswordCard').style.display = 'block';
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("loginBtn");
    const err = document.getElementById("loginError");
    btn.textContent = "Signing in…";
    btn.disabled = true;
    err.textContent = "";

    const data = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value,
      }),
    }).then((r) => r.json());

    if (data.token) {
      setToken(data.token);
      location.href = "dashboard.html";
    } else {
      err.textContent = data.message || "Login failed";
      btn.textContent = "Sign In";
      btn.disabled = false;
      showToast('Login Failed', data.message || 'Please check your credentials', 'error');
    }
  });
  
  // Forgot password link
  document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('forgotPasswordCard').style.display = 'block';
  });
  
  // Back to login from forgot
  document.getElementById('backToLoginFromForgot')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('forgotPasswordCard').style.display = 'none';
    document.getElementById('loginCard').style.display = 'block';
  });
  
  // Forgot password form submit
  document.getElementById('forgotPasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('forgotBtn');
    const err = document.getElementById('forgotError');
    const success = document.getElementById('forgotSuccess');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    err.textContent = '';
    success.textContent = '';
    
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: document.getElementById('forgotEmail').value })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Request failed');
      
      showToast('Email Sent', 'Password reset link has been sent to your email!', 'success');
    } catch (e) {
      showToast('Failed', e.message || 'Failed to send reset email', 'error');
    } finally {
      btn.textContent = 'Send Reset Link';
      btn.disabled = false;
    }
  });
  
  // Reset password form submit
  document.getElementById('resetPasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('resetBtn');
    const err = document.getElementById('resetError');
    btn.textContent = 'Resetting...';
    btn.disabled = true;
    err.textContent = '';
    
    const pwd1 = document.getElementById('resetPassword').value;
    const pwd2 = document.getElementById('resetConfirmPassword').value;
    
    if (pwd1 !== pwd2) {
      showToast('Validation Error', 'Passwords do not match', 'warning');
      btn.textContent = 'Reset Password';
      btn.disabled = false;
      return;
    }
    
    try {
      const res = await fetch(`${API}/auth/reset-password/${resetToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd1 })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      
      if (data.token) {
        showToast('Password Reset', 'Your password has been reset successfully!', 'success');
        setTimeout(() => {
          setToken(data.token);
          location.href = 'dashboard.html';
        }, 1000);
      }
    } catch (e) {
      showToast('Failed', e.message || 'Reset failed', 'error');
    } finally {
      btn.textContent = 'Reset Password';
      btn.disabled = false;
    }
  });
  
  // Apply for role link
  document.getElementById('applyRoleLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('applyRoleCard').style.display = 'block';
  });
  
  // Back to login from apply
  document.getElementById('backToLoginFromApply')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('applyRoleCard').style.display = 'none';
    document.getElementById('loginCard').style.display = 'block';
  });
  
  // Role application form submit
  document.getElementById('applyRoleForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('applyBtn');
    const err = document.getElementById('applyError');
    const success = document.getElementById('applySuccess');
    btn.textContent = 'Submitting...';
    btn.disabled = true;
    err.textContent = '';
    success.textContent = '';
    
    try {
      const res = await fetch(`${API}/auth/role-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName: document.getElementById('applicantName').value,
          applicantEmail: document.getElementById('applicantEmail').value,
          requestedRole: document.getElementById('requestedRole').value,
          reason: document.getElementById('applyReason').value
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Submission failed');
      
      showToast('Application Submitted', 'Application submitted successfully! We will review it shortly.', 'success');
    } catch (e) {
      showToast('Submission Failed', e.message || 'Submission failed', 'error');
    } finally {
      btn.textContent = 'Submit Application';
      btn.disabled = false;
    }
  });
  

}

// ── DASHBOARD PAGE ────────────────────────────────────────
if (document.getElementById("logoutBtn")) {
  if (!getToken()) location.href = "index.html";

  // Today date
  document.getElementById("todayDate").textContent = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      clearToken();
      // Replace history entry so back button won't return to authenticated dashboard
      location.replace("index.html");
    }
  });

  // Session keepalive & inactivity watcher
  let lastInteraction = Date.now();
  function resetInteraction() { lastInteraction = Date.now(); }
  ['click','mousemove','keydown','touchstart'].forEach(ev => window.addEventListener(ev, resetInteraction));

  async function extendSession() {
    try {
      await apiFetch('/auth/sessions/extend', { method: 'POST' });
      lastInteraction = Date.now();
      showToast('Session extended', 'Your session has been extended', 'success', 1500);
    } catch (e) {
      console.warn('Failed to extend session', e);
    }
  }

  // Periodic check for inactivity and warning
  setInterval(() => {
    const now = Date.now();
    const idle = now - lastInteraction;
    const timeLeft = INACTIVITY_TIMEOUT_MS - idle;
    if (timeLeft <= 0) {
      // Force logout
      clearToken();
      showToast('Session expired', 'You have been logged out due to inactivity', 'warning');
      setTimeout(() => location.replace('index.html'), 900);
    } else if (timeLeft <= SESSION_WARNING_MS) {
      // Show a simple confirm-based warning to extend
      if (!document.getElementById('sessionWarningShown')) {
        const keep = confirm('Your session is about to expire. Stay signed in?');
        const el = document.createElement('div'); el.id = 'sessionWarningShown'; el.style.display='none'; document.body.appendChild(el);
        if (keep) {
          extendSession();
        }
      }
    }
  }, 5000);

  // Sidebar nav
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
        document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
        item.classList.add("active");
        document.getElementById(`view-${item.dataset.view}`).classList.add("active");
        if (item.dataset.view === "leads") loadLeads();
        if (item.dataset.view === "portfolio") loadPortfolio();
        if (item.dataset.view === "clientstories") loadClientStories();
        if (item.dataset.view === "blog") loadBlogs();
        if (item.dataset.view === "casestudies") loadCaseStudies();
        if (item.dataset.view === "industrynews") loadIndustryNews();
        if (item.dataset.view === "medialibrary") loadMediaLibrary();
        if (item.dataset.view === "emaillogs") loadEmailLogs();
        if (item.dataset.view === "settings") loadCurrentUser();
        if (item.dataset.view === "analytics") loadAnalytics();
        if (item.dataset.view === "jobs") loadJobs();
        if (item.dataset.view === "jobapplications") loadJobApplications();
      });
    });

  // ── OVERVIEW ───────────────────────────────────────────
  async function loadOverview() {
    const data = await apiFetch("/dashboard/stats");

    document.getElementById("statProjects").textContent = data.projectsCount ?? 0;
    const statusMap = {};
    (data.byStatus || []).forEach((s) => (statusMap[s._id] = s.count));
    document.getElementById("statNew").textContent = statusMap.new ?? 0;
    document.getElementById("statEmails").textContent = data.emailStats?.total ?? 0;
    document.getElementById("statBlogs").textContent = data.blogsCount ?? 0;
    document.getElementById("statCaseStudies").textContent = data.caseStudiesCount ?? 0;
    document.getElementById("statIndustryNews").textContent = data.industryNewsCount ?? 0;

    // Service bars
    const bars = document.getElementById("serviceBars");
    bars.innerHTML = "";
    const services = (data.byService || []).filter((s) => s._id).sort((a, b) => b.count - a.count);
    const max = services[0]?.count || 1;
    services.forEach((s) => {
      bars.innerHTML += `
        <div class="bar-row">
          <span class="bar-label">${s._id}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${(s.count / max) * 100}%"></div></div>
          <span class="bar-count">${s.count}</span>
        </div>`;
    });

    // Recent leads (first page)
    const recent = await apiFetch("/dashboard/contacts?limit=5");
    renderTable(document.querySelector("#recentTable tbody"), recent.contacts, true);

    // Recent Projects
    const projects = await apiFetch("/projects");
    const overviewView = document.getElementById('view-overview');
    // Remove previous recent sections if they exist
    const existingRecentSections = overviewView.querySelectorAll('.recent-section');
    existingRecentSections.forEach(el => el.remove());
    
    // Add Recent Projects
    if (projects.length > 0) {
      const recentProjectsWrapper = document.createElement('div');
      recentProjectsWrapper.className = 'recent-section';
      recentProjectsWrapper.innerHTML = `
        <div class="section-title" style="margin-top:2rem">Recent Projects</div>
        <div class="proj-grid" style="margin-top:1rem">
          ${projects.slice(0,3).map(p => `
            <div class="proj-card">
              <div class="proj-card-img" style="background-image:url('${esc(p.image)}')"></div>
              <div class="proj-card-body">
                <span class="proj-tag">${esc(p.tag)}</span>
                <div class="proj-title">${esc(p.title)}${p.title2 ? ' ' + esc(p.title2) : ''}</div>
                <div class="proj-place">${esc(p.place)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      overviewView.appendChild(recentProjectsWrapper);
    }

    // Recent Blog Posts
    const blogData = await apiFetch('/blogs/admin/all');
    const blogs = blogData?.data || blogData;
    if (blogs && blogs.length > 0) {
      const recentBlogsWrapper = document.createElement('div');
      recentBlogsWrapper.className = 'recent-section';
      recentBlogsWrapper.innerHTML = `
        <div class="section-title" style="margin-top:2rem">Recent Blog Posts</div>
        <div class="proj-grid" style="margin-top:1rem">
          ${blogs.slice(0,3).map(b => `
            <div class="proj-card">
              <div class="proj-card-img" style="background-image:url('${esc(b.coverImage || b.image)}')"></div>
              <div class="proj-card-body">
                <span class="proj-tag">${esc(b.category)}</span>
                <div class="proj-title">${esc(b.title)}</div>
                <div class="proj-place">${esc(b.author)} &middot; ${esc(b.readTime)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      overviewView.appendChild(recentBlogsWrapper);
    }

    // Recent email logs (if provided)
    if (data.emailStats && data.emailStats.recent) {
      const list = data.emailStats.recent.map(e => `
        <tr>
          <td>${new Date(e.createdAt).toLocaleString()}</td>
          <td>${esc(e.from)}</td>
          <td>${esc(e.to)}</td>
          <td>${esc((e.subject||'').slice(0,60))}</td>
          <td><span class="badge badge-${esc(e.status)}">${esc(e.status)}</span></td>
        </tr>`).join('');
      const wrapper = document.createElement('div');
      wrapper.className = 'section-title recent-section';
      wrapper.innerHTML = '<div style="margin-top:2rem">Recent Email Activity</div>';
      document.getElementById('view-overview').appendChild(wrapper);
      const tbl = document.createElement('div'); tbl.className='table-wrap recent-section'; tbl.innerHTML = `<table class="leads-table"><thead><tr><th>Date</th><th>From</th><th>To</th><th>Subject</th><th>Status</th></tr></thead><tbody>${list}</tbody></table>`;
      document.getElementById('view-overview').appendChild(tbl);
    }
  }

  // ── LEADS TABLE ────────────────────────────────────────
  let currentPage = 1;
  let currentEmailPage = 1;

  async function loadLeads(page = 1) {
    currentPage = page;
    const status = document.getElementById("statusFilter").value;
    const searchQuery = document.getElementById("searchInput").value;
    
    let data;
    if (searchQuery) {
      const query = `?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=15${status ? `&status=${status}` : ""}`;
      data = await apiFetch(`/dashboard/contacts/search${query}`);
    } else {
      const query = `?page=${page}&limit=15${status ? `&status=${status}` : ""}`;
      data = await apiFetch(`/dashboard/contacts${query}`);
    }
    renderTable(document.querySelector("#leadsTable tbody"), data.contacts, false);
    renderPagination(data.pages, page);
  }

  // Search and Export listeners
  let searchTimeout;
  document.getElementById("searchInput")?.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => loadLeads(1), 300);
  });
  document.getElementById("statusFilter")?.addEventListener("change", () => loadLeads(1));
  document.getElementById("exportBtn")?.addEventListener("click", async () => {
    const token = getToken();
    const response = await fetch(`${API}/dashboard/contacts/export`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
  document.getElementById("emailTypeFilter")?.addEventListener("change", () => loadEmailLogs(1));
  document.getElementById("emailStatusFilter")?.addEventListener("change", () => loadEmailLogs(1));
  document.getElementById("deleteAllLogsBtn")?.addEventListener("click", async () => {
    if (!confirm("Delete all email logs? This cannot be undone.")) return;
    try {
      await apiFetch("/dashboard/emails", { method: "DELETE" });
      showToast('Email Logs Deleted', 'All email logs have been cleared', 'success');
      loadEmailLogs(1);
    } catch (e) {
      showToast('Delete Failed', e.message || 'Could not delete email logs', 'error');
    }
  });

  function renderTable(tbody, contacts, compact) {
    tbody.innerHTML = "";
    if (!contacts?.length) {
      tbody.innerHTML = `<tr><td colspan="10" class="empty">No leads found</td></tr>`;
      return;
    }
    contacts.forEach((c) => {
      const row = document.createElement("tr");
      row.innerHTML = compact
        ? `<td>${esc(c.name)}</td><td>${esc(c.email)}</td><td>${esc(c.country) || "—"}</td><td>${esc(c.serviceInterested) || "—"}</td><td><span class="badge badge-${esc(c.status)}">${esc(c.status)}</span></td><td>${fmtDate(c.createdAt)}</td>`
        : `<td>${esc(c.name)}</td><td>${esc(c.email)}</td><td>${esc(c.company) || "—"}</td><td>${esc(c.country) || "—"}</td><td>${esc(c.budget) || "—"}</td><td>${esc(c.serviceInterested) || "—"}</td><td class="msg-cell">${esc(c.message)}</td><td><span class="badge badge-${esc(c.status)}">${esc(c.status)}</span></td><td>${fmtDate(c.createdAt)}</td><td><button class="btn-view" data-id="${esc(c._id)}">View</button></td>`;
      tbody.appendChild(row);
    });
    if (!compact) {
      tbody.querySelectorAll(".btn-view").forEach((btn) => {
        btn.addEventListener("click", () => openModal(contacts.find((c) => c._id === btn.dataset.id)));
      });
    }
  }

  function renderPagination(pages, current) {
    const el = document.getElementById("pagination");
    el.innerHTML = "";
    for (let i = 1; i <= pages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = `page-btn${i === current ? " active" : ""}`;
      btn.addEventListener("click", () => loadLeads(i));
      el.appendChild(btn);
    }
  }

  // ── EMAIL LOGS ────────────────────────────────────────
  async function loadEmailLogs(page = 1) {
    currentEmailPage = page;
    const limit = 20;
    const type = document.getElementById('emailTypeFilter')?.value;
    const status = document.getElementById('emailStatusFilter')?.value;
    const query = `?page=${page}&limit=${limit}${type ? `&type=${encodeURIComponent(type)}` : ''}${status ? `&status=${encodeURIComponent(status)}` : ''}`;
    const data = await apiFetch(`/dashboard/emails${query}`);
    const tbody = document.querySelector('#emailLogsTable tbody');
    tbody.innerHTML = '';
    if (!data || !data.emails || !data.emails.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty">No email logs found</td></tr>`;
      document.getElementById('emailPagination').innerHTML = '';
      return;
    }
    data.emails.forEach(e => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${fmtDate(e.createdAt)} ${new Date(e.createdAt).toLocaleTimeString()}</td>
        <td>${esc(e.from)}</td>
        <td>${esc(e.to)}</td>
        <td>${esc((e.subject||'').slice(0,80))}</td>
        <td>${esc(e.type)}</td>
        <td><span class="badge badge-${esc(e.status)}">${esc(e.status)}</span></td>
        <td><button class="btn-delete btn-delete-log" data-id="${esc(e._id)}">Delete</button></td>
      `;
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.btn-delete-log').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this email log?')) return;
        await apiFetch(`/dashboard/emails/${btn.dataset.id}`, { method: 'DELETE' });
        loadEmailLogs(currentEmailPage);
      });
    });
    // pagination
    const pages = data.pages || 1;
    const pagEl = document.getElementById('emailPagination');
    pagEl.innerHTML = '';
    for (let i = 1; i <= pages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = `page-btn${i === page ? ' active' : ''}`;
      btn.addEventListener('click', () => loadEmailLogs(i));
      pagEl.appendChild(btn);
    }
  }

  // ── MODAL ──────────────────────────────────────────────
  let activeContact = null;

  async function loadNotes(contactId) {
    const notes = await apiFetch(`/dashboard/contacts/${contactId}/notes`);
    const notesList = document.getElementById("notesList");
    if (!notes.length) {
      notesList.innerHTML = '<p style="color:#888;">No notes yet.</p>';
      return;
    }
    notesList.innerHTML = notes.map(note => `
      <div style="padding:0.75rem; border:1px solid #eee; border-radius:6px; margin-bottom:0.5rem;">
        <p style="margin:0 0 0.5rem;">${esc(note.content)}</p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; color:#888;">${new Date(note.createdAt).toLocaleString()}</span>
          <button class="btn-delete" style="font-size:0.8rem; padding:4px 8px;" data-note-id="${esc(note._id)}">Delete</button>
        </div>
      </div>
    `).join('');
    notesList.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this note?')) return;
        try {
          await apiFetch(`/dashboard/contacts/${activeContact._id}/notes/${btn.dataset.noteId}`, { method: 'DELETE' });
          showToast('Note Deleted', 'The note has been removed', 'success');
          loadNotes(activeContact._id);
        } catch (e) {
          showToast('Delete Failed', e.message || 'Could not delete note', 'error');
        }
      });
    });
  }

  function openModal(contact) {
    activeContact = contact;
    document.getElementById("modalName").textContent = contact.name;
    document.getElementById("modalGrid").innerHTML = `
      <div><span>Email</span><strong>${esc(contact.email)}</strong></div>
      <div><span>Company</span><strong>${esc(contact.company) || "—"}</strong></div>
      <div><span>Country</span><strong>${esc(contact.country) || "—"}</strong></div>
      <div><span>Service</span><strong>${esc(contact.serviceInterested) || "—"}</strong></div>
      <div><span>Budget</span><strong>${esc(contact.budget) || "—"}</strong></div>
      <div><span>Date</span><strong>${fmtDate(contact.createdAt)}</strong></div>`;
    document.getElementById("modalMessage").textContent = contact.message;
    document.getElementById("modalStatus").value = contact.status;
    document.getElementById("tagsInput").value = (contact.tags || []).join(', ');
    document.getElementById("followUpDate").value = contact.followUpDate ? contact.followUpDate.split('T')[0] : '';
    loadNotes(contact._id);
    document.getElementById("modalOverlay").classList.add("open");
  }

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  function closeModal() {
    document.getElementById("modalOverlay").classList.remove("open");
    activeContact = null;
  }

  document.getElementById("modalSave").addEventListener("click", async () => {
    if (!activeContact) return;
    const status = document.getElementById("modalStatus").value;
    const tags = document.getElementById("tagsInput").value.split(',').map(t => t.trim()).filter(t => t);
    const followUpDate = document.getElementById("followUpDate").value;
    try {
      await apiFetch(`/dashboard/contacts/${activeContact._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, tags, followUpDate }),
      });
      showToast('Lead Updated', 'The lead has been successfully updated', 'success');
      closeModal();
      loadLeads(currentPage);
    } catch (e) {
      showToast('Update Failed', e.message || 'Failed to update lead', 'error');
    }
  });

  document.getElementById("addNoteBtn").addEventListener("click", async () => {
    const content = document.getElementById("newNote").value.trim();
    if (!content) return;
    try {
      await apiFetch(`/dashboard/contacts/${activeContact._id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      showToast('Note Added', 'Your note has been added successfully', 'success');
      document.getElementById("newNote").value = '';
      loadNotes(activeContact._id);
    } catch (e) {
      showToast('Failed to Add Note', e.message || 'Could not add note', 'error');
    }
  });

  document.getElementById("modalDelete").addEventListener("click", async () => {
    if (!activeContact || !confirm("Delete this lead?")) return;
    try {
      await apiFetch(`/dashboard/contacts/${activeContact._id}`, { method: "DELETE" });
      showToast('Lead Deleted', 'The lead has been removed', 'success');
      closeModal();
      loadLeads(currentPage);
      loadOverview();
    } catch (e) {
      showToast('Delete Failed', e.message || 'Could not delete lead', 'error');
    }
  });

  // Initialize rich text editors
  initEditors();
  // ── INIT ───────────────────────────────────────────────
  loadOverview();

  // ── PORTFOLIO ──────────────────────────────────────────
  let editingProjectId = null;

  async function loadPortfolio() {
    const projects = await apiFetch("/projects");
    const grid = document.getElementById("projGrid");
    if (!projects.length) {
      grid.innerHTML = `<p class="empty" style="padding:2rem">No projects yet. Click + Add Project to get started.</p>`;
      return;
    }
    grid.innerHTML = projects.map(p => `
      <div class="proj-card">
        <div class="proj-card-img" style="background-image:url('${esc(p.image)}')"></div>
        <div class="proj-card-body">
          <span class="proj-tag">${esc(p.tag)}</span>
          <div class="proj-title">${esc(p.title)}${p.title2 ? ' ' + esc(p.title2) : ''}</div>
          <div class="proj-place">${esc(p.place)}</div>
          <p class="proj-desc">${esc(p.description)}</p>
          <a class="btn-view" href="project-edit.html?id=${esc(p._id)}">Edit</a>
        </div>
      </div>`).join("");
  }

  function openProjectModal(project = null) {
    editingProjectId = project?._id || null;
    document.getElementById("projectModalTitle").textContent = project ? "Edit Project" : "Add Project";
    document.getElementById("pf-place").value   = project?.place       || "";
    document.getElementById("pf-tag").value     = project?.tag         || "";
    document.getElementById("pf-title").value   = project?.title       || "";
    document.getElementById("pf-title2").value  = project?.title2      || "";
    document.getElementById("pf-desc").value    = project?.description || "";
    document.getElementById("pf-image").value   = project?.image       || "";
    document.getElementById("pf-order").value   = project?.order       ?? 0;
    document.getElementById("projectFormError").textContent = "";
    document.getElementById("projectDeleteBtn").style.display = project ? "" : "none";
    document.getElementById("projectModalOverlay").classList.add("open");
  }

 
  document.getElementById("projectModalClose").addEventListener("click", () =>
    document.getElementById("projectModalOverlay").classList.remove("open")
  );
  document.getElementById("projectModalOverlay").addEventListener("click", e => {
    if (e.target === e.currentTarget) document.getElementById("projectModalOverlay").classList.remove("open");
  });

  document.getElementById("projectSaveBtn").addEventListener("click", async () => {
    const body = {
      place:       document.getElementById("pf-place").value.trim(),
      tag:         document.getElementById("pf-tag").value.trim(),
      title:       document.getElementById("pf-title").value.trim(),
      title2:      document.getElementById("pf-title2").value.trim(),
      description: document.getElementById("pf-desc").value.trim(),
      image:       document.getElementById("pf-image").value.trim(),
      order:       Number(document.getElementById("pf-order").value) || 0,
    };
    if (!body.place || !body.title || !body.tag || !body.description || !body.image) {
      document.getElementById("projectFormError").textContent = "Please fill in all required fields.";
      showToast('Validation Error', 'Please fill in all required fields', 'warning');
      return;
    }
    const errEl = document.getElementById("projectFormError");
    const saveBtn = document.getElementById("projectSaveBtn");
    saveBtn.textContent = "Saving…";
    saveBtn.disabled = true;
    try {
      if (editingProjectId) {
        await apiFetch(`/projects/${editingProjectId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        showToast('Project Updated', 'The project has been successfully updated', 'success');
      } else {
        await apiFetch("/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        showToast('Project Added', 'The project has been successfully added', 'success');
      }
      document.getElementById("projectModalOverlay").classList.remove("open");
      loadPortfolio();
      if (typeof loadClientStories === 'function') loadClientStories();
    } catch (e) {
      errEl.textContent = e.message || "Save failed. Are you still logged in?";
      showToast('Save Failed', e.message || 'Could not save project', 'error');
    } finally {
      saveBtn.textContent = "Save Project";
      saveBtn.disabled = false;
    }
  });

  document.getElementById("projectDeleteBtn").addEventListener("click", async () => {
    if (!editingProjectId || !confirm("Delete this project?")) return;
    try {
      await apiFetch(`/projects/${editingProjectId}`, { method: "DELETE" });
      showToast('Project Deleted', 'The project has been removed', 'success');
      document.getElementById("projectModalOverlay").classList.remove("open");
      loadPortfolio();
      if (typeof loadClientStories === 'function') loadClientStories();
    } catch (e) {
      showToast('Delete Failed', e.message || 'Could not delete project', 'error');
    }
  });

  // ── CLIENT STORIES ───────────────────────────────────
 // ── CLIENT STORIES ───────────────────────────────────
let editingStoryId = null;

async function loadClientStories() {
  const stories = await apiFetch("/client-stories");
  const grid = document.getElementById("storiesGrid");

  if (!stories || !stories.length) {
    if (grid) {
      grid.innerHTML = `
        <p class="empty" style="padding:2rem">
          No client stories yet. Click + Add Story to get started.
        </p>`;
    }
    return;
  }

  if (!grid) return;

  grid.innerHTML = stories.map(s => `
    <div class="proj-card content-card" data-id="${esc(s._id)}">
      <div class="proj-card-img" style="background-image:url('${esc(s.image || "")}')"></div>

      <div class="proj-card-body">
        <span class="proj-tag">${esc(s.industry)}</span>

        <div class="proj-title">${esc(s.clientName)}</div>

        <div class="proj-place">${esc(s.clientRole)}</div>

        <p class="proj-desc">${esc(s.testimonial)}</p>

        <div class="card-actions">
          <a class="btn-view"
             href="client-story-edit.html?id=${esc(s._id)}">
             Edit
          </a>

          <button
            class="btn-action btn-duplicate"
            data-id="${esc(s._id)}"
            data-type="client-stories"
            title="Duplicate">
            ⎘ Clone
          </button>

          <button
            class="btn-action btn-delete-item"
            data-id="${esc(s._id)}"
            data-type="client-stories"
            data-name="${esc(s.clientName)}"
            title="Delete">
            ✕
          </button>
        </div>
      </div>
    </div>
  `).join("");

  // Duplicate
  grid.querySelectorAll(".btn-duplicate").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        await apiFetch(`/${btn.dataset.type}/${btn.dataset.id}/duplicate`, {
          method: "POST"
        });

        showToast("Cloned", "Copy created successfully", "success");

        loadClientStories();

      } catch (e) {

        Swal.fire({
          icon: "error",
          title: "Clone Failed",
          text: e.message
        });

      }
    });
  });

  // Delete from card
  grid.querySelectorAll(".btn-delete-item").forEach(btn => {
    btn.addEventListener("click", async () => {

      const result = await Swal.fire({
        title: `Delete "${btn.dataset.name}"?`,
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        reverseButtons: true
      });

      if (!result.isConfirmed) return;

      try {

        await apiFetch(`/${btn.dataset.type}/${btn.dataset.id}`, {
          method: "DELETE"
        });

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Client story deleted successfully.",
          timer: 1500,
          showConfirmButton: false
        });

        loadClientStories();

      } catch (e) {

        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: e.message
        });

      }

    });
  });
}

function openStoryModal(story = null) {

  editingStoryId = story?._id || null;

  document.getElementById("storyModalTitle").textContent =
    story ? "Edit Story" : "Add Story";

  document.getElementById("st-industry").value = story?.industry || "";
  document.getElementById("st-clientname").value = story?.clientName || "";
  document.getElementById("st-clientrole").value = story?.clientRole || "";

  if (editors.stTestimonial) {
    editors.stTestimonial.setData(story?.testimonial || "");
  }

  document.getElementById("st-image").value = story?.image || "";
  document.getElementById("st-avatar").value = story?.avatar || "";
  document.getElementById("st-impact").value =
    story?.impact?.join(", ") || "";
  document.getElementById("st-order").value =
    story?.order ?? 0;

  document.getElementById("storyFormError").textContent = "";

  document.getElementById("storyDeleteBtn").style.display =
    story ? "" : "none";

  document.getElementById("storyModalOverlay").classList.add("open");
}

document.getElementById("addStoryBtn")
  ?.addEventListener("click", () => openStoryModal());

document.getElementById("storyModalClose")
  ?.addEventListener("click", () => {
    document.getElementById("storyModalOverlay")
      .classList.remove("open");
  });

document.getElementById("storyModalOverlay")
  ?.addEventListener("click", e => {
    if (e.target === e.currentTarget) {
      document.getElementById("storyModalOverlay")
        .classList.remove("open");
    }
  });

document.getElementById("storySaveBtn")
  ?.addEventListener("click", async () => {

    const impact =
      document.getElementById("st-impact").value
        .trim()
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

    const body = {
      industry: document.getElementById("st-industry").value.trim(),
      clientName: document.getElementById("st-clientname").value.trim(),
      clientRole: document.getElementById("st-clientrole").value.trim(),
      testimonial: editors.stTestimonial
        ? editors.stTestimonial.getData()
        : document.getElementById("st-testimonial").value.trim(),
      image: document.getElementById("st-image").value.trim(),
      avatar: document.getElementById("st-avatar").value.trim(),
      impact,
      order: Number(document.getElementById("st-order").value) || 0
    };

    if (
      !body.industry ||
      !body.clientName ||
      !body.clientRole ||
      !body.testimonial ||
      !body.image ||
      !body.avatar
    ) {
      document.getElementById("storyFormError").textContent =
        "Please fill in all required fields.";
      return;
    }

    const saveBtn = document.getElementById("storySaveBtn");
    const errEl = document.getElementById("storyFormError");

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    Swal.fire({
      title: "Saving...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {

      if (editingStoryId) {

        await apiFetch(`/client-stories/${editingStoryId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });

      } else {

        await apiFetch("/client-stories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });

      }

      Swal.close();

      document.getElementById("storyModalOverlay")
        .classList.remove("open");

      await Swal.fire({
        icon: "success",
        title: editingStoryId
          ? "Story Updated"
          : "Story Created",
        timer: 1500,
        showConfirmButton: false
      });

      loadClientStories();

    } catch (e) {

      Swal.close();

      errEl.textContent =
        e.message || "Save failed.";

      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: e.message || "Something went wrong."
      });

    } finally {

      saveBtn.disabled = false;
      saveBtn.textContent = "Save Story";

    }

  });

document.getElementById("storyDeleteBtn")
  ?.addEventListener("click", async () => {

    if (!editingStoryId) return;

    const storyName =
      document.getElementById("st-clientname").value;

    const result = await Swal.fire({
      title: `Delete "${storyName}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {

      await apiFetch(`/client-stories/${editingStoryId}`, {
        method: "DELETE"
      });

      document.getElementById("storyModalOverlay")
        .classList.remove("open");

      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Client story deleted successfully.",
        timer: 1500,
        showConfirmButton: false
      });

      loadClientStories();

    } catch (e) {

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: e.message
      });

    }

  });

  // ── BLOG ───────────────────────────────────────────────────
  let editingBlogId = null;

  async function loadBlogs() {
    const data = await apiFetch('/blogs/admin/all');
    const blogs = data?.data || data;
    const grid = document.getElementById('blogGrid');
    if (!blogs || !blogs.length) {
      grid.innerHTML = `<p class="empty" style="padding:2rem">No blog posts yet. Click + Add Post to get started.</p>`;
      return;
    }

    // Bulk action toolbar
    const view = document.getElementById('view-blog');
    let toolbar = view.querySelector('.bulk-toolbar');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.className = 'bulk-toolbar';
      toolbar.innerHTML = `
        <label class="bulk-select-all"><input type="checkbox" id="blogSelectAll"> Select all</label>
        <button class="btn-delete bulk-delete-btn" id="blogBulkDelete" style="display:none">Delete selected</button>
        <span class="bulk-count" id="blogBulkCount"></span>`;
      view.querySelector('.page-header').after(toolbar);
    }

    grid.innerHTML = blogs.map(b => `
      <div class="proj-card content-card" data-id="${esc(b._id)}">
        <div class="card-select-wrap">
          <input type="checkbox" class="card-checkbox blog-checkbox" data-id="${esc(b._id)}">
        </div>
        <div class="proj-card-img" style="background-image:url('${esc(b.coverImage || b.image || '')}');position:relative;">
          ${b.featured ? '<span class="card-badge badge-featured">★ Featured</span>' : ''}
          <span class="card-status-badge status-${esc(b.status)}">${esc(b.status)}</span>
        </div>
        <div class="proj-card-body">
          <span class="proj-tag">${esc(b.category)}</span>
          <div class="proj-title">${esc(b.title)}</div>
          <div class="proj-place">${esc(b.author) || '—'} · ${esc(b.readTime) || '—'}</div>
          <p class="proj-desc">${esc(b.excerpt) || ''}</p>
          <div class="card-actions">
            <a class="btn-view" href="blog-edit.html?id=${esc(b._id)}">Edit</a>
            <button class="btn-action btn-toggle-status" data-id="${esc(b._id)}" data-status="${esc(b.status)}" title="${b.status === 'published' ? 'Set to draft' : 'Publish'}">
              ${b.status === 'published' ? '⬇ Draft' : '↑ Publish'}
            </button>
            <button class="btn-action btn-duplicate" data-id="${esc(b._id)}" data-type="blogs" title="Duplicate">⎘ Clone</button>
            <button class="btn-action btn-delete-item" data-id="${esc(b._id)}" data-type="blogs" data-name="${esc(b.title.replace(/"/g,''))}" title="Delete">✕</button>
          </div>
        </div>
      </div>`).join('');

    // Bulk checkbox logic
    document.getElementById('blogSelectAll').onchange = function() {
      document.querySelectorAll('.blog-checkbox').forEach(cb => cb.checked = this.checked);
      updateBulkBar('blog');
    };
    document.querySelectorAll('.blog-checkbox').forEach(cb => {
      cb.addEventListener('change', () => updateBulkBar('blog'));
    });
    document.getElementById('blogBulkDelete').onclick = () => bulkDelete('blog', 'blogs', loadBlogs);

    // Action buttons
    grid.querySelectorAll('.btn-toggle-status').forEach(btn => {
      btn.addEventListener('click', async () => {
        const newStatus = btn.dataset.status === 'published' ? 'draft' : 'published';
        try {
          await apiFetch(`/blogs/${btn.dataset.id}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
          showToast('Status updated', `Post set to ${newStatus}`, 'success');
          loadBlogs();
        } catch(e) { showToast('Error', e.message, 'error'); }
      });
    });
    grid.querySelectorAll('.btn-duplicate').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await apiFetch(`/${btn.dataset.type}/${btn.dataset.id}/duplicate`, { method: 'POST' });
          showToast('Cloned', 'Draft copy created', 'success');
          loadBlogs();
        } catch(e) { showToast('Error', e.message, 'error'); }
      });
    });
    grid.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Delete "${btn.dataset.name}"?`)) return;
        try {
          await apiFetch(`/${btn.dataset.type}/${btn.dataset.id}`, { method: 'DELETE' });
          showToast('Deleted', 'Item removed', 'success');
          loadBlogs();
        } catch(e) { showToast('Error', e.message, 'error'); }
      });
    });
  }

  function openBlogModal(blog = null) {
    editingBlogId = blog?._id || null;
    document.getElementById('blogModalTitle').textContent = blog ? 'Edit Post' : 'Add Post';
    document.getElementById('bl-title').value    = blog?.title    || '';
    document.getElementById('bl-category').value = blog?.category || 'Virtual Reality';
    document.getElementById('bl-status').value = blog?.status || 'published';
    document.getElementById('bl-readtime').value = blog?.readTime || '5 min read';
    document.getElementById('bl-excerpt').value  = blog?.excerpt  || '';
    if (editors.blogContent) {
      editors.blogContent.setData(blog?.content || '');
    }
    document.getElementById('bl-image').value    = blog?.coverImage || blog?.image || '';
    document.getElementById('bl-author').value   = blog?.author   || 'Volga Infosys';
    document.getElementById('bl-order').value    = blog?.order    ?? 0;
    document.getElementById('bl-featured').checked = blog?.featured || false;
    document.getElementById('bl-seotitle').value = blog?.seoTitle || '';
    document.getElementById('bl-seodesc').value = blog?.seoDescription || '';
    document.getElementById('blogFormError').textContent = '';
    document.getElementById('blogDeleteBtn').style.display = blog ? '' : 'none';
    document.getElementById('blogModalOverlay').classList.add('open');
  }

  document.getElementById('blogModalClose').addEventListener('click', () =>
    document.getElementById('blogModalOverlay').classList.remove('open')
  );
  document.getElementById('blogModalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) document.getElementById('blogModalOverlay').classList.remove('open');
  });

  document.getElementById('blogSaveBtn').addEventListener('click', async () => {
    let coverImage = document.getElementById('bl-image').value.trim();
    const coverFileInput = document.getElementById('bl-cover');

    if (coverFileInput.files && coverFileInput.files[0]) {
      const formData = new FormData();
      formData.append('file', coverFileInput.files[0]);
      const uploadRes = await fetch(API + '/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (uploadData.success && uploadData.data) {
        coverImage = uploadData.data.url;
      }
    }

    const body = {
      title:    document.getElementById('bl-title').value.trim(),
      category: document.getElementById('bl-category').value,
      status:   document.getElementById('bl-status').value,
      readTime: document.getElementById('bl-readtime').value.trim() || '5 min read',
      excerpt:  document.getElementById('bl-excerpt').value.trim(),
      content:  editors.blogContent ? editors.blogContent.getData() : document.getElementById('bl-content').value.trim(),
      coverImage: coverImage,
      author:   document.getElementById('bl-author').value.trim() || 'Volga Infosys',
      order:    Number(document.getElementById('bl-order').value) || 0,
      featured: document.getElementById('bl-featured').checked,
      seoTitle: document.getElementById('bl-seotitle').value.trim(),
      seoDescription: document.getElementById('bl-seodesc').value.trim(),
    };
    if (!body.title || !body.excerpt || !body.coverImage) {
      document.getElementById('blogFormError').textContent = 'Title, Excerpt and Cover Image are required.';
      return;
    }
    const saveBtn = document.getElementById('blogSaveBtn');
    saveBtn.textContent = 'Saving…'; saveBtn.disabled = true;
    try {
      if (editingBlogId) {
        await apiFetch(`/blogs/${editingBlogId}`, { method: 'PUT', headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        await apiFetch('/blogs', { method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      document.getElementById('blogModalOverlay').classList.remove('open');
      loadBlogs();
      loadOverview();
    } catch (e) {
      document.getElementById('blogFormError').textContent = e.message || 'Save failed.';
    } finally {
      saveBtn.textContent = 'Save Post'; saveBtn.disabled = false;
    }
  });

  document.getElementById('blogDeleteBtn').addEventListener('click', async () => {
    if (!editingBlogId || !confirm('Delete this post?')) return;
    await apiFetch(`/blogs/${editingBlogId}`, { method: 'DELETE' });
    document.getElementById('blogModalOverlay').classList.remove('open');
    loadBlogs();
    loadOverview();
  });

  // CASE STUDIES
  let editingCaseStudyId = null;

  async function loadCaseStudies() {
    const caseStudies = await apiFetch('/case-studies');
    const grid = document.getElementById('caseStudyGrid');
    if (!grid) return;
    if (!caseStudies.length) {
      grid.innerHTML = `<p class="empty" style="padding:2rem">No case studies yet. Click + Add Case Study to get started.</p>`;
      return;
    }
    grid.innerHTML = caseStudies.map(c => `
      <div class="proj-card content-card" data-id="${esc(c._id)}">
        <div class="proj-card-img" style="background-image:url('${esc(c.image || '')}')"></div>
        <div class="proj-card-body">
          <span class="proj-tag">${esc(c.industry)}</span>
          <div class="proj-title">${esc(c.title)}</div>
          <div class="proj-place">${esc(c.year) || 'Case Study'} · ${(c.metrics || []).length} metrics</div>
          <p class="proj-desc">${esc(c.description)}</p>
          <div class="card-actions">
            <a class="btn-view" href="case-study-edit.html?id=${esc(c._id)}">Edit</a>
            <button class="btn-action btn-duplicate" data-id="${esc(c._id)}" data-type="case-studies" title="Duplicate">⎘ Clone</button>
            <button class="btn-action btn-delete-item" data-id="${esc(c._id)}" data-type="case-studies" data-name="${esc(c.title.replace(/"/g,''))}" title="Delete">✕</button>
          </div>
        </div>
      </div>`).join('');

    grid.querySelectorAll('.btn-duplicate').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await apiFetch(`/${btn.dataset.type}/${btn.dataset.id}/duplicate`, { method: 'POST' });
          showToast('Cloned', 'Draft copy created', 'success');
          loadCaseStudies();
        } catch(e) { showToast('Error', e.message, 'error'); }
      });
    });
    grid.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Delete "${btn.dataset.name}"?`)) return;
        try {
          await apiFetch(`/${btn.dataset.type}/${btn.dataset.id}`, { method: 'DELETE' });
          showToast('Deleted', 'Item removed', 'success');
          loadCaseStudies();
        } catch(e) { showToast('Error', e.message, 'error'); }
      });
    });
  }

  function parseMetrics(value) {
    return value.split('\n').map(line => {
      const [metricValue, ...labelParts] = line.split('|');
      return { value: (metricValue || '').trim(), label: labelParts.join('|').trim() };
    }).filter(m => m.value || m.label);
  }

  function formatMetrics(metrics = []) {
    return metrics.map(m => `${m.value || ''} | ${m.label || ''}`.trim()).join('\n');
  }

  function openCaseStudyModal(caseStudy = null) {
    editingCaseStudyId = caseStudy?._id || null;
    document.getElementById('caseStudyModalTitle').textContent = caseStudy ? 'Edit Case Study' : 'Add Case Study';
    document.getElementById('cs-title').value = caseStudy?.title || '';
    document.getElementById('cs-industry').value = caseStudy?.industry || '';
    document.getElementById('cs-year').value = caseStudy?.year || '';
    if (editors.csDescription) {
      editors.csDescription.setData(caseStudy?.description || '');
    }
    document.getElementById('cs-image').value = caseStudy?.image || '';
    document.getElementById('cs-metrics').value = formatMetrics(caseStudy?.metrics || []);
    document.getElementById('cs-author').value = caseStudy?.author || 'Volga Infosys';
    document.getElementById('cs-order').value = caseStudy?.order ?? 0;
    document.getElementById('caseStudyFormError').textContent = '';
    document.getElementById('caseStudyDeleteBtn').style.display = caseStudy ? '' : 'none';
    document.getElementById('caseStudyModalOverlay').classList.add('open');
  }

  document.getElementById('addCaseStudyBtn')?.addEventListener('click', () => openCaseStudyModal());
  document.getElementById('caseStudyModalClose')?.addEventListener('click', () =>
    document.getElementById('caseStudyModalOverlay').classList.remove('open')
  );
  document.getElementById('caseStudyModalOverlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) document.getElementById('caseStudyModalOverlay').classList.remove('open');
  });

  document.getElementById('caseStudySaveBtn')?.addEventListener('click', async () => {
    const body = {
      title: document.getElementById('cs-title').value.trim(),
      industry: document.getElementById('cs-industry').value.trim(),
      year: document.getElementById('cs-year').value.trim(),
      description: editors.csDescription ? editors.csDescription.getData() : document.getElementById('cs-description').value.trim(),
      image: document.getElementById('cs-image').value.trim(),
      metrics: parseMetrics(document.getElementById('cs-metrics').value),
      author: document.getElementById('cs-author').value.trim() || 'Volga Infosys',
      order: Number(document.getElementById('cs-order').value) || 0,
    };
    if (!body.title || !body.industry || !body.description || !body.image) {
      document.getElementById('caseStudyFormError').textContent = 'Title, Industry, Description and Image URL are required.';
      return;
    }
    const saveBtn = document.getElementById('caseStudySaveBtn');
    saveBtn.textContent = 'Saving...'; saveBtn.disabled = true;
    try {
      if (editingCaseStudyId) {
        await apiFetch(`/case-studies/${editingCaseStudyId}`, { method: 'PATCH', headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        await apiFetch('/case-studies', { method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      document.getElementById('caseStudyModalOverlay').classList.remove('open');
      loadCaseStudies();
      loadOverview();
    } catch (e) {
      document.getElementById('caseStudyFormError').textContent = e.message || 'Save failed.';
    } finally {
      saveBtn.textContent = 'Save Case Study'; saveBtn.disabled = false;
    }
  });

  document.getElementById('caseStudyDeleteBtn')?.addEventListener('click', async () => {
    if (!editingCaseStudyId || !confirm('Delete this case study?')) return;
    await apiFetch(`/case-studies/${editingCaseStudyId}`, { method: 'DELETE' });
    document.getElementById('caseStudyModalOverlay').classList.remove('open');
    loadCaseStudies();
    loadOverview();
  });

  // INDUSTRY NEWS
  let editingIndustryNewsId = null;

  async function loadIndustryNews() {
    const news = await apiFetch('/industry-news');
    const grid = document.getElementById('industryNewsGrid');
    if (!grid) return;
    if (!news.length) {
      grid.innerHTML = `<p class="empty" style="padding:2rem">No industry news yet. Click + Add News to get started.</p>`;
      return;
    }
    grid.innerHTML = news.map(n => `
      <div class="proj-card content-card" data-id="${esc(n._id)}">
        <div class="proj-card-img" style="background-image:url('${esc(n.image || '')}')"></div>
        <div class="proj-card-body">
          <span class="proj-tag">${esc(n.topic)}</span>
          <div class="proj-title">${esc(n.title)}</div>
          <div class="proj-place">${esc(n.source) || 'Volga Infosys'} · ${fmtDate(n.publishedAt || n.createdAt)}</div>
          <p class="proj-desc">${esc(n.description)}</p>
          <div class="card-actions">
            <a class="btn-view" href="industry-news-edit.html?id=${esc(n._id)}">Edit</a>
            <button class="btn-action btn-duplicate" data-id="${esc(n._id)}" data-type="industry-news" title="Duplicate">⎘ Clone</button>
            <button class="btn-action btn-delete-item" data-id="${esc(n._id)}" data-type="industry-news" data-name="${esc(n.title.replace(/"/g,''))}" title="Delete">✕</button>
          </div>
        </div>
      </div>`).join('');

    grid.querySelectorAll('.btn-duplicate').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await apiFetch(`/${btn.dataset.type}/${btn.dataset.id}/duplicate`, { method: 'POST' });
          showToast('Cloned', 'Copy created', 'success');
          loadIndustryNews();
        } catch(e) { showToast('Error', e.message, 'error'); }
      });
    });
    grid.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Delete "${btn.dataset.name}"?`)) return;
        try {
          await apiFetch(`/${btn.dataset.type}/${btn.dataset.id}`, { method: 'DELETE' });
          showToast('Deleted', 'Item removed', 'success');
          loadIndustryNews();
        } catch(e) { showToast('Error', e.message, 'error'); }
      });
    });
  }

  function dateInputValue(value) {
    if (!value) return '';
    return new Date(value).toISOString().slice(0, 10);
  }

  function openIndustryNewsModal(item = null) {
    editingIndustryNewsId = item?._id || null;
    document.getElementById('industryNewsModalTitle').textContent = item ? 'Edit News' : 'Add News';
    document.getElementById('in-title').value = item?.title || '';
    document.getElementById('in-topic').value = item?.topic || '';
    document.getElementById('in-source').value = item?.source || 'Volga Infosys';
    document.getElementById('in-description').value = item?.description || '';
    document.getElementById('in-image').value = item?.image || '';
    document.getElementById('in-published').value = dateInputValue(item?.publishedAt);
    document.getElementById('in-order').value = item?.order ?? 0;
    document.getElementById('in-url').value = item?.url || '';
    document.getElementById('industryNewsFormError').textContent = '';
    document.getElementById('industryNewsDeleteBtn').style.display = item ? '' : 'none';
    document.getElementById('industryNewsModalOverlay').classList.add('open');
  }

  document.getElementById('addIndustryNewsBtn')?.addEventListener('click', () => openIndustryNewsModal());
  document.getElementById('industryNewsModalClose')?.addEventListener('click', () =>
    document.getElementById('industryNewsModalOverlay').classList.remove('open')
  );
  document.getElementById('industryNewsModalOverlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) document.getElementById('industryNewsModalOverlay').classList.remove('open');
  });

  document.getElementById('industryNewsSaveBtn')?.addEventListener('click', async () => {
    const body = {
      title: document.getElementById('in-title').value.trim(),
      topic: document.getElementById('in-topic').value.trim(),
      source: document.getElementById('in-source').value.trim() || 'Volga Infosys',
      description: document.getElementById('in-description').value.trim(),
      image: document.getElementById('in-image').value.trim(),
      publishedAt: document.getElementById('in-published').value || new Date().toISOString(),
      order: Number(document.getElementById('in-order').value) || 0,
      url: document.getElementById('in-url').value.trim(),
    };
    if (!body.title || !body.topic || !body.description || !body.image) {
      document.getElementById('industryNewsFormError').textContent = 'Title, Topic, Description and Image URL are required.';
      return;
    }
    const saveBtn = document.getElementById('industryNewsSaveBtn');
    saveBtn.textContent = 'Saving...'; saveBtn.disabled = true;
    try {
      if (editingIndustryNewsId) {
        await apiFetch(`/industry-news/${editingIndustryNewsId}`, { method: 'PATCH', headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        await apiFetch('/industry-news', { method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      document.getElementById('industryNewsModalOverlay').classList.remove('open');
      loadIndustryNews();
      loadOverview();
    } catch (e) {
      document.getElementById('industryNewsFormError').textContent = e.message || 'Save failed.';
    } finally {
      saveBtn.textContent = 'Save News'; saveBtn.disabled = false;
    }
  });

  document.getElementById('industryNewsDeleteBtn')?.addEventListener('click', async () => {
    if (!editingIndustryNewsId || !confirm('Delete this news item?')) return;
    await apiFetch(`/industry-news/${editingIndustryNewsId}`, { method: 'DELETE' });
    document.getElementById('industryNewsModalOverlay').classList.remove('open');
    loadIndustryNews();
    loadOverview();
  });

  // MEDIA LIBRARY
  let mediaItems = [];

  async function loadMediaLibrary() {
    const data = await apiFetch('/media');
    mediaItems = data?.data || data;
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;
    if (!mediaItems || !mediaItems.length) {
      grid.innerHTML = `<p class="empty" style="padding:2rem">No media items yet. Click + Upload Image to get started.</p>`;
      return;
    }
    grid.innerHTML = mediaItems.map(m => `
      <div class="proj-card" style="flex: 0 0 calc(33.333% - 1rem); max-width: calc(33.333% - 1rem);">
        <div class="proj-card-img" style="background-image:url('${esc(m.url)}'); height: 150px;"></div>
        <div class="proj-card-body">
          <div class="proj-title" style="font-size: 0.9rem;">${esc(m.filename)}</div>
          <div class="proj-place" style="font-size: 0.75rem;">${(m.size / 1024).toFixed(1)} KB</div>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
            <button class="btn-view media-copy-btn" data-url="${esc(m.url)}">Copy URL</button>
            <button class="btn-delete media-delete-btn" data-id="${esc(m._id)}">Delete</button>
          </div>
        </div>
      </div>`).join('');
    
    grid.querySelectorAll('.media-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.url).then(() => {
          showToast('URL Copied', 'The media URL has been copied to clipboard', 'success');
        });
      });
    });

    grid.querySelectorAll('.media-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this media item?')) return;
        try {
          await apiFetch(`/media/${btn.dataset.id}`, { method: 'DELETE' });
          showToast('Media Deleted', 'The media item has been removed', 'success');
          loadMediaLibrary();
        } catch (e) {
          showToast('Delete Failed', e.message || 'Could not delete media item', 'error');
        }
      });
    });
  }

  // Media upload modal
  document.getElementById('uploadMediaBtn')?.addEventListener('click', () => {
    document.getElementById('mediaModalOverlay').classList.add('open');
  });

  document.getElementById('mediaModalClose')?.addEventListener('click', () => {
    document.getElementById('mediaModalOverlay').classList.remove('open');
  });

  document.getElementById('mediaModalOverlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) document.getElementById('mediaModalOverlay').classList.remove('open');
  });

  document.getElementById('mediaSaveBtn')?.addEventListener('click', async () => {
    const fileInput = document.getElementById('media-file');
    if (!fileInput.files || !fileInput.files[0]) {
      document.getElementById('mediaFormError').textContent = 'Please select a file to upload.';
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const saveBtn = document.getElementById('mediaSaveBtn');
    saveBtn.textContent = 'Uploading...'; saveBtn.disabled = true;

    try {
      const uploadRes = await fetch(API + '/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.message || 'Upload failed');

      document.getElementById('mediaModalOverlay').classList.remove('open');
      document.getElementById('mediaFormError').textContent = '';
      loadMediaLibrary();
    } catch (e) {
      document.getElementById('mediaFormError').textContent = e.message || 'Upload failed.';
    } finally {
      saveBtn.textContent = 'Upload'; saveBtn.disabled = false;
    }
  });

  // ── SETTINGS ─────────────────────────────────────────────────────────────
    let currentUser = null;
    let editingUserId = null;

    // View to permission mapping
    const viewPermissions = {
      'overview': 'view_overview',
      'leads': 'view_leads',
      'portfolio': 'view_projects',
      'clientstories': 'view_client_stories',
      'blog': 'view_blog',
      'casestudies': 'view_case_studies',
      'industrynews': 'view_industry_news',
      'medialibrary': 'view_media_library',
      'emaillogs': 'view_email_logs',
      'settings': 'view_settings',
      'roleapplications': 'manage_users'
    };

    // Helper function to check if user has permission
    function hasPermission(permission) {
      if (!currentUser) return false;
      if (currentUser.role === 'admin') return true;
      return (currentUser.permissions || []).includes(permission);
    }

    // Load current user
    async function loadCurrentUser() {
      const data = await apiFetch('/auth/me');
      currentUser = data.user;
      document.getElementById('settings-name').value = currentUser.name || '';
      document.getElementById('settings-email').value = currentUser.email || '';
      
      // Update profile widget
      document.getElementById('profileName').textContent = currentUser.name || 'Admin User';
      document.getElementById('profileEmail').textContent = currentUser.email || '';
      document.getElementById('profileRole').textContent = currentUser.role || 'viewer';
      
      // Update profile picture
      const profileAvatarImg = document.getElementById('profileAvatarImg');
      const profileAvatarText = document.getElementById('profileAvatarText');
      const profilePicPreview = document.getElementById('profilePicturePreview');
      if (currentUser.profilePicture) {
        profileAvatarImg.src = currentUser.profilePicture;
        profileAvatarImg.style.display = 'block';
        profileAvatarText.style.display = 'none';
        profilePicPreview.style.backgroundImage = `url(${currentUser.profilePicture})`;
        profilePicPreview.style.backgroundSize = 'cover';
        profilePicPreview.style.backgroundPosition = 'center';
      } else {
        profileAvatarImg.style.display = 'none';
        profileAvatarText.style.display = 'block';
        profileAvatarText.textContent = (currentUser.name || 'A').charAt(0).toUpperCase();
        profilePicPreview.style.backgroundImage = 'none';
      }
      
      // Show/hide nav items based on permissions
      let firstVisibleNavItem = null;
      document.querySelectorAll('.nav-item').forEach(item => {
        const view = item.dataset.view;
        const requiredPermission = viewPermissions[view];
        if (hasPermission(requiredPermission)) {
          item.style.display = 'flex';
          if (!firstVisibleNavItem) {
            firstVisibleNavItem = item;
          }
        } else {
          item.style.display = 'none';
        }
      });

      // Ensure we're on a visible view
      const activeView = document.querySelector('.view.active');
      if (!activeView || activeView.style.display === 'none') {
        if (firstVisibleNavItem) {
          firstVisibleNavItem.click();
        }
      }
      
      // Show/hide admin-only sections
      const isAdmin = currentUser.role === 'admin';
      document.getElementById('userManagementTitle').style.display = isAdmin ? 'block' : 'none';
      document.getElementById('userManagementSection').style.display = isAdmin ? 'block' : 'none';
      document.getElementById('roleApplicationsTitle').style.display = isAdmin ? 'block' : 'none';
      document.getElementById('roleApplicationsSection').style.display = isAdmin ? 'block' : 'none';
      // Show change password section to all logged-in users
      document.getElementById('changePasswordTitle').style.display = 'block';
      document.getElementById('changePasswordSection').style.display = 'block';
      
      if (isAdmin) {
        loadUsers();
        loadRoleApplications();
      }
    }

    // Profile picture upload handler
    document.getElementById('uploadProfilePictureBtn')?.addEventListener('click', async () => {
      const fileInput = document.getElementById('profilePictureUpload');
      if (!fileInput.files || !fileInput.files[0]) {
        showToast('Validation Error', 'Please select a file to upload', 'warning');
        return;
      }

      const btn = document.getElementById('uploadProfilePictureBtn');
      btn.textContent = 'Uploading...';
      btn.disabled = true;

      try {
        const formData = new FormData();
        formData.append('profilePicture', fileInput.files[0]);
        const data = await apiFetch('/auth/upload-profile-picture', {
          method: 'POST',
          body: formData,
          headers: {
            // Don't set Content-Type, fetch will set it with boundary for FormData
          }
        });
        showToast('Profile Picture Updated', 'Your profile picture has been updated successfully', 'success');
        loadCurrentUser();
      } catch (e) {
        showToast('Upload Failed', e.message || 'Could not upload profile picture', 'error');
      } finally {
        btn.textContent = 'Upload Picture';
        btn.disabled = false;
      }
    });

    // Update profile listener
    document.getElementById('updateProfileBtn')?.addEventListener('click', async () => {
      const btn = document.getElementById('updateProfileBtn');
      btn.textContent = 'Updating...';
      btn.disabled = true;
      try {
        const body = {
          name: document.getElementById('settings-name').value.trim(),
          email: document.getElementById('settings-email').value.trim()
        };
        await apiFetch('/auth/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        showToast('Profile Updated', 'Your profile has been updated successfully', 'success');
        // Refresh profile widget
        loadCurrentUser();
      } catch (e) {
        showToast('Update Failed', e.message || 'Could not update profile', 'error');
      } finally {
        btn.textContent = 'Update Profile';
        btn.disabled = false;
      }
    });

    // Change password listener
    document.getElementById('changePasswordBtn')?.addEventListener('click', async () => {
      const currentPwd = document.getElementById('currentPassword').value;
      const newPwd = document.getElementById('newPassword').value;
      const confirmPwd = document.getElementById('confirmPassword').value;
      
      if (newPwd !== confirmPwd) {
        showToast('Validation Error', 'Passwords do not match', 'warning');
        return;
      }
      
      const btn = document.getElementById('changePasswordBtn');
      btn.textContent = 'Changing...';
      btn.disabled = true;
      try {
        await apiFetch('/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }) });
        showToast('Password Changed', 'Your password has been updated successfully', 'success');
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
      } catch (e) {
        showToast('Change Password Failed', e.message || 'Could not change password', 'error');
      } finally {
        btn.textContent = 'Change Password';
        btn.disabled = false;
      }
    });

    // Load users (admin)
    async function loadUsers() {
      const data = await apiFetch('/auth/users');
      const tbody = document.querySelector('#usersTable tbody');
      if (!data.users || !data.users.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No users found</td></tr>';
        return;
      }
      tbody.innerHTML = data.users.map(u => `
        <tr>
          <td>${esc(u.name)}</td>
          <td>${esc(u.email)}</td>
          <td><span class="badge badge-${esc(u.role)}">${esc(u.role)}</span></td>
          <td>${fmtDate(u.createdAt)}</td>
          <td><button class="btn-view edit-user-btn" data-id="${esc(u._id)}">Edit</button></td>
        </tr>
      `).join('');
      
      tbody.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const user = data.users.find(u => u._id === btn.dataset.id);
          openUserModal(user);
        });
      });
    }

    // Function to render permissions list
    function renderPermissionsList(selectedPermissions = []) {
      const permissionsList = document.getElementById('permissions-list');
      if (!permissionsList) return;
      
      // Group permissions by category
      const permissionGroups = {
        'View Access': [
          'view_overview', 'view_leads', 'view_projects', 
          'view_client_stories', 'view_blog', 'view_case_studies', 
          'view_industry_news', 'view_media_library', 
          'view_email_logs', 'view_settings'
        ],
        'Edit Access': [
          'edit_leads', 'edit_projects', 'edit_client_stories', 
          'edit_blog', 'edit_case_studies', 'edit_industry_news', 
          'edit_media_library'
        ],
        'Admin Access': [
          'manage_users', 'manage_roles', 'manage_settings'
        ]
      };
      
      let html = '';
      
      for (const [groupName, permissions] of Object.entries(permissionGroups)) {
        html += `
          <div style="margin-bottom: 20px;">
            <h4 style="color: #F35F37; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">${groupName}</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">
              ${permissions.map(key => `
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 10px 12px; border-radius: 8px; transition: all 0.2s; background: rgba(255,255,255,0.02); border: 1px solid transparent;"
                       onmouseover="this.style.background='rgba(243, 95, 55, 0.1)'; this.style.borderColor='rgba(243, 95, 55, 0.3)';"
                       onmouseout="this.style.background='rgba(255,255,255,0.02)'; this.style.borderColor='transparent';">
                  <input type="checkbox" value="${key}" ${selectedPermissions.includes(key) ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: #F35F37; cursor: pointer;">
                  <span style="font-size: 13px; color: #e2e8f0; font-weight: 400;">${key.replace(/_/g, ' ')}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `;
      }
      
      permissionsList.innerHTML = html;
    }
    
    // Open user modal
    function openUserModal(user = null) {
      editingUserId = user?._id || null;
      document.getElementById('userModalTitle').textContent = user ? 'Edit User' : 'Add User';
      document.getElementById('user-name').value = user?.name || '';
      document.getElementById('user-email').value = user?.email || '';
      document.getElementById('user-role').value = user?.role || 'viewer';
      document.getElementById('user-password').value = '';
      document.getElementById('userFormError').textContent = '';
      document.getElementById('userDeleteBtn').style.display = user ? 'inline-block' : 'none';
      
      // Render permissions
      const defaultPermissions = user ? user.permissions : rolePermissions[document.getElementById('user-role').value];
      renderPermissionsList(defaultPermissions || []);
      
      document.getElementById('userModalOverlay').classList.add('open');
    }

    // User modal listeners
    document.getElementById('addUserBtn')?.addEventListener('click', () => openUserModal());
    document.getElementById('userModalClose')?.addEventListener('click', () => {
      document.getElementById('userModalOverlay').classList.remove('open');
    });
    document.getElementById('userModalOverlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) document.getElementById('userModalOverlay').classList.remove('open');
    });

    // Listen for role change to update permissions
    document.getElementById('user-role')?.addEventListener('change', (e) => {
      const selectedRole = e.target.value;
      const defaultPerms = rolePermissions[selectedRole] || [];
      renderPermissionsList(defaultPerms);
    });

    document.getElementById('userSaveBtn')?.addEventListener('click', async () => {
      // Get selected permissions
      const checkboxes = document.querySelectorAll('#permissions-list input[type="checkbox"]');
      const selectedPermissions = [];
      checkboxes.forEach(checkbox => {
        if (checkbox.checked) selectedPermissions.push(checkbox.value);
      });
      
      const body = {
        name: document.getElementById('user-name').value.trim(),
        email: document.getElementById('user-email').value.trim(),
        role: document.getElementById('user-role').value,
        permissions: selectedPermissions
      };
      const pwd = document.getElementById('user-password').value.trim();
      if (pwd) body.password = pwd;
      
      if (!body.name || !body.email) {
        document.getElementById('userFormError').textContent = 'Name and email are required';
        return;
      }
      
      const btn = document.getElementById('userSaveBtn');
      btn.textContent = 'Saving...';
      btn.disabled = true;
      try {
        if (editingUserId) {
          await apiFetch(`/auth/users/${editingUserId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        } else {
          await apiFetch('/auth/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        }
        document.getElementById('userModalOverlay').classList.remove('open');
        loadUsers();
      } catch (e) {
        document.getElementById('userFormError').textContent = e.message || 'Save failed';
      } finally {
        btn.textContent = 'Save User';
        btn.disabled = false;
      }
    });

    document.getElementById('userDeleteBtn')?.addEventListener('click', async () => {
      if (!editingUserId || !confirm('Delete this user?')) return;
      try {
        await apiFetch(`/auth/users/${editingUserId}`, { method: 'DELETE' });
        showToast('User Deleted', 'The user has been deleted successfully', 'success');
        document.getElementById('userModalOverlay').classList.remove('open');
        loadUsers();
      } catch (e) {
        showToast('Delete Failed', e.message || 'Could not delete the user', 'error');
      }
    });

    // Load role applications (admin)
    async function loadRoleApplications() {
      const data = await apiFetch('/auth/role-applications');
      const tbody = document.querySelector('#roleApplicationsTable tbody');
      if (!data.applications || !data.applications.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty">No role applications found</td></tr>';
        return;
      }
      tbody.innerHTML = data.applications.map(a => `
        <tr>
          <td>${esc(a.applicantName)}</td>
          <td>${esc(a.applicantEmail)}</td>
          <td><span class="badge badge-${esc(a.requestedRole)}">${esc(a.requestedRole)}</span></td>
          <td class="msg-cell">${esc(a.reason)}</td>
          <td><span class="badge badge-${esc(a.status)}">${esc(a.status)}</span></td>
          <td>${fmtDate(a.createdAt)}</td>
          <td>
            ${a.status === 'pending' ? `
              <button class="btn-view approve-role-btn" data-id="${esc(a._id)}" style="background: #10b981; color: white;">Approve</button>
              <button class="btn-delete reject-role-btn" data-id="${esc(a._id)}">Reject</button>
            ` : ''}
          </td>
        </tr>
      `).join('');
      
      tbody.querySelectorAll('.approve-role-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            await apiFetch(`/auth/role-applications/${btn.dataset.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) });
            showToast('Application Approved', 'The role application has been approved', 'success');
            loadRoleApplications();
          } catch (e) {
            showToast('Action Failed', e.message || 'Could not approve the application', 'error');
          }
        });
      });
      
      tbody.querySelectorAll('.reject-role-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Reject this application?')) return;
          try {
            await apiFetch(`/auth/role-applications/${btn.dataset.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected' }) });
            showToast('Application Rejected', 'The role application has been rejected', 'success');
            loadRoleApplications();
          } catch (e) {
            showToast('Action Failed', e.message || 'Could not reject the application', 'error');
          }
        });
      });
    }



    // Load permissions and current user
    let allPermissions = {};
    let rolePermissions = {};
    
    async function loadPermissions() {
      try {
        // Only load permissions if user is admin (since endpoint is admin-only)
        // Wait no, let's check if user is admin first, or just let it fail silently if not admin
        const data = await apiFetch('/auth/permissions');
        allPermissions = data.permissions;
        rolePermissions = data.rolePermissions;
      } catch (e) {
        console.error('Failed to load permissions:', e);
        // Set default permissions object just in case
        allPermissions = {
          'view_overview': 'view_overview',
          'view_leads': 'view_leads',
          'view_projects': 'view_projects',
          'view_client_stories': 'view_client_stories',
          'view_blog': 'view_blog',
          'view_case_studies': 'view_case_studies',
          'view_industry_news': 'view_industry_news',
          'view_media_library': 'view_media_library',
          'view_email_logs': 'view_email_logs',
          'view_settings': 'view_settings'
        };
        rolePermissions = {
          admin: Object.values(allPermissions),
          editor: Object.values(allPermissions),
          viewer: Object.values(allPermissions)
        };
      }
    }
    
    loadPermissions();
    loadCurrentUser();

    // ── JOBS MANAGEMENT ──────────────────────────────────────────────
    let editingJobId = null;

    // Close all dropdowns when clicking outside - add once
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.actions-dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
      }
    });

    async function loadJobs() {
      const response = await apiFetch('/jobs/admin/all');
    const jobs = response?.data || response;
      const tbody = document.querySelector('#jobsTable tbody');
      if (!jobs?.length) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty">No jobs yet. Click + Add Job to get started.</td></tr>';
        return;
      }
      tbody.innerHTML = jobs.map(j => `
        <tr>
          <td>${esc(j.title)}</td>
          <td>${esc(j.department)}</td>
          <td>${esc(j.location)}</td>
          <td>${esc(j.type)}</td>
          <td>${esc(j.salary || '—')}</td>
          <td><span class="badge badge-${esc(j.status)}">${esc(j.status)}</span></td>
          <td>${j.featured ? '<span class="badge badge-success">Yes</span>' : 'No'}</td>
          <td>${fmtDate(j.createdAt)}</td>
          <td>
            <div class="actions-dropdown" data-id="${esc(j._id)}">
              <button class="dropdown-toggle">⋮</button>
              <div class="dropdown-menu">
                <button class="dropdown-item" data-action="edit">Edit</button>
                <button class="dropdown-item" data-action="duplicate">Duplicate</button>
                <button class="dropdown-item" data-action="close">Close Job</button>
                <button class="dropdown-item" data-action="archive">Archive</button>
                <button class="dropdown-item danger" data-action="delete">Delete</button>
              </div>
            </div>
          </td>
        </tr>
      `).join('');

      // Handle dropdown toggles
      tbody.querySelectorAll('.dropdown-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const menu = btn.nextElementSibling;
          document.querySelectorAll('.dropdown-menu').forEach(m => {
            if (m !== menu) m.classList.remove('show');
          });
          menu.classList.toggle('show');
        });
      });

      // Handle dropdown item clicks
      tbody.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', async (e) => {
          e.stopPropagation();
          const dropdown = item.closest('.actions-dropdown');
          const jobId = dropdown.dataset.id;
          const job = jobs.find(j => j._id === jobId);
          const action = item.dataset.action;
          
          // Close the menu
          dropdown.querySelector('.dropdown-menu').classList.remove('show');

          switch (action) {
            case 'edit':
              openJobModal(job);
              break;
            case 'duplicate':
              await duplicateJob(job);
              break;
            case 'close':
              await updateJobStatus(jobId, 'closed');
              break;
            case 'archive':
              await updateJobStatus(jobId, 'archived');
              break;
            case 'delete':
              if (confirm('Delete this job?')) {
                try {
                  await apiFetch(`/jobs/${jobId}`, { method: 'DELETE' });
                  showToast('Job Deleted', 'The job has been removed', 'success');
                  loadJobs();
                } catch (e) {
                  showToast('Delete Failed', e.message || 'Could not delete job', 'error');
                }
              }
              break;
          }
        });
      });
    }

    async function duplicateJob(job) {
      try {
        const duplicateData = {
          title: job.title + ' (Copy)',
          department: job.department,
          location: job.location,
          type: job.type,
          salary: job.salary,
          description: job.description,
          requirements: job.requirements,
          responsibilities: job.responsibilities,
          status: 'draft',
          featured: false
        };
        await apiFetch('/jobs', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(duplicateData) 
        });
        showToast('Job Duplicated', 'A copy of the job has been created', 'success');
        loadJobs();
      } catch (e) {
        showToast('Duplicate Failed', e.message || 'Could not duplicate job', 'error');
      }
    }

    async function updateJobStatus(jobId, status) {
      try {
        await apiFetch(`/jobs/${jobId}`, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ status }) 
        });
        showToast('Job Updated', `Job status changed to ${status}`, 'success');
        loadJobs();
      } catch (e) {
        showToast('Update Failed', e.message || 'Could not update job status', 'error');
      }
    }

    function openJobModal(job = null) {
      editingJobId = job?._id || null;
      document.getElementById('jobModalTitle').textContent = job ? 'Edit Job' : 'Add Job';
      document.getElementById('jb-title').value = job?.title || '';
      document.getElementById('jb-location').value = job?.location || '';
      document.getElementById('jb-type').value = job?.type || 'full-time';
      document.getElementById('jb-salary').value = job?.salary || '';
      document.getElementById('jb-department').value = job?.department || '';
      document.getElementById('jb-description').value = job?.description || '';
      document.getElementById('jb-requirements').value = job?.requirements?.join('\n') || '';
      document.getElementById('jb-responsibilities').value = job?.responsibilities?.join('\n') || '';
      document.getElementById('jb-status').value = job?.status || 'draft';
      document.getElementById('jb-featured').checked = job?.featured || false;
      document.getElementById('jb-order').value = job?.order ?? 0;
      document.getElementById('jb-applylink').value = job?.applyLink || '';
      document.getElementById('jobFormError').textContent = '';
      document.getElementById('jobDeleteBtn').style.display = job ? 'inline-block' : 'none';
      document.getElementById('jobModalOverlay').classList.add('open');
    }

    document.getElementById('addJobBtn')?.addEventListener('click', () => openJobModal());
    document.getElementById('jobModalClose')?.addEventListener('click', () =>
      document.getElementById('jobModalOverlay').classList.remove('open')
    );
    document.getElementById('jobModalOverlay')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) document.getElementById('jobModalOverlay').classList.remove('open');
    });

    document.getElementById('jobSaveBtn')?.addEventListener('click', async () => {
      const requirements = document.getElementById('jb-requirements').value.trim().split('\n').map(s => s.trim()).filter(s => s);
      const responsibilities = document.getElementById('jb-responsibilities').value.trim().split('\n').map(s => s.trim()).filter(s => s);
      const body = {
        title: document.getElementById('jb-title').value.trim(),
        location: document.getElementById('jb-location').value.trim(),
        type: document.getElementById('jb-type').value,
        salary: document.getElementById('jb-salary').value.trim(),
        department: document.getElementById('jb-department').value.trim(),
        description: document.getElementById('jb-description').value.trim(),
        requirements,
        responsibilities,
        status: document.getElementById('jb-status').value,
        featured: document.getElementById('jb-featured').checked,
        order: Number(document.getElementById('jb-order').value) || 0,
        applyLink: document.getElementById('jb-applylink').value.trim()
      };
      if (!body.title || !body.location || !body.department || !body.description) {
        document.getElementById('jobFormError').textContent = 'Please fill in all required fields';
        return;
      }
      const btn = document.getElementById('jobSaveBtn');
      btn.textContent = 'Saving...';
      btn.disabled = true;
      try {
        if (editingJobId) {
          await apiFetch(`/jobs/${editingJobId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
          showToast('Job Updated', 'The job has been updated successfully', 'success');
        } else {
          await apiFetch('/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
          showToast('Job Added', 'The job has been added successfully', 'success');
        }
        document.getElementById('jobModalOverlay').classList.remove('open');
        loadJobs();
      } catch (e) {
        document.getElementById('jobFormError').textContent = e.message || 'Save failed';
        showToast('Save Failed', e.message || 'Could not save job', 'error');
      } finally {
        btn.textContent = 'Save Job';
        btn.disabled = false;
      }
    });

    document.getElementById('jobDeleteBtn')?.addEventListener('click', async () => {
      if (!editingJobId || !confirm('Delete this job?')) return;
      try {
        await apiFetch(`/jobs/${editingJobId}`, { method: 'DELETE' });
        showToast('Job Deleted', 'The job has been removed', 'success');
        document.getElementById('jobModalOverlay').classList.remove('open');
        loadJobs();
      } catch (e) {
        showToast('Delete Failed', e.message || 'Could not delete job', 'error');
      }
    });

    // ── JOB APPLICATIONS MANAGEMENT ──────────────────────────────────────────────
    let viewingApplicationId = null;

    async function loadJobApplications() {
      const response = await apiFetch('/job-applications');
      const applications = response?.data || response;
      const tbody = document.querySelector('#jobApplicationsTable tbody');
      if (!applications?.length) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty">No job applications yet.</td></tr>';
        return;
      }
      tbody.innerHTML = applications.map(a => `
        <tr>
          <td>${esc(a.applicantName)}</td>
          <td>${esc(a.applicantEmail)}</td>
          <td>${esc(a.applicantPhone || '—')}</td>
          <td>${esc(a.jobId?.title || 'Unknown Job')}</td>
          <td><span class="badge badge-${esc(a.status)}">${esc(a.status)}</span></td>
          <td>${fmtDate(a.createdAt)}</td>
          <td>
            <button class="btn-view view-app-btn" data-id="${esc(a._id)}">View</button>
            ${a.status !== 'hired' && a.status !== 'rejected' ? `<button class="btn-delete delete-app-btn" data-id="${esc(a._id)}">Delete</button>` : ''}
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('.view-app-btn').forEach(btn => {
        btn.addEventListener('click', () => openJobApplicationModal(applications.find(a => a._id === btn.dataset.id)));
      });
      tbody.querySelectorAll('.delete-app-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this application?')) return;
          try {
            await apiFetch(`/job-applications/${btn.dataset.id}`, { method: 'DELETE' });
            showToast('Application Deleted', 'The application has been removed', 'success');
            loadJobApplications();
          } catch (e) {
            showToast('Delete Failed', e.message || 'Could not delete application', 'error');
          }
        });
      });
    }

    function openJobApplicationModal(application) {
      viewingApplicationId = application?._id || null;
      document.getElementById('jobApplicationModalTitle').textContent = 'Job Application Details';
      document.getElementById('jobApplicationModalGrid').innerHTML = `
        <div><span>Applicant Name</span><strong>${esc(application.applicantName)}</strong></div>
        <div><span>Email</span><strong>${esc(application.applicantEmail)}</strong></div>
        <div><span>Phone</span><strong>${esc(application.applicantPhone || '—')}</strong></div>
        <div><span>Job</span><strong>${esc(application.jobId?.title || 'Unknown Job')}</strong></div>
        <div><span>Resume</span><strong>${application.resumeUrl ? `<a href="${esc(application.resumeUrl)}" target="_blank" style="color: #3b82f6;" onclick="handleResumeClick(event, '${esc(application.resumeUrl)}')">View</a>` : '—'}</strong></div>
        <div><span>Portfolio</span><strong>${application.portfolioUrl ? `<a href="${esc(application.portfolioUrl)}" target="_blank" style="color: #3b82f6;">View</a>` : '—'}</strong></div>
        <div><span>LinkedIn</span><strong>${application.linkedinUrl ? `<a href="${esc(application.linkedinUrl)}" target="_blank" style="color: #3b82f6;">View</a>` : '—'}</strong></div>
        <div><span>Applied Date</span><strong>${fmtDate(application.createdAt)}</strong></div>
        ${application.coverLetter ? `<div style="grid-column: 1 / -1;"><span>Cover Letter</span><div style="margin-top: 0.5rem; padding: 0.75rem; background: rgba(0,0,0,0.05); border-radius: 8px;">${esc(application.coverLetter)}</div></div>` : ''}
      `;
      document.getElementById('jobAppStatus').value = application.status;
      document.getElementById('jobAppNotes').value = application.notes || '';
      document.getElementById('jobApplicationModalOverlay').classList.add('open');
    }

    function handleResumeClick(event, resumeUrl) {
      // Check if we're on Railway (ephemeral storage warning)
      if (window.location.hostname.includes('railway') || window.location.hostname.includes('onrailway')) {
        const confirmView = confirm('⚠️ Railway Warning: Uploaded files may be lost due to ephemeral storage. Consider using cloud storage (AWS S3, Cloudinary) for production.\n\nContinue to view resume?');
        if (!confirmView) {
          event.preventDefault();
          return false;
        }
      }
      return true;
    }

    document.getElementById('jobApplicationModalClose')?.addEventListener('click', () =>
      document.getElementById('jobApplicationModalOverlay').classList.remove('open')
    );
    document.getElementById('jobApplicationModalOverlay')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) document.getElementById('jobApplicationModalOverlay').classList.remove('open');
    });

    document.getElementById('jobApplicationSaveBtn')?.addEventListener('click', async () => {
      const body = {
        status: document.getElementById('jobAppStatus').value,
        notes: document.getElementById('jobAppNotes').value.trim()
      };
      const btn = document.getElementById('jobApplicationSaveBtn');
      btn.textContent = 'Saving...';
      btn.disabled = true;
      try {
        await apiFetch(`/job-applications/${viewingApplicationId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        showToast('Application Updated', 'The application has been updated successfully', 'success');
        document.getElementById('jobApplicationModalOverlay').classList.remove('open');
        loadJobApplications();
      } catch (e) {
        showToast('Save Failed', e.message || 'Could not update application', 'error');
      } finally {
        btn.textContent = 'Save Changes';
        btn.disabled = false;
      }
    });

}

// ── UTILS ───────────────────────────────────────────────────────────────
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ── BULK SELECT HELPERS ─────────────────────────────────────────────────
function updateBulkBar(prefix) {
  const checked = document.querySelectorAll(`.${prefix}-checkbox:checked`);
  const deleteBtn = document.getElementById(`${prefix}BulkDelete`);
  const countEl  = document.getElementById(`${prefix}BulkCount`);
  if (deleteBtn) deleteBtn.style.display = checked.length > 0 ? 'inline-flex' : 'none';
  if (countEl)   countEl.textContent = checked.length > 0 ? `${checked.length} selected` : '';
}

async function bulkDelete(prefix, apiPath, reloadFn) {
  const checked = [...document.querySelectorAll(`.${prefix}-checkbox:checked`)];
  if (!checked.length) return;
  if (!confirm(`Delete ${checked.length} item(s)? This cannot be undone.`)) return;
  const ids = checked.map(cb => cb.dataset.id);
  try {
    // Delete one by one (bulk endpoint only exists for contacts)
    await Promise.all(ids.map(id => apiFetch(`/${apiPath}/${id}`, { method: 'DELETE' })));
    showToast('Deleted', `${ids.length} item(s) removed`, 'success');
    reloadFn();
  } catch(e) { showToast('Error', e.message, 'error'); }
}

// ── ANALYTICS ──────────────────────────────────────────────────────────────
const anCharts = {};

function destroyChart(key) {
  if (anCharts[key]) { anCharts[key].destroy(); delete anCharts[key]; }
}

function getChartColors(isDark) {
  return {
    accent:   isDark ? '#3b82f6' : '#e8930a',
    accent2:  isDark ? '#8b5cf6' : '#1B4F72',
    accent3:  isDark ? '#10b981' : '#E8501A',
    accent4:  isDark ? '#f59e0b' : '#2dd4bf',
    grid:     isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    text:     isDark ? '#94a3b8' : '#666',
    surface:  isDark ? '#1e293b' : '#e0e5ec',
  };
}

async function loadAnalytics() {
  const isDark = document.documentElement.classList.contains('dark');
  const c = getChartColors(isDark);
  const days = parseInt(document.getElementById('analyticsRange')?.value || '30', 10);

  // Fetch all data in parallel
  const [stats, chartData, allContacts, emailLogs] = await Promise.all([
    apiFetch('/dashboard/stats'),
    apiFetch('/dashboard/leads-chart'),
    apiFetch('/dashboard/contacts?limit=1000'),
    apiFetch('/dashboard/emails?limit=1000'),
  ]);

  const contacts = allContacts?.contacts || [];
  const emails   = emailLogs?.emails || [];

  // ── KPI Cards ──────────────────────────────────────────
  const total = contacts.length;
  const statusMap = {};
  (stats.byStatus || []).forEach(s => { statusMap[s._id] = s.count; });
  const converted = (statusMap.contacted || 0) + (statusMap.closed || 0);
  const convRate  = total > 0 ? ((converted / total) * 100).toFixed(1) + '%' : '—';

  const serviceCounts = {};
  contacts.forEach(lead => { if (lead.serviceInterested) serviceCounts[lead.serviceInterested] = (serviceCounts[lead.serviceInterested] || 0) + 1; });
  const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const countryCounts = {};
  contacts.forEach(lead => { if (lead.country) countryCounts[lead.country] = (countryCounts[lead.country] || 0) + 1; });
  const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const budgets = contacts.map(lead => parseInt(lead.budget)).filter(n => !isNaN(n));
  function fmtINR(val) {
    if (val >= 10000000) return `₹${(val/10000000).toFixed(1)}Cr`;
    if (val >= 100000)   return `₹${(val/100000).toFixed(1)}L`;
    if (val >= 1000)     return `₹${(val/1000).toFixed(0)}K`;
    return `₹${val.toLocaleString('en-IN')}`;
  }
  const totalBudget = budgets.length > 0 ? fmtINR(budgets.reduce((a, b) => a + b, 0)) : '—';
  const avgBudget = budgets.length > 0 ? fmtINR(Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length)) : '—';

  const sentEmails = emails.filter(e => e.status === 'sent').length;
  const emailRate = emails.length > 0 ? ((sentEmails / emails.length) * 100).toFixed(0) + '%' : '—';

  document.getElementById('an-totalLeads').textContent  = total;
  document.getElementById('an-conversion').textContent  = convRate;
  document.getElementById('an-topService').textContent  = topService;
  document.getElementById('an-topCountry').textContent  = topCountry;
  document.getElementById('an-avgBudget').textContent   = avgBudget;
  document.getElementById('an-emailRate').textContent   = emailRate;

  // ── Line chart: leads over time (last N days) ──────────
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  cutoff.setHours(0, 0, 0, 0);

  const dayMap = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(cutoff);
    d.setDate(d.getDate() + i);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  contacts.forEach(lead => {
    const key = new Date(lead.createdAt).toISOString().slice(0, 10);
    if (dayMap[key] !== undefined) dayMap[key]++;
  });

  const lineLabels = Object.keys(dayMap).map(d => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  });
  const lineData = Object.values(dayMap);

  const startStr = Object.keys(dayMap)[0];
  const endStr   = Object.keys(dayMap).slice(-1)[0];
  const fmt = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const dateRangeEl = document.getElementById('an-leadsDateRange');
  if (dateRangeEl) dateRangeEl.textContent = `${fmt(startStr)} – ${fmt(endStr)}`;

  destroyChart('line');
  const lineCtx = document.getElementById('chartLeadsLine')?.getContext('2d');
  if (lineCtx) {
    const grad = lineCtx.createLinearGradient(0, 0, 0, 200);
    grad.addColorStop(0, isDark ? 'rgba(59,130,246,0.3)' : 'rgba(232,147,10,0.25)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    anCharts.line = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: lineLabels,
        datasets: [{
          label: 'Leads',
          data: lineData,
          borderColor: c.accent,
          backgroundColor: grad,
          borderWidth: 2.5,
          pointBackgroundColor: c.accent,
          pointRadius: 3,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { color: c.grid }, ticks: { color: c.text, maxTicksLimit: 10, maxRotation: 0 } },
          y: { grid: { color: c.grid }, ticks: { color: c.text, stepSize: 1 }, beginAtZero: true },
        }
      }
    });
  }

  // ── Doughnut: leads by service ─────────────────────────
  const serviceEntries = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const palette = [c.accent, c.accent2, c.accent3, c.accent4,
    '#f97316', '#a855f7', '#06b6d4'];

  destroyChart('doughnut');
  const dCtx = document.getElementById('chartServiceDoughnut')?.getContext('2d');
  if (dCtx && serviceEntries.length) {
    anCharts.doughnut = new Chart(dCtx, {
      type: 'doughnut',
      data: {
        labels: serviceEntries.map(e => e[0]),
        datasets: [{
          data: serviceEntries.map(e => e[1]),
          backgroundColor: palette,
          borderColor: c.surface,
          borderWidth: 3,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: { legend: { display: false }, tooltip: { callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.parsed} (${((ctx.parsed / total) * 100).toFixed(1)}%)`
        }}}
      }
    });
    // Custom legend
    const legend = document.getElementById('an-serviceLegend');
    if (legend) {
      legend.innerHTML = serviceEntries.map((e, i) => `
        <div class="an-legend-item">
          <span class="an-legend-dot" style="background:${palette[i]}"></span>
          <span class="an-legend-label">${e[0]}</span>
          <span class="an-legend-val">${e[1]}</span>
        </div>`).join('');
    }
  }

  // ── Bar: leads by status ───────────────────────────────
  const statusColors = { new: c.accent, contacted: c.accent2, closed: c.accent3, proposal: c.accent4 };
  const statusEntries = (stats.byStatus || []).filter(s => s._id);

  destroyChart('statusBar');
  const sbCtx = document.getElementById('chartStatusBar')?.getContext('2d');
  if (sbCtx) {
    anCharts.statusBar = new Chart(sbCtx, {
      type: 'bar',
      data: {
        labels: statusEntries.map(s => s._id.charAt(0).toUpperCase() + s._id.slice(1)),
        datasets: [{
          label: 'Leads',
          data: statusEntries.map(s => s.count),
          backgroundColor: statusEntries.map(s => statusColors[s._id] || c.accent),
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: c.text } },
          y: { grid: { color: c.grid }, ticks: { color: c.text, stepSize: 1 }, beginAtZero: true },
        }
      }
    });
  }

  // ── Bar: email activity ────────────────────────────────
  const emailStats = stats.emailStats || {};
  destroyChart('emailBar');
  const ebCtx = document.getElementById('chartEmailBar')?.getContext('2d');
  if (ebCtx) {
    anCharts.emailBar = new Chart(ebCtx, {
      type: 'bar',
      data: {
        labels: ['Outgoing', 'Incoming', 'Auto-response', 'Sent', 'Failed', 'Pending'],
        datasets: [{
          label: 'Count',
          data: [
            emailStats.outgoing || 0,
            emailStats.incoming || 0,
            emailStats.autoResponses || 0,
            emails.filter(e => e.status === 'sent').length,
            emails.filter(e => e.status === 'failed').length,
            emails.filter(e => e.status === 'pending').length,
          ],
          backgroundColor: [c.accent2, c.accent, c.accent4, '#10b981', '#ef4444', '#f59e0b'],
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: c.grid }, ticks: { color: c.text, stepSize: 1 }, beginAtZero: true },
          y: { grid: { display: false }, ticks: { color: c.text } },
        }
      }
    });
  }

  // ── Country table ──────────────────────────────────────
  const countryList = document.getElementById('an-countryList');
  if (countryList) {
    const top10 = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const maxVal = top10[0]?.[1] || 1;
    countryList.innerHTML = top10.length
      ? top10.map(([country, count]) => `
          <div class="an-country-row">
            <span class="an-country-name">${country}</span>
            <div class="an-country-bar-wrap">
              <div class="an-country-bar" style="width:${(count / maxVal) * 100}%"></div>
            </div>
            <span class="an-country-count">${count}</span>
          </div>`).join('')
      : '<p style="color:var(--text-secondary);padding:1rem">No country data yet</p>';
  }
}

// Re-render charts on theme change (already handled by toggleClick, but also wire range change)
document.getElementById('analyticsRange')?.addEventListener('change', () => {
  if (document.getElementById('view-analytics')?.classList.contains('active')) loadAnalytics();
});
document.getElementById('analyticsRefreshBtn')?.addEventListener('click', () => loadAnalytics());
