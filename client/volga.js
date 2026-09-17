/* ════════════════════════════════════════════════════════
   VOLGA INFOSYS — volga.js
   GSAP 3 + ScrollTrigger animations, custom cursor,
   loader, nav scroll effects, counter animation
═══════════════════════════════════════════════════════════ */

// ─── 0. API CONFIG ───────────────────────────────────────
(function() {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  window.VOLGA_API = isLocal ? 'http://localhost:5000/api' : `${window.location.origin}/api`;
  window.getVolgaImageUrl = function(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads/')) {
      return isLocal ? ('http://localhost:5000' + url) : `${window.location.origin}${url}`;
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

// ─── 2. UNIVERSAL ANIMATION ENGINE & LOADER ──────────────
let volgaAnimationsInitialized = false;

function initAllAnimations() {
  if (volgaAnimationsInitialized) return;
  volgaAnimationsInitialized = true;

  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  initHeroAnimation();
  setupSectionHeaderAnimations();
  setupGridAndCardAnimations();
  setupGenericReveals();
  setupStatCounters();
  setupEnhancedServices();
  setupTextScramble();
  setupParallax();
  setupMagnetic();
  
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
    setTimeout(() => ScrollTrigger.refresh(), 300);
    setTimeout(() => ScrollTrigger.refresh(), 800);
  }
}

// Global hook
window.initVolgaAnimations = initAllAnimations;

// Loader logic (runs if #loader is present, otherwise initAllAnimations runs immediately)
(function initLoader() {
  const loader = document.getElementById('loader');
  const fill = document.getElementById('loaderFill');
  const loaderTx = document.getElementById('loaderText');

  if (!loader || !fill || !loaderTx) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAllAnimations);
    } else {
      initAllAnimations();
    }
    return;
  }

  const messages = [
    'Initializing Reality...',
    'Calibrating XR Engine...',
    'Loading Assets...',
    'Welcome to VOLGA'
  ];

  let pct = 0;
  let dismissed = false;

  function dismissLoader() {
    if (dismissed) return;
    dismissed = true;
    clearInterval(interval);
    if (fill) fill.style.width = '100%';
    if (loaderTx) loaderTx.textContent = 'Welcome to VOLGA';

    gsap.to(loader, {
      opacity: 0,
      duration: 0.45,
      ease: 'power2.inOut',
      onComplete: () => {
        loader.style.display = 'none';
        initAllAnimations();
      }
    });
  }

  window.heroReady = dismissLoader;

  const interval = setInterval(() => {
    pct += Math.random() * 22 + 12;
    if (pct >= 100) {
      pct = 100;
      clearInterval(interval);
      dismissLoader();
    }
    if (fill) fill.style.width = pct + '%';
    const msgIdx = Math.min(messages.length - 1, Math.floor((pct / 100) * messages.length));
    if (loaderTx && messages[msgIdx]) loaderTx.textContent = messages[msgIdx];
  }, 45);

  if (document.readyState === 'complete') {
    setTimeout(dismissLoader, 250);
  } else {
    window.addEventListener('load', () => setTimeout(dismissLoader, 150));
  }
})();

// Automatic fallback on DOMContentLoaded for all pages
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    if (!loader) initAllAnimations();
  });
} else {
  const loader = document.getElementById('loader');
  if (!loader) initAllAnimations();
}

window.addEventListener('load', () => {
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
});

// ─── 4. HERO ANIMATION (UNIVERSAL) ───────────────────────
function initHeroAnimation() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 4a. Homepage Hero
  const homeLines = document.querySelectorAll('.Hero-line');
  if (homeLines.length) {
    if (prefersReducedMotion) {
      gsap.set('.Hero-line, .Hero-badge, .Hero-sub, .Hero-cta-row, .Hero-stats .stat', { opacity: 1, y: 0 });
    } else {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.fromTo(homeLines,
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.95, stagger: 0.1 }
      )
      .fromTo('.Hero-badge',
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.45'
      )
      .fromTo('.Hero-sub',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo('.Hero-cta-row',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo('.Hero-stats .stat',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1 },
        '-=0.35'
      );
    }
  }

  // 4b. Inner Page Heroes (Technologies, Services, Solutions, Industries, Contact, About, Careers, Insights)
  const innerHeroes = document.querySelectorAll('.hero, .page-Hero, .page-hero, .about-hero, .tech-hero, .services-hero, .career-hero, .spotlight, .contact-hero, .insights-hero, .hero-cinema');
  innerHeroes.forEach(hero => {
    if (hero.classList.contains('Hero')) return; // handled above

    const badge = hero.querySelector('.hero-pill, .hero-badge, .page-kicker, .hero-kicker, .breadcrumb, .pill');
    const titles = hero.querySelectorAll('.hero-title .word-inner, .hero-title, .page-hero-title, h1');
    const subtitle = hero.querySelector('.hero-sub, .hero-subtitle, .hero-desc, .hero-description, .page-hero-sub, .hero-lead, p.lead');
    const ctas = hero.querySelectorAll('.hero-cta-wrap, .hero-cta, .hero-cta-row, .hero-actions, .hero-buttons, .btn-primary, .btn-ghost');
    const statOrbs = hero.querySelectorAll('.stat-orb, .hero-stat, .hero-stat-card');
    const media = hero.querySelector('.hero-video-wrap, .hero-visual, .hero-media, .hero-image, .tech-cube-container, .hero-media-wrap');

    if (prefersReducedMotion) {
      if (badge) gsap.set(badge, { opacity: 1, y: 0 });
      if (titles.length) gsap.set(titles, { opacity: 1, y: 0 });
      if (subtitle) gsap.set(subtitle, { opacity: 1, y: 0 });
      if (ctas.length) gsap.set(ctas, { opacity: 1, y: 0 });
      if (statOrbs.length) gsap.set(statOrbs, { opacity: 1, y: 0, scale: 1 });
      if (media) gsap.set(media, { opacity: 1, scale: 1 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (badge) {
      tl.fromTo(badge, { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.1 });
    }

    if (titles.length) {
      tl.fromTo(titles,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.85, stagger: 0.08, ease: 'power4.out' },
        badge ? '-=0.35' : '+=0.1'
      );
    }

    if (subtitle) {
      tl.fromTo(subtitle,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.65 },
        '-=0.45'
      );
    }

    if (ctas.length) {
      tl.fromTo(ctas,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
        '-=0.4'
      );
    }

    if (statOrbs.length) {
      tl.fromTo(statOrbs,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)' },
        '-=0.35'
      );
    }

    if (media) {
      tl.fromTo(media,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.85, ease: 'power3.out' },
        '-=0.6'
      );
    }
  });

  // Hero background video / image parallax
  const heroVideo = document.querySelector('.Hero-video, .hero-video-bg, .hero-cinema video');
  if (heroVideo && typeof ScrollTrigger !== 'undefined') {
    gsap.to(heroVideo, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: heroVideo.closest('section') || '.Hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }
}

// ─── 5. SECTION HEADERS SCROLL ANIMATION ─────────────────
function setupSectionHeaderAnimations() {
  if (typeof ScrollTrigger === 'undefined') return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const headerContainers = document.querySelectorAll(`
    .section-header, .section-head, .tech-header, .solutionss-header,
    .svc-header, .cube-mission-header, .why-header, .process-header,
    .industries-header, .contact-header, .blog-section-header,
    .page-section-header, .about-header, .heading-wrap, .sec-head,
    .sh-head, .section-top, .grid-header, .tech-top
  `);

  headerContainers.forEach(header => {
    // Avoid double-animating if within hero
    if (header.closest('.Hero, .hero, .page-Hero, .page-hero')) return;

    const kicker = header.querySelector('.section-kicker, .kicker, .cube-mission-kicker, .svc-kicker, .tech-kicker, .pill-badge, .badge, span.kicker');
    const title = header.querySelector('h2, h3.section-title, .section-title, .tech-title, .svc-title, .cube-mission-title, .why-title');
    const desc = header.querySelector('.section-desc, .section-subtitle, .tech-desc, .svc-desc, .cube-mission-desc, p');
    const link = header.querySelector('.svc-link, .header-link, .btn-see-all');

    const els = [kicker, title, desc, link].filter(Boolean);
    if (!els.length) return;

    gsap.set(els, { opacity: 0, y: 26 });

    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: header,
        start: 'top 86%',
        once: true
      }
    });
  });
}

// ─── 6. CARDS & GRIDS STAGGERED SCROLL ANIMATION ──────────
function setupGridAndCardAnimations() {
  if (typeof ScrollTrigger === 'undefined') return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Find distinct grid containers
  const gridSelectors = [
    '.solutionss-grid', '.svc-grid', '.tech-grid', '.tech-stack-grid',
    '.industry-grid', '.portfolio-grid', '.blog-grid', '.cards-grid',
    '.benefits-grid', '.why-cards', '.mission-grid', '.values-grid',
    '.process-steps', '.step-grid', '.team-grid', '.faq-grid',
    '.features-grid', '.stories-grid', '.jobs-list', '.wc-grid',
    '.ai-grid', '.ar-grid', '.apc-grid', '.about-grid', '.client-grid',
    '.insights-grid', '.services-grid', '.tech-cards-wrap', '.blog-section .container',
    '#svcGrid', '#techGrid'
  ];

  const grids = document.querySelectorAll(gridSelectors.join(','));

  grids.forEach(grid => {
    // Collect child cards
    const cards = Array.from(grid.querySelectorAll(`
      .solutions-card, .svc-card, .tech-card, .tech-item, .industry-card,
      .portfolio-card, .card, .blog-card, .why-card, .benefit-card,
      .feature-card, .value-card, .process-step, .step-card, .timeline-item,
      .team-card, .faq-item, .stat-card, .job-card, .story-card,
      .wc, .ai-card, .apc, .tcard, .bento-card, .apc-item
    `));

    if (!cards.length) return;

    gsap.set(cards, { opacity: 0, y: 32, scale: 0.98 });

    gsap.to(cards, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.65,
      ease: 'power3.out',
      stagger: {
        each: 0.08,
        from: 'start'
      },
      scrollTrigger: {
        trigger: grid,
        start: 'top 85%',
        once: true
      }
    });
  });

  // Individual cards not inside recognized grids
  const standaloneCards = document.querySelectorAll('.standalone-card, .spotlight-card, .cta-banner, .cta-inner, .contact-card');
  standaloneCards.forEach(card => {
    gsap.set(card, { opacity: 0, y: 30 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        once: true
      }
    });
  });
}

// ─── 7. GENERIC REVEALS & UTILITY CLASSES ─────────────────
function setupGenericReveals() {
  if (typeof ScrollTrigger === 'undefined') return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // .reveal and .reveal-fade
  gsap.utils.toArray('.reveal, .reveal-fade').forEach(el => {
    if (el.dataset.animBound) return;
    el.dataset.animBound = 'true';
    gsap.set(el, { opacity: 0, y: 28 });
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true
      }
    });
  });

  // .reveal-left
  gsap.utils.toArray('.reveal-left').forEach(el => {
    if (el.dataset.animBound) return;
    el.dataset.animBound = 'true';
    gsap.set(el, { opacity: 0, x: -40 });
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true
      }
    });
  });

  // .reveal-right
  gsap.utils.toArray('.reveal-right').forEach(el => {
    if (el.dataset.animBound) return;
    el.dataset.animBound = 'true';
    gsap.set(el, { opacity: 0, x: 40 });
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true
      }
    });
  });

  // .reveal-scale
  gsap.utils.toArray('.reveal-scale, .reveal-img').forEach(el => {
    if (el.dataset.animBound) return;
    el.dataset.animBound = 'true';
    gsap.set(el, { opacity: 0, scale: 0.92, y: 20 });
    gsap.to(el, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 86%',
        once: true
      }
    });
  });

  // Section rule draw lines
  gsap.utils.toArray('.section-rule').forEach(rule => {
    const lines = rule.querySelectorAll('.section-rule-line, hr, span');
    if (lines.length) {
      gsap.from(lines, {
        scaleX: 0,
        duration: 1.1,
        ease: 'power3.inOut',
        transformOrigin: 'left',
        scrollTrigger: { trigger: rule, start: 'top 90%', once: true }
      });
    }
  });
}

// ─── 8. STAT COUNTERS ANIMATION ──────────────────────────
function setupStatCounters() {
  if (typeof ScrollTrigger === 'undefined') return;

  const statEls = document.querySelectorAll('.stat-num, [data-val], [data-target], [data-count], .num[data-target]');
  statEls.forEach(el => {
    if (el.dataset.counterBound) return;
    el.dataset.counterBound = 'true';

    const targetVal = parseFloat(el.dataset.val || el.dataset.target || el.dataset.count || el.textContent.replace(/[^\d.]/g, ''));
    if (isNaN(targetVal)) return;

    const suffix = el.textContent.replace(/[\d.,\s]/g, '') || (el.dataset.suffix || '');
    const prefix = el.dataset.prefix || '';

    const counterObj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(counterObj, {
          val: targetVal,
          duration: 2.2,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = prefix + Math.round(counterObj.val) + suffix;
          }
        });
      }
    });
  });
}

// ─── 9. PARALLAX EFFECTS ─────────────────────────────────
function setupParallax() {
  if (typeof ScrollTrigger === 'undefined') return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Background floating text
  gsap.utils.toArray('.why-bg-text, .about-marquee, .bg-watermark').forEach(el => {
    gsap.to(el, {
      x: '-8%',
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('section') || el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });

  // Spotlight video frame parallax
  const spotlightFrame = document.querySelector('.spotlight-video-frame');
  if (spotlightFrame) {
    gsap.to(spotlightFrame, {
      y: -35,
      ease: 'none',
      scrollTrigger: {
        trigger: spotlightFrame.closest('section') || spotlightFrame,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2
      }
    });
  }

  // AR Mosaic parallax
  const arMosaic = document.querySelector('.ar-mosaic');
  if (arMosaic) {
    gsap.to(arMosaic, {
      y: -25,
      ease: 'none',
      scrollTrigger: {
        trigger: arMosaic.closest('section') || arMosaic,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
      }
    });
  }
}

// ─── 10. MAGNETIC BUTTON INTERACTIONS ────────────────────
function setupMagnetic() {
  const magneticEls = document.querySelectorAll(`
    .btn-primary, .btn-ghost, .nav-cta, .btn-see-all,
    .magnetic-btn, .card-cta, .hero-cta-primary,
    .hero-cta-secondary, .c2-submit-btn, .svc-link
  `);

  magneticEls.forEach(item => {
    if (item.dataset.magneticBound) return;
    item.dataset.magneticBound = 'true';

    let isAnimating = false;
    let requestId = null;
    let targetX = 0;
    let targetY = 0;

    item.addEventListener('mousemove', e => {
      const rect = item.getBoundingClientRect();
      targetX = (e.clientX - rect.left - rect.width / 2) * 0.22;
      targetY = (e.clientY - rect.top - rect.height / 2) * 0.22;

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
      gsap.to(item, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1.1, 0.45)' });
    });
  });
}

// ─── 11. TEXT SCRAMBLE HOVER EFFECT ──────────────────────
function setupTextScramble() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const selectors = [
    '.svc-card .svc-card-label', '.svc-card h3', '.svc-card .svc-card-tags small',
    '.tech-card h3', '.solutions-card h3'
  ];

  document.querySelectorAll(selectors.join(',')).forEach(el => {
    if (el.dataset.scrambleBound) return;
    el.dataset.scrambleBound = 'true';

    const originalText = el.innerText.trim();
    if (originalText.length === 0) return;

    let isScrambling = false;
    let animationFrameId = null;
    let iterations = 0;

    const scramble = () => {
      if (iterations > originalText.length / 2) {
        el.innerText = originalText;
        isScrambling = false;
        return;
      }

      el.innerText = originalText
        .split('')
        .map((char, index) => {
          if (index < iterations || char.match(/\s/)) {
            return originalText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      iterations += 1 / 3;
      animationFrameId = requestAnimationFrame(scramble);
    };

    el.addEventListener('mouseenter', () => {
      if (!isScrambling) {
        isScrambling = true;
        iterations = 0;
        scramble();
      }
    });

    el.addEventListener('mouseleave', () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      el.innerText = originalText;
      isScrambling = false;
    });
  });
}

// ─── 12. TICKER PAUSE ON HOVER ───────────────────────────
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
let allClientStories = [];
let currentBlogIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

function renderBlogSkeletons(container) {
  const blogFeatured = document.getElementById('blogFeatured');
  
  if (blogFeatured) {
    // Render skeleton for featured blog
    blogFeatured.innerHTML = `
      <div class="blog-featured skeleton-card">
        <div class="skeleton skeleton-img" style="width: 100%; height: 400px; border-radius: 24px; margin: 0;"></div>
        <div class="blog-featured-body" style="padding: 30px;">
          <div class="skeleton skeleton-tag" style="width: 60px; height: 12px;"></div>
          <div class="skeleton" style="width: 100%; height: 32px; margin-top: 12px; border-radius: 8px;"></div>
          <div class="skeleton" style="width: 90%; height: 16px; margin-top: 16px; border-radius: 6px;"></div>
          <div class="skeleton" style="width: 40%; height: 16px; margin-top: 10px; border-radius: 6px;"></div>
        </div>
      </div>
    `;
    
    // Render skeletons for grid
    let skeletonHtml = '';
    for (let i = 0; i < 6; i++) {
      skeletonHtml += `
        <div class="blog-card skeleton-card">
          <div class="skeleton skeleton-img" style="width: calc(100% - 24px); height: 160px; margin: 12px; border-radius: 40px;"></div>
          <div class="blog-card-body">
            <div class="skeleton" style="width: 60px; height: 12px; margin-top: 10px;"></div>
            <div class="skeleton" style="width: 100%; height: 24px; margin-top: 10px; border-radius: 8px;"></div>
            <div class="skeleton" style="width: 90%; height: 16px; margin-top: 16px; border-radius: 6px;"></div>
            <div class="skeleton-footer" style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div class="skeleton" style="width: 36px; height: 36px; border-radius: 50%;"></div>
                <div class="skeleton" style="width: 100px; height: 12px;"></div>
              </div>
              <div class="skeleton" style="width: 60px; height: 60px; border-radius: 50%;"></div>
            </div>
          </div>
        </div>
      `;
    }
    container.innerHTML = skeletonHtml;
  } else {
    // Original skeleton style for other pages
    let skeletonHtml = '';
    for (let i = 0; i < 3; i++) {
      skeletonHtml += `
        <div class="blog-card skeleton-card">
          <div class="skeleton skeleton-tag"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-excerpt"></div>
          <div class="skeleton-footer"></div>
        </div>
      `;
    }
    container.innerHTML = skeletonHtml;
  }
}

async function fetchLatestBlogs() {
  const blogGrid = document.getElementById('blogGrid');
  if (!blogGrid) return;

  const API = window.VOLGA_API;
  renderBlogSkeletons(blogGrid);

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
  // If we're on blog.html (has blogFeatured div), handle featured blog
  const blogFeatured = document.getElementById('blogFeatured');
  
  if (blogFeatured && allBlogs.length > 0) {
    const featuredBlog = allBlogs[0];
    blogFeatured.innerHTML = `
      <a href="blog-detail.html?id=${featuredBlog._id}" class="blog-featured">
        <div class="blog-featured-img">
          <img src="${window.getVolgaImageUrl(featuredBlog.coverImage || featuredBlog.image) || 'blog-hero.jpg'}" alt="${featuredBlog.title}" onerror="this.src='blog-hero.jpg'">
          <div class="blog-featured-badge">${featuredBlog.category || 'Tech'}</div>
        </div>
        <div class="blog-featured-body">
          <div class="blog-cat">${featuredBlog.category || 'Tech'}</div>
          <h3 class="blog-featured-title">${featuredBlog.title}</h3>
          <p class="blog-featured-excerpt">${featuredBlog.excerpt || (featuredBlog.content ? featuredBlog.content.substring(0, 200) + '...' : '')}</p>
          <div class="blog-meta">
            <span>${new Date(featuredBlog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <a href="blog-detail.html?id=${featuredBlog._id}" class="blog-read-link">Read more <i class="fas fa-arrow-right"></i></a>
        </div>
      </a>
    `;
    
    // For the grid, use all blogs except the first one
    const remainingBlogs = allBlogs.slice(1);
    const cardsToShow = remainingBlogs.slice(currentBlogIndex, currentBlogIndex + 6); // Show 6 cards in grid
    
    if (cardsToShow.length === 0 && remainingBlogs.length > 0) {
      currentBlogIndex = 0;
      return renderBlogCards(blogGrid);
    }
    
    blogGrid.innerHTML = cardsToShow.map((blog, i) => `
      <a href="blog-detail.html?id=${blog._id}" class="blog-card" data-blog-id="${blog._id}" style="animation-delay: ${(i % 3) * 0.1}s">
        <img class="blog-card-img" src="${window.getVolgaImageUrl(blog.coverImage || blog.image) || 'blog-hero.jpg'}" alt="${blog.title}" onerror="this.src='blog-hero.jpg'">
        <div class="blog-card-body">
          <div class="blog-tag">${blog.category || 'Tech'}</div>
          <h3 class="blog-card-title">${blog.title}</h3>
          <p class="blog-card-excerpt">${blog.excerpt || (blog.content ? blog.content.substring(0, 120) + '...' : '')}</p>
          <div class="blog-card-footer">
            <div class="blog-meta">
              <div class="author-avatar">VI</div>
              <span class="blog-meta-text">${new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
            <div class="read-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>
      </a>
    `).join('');
    
    // Since blog.html has a grid of 6, adjust navigation
    addBlogNavigation(blogGrid, 6);
    
  } else {
    // Original holo-card style for other pages
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
  }

  setTimeout(() => {
    ScrollTrigger.refresh();
    gsap.utils.toArray('.blog-card, .holo-card.reveal-fade').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: parseFloat(el.style.getPropertyValue('--delay') || el.style.animationDelay || 0),
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
  const cardsPerPage = document.getElementById('blogFeatured') ? 6 : 3;
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      currentBlogIndex = Math.min(currentBlogIndex + cardsPerPage, allBlogs.length - 1);
      if (currentBlogIndex + cardsPerPage > allBlogs.length) {
        currentBlogIndex = Math.max(0, allBlogs.length - cardsPerPage);
      }
    } else {
      currentBlogIndex = Math.max(currentBlogIndex - cardsPerPage, 0);
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

function addBlogNavigation(blogGrid, cardsPerPage = 3) {
  const parent = blogGrid.parentElement;
  const blogFeatured = document.getElementById('blogFeatured');
  const totalBlogsForNav = blogFeatured ? allBlogs.slice(1).length : allBlogs.length;
  const pageCount = Math.ceil(totalBlogsForNav / cardsPerPage);

  const existingNav = parent.querySelector('.blog-nav-controls');
  if (existingNav) existingNav.remove();

  if (pageCount <= 1) return; // Don't show nav if only one page

  const navControls = document.createElement('div');
  navControls.className = 'blog-nav-controls';
  navControls.innerHTML = `
    <button class="blog-nav-btn blog-nav-prev" ${currentBlogIndex === 0 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>
    <div class="blog-dots">
      ${Array.from({ length: pageCount }).map((_, i) =>
    `<div class="blog-dot ${i === Math.floor(currentBlogIndex / cardsPerPage) ? 'active' : ''}"></div>`
  ).join('')}
    </div>
    <button class="blog-nav-btn blog-nav-next" ${currentBlogIndex + cardsPerPage >= totalBlogsForNav ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>
  `;

  parent.appendChild(navControls);

  navControls.querySelector('.blog-nav-prev').addEventListener('click', () => {
    currentBlogIndex = Math.max(currentBlogIndex - cardsPerPage, 0);
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
    currentBlogIndex = Math.min(currentBlogIndex + cardsPerPage, totalBlogsForNav - cardsPerPage);
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
function renderCaseStudiesSkeletons(container) {
  let skeletonHtml = `<div class="blog-grid">`;
  for (let i = 0; i < 3; i++) {
    skeletonHtml += `
      <div class="cs-card skeleton-card">
        <div class="skeleton skeleton-img"></div>
        <div class="cs-body">
          <div class="skeleton skeleton-industry"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-desc"></div>
          <div class="skeleton-stats">
            <div class="skeleton-stat">
              <div class="skeleton skeleton-stat-num"></div>
              <div class="skeleton skeleton-stat-label"></div>
            </div>
            <div class="skeleton-stat">
              <div class="skeleton skeleton-stat-num"></div>
              <div class="skeleton skeleton-stat-label"></div>
            </div>
            <div class="skeleton-stat">
              <div class="skeleton skeleton-stat-num"></div>
              <div class="skeleton skeleton-stat-label"></div>
            </div>
          </div>
          <div class="skeleton-footer">
            <div class="skeleton skeleton-meta"></div>
            <div class="skeleton skeleton-arrow"></div>
          </div>
        </div>
      </div>
    `;
  }
  skeletonHtml += `</div>`;
  container.innerHTML = skeletonHtml;
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
    const hash = this.getAttribute('href');
    if (!hash || hash === '#') return;
    try {
      const target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        const nav = document.getElementById('navbar') || document.querySelector('nav');
        const navHeight = nav ? nav.offsetHeight : 80;
        const targetTop = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        });
        if (history.pushState) {
          history.pushState(null, null, hash);
        }
      }
    } catch (err) {
      console.warn('Smooth scroll target error:', err);
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

  const renderer = new THREE.WebGLRenderer({canvas, antialias:false, alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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

  if (typeof setupHeroParallax === 'function') setupHeroParallax();
  if (typeof setupScrollReveals === 'function') setupScrollReveals();
  if (typeof setupGlobalTextScrollAnimation === 'function') setupGlobalTextScrollAnimation();
  if (typeof setupParallax === 'function') setupParallax();
  if (typeof setupMagnetic === 'function') setupMagnetic();
  if (typeof setupMissionCardFlip === 'function') setupMissionCardFlip();

  if (document.getElementById('blogGrid')) {
    fetchLatestBlogs();
    setupBlogRealtimeUpdates();
  }
  if (document.getElementById('storiesGrid')) fetchClientStories();

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

  gsap.utils.toArray('.solutionss-section, .home-suite-section, .home-suite-about, .home-suite-cta').forEach(section => {
    const headerBits = section.querySelectorAll('.solutionss-kicker, .solutionss-title, .solutionss-desc, .home-suite-label, .home-suite-title, .home-suite-sub, .home-suite-about-text > h2, .home-suite-about-text > p, .home-suite-cta > h2, .home-suite-cta > p');
    const cards = section.querySelectorAll('.solutions-card, .home-suite-service-card, .home-suite-industry, .home-suite-work-card, .home-suite-tech, .home-suite-insight, .home-suite-about-stats > div, .home-suite-about-tile');

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

// ─── DESKTOP MEGA MENUS CONTROLLER ────────────────────────
(function initMegaMenus() {
  if (window.__volgaMegaMenuInit) return;
  window.__volgaMegaMenuInit = true;

  const menus = {};
  let activeMenu = null;
  let closeTimer = null;

  document.querySelectorAll('.nav-item[data-menu]').forEach(item => {
    const key = item.dataset.menu;
    const menuEl = document.getElementById('menu-' + key);
    if (!menuEl) return;
    menus[key] = { item, menuEl };
  });

  function forceHideAllExcept(activeKey = null) {
    Object.entries(menus).forEach(([key, { item, menuEl }]) => {
      if (key !== activeKey) {
        item.classList.remove('open', 'active');
        gsap.killTweensOf(menuEl);
        const items = menuEl.querySelectorAll('.mega-item');
        if (items.length) gsap.killTweensOf(items);
        menuEl.classList.remove('visible');
        gsap.set(menuEl, { opacity: 0, y: 0, visibility: 'hidden', pointerEvents: 'none' });
      }
    });
  }

  function positionMenu(key) {
    const { item, menuEl } = menus[key];
    if (!item || !menuEl) return;
    if (window.innerWidth > 900) {
      const itemRect = item.getBoundingClientRect();
      const menuWidth = key === 'company' ? 220 : (key === 'services' ? 600 : 640);
      const leftPos = Math.max(16, Math.min(window.innerWidth - menuWidth - 16, itemRect.left + (itemRect.width / 2) - (menuWidth / 2)));
      menuEl.style.left = leftPos + 'px';
      menuEl.style.right = 'auto';
      menuEl.style.width = menuWidth + 'px';
    } else {
      menuEl.style.left = '16px';
      menuEl.style.right = '16px';
      menuEl.style.width = 'auto';
    }
  }

  function openMenu(key) {
    if (!menus[key]) return;
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    if (activeMenu === key) return;

    // Immediately force-hide all other menus to prevent overlapping
    forceHideAllExcept(key);

    activeMenu = key;
    const { item, menuEl } = menus[key];

    positionMenu(key);

    item.classList.add('open', 'active');
    menuEl.classList.add('visible');
    menuEl.style.visibility = 'visible';
    menuEl.style.pointerEvents = 'all';

    gsap.killTweensOf(menuEl);
    gsap.fromTo(menuEl,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.28, ease: 'power3.out' }
    );

    const items = menuEl.querySelectorAll('.mega-item');
    if (items.length) {
      gsap.killTweensOf(items);
      gsap.fromTo(items,
        { opacity: 0, y: 8, x: -3 },
        { opacity: 1, y: 0, x: 0, duration: 0.32, stagger: 0.025, ease: 'power2.out', delay: 0.03 }
      );
    }

    const backdrop = document.getElementById('backdrop');
    if (backdrop) backdrop.classList.add('active');
  }

  function closeMenu(delay = 0) {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    const doClose = () => {
      if (!activeMenu) {
        forceHideAllExcept(null);
        return;
      }
      const currentKey = activeMenu;
      const current = menus[currentKey];
      activeMenu = null;

      if (current) {
        current.item.classList.remove('open', 'active');
        gsap.killTweensOf(current.menuEl);
        const items = current.menuEl.querySelectorAll('.mega-item');
        if (items.length) gsap.killTweensOf(items);

        gsap.to(current.menuEl, {
          opacity: 0,
          y: -6,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            current.menuEl.classList.remove('visible');
            current.menuEl.style.visibility = 'hidden';
            current.menuEl.style.pointerEvents = 'none';
            gsap.set(current.menuEl, { y: 0 });
          }
        });
      }

      const backdrop = document.getElementById('backdrop');
      if (backdrop) backdrop.classList.remove('active');
    };

    if (delay > 0) {
      closeTimer = setTimeout(doClose, delay);
    } else {
      doClose();
    }
  }

  Object.entries(menus).forEach(([key, { item, menuEl }]) => {
    item.addEventListener('mouseenter', () => openMenu(key));
    item.addEventListener('mouseleave', () => closeMenu(140));

    menuEl.addEventListener('mouseenter', () => {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
    });
    menuEl.addEventListener('mouseleave', () => closeMenu(100));

    item.addEventListener('click', (e) => {
      if (activeMenu === key) {
        closeMenu(0);
      } else {
        openMenu(key);
      }
    });
  });

  // Close menus when hovering non-dropdown navbar items
  document.querySelectorAll('#navbar .nav-links > li:not([data-menu]), #navbar .nav-logo, #navbar .nav-cta, #navbar .nav-item:not([data-menu])').forEach(el => {
    el.addEventListener('mouseenter', () => {
      closeMenu(60);
    });
  });

  // Close menus on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#navbar') && !e.target.closest('.mega-menu')) {
      closeMenu(0);
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu(0);
    }
  });

  // Reposition active menu on resize
  window.addEventListener('resize', () => {
    if (activeMenu) {
      if (window.innerWidth <= 900) {
        closeMenu(0);
      } else {
        positionMenu(activeMenu);
      }
    }
  });

  // Expose global close function
  window.closeAllMegaMenus = () => closeMenu(0);

  // Handle dropdown & nav link clicks (instant close & smooth scrolling if on same page)
  function handleDropdownLinkClick(e) {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('javascript:')) return;

    // Immediately force close mega menus
    closeMenu(0);

    // Check if on same page
    let isSamePage = false;
    let hash = '';

    try {
      const url = new URL(href, window.location.href);
      const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
      const targetPath = url.pathname.replace(/\/$/, '') || '/';
      const currentFile = decodeURIComponent(currentPath.split('/').pop().toLowerCase());
      const targetFile = decodeURIComponent(targetPath.split('/').pop().toLowerCase());

      const sameFile = (currentFile === targetFile) ||
                       (!currentFile && (targetFile === 'index.html' || targetFile === '')) ||
                       (!targetFile && (currentFile === 'index.html' || currentFile === ''));

      if (sameFile && url.hash) {
        isSamePage = true;
        hash = url.hash.replace(/^#/, '');
      }
    } catch (err) {
      if (href.startsWith('#')) {
        isSamePage = true;
        hash = href.replace(/^#/, '');
      }
    }

    if (isSamePage && hash) {
      e.preventDefault();

      // If on services page with showService
      if (typeof window.showService === 'function') {
        window.showService(hash, true);
        return;
      }

      // If on industries page with setActiveIndustry
      if (typeof window.setActiveIndustry === 'function') {
        window.setActiveIndustry(hash, true);
        const panel = document.getElementById(`panel-${hash}`) || document.getElementById('industryContent') || document.getElementById('industryNav');
        if (panel) {
          const nav = document.getElementById('navbar') || document.querySelector('.navbar');
          const navH = nav ? nav.offsetHeight : 70;
          const targetTop = panel.getBoundingClientRect().top + window.pageYOffset - (navH + 15);
          window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
        }
        return;
      }

      // Generic target element
      const targetEl = document.getElementById(hash);
      if (targetEl) {
        const nav = document.getElementById('navbar') || document.querySelector('.navbar');
        const navH = nav ? nav.offsetHeight : 70;
        const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - (navH + 15);
        window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
        history.pushState(null, '', '#' + hash);
      }
    }
  }

  document.querySelectorAll('.mega-menu a, .mega-item, .nav-dropdown a, #navbar a').forEach(a => {
    a.addEventListener('click', handleDropdownLinkClick);
  });

  document.getElementById('backdrop')?.addEventListener('click', () => closeMenu(0));
})();

// ─── MOBILE MENU CONTROLLER ──────────────────────────────
(function initMobileMenu() {
  function bindMenu() {
    const burger = document.getElementById('navBurger') || document.querySelector('.nav-burger');
    const mobileMenu = document.getElementById('mobileMenu') || document.querySelector('.mobile-menu');
    const closeBtn = document.getElementById('mobileClose') || (mobileMenu ? mobileMenu.querySelector('.mobile-close') : null);

    if (!burger || !mobileMenu) return;

    function openMobileMenu() {
      mobileMenu.classList.add('open');
      burger.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      document.body.classList.add('mobile-menu-open');
    }

    function closeMobileMenu() {
      mobileMenu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      document.body.classList.remove('mobile-menu-open');
    }

    window.closeMobileNav = closeMobileMenu;

    function toggleMobileMenu(e) {
      if (e) e.stopPropagation();
      if (mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    }

    burger.addEventListener('click', toggleMobileMenu);

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMobileMenu();
      });
    }

    // Submenu accordion toggle in mobile menu
    mobileMenu.querySelectorAll('.mm-has-sub').forEach(item => {
      const toggle = item.querySelector('.mm-toggle-btn');
      const parentLink = item.querySelector('.mm-parent-link');
      
      const handleToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        item.classList.toggle('open');
      };

      if (toggle) toggle.addEventListener('click', handleToggle);
      if (parentLink) parentLink.addEventListener('click', handleToggle);
    });

    // Close and route when clicking any navigating menu link
    mobileMenu.querySelectorAll('a:not(.mm-parent-link)').forEach(link => {
      link.addEventListener('click', (e) => {
        closeMobileMenu();
        const href = link.getAttribute('href');
        if (!href || href.startsWith('javascript:')) return;

        let isSamePage = false;
        let hash = '';
        try {
          const url = new URL(href, window.location.href);
          const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
          const targetPath = url.pathname.replace(/\/$/, '') || '/';
          const currentFile = decodeURIComponent(currentPath.split('/').pop().toLowerCase());
          const targetFile = decodeURIComponent(targetPath.split('/').pop().toLowerCase());

          const sameFile = (currentFile === targetFile) ||
                           (!currentFile && (targetFile === 'index.html' || targetFile === '')) ||
                           (!targetFile && (currentFile === 'index.html' || currentFile === ''));

          if (sameFile && url.hash) {
            isSamePage = true;
            hash = url.hash.replace(/^#/, '');
          }
        } catch (err) {
          if (href.startsWith('#')) {
            isSamePage = true;
            hash = href.replace(/^#/, '');
          }
        }

        if (isSamePage && hash) {
          e.preventDefault();
          if (typeof window.showService === 'function') {
            window.showService(hash, true);
          } else if (typeof window.setActiveIndustry === 'function') {
            window.setActiveIndustry(hash, true);
            const panel = document.getElementById(`panel-${hash}`) || document.getElementById('industryContent') || document.getElementById('industryNav');
            if (panel) {
              const nav = document.getElementById('navbar') || document.querySelector('.navbar');
              const navH = nav ? nav.offsetHeight : 70;
              const targetTop = panel.getBoundingClientRect().top + window.pageYOffset - (navH + 15);
              window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
            }
          } else {
            const targetEl = document.getElementById(hash);
            if (targetEl) {
              const nav = document.getElementById('navbar') || document.querySelector('.navbar');
              const navH = nav ? nav.offsetHeight : 70;
              const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - (navH + 15);
              window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
              history.pushState(null, '', '#' + hash);
            }
          }
        }
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });

    // Auto close on window resize beyond 992px
    window.addEventListener('resize', () => {
      if (window.innerWidth > 992 && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindMenu);
  } else {
    bindMenu();
  }
})();

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

// ─── CUSTOM CURSOR & INTERACTIVE ENHANCEMENTS ─────────────
function initCustomCursor() {
  const cursor = document.getElementById('cursor');
  const cursorFollower = document.getElementById('cursorFollower');

  if (!cursor || !cursorFollower) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let followerX = 0, followerY = 0;

  // Track mouse movement
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Animate cursor positions


  // Function to wrap every character in a span for text elements
  function wrapTextCharacters() {
    const textSelectors = 'h1, h2, h3, h4, h5, h6, p, a, button, .nav-link, .btn-primary, .btn-ghost, .mega-item';
    document.querySelectorAll(textSelectors).forEach(el => {
      // Skip if already processed
      if (el.dataset.processed) return;
      el.dataset.processed = 'true';
      
      // Preserve HTML structure, only wrap text nodes
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
      const textNodes = [];
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node);
      }
      
      textNodes.forEach(textNode => {
        if (textNode.textContent.trim()) {
          const spanWrapper = document.createElement('span');
          spanWrapper.className = 'char-container';
          
          const chars = textNode.textContent.split('');
          chars.forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            charSpan.className = 'char-span';
            spanWrapper.appendChild(charSpan);
          });
          
          textNode.parentNode.replaceChild(spanWrapper, textNode);
        }
      });
    });
  }

  // Call wrap function
  wrapTextCharacters();

  // Track cursor and apply effect only to hovered character
  document.addEventListener('mousemove', (e) => {
    // Remove active class from all char spans
    document.querySelectorAll('.char-span.active').forEach(span => {
      span.classList.remove('active');
    });

    // Find the char span under cursor
    const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
    if (hoveredEl && hoveredEl.classList.contains('char-span')) {
      hoveredEl.classList.add('active');
    }

    // Cursor follower still works for containers
    const isOverInteractive = document.querySelectorAll('a, button, .solutions-card, .nav-link, .btn-primary, .btn-ghost, .mega-item').some(el => 
      el.contains(hoveredEl)
    );
    if (isOverInteractive) {
      cursorFollower.classList.add('hover');
    } else {
      cursorFollower.classList.remove('hover');
    }
  });
}

// ─── ENHANCED SERVICES CARDS WITH 3D EFFECT ────────────────
function setupEnhancedServices() {
  const cards = document.querySelectorAll('.solutions-card');
  if (!cards.length) return;

  cards.forEach(card => {
    let isThrottled = false;
    card.addEventListener('mousemove', (e) => {
      if (isThrottled) return;
      isThrottled = true;
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 50; // Reduced sensitivity
      const rotateY = (centerX - x) / 50; // Reduced sensitivity

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        duration: 0.5, // Slower animation
        ease: 'power2.out'
      });
      
      setTimeout(() => {
        isThrottled = false;
      }, 50); // Update every 50ms instead of every mousemove
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out' // Changed from elastic for performance
      });
    });
  });
}

// ─── CINEMATIC SCROLL TRANSITIONS ──────────────────────────
function setupCinematicTransitions() {
  // Add subtle scale and fade to sections as they scroll
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    gsap.fromTo(section,
      { scale: 0.95, opacity: 0.8 },
      {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 20%',
          scrub: 0.5
        }
      }
    );
  });
}

// ─── ENHANCED HERO WITH PARALLAX LAYERS ─────────────────────
function setupHeroParallax() {
  const heroOrbs = document.querySelectorAll('.Hero-orb');
  heroOrbs.forEach((orb, index) => {
    gsap.to(orb, {
      y: (index + 1) * 50,
      ease: 'none',
      scrollTrigger: {
        trigger: '.Hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });
  });

  // Parallax hero content
  gsap.to('.Hero-content', {
    y: 100,
    ease: 'none',
    scrollTrigger: {
      trigger: '.Hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5
    }
  });
}

