/* ════════════════════════════════════════════════════════
   PORTFOLIO — Timed Cards Slider
═══════════════════════════════════════════════════════════ */

const defaultData = [
  { place:'United States',  title:'VR MEDICAL',   title2:'TRAINING',        tag:'Virtual Reality',   description:'Full-body surgical simulation for a leading US hospital network. Reduced training costs by 60% and improved retention across 12 departments.',               image:'https://images.unsplash.com/photo-1617802690658-1173a812650d?w=1400&q=80' },
  { place:'UAE — Dubai',    title:'AR FURNITURE',  title2:'CONFIGURATOR',    tag:'Augmented Reality', description:'Place and customise furniture in your real space before buying. Deployed across 40+ showrooms for a UAE-based retail chain. 42% fewer returns.',            image:'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=1400&q=80' },
  { place:'UAE — Dubai',    title:'LUXURY',        title2:'WALKTHROUGH',     tag:'Architecture',      description:'Pre-sale VR tours for a Dubai real estate developer. 40% of units sold before construction even broke ground.',                                             image:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=80' },
  { place:'Scandinavia',    title:'INDUSTRIAL',    title2:'SAFETY VR',       tag:'XR Training',       description:'Hazardous environment simulation for an oil & gas company in Scandinavia. Zero workplace incidents recorded post-deployment.',                               image:'https://images.unsplash.com/photo-1626379961798-54f819ee896a?w=1400&q=80' },
  { place:'United Kingdom', title:'AUTOMOTIVE',    title2:'3D CONFIGURATOR', tag:'3D Visualization',  description:'Real-time car customisation tool for a UK automotive brand. 35% increase in online conversions within the first quarter of launch.',                        image:'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1400&q=80' },
  { place:'Germany — DACH', title:'VIRTUAL',       title2:'MUSEUM',          tag:'Entertainment',     description:'Digital twin of a historical museum in Germany. Over 100,000 virtual visitors in the first month of launch.',                                               image:'https://images.unsplash.com/photo-1551731409-43eb3e517a1a?w=1400&q=80' }
];

const h = window.location.hostname;
const API_URL = window.VOLGA_API;

async function fetchProjects() {
  try {
    const res = await fetch(`${API_URL}/projects`);
    const projects = await res.json();
    if (Array.isArray(projects) && projects.length) {
      const mapped = projects.map(p => ({ place: p.place, title: p.title, title2: p.title2 || '', tag: p.tag, description: p.description, image: window.getVolgaImageUrl(p.image) }));
      // slider needs at least 2 slides — pad with defaultData if needed
      if (mapped.length < 2) {
        const extras = defaultData.filter(d => !mapped.find(m => m.title === d.title));
        return [...mapped, ...extras].slice(0, Math.max(mapped.length, defaultData.length));
      }
      return mapped;
    }
  } catch (_) {}
  const saved = JSON.parse(localStorage.getItem('volgaPortfolioProjects') || '[]');
  return saved.length
    ? saved.map(p => ({ place: p.place, title: p.title1, title2: p.title2, tag: p.tag, description: p.description, image: p.image }))
    : defaultData;
}

const $    = id => document.getElementById(id);
const SL   = () => $('slider');
const SW   = () => SL().offsetWidth;
const SH   = () => SL().offsetHeight;
const ease = 'sine.inOut';

const CARD_W = 180, CARD_H = 260, CARD_GAP = 16, NUM_SZ = 44;

function dims() {
  const W = SW(), H = SH();
  return { W, H, oL: Math.round(W * 0.55), oT: H - CARD_H - 60 };
}

function animate(t, dur, props) {
  return new Promise(r => gsap.to(t, { ...props, duration: dur, onComplete: r }));
}

// ── everything that needs `data` lives inside this function ──
function boot(data) {
  const card = i => `#pf-card${i}`;
  const cc   = i => `#pf-cc-${i}`;
  const sn   = i => `#pf-sn-${i}`;

  // inject cards
  $('pf-demo').innerHTML = data.map((d, i) =>
    `<div class="pf-card" id="pf-card${i}" style="background-image:url('${d.image}')"></div>
     <div class="pf-card-content" id="pf-cc-${i}">
       <div class="pf-content-start"></div>
       <div class="pf-content-place">${d.place}</div>
       <div class="pf-content-title-1">${d.title}</div>
       <div class="pf-content-title-2">${d.title2}</div>
     </div>`
  ).join('');

  $('pf-slide-numbers').innerHTML = data.map((_, i) =>
    `<div class="pf-num-item" id="pf-sn-${i}">${i + 1}</div>`
  ).join('');

  let order = data.map((_, i) => i);
  let even  = true;

  function resetText(p) {
    gsap.set(`${p} .pf-place-text`, { y: 100 });
    gsap.set(`${p} .pf-title-1`,    { y: 100 });
    gsap.set(`${p} .pf-title-2`,    { y: 100 });
    gsap.set(`${p} .pf-desc`,       { y: 50  });
    gsap.set(`${p} .pf-cta`,        { y: 60  });
  }

  function fill(p, idx) {
    document.querySelector(`${p} .pf-place-text`).textContent = data[idx].place;
    document.querySelector(`${p} .pf-title-1`).textContent    = data[idx].title;
    document.querySelector(`${p} .pf-title-2`).textContent    = data[idx].title2;
    document.querySelector(`${p} .pf-desc`).textContent       = data[idx].description;
    document.querySelector(`${p} .pf-tag-btn`).textContent    = data[idx].tag;
  }

  function init() {
    const { W, H, oL, oT } = dims();
    const [active, ...rest] = order;
    const dA = even ? '#pf-details-even' : '#pf-details-odd';
    const dI = even ? '#pf-details-odd'  : '#pf-details-even';

    gsap.set('#pf-pagination', { left: 60, bottom: 28, top: 'auto', opacity: 0, y: 40 });
    gsap.set(card(active), { x: 0, y: 0, width: W, height: H, zIndex: 20, borderRadius: 0 });
    gsap.set(cc(active),   { x: 0, y: 0, width: W, height: H, opacity: 0 });
    gsap.set(dA, { opacity: 0, x: -60 });
    gsap.set(dI, { opacity: 0 });
    resetText(dI);
    gsap.set('#pf-progress-fg', { width: 180 * (1 / order.length) * (active + 1) });

    rest.forEach((i, idx) => {
      gsap.set(card(i), { x: W + 300, y: oT, width: CARD_W, height: CARD_H, zIndex: 30, borderRadius: 10 });
      gsap.set(cc(i),   { x: W + 300, y: oT, width: CARD_W, height: CARD_H, zIndex: 40 });
      gsap.set(sn(i),   { x: (idx + 1) * NUM_SZ });
    });

    gsap.set('#pf-indicator', { x: -W });
    gsap.to('#pf-cover', { x: W + 400, delay: 0.5, ease, onComplete: () => { gsap.set('#pf-cover', { display: 'none' }); setTimeout(loop, 500); } });

    const d = 0.7;
    rest.forEach((i, idx) => {
      gsap.to(card(i), { x: oL + idx * (CARD_W + CARD_GAP), y: oT, ease, delay: d });
      gsap.to(cc(i),   { x: oL + idx * (CARD_W + CARD_GAP), y: oT, ease, delay: d });
    });
    gsap.to('#pf-pagination', { y: 0, opacity: 1, ease, delay: d });
    gsap.to(dA, { opacity: 1, x: 0, ease, delay: d, onComplete: () => gsap.set(`${dA} .pf-cta`, { clearProps: 'transform,willChange' }) });
    fill(dA, order[0]);
  }

  let clicks = 0;

  function step() {
    return new Promise(resolve => {
      order.push(order.shift());
      even = !even;
      const dA = even ? '#pf-details-even' : '#pf-details-odd';
      const dI = even ? '#pf-details-odd'  : '#pf-details-even';
      const { W, H, oL, oT } = dims();
      const [active, ...rest] = order;
      const prv = rest[rest.length - 1];

      fill(dA, order[0]);

      gsap.set(dA, { clearProps: 'zIndex' });
      gsap.to(dA,                     { opacity: 1, delay: 0.4, ease });
      gsap.to(`${dA} .pf-place-text`, { y: 0, delay: 0.1,  duration: 0.7, ease });
      gsap.to(`${dA} .pf-title-1`,    { y: 0, delay: 0.15, duration: 0.7, ease });
      gsap.to(`${dA} .pf-title-2`,    { y: 0, delay: 0.15, duration: 0.7, ease });
      gsap.to(`${dA} .pf-desc`,       { y: 0, delay: 0.3,  duration: 0.4, ease });
      gsap.to(`${dA} .pf-cta`, { y: 0, delay: 0.35, duration: 0.4, ease, onComplete: () => { gsap.set(`${dA} .pf-cta`, { clearProps: 'transform,willChange' }); resolve(); } });
      gsap.set(dI, { clearProps: 'zIndex' });

      gsap.set(card(prv),    { zIndex: 10 });
      gsap.set(card(active), { zIndex: 20 });
      gsap.to(card(prv),     { scale: 1.4, ease });
      gsap.to(cc(active),    { opacity: 0, duration: 0.3, ease });
      gsap.to(sn(active),    { x: 0, ease });
      gsap.to(sn(prv),       { x: -NUM_SZ, ease });
      gsap.to('#pf-progress-fg', { width: 180 * (1 / order.length) * (active + 1), ease });

      gsap.to(card(active), {
        x: 0, y: 0, width: W, height: H, borderRadius: 0, ease,
        onComplete: () => {
          const xN = oL + (rest.length - 1) * (CARD_W + CARD_GAP);
          gsap.set(card(prv), { x: xN, y: oT, width: CARD_W, height: CARD_H, zIndex: 30, borderRadius: 10, scale: 1 });
          gsap.set(cc(prv),   { x: xN, y: oT, width: CARD_W, height: CARD_H, opacity: 1, zIndex: 40 });
          gsap.set(sn(prv),   { x: rest.length * NUM_SZ });
          gsap.set(dI, { opacity: 0 });
          resetText(dI);
          clicks -= 1;
          if (clicks > 0) step();
        }
      });

      rest.forEach((i, idx) => {
        if (i === prv) return;
        const xN = oL + idx * (CARD_W + CARD_GAP);
        gsap.set(card(i), { zIndex: 30 });
        gsap.to(card(i), { x: xN, y: oT, width: CARD_W, height: CARD_H, ease, delay: 0.1 * (idx + 1) });
        gsap.to(cc(i),   { x: xN, y: oT, width: CARD_W, height: CARD_H, opacity: 1, zIndex: 40, ease, delay: 0.1 * (idx + 1) });
        gsap.to(sn(i),   { x: (idx + 1) * NUM_SZ, ease });
      });
    });
  }

  async function loop() {
    await animate('#pf-indicator', 2.5, { x: 0 });
    await animate('#pf-indicator', 0.6, { x: SW(), delay: 0.3 });
    gsap.set('#pf-indicator', { x: -SW() });
    await step();
    loop();
  }

 document.getElementById('pf-next').addEventListener('click', () => {
    console.log('next clicked, clicks=', clicks);
    clicks++;
    if (clicks === 1) step();
  });
  document.getElementById('pf-prev').addEventListener('click', () => {
    console.log('prev clicked, clicks=', clicks);
    order.unshift(order.pop());
    order.unshift(order.pop());
    clicks++;
    if (clicks === 1) step();
  });


  window.addEventListener('resize', () => {
    const { W, H, oL, oT } = dims();
    const [active, ...rest] = order;
    gsap.set(card(active), { width: W, height: H });
    gsap.set(cc(active),   { width: W, height: H });
    rest.forEach((i, idx) => {
      gsap.set(card(i), { x: oL + idx * (CARD_W + CARD_GAP), y: oT });
      gsap.set(cc(i),   { x: oL + idx * (CARD_W + CARD_GAP), y: oT });
    });
    gsap.set('#pf-pagination', { left: 60, bottom: 28, top: 'auto' });
  });

  // stat counters
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.val);
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      let n = 0; const s = target / 60;
      const iv = setInterval(() => {
        n += s;
        if (n >= target) { el.textContent = target; clearInterval(iv); }
        else el.textContent = Math.floor(n);
      }, 16);
    });
    observer.observe(el);
  });

  // wait for images then start
  Promise.all(data.map(d => new Promise(r => {
    const img = new Image(); img.onload = img.onerror = r; img.src = d.image;
  }))).then(init);
}

// ── entry point ───────────────────────────────────────────
fetchProjects().then(boot);
