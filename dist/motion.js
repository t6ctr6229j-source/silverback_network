/* Decorative movement only. Content, navigation and forms do not depend on this file. */
(() => {
  'use strict';

  const root = document.documentElement;
  const hero = document.querySelector('.hero-art');
  if (!hero) return;
  const paths = [...hero.querySelectorAll('[data-wire-path]')];
  const marquee = document.querySelector('.customer-marquee');
  const controls = [...document.querySelectorAll('[data-motion-toggle], .marquee-toggle')];
  const reveals = [...document.querySelectorAll('[data-motion-reveal]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const preferenceKey = 'silverback.motion-paused.v1';
  let manuallyPaused = false;
  try { manuallyPaused = localStorage.getItem(preferenceKey) === 'true'; } catch { /* Optional preference storage. */ }
  let state = 'paused';
  let frameId = 0;
  let lastFrame = 0;
  let renderedAt = 0;
  let activeTime = 0;

  const wireCanMove = () => state === 'active' && !document.hidden && hero.dataset.motionVisible === 'true';

  function drawWire(seconds) {
    const sway = Math.sin(seconds * .36);
    const counter = Math.sin(seconds * .28 + .6);
    const d = `M -70 ${300 + sway * 12} C ${80 + counter * 16} ${500 - sway * 24} ${95 - sway * 16} ${80 + counter * 22} ${270 + sway * 14} ${128 + counter * 16} C ${430 - counter * 12} ${172 - sway * 25} ${405 + sway * 16} ${430 + counter * 18} 670 ${275 - sway * 14}`;
    paths.forEach(path => path.setAttribute('d', d));
  }

  function frame(now) {
    frameId = 0;
    if (!wireCanMove()) { lastFrame = 0; return; }
    if (lastFrame) activeTime += Math.min(now - lastFrame, 64);
    lastFrame = now;
    // A single small SVG at 30 fps; no canvas, video or third-party renderer.
    if (now - renderedAt >= 32) {
      drawWire(activeTime / 1000);
      renderedAt = now;
    }
    frameId = requestAnimationFrame(frame);
  }

  function syncFrame() {
    if (wireCanMove() && !frameId) {
      lastFrame = 0;
      frameId = requestAnimationFrame(frame);
    } else if (!wireCanMove() && frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
      lastFrame = 0;
    }
  }

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
      hero.style.removeProperty('--wire-x');
      hero.style.removeProperty('--wire-y');
    }
    syncFrame();
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
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    lastFrame = 0;
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
      syncFrame();
    }, { threshold: 0.08 });
    visibleTargets.forEach(element => observer.observe(element));
  } else {
    visibleTargets.forEach(element => { element.dataset.motionVisible = 'true'; });
    reveals.forEach(reveal);
    syncFrame();
  }

  hero.addEventListener('pointermove', event => {
    if (!wireCanMove() || !finePointer.matches || event.pointerType === 'touch') return;
    const bounds = hero.getBoundingClientRect();
    hero.style.setProperty('--wire-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 12}px`);
    hero.style.setProperty('--wire-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 8}px`);
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    hero.style.removeProperty('--wire-x');
    hero.style.removeProperty('--wire-y');
  });

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
      if (wireCanMove()) hero.classList.add('is-discovered');
      messageTimer = setTimeout(() => {
        message.textContent = '';
        hero.classList.remove('is-discovered');
      }, 5000);
    });
  }
})();
