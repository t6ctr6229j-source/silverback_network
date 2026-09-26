(() => {
  'use strict';
  const id = 'G-RWGM8X6QGH';
  const key = 'silverback.analytics-consent.v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const production = ['silverback-network.com', 'www.silverback-network.com'].includes(location.hostname);
  const panel = document.querySelector('#analytics-consent');
  const settings = document.querySelector('[data-analytics-settings]');
  if (!panel || !settings) return;
  let loaded = false;
  let expiryTimer;
  window['ga-disable-' + id] = true;

  function readChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      if (value && ['accepted', 'denied'].includes(value.choice) &&
          Number.isFinite(value.expires) && value.expires > Date.now() &&
          value.expires <= Date.now() + lifetime) return value;
    } catch { /* Storage can be unavailable. Default to no consent. */ }
    return null;
  }
  function clearCookies() {
    const domains = ['', location.hostname, 'silverback-network.com'];
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.trim().split('=')[0];
      if (!/^_ga(?:_|$)/.test(name)) return;
      domains.forEach(domain => {
        document.cookie = name + '=; Max-Age=0; Path=/' + (domain ? '; Domain=' + domain : '') + '; SameSite=Lax';
      });
    });
  }
  function showPanel() {
    panel.hidden = false;
    panel.querySelector('[data-analytics-deny]').focus();
  }
  function stop() {
    window['ga-disable-' + id] = true;
    clearTimeout(expiryTimer);
    clearCookies();
    // A fresh page removes all previously installed Google listeners as well.
    if (loaded) location.reload();
  }
  function start(expires) {
    if (!production || loaded) return;
    loaded = true;
    window['ga-disable-' + id] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    let referrer = '';
    try { const url = new URL(document.referrer); referrer = url.origin + url.pathname; } catch {}
    window.gtag('config', id, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: lifetime / 1000,
      cookie_update: false,
      page_location: location.origin + location.pathname,
      page_referrer: referrer
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.append(script);
  }
  function watchExpiry(expires) {
    clearTimeout(expiryTimer);
    const remaining = expires - Date.now();
    if (remaining <= 0) { stop(); showPanel(); return; }
    expiryTimer = setTimeout(() => watchExpiry(expires), Math.min(remaining, 2147483647));
  }
  function choose(choice) {
    const value = { choice, expires: Date.now() + lifetime };
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    panel.hidden = true;
    settings.focus();
    if (choice === 'accepted') start(value.expires);
    else stop();
    watchExpiry(value.expires);
  }
  panel.querySelector('[data-analytics-accept]').addEventListener('click', () => choose('accepted'));
  panel.querySelector('[data-analytics-deny]').addEventListener('click', () => choose('denied'));
  settings.addEventListener('click', showPanel);
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    const value = readChoice();
    if (value?.choice === 'accepted') start(value.expires);
    else stop();
    panel.hidden = Boolean(value);
    if (value) watchExpiry(value.expires);
  });
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
  const choice = readChoice();
  if (choice?.choice === 'accepted') start(choice.expires);
  else clearCookies();
  panel.hidden = Boolean(choice);
  if (choice) watchExpiry(choice.expires);
})();

