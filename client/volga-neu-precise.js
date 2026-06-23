/* ════════════════════════════════════════════════════════════════
   VOLGA INFOSYS — NEUMORPHIC PRECISION ANIMATIONS
   Load AFTER gsap.min.js, ScrollTrigger.min.js and volga.js.

   All selectors below are taken verbatim from the page markup.
   Nothing here re-touches elements that volga.js already animates
   via .reveal-* classes — this file targets the surfaces that
   received neumorphic styling in volga-neu-precise.css.
═══════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  /* ──────────────────────────────────────────────────────────
     Helper: animate a number, preserving its trailing suffix
     ("500+", "100%", "50M+", "98%", "250<span>+</span>")
  ────────────────────────────────────────────────────────── */
  function countUp(el, { useFirstChildOnly = false, duration = 1.6 } = {}) {
    let raw, tailHTML = '';
    if (useFirstChildOnly) {
      raw = (el.childNodes[0] && el.childNodes[0].textContent || '').trim();
      Array.from(el.childNodes).slice(1).forEach(n => {
        const wrap = document.createElement('div');
        wrap.appendChild(n.cloneNode(true));
        tailHTML += wrap.innerHTML;
      });
    } else {
      raw = el.textContent.trim();
    }
    const match = raw.match(/^([\d.,]+)(.*)$/);
    if (!match) return;
    const target = parseFloat(match[1].replace(/,/g, ''));
    const innerSuffix = match[2] || '';
    if (isNaN(target)) return;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        const html = Math.round(obj.val).toLocaleString() + innerSuffix + tailHTML;
        if (useFirstChildOnly) el.innerHTML = html;
        else el.textContent = html;
      }
    });
  }

  /* ──────────────────────────────────────────────────────────
     1. HERO LOAD SEQUENCE — heading, sub, ctas, stats stagger in
  ────────────────────────────────────────────────────────── */
  const heroTl = gsap.timeline({ delay: 0.3 });
  heroTl
    .from('.Hero-heading', { opacity: 0, y: 40, duration: 1, ease: 'power3.out' })
    .from('.Hero-sub', { opacity: 0, y: 28, duration: 0.9, ease: 'power3.out' }, '-=0.6')
    .from('.Hero-cta-row a', { opacity: 0, y: 18, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, '-=0.5')
    .from('.stats .stat-item', { opacity: 0, x: 30, duration: 0.8, stagger: 0.15, ease: 'power3.out' }, '-=0.45')
    .add(() => {
      document.querySelectorAll('.stats .stat-value').forEach((el, i) => {
        gsap.delayedCall(i * 0.12, () => countUp(el, { duration: 1.4 }));
      });
    });

  /* ──────────────────────────────────────────────────────────
     2. STAT BAND counters — .home-suite-stat-num (scroll-triggered)
  ────────────────────────────────────────────────────────── */
  if (typeof ScrollTrigger !== 'undefined') {
    document.querySelectorAll('.home-suite-stat-num').forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => countUp(el, { useFirstChildOnly: true, duration: 1.5 })
      });
    });

    /* ────────────────────────────────────────────────────────
       3. SOLUTIONS CARDS — spring reveal + subtle 3D tilt
    ──────────────────────────────────────────────────────── */
    gsap.from('.solutions-card', {
      opacity: 0,
      y: 50,
      scale: 0.9,
      duration: 0.8,
      stagger: 0.1,
      ease: 'back.out(1.6)',
      scrollTrigger: { trigger: '.solutionss-grid', start: 'top 82%' }
    });

    /* ────────────────────────────────────────────────────────
       4. STAT BAND reveal — .home-suite-stat cards
    ──────────────────────────────────────────────────────── */
    gsap.from('.home-suite-stat', {
      opacity: 0,
      y: 30,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.home-suite-stats', start: 'top 85%' }
    });

    /* ────────────────────────────────────────────────────────
       5. EXECUTION CAPABILITIES — intro copy + service rows
    ──────────────────────────────────────────────────────── */
    gsap.from('.nav-services-intro > *', {
      opacity: 0,
      x: -30,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.nav-services-intro', start: 'top 75%' }
    });

    gsap.from('.nav-services-row', {
      opacity: 0,
      y: 40,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.nav-services-rail', start: 'top 82%' }
    });

    /* ────────────────────────────────────────────────────────
       6. TESTIMONIALS — section intro copy reveal
          (marquee cards themselves are left alone so they remain
          safe to clone for the infinite scroll)
    ──────────────────────────────────────────────────────── */
    gsap.from('.section-intro .intro-content > h1, .section-intro .intro-content > p', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.section-intro', start: 'top 80%' }
    });

    /* ────────────────────────────────────────────────────────
       7. TECH GRID — pop in with back.out
    ──────────────────────────────────────────────────────── */
    gsap.from('.home-suite-tech', {
      opacity: 0,
      scale: 0.8,
      duration: 0.6,
      stagger: 0.08,
      ease: 'back.out(1.5)',
      scrollTrigger: { trigger: '.home-suite-tech-grid', start: 'top 85%' }
    });

    /* ────────────────────────────────────────────────────────
       8. BLOG CARDS — staggered reveal
    ──────────────────────────────────────────────────────── */
    gsap.from('.blog-cards-row .card', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.blog-cards-row', start: 'top 85%' }
    });

    /* ────────────────────────────────────────────────────────
       9. MISSION — flip cards reveal
    ──────────────────────────────────────────────────────── */
    gsap.from('.mission .cols .col', {
      opacity: 0,
      y: 40,
      scale: 0.95,
      duration: 0.8,
      stagger: 0.15,
      ease: 'back.out(1.4)',
      scrollTrigger: { trigger: '.mission .cols', start: 'top 82%' }
    });

    /* ────────────────────────────────────────────────────────
       10. FOOTER — staggered reveal
    ──────────────────────────────────────────────────────── */
    gsap.from('.footer-grid > *', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.footer', start: 'top 90%' }
    });
  }

  /* ──────────────────────────────────────────────────────────
     11. SOLUTIONS CARDS — pointer tilt (independent of scroll)
  ────────────────────────────────────────────────────────── */
  document.querySelectorAll('.solutions-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, {
        rotateY: px * 8,
        rotateX: -py * 8,
        transformPerspective: 600,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' });
    });
  });

  /* ──────────────────────────────────────────────────────────
     12. AMBIENT PARTICLES — drifting dots in dark sections
  ────────────────────────────────────────────────────────── */
  function addParticles(selector, count) {
    document.querySelectorAll(selector).forEach((section) => {
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('span');
        dot.className = 'neu-particle';
        const size = gsap.utils.random(3, 9);
        dot.style.width = size + 'px';
        dot.style.height = size + 'px';
        dot.style.left = gsap.utils.random(0, 100) + '%';
        dot.style.top = gsap.utils.random(0, 100) + '%';
        dot.style.opacity = gsap.utils.random(0.15, 0.5);
        section.appendChild(dot);
        gsap.to(dot, {
          y: gsap.utils.random(-40, 40),
          x: gsap.utils.random(-30, 30),
          duration: gsap.utils.random(6, 12),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    });
  }
  addParticles('.nav-services-intro', 12);
  addParticles('#tech-showcase', 16);
  addParticles('.footer', 10);
});
