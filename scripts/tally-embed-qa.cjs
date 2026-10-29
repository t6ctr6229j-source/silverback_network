// Inspect actual consent-gated Tally iframes on the public brand websites.
// Never submit form data or accept analytics cookies.
const { chromium } = require('playwright');

const websites = [
  { name: 'wescaleIT Kontakt', url: 'https://wescaleit.com/kontakt', selector: '[data-form-load]', container: '#contact-form-embed', decline: '[data-statistics-deny]', count: 1 },
  { name: 'Silverback Kontakt', url: 'https://www.silverback-network.com/', selector: '.form-load', container: '.form-embed', decline: '[data-analytics-deny]', count: 1 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const site of websites) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, locale: 'de-DE' });
      const response = await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (response?.status() !== 200) throw new Error(site.name + ': HTTP ' + response?.status());
      // Respect privacy: dismiss optional analytics without enabling tracking.
      // wescaleIT uses a modal consent dialog that otherwise intercepts form clicks.
      if (site.decline) {
        const refuse = page.locator(site.decline).first();
        if (await refuse.isVisible()) await refuse.click();
      }
      const buttons = page.locator(site.selector);
      await buttons.first().waitFor({ state: 'visible', timeout: 20000 });
      const count = await buttons.count();
      if (count !== site.count) throw new Error(site.name + ': expected exactly ' + site.count + ' consent-gated forms, got ' + count);
      for (let i = 0; i < site.count; i++) {
        await buttons.nth(i).click({ timeout: 20000 });
        const parent = page.locator(site.container).nth(i);
        const iframe = parent.locator('iframe');
        await iframe.waitFor({ state: 'attached', timeout: 20000 });
        const frame = await iframe.elementHandle().then(el => el.contentFrame());
        if (!frame) throw new Error(site.name + ': embedded frame missing');
        await frame.waitForLoadState('domcontentloaded', { timeout: 20000 });
        await frame.waitForLoadState('networkidle', { timeout: 9000 }).catch(() => {});
        const text = await frame.locator('body').innerText().catch(() => '');
        const badge = /Made with Tally|Powered by Tally/i.test(text);
        const url = frame.url();
        const loaded = url.startsWith('https://tally.so/embed/');
        console.log(JSON.stringify({ site: site.name, index: i + 1, iframeLoaded: loaded, badgeVisible: badge, formTextLength: text.length }));
        if (!loaded || badge || text.length < 30) throw new Error(site.name + ': empty or branded embedded form #' + (i + 1));
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log('PASS: all consent-gated wescaleIT and Silverback embedded forms are brand-free and usable.');
})().catch(e => { console.error(e); process.exitCode = 1; });
