/* Progressive contact shortcuts. No storage, requests or analytics. */
(() => {
  const dock = document.querySelector('[data-contact-dock]');
  if (!dock) return;
  const consent = document.getElementById('analytics-consent');
  const formAreas = [...document.querySelectorAll('.forms, .form-card, form, .form-embed')];
  const intersectsViewport = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
  };
  const update = () => {
    const consentOpen = consent && !consent.hidden;
    const editing = document.activeElement?.matches('input,textarea,select,[contenteditable="true"],iframe');
    dock.hidden = Boolean(consentOpen || editing || formAreas.some(intersectsViewport));
  };
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; update(); });
  };
  if (consent) new MutationObserver(update).observe(consent, { attributes: true, attributeFilter: ['hidden'] });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('focusin', update);
  document.addEventListener('focusout', schedule);
  window.addEventListener('pageshow', update);
  update();
})();
