/**
 * ═══════════════════════════════════════════════════════════════════
 * 3D FLUTED GLASS & OPTICAL REFRACTION HERO INTERACTION SYSTEM
 * Autonomous Fluid Wave Simulation + Responsive Canvas + KPI Counter
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  function initHero() {
    const heroSection = document.getElementById('Hero') || document.querySelector('.Hero');
    if (!heroSection) return;

    // ── 1. Responsive Canvas Fluid Wave Animation ──
    const canvas = document.getElementById('liquidFlowCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d', { alpha: true });
      let animationFrameId;
      let width = 0;
      let height = 0;
      let time = 0;

      // Color waves palette
      const waves = [
        { color: 'rgba(30, 58, 138, 0.45)', speed: 0.008, length: 0.002, amp: 45, yOffset: 0.65 },
        { color: 'rgba(56, 189, 248, 0.35)', speed: 0.012, length: 0.003, amp: 35, yOffset: 0.72 },
        { color: 'rgba(14, 165, 233, 0.25)', speed: 0.006, length: 0.0015, amp: 55, yOffset: 0.80 },
        { color: 'rgba(255, 200, 0, 0.15)', speed: 0.010, length: 0.0025, amp: 25, yOffset: 0.88 }
      ];

      function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for mobile performance
        const rect = heroSection.getBoundingClientRect();
        width = rect.width || window.innerWidth;
        height = rect.height || window.innerHeight;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx.scale(dpr, dpr);
      }

      function drawWaves() {
        if (!ctx || width === 0 || height === 0) return;

        ctx.clearRect(0, 0, width, height);

        // Render fluid multi-layered harmonic sine waves
        waves.forEach((wave, idx) => {
          ctx.beginPath();
          ctx.moveTo(0, height);

          const baseAmp = wave.amp * (width < 600 ? 0.6 : 1);
          const baseY = height * wave.yOffset;

          for (let x = 0; x <= width; x += (width < 600 ? 8 : 4)) {
            const y = baseY + 
              Math.sin(x * wave.length + time * wave.speed * 60 + idx) * baseAmp +
              Math.cos(x * wave.length * 0.5 + time * wave.speed * 30) * (baseAmp * 0.4);
            ctx.lineTo(x, y);
          }

          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fillStyle = wave.color;
          ctx.fill();
        });

        time += 0.016;
        animationFrameId = requestAnimationFrame(drawWaves);
      }

      resizeCanvas();
      drawWaves();

      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          resizeCanvas();
        }, 150);
      }, { passive: true });
    }

    // ── 2. Interactive Refraction Light Beams on Pointer Move (Desktop only) ──
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouch) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        heroSection.style.setProperty('--rx', `${xPercent.toFixed(1)}%`);
      }, { passive: true });
    }

    // ── 3. Magnetic Button Hover Interaction ──
    if (!isTouch) {
      const magneticButtons = heroSection.querySelectorAll('.magnetic-btn');
      magneticButtons.forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px) scale(1.02)`;
        });

        btn.addEventListener('mouseleave', () => {
          btn.style.transform = '';
        });
      });
    }

    // ── 4. Stat Counter Trigger ──
    const statElements = heroSection.querySelectorAll('.stat-num');
    if (statElements.length > 0) {
      let statsAnimated = false;

      function animateStats() {
        if (statsAnimated) return;
        statsAnimated = true;

        statElements.forEach((el) => {
          const targetVal = parseInt(el.getAttribute('data-val'), 10) || 0;
          const duration = 1800; // ms
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentCount = Math.floor(easeOut * targetVal);

            el.textContent = currentCount;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = targetVal;
            }
          }

          requestAnimationFrame(updateCounter);
        });
      }

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateStats();
              observer.disconnect();
            }
          });
        }, { threshold: 0.2 });

        observer.observe(heroSection);
      } else {
        animateStats();
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHero);
  } else {
    initHero();
  }
})();
