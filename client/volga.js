/* ════════════════════════════════════════════════════════
   VOLGA INFOSYS — volga.js
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
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Helper function to animate a group of elements
  const animateGroup = (selector, props) => {
    const elements = gsap.utils.toArray(selector);
    if (!elements.length) return;
    
    if (prefersReducedMotion) {
      gsap.set(elements, { opacity: 1, y: 0, x: 0, scale: 1 });
      return;
    }

    // Group by closest container
    const containers = new Map();
    elements.forEach(el => {
      const container = el.closest('section, .container, div') || document.body;
      if (!containers.has(container)) {
        containers.set(container, []);
      }
      containers.get(container).push(el);
    });

    containers.forEach((els, container) => {
      gsap.to(els, {
        ...props,
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: props.toggleActions || 'play none none none', // Don't reverse
          once: true
        }
      });
    });
  };

  // Animate all groups
  animateGroup('.reveal, .reveal-fade', {
    opacity: 1, y: 0,
    duration: 0.75,
    ease: 'power3.out'
  });

  animateGroup('.reveal-split', {
    opacity: 1, y: 0,
    duration: 0.9,
    ease: 'power3.out'
  });

  animateGroup('.reveal-img', {
    opacity: 1, y: 0, scale: 1,
    duration: 0.9,
    ease: 'power3.out'
  });

  animateGroup('.reveal-left', {
    opacity: 1, x: 0,
    duration: 0.9,
    ease: 'power3.out'
  });

  animateGroup('.reveal-right', {
    opacity: 1, x: 0,
    duration: 0.9,
    ease: 'power3.out'
  });

  animateGroup('.reveal-scale', {
    opacity: 1, scale: 1,
    duration: 0.8,
    ease: 'back.out(1.4)'
  });

  // Special cases with indexes
  const revealServiceEls = gsap.utils.toArray('.reveal-service');
  if (revealServiceEls.length && !prefersReducedMotion) {
    gsap.to(revealServiceEls, {
      opacity: 1, x: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.07,
      scrollTrigger: {
        trigger: revealServiceEls[0].closest('section, .container') || document.body,
        start: 'top 88%',
        toggleActions: 'play none none none',
        once: true
      }
    });
  }

  const revealStepEls = gsap.utils.toArray('.reveal-step');
  if (revealStepEls.length && !prefersReducedMotion) {
    gsap.to(revealStepEls, {
      opacity: 1, y: 0,
      duration: 0.8,
      ease: 'back.out(1.5)',
      stagger: 0.12,
      scrollTrigger: {
        trigger: '.process-steps',
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true
      }
    });
  }

  const revealCardEls = gsap.utils.toArray('.reveal-card');
  if (revealCardEls.length && !prefersReducedMotion) {
    gsap.to(revealCardEls, {
      opacity: 1, y: 0,
      duration: 0.75,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.why-cards',
        start: 'top 82%',
        toggleActions: 'play none none none',
        once: true
      }
    });
  }

  const revealPillEls = gsap.utils.toArray('.reveal-pill');
  if (revealPillEls.length && !prefersReducedMotion) {
    gsap.to(revealPillEls, {
      opacity: 1, scale: 1,
      duration: 0.5,
      ease: 'back.out(2)',
      stagger: 0.07,
      scrollTrigger: {
        trigger: '.benefits-grid',
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true
      }
    });
  }

  const revealMissionEls = gsap.utils.toArray('.reveal-mission');
  if (revealMissionEls.length && !prefersReducedMotion) {
    gsap.to(revealMissionEls, {
      opacity: 1, y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.15,
      scrollTrigger: {
        trigger: '.mission-grid',
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true
      }
    });
  }

  const revealLiEls = gsap.utils.toArray('.reveal-li');
  if (revealLiEls.length && !prefersReducedMotion) {
    gsap.to(revealLiEls, {
      opacity: 1, x: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: revealLiEls[0].closest('section, .container') || document.body,
        start: 'top 88%',
        toggleActions: 'play none none none',
        once: true
      }
    });
  }

  // Section rule lines
  const sectionRules = gsap.utils.toArray('.section-rule');
  if (sectionRules.length && !prefersReducedMotion) {
    sectionRules.forEach(rule => {
      gsap.from(rule.querySelectorAll('.section-rule-line'), {
        scaleX: 0, duration: 1.2, ease: 'power3.inOut', transformOrigin: 'left',
        scrollTrigger: { trigger: rule, start: 'top 88%', once: true }
      });
    });
  }
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

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    targets.forEach(el => {
      if (!el.closest('.Hero, .cta-banner, .cta-inner, .cube-mission-wrap, .blog-section')) {
        gsap.set(el, { opacity: 1, y: 0, skewY: 0 });
      }
    });
    return;
  }

  // Group elements by their closest section/container
  const containers = new Map();
  targets.forEach(el => {
    if (!el.offsetParent) return;
    if (el.closest('.Hero, .cta-banner, .cta-inner, .cube-mission-wrap, .blog-section')) return;
    
    const container = el.closest('section, .container, div') || document.body;
    if (!containers.has(container)) {
      containers.set(container, []);
    }
    containers.get(container).push(el);
  });

  // Animate each container's elements with a single ScrollTrigger
  containers.forEach((elements, container) => {
    gsap.set(elements, { opacity: 0, y: 24, skewY: 2, transformOrigin: 'top center' });
    gsap.to(elements, {
      opacity: 1,
      y: 0,
      skewY: 0,
      duration: 0.75,
      ease: 'power3.out',
      stagger: 0.05,
      scrollTrigger: {
        trigger: container,
        start: 'top 85%',
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
    let isAnimating = false;
    let requestId = null;
    let targetX = 0;
    let targetY = 0;

    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      targetX = (e.clientX - rect.left - rect.width / 2) * 0.2;
      targetY = (e.clientY - rect.top - rect.height / 2) * 0.2;
      
      if (!isAnimating) {
        isAnimating = true;
        requestId = requestAnimationFrame(() => {
          gsap.set(item, { x: targetX, y: targetY });
          isAnimating = false;
        });
      }
    });
    item.addEventListener('mouseleave', () => {
      if (requestId) cancelAnimationFrame(requestId);
      gsap.to(item, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

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

  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('focus', () => {
      gsap.to(input, { boxShadow: '0 0 0 2px rgba(0,245,212,0.3)', duration: 0.3, ease: 'power2.out' });
    });
    input.addEventListener('blur', () => {
      gsap.to(input, { boxShadow: '0 0 0 0px rgba(0,245,212,0)', duration: 0.3, ease: 'power2.out' });
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
    const blogs = result.data || result;

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
        <img src="${window.getVolgaImageUrl(blog.coverImage || blog.image) || 'blog-hero.jpg'}" alt="${blog.title}" onerror="this.src='blog-hero.jpg'">
        <div class="holo-badge">${blog.category || 'Tech'}</div>
      </div>
      <div class="holo-content">
        <h3 class="holo-title">${blog.title}</h3>
        <p class="holo-excerpt">${blog.excerpt || (blog.content ? blog.content.substring(0, 120) + '...' : '')}</p>
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
      <img class="cs-img" src="${window.getVolgaImageUrl(cs.image) || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80'}" alt="${cs.title}">
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
    allClientStories = [
      { industry: 'Manufacturing', testimonial: 'Volga XR turned our training into a measurable competitive advantage. Our field teams onboarded 50% faster.', clientName: 'Sarah Chen', clientRole: 'Head of Training, Tesla', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', impact: ['VR Training', 'Safety', 'Efficiency'] },
      { industry: 'Healthcare', testimonial: 'The VR simulations made training safer, faster, and more engaging. Staff practiced critical procedures risk-free.', clientName: 'Dr. Emily Rodriguez', clientRole: 'Medical Director, Mayo Clinic', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&q=80', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', impact: ['Healthcare', 'Simulation', 'Education'] },
      { industry: 'Real Estate', testimonial: 'Remote buyers now feel like they are walking through the home in person. Virtual tours increased qualified leads by 30%.', clientName: 'Michael Torres', clientRole: 'CEO, Luxury Homes Inc.', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', impact: ['Virtual Tours', 'Lead Generation', 'AR/VR'] },
      { industry: 'Retail', testimonial: 'The AR product configurator became a customer favorite overnight. Shoppers visualized products in their space.', clientName: 'Jessica Williams', clientRole: 'CMO, Fashion Forward', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&q=80', impact: ['AR Configurator', 'E-Commerce', 'Customer Experience'] }
    ];
    renderClientStories(storiesGrid);
  }
}

function renderClientStories(container) {
  container.innerHTML = allClientStories.map((story, i) => `
    <div class="story-card">
      <div class="sc-img-wrap">
        <img class="sc-img" src="${window.getVolgaImageUrl(story.image) || 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&q=80'}" alt="${story.clientName}">
        <div class="sc-industry">${story.industry || 'Industry'}</div>
      </div>
      <div class="sc-body">
        <blockquote class="sc-quote">${story.testimonial || ''}</blockquote>
        <div class="sc-author">
          <img class="sc-avatar" src="${window.getVolgaImageUrl(story.avatar) || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'}" alt="">
          <div>
            <div class="sc-name">${story.clientName}</div>
            <div class="sc-role">${story.clientRole || ''}</div>
          </div>
        </div>
        ${story.impact && story.impact.length > 0 ? `
          <div class="sc-impact">
            ${story.impact.map((item) => `<span class="impact-chip">${item}</span>`).join('')}
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
            <img class="blog-card-img" src="${window.getVolgaImageUrl(item.image) || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500&q=80'}" alt="${item.title}">
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
      <div class="insight-section">
        <h3 class="insight-title">Blogs</h3>
        <div class="insight-cards">
          ${blogs.map(blog => `
            <a href="blog-detail.html?id=${blog._id}" class="insight-card">
              <img src="${window.getVolgaImageUrl(blog.coverImage || blog.image) || 'blog-hero.jpg'}" alt="${blog.title}">
              <div class="insight-card-content">
                <span class="insight-tag">Blog</span>
                <h4>${blog.title}</h4>
                <span class="insight-date">${new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
      <div class="insight-section">
        <h3 class="insight-title">Case Studies</h3>
        <div class="insight-cards">
          ${caseStudies.map(cs => `
            <a href="case-study-detail.html?id=${cs._id}" class="insight-card">
              <img src="${window.getVolgaImageUrl(cs.image)}" alt="${cs.title}">
              <div class="insight-card-content">
                <span class="insight-tag">Case Study</span>
                <h4>${cs.title}</h4>
                <span class="insight-date">${cs.year || new Date(cs.createdAt).toLocaleDateString('en-US', { year: 'numeric' })}</span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
      <div class="insight-section">
        <h3 class="insight-title">Client Stories</h3>
        <div class="insight-cards">
          ${clientStories.map(story => `
            <a href="client-stories.html" class="insight-card">
              <img src="${window.getVolgaImageUrl(story.image)}" alt="${story.clientName}">
              <div class="insight-card-content">
                <span class="insight-tag">Client Story</span>
                <h4>${story.clientName}</h4>
                <span class="insight-date">${story.industry}</span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
      <div class="insight-section">
        <h3 class="insight-title">Industry News</h3>
        <div class="insight-cards">
          ${industryNews.map(news => `
            <a href="industry-news-detail.html?id=${news._id}" class="insight-card">
              <img src="${window.getVolgaImageUrl(news.image)}" alt="${news.title}">
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
}

// ─── 12. ORBIT DOTS ANIMATION ────────
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

// ─── 14. FOOTER REVEALS ───────────────────────────────────
// Reveal navBar immediately (no scroll trigger needed — it's in the footer)
if (document.getElementById('navBar')) {
  gsap.to('#navBar', { opacity: 1, duration: 0.6, ease: 'power2.out' });
}

// links-grid has opacity:0 + translateY in CSS — animate it in when footer scrolls into view
const linksGrid = document.getElementById('linksGrid');
if (linksGrid) {
  gsap.to(linksGrid, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: linksGrid,
      start: 'top 88%',
      once: true
    }
  });
}

// ─── FOOTER 3D SETUP (wrapped in function, guarded) ──────
function setupFooter() {
  const band   = document.getElementById('p3d');
  const canvas = document.getElementById('c3d');
  const cur    = document.getElementById('cur');
  const curRing= document.getElementById('curRing');

  // Guard: skip if elements are missing or Three.js is not loaded
  if (!band || !canvas || typeof THREE === 'undefined') {
    console.warn('Footer 3D: missing elements or Three.js not loaded');
    return;
  }

  /* BRAND COLORS from logo */
  const NAVY   = 0x1a3a5c;
  const AMBER  = 0xe8952a;
  const CORAL  = 0xe84c2b;
  const NAVY_D = 0x050c18;

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(NAVY_D, 1);

  const scene  = new THREE.Scene();
  scene.fog    = new THREE.FogExp2(NAVY_D, 0.1);

  const W=()=>band.clientWidth, H=()=>band.clientHeight;
  const camera = new THREE.PerspectiveCamera(55, W()/H(), 0.1, 100);
  camera.position.set(0, 0, 6);

  function resize(){
    renderer.setSize(W(), H(), false);
    camera.aspect = W()/H();
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* LIGHTS */
  scene.add(new THREE.AmbientLight(0x0a1628, 1));

  const pl1 = new THREE.PointLight(AMBER, 5, 18);  pl1.position.set(2, 2, 3);   scene.add(pl1);
  const pl2 = new THREE.PointLight(NAVY,  4, 16);  pl2.position.set(-3, 1, 2);  scene.add(pl2);
  const pl3 = new THREE.PointLight(CORAL, 3, 14);  pl3.position.set(0, -2, 4);  scene.add(pl3);
  const pl4 = new THREE.PointLight(AMBER, 2, 12);  pl4.position.set(4, -1, 1);  scene.add(pl4);
  const pl5 = new THREE.PointLight(CORAL, 1.5,10); pl5.position.set(-1, 3, -1); scene.add(pl5);

  /* SMOKE PLANES */
  const smokeMeshes=[];
  const smokeColors=[0x0d1e33, 0x1a2e44, 0x0a1828, 0x0f2030];

  for(let i=0;i<12;i++){ // Reduced from 22 to 12
    const sz=3+Math.random()*6;
    const geo=new THREE.PlaneGeometry(sz,sz,8,8); // Reduced from 22x22 to 8x8
    const pos=geo.attributes.position;
    for(let v=0;v<pos.count;v++) pos.setZ(v,(Math.random()-0.5)*0.7);
    pos.needsUpdate=true;
    geo.computeVertexNormals();

    const mat=new THREE.MeshStandardMaterial({
      color:smokeColors[i%smokeColors.length],
      metalness:0.1, roughness:0.9,
      transparent:true,
      opacity:0.06+Math.random()*0.2,
      side:THREE.DoubleSide,
    });

    const m=new THREE.Mesh(geo,mat);
    m.position.set(
      (Math.random()-0.5)*12,
      (Math.random()-0.5)*5,
      (Math.random()-0.5)*3-1
    );
    m.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
    m.userData={
      sx:(Math.random()-0.5)*0.004,
      sy:(Math.random()-0.5)*0.003,
      sz:(Math.random()-0.5)*0.002,
      ox:m.position.x, oy:m.position.y,
      phase:Math.random()*Math.PI*2,
      spd:0.25+Math.random()*0.4,
    };
    scene.add(m);
    smokeMeshes.push(m);
  }

  /* GLOW BLOBS */
  for(let i=0;i<4;i++){ // Reduced from 7 to 4
    const c=[0x0d1e33,0x1a1000,0x1a0a00][i%3];
    const mat=new THREE.MeshStandardMaterial({
      color:c,metalness:0,roughness:0.8,
      transparent:true,opacity:0.05+Math.random()*0.12,
    });
    const m=new THREE.Mesh(new THREE.SphereGeometry(1+Math.random()*1.5,8,8),mat); // Reduced from 16x16 to 8x8
    m.position.set((Math.random()-0.5)*10,(Math.random()-0.5)*4,(Math.random()-0.5)*2-2);
    m.userData={phase:Math.random()*Math.PI*2,spd:0.2+Math.random()*0.3};
    scene.add(m);
    smokeMeshes.push(m);
  }

  /* PARTICLES */
  function mkPts(count,color,size,opacity){
    const g=new THREE.BufferGeometry();
    const a=new Float32Array(count*3);
    for(let i=0;i<count*3;i+=3){
      a[i]=(Math.random()-0.5)*18;
      a[i+1]=(Math.random()-0.5)*7;
      a[i+2]=(Math.random()-0.5)*5-1;
    }
    g.setAttribute('position',new THREE.BufferAttribute(a,3));
    const m=new THREE.PointsMaterial({color,size,transparent:true,opacity});
    return new THREE.Points(g,m);
  }
  const pts1=mkPts(150,AMBER,0.04,0.6); // Reduced from 300
  const pts2=mkPts(100,CORAL,0.03,0.35); // Reduced from 200
  const pts3=mkPts(75,0x4a8cbf,0.025,0.3); // Reduced from 150
  scene.add(pts1,pts2,pts3);

  /* MOUSE */
  let mx=0,my=0,tmx=0,tmy=0,curX=0,curY=0,tcx=0,tcy=0,inside=false;

  band.addEventListener('mousemove',e=>{
    const r=band.getBoundingClientRect();
    mx=(e.clientX-r.left)/r.width*2-1;
    my=-((e.clientY-r.top)/r.height*2-1);
    tcx=e.clientX-r.left; tcy=e.clientY-r.top;
    if(!inside){inside=true;cur.style.opacity='1';curRing.style.opacity='1';}
  });
  band.addEventListener('mouseleave',()=>{
    inside=false;cur.style.opacity='0';curRing.style.opacity='0';mx=0;my=0;
  });

  let t=0;
  function animate(){
    requestAnimationFrame(animate);
    t+=0.007;

    tmx+=(mx-tmx)*0.04; tmy+=(my-tmy)*0.04;
    curX+=(tcx-curX)*0.12; curY+=(tcy-curY)*0.12;
    cur.style.left=curX+'px'; cur.style.top=curY+'px';
    curRing.style.left=curX+'px'; curRing.style.top=curY+'px';

    camera.position.x+=(tmx*1.2-camera.position.x)*0.04;
    camera.position.y+=(tmy*0.6-camera.position.y)*0.04;
    camera.lookAt(0,0,0);

    pl1.position.x=2+tmx*4; pl1.position.y=2+tmy*3;
    pl3.position.x=tmx*5;   pl3.position.y=-2+tmy*3;
    pl4.intensity=1.5+Math.sin(t*1.5)*0.8;
    pl5.position.x=-1+tmx*2;pl5.position.y=3+tmy*2;

    smokeMeshes.forEach((m,i)=>{
      const d=m.userData;
      m.rotation.x+=d.sx; m.rotation.y+=d.sy; m.rotation.z+=d.sz||0;
      if(d.ox!==undefined){
        m.position.x=d.ox+Math.sin(t*d.spd+d.phase)*0.45+tmx*0.35;
        m.position.y=d.oy+Math.cos(t*d.spd*0.7+d.phase)*0.3+tmy*0.22;
      }
    });

    pts1.rotation.y=t*0.012+tmx*0.05;
    pts1.rotation.x=tmy*0.03;
    pts2.rotation.y=-t*0.009+tmx*0.04;
    pts3.rotation.z=t*0.006;

    renderer.render(scene,camera);
  }
  animate();

  // Clock
  function tick(){
    const clkEl = document.getElementById('clk');
    if (!clkEl) return;
    var n=new Date(),h=String(n.getHours()).padStart(2,'0'),m=String(n.getMinutes()).padStart(2,'0');
    clkEl.textContent='IST → '+h+':'+m;
  }
  tick();
  setInterval(tick,10000);
}

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

// ─── 15. HERO FLOATING SHAPES PARALLAX ───────────────────
function setupHeroParallax() {
  const shapes = document.querySelectorAll('.shape');
  if (shapes.length === 0) return;

  let targetX = 0;
  let targetY = 0;
  let isAnimating = false;
  let requestId = null;

  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 20;
    targetY = (e.clientY / window.innerHeight - 0.5) * 20;
    
    if (!isAnimating) {
      isAnimating = true;
      requestId = requestAnimationFrame(() => {
        shapes.forEach((shape, index) => {
          const multiplier = (index % 3 + 1) * 0.5;
          gsap.set(shape, {
            x: targetX * multiplier,
            y: targetY * multiplier
          });
        });
        isAnimating = false;
      });
    }
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
  if (document.getElementById('caseStudiesContainer')) fetchCaseStudies();
  if (document.getElementById('storiesGrid')) fetchClientStories();
  if (document.getElementById('newsContainer')) fetchIndustryNews();
  if (document.getElementById('insights-overview-container')) fetchInsightsOverview();

  animateOrbit();
  setupFooter(); // FIX: Three.js is now loaded before this runs

  const scrollProgressBar = document.getElementById('scrollProgressBar');
  if (scrollProgressBar) {
    gsap.to(scrollProgressBar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3
      }
    });
  }

  // FIX: Safety fallback — ensure Hero content shows even if loader fails
  setTimeout(() => {
    document.querySelectorAll('.Hero-sub, .Hero-heading, .Hero-cta-row, .Hero-badge').forEach(el => {
      if (parseFloat(getComputedStyle(el).opacity) < 0.1) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  }, 3000);
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

console.log('%cVOLGA INFOSYS', 'color:#00f5d4;font-size:2rem;font-weight:bold;');
console.log('%cVR & AR Pioneers — Ludhiana, Punjab', 'color:#7a85a0;');

// ─── MISSION CARD CLICK (mobile) ──
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
        { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: section, start: 'top 76%' } }
      );
    }

    if (cards.length) {
      gsap.fromTo(cards,
        { autoAlpha: 0, y: 34, scale: 0.985 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out', stagger: 0.055, scrollTrigger: { trigger: section, start: 'top 70%' } }
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
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
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
      { autoAlpha: 1, x: 0, duration: 0.85, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: '.home-suite-industry-scroll-section', start: 'top 72%' } }
    );

    rail.addEventListener('wheel', (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      rail.scrollLeft += event.deltaY;
    }, { passive: true });
  }

  const servicesRail = document.querySelector('.nav-services-rail');
  if (servicesRail) {
    gsap.fromTo('.nav-services-intro > *, .nav-service-panel',
      { autoAlpha: 0, y: 34 },
      { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: '.nav-services-horizontal', start: 'top 72%' } }
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
      if (nav) nav.classList.toggle('light-section', theme === 'light');
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

window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive:true });

// ─── BUTTON RIPPLE EFFECT (FIXED) ────────────────────────
// FIX: Set ripple origin on mouseenter only (not mousemove) to prevent jitter
document.querySelectorAll('.btn-primary, .btn-ghost, .btn-ghost-light, .nav-cta, .btn-see-all, .home-suite-link').forEach(btn => {
  // Set origin only on mouseenter — locking the start point prevents the ripple jumping around
  btn.addEventListener('mouseenter', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.style.setProperty('--ripple-x', `${x}px`);
    this.style.setProperty('--ripple-y', `${y}px`);
  });

  // Reset on leave so next hover always starts fresh from the actual entry point
  btn.addEventListener('mouseleave', function() {
    this.style.setProperty('--ripple-x', '50%');
    this.style.setProperty('--ripple-y', '50%');
  });
});