/**
 * cube-mission.js
 * ─────────────────────────────────────────────────────────────────
 * Self-contained cube section.  Zero globals written, zero conflict
 * with GSAP / ScrollTrigger used elsewhere on the page.
 *
 * Strategy:
 *  • The cube lives inside .cube-mission-viewport (position:relative,
 *    height:100vh, overflow:hidden).
 *  • .cube-mission-scroll is the scrollable div INSIDE that viewport.
 *    It scrolls independently of window — GSAP never sees it.
 *  • The cube itself (#cm-cube) is position:absolute, centered via CSS,
 *    and updated by reading the inner scroller's scrollTop.
 * ─────────────────────────────────────────────────────────────────
 */
(function cubeMissionInit() {
  "use strict";

  /* ── Image / face data — swap with your real images ─────────── */
  const IMAGES = [
    { src: "face1.jpg",  label: "INTRO"   },
    { src: "hill-dark.png",     label: "DEFINE"  },
    { src: "street-dark.png",   label: "SHAPE"     },
    { src: "sky-dark.png",      label: "BUILD"    },
    { src: "tower-dark.png",    label: "LIVE"     },
    { src: "moon-dark.png",     label: "EVOLVE"    },
  ];
  const N = IMAGES.length;

  /* ── DOM refs ────────────────────────────────────────────────── */
  const wrap       = document.querySelector(".cube-mission-wrap");
  if (!wrap) return;                           // section not on page

  const viewport   = wrap.querySelector(".cube-mission-viewport");
  const scroller   = wrap.querySelector(".cube-mission-scroll");
  const cube       = document.getElementById("cm-cube");
  const faces      = [...wrap.querySelectorAll(".cm-face")];
  const hudPct     = document.getElementById("cm-hud-pct");
  const progFill   = document.getElementById("cm-prog-fill");
  const sceneName  = document.getElementById("cm-scene-name");
  const captionNum = document.getElementById("cm-caption-num");
  const captionName= document.getElementById("cm-caption-name");
  const dots       = [...wrap.querySelectorAll(".cm-dot")];
  const cards      = [...wrap.querySelectorAll(".cm-card")];
  const particlesContainer = document.getElementById("cm-particles");

  if (!cube || !scroller) return;

  /* ── Stop orientations for each face index ───────────────────── */
  const STOPS = [
    { rx:  90, ry:    0 },   // top    → front
    { rx:   0, ry:    0 },   // front
    { rx:   0, ry:  -90 },   // right
    { rx:   0, ry: -180 },   // back
    { rx:   0, ry: -270 },   // left
    { rx: -90, ry: -360 },   // bottom
  ].slice(0, N);

  /* ── Preload images ──────────────────────────────────────────── */
  const cache = new Map();
  IMAGES.forEach(({ src }) => {
    if (!cache.has(src)) {
      const img = new Image();
      img.src = src;
      cache.set(src, img);
    }
  });

  /* Assign images to faces */
  faces.forEach((face, i) => {
    if (!IMAGES[i]) return;
    const img = cache.get(IMAGES[i].src) || new Image();
    img.alt = IMAGES[i].label;
    img.src = IMAGES[i].src;
    face.appendChild(img);
    const ph = face.querySelector(".cm-face-ph");
    if (ph) ph.style.display = "none";
  });

  /* ── 3D Particles System ─────────────────────────────────────── */
  const particles = [];
  const PARTICLE_COUNT = 100;
  
  function createParticles() {
    if (!particlesContainer) return;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = document.createElement('div');
      const sizeClass = i % 3 === 0 ? 'cm-particle-large' : (i % 3 === 1 ? 'cm-particle-small' : '');
      
      particle.className = `cm-particle ${sizeClass}`;
      
      // Random 3D position
      const particleData = {
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 1200,
        z: (Math.random() - 0.5) * 800,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        speedZ: (Math.random() - 0.5) * 0.3,
        originalZ: (Math.random() - 0.5) * 800,
        phase: Math.random() * Math.PI * 2,
        sizeClass: sizeClass,
        element: particle
      };
      
      particles.push(particleData);
      particlesContainer.appendChild(particle);
    }
  }
  
  function updateParticles(time, scrollProgress) {
    particles.forEach((p, index) => {
      // Move particles
      p.x += p.speedX;
      p.y += p.speedY;
      p.z += p.speedZ;
      
      // Add subtle oscillation
      const oscillation = Math.sin(time * 0.001 + p.phase) * 20;
      
      // Wrap around boundaries
      if (p.x > 600) p.x = -600;
      if (p.x < -600) p.x = 600;
      if (p.y > 600) p.y = -600;
      if (p.y < -600) p.y = 600;
      if (p.z > 400) p.z = -400;
      if (p.z < -400) p.z = 400;
      
      // Apply scroll effect to Z
      const scrollZOffset = scrollProgress * 300;
      const finalZ = p.z + scrollZOffset;
      
      // Calculate depth-based opacity and scale (farther = more transparent and smaller)
      const normalizedZ = (finalZ + 400) / 800; // 0 to 1
      const depthOpacity = 0.1 + normalizedZ * 0.9;
      const depthScale = 0.5 + normalizedZ * 0.8;
      
      // Update position with 3D transform
      p.element.style.transform = `translate3d(${p.x}px, ${p.y + oscillation}px, ${finalZ}px) scale(${depthScale})`;
      p.element.style.opacity = depthOpacity * (p.sizeClass === 'cm-particle-large' ? 1 : (p.sizeClass === 'cm-particle-small' ? 0.6 : 0.8));
    });
  }

  /* ── Mouse Tilt Effect ───────────────────────────────────────── */
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  
  function onMouseMove(e) {
    const rect = viewport.getBoundingClientRect();
    targetMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 15; // Max tilt degrees
    targetMouseY = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
  }
  
  viewport.addEventListener('mousemove', onMouseMove);

  /* ── Ease helpers ────────────────────────────────────────────── */
  const easeIO = t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
  const easeInOutCubic = t => t < 0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ── Cube transform from 0–1 progress ───────────────────────── */
  function setCubeTransform(s, time) {
    if (N < 2) return;
    const t = s * (N - 1);
    const i = Math.min(Math.floor(t), N - 2);
    const f = easeIO(t - i);
    const a = STOPS[i], b = STOPS[i + 1];
    let rx = a.rx + (b.rx - a.rx) * f;
    let ry = a.ry + (b.ry - a.ry) * f;
    
    // Add mouse tilt
    rx += mouseY;
    ry += mouseX;
    
    // Add subtle floating animation
    const floatY = Math.sin(time * 0.0015) * 8;
    const floatZ = Math.cos(time * 0.0012) * 5;
    
    cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translate3d(0, ${floatY}px, ${floatZ}px)`;
  }

  /* ── HUD + dot update ────────────────────────────────────────── */
  let lastIdx = -1;

  function updateHUD(s) {
    const pct  = Math.round(s * 100);
    const idx  = Math.min(N - 1, Math.round(s * (N - 1)));
    if (hudPct)    hudPct.textContent   = String(pct).padStart(3,"0") + "%";
    if (progFill)  progFill.style.width = `${pct}%`;
    if (idx !== lastIdx) {
      lastIdx = idx;
      const label = IMAGES[idx]?.label ?? "";
      if (sceneName)   sceneName.textContent  = label;
      if (captionNum)  captionNum.textContent  = String(idx + 1).padStart(2,"0");
      if (captionName) captionName.textContent = label;
      dots.forEach((d, i) => d.classList.toggle("active", i === idx));
      if (cards[idx]) cards[idx].classList.add("cm-in");
      if (cards[idx]) {
  cards[idx].classList.add("cm-in");
  // force all children visible immediately, no wait
  cards[idx].querySelectorAll(
    ".cm-tag, h1, h2, .cm-body, .cm-stat-row, .cm-cta, .cm-cta-back, .cm-h-line"
  ).forEach(el => {
    el.style.opacity = "1";
    el.style.translate = "0 0";
    el.style.scale = "1 1";
  });
}
    }
  }

  /* ── Card reveal via IntersectionObserver on inner scroller ─── */
 // WITH this:
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("cm-in");
      io.unobserve(e.target);
    }
  });
}, { root: scroller, threshold: 0.05, rootMargin: "0px 0px -10% 0px" });

cards.forEach(c => io.observe(c));

  /* ── Animation Loop ──────────────────────────────────────────── */
  let scrollProgress = 0;
  let lastTime = performance.now();
  
  function animate(time) {
    // Smooth mouse tilt
    mouseX = lerp(mouseX, targetMouseX, 0.08);
    mouseY = lerp(mouseY, targetMouseY, 0.08);
    
    // Get scroll progress
    const max = scroller.scrollHeight - scroller.clientHeight;
    scrollProgress = max > 0 ? Math.max(0, Math.min(1, scroller.scrollTop / max)) : 0;
    
    // Update everything
    setCubeTransform(scrollProgress, time);
    updateHUD(scrollProgress);
    updateParticles(time, scrollProgress);
    
    requestAnimationFrame(animate);
  }

  /* ── Dot click → scroll inner scroller ──────────────────────── */
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      const slides = [...scroller.querySelectorAll(".cm-slide")];
      const target = slides[i];
      if (!target) return;
      const targetY = target.offsetTop;
      const startY  = scroller.scrollTop;
      const diff    = targetY - startY;
      const dur     = 800;
      const t0      = performance.now();
      const tick = now => {
        const p  = Math.min(1, (now - t0) / dur);
        scroller.scrollTop = startY + diff * easeInOutCubic(p);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  });

  /* ── Inner anchor clicks (data-cm-slide="N") ─────────────────── */
  /* Prevents these clicks from bubbling to window / GSAP anchors  */
  wrap.addEventListener("click", e => {
    const link = e.target.closest("[data-cm-slide]");
    if (!link) return;
    e.preventDefault();
    e.stopPropagation();           // ← stops GSAP anchor listener
    const idx    = parseInt(link.dataset.cmSlide, 10);
    const slides = [...scroller.querySelectorAll(".cm-slide")];
    const target = slides[idx];
    if (!target) return;
    const startY = scroller.scrollTop;
    const diff   = target.offsetTop - startY;
    const dur    = 800;
    const t0     = performance.now();
    const tick   = now => {
      const p = Math.min(1, (now - t0) / dur);
      scroller.scrollTop = startY + diff * easeInOutCubic(p);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  /* ── Navbar hide/show for cube section ──────────────────────── */
  const navbar = document.getElementById("navbar");
  
  function handleScroll() {
    const rect = wrap.getBoundingClientRect();
    const isInCubeSection = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isInCubeSection) {
      navbar.style.opacity = "0";
      navbar.style.pointerEvents = "none";
      navbar.style.transition = "opacity 0.5s ease";
    } else {
      navbar.style.opacity = "1";
      navbar.style.pointerEvents = "auto";
    }
  }
  
  window.addEventListener("scroll", handleScroll);
  handleScroll(); // Check initial position

  /* ── Init ────────────────────────────────────────────────────── */
  createParticles();
  setCubeTransform(0);
  updateHUD(0);
  requestAnimationFrame(animate);

})();
