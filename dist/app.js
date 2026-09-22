const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
matchMedia('(min-width: 761px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

// Load each external form only after the visitor's explicit choice.
document.querySelectorAll('.form-card').forEach(card => {
  const load = card.querySelector('.form-load');
  const unload = card.querySelector('.form-unload');
  const container = card.querySelector('.form-embed');
  load.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://tally.so/embed/${card.dataset.formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`;
    iframe.title = card.querySelector('h3').textContent;
    iframe.referrerPolicy = 'no-referrer';
    iframe.height = '1250';
    container.replaceChildren(iframe);
    container.hidden = false;
    load.setAttribute('aria-expanded', 'true');
    card.querySelector('.form-consent').hidden = true;
    unload.hidden = false;
    iframe.addEventListener('load', () => iframe.focus(), { once: true });
  });
  unload.addEventListener('click', () => {
    container.replaceChildren();
    container.hidden = true;
    unload.hidden = true;
    card.querySelector('.form-consent').hidden = false;
    load.setAttribute('aria-expanded', 'false');
    load.focus();
  });
});

window.addEventListener('message', event => {
  if (event.origin !== 'https://tally.so') return;
  const frame = [...document.querySelectorAll('.form-embed iframe')].find(item => item.contentWindow === event.source);
  if (!frame) return;
  let data = event.data;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { return; }
  }
  if (data?.event !== 'Tally.FormHeight' || data.payload?.formId !== frame.closest('.form-card').dataset.formId) return;
  const height = Number(data.payload.height);
  if (Number.isFinite(height) && height > 0) frame.height = String(Math.min(6000, Math.max(400, height)));
});

const marquee = document.querySelector('.customer-marquee');
const marqueeToggle = document.querySelector('.marquee-toggle');
marqueeToggle?.addEventListener('click', () => {
  const paused = marquee.classList.toggle('is-paused');
  marqueeToggle.setAttribute('aria-pressed', String(paused));
  marqueeToggle.textContent = paused ? 'Animation fortsetzen' : 'Animation pausieren';
});
