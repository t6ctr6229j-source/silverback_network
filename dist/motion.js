/* Decorative movement only. Content, navigation and forms do not depend on this file. */
(() => {
  'use strict';

  const root = document.documentElement;
  const hero = document.querySelector('.hero-art');
  if (!hero) return;
  const marquee = document.querySelector('.customer-marquee');
  const controls = [...document.querySelectorAll('[data-motion-toggle], .marquee-toggle')];
  const reveals = [...document.querySelectorAll('[data-motion-reveal]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const preferenceKey = 'silverback.motion-paused.v1';
  let manuallyPaused = false;
  try { manuallyPaused = localStorage.getItem(preferenceKey) === 'true'; } catch { /* Optional preference storage. */ }
  let state = 'paused';

  const heroCanAnimate = () => state === 'active' && !document.hidden && hero.dataset.motionVisible === 'true';

  function syncState() {
    state = reduced.matches ? 'reduced' : manuallyPaused ? 'paused' : 'active';
    root.dataset.motionState = state;
    root.dataset.pageHidden = String(document.hidden);
    controls.forEach(button => {
      button.hidden = false;
      button.disabled = state === 'reduced';
      button.setAttribute('aria-pressed', String(state !== 'active'));
      button.textContent = state === 'reduced' ? 'Bewegung reduziert' : state === 'paused' ? 'Bewegung fortsetzen' : 'Bewegung pausieren';
      if (state === 'reduced') button.title = 'Die Einstellung für reduzierte Bewegung auf deinem Gerät ist aktiv.';
      else button.removeAttribute('title');
    });
    marquee?.classList.toggle('is-paused', state !== 'active');
    if (state !== 'active') {
      reveals.forEach(element => element.classList.remove('is-revealing'));
      hero.classList.remove('is-discovered');
    }
    window.dispatchEvent(new CustomEvent('silverback:motionchange', {
      detail: { enabled: state === 'active' && !document.hidden, reduced: reduced.matches, paused: manuallyPaused }
    }));
  }

  controls.forEach(button => button.addEventListener('click', () => {
    if (reduced.matches) return;
    manuallyPaused = !manuallyPaused;
    try { localStorage.setItem(preferenceKey, String(manuallyPaused)); } catch { /* Session still works. */ }
    syncState();
  }));
  reduced.addEventListener('change', syncState);
  document.addEventListener('visibilitychange', syncState);
  window.addEventListener('pagehide', () => {
    root.dataset.pageHidden = 'true';
  });
  window.addEventListener('pageshow', syncState);
  window.addEventListener('storage', event => {
    if (event.key !== preferenceKey) return;
    manuallyPaused = event.newValue === 'true';
    syncState();
  });

  function reveal(element) {
    if (element.classList.contains('is-seen')) return;
    element.classList.add('is-seen');
    if (state !== 'active' || document.hidden) return;
    element.classList.add('is-revealing');
    // Every entrance has finished by this point. The final content is always the baseline.
    setTimeout(() => element.classList.remove('is-revealing'), 1500);
  }

  const visibleTargets = [hero, marquee, ...reveals].filter(Boolean);
  visibleTargets.forEach(element => { element.dataset.motionVisible = 'false'; });
  syncState();
  root.classList.add('motion-ready');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.dataset.motionVisible = String(entry.isIntersecting);
        if (entry.isIntersecting && entry.target.hasAttribute('data-motion-reveal')) reveal(entry.target);
      });
    }, { threshold: 0.08 });
    visibleTargets.forEach(element => observer.observe(element));
  } else {
    visibleTargets.forEach(element => { element.dataset.motionVisible = 'true'; });
    reveals.forEach(reveal);
  }

  const trigger = hero.querySelector('.gorilla-trigger');
  const message = hero.querySelector('.gorilla-message');
  let taps = 0;
  let lastTap = 0;
  let messageTimer = 0;
  if (trigger && message) {
    trigger.disabled = false;
    trigger.addEventListener('click', () => {
      if (message.textContent) {
        message.textContent = '';
        hero.classList.remove('is-discovered');
        clearTimeout(messageTimer);
        taps = 0;
        return;
      }
      const now = Date.now();
      taps = now - lastTap > 2500 ? 1 : taps + 1;
      lastTap = now;
      if (taps < 3) return;
      taps = 0;
      message.textContent = 'Wir kennen da jemanden.';
      if (heroCanAnimate()) hero.classList.add('is-discovered');
      messageTimer = setTimeout(() => {
        message.textContent = '';
        hero.classList.remove('is-discovered');
      }, 5000);
    });
  }
})();
