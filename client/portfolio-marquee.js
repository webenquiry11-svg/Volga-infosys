/**
 * Portfolio Marquee — drop-in script
 *
 * What it does:
 *  1. Reads all .portfolio.card elements from your existing HTML
 *  2. Builds two infinite marquee rows from that data
 *  3. Replaces the original cards with the marquee inside .section-intro
 *  4. Adds GSAP scroll-entrance + per-card 3-D tilt
 *
 * Requirements:
 *   - GSAP 3 + ScrollTrigger loaded before this script
 *   - portfolio-marquee.css linked in <head>
 */
(function () {

  /* ── 1. scrape existing card data from the HTML ── */
  const rawCards = document.querySelectorAll('.portfolio.card, .portfolio-card');
  if (!rawCards.length) return;

  const CARDS = Array.from(rawCards).map((card, i) => {
    const imgEl  = card.querySelector('img');
    const h3     = card.querySelector('h3');
    const pEl    = card.querySelector('p');
    const tagEls = card.querySelectorAll('.pf-tag');

    const tags   = Array.from(tagEls).map(t => t.textContent.trim());
    const isVR   = tags.some(t => /virtual reality/i.test(t));
    const imgSrc = imgEl ? imgEl.getAttribute('src') : '';
    const imgAlt = imgEl ? imgEl.getAttribute('alt') : '';

    return {
      src:   imgSrc,
      alt:   imgAlt,
      type:  isVR ? 'vr' : 'ar',
      num:   String(i + 1).padStart(2, '0'),
      title: h3  ? h3.textContent.trim()  : '',
      desc:  pEl ? pEl.textContent.trim() : '',
      tags,
      grad:  'pf-g' + ((i % 9) + 1),
      emoji: ['🚗','🏭','🏠','✈️','🏥','🛍️','🎪','🏙️','💻'][i] || '🔮',
    };
  });

  /* ── 2. build one card's markup ── */
  function cardHTML(c) {
    const isVR  = c.type === 'vr';
    const badge = isVR ? 'pf-badge-vr' : 'pf-badge-ar';
    const tag0  = isVR ? 'pf-tag-vr'   : 'pf-tag-ar';

    const imgMk = c.src
      ? `<img src="${c.src}" alt="${c.alt}" loading="lazy"/>`
      : `<div class="pf-placeholder ${c.grad}">${c.emoji}</div>`;

    const tagMk = c.tags.map((t, i) =>
      `<span class="pf-tag-m ${i === 0 ? tag0 : 'pf-tag-i'}">${t}</span>`
    ).join('');

    return `<div class="pf-card-m">
      <div class="pf-thumb-m">
        ${imgMk}
        <span class="pf-badge ${badge}">${c.type.toUpperCase()}</span>
        <span class="pf-card-num">${c.num}</span>
      </div>
      <div class="pf-body-m">
        <h3>${c.title}</h3>
        <p>${c.desc}</p>
        <div class="pf-tags-m">${tagMk}</div>
      </div>
    </div>`;
  }

  /* ── 3. build the full marquee DOM ── */
  const section    = document.querySelector('.section-intro');
  const introH2    = section.querySelector('.intro-content > h2');
  const introP     = section.querySelector('.intro-content > p');
  const discoverBtn = section.querySelector('.pf-discover');

  // remove all old cards
  rawCards.forEach(c => {
    // walk up if needed and remove closest .portfolio wrapper
    let el = c;
    while (el && el !== section) {
      if (el.classList.contains('portfolio') || el.classList.contains('portfolio-card')) {
        el.remove();
        break;
      }
      el = el.parentElement;
    }
  });

  // split cards into two rows
  const half   = Math.ceil(CARDS.length / 2);
  const set1   = CARDS.slice(0, half);
  const set2   = CARDS.slice(half).length ? CARDS.slice(half) : [...CARDS].reverse();

  // triplicate for seamless loop
  function triplicate(arr) {
    return [...arr, ...arr, ...arr].map(c => cardHTML(c)).join('');
  }

  const marqueeHTML = `
    <div class="pf-glow"></div>
    <div class="pf-viewport">
      <div class="pf-scene">
        <div class="pf-row row-left">${triplicate(set1)}</div>
        <div class="pf-row row-right">${triplicate(set2)}</div>
      </div>
      <div class="pf-fade"></div>
    </div>`;

  // inject after the intro paragraph, before the button
  const anchor = discoverBtn || null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = marqueeHTML;

  const introContent = section.querySelector('.intro-content');
  if (anchor) {
    introContent.insertBefore(wrapper, anchor);
  } else {
    introContent.appendChild(wrapper);
  }

  // move button to end if it exists
  if (discoverBtn) {
    introContent.appendChild(discoverBtn);
  }

  /* ── 4. GSAP animations ── */
  if (typeof gsap === 'undefined') {
    console.warn('portfolio-marquee.js: GSAP not detected — animations skipped.');
    return;
  }

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // entrance timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 76%',
      once: true,
    }
  });

  tl.from(introH2, { opacity: 0, y: 32, duration: 0.8, ease: 'power3.out' })
    .from(introP,   { opacity: 0, y: 22, duration: 0.75, ease: 'power3.out' }, '-=0.5')
    .from('.pf-scene', {
      opacity: 0, y: 72,
      rotateX: 16,
      duration: 1.1,
      ease: 'power4.out',
      transformOrigin: 'center top',
      clearProps: 'rotateX',
    }, '-=0.45')
    .from('.pf-discover', { opacity: 0, y: 20, duration: 0.65, ease: 'power3.out' }, '-=0.3');

  // per-card 3-D tilt
  section.querySelectorAll('.pf-card-m').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
      gsap.to(card, {
        rotateY: dx * 11, rotateX: -dy * 8,
        duration: 0.32, ease: 'power2.out',
        transformPerspective: 720,
        transformOrigin: 'center center',
        overwrite: 'auto',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0, rotateX: 0,
        duration: 0.75, ease: 'elastic.out(1, 0.55)',
        overwrite: 'auto',
      });
    });
  });

})();