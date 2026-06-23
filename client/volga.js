/* ════════════════════════════════════════════════════════
   VOLGA INFOSYS — script.js
   GSAP 3 + ScrollTrigger animations, custom cursor,
   loader, nav scroll effects, counter animation
═══════════════════════════════════════════════════════════ */

// ─── 0. API CONFIG ───────────────────────────────────────
(function() {
  const RAILWAY_URL = 'https://volga-remodel-15-6-26-production.up.railway.app';
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  window.VOLGA_API = isLocal ? 'http://localhost:5000/api' : (RAILWAY_URL + '/api');
  window.getVolgaImageUrl = function(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads/')) {
      return isLocal ? ('http://localhost:5000' + url) : (RAILWAY_URL + url);
    }
    return url;
  };
})();

// ─── 1. REGISTER GSAP PLUGINS ───────────────────────────
try {
  if (typeof TextPlugin !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, TextPlugin);
  } else {
    gsap.registerPlugin(ScrollTrigger);
  }
} catch (e) {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── 2. LOADER ───────────────────────────────────────────
(function initLoader() {
  const loader = document.getElementById('loader');
  const fill = document.getElementById('loaderFill');
  const loaderTx = document.getElementById('loaderText');
  if (!loader || !fill || !loaderTx) return;

  const messages = [
    'Initializing Reality...',
    'Calibrating VR Engine...',
    'Loading Dimensions...',
    'Welcome to VOLGA'
  ];

  let pct = 0;
  const interval = setInterval(() => {
    pct += Math.random() * 18 + 4;
    if (pct > 100) pct = 100;
    fill.style.width = pct + '%';

    const msgIdx = Math.floor((pct / 100) * (messages.length - 1));
    loaderTx.textContent = messages[msgIdx];

    if (pct >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        gsap.to(loader, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            initHeroAnimation();
          }
        });
      }, 400);
    }
  }, 60);
})();



// ─── 4. HERO ANIMATION ───────────────────────────────────
function initHeroAnimation() {
  const lines = document.querySelectorAll('.Hero-line');
  if (!lines.length) return;
  const tl = gsap.timeline();

  tl.fromTo(lines,
    { y: '110%', opacity: 0 },
    {
      y: '0%', opacity: 1,
      duration: 1.1,
      ease: 'power4.out',
      stagger: 0.12
    }
  )
    .fromTo('.Hero-badge',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
      '-=0.5'
    )
    .fromTo('.Hero-sub',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo('.Hero-cta-row',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo('.Hero-scroll-hint',
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' },
      '-=0.5'
    )
    .fromTo('.Hero-stats .stat',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.15 },
      '-=0.4'
    );

  // Hero video parallax
  const heroVideo = document.querySelector('.Hero-video');
  if (heroVideo) {
    gsap.to('.Hero-video', {
      yPercent: 25,
      ease: 'none',
      scrollTrigger: {
        trigger: '.Hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // Animate stats counters
  document.querySelectorAll('.stat-num').forEach(el => {
    if (el.dataset.val) {
      const target = parseInt(el.dataset.val);
      if (!isNaN(target)) {
        gsap.to(el, {
          innerText: target,
          duration: 2.5,
          ease: 'power2.out',
          delay: 1.2,
          snap: { innerText: 1 },
          onUpdate: function () {
            el.innerText = Math.round(parseFloat(el.innerText));
          }
        });
      }
    }
  });
}

// ─── 5. NAV SCROLL EFFECT ────────────────────────────────
(function initNav() {
  const nav = document.getElementById('nav') || document.getElementById('navbar');
  const megaMenus = document.querySelectorAll('.mega-menu');
  if (nav) {
    ScrollTrigger.create({
      start: 'top -60px',
      onEnter: () => {
        nav.classList.add('scrolled');
        megaMenus.forEach(menu => menu.classList.add('scrolled'));
      },
      onLeaveBack: () => {
        nav.classList.remove('scrolled');
        megaMenus.forEach(menu => menu.classList.remove('scrolled'));
      }
    });
  }

  // Mobile burger
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');
  const mmLinks = document.querySelectorAll('.mm-link');
  let menuOpen = false;

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      menuOpen = !menuOpen;
      burger.setAttribute('aria-expanded', String(menuOpen));
      burger.setAttribute('aria-label', menuOpen ? 'Close menu' : 'Open menu');
      mobileMenu.classList.toggle('open', menuOpen);
      const spans = burger.querySelectorAll('span');
      if (menuOpen) {
        gsap.to(spans[0], { rotation: 45, y: 7, duration: 0.3 });
        gsap.to(spans[1], { opacity: 0, duration: 0.2 });
        gsap.to(spans[2], { rotation: -45, y: -7, duration: 0.3 });

        // Stagger animate links in
        gsap.fromTo(mmLinks,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.2, ease: 'power3.out' }
        );
      } else {
        gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.3 });
        gsap.to(spans[1], { opacity: 1, duration: 0.2 });
        gsap.to(spans[2], { rotation: 0, y: 0, duration: 0.3 });

        gsap.to(mmLinks, { y: 20, opacity: 0, duration: 0.3, ease: 'power3.in' });
      }
    });
  }

  // Close mobile menu on link click
  document.querySelectorAll('.mm-link').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      if (mobileMenu) mobileMenu.classList.remove('open');
      if (burger) {
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open menu');
        const spans = burger.querySelectorAll('span');
        gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.3 });
        gsap.to(spans[1], { opacity: 1, duration: 0.2 });
        gsap.to(spans[2], { rotation: 0, y: 0, duration: 0.3 });
      }
    });
  });

  // Close button inside mobile menu
  if (mobileClose) {
    mobileClose.addEventListener('click', () => {
      menuOpen = false;
      if (mobileMenu) mobileMenu.classList.remove('open');
      if (burger) {
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open menu');
        const spans = burger.querySelectorAll('span');
        gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.3 });
        gsap.to(spans[1], { opacity: 1, duration: 0.2 });
        gsap.to(spans[2], { rotation: 0, y: 0, duration: 0.3 });
      }
    });
  }
})();

// ─── 5.5. SCROLL PROGRESS BAR ─────────────────────────
(function initScrollProgress() {
  const progressBar = document.getElementById('progressBar') || document.getElementById('scrollProgressBar');
  if (progressBar) {
    gsap.to(progressBar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { 
        scrub: 0.3, 
        start: 'top top', 
        end: 'bottom bottom' 
      }
    });
  }
})();

// ─── 6. SCROLL-TRIGGERED REVEALS ─────────────────────────
function setupScrollReveals() {
  // Generic fade-up
  gsap.utils.toArray('.reveal, .reveal-fade').forEach(el => {
    const delay = parseFloat(el.style.transitionDelay || 0);
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: 0.75,
      ease: 'power3.out',
      delay,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  gsap.utils.toArray('.reveal-split').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Image reveals
  gsap.utils.toArray('.reveal-img').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.9,
      ease: 'power3.out',
      delay: parseFloat(el.style.getPropertyValue('--delay') || 0),
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Reveal left
  gsap.utils.toArray('.reveal-left').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });
  
  // Reveal right
  gsap.utils.toArray('.reveal-right').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });
  
  // Reveal scale
  gsap.utils.toArray('.reveal-scale').forEach(el => {
    gsap.to(el, {
      opacity: 1, scale: 1,
      duration: 0.8,
      ease: 'back.out(1.4)',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Service items slide in
  gsap.utils.toArray('.reveal-service').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, x: 0,
      duration: 0.7,
      ease: 'power3.out',
      delay: i * 0.07,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Process steps bounce up
  gsap.utils.toArray('.reveal-step').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: 0.8,
      ease: 'back.out(1.5)',
      delay: i * 0.12,
      scrollTrigger: {
        trigger: '.process-steps',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Why cards
  gsap.utils.toArray('.reveal-card').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: 0.75,
      ease: 'power3.out',
      delay: i * 0.1,
      scrollTrigger: {
        trigger: '.why-cards',
        start: 'top 82%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Benefit pills pop in
  gsap.utils.toArray('.reveal-pill').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, scale: 1,
      duration: 0.5,
      ease: 'back.out(2)',
      delay: i * 0.07,
      scrollTrigger: {
        trigger: '.benefits-grid',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Mission items
  gsap.utils.toArray('.reveal-mission').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: i * 0.15,
      scrollTrigger: {
        trigger: '.mission-grid',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // List items
  gsap.utils.toArray('.reveal-li').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, x: 0,
      duration: 0.6,
      ease: 'power3.out',
      delay: i * 0.1,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none reverse'
      }
    });
  });
  
  // Section rules draw animation
  gsap.utils.toArray('.section-rule').forEach(rule => {
    gsap.from(rule.querySelectorAll('.section-rule-line'), {
      scaleX: 0, duration: 1.2, ease: 'power3.inOut', transformOrigin: 'left',
      scrollTrigger: { trigger: rule, start: 'top 88%' }
    });
  });
}

function setupGlobalTextScrollAnimation() {
  const selectors = [
    'h1:not(.Hero-heading)',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    '.nav-link',
    '.nav-cta',
    '.mm-link',
    '.btn-primary',
    '.btn-ghost',
    '.Hero-badge',
    '.Hero-scroll-hint span',
    '.stat-num',
    '.stat-plus',
    '.stat-label',
    '.about-new-label',
    '.about-new-heading',
    '.about-new-subtitle',
    '.about-new-card-title',
    '.about-new-card-text',
    '.about-new-tag',
    '.s2-eyebrow',
    '.s2-title',
    '.s2-tab-label',
    '.ticker-track span'
  ];

  const targets = gsap.utils.toArray(selectors.join(','));
  if (!targets.length) return;

  targets.forEach(el => {
    if (!el.offsetParent) return;
    gsap.set(el, { opacity: 0, y: 24, skewY: 2, transformOrigin: 'top center' });
    gsap.to(el, {
      opacity: 1,
      y: 0,
      skewY: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 92%',
        once: true
      }
    });
  });
}

// ─── 7. SECTION HEADING PARALLAX ─────────────────────────
function setupParallax() {
  gsap.utils.toArray('.why-bg-text, .about-marquee').forEach(el => {
    gsap.to(el, {
      x: '-8%',
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('section'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });
}


// ─── 8. MAGNETIC HOVER EFFECT ───────────────
function setupMagnetic() {
  document.querySelectorAll('.service-item, .magnetic-btn').forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
      gsap.to(item, { x, y, duration: 0.4, ease: 'power2.out' });
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(item, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

// ─── 9. NAV LINK HOVER — REMOVED ──────────────────
// Nav link hover effects removed - using CSS decorations only

// ─── 10. TICKER PAUSE ON HOVER ───────────────────────────
(function tickerHover() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;
  track.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });
  track.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
  });
})();

// ─── 11. CONTACT FORM ────────────────────────────────────
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(`${window.VOLGA_API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();

      if (json.success) {
        btn.textContent = '✓ Message Sent!';
        gsap.fromTo(btn, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
        setTimeout(() => { btn.textContent = 'Send Message →'; btn.disabled = false; form.reset(); }, 3500);
      } else {
        btn.textContent = 'Failed — Try Again';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Error — Try Again';
      btn.disabled = false;
    }
  });

  // Input focus glow animation
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('focus', () => {
      gsap.to(input, {
        boxShadow: '0 0 0 2px rgba(0,245,212,0.3)',
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    input.addEventListener('blur', () => {
      gsap.to(input, {
        boxShadow: '0 0 0 0px rgba(0,245,212,0)',
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });
})();

// ─── 11.5 FETCH INSIGHTS DYNAMICALLY ──────
let allBlogs = [];
let allCaseStudies = [];
let allClientStories = [];
let allIndustryNews = [];
let currentBlogIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

async function fetchLatestBlogs() {
  const blogGrid = document.getElementById('blogGrid');
  if (!blogGrid) return;

  const API = window.VOLGA_API;

  try {
    const res = await fetch(`${API}/blogs`);
    const result = await res.json();
    const blogs = result.data || result; // Handle both wrapped and unwrapped responses

    if (blogs.length === 0) {
      blogGrid.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; width: 100%;">More insights coming soon.</p>';
      return;
    }

    allBlogs = blogs;
    currentBlogIndex = 0;

    renderBlogCards(blogGrid);
    setupBlogSwipe(blogGrid);

  } catch (err) {
    console.error("Failed to load blogs:", err);
    blogGrid.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; width: 100%;">Failed to load insights.</p>';
  }
}

function renderBlogCards(blogGrid) {
  const cardsToShow = allBlogs.slice(currentBlogIndex, currentBlogIndex + 3);

  if (cardsToShow.length === 0) {
    currentBlogIndex = 0;
    return renderBlogCards(blogGrid);
  }

  blogGrid.innerHTML = cardsToShow.map((blog, i) => `
    <a href="blog-detail.html?id=${blog._id}" class="holo-card reveal-fade blog-card" data-blog-id="${blog._id}" style="--delay: ${i * 0.1}s">
      <div class="holo-img-wrap">
        <img src="${blog.image || 'blog-hero.jpg'}" alt="${blog.title}" onerror="this.src='blog-hero.jpg'">
        <div class="holo-badge">${blog.category || 'Tech'}</div>
      </div>
      <div class="holo-content">
        <h3 class="holo-title">${blog.title}</h3>
        <p class="holo-excerpt">${blog.excerpt || blog.content.substring(0, 120) + '...'}</p>
        <div class="holo-footer">
          <span>${new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <div class="holo-readmore">Read <i class="fas fa-arrow-right"></i></div>
        </div>
      </div>
    </a>
  `).join('');

  addBlogNavigation(blogGrid);

  setTimeout(() => {
    ScrollTrigger.refresh();
    gsap.utils.toArray('.holo-card.reveal-fade').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: parseFloat(el.style.getPropertyValue('--delay') || 0),
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      });
    });
  }, 100);
}

function setupBlogSwipe(blogGrid) {
  blogGrid.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  blogGrid.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleBlogSwipe(blogGrid);
  }, false);

  let isMouseDown = false;
  let mouseStartX = 0;

  blogGrid.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    mouseStartX = e.clientX;
  });

  blogGrid.addEventListener('mouseup', (e) => {
    if (isMouseDown) {
      touchStartX = mouseStartX;
      touchEndX = e.clientX;
      handleBlogSwipe(blogGrid);
      isMouseDown = false;
    }
  });

  document.addEventListener('mouseleave', () => {
    isMouseDown = false;
  });
}

function handleBlogSwipe(blogGrid) {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      currentBlogIndex = Math.min(currentBlogIndex + 3, allBlogs.length - 1);
      if (currentBlogIndex + 3 > allBlogs.length) {
        currentBlogIndex = Math.max(0, allBlogs.length - 3);
      }
    } else {
      currentBlogIndex = Math.max(currentBlogIndex - 3, 0);
    }

    gsap.to(blogGrid, {
      opacity: 0.5,
      duration: 0.2,
      onComplete: () => {
        renderBlogCards(blogGrid);
        gsap.to(blogGrid, { opacity: 1, duration: 0.2 });
      }
    });
  }
}

function addBlogNavigation(blogGrid) {
  const parent = blogGrid.parentElement;

  const existingNav = parent.querySelector('.blog-nav-controls');
  if (existingNav) existingNav.remove();

  const navControls = document.createElement('div');
  navControls.className = 'blog-nav-controls';
  navControls.innerHTML = `
    <button class="blog-nav-btn blog-nav-prev" ${currentBlogIndex === 0 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>
    <div class="blog-dots">
      ${Array.from({ length: Math.ceil(allBlogs.length / 3) }).map((_, i) =>
    `<div class="blog-dot ${i === Math.floor(currentBlogIndex / 3) ? 'active' : ''}"></div>`
  ).join('')}
    </div>
    <button class="blog-nav-btn blog-nav-next" ${currentBlogIndex + 3 >= allBlogs.length ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>
  `;

  parent.appendChild(navControls);

  navControls.querySelector('.blog-nav-prev').addEventListener('click', () => {
    currentBlogIndex = Math.max(currentBlogIndex - 3, 0);
    gsap.to(blogGrid, {
      opacity: 0.5,
      duration: 0.2,
      onComplete: () => {
        renderBlogCards(blogGrid);
        gsap.to(blogGrid, { opacity: 1, duration: 0.2 });
      }
    });
  });

  navControls.querySelector('.blog-nav-next').addEventListener('click', () => {
    currentBlogIndex = Math.min(currentBlogIndex + 3, allBlogs.length - 3);
    gsap.to(blogGrid, {
      opacity: 0.5,
      duration: 0.2,
      onComplete: () => {
        renderBlogCards(blogGrid);
        gsap.to(blogGrid, { opacity: 1, duration: 0.2 });
      }
    });
  });
}

// ─── 11.6 REAL-TIME BLOG UPDATES ────────────────────────────
function setupBlogRealtimeUpdates() {
  const API = window.VOLGA_API;

  setInterval(async () => {
    try {
      const res = await fetch(`${API}/blogs`);
      const result = await res.json();
      const blogs = result.data || result;

      if (blogs.length > allBlogs.length) {
        allBlogs = blogs;
        const blogGrid = document.getElementById('blogGrid');

        gsap.to(blogGrid, {
          scale: 0.98,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            renderBlogCards(blogGrid);
          }
        });
      }
    } catch (err) {
      console.error("Failed to check for blog updates:", err);
    }
  }, 10000);
}

// ─── FETCH CASE STUDIES DYNAMICALLY ──────
async function fetchCaseStudies() {
  const caseStudiesContainer = document.getElementById('caseStudiesContainer');
  if (!caseStudiesContainer) return;

  const API = window.VOLGA_API;

  try {
    const res = await fetch(`${API}/case-studies`);
    const caseStudies = await res.json();

    if (caseStudies.length === 0) {
      caseStudiesContainer.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; width: 100%; padding: 40px;">More case studies coming soon.</p>';
      return;
    }

    allCaseStudies = caseStudies;
    renderCaseStudies(caseStudiesContainer);

  } catch (err) {
    console.error("Failed to load case studies:", err);
    caseStudiesContainer.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; width: 100%; padding: 40px;">Failed to load case studies.</p>';
  }
}

function renderCaseStudies(container) {
  container.innerHTML = `<div class="blog-grid">${allCaseStudies.map((cs, i) => `
    <a href="case-study-detail.html?id=${cs._id}" class="cs-card" style="text-decoration: none;">
      <img class="cs-img" src="${cs.image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80'}" alt="${cs.title}">
      <div class="cs-body">
        <div class="cs-industry">${cs.industry || 'Industry'}</div>
        <div class="cs-title">${cs.title}</div>
        <div class="cs-desc">${cs.description || ''}</div>
        ${cs.metrics && cs.metrics.length > 0 ? `
          <div class="cs-stats">
            ${cs.metrics.slice(0, 3).map((metric) => `
              <div>
                <div class="cs-stat-num">${metric.value}</div>
                <div class="cs-stat-label">${metric.label}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div class="cs-footer">
          <span class="cs-meta">${cs.year || new Date(cs.createdAt).toLocaleDateString('en-US', { year: 'numeric' })} · ${cs.industry || 'Industry'}</span>
          <div class="read-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </a>
  `).join('')}</div>`;
}

// ─── FETCH CLIENT STORIES DYNAMICALLY ──────
async function fetchClientStories() {
  const storiesGrid = document.getElementById('storiesGrid');
  if (!storiesGrid) return;

  const API = window.VOLGA_API;

  try {
    const res = await fetch(`${API}/client-stories`);
    if (!res.ok) throw new Error('API request failed');
    const stories = await res.json();

    if (stories.length === 0) {
      storiesGrid.innerHTML = '<p style="color: var(--gray); text-align: center; width: 100%; padding: 40px;">More client stories coming soon.</p>';
      return;
    }

    allClientStories = stories;
    renderClientStories(storiesGrid);

  } catch (err) {
    console.error("Failed to load client stories, using fallback data:", err);
    // Fallback static data
    allClientStories = [
      {
        industry: 'Manufacturing',
        testimonial: 'Volga XR turned our training into a measurable competitive advantage. Our field teams onboarded 50% faster.',
        clientName: 'Sarah Chen',
        clientRole: 'Head of Training, Tesla',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
        impact: ['VR Training', 'Safety', 'Efficiency']
      },
      {
        industry: 'Healthcare',
        testimonial: 'The VR simulations made training safer, faster, and more engaging. Staff practiced critical procedures risk-free.',
        clientName: 'Dr. Emily Rodriguez',
        clientRole: 'Medical Director, Mayo Clinic',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&q=80',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
        impact: ['Healthcare', 'Simulation', 'Education']
      },
      {
        industry: 'Real Estate',
        testimonial: 'Remote buyers now feel like they are walking through the home in person. Virtual tours increased qualified leads by 30%.',
        clientName: 'Michael Torres',
        clientRole: 'CEO, Luxury Homes Inc.',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
        impact: ['Virtual Tours', 'Lead Generation', 'AR/VR']
      },
      {
        industry: 'Retail',
        testimonial: 'The AR product configurator became a customer favorite overnight. Shoppers visualized products in their space.',
        clientName: 'Jessica Williams',
        clientRole: 'CMO, Fashion Forward',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&q=80',
        impact: ['AR Configurator', 'E-Commerce', 'Customer Experience']
      }
    ];
    renderClientStories(storiesGrid);
  }
}

function renderClientStories(container) {
  container.innerHTML = allClientStories.map((story, i) => `
    <div class="story-card">
      <div class="sc-img-wrap">
        <img class="sc-img" src="${story.image || 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&q=80'}" alt="${story.clientName}">
        <div class="sc-industry">${story.industry || 'Industry'}</div>
      </div>
      <div class="sc-body">
        <blockquote class="sc-quote">${story.testimonial || ''}</blockquote>
        <div class="sc-author">
          <img class="sc-avatar" src="${story.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'}" alt="">
          <div>
            <div class="sc-name">${story.clientName}</div>
            <div class="sc-role">${story.clientRole || ''}</div>
          </div>
        </div>
        ${story.impact && story.impact.length > 0 ? `
          <div class="sc-impact">
            ${story.impact.map((item) => `
              <span class="impact-chip">${item}</span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// ─── FETCH INDUSTRY NEWS DYNAMICALLY ──────
async function fetchIndustryNews() {
  const newsContainer = document.getElementById('newsContainer');
  if (!newsContainer) return;

  const API = window.VOLGA_API;

  try {
    const res = await fetch(`${API}/industry-news`);
    const news = await res.json();

    if (news.length === 0) {
      newsContainer.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; width: 100%; padding: 40px;">More news coming soon.</p>';
      return;
    }

    allIndustryNews = news;
    renderIndustryNews(newsContainer);

  } catch (err) {
    console.error("Failed to load industry news:", err);
    newsContainer.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; width: 100%; padding: 40px;">Failed to load industry news.</p>';
  }
}

function renderIndustryNews(container) {
  // Group news by month/year
  const grouped = {};
  allIndustryNews.forEach(item => {
    const date = new Date(item.publishedAt || item.createdAt);
    const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  container.innerHTML = Object.entries(grouped).map(([month, items]) => `
    <div class="date-group">
      <div class="date-label">${month}</div>
      <div class="blog-grid">
        ${items.map(item => `
          <a href="industry-news-detail.html?id=${item._id}" class="blog-card" style="text-decoration: none;">
            <img class="blog-card-img" src="${item.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500&q=80'}" alt="${item.title}">
            <div class="blog-card-body">
              <div class="blog-tag">${item.topic || 'Industry News'}</div>
              <h3 class="blog-card-title">${item.title}</h3>
              <p class="blog-card-excerpt">${item.description || ''}</p>
              <div class="blog-card-footer">
                <div class="blog-meta">
                  <div class="author-avatar">VI</div>
                  <span class="blog-meta-text">${item.source || 'Volga Infosys'} · ${new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div class="read-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ─── FETCH AND RENDER INSIGHTS OVERVIEW ────────
async function fetchInsightsOverview() {
  const container = document.getElementById('insights-overview-container');
  if (!container) return;

  const API = window.VOLGA_API;

  try {
    // Fetch all insight types in parallel
    const [blogsRes, caseStudiesRes, clientStoriesRes, industryNewsRes] = await Promise.all([
      fetch(`${API}/blogs`),
      fetch(`${API}/case-studies`),
      fetch(`${API}/client-stories`),
      fetch(`${API}/industry-news`)
    ]);

    const blogsResult = await blogsRes.json();
    const blogs = blogsResult.data || blogsResult;
    const caseStudies = await caseStudiesRes.json();
    const clientStories = await clientStoriesRes.json();
    const industryNews = await industryNewsRes.json();

    // Get latest 3 from each
    const latestBlogs = blogs.slice(0,5);
    const latestCaseStudies = caseStudies.slice(0, 3);
    const latestClientStories = clientStories.slice(0, 3);
    const latestIndustryNews = industryNews.slice(0, 3);

    renderInsightsOverview(latestBlogs, latestCaseStudies, latestClientStories, latestIndustryNews);
  } catch (error) {
    console.error('Failed to load insights overview:', error);
    container.innerHTML = '<p style="color:rgba(255,255,255,0.7);text-align:center;padding:20px;">Failed to load insights</p>';
  }
}

function renderInsightsOverview(blogs, caseStudies, clientStories, industryNews) {
  const container = document.getElementById('insights-overview-container');
  if (!container) return;

  container.innerHTML = `
    <div class="section-label">Recent Content</div>
    <div class="insights-grid">
      <!-- Recent Blogs -->
      <div class="insight-section">
        <h3 class="insight-title">Blogs</h3>
        <div class="insight-cards">
          ${blogs.map(blog => `
            <a href="blog-detail.html?id=${blog._id}" class="insight-card">
              <img src="${blog.image || 'blog-hero.jpg'}" alt="${blog.title}">
              <div class="insight-card-content">
                <span class="insight-tag">Blog</span>
                <h4>${blog.title}</h4>
                <span class="insight-date">${new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>

      <!-- Recent Case Studies -->
      <div class="insight-section">
        <h3 class="insight-title">Case Studies</h3>
        <div class="insight-cards">
          ${caseStudies.map(cs => `
            <a href="case-study-detail.html?id=${cs._id}" class="insight-card">
              <img src="${cs.image}" alt="${cs.title}">
              <div class="insight-card-content">
                <span class="insight-tag">Case Study</span>
                <h4>${cs.title}</h4>
                <span class="insight-date">${cs.year || new Date(cs.createdAt).toLocaleDateString('en-US', { year: 'numeric' })}</span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>

      <!-- Recent Client Stories -->
      <div class="insight-section">
        <h3 class="insight-title">Client Stories</h3>
        <div class="insight-cards">
          ${clientStories.map(story => `
            <a href="client-stories.html" class="insight-card">
              <img src="${story.image}" alt="${story.clientName}">
              <div class="insight-card-content">
                <span class="insight-tag">Client Story</span>
                <h4>${story.clientName}</h4>
                <span class="insight-date">${story.industry}</span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>

      <!-- Recent Industry News -->
      <div class="insight-section">
        <h3 class="insight-title">Industry News</h3>
        <div class="insight-cards">
          ${industryNews.map(news => `
            <a href="industry-news-detail.html?id=${news._id}" class="insight-card">
              <img src="${news.image}" alt="${news.title}">
              <div class="insight-card-content">
                <span class="insight-tag">News</span>
                <h4>${news.title}</h4>
                <span class="insight-date">${new Date(news.publishedAt || news.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Add some styles for insights grid
  const style = document.createElement('style');
  style.textContent = `
    .insights-grid {
      display: grid;
      grid-template-rows: repeat(auto-fit, minmax(280px, 3fr));
      gap: 2rem;
      margin-top: 1.5rem;
    }
    .insight-section h3 {
      font-family: 'DM Serif Display', serif;
      margin-bottom: 1rem;
      color: var(--navy);
    }
    .insight-cards {
      display: flex;
      flex-direction: row;
      gap: 1rem;
    }
    .insight-card {
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .insight-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    .insight-card img {
      width: 100%;
      height: 160px;
      object-fit: cover;
    }
    .insight-card-content {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .insight-tag {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--gold);
    }
    .insight-card h4 {
      font-size: 0.95rem;
      color: var(--text-dark);
      margin: 0;
    }
    .insight-date {
      font-size: 0.8rem;
      color: var(--text-light);
    }
  `;
  document.head.appendChild(style);
}

// ─── 12. ORBIT DOTS ANIMATION (GSAP override CSS) ────────
function animateOrbit() {
  const dots = ['.od-1', '.od-2', '.od-3', '.od-4'];
  const radii = [190, 130, 190, 130];

  dots.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const cx = 190;
    const cy = 190;
    const r = radii[i];
    const startAngle = (i / dots.length) * Math.PI * 2;
    const duration = 12 + i * 2;

    gsap.to({ angle: startAngle }, {
      angle: startAngle + Math.PI * 2,
      duration: duration,
      ease: 'none',
      repeat: -1,
      onUpdate: function () {
        const a = this.targets()[0].angle;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        gsap.set(el, {
          position: 'absolute',
          left: cx + x - 24 + 'px',
          top: cy + y - 24 + 'px',
          x: 0, y: 0,
          transform: 'none'
        });
      }
    });
  });
}

// ─── 13. SMOOTH SCROLL ANCHOR ────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      gsap.to(window, {
        scrollTo: { y: target, offsetY: 80 },
        duration: 1.1,
        ease: 'power4.inOut'
      });
    }
  });
});

// ─── 14. FOOTER REVEAL ───────────────────────────────────
function setupFooter() {
  const footerEl = document.querySelector('.footer');
  if (!footerEl) return;

  gsap.fromTo(footerEl, { opacity: 0 }, {
    opacity: 1, duration: 1,
    scrollTrigger: {
      trigger: footerEl,
      start: 'top 95%',
      once: true
    }
  });
}
function tick(){
  var n=new Date(),h=String(n.getHours()).padStart(2,'0'),m=String(n.getMinutes()).padStart(2,'0');
  document.getElementById('clk').textContent='IST → '+h+':'+m;
}
tick();setInterval(tick,10000);

// ─── 14.5 MISSION CARD MOBILE FLIP ────────────────────────
function setupMissionCardFlip() {
  const cards = document.querySelectorAll('.cols .col');

  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        card.classList.toggle('hover');

        gsap.to(card, {
          scale: 1.02,
          duration: 0.3,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1
        });
      }
    });
  });

  if (window.innerWidth <= 768) {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.cols .col')) {
        cards.forEach(card => card.classList.remove('hover'));
      }
    });
  }
}

// ─── 15. INIT ON DOM READY ───────────────────────────────
// Hero floating shapes parallax
function setupHeroParallax() {
  const shapes = document.querySelectorAll('.shape');
  if (shapes.length === 0) return;
  
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    
    shapes.forEach((shape, index) => {
      const multiplier = (index % 3 + 1) * 0.5;
      const moveX = x * multiplier;
      const moveY = y * multiplier;
      gsap.to(shape, {
        x: moveX,
        y: moveY,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    document.querySelectorAll('.page-hero').forEach(el => el.classList.add('Hero'));
    document.querySelectorAll('.page-hero-video-wrap').forEach(el => el.classList.add('Hero-video-wrap'));
    document.querySelectorAll('.page-hero-video-overlay').forEach(el => el.classList.add('Hero-video-overlay'));
    document.querySelectorAll('.page-hero-content').forEach(el => el.classList.add('Hero-content'));
    document.querySelectorAll('.page-hero-label, .hero-badge').forEach(el => el.classList.add('Hero-badge'));
    document.querySelectorAll('.page-hero-title, .hero-heading, .hero-title').forEach(el => el.classList.add('Hero-heading'));
    document.querySelectorAll('.page-hero-sub, .hero-sub').forEach(el => el.classList.add('Hero-sub'));
    document.querySelectorAll('.page-hero-cta-row, .hero-cta-row').forEach(el => el.classList.add('Hero-cta-row'));
    document.querySelectorAll('.page-hero-scroll-hint, .hero-scroll-hint').forEach(el => el.classList.add('Hero-scroll-hint'));
    document.querySelectorAll('.page-hero-stats, .hero-stats').forEach(el => el.classList.add('Hero-stats'));
    document.querySelectorAll('.hero-line').forEach(el => el.classList.add('Hero-line'));
  } catch (e) { /* no-op */ }
  setupHeroParallax();
  setupScrollReveals();
  setupGlobalTextScrollAnimation();
  setupParallax();
  setupMagnetic();
  setupMissionCardFlip();
  if (document.getElementById('blogGrid') && !document.getElementById('blogFeatured')) {
    fetchLatestBlogs();
    setupBlogRealtimeUpdates();
  }
  if (document.getElementById('caseStudiesContainer')) {
    fetchCaseStudies();
  }
  if (document.getElementById('storiesGrid')) {
    fetchClientStories();
  }
  if (document.getElementById('newsContainer')) {
    fetchIndustryNews();
  }
  if (document.getElementById('insights-overview-container')) {
    fetchInsightsOverview();
  }
  animateOrbit();
  setupFooter();

  const scrollProgressBar = document.getElementById('scrollProgressBar');
  if (scrollProgressBar) {
    gsap.to(scrollProgressBar, {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3
      }
    });
  }

  if (!gsap.plugins || !gsap.plugins.scrollTo) {
    const st = ScrollTrigger;
    window.addEventListener('scroll', () => { });
  }
});

// ─── 16. SECTION BACKGROUND COLOR SCRUB ─────────────────
if (document.querySelector('.services')) {
  ScrollTrigger.create({
    trigger: '.services',
    start: 'top 50%',
    end: 'bottom 50%',
    onEnter: () => document.body.style.setProperty('--tick-color', '#7b2fff'),
    onLeave: () => document.body.style.setProperty('--tick-color', '#00f5d4'),
    onEnterBack: () => document.body.style.setProperty('--tick-color', '#7b2fff'),
    onLeaveBack: () => document.body.style.setProperty('--tick-color', '#00f5d4'),
  });
}

// ─── 17. PROCESS STEP STAGGER SCRUB ─────────────────────
gsap.utils.toArray('.process-step').forEach((step, i) => {
  gsap.fromTo(step, { opacity: 0.3, scale: 0.95 }, {
    opacity: 1, scale: 1,
    ease: 'power2.inOut',
    scrollTrigger: {
      trigger: step,
      start: 'top 75%',
      end: 'top 40%',
      scrub: 0.6
    }
  });
});

// ─── 19. CTA SECTION DRAMATIC REVEAL ────────────────────
if (document.querySelector('.cta-banner') && document.querySelector('.cta-heading')) {
  gsap.from('.cta-heading', {
    opacity: 0,
    letterSpacing: '0.3em',
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.cta-banner',
      start: 'top 75%',
      once: true
    }
  });
}

// ─── 20. FOOTER BRAND TEXT SCRAMBLE ─────────────────────


console.log('%cVOLGA INFOSYS', 'color:#00f5d4;font-size:2rem;font-weight:bold;');
console.log('%cVR & AR Pioneers — Ludhiana, Punjab', 'color:#7a85a0;');

// ─── MISSION CARD CLICK (mobile, bottom duplicate removed) ──
document.querySelectorAll('.cols .col').forEach(card => {
  card.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      card.classList.toggle('hover');
    }
  });
});
document.querySelectorAll('.nav-cta-orange').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty('--x', x + '%');
    btn.style.setProperty('--y', y + '%');
  });
});

(function initHomeSuiteAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  gsap.utils.toArray('.solutionss-section, .home-suite-section, .home-suite-about, .home-suite-cta, .home-suite-stats').forEach(section => {
    const headerBits = section.querySelectorAll('.solutionss-kicker, .solutionss-title, .solutionss-desc, .home-suite-label, .home-suite-title, .home-suite-sub, .home-suite-about-text > h2, .home-suite-about-text > p, .home-suite-cta > h2, .home-suite-cta > p');
    const cards = section.querySelectorAll('.solutions-card, .home-suite-service-card, .home-suite-industry, .home-suite-work-card, .home-suite-tech, .home-suite-insight, .home-suite-about-stats > div, .home-suite-about-tile, .home-suite-stat');

    if (headerBits.length) {
      gsap.fromTo(headerBits,
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: section,
            start: 'top 76%'
          }
        }
      );
    }

    if (cards.length) {
      gsap.fromTo(cards,
        { autoAlpha: 0, y: 34, scale: 0.985 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.055,
          scrollTrigger: {
            trigger: section,
            start: 'top 70%'
          }
        }
      );
    }
  });

  document.querySelectorAll('.home-suite-stat-num').forEach(el => {
    const raw = el.textContent || '';
    const target = parseInt(raw, 10);
    if (!target) return;
    const hasPlus = raw.includes('+');
    const hasPercent = raw.includes('%');
    const counter = { value: 0 };

    gsap.to(counter, {
      value: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
        once: true
      },
      onUpdate: () => {
        el.innerHTML = `${Math.round(counter.value)}${hasPercent ? '%' : ''}${hasPlus ? '<span>+</span>' : ''}`;
      }
    });
  });

  const rail = document.querySelector('.home-suite-industry-rail');
  const track = document.querySelector('.home-suite-industry-track');

  if (rail && track) {
    gsap.fromTo('.home-suite-industry-panel',
      { autoAlpha: 0, x: 70 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: '.home-suite-industry-scroll-section',
          start: 'top 72%'
        }
      }
    );

    rail.addEventListener('wheel', (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      rail.scrollLeft += event.deltaY;
    }, { passive: true });
  }

  const servicesRail = document.querySelector('.nav-services-rail');
  const servicesTrack = document.querySelector('.nav-services-track');

  if (servicesRail && servicesTrack) {
    gsap.fromTo('.nav-services-intro > *, .nav-service-panel',
      { autoAlpha: 0, y: 34 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: {
          trigger: '.nav-services-horizontal',
          start: 'top 72%'
        }
      }
    );


  }
})();


document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});
const nav = document.querySelector('nav');
const sections = document.querySelectorAll('section[data-theme]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.intersectionRatio > 0.5) {
      const theme = entry.target.dataset.theme;
      nav.classList.toggle('light-section', theme === 'light');
    }
  });
}, { threshold: 0.5 });

sections.forEach(s => observer.observe(s));








const menus = {};
let activeMenu = null;
let closeTimer = null;
 
document.querySelectorAll('.nav-item[data-menu]').forEach(item => {
  const key = item.dataset.menu;
  const menuEl = document.getElementById('menu-' + key);
  if (!menuEl) return;
  menus[key] = { item, menuEl };
});
 
function openMenu(key) {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
  if (activeMenu === key) return;
 
  if (activeMenu) {
    const prev = menus[activeMenu];
    prev.item.classList.remove('open','active');
    gsap.to(prev.menuEl.querySelectorAll('.mega-item'), { opacity:0, y:0, duration:0.1, stagger:0 });
    prev.menuEl.classList.remove('visible');
    gsap.set(prev.menuEl, { opacity:0 });
  }
 
  activeMenu = key;
  const { item, menuEl } = menus[key];
  item.classList.add('open','active');
  menuEl.classList.add('visible');
 
  gsap.killTweensOf(menuEl);
  gsap.fromTo(menuEl, { opacity:0, y:-8 }, { opacity:1, y:0, duration:0.35, ease:'power3.out' });
 
  const items = menuEl.querySelectorAll('.mega-item');
  gsap.fromTo(items,
    { opacity:0, y:10, x:-4 },
    { opacity:1, y:0, x:0, duration:0.4, stagger:0.035, ease:'power2.out', delay:0.05 }
  );
 
  gsap.fromTo(menuEl.querySelector('.mega-highlight'),
    { opacity:0, x:16 },
    { opacity:1, x:0, duration:0.45, ease:'power2.out', delay:0.1 }
  );
 
  document.getElementById('backdrop').classList.add('active');
}
 
function closeMenu(delay = 0) {
  if (!activeMenu) return;
  closeTimer = setTimeout(() => {
    if (!activeMenu) return;
    const { item, menuEl } = menus[activeMenu];
    item.classList.remove('open','active');
 
    gsap.to(menuEl, {
      opacity:0, y:-6, duration:0.25, ease:'power2.in',
      onComplete: () => {
        menuEl.classList.remove('visible');
        gsap.set(menuEl, { y:0 });
      }
    });
 
    activeMenu = null;
    document.getElementById('backdrop').classList.remove('active');
  }, delay);
}
 
Object.entries(menus).forEach(([key, { item, menuEl }]) => {
  item.addEventListener('mouseenter', () => openMenu(key));
  item.addEventListener('mouseleave', () => closeMenu(120));
  menuEl.addEventListener('mouseenter', () => { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; } });
  menuEl.addEventListener('mouseleave', () => closeMenu(80));
  item.addEventListener('click', () => activeMenu === key ? closeMenu() : openMenu(key));
});
 
document.getElementById('backdrop').addEventListener('click', () => closeMenu());
 
// scroll effect
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY 
> 10);
}, { passive:true });

// Button Ripple Effect
document.querySelectorAll('.btn-primary, .btn-ghost, .btn-ghost-light, .nav-cta, .btn-see-all, .home-suite-link').forEach(btn => {
  btn.addEventListener('mouseenter', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.style.setProperty('--ripple-x', `${x}px`);
    this.style.setProperty('--ripple-y', `${y}px`);
  });
  
  btn.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.style.setProperty('--ripple-x', `${x}px`);
    this.style.setProperty('--ripple-y', `${y}px`);
  });
});


