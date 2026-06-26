const API = window.location.protocol.startsWith('http')
  ? `${window.location.origin}/api`
  : 'http://localhost:5000/api';

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
  const res = await fetch(API + path, {
    ...options,
    headers: {
      "Authorization": `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) { clearToken(); location.href = "index.html"; return null; }
  const data = await res.json();
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
      
      success.textContent = 'Password reset link has been sent to your email!';
    } catch (e) {
      err.textContent = e.message || 'Failed to send reset email';
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
      err.textContent = 'Passwords do not match';
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
        setToken(data.token);
        location.href = 'dashboard.html';
      }
    } catch (e) {
      err.textContent = e.message || 'Reset failed';
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
      
      success.textContent = 'Application submitted successfully! We will review it shortly.';
    } catch (e) {
      err.textContent = e.message || 'Submission failed';
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
  document.getElementById("logoutBtn").addEventListener("click", () => {
    clearToken(); location.href = "index.html";
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
      if (item.dataset.view === "clientstories") loadClientStories();
      if (item.dataset.view === "blog") loadBlogs();
      if (item.dataset.view === "casestudies") loadCaseStudies();
      if (item.dataset.view === "industrynews") loadIndustryNews();
      if (item.dataset.view === "medialibrary") loadMediaLibrary();
      if (item.dataset.view === "emaillogs") loadEmailLogs();
      if (item.dataset.view === "settings") loadCurrentUser();
      
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

    // Recent email logs (if provided)
    const emailSection = document.getElementById('emailLogsSection');
    if (data.emailStats && data.emailStats.recent) {
      const list = data.emailStats.recent.map(e => `
        <tr>
          <td>${new Date(e.createdAt).toLocaleString()}</td>
          <td>${e.from}</td>
          <td>${e.to}</td>
          <td>${(e.subject||'').slice(0,60)}</td>
          <td><span class="status-${e.status}">${e.status}</span></td>
        </tr>`).join('');
      const wrapper = document.createElement('div');
      wrapper.className = 'section-title';
      wrapper.innerHTML = '<div style="margin-top:2rem">Recent Email Activity</div>';
      document.getElementById('view-overview').appendChild(wrapper);
      const tbl = document.createElement('div'); tbl.className='table-wrap'; tbl.innerHTML = `<table class="leads-table"><thead><tr><th>Date</th><th>From</th><th>To</th><th>Subject</th><th>Status</th></tr></thead><tbody>${list}</tbody></table>`;
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
    await apiFetch("/dashboard/emails", { method: "DELETE" });
    loadEmailLogs(1);
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
        ? `<td>${c.name}</td><td>${c.email}</td><td>${c.country || "—"}</td><td>${c.serviceInterested || "—"}</td><td><span class="badge badge-${c.status}">${c.status}</span></td><td>${fmtDate(c.createdAt)}</td>`
        : `<td>${c.name}</td><td>${c.email}</td><td>${c.company || "—"}</td><td>${c.country || "—"}</td><td>${c.budget || "—"}</td><td>${c.serviceInterested || "—"}</td><td class="msg-cell">${c.message}</td><td><span class="badge badge-${c.status}">${c.status}</span></td><td>${fmtDate(c.createdAt)}</td><td><button class="btn-view" data-id="${c._id}">View</button></td>`;
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
        <td>${e.from}</td>
        <td>${e.to}</td>
        <td>${(e.subject||'').slice(0,80)}</td>
        <td>${e.type}</td>
        <td><span class="badge badge-${e.status}">${e.status}</span></td>
        <td><button class="btn-delete btn-delete-log" data-id="${e._id}">Delete</button></td>
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
        <p style="margin:0 0 0.5rem;">${note.content}</p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; color:#888;">${new Date(note.createdAt).toLocaleString()}</span>
          <button class="btn-delete" style="font-size:0.8rem; padding:4px 8px;" data-note-id="${note._id}">Delete</button>
        </div>
      </div>
    `).join('');
    notesList.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Delete this note?')) {
          await apiFetch(`/dashboard/contacts/${activeContact._id}/notes/${btn.dataset.noteId}`, { method: 'DELETE' });
          loadNotes(activeContact._id);
        }
      });
    });
  }

  function openModal(contact) {
    activeContact = contact;
    document.getElementById("modalName").textContent = contact.name;
    document.getElementById("modalGrid").innerHTML = `
      <div><span>Email</span><strong>${contact.email}</strong></div>
      <div><span>Company</span><strong>${contact.company || "—"}</strong></div>
      <div><span>Country</span><strong>${contact.country || "—"}</strong></div>
      <div><span>Service</span><strong>${contact.serviceInterested || "—"}</strong></div>
      <div><span>Budget</span><strong>${contact.budget || "—"}</strong></div>
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
    await apiFetch(`/dashboard/contacts/${activeContact._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, tags, followUpDate }),
    });
    closeModal();
    loadLeads(currentPage);
  });

  document.getElementById("addNoteBtn").addEventListener("click", async () => {
    const content = document.getElementById("newNote").value.trim();
    if (!content) return;
    await apiFetch(`/dashboard/contacts/${activeContact._id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    document.getElementById("newNote").value = '';
    loadNotes(activeContact._id);
  });

  document.getElementById("modalDelete").addEventListener("click", async () => {
    if (!activeContact || !confirm("Delete this lead?")) return;
    await apiFetch(`/dashboard/contacts/${activeContact._id}`, { method: "DELETE" });
    closeModal();
    loadLeads(currentPage);
    loadOverview();
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
        <div class="proj-card-img" style="background-image:url('${p.image}')"></div>
        <div class="proj-card-body">
          <span class="proj-tag">${p.tag}</span>
          <div class="proj-title">${p.title}${p.title2 ? ' ' + p.title2 : ''}</div>
          <div class="proj-place">${p.place}</div>
          <p class="proj-desc">${p.description}</p>
          <a class="btn-view" href="project-edit.html?id=${p._id}">Edit</a>
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
      return;
    }
    const errEl = document.getElementById("projectFormError");
    const saveBtn = document.getElementById("projectSaveBtn");
    saveBtn.textContent = "Saving…";
    saveBtn.disabled = true;
    try {
      if (editingProjectId) {
        await apiFetch(`/projects/${editingProjectId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        await apiFetch("/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      document.getElementById("projectModalOverlay").classList.remove("open");
      loadPortfolio();
      if (typeof loadClientStories === 'function') loadClientStories();
    } catch (e) {
      errEl.textContent = e.message || "Save failed. Are you still logged in?";
    } finally {
      saveBtn.textContent = "Save Project";
      saveBtn.disabled = false;
    }
  });

  document.getElementById("projectDeleteBtn").addEventListener("click", async () => {
    if (!editingProjectId || !confirm("Delete this project?")) return;
    await apiFetch(`/projects/${editingProjectId}`, { method: "DELETE" });
    document.getElementById("projectModalOverlay").classList.remove("open");
    loadPortfolio();
    if (typeof loadClientStories === 'function') loadClientStories();
  });

  // ── CLIENT STORIES ───────────────────────────────────
  let editingStoryId = null;

  async function loadClientStories() {
    const stories = await apiFetch("/client-stories");
    const grid = document.getElementById("storiesGrid");
    if (!stories || !stories.length) {
      if (grid) grid.innerHTML = `<p class="empty" style="padding:2rem">No client stories yet. Click + Add Story to get started.</p>`;
      return;
    }
    if (!grid) return;
    grid.innerHTML = stories.map(s => `
      <div class="proj-card">
        <div class="proj-card-img" style="background-image:url('${s.image}')"></div>
        <div class="proj-card-body">
          <span class="proj-tag">${s.industry}</span>
          <div class="proj-title">${s.clientName}</div>
          <div class="proj-place">${s.clientRole}</div>
          <p class="proj-desc">${s.testimonial}</p>
          <a class="btn-view" href="client-story-edit.html?id=${s._id}">Edit</a>
        </div>
      </div>`).join("");
  }

  function openStoryModal(story = null) {
    editingStoryId = story?._id || null;
    document.getElementById("storyModalTitle").textContent = story ? "Edit Story" : "Add Story";
    document.getElementById("st-industry").value = story?.industry || "";
    document.getElementById("st-clientname").value = story?.clientName || "";
    document.getElementById("st-clientrole").value = story?.clientRole || "";
    if (editors.stTestimonial) {
      editors.stTestimonial.setData(story?.testimonial || "");
    }
    document.getElementById("st-image").value = story?.image || "";
    document.getElementById("st-avatar").value = story?.avatar || "";
    document.getElementById("st-impact").value = story?.impact?.join(", ") || "";
    document.getElementById("st-order").value = story?.order ?? 0;
    document.getElementById("storyFormError").textContent = "";
    document.getElementById("storyDeleteBtn").style.display = story ? "" : "none";
    document.getElementById("storyModalOverlay").classList.add("open");
  }

  document.getElementById("addStoryBtn")?.addEventListener("click", () => openStoryModal());
  document.getElementById("storyModalClose")?.addEventListener("click", () =>
    document.getElementById("storyModalOverlay").classList.remove("open")
  );
  document.getElementById("storyModalOverlay")?.addEventListener("click", e => {
    if (e.target === e.currentTarget) document.getElementById("storyModalOverlay").classList.remove("open");
  });

  document.getElementById("storySaveBtn")?.addEventListener("click", async () => {
    const impact = document.getElementById("st-impact").value.trim().split(",").map(s => s.trim()).filter(s => s);
    const body = {
      industry:    document.getElementById("st-industry").value.trim(),
      clientName:  document.getElementById("st-clientname").value.trim(),
      clientRole:  document.getElementById("st-clientrole").value.trim(),
      testimonial: editors.stTestimonial ? editors.stTestimonial.getData() : document.getElementById("st-testimonial").value.trim(),
      image:       document.getElementById("st-image").value.trim(),
      avatar:      document.getElementById("st-avatar").value.trim(),
      impact:      impact,
      order:       Number(document.getElementById("st-order").value) || 0,
    };
    if (!body.industry || !body.clientName || !body.clientRole || !body.testimonial || !body.image || !body.avatar) {
      document.getElementById("storyFormError").textContent = "Please fill in all required fields.";
      return;
    }
    const errEl = document.getElementById("storyFormError");
    const saveBtn = document.getElementById("storySaveBtn");
    saveBtn.textContent = "Saving…";
    saveBtn.disabled = true;
    try {
      if (editingStoryId) {
        await apiFetch(`/client-stories/${editingStoryId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        await apiFetch("/client-stories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      document.getElementById("storyModalOverlay").classList.remove("open");
      loadClientStories();
    } catch (e) {
      errEl.textContent = e.message || "Save failed. Are you still logged in?";
    } finally {
      saveBtn.textContent = "Save Story";
      saveBtn.disabled = false;
    }
  });

  document.getElementById("storyDeleteBtn")?.addEventListener("click", async () => {
    if (!editingStoryId || !confirm("Delete this story?")) return;
    await apiFetch(`/client-stories/${editingStoryId}`, { method: "DELETE" });
    document.getElementById("storyModalOverlay").classList.remove("open");
    loadClientStories();
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
    grid.innerHTML = blogs.map(b => `
      <div class="proj-card">
        <div class="proj-card-img" style="background-image:url('${b.coverImage || b.image}')">
          ${b.featured ? '<span style="position:absolute;top:10px;left:10px;background:#567C8D;color:#fff;font-size:0.6rem;padding:3px 10px;border-radius:99px;letter-spacing:0.1em;">FEATURED</span>' : ''}
          ${b.status === 'draft' ? '<span style="position:absolute;top:10px;right:10px;background:#ff9900;color:#fff;font-size:0.6rem;padding:3px 10px;border-radius:99px;letter-spacing:0.1em;">DRAFT</span>' : ''}
        </div>
        <div class="proj-card-body">
          <span class="proj-tag">${b.category}</span>
          <div class="proj-title">${b.title}</div>
          <div class="proj-place">${b.author} &middot; ${b.readTime}</div>
          <p class="proj-desc">${b.excerpt}</p>
          <a class="btn-view" href="blog-edit.html?id=${b._id}">Edit</a>
        </div>
      </div>`).join('');
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
      <div class="proj-card">
        <div class="proj-card-img" style="background-image:url('${c.image}')"></div>
        <div class="proj-card-body">
          <span class="proj-tag">${c.industry}</span>
          <div class="proj-title">${c.title}</div>
          <div class="proj-place">${c.year || 'Case Study'} &middot; ${(c.metrics || []).length} metrics</div>
          <p class="proj-desc">${c.description}</p>
          <a class="btn-view" href="case-study-edit.html?id=${c._id}">Edit</a>
        </div>
      </div>`).join('');
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
      <div class="proj-card">
        <div class="proj-card-img" style="background-image:url('${n.image}')"></div>
        <div class="proj-card-body">
          <span class="proj-tag">${n.topic}</span>
          <div class="proj-title">${n.title}</div>
          <div class="proj-place">${n.source || 'Volga Infosys'} &middot; ${fmtDate(n.publishedAt || n.createdAt)}</div>
          <p class="proj-desc">${n.description}</p>
          <a class="btn-view" href="industry-news-edit.html?id=${n._id}">Edit</a>
        </div>
      </div>`).join('');
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
        <div class="proj-card-img" style="background-image:url('${m.url}'); height: 150px;"></div>
        <div class="proj-card-body">
          <div class="proj-title" style="font-size: 0.9rem;">${m.filename}</div>
          <div class="proj-place" style="font-size: 0.75rem;">${(m.size / 1024).toFixed(1)} KB</div>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
            <button class="btn-view media-copy-btn" data-url="${m.url}">Copy URL</button>
            <button class="btn-delete media-delete-btn" data-id="${m._id}">Delete</button>
          </div>
        </div>
      </div>`).join('');
    
    grid.querySelectorAll('.media-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.url).then(() => {
          btn.textContent = 'Copied!';
          setTimeout(() => btn.textContent = 'Copy URL', 2000);
        });
      });
    });

    grid.querySelectorAll('.media-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this media item?')) return;
        try {
          await apiFetch(`/media/${btn.dataset.id}`, { method: 'DELETE' });
          loadMediaLibrary();
        } catch (e) {
          console.error('Delete failed:', e);
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
}

// ── SETTINGS ─────────────────────────────────────────────────────────────
  let currentUser = null;
  let editingUserId = null;

  // Load current user
  async function loadCurrentUser() {
    const data = await apiFetch('/auth/me');
    currentUser = data.user;
    document.getElementById('settings-name').value = currentUser.name || '';
    document.getElementById('settings-email').value = currentUser.email || '';
    
    // Show/hide admin-only sections
    const isAdmin = currentUser.role === 'admin';
    document.getElementById('userManagementTitle').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('userManagementSection').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('roleApplicationsTitle').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('roleApplicationsSection').style.display = isAdmin ? 'block' : 'none';
    
    if (isAdmin) {
      loadUsers();
      loadRoleApplications();
    }
  }

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
      alert('Profile updated successfully!');
    } catch (e) {
      alert(e.message || 'Update failed');
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
      alert('Passwords do not match');
      return;
    }
    
    const btn = document.getElementById('changePasswordBtn');
    btn.textContent = 'Changing...';
    btn.disabled = true;
    try {
      await apiFetch('/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }) });
      alert('Password changed successfully!');
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
    } catch (e) {
      alert(e.message || 'Change failed');
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
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td><span class="badge badge-${u.role}">${u.role}</span></td>
        <td>${fmtDate(u.createdAt)}</td>
        <td><button class="btn-view edit-user-btn" data-id="${u._id}">Edit</button></td>
      </tr>
    `).join('');
    
    tbody.querySelectorAll('.edit-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const user = data.users.find(u => u._id === btn.dataset.id);
        openUserModal(user);
      });
    });
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

  document.getElementById('userSaveBtn')?.addEventListener('click', async () => {
    const body = {
      name: document.getElementById('user-name').value.trim(),
      email: document.getElementById('user-email').value.trim(),
      role: document.getElementById('user-role').value
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
      document.getElementById('userModalOverlay').classList.remove('open');
      loadUsers();
    } catch (e) {
      alert(e.message || 'Delete failed');
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
        <td>${a.applicantName}</td>
        <td>${a.applicantEmail}</td>
        <td><span class="badge badge-${a.requestedRole}">${a.requestedRole}</span></td>
        <td class="msg-cell">${a.reason}</td>
        <td><span class="badge badge-${a.status}">${a.status}</span></td>
        <td>${fmtDate(a.createdAt)}</td>
        <td>
          ${a.status === 'pending' ? `
            <button class="btn-view approve-role-btn" data-id="${a._id}" style="background: #10b981; color: white;">Approve</button>
            <button class="btn-delete reject-role-btn" data-id="${a._id}">Reject</button>
          ` : ''}
        </td>
      </tr>
    `).join('');
    
    tbody.querySelectorAll('.approve-role-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await apiFetch(`/auth/role-applications/${btn.dataset.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) });
          loadRoleApplications();
        } catch (e) {
          alert(e.message || 'Action failed');
        }
      });
    });
    
    tbody.querySelectorAll('.reject-role-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Reject this application?')) return;
        try {
          await apiFetch(`/auth/role-applications/${btn.dataset.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected' }) });
          loadRoleApplications();
        } catch (e) {
          alert(e.message || 'Action failed');
        }
      });
    });
  }

  // Load current user when dashboard initializes
  loadCurrentUser();

// ── UTILS ───────────────────────────────────────────────────────────────
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
