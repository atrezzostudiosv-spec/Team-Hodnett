/* ATREZZO EDITORIAL GALLERY 01 · own code · v1.0
   Gallery interactions. Native scroll, no routing, no dependencies. */
(function (global) {
  'use strict';
  const instances = new WeakMap();
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function init(target, options = {}) {
    const root = typeof target === 'string' ? document.querySelector(target) : target;
    if (!root || !root.classList.contains('atg1')) throw new Error('AtrezzoEditorialGallery01: root .atg1 not found');
    if (instances.has(root)) return instances.get(root);
    const abort = new AbortController();
    const media = global.matchMedia('(prefers-reduced-motion: reduce)');
    let forced = null;
    let raf = 0;
    let destroyed = false;

    const entries = Array.from(root.querySelectorAll('.atg1-index__entry'));
    const photos = Array.from(root.querySelectorAll('.atg1-index__photo'));
    const indexNumber = root.querySelector('[data-atg1-index-number]');
    const thumbs = Array.from(root.querySelectorAll('.atg1-contact__item'));
    const features = Array.from(root.querySelectorAll('.atg1-contact__feature-image'));
    const featureTitle = root.querySelector('[data-atg1-feature-title]');
    const featureCategory = root.querySelector('[data-atg1-feature-category]');
    const featureNumber = root.querySelector('[data-atg1-feature-number]');
    const range = root.querySelector('.atg1-perspective__range');
    const compare = root.querySelector('.atg1-perspective__canvas');
    const compareValue = root.querySelector('[data-atg1-split-value]');
    let indexActive = 0;
    let selected = 0;
    let reduced = false;

    function applyReduced() {
      reduced = forced === null ? media.matches : forced;
      root.classList.toggle('is-reduced', reduced);
    }

    function setIndex(idx) {
      idx = clamp(idx, 0, Math.max(0, entries.length - 1));
      if (idx === indexActive && indexNumber && indexNumber.textContent) return;
      indexActive = idx;
      entries.forEach((el, i) => el.classList.toggle('is-active', i === idx));
      photos.forEach((el, i) => el.classList.toggle('is-active', i === idx));
      if (indexNumber) indexNumber.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(entries.length).padStart(2, '0');
    }

    function updateIndex() {
      raf = 0;
      if (destroyed || reduced || !entries.length || (global.innerWidth <= 680 && !root.classList.contains('is-immersive'))) return;
      const center = global.innerHeight * .49;
      let closest = 0;
      let distance = Infinity;
      entries.forEach((entry, i) => {
        const r = entry.getBoundingClientRect();
        const d = Math.abs((r.top + r.bottom) / 2 - center);
        if (d < distance) { distance = d; closest = i; }
      });
      setIndex(closest);
      // Hodnett full-bleed variant: a restrained scroll-driven photo zoom.
      // Keep it scoped to this one page, never to other editorial galleries.
      if (root.classList.contains('is-immersive')) {
        const rect = entries[closest].getBoundingClientRect();
        const distance = Math.max(1, rect.height + global.innerHeight);
        const progress = clamp((global.innerHeight - rect.top) / distance, 0, 1);
        root.style.setProperty('--place-photo-zoom', String((1.025 + progress * .055).toFixed(4)));
      }
    }
    function scheduleIndex() { if (!raf) raf = global.requestAnimationFrame(updateIndex); }

    function choose(index) {
      index = clamp(index, 0, Math.min(thumbs.length, features.length) - 1);
      selected = index;
      thumbs.forEach((el, i) => {
        el.setAttribute('aria-pressed', String(i === index));
        el.classList.toggle('is-active', i === index);
      });
      features.forEach((el, i) => { el.classList.toggle('is-active', i === index); });
      const item = thumbs[index];
      if (item && featureTitle) featureTitle.textContent = item.dataset.title || '';
      if (item && featureCategory) featureCategory.textContent = item.dataset.category || '';
      if (featureNumber) featureNumber.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(thumbs.length).padStart(2, '0');
    }

    function updateCompare(val) {
      const p = clamp(Number(val) || 0, 5, 95);
      if (compare) compare.style.setProperty('--atg1-split', `${p}%`);
      if (range) range.setAttribute('aria-valuetext', `${p}% de la perspectiva izquierda`);
      if (compareValue) compareValue.textContent = `${p}%`;
    }

    applyReduced();
    if (entries.length) {
      setIndex(0);
      // ATREZZO Hodnett adaptation: mouse and keyboard previews complement native scroll.
      entries.forEach((entry,i)=>{
        entry.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')setIndex(i);},{signal:abort.signal});
        entry.addEventListener('focusin',()=>setIndex(i),{signal:abort.signal});
      });
      global.addEventListener('scroll', scheduleIndex, {passive: true, signal: abort.signal});
      global.addEventListener('resize', scheduleIndex, {passive: true, signal: abort.signal});
      scheduleIndex();
    }
    thumbs.forEach((button, i) => {
      button.addEventListener('click', () => choose(i), { signal: abort.signal });
      // Arrow keys behave like a roving thumbnail gallery without trapping Tab.
      button.addEventListener('keydown', e => {
        if (!['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) return;
        e.preventDefault();
        let next = e.key === 'Home' ? 0 : e.key === 'End' ? thumbs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + thumbs.length) % thumbs.length;
        thumbs[next].focus(); choose(next);
      }, {signal: abort.signal});
    });
    if (range) {
      updateCompare(range.value);
      range.addEventListener('input', e => updateCompare(e.target.value), {signal: abort.signal});
    }
    media.addEventListener('change', () => {applyReduced();scheduleIndex();}, {signal: abort.signal});
    const api = {
      refresh() { scheduleIndex(); updateCompare(range ? range.value : 50); },
      select(index) { choose(index); },
      setReduced(value) { forced = value === null ? null : Boolean(value); applyReduced();scheduleIndex(); },
      destroy() {
        if (destroyed) return;
        destroyed = true; abort.abort(); global.cancelAnimationFrame(raf);
        root.classList.remove('is-reduced'); instances.delete(root);
      }
    };
    instances.set(root, api);
    return api;
  }
  global.AtrezzoEditorialGallery01 = Object.freeze({init});
})(window);
