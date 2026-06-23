/* ════════════════════════════════════════════════════════
   VOLGA INFOSYS — inner.js
   For services.html, portfolio.html, about.html, contact.html
═══════════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

// ─── CUSTOM CURSOR ───────────────────────────────────────
(function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.1, ease: 'power1.out' });
  });

  (function animateFollower() {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    gsap.set(follower, { x: followerX, y: followerY });
    requestAnimationFrame(animateFollower);
  })();
})();

// ─── NAV ─────────────────────────────────────────────────
(function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const menu   = document.getElementById('mobileMenu');
  if (!burger || !menu) return;
  let open = false;

  burger.addEventListener('click', () => {
    open = !open;
    menu.classList.toggle('open', open);
    const s = burger.querySelectorAll('span');
    if (open) {
      gsap.to(s[0], { rotation: 45,  y:  7, duration: 0.3 });
      gsap.to(s[1], { opacity: 0,        duration: 0.2 });
      gsap.to(s[2], { rotation: -45, y: -7, duration: 0.3 });
    } else {
      gsap.to(s[0], { rotation: 0, y: 0, duration: 0.3 });
      gsap.to(s[1], { opacity: 1,        duration: 0.2 });
      gsap.to(s[2], { rotation: 0, y: 0, duration: 0.3 });
    }
  });

  document.querySelectorAll('.mm-link').forEach(link => {
    link.addEventListener('click', () => {
      open = false;
      menu.classList.remove('open');
      const s = burger.querySelectorAll('span');
      gsap.to(s[0], { rotation: 0, y: 0, duration: 0.3 });
      gsap.to(s[1], { opacity: 1,        duration: 0.2 });
      gsap.to(s[2], { rotation: 0, y: 0, duration: 0.3 });
    });
  });
})();

// ─── HERO LINES ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const lines = document.querySelectorAll('.hero-line');
  if (lines.length) {
    gsap.fromTo(lines,
      { y: '110%', opacity: 0 },
      { y: '0%', opacity: 1, duration: 1.1, ease: 'power4.out', stagger: 0.12 }
    );
  }
  const heroSub = document.querySelector('.hero-sub');
  if (heroSub) gsap.fromTo(heroSub, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: 'power3.out' });
});

// ─── HERO VIDEO PARALLAX ─────────────────────────────────
if (document.querySelector('.hero-video')) {
  gsap.to('.hero-video', {
    yPercent: 25, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
  });
}

// ─── SCROLL REVEALS ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Use ScrollTrigger.batch to reduce the number of individual ScrollTrigger instances
  ScrollTrigger.batch('.reveal-fade', {
    interval: 0.12, // batch interval
    batchMax: 8,
    onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.05 }),
    start: 'top 88%'
  });

  // Skip SplitText/complex animations on small screens to save CPU
  if (window.innerWidth > 1024) {
    ScrollTrigger.batch('.reveal-split', {
      interval: 0.12,
      batchMax: 6,
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.04 }),
      start: 'top 85%'
    });
  } else {
    // On small screens, just make elements visible immediately to avoid heavy animation work
    gsap.set('.reveal-split', { opacity: 1, y: 0 });
  }

  ScrollTrigger.batch('.reveal-li', {
    interval: 0.12,
    batchMax: 12,
    onEnter: batch => gsap.to(batch, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', stagger: 0.04 }),
    start: 'top 88%'
  });

  ScrollTrigger.batch('.reveal-card', {
    interval: 0.12,
    batchMax: 8,
    onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', stagger: 0.05 }),
    start: 'top 88%'
  });

  ScrollTrigger.batch('.reveal-step', {
    interval: 0.15,
    batchMax: 6,
    onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.75, ease: 'back.out(1.5)', stagger: 0.06 }),
    start: 'top 80%'
  });

  // ─── PARALLAX IMAGES ───────────────────────────────────
  gsap.utils.toArray('.parallax-img').forEach(el => {
    gsap.to(el, { yPercent: -12, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
    });
  });

  // ─── PARALLAX BG ───────────────────────────────────────
  const parallaxBg = document.getElementById('parallaxBg');
  if (parallaxBg) {
    gsap.to(parallaxBg, { yPercent: 20, ease: 'none',
      scrollTrigger: { trigger: parallaxBg, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
    });
  }

  // ─── PROCESS STEP SCRUB ────────────────────────────────
  gsap.utils.toArray('.process-step').forEach(step => {
    gsap.fromTo(step, { opacity: 0.3, scale: 0.95 }, { opacity: 1, scale: 1, ease: 'power2.inOut',
      scrollTrigger: { trigger: step, start: 'top 75%', end: 'top 40%', scrub: 0.6 }
    });
  });

  // ─── CTA HEADING ───────────────────────────────────────
  gsap.from('.cta-heading', { opacity: 0, letterSpacing: '0.3em', duration: 1.2, ease: 'power3.out',
    scrollTrigger: { trigger: '.cta-banner', start: 'top 75%', once: true }
  });

  // ─── FOOTER ────────────────────────────────────────────
  gsap.fromTo('.footer', { opacity: 0 }, { opacity: 1, duration: 1,
    scrollTrigger: { trigger: '.footer', start: 'top 95%', once: true }
  });

  // ─── FOOTER SCRAMBLE ───────────────────────────────────
  ScrollTrigger.create({
    trigger: '.footer', start: 'top 90%', once: true,
    onEnter: () => {
      const el = document.querySelector('.footer-logo');
      if (!el) return;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let iterations = 0;
      const original = el.textContent;
      const iv = setInterval(() => {
        el.innerHTML = original.split('').map((c, idx) => idx < iterations ? c : chars[Math.floor(Math.random() * chars.length)]).join('');
        iterations += 0.6;
        if (iterations >= original.length) { clearInterval(iv); el.innerHTML = 'VOLGA<span>INFOSYS</span>'; }
      }, 35);
    }
  });

  // ─── PORTFOLIO FILTER ──────────────────────────────────
  document.querySelectorAll('.pf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.portfolio-card').forEach(card => {
        card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
      });
    });
  });

  // ─── NAV LINK HOVER ────────────────────────────────────
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('mouseenter', () => gsap.to(link, { color: '#e8eaf0', duration: 0.25 }));
    link.addEventListener('mouseleave', () => gsap.to(link, { color: '#ffffff', duration: 0.25 }));
  });

  // ─── SMOOTH SCROLL ─────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' }); }
    });
  });

});
