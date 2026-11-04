/* ATREZZO TRANSITIONS 01 preflight — place in <head> before page markup. */
(function () {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var pending = JSON.parse(sessionStorage.getItem('atrezzo.transitions.pending.v1') || 'null');
    if (!pending || !pending.time || Date.now() - pending.time > 15000) return;
    if (pending.to !== location.pathname + location.search) return;
    document.documentElement.classList.add('atz-arrival-pending');
  } catch (_) { /* Navigation works normally without sessionStorage. */ }
})();
