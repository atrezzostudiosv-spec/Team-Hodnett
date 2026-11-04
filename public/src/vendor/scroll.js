/* ATREZZO SCROLL SECTIONS 02 — 1.0.0
 * Own dependency-free implementation: native scroll, rAF, scoped CSS variables.
 * Install: window.AtrezzoScrollSections02.init(rootElement)
 * Lifecycle: refresh(), setReduced(bool), destroy()
 */
(function (global) {
  'use strict';
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const range = (p, start, end) => ease((p - start) / (end - start));
  const round = value => Math.round(value * 1000) / 1000;
  const write = (el, prop, value) => el.style.setProperty(prop, String(value));

  function renderScene(scene, p) {
    const kind = scene.getAttribute('data-ats2-effect');
    scene.dataset.ats2Progress = p.toFixed(3); // Diagnostics only; never read for animation.
    if (kind === 'handoff') {
      const reveal = range(p, 0.13, 0.81);
      const firstExit = range(p, 0.18, 0.40);
      const secondEntry = range(p, 0.69, 0.87);
      write(scene, '--ats2-wipe', `${round((1 - reveal) * 100)}%`);
      write(scene, '--ats2-edge', `${round(reveal * 100)}%`);
      write(scene, '--ats2-first-copy', round(1 - firstExit));
      write(scene, '--ats2-first-shift', `${round(-30 * firstExit)}px`);
      write(scene, '--ats2-second-copy', round(secondEntry));
      write(scene, '--ats2-first-scale', round(1 + 0.11 * range(p, 0.1, 0.9)));
      write(scene, '--ats2-second-scale', round(1.15 - 0.15 * reveal));
      write(scene, '--ats2-number', p < 0.52 ? '"01 / 02"' : '"02 / 02"');
    } else if (kind === 'film') {
      const track = scene.querySelector('.ats2-film-track');
      const viewport = scene.querySelector('.ats2-film-viewport');
      if (!track || !viewport) return;
      const distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const travel = range(p, .04, .96);
      write(scene, '--ats2-film-x', `${round(-distance * travel)}px`);
      const frames = scene.querySelectorAll('.ats2-film-frame');
      const active = Math.min(frames.length - 1, Math.max(0, Math.round(travel * (frames.length - 1))));
      scene.dataset.ats2Active = String(active + 1);
      // The marker is decorative and aria-hidden; do not announce every scroll update.
    } else if (kind === 'depth') {
      const second = range(p, .16, .53);
      const third = range(p, .52, .89);
      write(scene, '--ats2-depth-second', `${round((1 - second) * 100)}%`);
      write(scene, '--ats2-depth-third', `${round((1 - third) * 100)}%`);
      write(scene, '--ats2-depth-a-scale', round(1 - .10 * second));
      write(scene, '--ats2-depth-b-scale', round(1.08 - .08 * second - .10 * third));
      write(scene, '--ats2-depth-c-scale', round(1.08 - .08 * third));
      write(scene, '--ats2-depth-a-dim', round(1 - .6 * second));
      write(scene, '--ats2-depth-b-dim', round(1 - .5 * third));
      write(scene, '--ats2-depth-a-copy', round(1 - range(p, .15, .34)));
      write(scene, '--ats2-depth-b-copy', round(range(p, .33, .47) * (1 - range(p, .55, .73))));
      write(scene, '--ats2-depth-c-copy', round(range(p, .71, .88)));
      scene.dataset.ats2Active = String(p < .40 ? 1 : p < .76 ? 2 : 3);
    }
  }
  function init(root, options) {
    options = options || {};
    if (typeof root === 'string') root = global.document.querySelector(root);
    if (!root || !root.classList || !root.classList.contains('ats2-scope')) {
      throw new Error('ATREZZO Scroll Sections 02: init requires an element with class ats2-scope');
    }
    if (root.__atrezzoScrollSections02) return root.__atrezzoScrollSections02;
    const scenes = Array.from(root.querySelectorAll('.ats2-scene[data-ats2-effect]'));
    const media = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)');
    let manualReduced = !!options.reduced;
    let destroyed = false;
    let pending = false;
    let active = false;
    let observer = null;
    const images = Array.from(root.querySelectorAll('img'));
    const isReduced = () => manualReduced || !!(media && media.matches);
    function update() {
      pending = false;
      if (destroyed || !active) return;
      const h = Math.max(1, global.innerHeight);
      for (const scene of scenes) {
        const rect = scene.getBoundingClientRect();
        if (rect.bottom < -h || rect.top > h * 2) continue;
        const distance = Math.max(1, rect.height - h);
        renderScene(scene, clamp(-rect.top / distance));
      }
    }
    function refresh() {
      if (!pending && !destroyed) {
        pending = true;
        global.requestAnimationFrame(update);
      }
    }
    function sync() {
      active = !isReduced() && typeof global.requestAnimationFrame === 'function';
      root.classList.toggle('ats2-enhanced', active);
      root.classList.toggle('ats2-reduced', !active);
      if (!active) {
        for (const scene of scenes) {
          for (let i = scene.style.length - 1; i >= 0; i--) {
            const prop = scene.style[i];
            if (prop.startsWith('--ats2-')) scene.style.removeProperty(prop);
          }
          delete scene.dataset.ats2Progress;
        }
      }
      refresh();
    }
    const onMotionChanged = () => sync();
    global.addEventListener('scroll', refresh, { passive: true });
    global.addEventListener('resize', refresh, { passive: true });
    global.addEventListener('pageshow', refresh);
    if (media) {
      if (media.addEventListener) media.addEventListener('change', onMotionChanged);
      else if (media.addListener) media.addListener(onMotionChanged);
    }
    for (const img of images) {
      if (!img.complete) img.addEventListener('load', refresh, { passive: true });
    }
    if (typeof global.ResizeObserver === 'function') {
      observer = new global.ResizeObserver(refresh);
      scenes.forEach(scene => observer.observe(scene));
    }
    const api = {
      refresh,
      setReduced(value) { manualReduced = !!value; sync(); },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        global.removeEventListener('scroll', refresh);
        global.removeEventListener('resize', refresh);
        global.removeEventListener('pageshow', refresh);
        if (media) {
          if (media.removeEventListener) media.removeEventListener('change', onMotionChanged);
          else if (media.removeListener) media.removeListener(onMotionChanged);
        }
        for (const img of images) img.removeEventListener('load', refresh);
        if (observer) observer.disconnect();
        root.classList.remove('ats2-enhanced', 'ats2-reduced');
        scenes.forEach(scene => {
          for (let i = scene.style.length - 1; i >= 0; i--) {
            if (scene.style[i].startsWith('--ats2-')) scene.style.removeProperty(scene.style[i]);
          }
          delete scene.dataset.ats2Progress;
        });
        delete root.__atrezzoScrollSections02;
      }
    };
    root.__atrezzoScrollSections02 = api;
    sync();
    return api;
  }
  global.AtrezzoScrollSections02 = Object.freeze({ version: '1.0.0', init });
})(window);
