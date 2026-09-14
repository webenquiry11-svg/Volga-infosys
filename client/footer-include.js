(function () {
  // ── Inject footer CSS ──────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
.footer {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: var(--font-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
}
.footer *, .footer *::before, .footer *::after {
  box-sizing: border-box;
}
.footer-wrap {
  background: #ffffff;
  width: 100%;
  position: relative;
  overflow: hidden;
  border-top: 1px solid #e8e8e8;
  margin-bottom: 0;
  padding-bottom: 0;
}
.footer-inner {
  position: relative;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 34px 4vw 10px;
}
.vf-grid {
  display: grid;
  grid-template-columns: 2.1fr 1fr 1.3fr 1.3fr;
  gap: 3.5vw;
  position: relative;
  z-index: 2;
  align-items: start;
  width: 100%;
}
.vf-col {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.vf-col:not(:last-child) {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  padding-right: 3vw;
}

/* Brand Column */
.vf-brand-col {
  max-width: 520px;
}
.vf-brand-col .footer-logo {
  width: 350px;
  max-width: 100%;
  margin-left: -20px;
  margin-bottom: 16px;
}
.vf-brand-col .footer-logo img {
  width: 100%;
  height: auto;
  max-height: 120px;
  object-fit: contain;
  object-position: left center;
  display: block;
}
.vf-tagline {
  font-family: var(--font-ui, sans-serif);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: #d97706;
  margin: 0 0 8px 0;
}
.vf-desc {
  font-family: var(--font-ui, sans-serif);
  font-size: 12.8px;
  line-height: 1.55;
  color: #555555;
  margin: 0 0 16px 0;
}
.vf-social-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.vf-social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f8fafc;
  color: #334155;
  text-decoration: none;
  transition: all 0.25s ease;
  border: 1px solid #e2e8f0;
}
.vf-social-btn svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}
.vf-social-btn:hover {
  background: #e8930a;
  color: #ffffff;
  border-color: #e8930a;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(232, 147, 10, 0.3);
}

/* Nav Columns */
.vf-col-title {
  font-family: var(--font-display, var(--font-ui, sans-serif));
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #111827;
  margin-bottom: 4px;
}
.vf-col-accent {
  width: 24px;
  height: 2.5px;
  background: #e8930a;
  border-radius: 2px;
  margin-bottom: 12px;
}
.vf-links {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.vf-links a {
  font-family: var(--font-ui, sans-serif);
  font-size: 13.5px;
  font-weight: 400;
  color: #374151;
  text-decoration: none;
  line-height: 1.4;
  transition: all 0.2s ease;
  display: inline-block;
  width: fit-content;
}
.vf-links a:hover {
  color: #d97706;
  transform: translateX(3px);
  font-weight: 500;
}

/* Contact Column */
.vf-contact-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}
.vf-contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #374151;
  font-size: 13px;
  text-decoration: none;
  line-height: 1.35;
  transition: color 0.2s ease;
}
.vf-contact-item:hover {
  color: #d97706;
}
.vf-icon-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #d97706;
  flex-shrink: 0;
}
.vf-icon-badge svg {
  width: 13px;
  height: 13px;
  fill: currentColor;
}
.vf-touch-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 7px 18px;
  border-radius: 999px;
  background: #e8930a;
  color: #ffffff !important;
  border: 1.5px solid #e8930a;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(232, 147, 10, 0.25);
  width: fit-content;
}
.vf-touch-btn svg {
  width: 13px;
  height: 13px;
  fill: currentColor;
}
.vf-touch-btn:hover {
  background: #d97706;
  border-color: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(217, 119, 6, 0.35);
}

/* Footer Bottom */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 14px;
  margin-top: 20px;
  padding-bottom: 4px;
  border-top: 1px solid #e8e8e8;
  position: relative;
  z-index: 2;
  width: 100%;
}
.footer-bottom .brand-name {
  font-family: var(--font-display, var(--font-ui, sans-serif));
  font-size: 15px;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: #111827;
}
.footer-bottom .brand-name span {
  font-weight: 700;
}
.footer-bottom .copyright {
  font-family: var(--font-ui, sans-serif);
  font-size: 11.5px;
  letter-spacing: 0.02em;
  color: #6b7280;
}
.footer-bottom .copyright a {
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s ease;
}
.footer-bottom .copyright a:hover {
  color: #d97706;
}

/* Responsive */
@media (max-width: 1100px) {
  .vf-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px 24px;
  }
  .vf-col:not(:last-child) {
    border-right: none;
    padding-right: 0;
  }
  .vf-brand-col {
    grid-column: span 2;
    max-width: 100%;
  }
  .vf-col#col-company {
    grid-column: 1;
  }
  .vf-col#col-services {
    grid-column: 2;
  }
  .vf-col#col-touch {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .footer-inner {
    padding: 32px 20px 16px;
  }
  .vf-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 26px 16px;
  }
  .vf-col:not(:last-child) {
    border-right: none;
    padding-right: 0;
  }
  .vf-brand-col {
    grid-column: span 2;
    max-width: 100%;
  }
  .vf-brand-col .footer-logo {
    width: 280px;
    margin-left: -15px;
    margin-bottom: 14px;
  }
  .vf-tagline {
    font-size: 14px;
  }
  .vf-desc {
    font-size: 12.5px;
    line-height: 1.5;
    margin-bottom: 14px;
  }
  .vf-col#col-company {
    grid-column: 1;
  }
  .vf-col#col-services {
    grid-column: 2;
  }
  .vf-col#col-touch {
    grid-column: span 2;
  }
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-top: 18px;
    padding-top: 12px;
  }
}

@media (max-width: 480px) {
  .footer-inner {
    padding: 24px 16px 14px;
  }
  .vf-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .vf-col:not(:last-child) {
    border-right: none;
    padding-right: 0;
  }
  .vf-brand-col {
    grid-column: 1;
    max-width: 100%;
  }
  .vf-col#col-company {
    grid-column: 1;
  }
  .vf-col#col-services {
    grid-column: 1;
  }
  .vf-col#col-touch {
    grid-column: 1;
  }
  .vf-col-title {
    font-size: 11.5px;
    letter-spacing: 0.1em;
  }
  .vf-links a {
    font-size: 12.5px;
    line-height: 1.35;
    word-break: break-word;
  }
  .vf-contact-item {
    font-size: 11.5px;
    gap: 6px;
  }
  .vf-contact-item span {
    word-break: break-all;
  }
  .vf-icon-badge {
    width: 24px;
    height: 24px;
  }
  .vf-icon-badge svg {
    width: 11px;
    height: 11px;
  }
  .vf-touch-btn {
    padding: 6px 10px;
    font-size: 11.5px;
    width: 100%;
    justify-content: center;
    box-sizing: border-box;
  }
  .footer-bottom .brand-name {
    font-size: 13.5px;
  }
  .footer-bottom .copyright {
    font-size: 11px;
    line-height: 1.5;
  }
}
`;
  document.head.appendChild(style);

  // ── Inject footer HTML ─────────────────────────────────────────────────────
  const mount = document.getElementById('site-footer-mount');
  if (!mount) return;

  mount.innerHTML = `
<div class="footer"><div class="footer-wrap" id="volga-footer">
  <div class="footer-inner">

    <div class="vf-grid">

      <!-- Column 1: Brand -->
      <div class="vf-col vf-brand-col" id="col-brand">
        <div class="footer-logo">
          <img src="logo.png" alt="Volga Infosys®" />
        </div>
        <h4 class="vf-tagline">Building Immersive Experiences for a Smarter Tomorrow.</h4>
        <p class="vf-desc">We help businesses transform with AR / VR, 3D, and AI-powered solutions that drive real-world impact.</p>
        <div class="vf-social-row">
          <a href="https://linkedin.com" target="_blank" rel="noopener" class="vf-social-btn" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.46 1.46 0 1 0 0-2.92 1.46 1.46 0 0 0 0 2.92M7.85 18.5V9.94H5.08v8.56h2.77z"/></svg>
          </a>
          <a href="https://www.instagram.com/volgainfosys/" target="_blank" rel="noopener" class="vf-social-btn" aria-label="Instagram">
            <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://x.com" target="_blank" rel="noopener" class="vf-social-btn" aria-label="X (Twitter)">
            <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener" class="vf-social-btn" aria-label="YouTube">
            <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
          <a href="https://discord.com" target="_blank" rel="noopener" class="vf-social-btn" aria-label="Discord">
            <svg viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
          </a>
        </div>
      </div>

      <!-- Column 2: Company -->
      <div class="vf-col" id="col-company">
        <div class="vf-col-title">COMPANY</div>
        <div class="vf-col-accent"></div>
        <div class="vf-links">
          <a href="about.html">About Us</a>
          <a href="portfolio.html">Our Work</a>
          <a href="careers-page (1).html">Careers</a>
          <a href="insights-overview-new.html">Blogs</a>
          <a href="contact.html">Contact</a>
        </div>
      </div>

      <!-- Column 3: Services -->
      <div class="vf-col" id="col-services">
        <div class="vf-col-title">SERVICES</div>
        <div class="vf-col-accent"></div>
        <div class="vf-links">
          <a href="services.html#ar-dev">AR / VR Services</a>
          <a href="services.html#3d-modeling">3D Modeling &amp; Animation</a>
          <a href="services.html#unity">Unity &amp; Digital Twins</a>
          <a href="services.html#webxr">WebXR Experiences</a>
          <a href="services.html#uiux">Spatial UI/UX</a>
          <a href="services.html#cloud">Cloud &amp; Pixel Streaming</a>
        </div>
      </div>

      <!-- Column 4: Get In Touch -->
      <div class="vf-col" id="col-touch">
        <div class="vf-col-title">GET IN TOUCH</div>
        <div class="vf-col-accent"></div>
        <div class="vf-contact-list">
          <a href="mailto:hello@volgainfosys.com" class="vf-contact-item">
            <span class="vf-icon-badge">
              <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </span>
            <span>hello@volgainfosys.com</span>
          </a>
          <a href="tel:+911234567890" class="vf-contact-item">
            <span class="vf-icon-badge">
              <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            </span>
            <span>+91 9504495055</span>
          </a>
          <div class="vf-contact-item">
            <span class="vf-icon-badge">
              <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </span>
            <span>Ludhiana, Punjab, India</span>
          </div>
        </div>
        <a href="contact.html" class="vf-touch-btn">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          Let's Build Together &rarr;
        </a>
      </div>

    </div>

    <!-- Bottom copyright / legal bar -->
    <div class="footer-bottom" id="footer-bottom">
      <div class="brand-name"><span>Volga</span> Infosys&reg;</div>
      <div class="copyright">&copy; Volga Infosys&reg; 2026 &nbsp;&nbsp;|&nbsp;&nbsp; <a href="contact.html">Privacy &amp; Policy</a></div>
    </div>

  </div>
</div></div>`;

  // ── GSAP animation (runs after DOM is ready) ───────────────────────────────
  function initFooterAnim() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const footer = document.getElementById('volga-footer');
    const colBrand = document.getElementById('col-brand');
    const colCompany = document.getElementById('col-company');
    const colServices = document.getElementById('col-services');
    const colTouch = document.getElementById('col-touch');
    const footerBottom = document.getElementById('footer-bottom');

    if (!footer || !colBrand) return;

    gsap.set(colBrand, { y: 15, opacity: 0 });
    gsap.set(colCompany, { y: 15, opacity: 0 });
    gsap.set(colServices, { y: 15, opacity: 0 });
    gsap.set(colTouch, { y: 15, opacity: 0 });
    gsap.set(footerBottom, { y: 15, opacity: 0 });

    const showFooter = () => {
      gsap.to(colBrand, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
      gsap.to(colCompany, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.08 });
      gsap.to(colServices, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.14 });
      gsap.to(colTouch, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.20 });
      gsap.to(footerBottom, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.26 });
    };

    const rect = footer.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      showFooter();
    } else {
      ScrollTrigger.create({ trigger: footer, start: 'top 90%', onEnter: showFooter, once: true });
    }
    setTimeout(showFooter, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooterAnim);
  } else {
    setTimeout(initFooterAnim, 50);
  }
})();
