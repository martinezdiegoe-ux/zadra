/* zadra-motion.js — animaciones del tema zadra, sin dependencias.
   Solo agrega clases y variables CSS (--nx, --ny, --py, --p, --cs, --i);
   el aspecto de cada efecto vive en zadra-motion.css. */
(() => {
  'use strict';
  const root = document.documentElement;
  if (!root.classList.contains('zm')) return; // animaciones apagadas o movimiento reducido
  root.setAttribute('data-zm-ready', '');

  const designMode = !!(window.Shopify && window.Shopify.designMode); // en el editor, todo aparece al instante
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  // Si algo falla, se apaga toda la capa para que la tienda nunca quede oculta.
  const safe = fn => { try { fn(); } catch (error) { root.classList.remove('zm'); } };

  // Debe coincidir con la primera regla de zadra-motion.css
  const REVEAL = '.intro-heading,.section-heading,.comparison-wrap,.compare-empty,.product-gallery,.product-info,.category-tile,.rail>.product-card,.catalog-grid>.product-card,.editorial-card,[data-reveal]';

  /* 1 · Aparición al entrar: los elementos que entran juntos salen escalonados */
  const reveal = new IntersectionObserver(entries => {
    let order = 0;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.setProperty('--i', order++);
      entry.target.classList.add('is-in');
      reveal.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  /* 2 · Cursor: suaviza la posición del mouse y la publica como --nx / --ny (−1…1) */
  function bindPointer(el) {
    if (el.dataset.zmPointer) return;
    el.dataset.zmPointer = '1';
    const s = { x: 0, y: 0, tx: 0, ty: 0, raf: 0, inside: false };
    const tick = () => {
      s.raf = 0;
      if (!el.isConnected) return;
      s.x += (s.tx - s.x) * 0.09;
      s.y += (s.ty - s.y) * 0.09;
      el.style.setProperty('--nx', s.x.toFixed(4));
      el.style.setProperty('--ny', s.y.toFixed(4));
      if (s.inside || Math.abs(s.tx - s.x) > 0.002 || Math.abs(s.ty - s.y) > 0.002) s.raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!s.raf) s.raf = requestAnimationFrame(tick); };
    el.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      s.tx = clamp(((event.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      s.ty = clamp(((event.clientY - r.top) / r.height) * 2 - 1, -1, 1);
      el.style.setProperty('--mx', (event.clientX - r.left) + 'px');
      el.style.setProperty('--my', (event.clientY - r.top) + 'px');
      s.inside = true;
      el.classList.add('is-hover');
      kick();
    });
    el.addEventListener('pointerleave', () => {
      s.inside = false; s.tx = 0; s.ty = 0;
      el.classList.remove('is-hover');
      kick();
    });
  }

  /* 3 · Scroll: un solo bucle por frame, solo sobre lo que está en pantalla */
  const visible = new Set();
  const watcher = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    requestFrame();
  }, { rootMargin: '10% 0px' });
  const header = document.querySelector('.site-header');
  let queued = false;
  function frame() {
    queued = false;
    const vh = window.innerHeight;
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    visible.forEach(el => {
      if (!el.isConnected) { visible.delete(el); return; }
      const r = el.getBoundingClientRect();
      if (el.classList.contains('hero-feature')) {
        el.style.setProperty('--py', (clamp(-r.top / r.height) * 44).toFixed(1) + 'px');
      } else {
        const p = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
        el.style.setProperty('--p', p.toFixed(3));
        el.style.setProperty('--cs', (0.94 + 0.06 * clamp((vh - r.top) / (vh * 0.65))).toFixed(4));
      }
    });
  }
  function requestFrame() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame);

  function watch(el) {
    if (el.dataset.zmWatch) return;
    el.dataset.zmWatch = '1';
    watcher.observe(el);
  }

  /* Hero: titular en líneas con máscara + entrada cuando la imagen ya está lista */
  function initHero(hero) {
    if (hero.dataset.zmHero) return;
    hero.dataset.zmHero = '1';
    const title = hero.querySelector('.hero-copy h2');
    if (title && !title.dataset.split) {
      const lines = title.innerHTML.split(/<br\s*\/?>/i).map(line => line.trim()).filter(Boolean);
      title.innerHTML = lines.map((line, n) => '<span class="zm-line" style="--l:' + n + '"><span>' + line + '</span></span>').join('');
      title.dataset.split = '1';
    }
    const image = hero.querySelector('.hero-photo');
    const go = () => hero.classList.add('is-in');
    if (designMode || !image) { go(); return; }
    const decoded = image.decode ? image.decode().catch(() => {}) : Promise.resolve();
    Promise.race([decoded, new Promise(resolve => setTimeout(resolve, 800))]).then(go);
  }

  /* Ficha de producto: fundido cuando zadra.js cambia la imagen (variante o miniatura) */
  function initProductImage(media) {
    const image = media.querySelector('img');
    if (!image || image.dataset.zmSwap) return;
    image.dataset.zmSwap = '1';
    let pending = false;
    new MutationObserver(() => { pending = true; }).observe(image, { attributes: true, attributeFilter: ['src'] });
    image.addEventListener('load', () => {
      if (!pending) return;
      pending = false;
      image.classList.remove('zm-swap');
      void image.offsetWidth; // reinicia la animación
      image.classList.add('zm-swap');
    });
  }

  function init(scope = document) {
    safe(() => {
      scope.querySelectorAll(REVEAL).forEach(el => {
        if (el.dataset.zmReveal) return;
        el.dataset.zmReveal = '1';
        if (designMode) el.classList.add('is-in'); else reveal.observe(el);
      });
      scope.querySelectorAll('.hero-feature').forEach(hero => { initHero(hero); bindPointer(hero); watch(hero); });
      scope.querySelectorAll('.editorial-card').forEach(watch);
      scope.querySelectorAll('.main-media').forEach(media => { initProductImage(media); bindPointer(media); });
      scope.querySelectorAll('[data-pointer]').forEach(bindPointer);
      requestFrame();
    });
  }

  // El editor de Shopify recarga secciones sueltas: se inicializa solo lo nuevo.
  document.addEventListener('shopify:section:load', event => init(event.target));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init()); else init();
})();
