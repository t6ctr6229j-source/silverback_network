// Read-only verification of the published Tally Pro forms.
// Never send form data or change respondent settings.
const { chromium } = require('playwright');

const forms = [
  ['wescaleIT Kontakt', 'ja1WdE'],
  ['Silverback Projekt', 'pbgYgP'],
  ['Silverback Experten', 'yPO8Od'],
  ['Silverback Gemeinsame Anfrage', 'LDDoxJ'],
  ['Psoydo Pilot', 'KppMYg'],
  ['FCTH Kontakt', '44Z4Mo'],
  ['FCTH Game', '0Q4bE0'],
  ['FCTH Goldenes Ticket', 'jaKaR9'],
  ['FCTH Session', 'eqbqJo'],
  ['FCTH Hoerbuch', 'rjXj4L'],
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const [name, id] of forms) {
      const page = await browser.newPage({ viewport: { width: 1100, height: 850 }, locale: 'de-DE' });
      const response = await page.goto('https://tally.so/r/' + id, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      const state = await page.evaluate(() => {
        const text = document.body?.innerText || '';
        const pattern = /Made with Tally|Powered by Tally/i;
        const matches = [...document.querySelectorAll('a, button, footer, [class*="branding"], [class*="powered"]')]
          .filter(el => pattern.test(el.innerText || '') && el.getBoundingClientRect().width > 0 &&
                        el.getBoundingClientRect().height > 0 &&
                        getComputedStyle(el).visibility !== 'hidden' &&
                        getComputedStyle(el).display !== 'none');
        return { badgeCount: matches.length, mentionsBranding: pattern.test(text), headingPresent: !!document.querySelector('h1, h2, input, textarea, [role="form"]') };
      });
      results.push({ name, id, status: response?.status(), ...state });
      console.log(JSON.stringify(results[results.length - 1]));
      await page.close();
    }
  } finally {
    await browser.close();
  }
  if (results.some(x => x.status !== 200 || x.badgeCount > 0 || x.mentionsBranding || !x.headingPresent)) {
    throw new Error('At least one published form still shows Tally branding, cannot load, or has missing UI');
  }
  console.log('PASS: all published Tally Pro forms have no visible Made with Tally / Powered by Tally badge.');
})().catch(error => { console.error(error); process.exitCode = 1; });
