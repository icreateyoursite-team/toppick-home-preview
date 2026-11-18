(() => {
  const d = document, body = d.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = matchMedia('(min-width: 1100px)');
  const yr = d.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ===== iCreate first screen ===== */

  /* header: solid on scroll */
  const hdr = d.getElementById('hdr');
  const onScroll = () => hdr.classList.toggle('is-solid', scrollY > 40);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  /* mobile drawer */
  const burger = d.getElementById('burger');
  const setNavTop = () => d.documentElement.style.setProperty('--nav-top', hdr.getBoundingClientRect().bottom + 'px');
  const closeNav = () => { body.classList.remove('nav-open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    setNavTop();
    const open = !body.classList.contains('nav-open');
    body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', String(open));
    if (!open) closeMega();
  });

  /* services mega menu: opens on click/tap (plus CSS hover on real desktop pointers) */
  const svc = d.getElementById('svcItem');
  const toggle = svc.querySelector('.nav__toggle');
  const closeMega = () => { svc.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', e => {
    e.stopPropagation();
    const open = !svc.classList.contains('is-open');
    svc.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  d.addEventListener('click', e => { if (desktop.matches && !svc.contains(e.target)) closeMega(); });
  svc.addEventListener('mouseleave', () => { if (desktop.matches) closeMega(); });
  d.querySelectorAll('#nav a').forEach(a => a.addEventListener('click', () => { closeMega(); closeNav(); }));
  desktop.addEventListener('change', () => { closeMega(); closeNav(); });

  /* highlight the menu pill for the section in view (Services button covers #services) */
  const navLinks = [...d.querySelectorAll('.nav__list > .nav__item > a.nav__link[href^="#"]')];
  const spyMap = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
  spyMap.set('services', toggle);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      spyMap.forEach(el => el.classList.remove('is-active'));
      const el = spyMap.get(e.target.id); if (el) el.classList.add('is-active');
    }), { rootMargin: '-45% 0px -50% 0px' });
    spyMap.forEach((_, id) => { const s = d.getElementById(id); if (s) spy.observe(s); });
    const top = d.getElementById('top');
    if (top) new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) spyMap.forEach(el => el.classList.remove('is-active')); }), { rootMargin: '-45% 0px -50% 0px' }).observe(top);
  }

  /* hero parallax, wide screens only */
  const par = d.querySelector('[data-parallax]');
  const wide = matchMedia('(min-width: 1000px)');
  if (par && !reduce) {
    let tick = false;
    const run = () => { tick = false; par.style.transform = wide.matches && scrollY < innerHeight * 1.2 ? `translate3d(0,${(scrollY * 0.15).toFixed(1)}px,0)` : ''; };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
  }

  /* ===== shared ===== */

  /* reveal on scroll */
  const els = d.querySelectorAll('.reveal, .reveal-group');
  if (reduce || !('IntersectionObserver' in window)) els.forEach(el => el.classList.add('is-in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .1 });
    els.forEach(el => io.observe(el));
  }

  /* ===== RenovateHub-style sections ===== */

  /* before / after sliders */
  d.querySelectorAll('.ba__view').forEach(v => {
    const r = v.querySelector('.ba__range');
    const set = () => v.style.setProperty('--pos', r.value + '%');
    r.addEventListener('input', set); set();
  });

  /* FAQ accordion (one open at a time) */
  d.querySelectorAll('.qa').forEach(qa => {
    const btn = qa.querySelector('.qa__q');
    btn.addEventListener('click', () => {
      const open = !qa.classList.contains('is-open');
      d.querySelectorAll('.qa.is-open').forEach(o => { o.classList.remove('is-open'); o.querySelector('.qa__q').setAttribute('aria-expanded', 'false'); });
      qa.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* project gallery lightbox */
  const photos = [
    ['images/proj-77.jpg', 'Bathroom'], ['images/proj-59.jpg', 'Kitchen, before & after'], ['images/proj-26.jpg', 'Staircase'],
    ['images/proj-86.jpg', 'Deck'], ['images/proj-14.jpg', 'Stairs, before & after'], ['images/proj-22.jpg', 'Vanity, before & after'],
    ['images/proj-24.jpg', 'Railing'], ['images/proj-34.jpg', 'Cabinets, before & after'], ['images/proj-40.jpg', 'Flooring, before & after'],
    ['images/proj-12.jpg', 'Closet, before & after'], ['images/card-home.jpg', 'Living room built-ins'], ['images/card-commercial-v2.jpg', 'Commercial space']
  ];
  const lb = d.getElementById('lb'), lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption');
  let idx = 0, last = null;
  const show = i => { idx = (i + photos.length) % photos.length; lbImg.src = photos[idx][0]; lbImg.alt = photos[idx][1]; lbCap.textContent = `${photos[idx][1]}  ·  ${idx + 1} / ${photos.length}`; };
  const openLb = () => { last = d.activeElement; show(0); lb.hidden = false; body.style.overflow = 'hidden'; lb.querySelector('.lb__close').focus(); };
  const closeLb = () => { lb.hidden = true; body.style.overflow = ''; last && last.focus(); };
  d.getElementById('openGallery').addEventListener('click', openLb);
  lb.querySelector('.lb__close').addEventListener('click', closeLb);
  lb.querySelector('.lb__prev').addEventListener('click', () => show(idx - 1));
  lb.querySelector('.lb__next').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });

  d.addEventListener('keydown', e => {
    if (!lb.hidden) {
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
      return;
    }
    if (e.key === 'Escape') { closeMega(); closeNav(); }
  });

  /* estimate form: time trap + friendly errors (server does the real checks) */
  const form = d.getElementById('estimateForm');
  const t0 = performance.now();
  const msg = form.querySelector('.form__msg');
  const btn = form.querySelector('button[type=submit]');
  const btnHTML = btn.innerHTML;
  const say = (t, c) => { msg.textContent = t; msg.className = 'form__msg ' + (c || ''); };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    form.elements.ts.value = Math.round(performance.now() - t0);
    let bad = false;
    ['name', 'phone', 'email'].forEach(n => {
      const f = form.elements[n], v = f.value.trim();
      const ok = v !== '' && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      f.closest('.fld').classList.toggle('is-bad', !ok); if (!ok) bad = true;
    });
    if (bad) { say('Please fill in your name, phone and a valid email.', 'err'); return; }
    btn.disabled = true; btn.innerHTML = '<span>Sending...</span>'; say('');
    try {
      const res = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) { form.reset(); say('Thank you for contacting us. We will get back to you as soon as possible. For anything urgent, call (312) 307-0040.', 'ok'); }
      else say(data.error || 'Oops, there was an error sending your message. Please call (312) 307-0040.', 'err');
    } catch { say('Oops, there was an error sending your message. Please call (312) 307-0040 or email remodeling@toppickservices.com.', 'err'); }
    finally { btn.disabled = false; btn.innerHTML = btnHTML; }
  });
})();
