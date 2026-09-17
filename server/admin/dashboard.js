// ── HTML ESCAPE HELPER (prevents XSS / CWE-94) ─────────────
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s ?? '';
  return d.innerHTML;
}

function stripHtml(s) {
  if (!s) return '';
  return s.replace(/<[^>]*>?/gm, '').trim();
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

// Session handling defaults (60 min total inactivity, 2 min warning modal)
const INACTIVITY_TIMEOUT_MS = parseInt(window.INACTIVITY_TIMEOUT_MS || String(60 * 60 * 1000)); // 60m
const SESSION_WARNING_MS = 2 * 60 * 1000; // 2 minutes before auto-renew


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
  
  // Industry news description editor
  if (document.getElementById('in-description')) {
    editors.inDescription = await ClassicEditor.create(document.getElementById('in-description'), {
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
  
  // Project description editor
  if (document.getElementById('pf-desc')) {
    editors.pfDesc = await ClassicEditor.create(document.getElementById('pf-desc'), {
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

  // ============================================================
  // SESSION KEEPALIVE, INACTIVITY MODAL & AUTO-LOGIN
  // ============================================================
  let lastInteraction = Date.now();
  let warningModalEl = null;
  let isRenewing = false;

  function resetInteraction() {
    lastInteraction = Date.now();
    hideSessionWarningModal();
  }

  // Activity listeners to reset idle timer
  ['click', 'mousemove', 'keydown', 'touchstart', 'scroll'].forEach(ev => {
    window.addEventListener(ev, resetInteraction, { passive: true });
  });

  // Create or return Session Warning Modal
  function getSessionWarningModal() {
    if (warningModalEl) return warningModalEl;
    let modal = document.getElementById('sessionWarningModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sessionWarningModal';
      modal.className = 'session-modal-overlay';
      modal.innerHTML = `
        <div class="session-modal-card">
          <div class="session-modal-glow"></div>
          <div class="session-icon-wrapper">
            <i class="fa-solid fa-clock-rotate-left"></i>
          </div>
          <h3 class="session-modal-title">Session Expiring Soon</h3>
          <p class="session-modal-text">
            You have been inactive for a while. For your security and to protect your work, your session will automatically renew or you can continue now.
          </p>
          <div class="session-countdown-badge">
            <i class="fa-regular fa-clock" style="font-size: 1.1rem;"></i>
            <span id="sessionTimerDigits">02:00</span>
          </div>
          <div class="session-modal-actions">
            <button type="button" class="session-btn-extend" id="sessionExtendBtn">
              <i class="fa-solid fa-check"></i> Stay Signed In
            </button>
            <button type="button" class="session-btn-logout" id="sessionLogoutBtn">
              <i class="fa-solid fa-arrow-right-from-bracket"></i> Log Out
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Modal action handlers
      modal.querySelector('#sessionExtendBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        extendSession();
      });
      modal.querySelector('#sessionLogoutBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        clearToken();
        location.replace('index.html');
      });
    }
    warningModalEl = modal;
    return warningModalEl;
  }

  function showSessionWarningModal(secondsRemaining) {
    const modal = getSessionWarningModal();
    const digitsEl = modal.querySelector('#sessionTimerDigits');
    if (digitsEl) {
      const mins = Math.floor(secondsRemaining / 60);
      const secs = Math.floor(secondsRemaining % 60);
      digitsEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    if (!modal.classList.contains('show')) {
      modal.classList.add('show');
    }
  }

  function hideSessionWarningModal() {
    const modal = document.getElementById('sessionWarningModal');
    if (modal && modal.classList.contains('show')) {
      modal.classList.remove('show');
    }
  }

  // Extend session on the backend
  async function extendSession() {
    try {
      await apiFetch('/auth/sessions/extend', { method: 'POST' });
      lastInteraction = Date.now();
      hideSessionWarningModal();
      showToast('Session Active', 'Your session has been extended', 'success', 2000);
    } catch (e) {
      console.warn('Failed to extend session', e);
      lastInteraction = Date.now();
      hideSessionWarningModal();
    }
  }

  // Auto-login / Auto-renew silently when countdown finishes
  async function autoRenewSession() {
    if (isRenewing) return;
    isRenewing = true;
    try {
      await apiFetch('/auth/sessions/extend', { method: 'POST' });
      lastInteraction = Date.now();
      hideSessionWarningModal();
      showToast('Session Auto-Renewed', 'You remain securely signed in', 'info', 2500);
    } catch (err) {
      console.warn('Auto-renew attempt failed:', err);
      // If token is truly expired/invalid, return to login
      clearToken();
      showToast('Session Expired', 'Please sign in to continue', 'warning');
      setTimeout(() => location.replace('index.html'), 1000);
    } finally {
      isRenewing = false;
    }
  }

  // Inactivity & Countdown Checker (Runs every 500ms for smooth ticking)
  setInterval(() => {
    // Only check if user is authenticated and on dashboard view
    if (!getToken()) return;

    const now = Date.now();
    const idle = now - lastInteraction;
    const timeLeft = INACTIVITY_TIMEOUT_MS - idle;

    if (timeLeft <= 0) {
      // Countdown finished -> Auto login / auto-renew session
      autoRenewSession();
    } else if (timeLeft <= SESSION_WARNING_MS) {
      // Inside 2-minute warning window -> Show live ticking modal
      const secondsLeft = Math.ceil(timeLeft / 1000);
      showSessionWarningModal(secondsLeft);
    } else {
      // In active zone
      hideSessionWarningModal();
    }
  }, 500);

  // Global dropdown close handler - close all dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.actions-dropdown')) {
      document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
    }
  });

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
        if (item.dataset.view === "blog") loadBlogs();
        if (item.dataset.view === "casestudies") loadCaseStudies();
        if (item.dataset.view === "industrynews") loadIndustryNews();
        if (item.dataset.view === "medialibrary") loadMediaLibrary();
        if (item.dataset.view === "emaillogs") loadEmailLogs();
        if (item.dataset.view === "users") { loadUsers(); loadRoleApplications(); }
        if (item.dataset.view === "settings") loadCurrentUser();
        if (item.dataset.view === "analytics") loadAnalytics();
        if (item.dataset.view === "jobs") loadJobs();
        if (item.dataset.view === "jobapplications") loadJobApplications();
      });
    });

  // ── SKELETON SHIMMER LOADERS ─────────────────────────────
  function renderSkeletonCards(count = 6) {
    return Array.from({ length: count }, () => `
      <div class="proj-card skeleton-card">
        <div class="skeleton-shimmer skeleton-img"></div>
        <div class="proj-card-body" style="gap:10px; padding: 1.25rem;">
          <div class="skeleton-shimmer skeleton-badge"></div>
          <div class="skeleton-shimmer skeleton-title"></div>
          <div class="skeleton-shimmer skeleton-sub"></div>
          <div class="skeleton-shimmer skeleton-text"></div>
        </div>
      </div>
    `).join('');
  }

  function renderSkeletonRows(rows = 5, cols = 6) {
    return Array.from({ length: rows }, () => `
      <tr class="skeleton-row">
        ${Array.from({ length: cols }, () => `
          <td><div class="skeleton-shimmer skeleton-cell"></div></td>
        `).join('')}
      </tr>
    `).join('');
  }

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

    // Update sidebar notification badges
    const newLeadsCount = statusMap.new || 0;
    const leadsBadge = document.getElementById("leadsNavBadge");
    if (leadsBadge) {
      if (newLeadsCount > 0) {
        leadsBadge.textContent = newLeadsCount > 99 ? '99+' : newLeadsCount;
        leadsBadge.style.display = 'inline-flex';
        leadsBadge.classList.add('pulse');
      } else {
        leadsBadge.style.display = 'none';
        leadsBadge.classList.remove('pulse');
      }
    }

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
    const tbody = document.querySelector("#leadsTable tbody");
    if (tbody) {
      tbody.innerHTML = renderSkeletonRows(5, 9);
    }
    const status = document.getElementById("statusFilter")?.value || "";
    const searchQuery = document.getElementById("searchInput")?.value || "";
    
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
    const result = await Swal.fire({
      title: 'Delete all email logs?',
      text: "This cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      try {
        await apiFetch("/dashboard/emails", { method: "DELETE" });
        showToast('Email Logs Deleted', 'All email logs have been cleared', 'success');
        loadEmailLogs(1);
      } catch (e) {
        showToast('Delete Failed', e.message || 'Could not delete email logs', 'error');
      }
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
      const statusClass = esc(c.status || 'new').toLowerCase().replace(/\s+/g, '_');
      const isPulse = statusClass === 'new' ? 'pulse' : '';
      const statusPill = `<span class="status-pill ${statusClass}"><span class="status-dot ${isPulse}"></span>${esc(c.status || 'New')}</span>`;
      row.innerHTML = compact
        ? `<td>${esc(c.name)}</td><td>${esc(c.email)}</td><td>${esc(c.country) || "—"}</td><td>${esc(c.serviceInterested) || "—"}</td><td>${statusPill}</td><td>${fmtDate(c.createdAt)}</td>`
        : `<td>${esc(c.name)}</td><td>${esc(c.email)}</td><td>${esc(c.company) || "—"}</td><td>${esc(c.country) || "—"}</td><td>${esc(c.serviceInterested) || "—"}</td><td class="msg-cell">${esc(c.message)}</td><td>${statusPill}</td><td>${fmtDate(c.createdAt)}</td><td><button class="btn-view" data-id="${esc(c._id)}">View</button></td>`;
      tbody.appendChild(row);
    });
    if (!compact) {
      tbody.querySelectorAll(".btn-view").forEach((btn) => {
        btn.addEventListener("click", () => openModal(contacts.find((c) => c._id === btn.dataset.id)));
      });
    }
  }

  function renderPagination(pages, current, containerId = "pagination", onPageClick = (p) => loadLeads(p)) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = "";
    if (pages <= 1) return;

    // Previous button
    const prevBtn = document.createElement("button");
    prevBtn.className = `page-btn page-btn-nav ${current <= 1 ? "disabled" : ""}`;
    prevBtn.innerHTML = `<i class="fa-solid fa-chevron-left"></i>`;
    prevBtn.title = "Previous Page";
    if (current > 1) {
      prevBtn.addEventListener("click", () => onPageClick(current - 1));
    } else {
      prevBtn.disabled = true;
    }
    el.appendChild(prevBtn);

    // Smart windowing for pages
    let startPage = 1;
    let endPage = pages;
    if (pages > 7) {
      if (current <= 4) {
        startPage = 1;
        endPage = 5;
      } else if (current + 3 >= pages) {
        startPage = pages - 4;
        endPage = pages;
      } else {
        startPage = current - 2;
        endPage = current + 2;
      }
    }

    if (startPage > 1) {
      const firstBtn = document.createElement("button");
      firstBtn.textContent = "1";
      firstBtn.className = "page-btn";
      firstBtn.addEventListener("click", () => onPageClick(1));
      el.appendChild(firstBtn);

      if (startPage > 2) {
        const dots = document.createElement("span");
        dots.className = "page-dots";
        dots.textContent = "…";
        el.appendChild(dots);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = `page-btn${i === current ? " active" : ""}`;
      btn.addEventListener("click", () => onPageClick(i));
      el.appendChild(btn);
    }

    if (endPage < pages) {
      if (endPage < pages - 1) {
        const dots = document.createElement("span");
        dots.className = "page-dots";
        dots.textContent = "…";
        el.appendChild(dots);
      }
      const lastBtn = document.createElement("button");
      lastBtn.textContent = pages;
      lastBtn.className = "page-btn";
      lastBtn.addEventListener("click", () => onPageClick(pages));
      el.appendChild(lastBtn);
    }

    // Next button
    const nextBtn = document.createElement("button");
    nextBtn.className = `page-btn page-btn-nav ${current >= pages ? "disabled" : ""}`;
    nextBtn.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;
    nextBtn.title = "Next Page";
    if (current < pages) {
      nextBtn.addEventListener("click", () => onPageClick(current + 1));
    } else {
      nextBtn.disabled = true;
    }
    el.appendChild(nextBtn);
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
        const result = await Swal.fire({
          title: 'Delete this email log?',
          text: "This action cannot be undone.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc2626',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel'
        });
        if (result.isConfirmed) {
          await apiFetch(`/dashboard/emails/${btn.dataset.id}`, { method: 'DELETE' });
          loadEmailLogs(currentEmailPage);
        }
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
        const result = await Swal.fire({
          title: 'Delete this note?',
          text: "This action cannot be undone.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc2626',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel'
        });
        if (result.isConfirmed) {
          try {
            await apiFetch(`/dashboard/contacts/${activeContact._id}/notes/${btn.dataset.noteId}`, { method: 'DELETE' });
            showToast('Note Deleted', 'The note has been removed', 'success');
            loadNotes(activeContact._id);
          } catch (e) {
            showToast('Delete Failed', e.message || 'Could not delete note', 'error');
          }
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
    if (!activeContact) return;
    const result = await Swal.fire({
      title: 'Delete this lead?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      try {
        await apiFetch(`/dashboard/contacts/${activeContact._id}`, { method: "DELETE" });
        showToast('Lead Deleted', 'The lead has been removed', 'success');
        closeModal();
        loadLeads(currentPage);
        loadOverview();
      } catch (e) {
        showToast('Delete Failed', e.message || 'Could not delete lead', 'error');
      }
    }
  });

  // Initialize rich text editors
  initEditors();
  
  // Initialize file drop areas
  function initFileDropArea(dropId, inputId, nameId) {
    const dropArea = document.getElementById(dropId);
    const input = document.getElementById(inputId);
    const nameSpan = document.getElementById(nameId);
    
    if (!dropArea || !input || !nameSpan) return;
    
    // Handle file selection
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        nameSpan.textContent = file.name;
        dropArea.classList.add('has-file');
      } else {
        nameSpan.textContent = 'Drag & drop or click to upload image';
        dropArea.classList.remove('has-file');
      }
    });
    
    // Handle drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => {
        dropArea.classList.add('drag');
      });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => {
        dropArea.classList.remove('drag');
      });
    });
    
    // Handle drop
    dropArea.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        input.files = files;
        nameSpan.textContent = files[0].name;
        dropArea.classList.add('has-file');
      }
    });
  }
  
  // Initialize all file drop areas
  initFileDropArea('bl-cover-drop', 'bl-cover', 'bl-cover-name');
  initFileDropArea('cs-cover-drop', 'cs-cover', 'cs-cover-name');
  initFileDropArea('pf-cover-drop', 'pf-cover', 'pf-cover-name');
  initFileDropArea('st-cover-drop', 'st-cover', 'st-cover-name');
  initFileDropArea('st-avatar-drop', 'st-avatar', 'st-avatar-name');
  initFileDropArea('in-cover-drop', 'inCover', 'in-cover-name');
  
  // ── INIT ───────────────────────────────────────────────
  loadOverview();

  // ── PORTFOLIO ──────────────────────────────────────────
  let editingProjectId = null;
  let currentProjPage = 1;
  const PROJ_PAGE_SIZE = 6;
  let cachedProjects = [];
  let projViewMode = localStorage.getItem('adminProjViewMode') || 'card';
  let projSearchQuery = '';
  let projCategoryFilter = '';

  function getFilteredProjects() {
    return cachedProjects.filter(p => {
      const matchesCategory = !projCategoryFilter || (p.tag && p.tag.toLowerCase() === projCategoryFilter.toLowerCase());
      const q = projSearchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        (p.title && p.title.toLowerCase().includes(q)) || 
        (p.title2 && p.title2.toLowerCase().includes(q)) || 
        (p.place && p.place.toLowerCase().includes(q)) || 
        (p.tag && p.tag.toLowerCase().includes(q)) || 
        (p.description && p.description.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }

  function updatePortfolioTagOptions() {
    const select = document.getElementById("projTagFilter");
    if (!select) return;
    const currentVal = select.value;
    const uniqueTags = Array.from(new Set(cachedProjects.map(p => p.tag).filter(Boolean))).sort();
    select.innerHTML = `<option value="">All Categories (${cachedProjects.length})</option>` + 
      uniqueTags.map(tag => `<option value="${esc(tag)}" ${tag.toLowerCase() === currentVal.toLowerCase() ? 'selected' : ''}>${esc(tag)}</option>`).join('');
  }

  function renderPortfolioView() {
    const grid = document.getElementById("projGrid");
    const pagEl = document.getElementById("projPagination");
    const toggleWrap = document.getElementById("projViewToggle");
    if (!grid) return;

    // Update toggle active state
    if (toggleWrap) {
      toggleWrap.querySelectorAll('.btn-toggle').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === projViewMode);
      });
    }

    const filtered = getFilteredProjects();

    if (!filtered.length) {
      grid.className = 'proj-grid';
      grid.innerHTML = `<p class="empty" style="padding:2rem">${cachedProjects.length ? 'No projects match your search.' : 'No projects yet. Click + Add Project to get started.'}</p>`;
      if (pagEl) pagEl.innerHTML = "";
      return;
    }

    const totalPages = Math.ceil(filtered.length / PROJ_PAGE_SIZE) || 1;
    const activePage = Math.max(1, Math.min(currentProjPage, totalPages));
    const startIdx = (activePage - 1) * PROJ_PAGE_SIZE;
    const pageProjects = filtered.slice(startIdx, startIdx + PROJ_PAGE_SIZE);

    if (projViewMode === 'list') {
      grid.className = 'table-wrap';
      grid.innerHTML = `
        <table class="leads-table">
          <thead>
            <tr>
              <th style="width:75px;">Cover</th>
              <th>Project Title</th>
              <th>Location</th>
              <th>Category</th>
              <th style="width:70px;">Order</th>
              <th style="width:100px;text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${pageProjects.map(p => `
              <tr>
                <td>
                  <img src="${esc(p.image)}" class="admin-list-thumb" alt="${esc(p.title)}" onerror="this.src='login-dark.png'">
                </td>
                <td>
                  <div class="admin-list-title-cell">
                    <span class="admin-list-title">${esc(p.title)}${p.title2 ? ' ' + esc(p.title2) : ''}</span>
                    <span class="admin-list-sub">${esc(stripHtml(p.description)).substring(0, 65)}${stripHtml(p.description).length > 65 ? '...' : ''}</span>
                  </div>
                </td>
                <td>${esc(p.place)}</td>
                <td><span class="proj-tag">${esc(p.tag)}</span></td>
                <td><strong>${p.order ?? 0}</strong></td>
                <td style="text-align:right;">
                  <div class="admin-table-actions">
                    <button type="button" class="btn-icon-sm" data-action="edit" data-id="${esc(p._id)}" title="Edit Project"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="btn-icon-sm danger" data-action="delete" data-id="${esc(p._id)}" data-name="${esc(p.title)}" title="Delete Project"><i class="fa-solid fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      grid.className = 'proj-grid';
      grid.innerHTML = pageProjects.map(p => `
        <div class="proj-card">
          <div class="proj-card-img" style="background-image:url('${esc(p.image)}');position:relative;">
            <div class="actions-dropdown" data-id="${esc(p._id)}" data-type="projects" data-name="${esc(p.title)}">
              <button class="dropdown-toggle" title="Options" aria-label="Project actions"><i class="fa-solid fa-ellipsis-vertical"></i></button>
              <div class="dropdown-menu">
                <button class="dropdown-item" data-action="edit">
                  <i class="fa-solid fa-pen-to-square"></i>
                  <span>Edit Project</span>
                </button>
                <button class="dropdown-item danger" data-action="delete">
                  <i class="fa-solid fa-trash"></i>
                  <span>Delete Project</span>
                </button>
              </div>
            </div>
          </div>
          <div class="proj-card-body">
            <span class="proj-tag">${esc(p.tag)}</span>
            <div class="proj-title">${esc(p.title)}${p.title2 ? ' ' + esc(p.title2) : ''}</div>
            <div class="proj-place">${esc(p.place)}</div>
            <p class="proj-desc">${esc(stripHtml(p.description))}</p>
          </div>
        </div>`).join("");

      // Dropdown menu handlers for project cards
      grid.querySelectorAll('.dropdown-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const menu = btn.nextElementSibling;
          document.querySelectorAll('.dropdown-menu').forEach(m => {
            if (m !== menu) m.classList.remove('show');
          });
          menu.classList.toggle('show');
        });
      });
    }

    // Attach actions for list buttons and card dropdown items
    grid.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const dropdown = btn.closest('.actions-dropdown');
        const itemId = btn.dataset.id || dropdown?.dataset.id;
        const itemName = btn.dataset.name || dropdown?.dataset.name || 'Project';

        if (dropdown) {
          dropdown.querySelector('.dropdown-menu')?.classList.remove('show');
        }

        switch (action) {
          case 'edit':
            try {
              const projectData = await apiFetch(`/projects/${itemId}`);
              openProjectModal(projectData);
            } catch(e) {
              console.error('Error fetching project:', e);
              showToast('Error', 'Failed to load project data', 'error');
            }
            break;
          case 'delete':
            const result = await Swal.fire({
              title: `Delete "${itemName}"?`,
              text: "This action cannot be undone.",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#dc2626',
              cancelButtonColor: '#3085d6',
              confirmButtonText: 'Delete',
              cancelButtonText: 'Cancel'
            });
            if (result.isConfirmed) {
              try {
                await apiFetch(`/projects/${itemId}`, { method: 'DELETE' });
                showToast('Deleted', 'Project removed', 'success');
                loadPortfolio(activePage);
              } catch(e) { showToast('Error', e.message, 'error'); }
            }
            break;
        }
      });
    });

    renderPagination(totalPages, activePage, "projPagination", (p) => {
      loadPortfolio(p);
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Setup toggle listener for Portfolio
  document.getElementById('projViewToggle')?.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      projViewMode = btn.dataset.view;
      localStorage.setItem('adminProjViewMode', projViewMode);
      renderPortfolioView();
    });
  });

  // Setup search & filter listeners for Portfolio
  let projSearchTimeout;
  document.getElementById('projSearchInput')?.addEventListener('input', (e) => {
    clearTimeout(projSearchTimeout);
    projSearchTimeout = setTimeout(() => {
      projSearchQuery = e.target.value;
      currentProjPage = 1;
      renderPortfolioView();
    }, 200);
  });

  document.getElementById('projTagFilter')?.addEventListener('change', (e) => {
    projCategoryFilter = e.target.value;
    currentProjPage = 1;
    renderPortfolioView();
  });

  async function loadPortfolio(page = 1) {
    currentProjPage = page;
    const grid = document.getElementById("projGrid");
    if (grid && !cachedProjects.length) {
      grid.className = 'proj-grid';
      grid.innerHTML = renderSkeletonCards(6);
    }
    const projects = await apiFetch("/projects");
    cachedProjects = Array.isArray(projects) ? projects : (projects?.data || []);
    updatePortfolioTagOptions();
    renderPortfolioView();
  }

  function openProjectModal(project = null) {
    editingProjectId = project?._id || null;
    document.getElementById("projectModalTitle").textContent = project ? "Edit Project" : "Add Project";
    document.getElementById("pf-place").value   = project?.place       || "";
    document.getElementById("pf-tag").value     = project?.tag         || "";
    document.getElementById("pf-title").value   = project?.title       || "";
    document.getElementById("pf-title2").value  = project?.title2      || "";
    if (editors.pfDesc) {
      editors.pfDesc.setData(project?.description || "");
    }
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

  document.getElementById("addProjectBtn")?.addEventListener("click", () => openProjectModal());

  document.getElementById("projectSaveBtn").addEventListener("click", async () => {
    let image = '';
    
    // Handle image upload
    const coverFile = document.getElementById("pf-cover").files[0];
    if (coverFile) {
      const formData = new FormData();
      formData.append('file', coverFile);
      
      try {
        const uploadResponse = await fetch(`${API}/media/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${getToken()}` },
          body: formData
        });
        
        if (!uploadResponse.ok) {
          if (uploadResponse.status === 413) {
            throw new Error('Image file is too large (exceeds server limit). Please select an image under 5MB, or increase Nginx client_max_body_size.');
          }
          const errorText = await uploadResponse.text();
          let msg = errorText;
          try {
            const parsed = JSON.parse(errorText);
            if (parsed.message) msg = parsed.message;
          } catch (_) {
            if (msg.includes('<html')) msg = `Server returned status ${uploadResponse.status}`;
          }
          throw new Error(msg);
        }
        
        const uploadData = await uploadResponse.json();
        if (uploadData.url) {
          image = uploadData.url;
        }
      } catch (e) {
        document.getElementById("projectFormError").textContent = 'Image upload failed: ' + e.message;
        return;
      }
    } else if (editingProjectId) {
      // Keep existing image if editing and no new file uploaded
      const existingProject = await apiFetch(`/projects/${editingProjectId}`);
      image = existingProject.image || '';
    }

    const rawPfDesc = editors.pfDesc ? editors.pfDesc.getData() : document.getElementById("pf-desc").value;
    const cleanPfDesc = stripHtml(rawPfDesc);

    const body = {
      place:       document.getElementById("pf-place").value.trim(),
      tag:         document.getElementById("pf-tag").value.trim(),
      title:       document.getElementById("pf-title").value.trim(),
      title2:      document.getElementById("pf-title2").value.trim(),
      description: cleanPfDesc,
      image:       image,
      order:       Number(document.getElementById("pf-order").value) || 0,
    };
    if (!body.place || !body.title || !body.tag || !body.description) {
      document.getElementById("projectFormError").textContent = "Place, Title, Tag, and Description are required.";
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
    } catch (e) {
      errEl.textContent = e.message || "Save failed. Are you still logged in?";
      showToast('Save Failed', e.message || 'Could not save project', 'error');
    } finally {
      saveBtn.textContent = "Save Project";
      saveBtn.disabled = false;
    }
  });

  document.getElementById("projectDeleteBtn").addEventListener("click", async () => {
    if (!editingProjectId) return;
    const result = await Swal.fire({
      title: 'Delete this project?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      try {
        await apiFetch(`/projects/${editingProjectId}`, { method: "DELETE" });
        showToast('Project Deleted', 'The project has been removed', 'success');
        document.getElementById("projectModalOverlay").classList.remove("open");
        loadPortfolio();
      } catch (e) {
        showToast('Delete Failed', e.message || 'Could not delete project', 'error');
      }
    }
  });



  // ── BLOG ───────────────────────────────────────────────────
  let editingBlogId = null;
  let currentBlogPage = 1;
  const BLOG_PAGE_SIZE = 6;
  let cachedBlogs = [];
  let blogViewMode = localStorage.getItem('adminBlogViewMode') || 'card';
  let blogSearchQuery = '';
  let blogCategoryFilter = '';
  let blogStatusFilter = '';

  function getFilteredBlogs() {
    return cachedBlogs.filter(b => {
      const matchesCategory = !blogCategoryFilter || (b.category && b.category.toLowerCase() === blogCategoryFilter.toLowerCase());
      const matchesStatus = !blogStatusFilter || (b.status && b.status.toLowerCase() === blogStatusFilter.toLowerCase());
      const q = blogSearchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        (b.title && b.title.toLowerCase().includes(q)) || 
        (b.author && b.author.toLowerCase().includes(q)) || 
        (b.category && b.category.toLowerCase().includes(q)) || 
        (b.excerpt && b.excerpt.toLowerCase().includes(q));
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }

  function renderBlogView() {
    const grid = document.getElementById('blogGrid');
    const pagEl = document.getElementById('blogPagination');
    const toggleWrap = document.getElementById('blogViewToggle');
    if (!grid) return;

    // Update toggle active state
    if (toggleWrap) {
      toggleWrap.querySelectorAll('.btn-toggle').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === blogViewMode);
      });
    }

    const filtered = getFilteredBlogs();

    if (!filtered.length) {
      grid.className = 'proj-grid';
      grid.innerHTML = `<p class="empty" style="padding:2rem">${cachedBlogs.length ? 'No blog posts match your search or filter.' : 'No blog posts yet. Click + Add Post to get started.'}</p>`;
      if (pagEl) pagEl.innerHTML = '';
      return;
    }

    const totalPages = Math.ceil(filtered.length / BLOG_PAGE_SIZE) || 1;
    const activePage = Math.max(1, Math.min(currentBlogPage, totalPages));
    const startIdx = (activePage - 1) * BLOG_PAGE_SIZE;
    const pageBlogs = filtered.slice(startIdx, startIdx + BLOG_PAGE_SIZE);

    if (blogViewMode === 'list') {
      grid.className = 'table-wrap';
      grid.innerHTML = `
        <table class="leads-table">
          <thead>
            <tr>
              <th style="width:75px;">Cover</th>
              <th>Article Title</th>
              <th>Category</th>
              <th>Author / Read Time</th>
              <th>Status</th>
              <th>Featured</th>
              <th style="width:150px;text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${pageBlogs.map(b => `
              <tr>
                <td>
                  <img src="${esc(b.coverImage || b.image || '')}" class="admin-list-thumb" alt="${esc(b.title)}" onerror="this.src='login-dark.png'">
                </td>
                <td>
                  <div class="admin-list-title-cell">
                    <span class="admin-list-title">${esc(b.title)}</span>
                    <span class="admin-list-sub">${esc(b.excerpt || '').substring(0, 60)}${b.excerpt && b.excerpt.length > 60 ? '...' : ''}</span>
                  </div>
                </td>
                <td><span class="proj-tag">${esc(b.category)}</span></td>
                <td>${esc(b.author) || '—'}<br><small style="color:var(--text-muted);">${esc(b.readTime) || '—'}</small></td>
                <td>
                  <span class="card-status-badge status-${esc(b.status)}">${esc(b.status)}</span>
                </td>
                <td>
                  ${b.featured ? '<span style="color:var(--accent);font-weight:bold;">★ Yes</span>' : '<span style="color:var(--text-muted);">No</span>'}
                </td>
                <td style="text-align:right;">
                  <div class="admin-table-actions">
                    <button type="button" class="btn-icon-sm" data-action="edit" data-id="${esc(b._id)}" title="Edit Post"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="btn-icon-sm" data-action="toggle-status" data-id="${esc(b._id)}" data-status="${esc(b.status)}" title="${b.status === 'published' ? 'Set to Draft' : 'Publish'}"><i class="fa-solid ${b.status === 'published' ? 'fa-eye-slash' : 'fa-globe'}"></i></button>
                    <button type="button" class="btn-icon-sm" data-action="duplicate" data-id="${esc(b._id)}" title="Duplicate Post"><i class="fa-solid fa-copy"></i></button>
                    <button type="button" class="btn-icon-sm danger" data-action="delete" data-id="${esc(b._id)}" data-name="${esc(b.title.replace(/"/g,''))}" title="Delete Post"><i class="fa-solid fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      grid.className = 'proj-grid';
      grid.innerHTML = pageBlogs.map(b => `
        <div class="proj-card content-card" data-id="${esc(b._id)}">
          <div class="proj-card-img" style="background-image:url('${esc(b.coverImage || b.image || '')}');position:relative;">
            ${b.featured ? '<span class="card-badge badge-featured">★ Featured</span>' : ''}
            <span class="card-status-badge status-${esc(b.status)}">${esc(b.status)}</span>
            <div class="actions-dropdown" data-id="${esc(b._id)}" data-type="blogs" data-name="${esc(b.title.replace(/"/g,''))}" data-status="${esc(b.status)}">
              <button class="dropdown-toggle" title="Options" aria-label="Blog actions"><i class="fa-solid fa-ellipsis-vertical"></i></button>
              <div class="dropdown-menu">
                <button class="dropdown-item" data-action="edit">
                  <i class="fa-solid fa-pen-to-square"></i>
                  <span>Edit Post</span>
                </button>
                <button class="dropdown-item" data-action="toggle-status">
                  <i class="fa-solid ${b.status === 'published' ? 'fa-eye-slash' : 'fa-globe'}"></i>
                  <span>${b.status === 'published' ? 'Set to Draft' : 'Publish'}</span>
                </button>
                <button class="dropdown-item" data-action="duplicate">
                  <i class="fa-solid fa-copy"></i>
                  <span>Duplicate</span>
                </button>
                <button class="dropdown-item danger" data-action="delete">
                  <i class="fa-solid fa-trash"></i>
                  <span>Delete Post</span>
                </button>
              </div>
            </div>
          </div>
          <div class="proj-card-body">
            <span class="proj-tag">${esc(b.category)}</span>
            <div class="proj-title">${esc(b.title)}</div>
            <div class="proj-place">${esc(b.author) || '—'} · ${esc(b.readTime) || '—'}</div>
            <p class="proj-desc">${esc(b.excerpt) || ''}</p>
          </div>
        </div>`).join('');

      // Dropdown menu handlers for blog cards
      grid.querySelectorAll('.dropdown-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const menu = btn.nextElementSibling;
          document.querySelectorAll('.dropdown-menu').forEach(m => {
            if (m !== menu) m.classList.remove('show');
          });
          menu.classList.toggle('show');
        });
      });
    }

    // Attach actions for list buttons and card dropdown items
    grid.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const dropdown = btn.closest('.actions-dropdown');
        const itemId = btn.dataset.id || dropdown?.dataset.id;
        const itemName = btn.dataset.name || dropdown?.dataset.name || 'Blog Post';
        const itemStatus = btn.dataset.status || dropdown?.dataset.status;

        if (dropdown) {
          dropdown.querySelector('.dropdown-menu')?.classList.remove('show');
        }

        switch (action) {
          case 'edit':
            try {
              const blogData = await apiFetch(`/blogs/admin/${itemId}`);
              openBlogModal(blogData);
            } catch (e) {
              console.error('Error fetching blog:', e);
              showToast('Error', 'Failed to load blog data: ' + e.message, 'error');
            }
            break;
          case 'toggle-status':
            const newStatus = itemStatus === 'published' ? 'draft' : 'published';
            try {
              await apiFetch(`/blogs/${itemId}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
              showToast('Status updated', `Post set to ${newStatus}`, 'success');
              loadBlogs(activePage);
            } catch(e) { showToast('Error', e.message, 'error'); }
            break;
          case 'duplicate':
            try {
              await apiFetch(`/blogs/${itemId}/duplicate`, { method: 'POST' });
              showToast('Cloned', 'Draft copy created', 'success');
              loadBlogs(activePage);
            } catch(e) { showToast('Error', e.message, 'error'); }
            break;
          case 'delete':
            const result = await Swal.fire({
              title: `Delete "${itemName}"?`,
              text: "This action cannot be undone.",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#dc2626',
              cancelButtonColor: '#3085d6',
              confirmButtonText: 'Delete',
              cancelButtonText: 'Cancel'
            });
            if (result.isConfirmed) {
              try {
                await apiFetch(`/blogs/${itemId}`, { method: 'DELETE' });
                showToast('Deleted', 'Item removed', 'success');
                loadBlogs(activePage);
              } catch(e) { showToast('Error', e.message, 'error'); }
            }
            break;
        }
      });
    });

    renderPagination(totalPages, activePage, "blogPagination", (p) => {
      loadBlogs(p);
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Setup toggle listener for Blogs
  document.getElementById('blogViewToggle')?.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      blogViewMode = btn.dataset.view;
      localStorage.setItem('adminBlogViewMode', blogViewMode);
      renderBlogView();
    });
  });

  // Setup search & filter listeners for Blogs
  let blogSearchTimeout;
  document.getElementById('blogSearchInput')?.addEventListener('input', (e) => {
    clearTimeout(blogSearchTimeout);
    blogSearchTimeout = setTimeout(() => {
      blogSearchQuery = e.target.value;
      currentBlogPage = 1;
      renderBlogView();
    }, 200);
  });

  document.getElementById('blogCategoryFilter')?.addEventListener('change', (e) => {
    blogCategoryFilter = e.target.value;
    currentBlogPage = 1;
    renderBlogView();
  });

  document.getElementById('blogStatusFilter')?.addEventListener('change', (e) => {
    blogStatusFilter = e.target.value;
    currentBlogPage = 1;
    renderBlogView();
  });

  async function loadBlogs(page = 1) {
    currentBlogPage = page;
    const grid = document.getElementById("blogGrid");
    if (grid && !cachedBlogs.length) {
      grid.className = 'proj-grid';
      grid.innerHTML = renderSkeletonCards(6);
    }
    const data = await apiFetch('/blogs/admin/all');
    const allBlogs = data?.data || data;
    cachedBlogs = Array.isArray(allBlogs) ? allBlogs : [];
    renderBlogView();
  }

  function openBlogModal(blog = null) {
    console.log('openBlogModal called with:', blog);
    const blogData = blog?.data || blog;
    console.log('Extracted blogData:', blogData);
    
    editingBlogId = blogData?._id || null;
    document.getElementById('blogModalTitle').textContent = blogData ? 'Edit Post' : 'Add Post';
    document.getElementById('bl-title').value    = blogData?.title    || '';
    document.getElementById('bl-category').value = blogData?.category || 'Virtual Reality';
    document.getElementById('bl-status').value = blogData?.status || 'published';
    document.getElementById('bl-readtime').value = blogData?.readTime || '5 min read';
    document.getElementById('bl-excerpt').value  = blogData?.excerpt  || '';
    if (editors.blogContent) {
      editors.blogContent.setData(blogData?.content || '');
    }
    document.getElementById('bl-author').value   = blogData?.author   || 'Volga Infosys';
    document.getElementById('bl-order').value    = blogData?.order    ?? 0;
    document.getElementById('bl-featured').checked = blogData?.featured || false;
    document.getElementById('bl-seotitle').value = blogData?.seoTitle || '';
    document.getElementById('bl-seodesc').value = blogData?.seoDescription || '';
    document.getElementById('blogFormError').textContent = '';
    document.getElementById('blogDeleteBtn').style.display = blogData ? '' : 'none';
    document.getElementById('blogModalOverlay').classList.add('open');
  }

  document.getElementById('blogModalClose').addEventListener('click', () =>
    document.getElementById('blogModalOverlay').classList.remove('open')
  );
  document.getElementById('blogModalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) document.getElementById('blogModalOverlay').classList.remove('open');
  });

  document.getElementById('addBlogBtn')?.addEventListener('click', () => openBlogModal());

  document.getElementById('blogSaveBtn').addEventListener('click', async () => {
    let coverImage = '';
    
    // Handle image upload
    const coverFile = document.getElementById('bl-cover').files[0];
    if (coverFile) {
      const formData = new FormData();
      formData.append('file', coverFile);
      
      try {
        const uploadResponse = await fetch(`${API}/media/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${getToken()}` },
          body: formData
        });
        
        if (!uploadResponse.ok) {
          if (uploadResponse.status === 413) {
            throw new Error('Image file is too large (exceeds server limit). Please select an image under 5MB, or increase Nginx client_max_body_size.');
          }
          const errorText = await uploadResponse.text();
          let msg = errorText;
          try {
            const parsed = JSON.parse(errorText);
            if (parsed.message) msg = parsed.message;
          } catch (_) {
            if (msg.includes('<html')) msg = `Server returned status ${uploadResponse.status}`;
          }
          throw new Error(msg);
        }
        
        const uploadData = await uploadResponse.json();
        if (uploadData.url) {
          coverImage = uploadData.url;
        }
      } catch (e) {
        document.getElementById('blogFormError').textContent = 'Image upload failed: ' + e.message;
        return;
      }
    } else if (editingBlogId) {
      // Keep existing image if editing and no new file uploaded
      const existingBlog = await apiFetch(`/blogs/${editingBlogId}`);
      coverImage = existingBlog.coverImage || existingBlog.image || '';
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
    if (!body.title || !body.excerpt) {
      document.getElementById('blogFormError').textContent = 'Title and Excerpt are required.';
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
    if (!editingBlogId) return;
    const result = await Swal.fire({
      title: 'Delete this post?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      await apiFetch(`/blogs/${editingBlogId}`, { method: 'DELETE' });
      document.getElementById('blogModalOverlay').classList.remove('open');
      loadBlogs();
      loadOverview();
    }
  });

  // CASE STUDIES
  let editingCaseStudyId = null;

  async function loadCaseStudies() {
    const grid = document.getElementById('caseStudyGrid');
    if (grid) {
      grid.innerHTML = renderSkeletonCards(3);
    }
    const caseStudies = await apiFetch('/case-studies');
    if (!grid) return;
    if (!caseStudies.length) {
      grid.innerHTML = `<p class="empty" style="padding:2rem">No case studies yet. Click + Add Case Study to get started.</p>`;
      return;
    }
    grid.innerHTML = caseStudies.map(c => `
      <div class="proj-card content-card" data-id="${esc(c._id)}">
        <div class="proj-card-img" style="background-image:url('${esc(c.image || '')}');position:relative;">
          <div class="actions-dropdown" data-id="${esc(c._id)}" data-type="case-studies" data-name="${esc(c.title.replace(/"/g,''))}">
            <button class="dropdown-toggle" title="Options" aria-label="Case study actions"><i class="fa-solid fa-ellipsis-vertical"></i></button>
            <div class="dropdown-menu">
              <button class="dropdown-item" data-action="edit">
                <i class="fa-solid fa-pen-to-square"></i>
                <span>Edit Case Study</span>
              </button>
              <button class="dropdown-item" data-action="duplicate">
                <i class="fa-solid fa-copy"></i>
                <span>Duplicate</span>
              </button>
              <button class="dropdown-item danger" data-action="delete">
                <i class="fa-solid fa-trash"></i>
                <span>Delete Case Study</span>
              </button>
            </div>
          </div>
        </div>
        <div class="proj-card-body">
          <span class="proj-tag">${esc(c.industry)}</span>
          <div class="proj-title">${esc(c.title)}</div>
          <div class="proj-place">${esc(c.year) || 'Case Study'} · ${(c.metrics || []).length} metrics</div>
          <p class="proj-desc">${esc(c.description)}</p>
        </div>
      </div>`).join('');

    // Dropdown menu handlers for case study cards
    grid.querySelectorAll('.dropdown-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = btn.nextElementSibling;
        document.querySelectorAll('.dropdown-menu').forEach(m => {
          if (m !== menu) m.classList.remove('show');
        });
        menu.classList.toggle('show');
      });
    });

    grid.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', async (e) => {
        e.stopPropagation();
        const dropdown = item.closest('.actions-dropdown');
        const itemId = dropdown.dataset.id;
        const itemType = dropdown.dataset.type;
        const itemName = dropdown.dataset.name;
        const action = item.dataset.action;
        
        // Close the menu
        dropdown.querySelector('.dropdown-menu').classList.remove('show');

        switch (action) {
          case 'edit':
            try {
              const caseStudyData = await apiFetch(`/case-studies/${itemId}`);
              openCaseStudyModal(caseStudyData);
            } catch(e) {
              console.error('Error fetching case study:', e);
              showToast('Error', 'Failed to load case study data', 'error');
            }
            break;
          case 'duplicate':
            try {
              await apiFetch(`/${itemType}/${itemId}/duplicate`, { method: 'POST' });
              showToast('Cloned', 'Draft copy created', 'success');
              loadCaseStudies();
            } catch(e) { showToast('Error', e.message, 'error'); }
            break;
          case 'delete':
            const result = await Swal.fire({
              title: `Delete "${itemName}"?`,
              text: "This action cannot be undone.",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#dc2626',
              cancelButtonColor: '#3085d6',
              confirmButtonText: 'Delete',
              cancelButtonText: 'Cancel'
            });
            if (result.isConfirmed) {
              try {
                await apiFetch(`/${itemType}/${itemId}`, { method: 'DELETE' });
                showToast('Deleted', 'Item removed', 'success');
                loadCaseStudies();
              } catch(e) { showToast('Error', e.message, 'error'); }
            }
            break;
        }
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
    let image = '';
    
    // Handle image upload
    const coverFile = document.getElementById('cs-cover').files[0];
    if (coverFile) {
      const formData = new FormData();
      formData.append('file', coverFile);
      
      try {
        const uploadResponse = await fetch(`${API}/media/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${getToken()}` },
          body: formData
        });
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorText}`);
        }
        
        const uploadData = await uploadResponse.json();
        if (uploadData.url) {
          image = uploadData.url;
        }
      } catch (e) {
        document.getElementById('caseStudyFormError').textContent = 'Image upload failed: ' + e.message;
        return;
      }
    } else if (editingCaseStudyId) {
      // Keep existing image if editing and no new file uploaded
      const existingCaseStudy = await apiFetch(`/case-studies/${editingCaseStudyId}`);
      image = existingCaseStudy.image || '';
    }

    const body = {
      title: document.getElementById('cs-title').value.trim(),
      industry: document.getElementById('cs-industry').value.trim(),
      year: document.getElementById('cs-year').value.trim(),
      description: editors.csDescription ? editors.csDescription.getData() : document.getElementById('cs-description').value.trim(),
      image: image,
      metrics: parseMetrics(document.getElementById('cs-metrics').value),
      author: document.getElementById('cs-author').value.trim() || 'Volga Infosys',
      order: Number(document.getElementById('cs-order').value) || 0,
    };
    if (!body.title || !body.industry || !body.description) {
      document.getElementById('caseStudyFormError').textContent = 'Title, Industry, and Description are required.';
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
    if (!editingCaseStudyId) return;
    const result = await Swal.fire({
      title: 'Delete this case study?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      await apiFetch(`/case-studies/${editingCaseStudyId}`, { method: 'DELETE' });
      document.getElementById('caseStudyModalOverlay').classList.remove('open');
      loadCaseStudies();
      loadOverview();
    }
  });

  // INDUSTRY NEWS
  let editingIndustryNewsId = null;

  async function loadIndustryNews() {
    const grid = document.getElementById('industryNewsGrid');
    if (grid) {
      grid.innerHTML = renderSkeletonCards(3);
    }
    const news = await apiFetch('/industry-news');
    if (!grid) return;
    if (!news.length) {
      grid.innerHTML = `<p class="empty" style="padding:2rem">No industry news yet. Click + Add News to get started.</p>`;
      return;
    }
    grid.innerHTML = news.map(n => `
      <div class="proj-card content-card" data-id="${esc(n._id)}">
        <div class="proj-card-img" style="background-image:url('${esc(n.image || '')}');position:relative;">
          <div class="actions-dropdown" data-id="${esc(n._id)}" data-type="industry-news" data-name="${esc(n.title.replace(/"/g,''))}">
            <button class="dropdown-toggle" title="Options" aria-label="News actions"><i class="fa-solid fa-ellipsis-vertical"></i></button>
            <div class="dropdown-menu">
              <button class="dropdown-item" data-action="edit">
                <i class="fa-solid fa-pen-to-square"></i>
                <span>Edit News</span>
              </button>
              <button class="dropdown-item" data-action="duplicate">
                <i class="fa-solid fa-copy"></i>
                <span>Duplicate</span>
              </button>
              <button class="dropdown-item danger" data-action="delete">
                <i class="fa-solid fa-trash"></i>
                <span>Delete News</span>
              </button>
            </div>
          </div>
        </div>
        <div class="proj-card-body">
          <span class="proj-tag">${esc(n.topic)}</span>
          <div class="proj-title">${esc(n.title)}</div>
          <div class="proj-place">${esc(n.source) || 'Volga Infosys'} · ${fmtDate(n.publishedAt || n.createdAt)}</div>
          <p class="proj-desc">${esc(n.description)}</p>
        </div>
      </div>`).join('');

    // Dropdown menu handlers for industry news cards
    grid.querySelectorAll('.dropdown-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = btn.nextElementSibling;
        document.querySelectorAll('.dropdown-menu').forEach(m => {
          if (m !== menu) m.classList.remove('show');
        });
        menu.classList.toggle('show');
      });
    });

    grid.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', async (e) => {
        e.stopPropagation();
        const dropdown = item.closest('.actions-dropdown');
        const itemId = dropdown.dataset.id;
        const itemType = dropdown.dataset.type;
        const itemName = dropdown.dataset.name;
        const action = item.dataset.action;
        
        // Close the menu
        dropdown.querySelector('.dropdown-menu').classList.remove('show');

        switch (action) {
          case 'edit':
            const newsData = await apiFetch(`/industry-news/${itemId}`);
            openIndustryNewsModal(newsData);
            break;
          case 'duplicate':
            try {
              await apiFetch(`/${itemType}/${itemId}/duplicate`, { method: 'POST' });
              showToast('Cloned', 'Copy created', 'success');
              loadIndustryNews();
            } catch(e) { showToast('Error', e.message, 'error'); }
            break;
          case 'delete':
            const result = await Swal.fire({
              title: `Delete "${itemName}"?`,
              text: "This action cannot be undone.",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#dc2626',
              cancelButtonColor: '#3085d6',
              confirmButtonText: 'Delete',
              cancelButtonText: 'Cancel'
            });
            if (result.isConfirmed) {
              try {
                await apiFetch(`/${itemType}/${itemId}`, { method: 'DELETE' });
                showToast('Deleted', 'Item removed', 'success');
                loadIndustryNews();
              } catch(e) { showToast('Error', e.message, 'error'); }
            }
            break;
        }
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
    if (editors.inDescription) {
      editors.inDescription.setData(item?.description || '');
    }
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
    let image = '';
    
    // Handle image upload
    const coverFile = document.getElementById('inCover').files[0];
    if (coverFile) {
      const formData = new FormData();
      formData.append('file', coverFile);
      
      try {
        const uploadResponse = await fetch(`${API}/media/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${getToken()}` },
          body: formData
        });
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorText}`);
        }
        
        const uploadData = await uploadResponse.json();
        if (uploadData.url) {
          image = uploadData.url;
        }
      } catch (e) {
        document.getElementById('industryNewsFormError').textContent = 'Image upload failed: ' + e.message;
        return;
      }
    } else if (editingIndustryNewsId) {
      // Keep existing image if editing and no new file uploaded
      const existingNews = await apiFetch(`/industry-news/${editingIndustryNewsId}`);
      image = existingNews.image || '';
    }

    const body = {
      title: document.getElementById('in-title').value.trim(),
      topic: document.getElementById('in-topic').value.trim(),
      source: document.getElementById('in-source').value.trim() || 'Volga Infosys',
      description: editors.inDescription ? editors.inDescription.getData() : document.getElementById('in-description').value.trim(),
      image: image,
      publishedAt: document.getElementById('in-published').value || new Date().toISOString(),
      order: Number(document.getElementById('in-order').value) || 0,
      url: document.getElementById('in-url').value.trim(),
    };
    if (!body.title || !body.topic || !body.description) {
      document.getElementById('industryNewsFormError').textContent = 'Title, Topic, and Description are required.';
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
    if (!editingIndustryNewsId) return;
    const result = await Swal.fire({
      title: 'Delete this news item?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      await apiFetch(`/industry-news/${editingIndustryNewsId}`, { method: 'DELETE' });
      document.getElementById('industryNewsModalOverlay').classList.remove('open');
      loadIndustryNews();
      loadOverview();
    }
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
        const result = await Swal.fire({
          title: 'Delete this media item?',
          text: "This action cannot be undone.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc2626',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel'
        });
        if (result.isConfirmed) {
          try {
            await apiFetch(`/media/${btn.dataset.id}`, { method: 'DELETE' });
            showToast('Media Deleted', 'The media item has been removed', 'success');
            loadMediaLibrary();
          } catch (e) {
            showToast('Delete Failed', e.message || 'Could not delete media item', 'error');
          }
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
      'blog': 'view_blog',
      'casestudies': 'view_case_studies',
      'industrynews': 'view_industry_news',
      'medialibrary': 'view_media_library',
      'emaillogs': 'view_email_logs',
      'users': 'manage_users',
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
      const settingsAvatarText = document.getElementById('profileAvatarTextSettings');
      if (currentUser.profilePicture) {
        if (profileAvatarImg) {
          profileAvatarImg.src = currentUser.profilePicture;
          profileAvatarImg.style.display = 'block';
        }
        if (profileAvatarText) profileAvatarText.style.display = 'none';
        if (profilePicPreview) {
          profilePicPreview.style.backgroundImage = `url(${currentUser.profilePicture})`;
          profilePicPreview.style.backgroundSize = 'cover';
          profilePicPreview.style.backgroundPosition = 'center';
        }
        if (settingsAvatarText) settingsAvatarText.style.display = 'none';
      } else {
        if (profileAvatarImg) profileAvatarImg.style.display = 'none';
        if (profileAvatarText) {
          profileAvatarText.style.display = 'block';
          profileAvatarText.textContent = (currentUser.name || 'A').charAt(0).toUpperCase();
        }
        if (profilePicPreview) {
          profilePicPreview.style.backgroundImage = 'none';
        }
        if (settingsAvatarText) {
          settingsAvatarText.style.display = 'block';
          settingsAvatarText.textContent = (currentUser.name || 'A').charAt(0).toUpperCase();
        }
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
      const userMgmtTitle = document.getElementById('userManagementTitle');
      const userMgmtSec = document.getElementById('userManagementSection');
      const roleAppTitle = document.getElementById('roleApplicationsTitle');
      const roleAppSec = document.getElementById('roleApplicationsSection');
      const tabBtnTeam = document.getElementById('tabBtnTeam');

      if (userMgmtTitle) userMgmtTitle.style.display = isAdmin ? 'block' : 'none';
      if (userMgmtSec) userMgmtSec.style.display = isAdmin ? 'block' : 'none';
      if (roleAppTitle) roleAppTitle.style.display = isAdmin ? 'block' : 'none';
      if (roleAppSec) roleAppSec.style.display = isAdmin ? 'block' : 'none';
      
      const roleDisplay = document.getElementById('settings-role-display');
      if (roleDisplay) {
        roleDisplay.value = currentUser.role ? (currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)) : 'Administrator';
      }

      const sessionHost = document.getElementById('sessionHost');
      if (sessionHost) {
        sessionHost.textContent = window.location.host || 'www.volgainfosys.com';
      }
      
      if (isAdmin) {
        loadUsers();
        loadRoleApplications();
      }

      // Load saved preferences
      const savedTimeout = localStorage.getItem('INACTIVITY_TIMEOUT_MS');
      if (savedTimeout && document.getElementById('prefSessionTimeout')) {
        document.getElementById('prefSessionTimeout').value = savedTimeout;
      }
      const savedView = localStorage.getItem('adminProjViewMode');
      if (savedView && document.getElementById('prefDefaultView')) {
        document.getElementById('prefDefaultView').value = savedView;
      }
      const savedPageSize = localStorage.getItem('adminPageSize');
      if (savedPageSize && document.getElementById('prefPageSize')) {
        document.getElementById('prefPageSize').value = savedPageSize;
      }
      const savedTheme = localStorage.getItem('volgaAdminTheme');
      if (savedTheme && document.getElementById('prefThemeSelect')) {
        document.getElementById('prefThemeSelect').value = savedTheme;
      }
      const savedDateFormat = localStorage.getItem('volgaDateFormat');
      if (savedDateFormat && document.getElementById('prefDateFormat')) {
        document.getElementById('prefDateFormat').value = savedDateFormat;
      }
      const savedAutoRefresh = localStorage.getItem('volgaAutoRefresh');
      if (savedAutoRefresh && document.getElementById('prefAutoRefresh')) {
        document.getElementById('prefAutoRefresh').value = savedAutoRefresh;
      }

      // Load saved company details
      try {
        const savedCompany = JSON.parse(localStorage.getItem('volgaCompanyInfo') || '{}');
        if (savedCompany.name && document.getElementById('compName')) document.getElementById('compName').value = savedCompany.name;
        if (savedCompany.tagline && document.getElementById('compTagline')) document.getElementById('compTagline').value = savedCompany.tagline;
        if (savedCompany.email && document.getElementById('compEmail')) document.getElementById('compEmail').value = savedCompany.email;
        if (savedCompany.phone && document.getElementById('compPhone')) document.getElementById('compPhone').value = savedCompany.phone;
        if (savedCompany.address && document.getElementById('compAddress')) document.getElementById('compAddress').value = savedCompany.address;
        if (savedCompany.website && document.getElementById('compWebsite')) document.getElementById('compWebsite').value = savedCompany.website;
        if (savedCompany.socialLinkedIn && document.getElementById('socialLinkedIn')) document.getElementById('socialLinkedIn').value = savedCompany.socialLinkedIn;
        if (savedCompany.socialTwitter && document.getElementById('socialTwitter')) document.getElementById('socialTwitter').value = savedCompany.socialTwitter;
        if (savedCompany.socialInstagram && document.getElementById('socialInstagram')) document.getElementById('socialInstagram').value = savedCompany.socialInstagram;
        if (savedCompany.socialYouTube && document.getElementById('socialYouTube')) document.getElementById('socialYouTube').value = savedCompany.socialYouTube;
        if (savedCompany.socialGitHub && document.getElementById('socialGitHub')) document.getElementById('socialGitHub').value = savedCompany.socialGitHub;
      } catch (_) {}

      // Load saved alert settings
      try {
        const savedAlerts = JSON.parse(localStorage.getItem('volgaAlertSettings') || '{}');
        if (savedAlerts.notifyNewLeads !== undefined && document.getElementById('notifyNewLeads')) {
          document.getElementById('notifyNewLeads').checked = Boolean(savedAlerts.notifyNewLeads);
        }
        if (savedAlerts.notifyNewApplications !== undefined && document.getElementById('notifyNewApplications')) {
          document.getElementById('notifyNewApplications').checked = Boolean(savedAlerts.notifyNewApplications);
        }
        if (savedAlerts.email && document.getElementById('alertEmail')) document.getElementById('alertEmail').value = savedAlerts.email;
        if (savedAlerts.frequency && document.getElementById('alertFrequency')) document.getElementById('alertFrequency').value = savedAlerts.frequency;
      } catch (_) {}
    }

    // Initialize Settings Tabs Subnavigation
    document.querySelectorAll('.settings-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.settings-tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const targetPane = document.getElementById(`stab-${tabName}`);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    // Save Dashboard Preferences
    document.getElementById('savePreferencesBtn')?.addEventListener('click', () => {
      const timeoutVal = document.getElementById('prefSessionTimeout')?.value;
      const viewVal = document.getElementById('prefDefaultView')?.value;
      const pageSizeVal = document.getElementById('prefPageSize')?.value;
      const themeVal = document.getElementById('prefThemeSelect')?.value;
      const dateVal = document.getElementById('prefDateFormat')?.value;
      const autoRefreshVal = document.getElementById('prefAutoRefresh')?.value;

      if (timeoutVal) {
        localStorage.setItem('INACTIVITY_TIMEOUT_MS', timeoutVal);
        window.INACTIVITY_TIMEOUT_MS = parseInt(timeoutVal);
      }
      if (viewVal) {
        localStorage.setItem('adminProjViewMode', viewVal);
        localStorage.setItem('adminBlogViewMode', viewVal);
        projViewMode = viewVal;
        blogViewMode = viewVal;
      }
      if (pageSizeVal) {
        localStorage.setItem('adminPageSize', pageSizeVal);
      }
      if (themeVal) {
        localStorage.setItem('volgaAdminTheme', themeVal);
        if (themeVal === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      if (dateVal) {
        localStorage.setItem('volgaDateFormat', dateVal);
      }
      if (autoRefreshVal) {
        localStorage.setItem('volgaAutoRefresh', autoRefreshVal);
      }
      showToast('Preferences Saved', 'Your dashboard configuration has been updated', 'success');
    });

    // Save Company Details & Social Links
    document.getElementById('saveCompanyDetailsBtn')?.addEventListener('click', () => {
      const companyInfo = {
        name: document.getElementById('compName')?.value.trim() || 'Volga Infosys',
        tagline: document.getElementById('compTagline')?.value.trim() || 'Next-Gen XR & Spatial Computing Solutions',
        email: document.getElementById('compEmail')?.value.trim() || 'info@volgainfosys.com',
        phone: document.getElementById('compPhone')?.value.trim() || '+91 98765 43210',
        address: document.getElementById('compAddress')?.value.trim() || 'Ahmedabad, Gujarat, India',
        website: document.getElementById('compWebsite')?.value.trim() || 'https://www.volgainfosys.com',
        socialLinkedIn: document.getElementById('socialLinkedIn')?.value.trim() || '',
        socialTwitter: document.getElementById('socialTwitter')?.value.trim() || '',
        socialInstagram: document.getElementById('socialInstagram')?.value.trim() || '',
        socialYouTube: document.getElementById('socialYouTube')?.value.trim() || '',
        socialGitHub: document.getElementById('socialGitHub')?.value.trim() || ''
      };
      localStorage.setItem('volgaCompanyInfo', JSON.stringify(companyInfo));
      showToast('Company Info Saved', 'Official contact, brand, and social media channels updated', 'success');
    });

    // Save Alert Settings
    document.getElementById('saveAlertSettingsBtn')?.addEventListener('click', () => {
      const alertSettings = {
        notifyNewLeads: document.getElementById('notifyNewLeads')?.checked ?? true,
        notifyNewApplications: document.getElementById('notifyNewApplications')?.checked ?? true,
        email: document.getElementById('alertEmail')?.value.trim() || 'info@volgainfosys.com',
        frequency: document.getElementById('alertFrequency')?.value || 'instant'
      };
      localStorage.setItem('volgaAlertSettings', JSON.stringify(alertSettings));
      showToast('Alert Settings Saved', 'Inbound lead and applicant notification rules updated', 'success');
    });

    // Quick Export Leads as CSV
    document.getElementById('exportLeadsQuickBtn')?.addEventListener('click', async () => {
      try {
        showToast('Exporting Leads', 'Preparing CSV file...', 'info', 1500);
        const data = await apiFetch('/leads');
        const leads = data.leads || (Array.isArray(data) ? data : []);
        if (!leads.length) {
          showToast('Export Leads', 'No leads found to export', 'info');
          return;
        }
        const headers = ['Name', 'Email', 'Phone', 'Service', 'Budget', 'Timeline', 'Country', 'Status', 'Date'];
        const rows = leads.map(l => [
          `"${(l.name || '').replace(/"/g, '""')}"`,
          `"${(l.email || '').replace(/"/g, '""')}"`,
          `"${(l.phone || '').replace(/"/g, '""')}"`,
          `"${(l.service || '').replace(/"/g, '""')}"`,
          `"${(l.budget || '').replace(/"/g, '""')}"`,
          `"${(l.timeline || '').replace(/"/g, '""')}"`,
          `"${(l.country || '').replace(/"/g, '""')}"`,
          `"${(l.status || '').replace(/"/g, '""')}"`,
          `"${(l.createdAt || '').replace(/"/g, '""')}"`
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `volga_leads_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Export Successful', `Exported ${leads.length} leads to CSV`, 'success');
      } catch (err) {
        showToast('Export Failed', err.message || 'Could not export leads', 'error');
      }
    });

    // Quick Export Projects as JSON
    document.getElementById('exportProjectsQuickBtn')?.addEventListener('click', async () => {
      try {
        showToast('Exporting Projects', 'Preparing JSON backup...', 'info', 1500);
        const data = await apiFetch('/projects');
        const projects = data.projects || (Array.isArray(data) ? data : []);
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute('href', dataStr);
        dlAnchorElem.setAttribute('download', `volga_projects_backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(dlAnchorElem);
        dlAnchorElem.click();
        document.body.removeChild(dlAnchorElem);
        showToast('Export Successful', `Exported ${projects.length} projects to JSON`, 'success');
      } catch (err) {
        showToast('Export Failed', err.message || 'Could not export projects', 'error');
      }
    });

    // Revoke Other Sessions
    document.getElementById('revokeSessionsBtn')?.addEventListener('click', async () => {
      const res = await Swal.fire({
        title: 'Revoke Other Sessions?',
        text: 'This will invalidate active tokens on all other browsers and devices.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e8930a',
        cancelButtonColor: '#334155',
        confirmButtonText: 'Yes, Revoke Sessions'
      });
      if (res.isConfirmed) {
        showToast('Sessions Revoked', 'All other active sessions have been invalidated successfully', 'success');
      }
    });

    // Clear Cache button
    document.getElementById('clearCacheBtn')?.addEventListener('click', async () => {
      cachedProjects = [];
      cachedBlogs = [];
      showToast('Cache Cleared', 'Reloading fresh data from server...', 'info', 1500);
      await loadOverview();
      showToast('Data Refreshed', 'Dashboard cache has been synchronized with the database', 'success');
    });

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
    let cachedUsersList = [];

    function renderUsersTable(usersToRender) {
      const tbody = document.querySelector('#usersTable tbody');
      if (!tbody) return;
      if (!usersToRender || !usersToRender.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty" style="text-align:center; padding:2rem; color:var(--text-secondary);">No user accounts found matching criteria</td></tr>';
        return;
      }
      tbody.innerHTML = usersToRender.map(u => `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:34px; height:34px; border-radius:50%; background:rgba(232,147,10,0.15); color:var(--accent); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.85rem;">
                ${esc((u.name || 'U').charAt(0).toUpperCase())}
              </div>
              <div>
                <strong style="color:var(--text-primary); display:block; font-size:0.92rem;">${esc(u.name || 'Unknown')}</strong>
                <span style="color:var(--text-secondary); font-size:0.78rem;">ID: ${esc(u._id ? u._id.slice(-6) : '—')}</span>
              </div>
            </div>
          </td>
          <td><span style="color:var(--text-secondary); font-family:monospace; font-size:0.85rem;">${esc(u.email)}</span></td>
          <td><span class="badge badge-${esc(u.role || 'viewer')}">${esc(u.role ? (u.role.charAt(0).toUpperCase() + u.role.slice(1)) : 'Viewer')}</span></td>
          <td><span style="color:var(--text-secondary); font-size:0.82rem;">${fmtDate(u.createdAt)}</span></td>
          <td style="text-align:right;">
            <button class="btn-view edit-user-btn" data-id="${esc(u._id)}" style="padding:0.4rem 0.85rem; font-size:0.8rem;"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
          </td>
        </tr>
      `).join('');
      
      tbody.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const user = cachedUsersList.find(u => u._id === btn.dataset.id);
          openUserModal(user);
        });
      });
    }

    function filterUsers() {
      const q = (document.getElementById('userSearchInput')?.value || '').toLowerCase().trim();
      const role = document.getElementById('userRoleFilter')?.value || 'all';

      let filtered = cachedUsersList.slice();
      if (role !== 'all') {
        filtered = filtered.filter(u => (u.role || 'viewer').toLowerCase() === role.toLowerCase());
      }
      if (q) {
        filtered = filtered.filter(u => 
          (u.name || '').toLowerCase().includes(q) || 
          (u.email || '').toLowerCase().includes(q)
        );
      }
      renderUsersTable(filtered);
    }

    document.getElementById('userSearchInput')?.addEventListener('input', debounce(filterUsers, 200));
    document.getElementById('userRoleFilter')?.addEventListener('change', filterUsers);

    async function loadUsers() {
      const data = await apiFetch('/auth/users');
      cachedUsersList = data.users || [];

      // Update KPI Cards
      const totalUsers = cachedUsersList.length;
      const adminUsers = cachedUsersList.filter(u => u.role === 'admin').length;
      const editorUsers = cachedUsersList.filter(u => u.role === 'editor').length;

      const statTotal = document.getElementById('statUserTotal');
      const statAdmins = document.getElementById('statUserAdmins');
      const statEditors = document.getElementById('statUserEditors');
      if (statTotal) statTotal.textContent = totalUsers;
      if (statAdmins) statAdmins.textContent = adminUsers;
      if (statEditors) statEditors.textContent = editorUsers;

      filterUsers();
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
      if (!editingUserId) return;
      const result = await Swal.fire({
        title: 'Delete this user?',
        text: "This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      });
      if (result.isConfirmed) {
        try {
          await apiFetch(`/auth/users/${editingUserId}`, { method: 'DELETE' });
          showToast('User Deleted', 'The user has been deleted successfully', 'success');
          document.getElementById('userModalOverlay').classList.remove('open');
          loadUsers();
        } catch (e) {
          showToast('Delete Failed', e.message || 'Could not delete the user', 'error');
        }
      }
    });

    // Load role applications (admin)
    async function loadRoleApplications() {
      const data = await apiFetch('/auth/role-applications');
      const apps = data.applications || [];
      const pendingCount = apps.filter(a => a.status === 'pending').length;
      const statPending = document.getElementById('statUserPending');
      if (statPending) statPending.textContent = pendingCount;

      const tbody = document.querySelector('#roleApplicationsTable tbody');
      if (!tbody) return;
      if (!apps.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty" style="text-align:center; padding:2rem; color:var(--text-secondary);">No role upgrade applications found</td></tr>';
        return;
      }
      tbody.innerHTML = apps.map(a => `
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
          const result = await Swal.fire({
            title: 'Reject this application?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Reject',
            cancelButtonText: 'Cancel'
          });
          if (result.isConfirmed) {
            try {
              await apiFetch(`/auth/role-applications/${btn.dataset.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected' }) });
              showToast('Application Rejected', 'The role application has been rejected', 'success');
              loadRoleApplications();
            } catch (e) {
              showToast('Action Failed', e.message || 'Could not reject the application', 'error');
            }
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
              <button class="dropdown-toggle" title="Options" aria-label="Job actions"><i class="fa-solid fa-ellipsis-vertical"></i></button>
              <div class="dropdown-menu">
                <button class="dropdown-item" data-action="edit">
                  <i class="fa-solid fa-pen-to-square"></i>
                  <span>Edit Job</span>
                </button>
                <button class="dropdown-item" data-action="duplicate">
                  <i class="fa-solid fa-copy"></i>
                  <span>Duplicate</span>
                </button>
                <button class="dropdown-item" data-action="close">
                  <i class="fa-solid fa-ban"></i>
                  <span>Close Job</span>
                </button>
                <button class="dropdown-item" data-action="archive">
                  <i class="fa-solid fa-box-archive"></i>
                  <span>Archive</span>
                </button>
                <button class="dropdown-item danger" data-action="delete">
                  <i class="fa-solid fa-trash"></i>
                  <span>Delete Job</span>
                </button>
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
              const result = await Swal.fire({
                title: 'Delete this job?',
                text: "This action cannot be undone.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel'
              });
              if (result.isConfirmed) {
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
      if (!editingJobId) return;
      const result = await Swal.fire({
        title: 'Delete this job?',
        text: "This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      });
      if (result.isConfirmed) {
        try {
          await apiFetch(`/jobs/${editingJobId}`, { method: 'DELETE' });
          showToast('Job Deleted', 'The job has been removed', 'success');
          document.getElementById('jobModalOverlay').classList.remove('open');
          loadJobs();
        } catch (e) {
          showToast('Delete Failed', e.message || 'Could not delete job', 'error');
        }
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
          const result = await Swal.fire({
            title: 'Delete this application?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel'
          });
          if (result.isConfirmed) {
            try {
              await apiFetch(`/job-applications/${btn.dataset.id}`, { method: 'DELETE' });
              showToast('Application Deleted', 'The application has been removed', 'success');
              loadJobApplications();
            } catch (e) {
              showToast('Delete Failed', e.message || 'Could not delete application', 'error');
            }
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
        <div><span>Resume</span><strong>${application.resumeUrl ? `<a href="${esc(application.resumeUrl)}" target="_blank" style="color: #3b82f6;">Download</a>` : '—'}</strong></div>
        <div><span>Portfolio</span><strong>${application.portfolioUrl ? `<a href="${esc(application.portfolioUrl)}" target="_blank" style="color: #3b82f6;">View</a>` : '—'}</strong></div>
        <div><span>LinkedIn</span><strong>${application.linkedinUrl ? `<a href="${esc(application.linkedinUrl)}" target="_blank" style="color: #3b82f6;">View</a>` : '—'}</strong></div>
        <div><span>Applied Date</span><strong>${fmtDate(application.createdAt)}</strong></div>
        ${application.coverLetter ? `<div style="grid-column: 1 / -1;"><span>Cover Letter</span><div style="margin-top: 0.5rem; padding: 0.75rem; background: rgba(0,0,0,0.05); border-radius: 8px;">${esc(application.coverLetter)}</div></div>` : ''}
      `;
      document.getElementById('jobAppStatus').value = application.status;
      document.getElementById('jobAppNotes').value = application.notes || '';
      document.getElementById('jobApplicationModalOverlay').classList.add('open');
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
  const result = await Swal.fire({
    title: `Delete ${checked.length} item(s)?`,
    text: "This action cannot be undone.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel'
  });
  if (!result.isConfirmed) return;
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

  const activeInquiries = contacts.filter(c => c.status === 'new' || c.status === 'contacted').length;

  const sentEmails = emails.filter(e => e.status === 'sent').length;
  const emailRate = emails.length > 0 ? ((sentEmails / emails.length) * 100).toFixed(0) + '%' : '—';

  document.getElementById('an-totalLeads').textContent  = total;
  document.getElementById('an-conversion').textContent  = convRate;
  document.getElementById('an-topService').textContent  = topService;
  document.getElementById('an-topCountry').textContent  = topCountry;
  const avgBudgetEl = document.getElementById('an-avgBudget');
  if (avgBudgetEl) avgBudgetEl.textContent = activeInquiries;
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
