(function() {
  // ── Inject footer CSS ──────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
.footer{margin:0;padding:0;box-sizing:border-box;}
.footer-wrap{font-family:var(--font-ui);background:#fff;width:100%;min-height:300px;position:relative;overflow:hidden;border-top:1px solid #e8e8e8;}
.footer-inner{position:relative;max-width:1900px;margin:0 auto;padding:60px 48px 36px;min-height:460px;}
.footer-logo{width:150px;margin-bottom:6px;}
.footer-logo img{width:100%;height:100%;object-fit:cover;}
.footer-tagline{font-family:var(--font-ui);font-size:11px;font-weight:400;letter-spacing:0.14em;text-transform:uppercase;color:#888;margin-bottom:36px;}
.footer-newsletter{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;padding-bottom:32px;margin-bottom:36px;border-bottom:1px solid #e8e8e8;position:relative;z-index:2;}
.newsletter-copy .newsletter-title{font-family:var(--font-display);font-size:16px;font-weight:600;color:#1a1a1a;margin-bottom:4px;}
.newsletter-copy .newsletter-sub{font-family:var(--font-ui);font-size:13px;color:#888;}
.footer-newsletter .newsletter-form{display:flex;gap:0;border:1px solid #1a1a1a;overflow:hidden;}
.footer-newsletter .newsletter-form input{font-family:var(--font-ui);font-size:13px;border:none;outline:none;padding:12px 16px;width:240px;background:#fff;color:#1a1a1a;}
.footer-newsletter .newsletter-form button{font-family:var(--font-ui);font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;border:none;background:#1a1a1a;color:#fff;padding:0 22px;cursor:pointer;transition:background 0.3s ease;white-space:nowrap;}
.footer-newsletter .newsletter-form button:hover{background:#1a4fa0;}
.footer-cols{display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:2;max-width:1900px;gap:24px;flex-wrap:wrap;}
.col-left,.col-right,.col-extra-left,.col-extra-right,.col-far-left,.col-far-right{display:flex;flex-direction:column;gap:10px;min-width:130px;}
.col-label{font-family:var(--font-display);font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#1a1a1a;margin-bottom:10px;}
.col-left a,.col-right a,.col-extra-left a,.col-extra-right a,.col-far-left a,.col-far-right a{font-family:var(--font-ui);font-size:14px;font-weight:400;color:#1a1a1a;text-decoration:none;letter-spacing:0.01em;line-height:1.9;transition:all 0.3s ease;position:relative;display:inline-block;}
.col-left a:hover,.col-right a:hover,.col-extra-left a:hover,.col-extra-right a:hover,.col-far-left a:hover,.col-far-right a:hover{color:#1a4fa0;transform:translateY(-2px);font-weight:500;}
.col-left a::after,.col-right a::after,.col-extra-left a::after,.col-extra-right a::after,.col-far-left a::after,.col-far-right a::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:2px;background:#1a4fa0;transition:width 0.3s ease;}
.col-left a:hover::after,.col-right a:hover::after,.col-extra-left a:hover::after,.col-extra-right a:hover::after,.col-far-left a:hover::after,.col-far-right a:hover::after{width:100%;}
.col-right,.col-extra-right,.col-far-right{text-align:right;}
.col-right .divider,.col-extra-right .divider,.col-far-right .divider{width:32px;height:2px;background:#1a1a1a;margin:4px 0 8px auto;}
.col-extra-left .divider,.col-far-left .divider{width:32px;height:2px;background:#1a1a1a;margin:4px 0 8px 0;}
.col-far-right .contact-block{display:flex;flex-direction:column;gap:10px;margin-bottom:18px;}
.col-far-right .contact-block a,.col-far-right .contact-block span{font-size:13px;color:#555;}
.footer-bottom{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px;padding-top:32px;position:relative;z-index:2;border-top:1px solid #e8e8e8;margin-top:80px;}
.brand-name{font-family:var(--font-display);font-size:38px;font-weight:300;letter-spacing:-0.02em;color:#1a1a1a;line-height:1;}
.brand-name span{font-weight:700;}
.copyright{font-family:var(--font-ui);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#888;}
.copyright a{color:#888;text-decoration:none;}
.copyright a:hover{color:#1a4fa0;}
@media(max-width:900px){.footer-cols{gap:20px;}.col-right,.col-extra-right,.col-far-right{text-align:left;}.col-right .divider,.col-extra-right .divider,.col-far-right .divider{margin:4px 0 8px 0;}}
@media(max-width:600px){.footer-inner{padding:40px 20px 24px;}.footer-newsletter{flex-direction:column;align-items:flex-start;}.footer-newsletter .newsletter-form input{width:180px;}.brand-name{font-size:28px;}.footer-bottom{flex-direction:column;gap:10px;}}
`;
  document.head.appendChild(style);

  // ── Inject footer HTML ─────────────────────────────────────────────────────
  const mount = document.getElementById('site-footer-mount');
  if (!mount) return;

  mount.innerHTML = `
<div class="footer"><div class="footer-wrap" id="volga-footer">
  <div class="footer-inner">

    <div class="footer-logo">
      <img src="logo.png" alt="Volga Infosys®" />
    </div>
    <div class="footer-tagline">Crafting immersive digital realities</div>

    <div class="footer-newsletter" id="footer-newsletter">
      <div class="newsletter-copy">
        <div class="newsletter-title">Stay ahead of the curve</div>
        <div class="newsletter-sub">One email a month on real-time rendering and immersive tech.</div>
      </div>
      <form class="newsletter-form" onsubmit="return false;">
        <input type="email" placeholder="name@company.com" required />
        <button type="submit">Subscribe</button>
      </form>
    </div>

    <div class="footer-cols">

      <div class="col-left" id="col-left">
        <div class="col-label">Business</div>
        <a href="industries.html">Training Simulation</a>
        <a href="industries.html">3D Configurators</a>
        <a href="industries.html">Buildings &amp; Interiors</a>
        <a href="industries.html">E-Commerce</a>
        <a href="industries.html#manufacturing">Manufacturing</a>
        <a href="industries.html">Entertainment</a>
        <a href="industries.html#tourism">Museums &amp; Travel</a>
        <a href="industries.html#healthcare">Healthcare</a>
        <a href="industries.html#automotive">Automotive</a>
      </div>

      <div class="col-extra-left" id="col-extra-left">
        <div class="col-label">Company</div>
        <div class="divider"></div>
        <a href="about.html">About Us</a>
        <a href="portfolio.html">Our Work</a>
        <a href="careers-page (1).html">Careers</a>
        <a href="blog.html">Blog</a>
        <a href="contact.html">Contact</a>
        <a href="#">Partners</a>
      </div>

      <div class="col-extra-right" id="col-extra-right">
        <div class="col-label">Services</div>
        <div class="divider"></div>
        <a href="solutions.html">AR / VR Solutions</a>
        <a href="services.html">Motion Graphics</a>
        <a href="services.html">Product Visualisation</a>
        <a href="services.html">Game Development</a>
        <a href="solutions.html#twin">Digital Twins</a>
        <a href="services.html">3D Modeling</a>
        <a href="services.html">Cloud Rendering</a>
      </div>

      <div class="col-far-left" id="col-far-left">
        <div class="col-label">Resources</div>
        <div class="divider"></div>
        <a href="blog.html">Blogs</a>
        <a href="#">Support Center</a>
        <a href="#">FAQ</a>
        <a href="#">System Requirements</a>
        <a href="#">Pricing</a>
        <a href="contact.html">Request a Demo</a>
      </div>

      <div class="col-far-right" id="col-far-right">
        <div class="col-label" style="text-align:right;">Contact</div>
        <div class="divider"></div>
        <div class="contact-block">
          <a href="mailto:hello@volgainfosys.com">hello@volgainfosys.com</a>
          <a href="tel:+911234567890">+91 123 456 7890</a>
          <span>Ludhiana, Punjab, India</span>
        </div>
        <div class="col-label" style="text-align:right;">Social</div>
        <div class="divider"></div>
        <a href="#">LinkedIn</a>
        <a href="#">Instagram</a>
        <a href="#">Facebook</a>
        <a href="#">YouTube</a>
        <a href="#">WhatsApp</a>
        <a href="#">X (Twitter)</a>
      </div>

    </div>

    <div class="footer-bottom" id="footer-bottom">
      <div class="brand-name"><span>Volga</span> Infosys&reg;</div>
      <div class="copyright">&copy; Volga Infosys&reg; 2026 &nbsp;&nbsp;|&nbsp;&nbsp; <a href="#">Privacy &amp; Policy</a> &nbsp;&nbsp;|&nbsp;&nbsp; <a href="#">Terms of Service</a> &nbsp;&nbsp;|&nbsp;&nbsp; <a href="#">Cookie Policy</a> &nbsp;&nbsp;|&nbsp;&nbsp; Made with &hearts; by Volga</div>
    </div>

  </div>
</div></div>`;

  // ── GSAP animation (runs after DOM is ready) ───────────────────────────────
  function initFooterAnim() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const footer       = document.getElementById('volga-footer');
    const newsletter   = document.getElementById('footer-newsletter');
    const colLeft      = document.getElementById('col-left');
    const colExtraLeft = document.getElementById('col-extra-left');
    const colExtraRight= document.getElementById('col-extra-right');
    const colFarLeft   = document.getElementById('col-far-left');
    const colFarRight  = document.getElementById('col-far-right');
    const footerBottom = document.getElementById('footer-bottom');

    if (!footer || !colLeft) return;

    gsap.set(newsletter,    { y: -10, opacity: 0 });
    gsap.set(colLeft,       { x: -30, opacity: 0 });
    gsap.set(colExtraLeft,  { x: -20, opacity: 0 });
    gsap.set(colExtraRight, { x:  20, opacity: 0 });
    gsap.set(colFarLeft,    { x: -20, opacity: 0 });
    gsap.set(colFarRight,   { x:  30, opacity: 0 });
    gsap.set(footerBottom,  { y:  20, opacity: 0 });

    const showFooter = () => {
      gsap.to(newsletter,    { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
      gsap.to(colLeft,       { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.08 });
      gsap.to(colExtraLeft,  { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.14 });
      gsap.to(colExtraRight, { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.20 });
      gsap.to(colFarLeft,    { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.26 });
      gsap.to(colFarRight,   { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.32 });
      gsap.to(footerBottom,  { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.38 });
    };

    const rect = footer.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      showFooter();
    } else {
      ScrollTrigger.create({ trigger: footer, start: 'top 90%', onEnter: showFooter, once: true });
    }
    setTimeout(showFooter, 1000);

    // Scroll parallax
    const cols = [
      { el: colLeft,       y: -20, scrub: 5   },
      { el: colExtraLeft,  y: -15, scrub: 4.5 },
      { el: colExtraRight, y: -15, scrub: 4.5 },
      { el: colFarLeft,    y: -15, scrub: 4   },
      { el: colFarRight,   y: -20, scrub: 5   },
      { el: footerBottom,  y: -10, scrub: 4   },
    ];
    cols.forEach(({ el, y, scrub }) => {
      if (!el) return;
      gsap.to(el, { y, opacity: 1, ease: 'power3.out', scrollTrigger: { trigger: footer, start: 'top 100%', end: 'top 40%', scrub } });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooterAnim);
  } else {
    // Small delay to ensure GSAP is loaded
    setTimeout(initFooterAnim, 50);
  }
})();
