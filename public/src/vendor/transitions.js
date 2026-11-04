/*
 * ATREZZO TRANSITIONS 01 — Original implementation by Atrezzo Studios / ChatGPT.
 * Version 1.0.0 | No runtime dependencies | Uses Web Animations API.
 * Scope: full-document transitions and same-document content swaps.
 * Do not confuse this module with the Codrops Interlude implementation.
 */
(function (global) {
  'use strict';

  const PENDING_KEY = 'atrezzo.transitions.pending.v1';
  const EFFECTS = new Set(['veil', 'split', 'iris']);
  const DURATION = Object.freeze({ cover: 480, reveal: 560 });
  const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';

  function prefersReducedMotion() {
    return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function safeSession(action) {
    try { return action(global.sessionStorage); } catch (_) { return null; }
  }
  function nextPaint() {
    return new Promise(resolve => global.requestAnimationFrame(() => global.requestAnimationFrame(resolve)));
  }
  function normalizeEffect(effect, defaultEffect) {
    return EFFECTS.has(effect) ? effect : defaultEffect;
  }
  function toPath(url) {
    return url.pathname + url.search;
  }
  function consumeArrival() {
    const raw = safeSession(store => {
      const value = store.getItem(PENDING_KEY);
      store.removeItem(PENDING_KEY);
      return value;
    });
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      if (!data || !Number.isFinite(data.time) || Date.now() - data.time > 15000 || Date.now() < data.time - 5000) return null;
      if (data.to !== toPath(new URL(global.location.href))) return null;
      return data;
    } catch (_) { return null; }
  }

  class AtrezzoTransitions {
    constructor(options = {}) {
      this.options = {
        selector: options.selector || 'a[data-atz-link]',
        defaultEffect: normalizeEffect(options.defaultEffect, 'veil'),
        coverColor: options.coverColor || '#151b22',
        coverMs: Number.isFinite(options.coverMs) ? Math.max(0, Math.min(options.coverMs, 1600)) : DURATION.cover,
        revealMs: Number.isFinite(options.revealMs) ? Math.max(0, Math.min(options.revealMs, 1600)) : DURATION.reveal,
        intercept: options.intercept !== false,
        showLabel: options.showLabel === true, // off in client websites by default
        brandName: String(options.brandName || '').slice(0, 60),
        onBeforeNavigate: typeof options.onBeforeNavigate === 'function' ? options.onBeforeNavigate : null,
      };
      this.busy = false;
      this.overlay = null;
      this.activeAnimations = [];
      this._boundClick = this._onClick.bind(this);
      this._boundPageShow = this._onPageShow.bind(this);
      this._boundMotion = this._onMotionChange.bind(this);
      this._motionQuery = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
      this._initOverlay();
      if (this.options.intercept) document.addEventListener('click', this._boundClick);
      global.addEventListener('pageshow', this._boundPageShow);
      if (this._motionQuery && this._motionQuery.addEventListener) this._motionQuery.addEventListener('change', this._boundMotion);
      this._arrival = consumeArrival();
      if (!this._arrival || prefersReducedMotion()) {
        document.documentElement.classList.remove('atz-arrival-pending');
      } else {
        this.busy = true;
        this._revealArrival(this._arrival);
      }
    }

    _initOverlay() {
      const layer = document.createElement('div');
      layer.className = 'atz-transition-layer';
      layer.setAttribute('aria-hidden', 'true');
      layer.setAttribute('data-atz-effect', this.options.defaultEffect);
      layer.style.setProperty('--atz-color', this.options.coverColor);
      const primary = document.createElement('div'); primary.className = 'atz-transition-panel atz-transition-panel--primary';
      const secondary = document.createElement('div'); secondary.className = 'atz-transition-panel atz-transition-panel--secondary';
      const identity = document.createElement('div'); identity.className = 'atz-transition-identity';
      identity.innerHTML = '<span class="atz-transition-identity__eyebrow"></span><span class="atz-transition-identity__title"></span>';
      if (!this.options.showLabel) identity.hidden = true;
      identity.querySelector('.atz-transition-identity__eyebrow').textContent = this.options.brandName;
      layer.append(primary, secondary, identity);
      document.body.appendChild(layer);
      this.overlay = layer;
      this.panels = [primary, secondary];
      this.identity = identity;
      this.identityTitle = identity.querySelector('.atz-transition-identity__title');
    }

    _setScene(effect, label) {
      this.overlay.dataset.atzEffect = effect;
      this.overlay.style.setProperty('--atz-color', this.options.coverColor);
      this.identityTitle.textContent = this.options.showLabel ? String(label || '').slice(0, 40) : '';
      this.overlay.classList.add('atz-transition-layer--active');
      this._setPanels(effect, false);
    }

    _setPanels(effect, covered) {
      const [a, b] = this.panels;
      a.style.transform = '';
      b.style.transform = '';
      a.style.clipPath = '';
      if (effect === 'veil') a.style.transform = covered ? 'translateY(0)' : 'translateY(105%)';
      if (effect === 'split') {
        a.style.transform = covered ? 'translateX(0)' : 'translateX(-102%)';
        b.style.transform = covered ? 'translateX(0)' : 'translateX(102%)';
      }
      if (effect === 'iris') a.style.clipPath = covered ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)';
    }

    async _animate(effect, entering) {
      if (prefersReducedMotion() || !this.panels[0].animate) {
        this._setPanels(effect, entering);
        return;
      }
      const duration = entering ? this.options.coverMs : this.options.revealMs;
      const keyframes = [];
      if (effect === 'veil') {
        keyframes.push([this.panels[0], [{ transform: entering ? 'translateY(105%)' : 'translateY(0)' }, { transform: entering ? 'translateY(0)' : 'translateY(-105%)' }]]);
      } else if (effect === 'split') {
        keyframes.push([this.panels[0], [{transform: entering ? 'translateX(-102%)' : 'translateX(0)'},{transform: entering ? 'translateX(0)' : 'translateX(-102%)'}]]);
        keyframes.push([this.panels[1], [{transform: entering ? 'translateX(102%)' : 'translateX(0)'},{transform: entering ? 'translateX(0)' : 'translateX(102%)'}]]);
      } else {
        keyframes.push([this.panels[0], [{clipPath: entering ? 'circle(0% at 50% 50%)' : 'circle(150% at 50% 50%)'},{clipPath: entering ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)'}]]);
      }
      const animations = keyframes.map(([node, frames]) => node.animate(frames, {duration, easing: EASE, fill: 'forwards'}));
      this.activeAnimations.push(...animations);
      try { await Promise.all(animations.map(a => a.finished)); }
      catch (_) { /* Interruptions must not block navigation or hide content. */ }
      this.activeAnimations = this.activeAnimations.filter(a => !animations.includes(a));
      this._setPanels(effect, entering);
      animations.forEach(a => a.cancel());
    }

    async _cover(effect, label) {
      this._setScene(effect, label);
      await nextPaint();
      await this._animate(effect, true);
    }
    async _reveal(effect) {
      await nextPaint();
      await this._animate(effect, false);
      this.overlay.classList.remove('atz-transition-layer--active');
      this.identityTitle.textContent = '';
    }
    async _revealArrival(data) {
      const effect = normalizeEffect(data.effect, this.options.defaultEffect);
      try {
        this._setScene(effect, data.label);
        this._setPanels(effect, true);
        // The CSS preflight fallback is removed only AFTER the cover layer is in place.
        document.documentElement.classList.remove('atz-arrival-pending');
        await this._reveal(effect);
      } finally { this.busy = false; }
    }

    _onClick(event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest ? event.target.closest(this.options.selector) : null;
      if (!link || link.hasAttribute('download') || link.target && link.target !== '_self') return;
      let next;
      try { next = new URL(link.href, global.location.href); } catch (_) { return; }
      if (!['https:', 'http:', 'file:'].includes(next.protocol) || next.origin !== global.location.origin) return;
      if (toPath(next) === toPath(new URL(global.location.href))) return; // preserve same-document hash navigation
      event.preventDefault();
      if (this.busy) return;
      const effect = normalizeEffect(link.dataset.atzEffect, this.options.defaultEffect);
      this.navigate(next.href, {effect, label: link.dataset.atzLabel || link.textContent.trim()});
    }

    async navigate(url, settings = {}) {
      if (this.busy) return false;
      let next;
      try { next = new URL(url, global.location.href); } catch (_) { return false; }
      if (next.origin !== global.location.origin || !['https:', 'http:', 'file:'].includes(next.protocol)) return false;
      const effect = normalizeEffect(settings.effect, this.options.defaultEffect);
      const label = settings.label || '';
      const changeLocation = () => { global.location.assign(next.href); };
      if (prefersReducedMotion() || !this.panels[0].animate) { changeLocation(); return true; }
      this.busy = true;
      try {
        if (this.options.onBeforeNavigate) this.options.onBeforeNavigate(next);
        await this._cover(effect, label);
        safeSession(store => store.setItem(PENDING_KEY, JSON.stringify({to: toPath(next), effect, label: String(label).slice(0,40), time: Date.now()})));
        changeLocation();
        // Browser may reject navigation, e.g. a download or CSP restriction; restore usability.
        global.setTimeout(() => {
          if (this.busy && document.visibilityState === 'visible') {
            this._reveal(effect).finally(() => { this.busy = false; });
          }
        }, 1800);
        return true;
      } catch (error) {
        await this._reveal(effect);
        this.busy = false;
        changeLocation(); // navigation should always work if animations fail
        return true;
      }
    }

    /** Swap local content using the exact same visual engine; ideal for offline HTML preview. */
    async swap(update, settings = {}) {
      if (this.busy || typeof update !== 'function') return false;
      const effect = normalizeEffect(settings.effect, this.options.defaultEffect);
      const label = settings.label || '';
      this.busy = true;
      try {
        if (prefersReducedMotion() || !this.panels[0].animate) { await update(); return true; }
        await this._cover(effect, label);
        await update();
        await this._reveal(effect);
        return true;
      } finally {
        this.overlay.classList.remove('atz-transition-layer--active');
        this.busy = false;
      }
    }

    _onPageShow(event) {
      // Returning from the back/forward cache preserves the old DOM, including animations.
      if (!event.persisted) return;
      this.activeAnimations.forEach(animation => animation.cancel());
      this.activeAnimations = [];
      this.overlay.classList.remove('atz-transition-layer--active');
      this.busy = false;
      safeSession(store => store.removeItem(PENDING_KEY));
      document.documentElement.classList.remove('atz-arrival-pending');
    }
    _onMotionChange(event) {
      if (!event.matches) return;
      this.activeAnimations.forEach(animation => animation.cancel());
      this.activeAnimations = [];
      this.overlay.classList.remove('atz-transition-layer--active');
      document.documentElement.classList.remove('atz-arrival-pending');
      this.busy = false;
    }
    destroy() {
      document.removeEventListener('click', this._boundClick);
      global.removeEventListener('pageshow', this._boundPageShow);
      if (this._motionQuery && this._motionQuery.removeEventListener) this._motionQuery.removeEventListener('change', this._boundMotion);
      this.activeAnimations.forEach(animation => animation.cancel());
      if (this.overlay) this.overlay.remove();
      document.documentElement.classList.remove('atz-arrival-pending');
    }
  }
  global.AtrezzoTransitions = AtrezzoTransitions;
})(window);
