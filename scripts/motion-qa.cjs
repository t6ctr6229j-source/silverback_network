// Local-only browser checks. Analytics and Tally never receive QA data.
const { chromium, webkit } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');

const origin = 'https://www.silverback-network.com';
const root = path.resolve(__dirname, '../dist');
const output = process.env.MOTION_QA_OUTPUT || path.resolve(__dirname, '../qa-motion');

async function localContext(browser, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...options });
  context.setDefaultTimeout(20000);
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'tally.so') {
      await route.fulfill({ contentType: 'text/html', body: '<p>Local form loading check. No submission.</p>' });
      return;
    }
    if (url.hostname === 'www.googletagmanager.com') {
      await route.fulfill({ contentType: 'text/javascript', body: '' });
      return;
    }
    assert.equal(url.origin, origin, 'Unexpected external request: ' + url.href);
    const pathname = url.pathname === '/' ? '/index.html' : path.extname(url.pathname) ? url.pathname : url.pathname + '.html';
    const file = path.resolve(root, '.' + pathname);
    assert.ok(file.startsWith(root + path.sep));
    await route.fulfill({ path: file });
  });
  return context;
}

async function assertWireStill(page, reason) {
  const before = await page.locator('.wire-ribbon').getAttribute('d');
  await page.waitForTimeout(220);
  assert.equal(await page.locator('.wire-ribbon').getAttribute('d'), before, reason);
}

async function run(engineName, engine) {
  const browser = await engine.launch({ headless: true });
  const errors = [];
  try {
    const context = await localContext(browser);
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin);
    const consentScroll = await page.evaluate(() => scrollY);
    await page.locator('[data-analytics-deny]').click();
    await page.waitForTimeout(220);
    assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('[data-analytics-settings]')), true,
      'Consent must restore focus to its settings control');
    assert.ok(Math.abs(await page.evaluate(() => scrollY) - consentScroll) < 2,
      'Consent choice must not jump to the footer');
    await page.waitForFunction(() => document.documentElement.dataset.motionState === 'active');
    await page.waitForFunction(() => document.querySelector('.hero-art').dataset.motionVisible === 'true');
    const firstPath = await page.locator('.wire-ribbon').getAttribute('d');
    await page.waitForFunction(first => document.querySelector('.wire-ribbon').getAttribute('d') !== first, firstPath);

    // Real keyboard activation of the hidden joke, without navigation.
    await page.locator('.gorilla-trigger').focus();
    for (let n = 0; n < 3; n++) await page.keyboard.press('Enter');
    assert.equal(await page.locator('.gorilla-message').innerText(), 'Wir kennen da jemanden.');
    assert.equal(page.url(), origin + '/');
    await fs.mkdir(output, { recursive: true });
    await page.evaluate(() => document.activeElement?.blur());
    await page.locator('.hero-art').screenshot({ path: path.join(output, `${engineName}-egg-1440.png`), animations: 'disabled' });
    await page.locator('.gorilla-trigger').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.gorilla-message').innerText(), '');

    await page.locator('.open-ledger').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.open-ledger').classList.contains('is-revealing'));
    assert.equal(await page.locator('.open-ledger dl>div').first().evaluate(el => getComputedStyle(el).animationName), 'sb-ledger');
    assert.match(await page.locator('.ledger-note').first().innerText(), /100 € Expertenhonorar \+ 10 € Silverback-Anteil = 110 € pro Stunde/);

    // One global preference also stops the existing logo loop and survives reload.
    await page.locator('[data-motion-toggle]').click();
    assert.equal(await page.locator('html').getAttribute('data-motion-state'), 'paused');
    await assertWireStill(page, 'Paused wire still moves');
    assert.equal(await page.locator('.customer-logo-track').evaluate(el => getComputedStyle(el).animationName), 'none');
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-motion-state'), 'paused');
    await assertWireStill(page, 'Stored pause did not survive reload');
    await page.locator('[data-motion-toggle]').click();
    await page.locator('.customer-marquee').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.customer-marquee').dataset.motionVisible === 'true');
    await page.locator('.marquee-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-motion-state'), 'paused');
    await page.locator('.marquee-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-motion-state'), 'active');

    // Off-screen animation must not consume frames, and returns when visible again.
    await page.locator('#anfrage-formular').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.hero-art').dataset.motionVisible === 'false');
    await assertWireStill(page, 'Off-screen wire still moves');
    assert.equal(await page.locator('.customer-logo-track').evaluate(el => getComputedStyle(el).animationPlayState), 'paused');
    await page.locator('.hero-art').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.hero-art').dataset.motionVisible === 'true');

    // Simulate the Page Visibility event: browsers do not reliably background headless tabs.
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await assertWireStill(page, 'Hidden page still schedules the wire');
    assert.equal(await page.locator('html').getAttribute('data-page-hidden'), 'true');
    assert.equal(await page.locator('.customer-logo-track').evaluate(el => getComputedStyle(el).animationPlayState), 'paused');
    await page.evaluate(() => {
      delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    const resumedPath = await page.locator('.wire-ribbon').getAttribute('d');
    await page.waitForFunction(first => document.querySelector('.wire-ribbon').getAttribute('d') !== first, resumedPath);

    // A changed operating-system preference stops movement immediately and takes priority.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.documentElement.dataset.motionState === 'reduced');
    await assertWireStill(page, 'Reduced-motion wire still moves');
    assert.equal(await page.locator('[data-motion-toggle]').isDisabled(), true);
    assert.equal(await page.locator('.customer-logo-track').evaluate(el => getComputedStyle(el).animationName), 'none');
    await page.locator('.gorilla-trigger').focus();
    for (let n = 0; n < 3; n++) await page.keyboard.press('Enter');
    assert.equal(await page.locator('.gorilla-message').innerText(), 'Wir kennen da jemanden.');
    assert.equal(await page.locator('.gorilla-window img').evaluate(el => getComputedStyle(el).animationName), 'none');
    await page.keyboard.press('Enter');

    await fs.mkdir(output, { recursive: true });
    await page.evaluate(() => document.activeElement?.blur());
    for (const width of [1440, 1024, 800, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const measures = await page.evaluate(() => {
        const card = document.querySelector('.form-card').getBoundingClientRect();
        const button = document.querySelector('.form-load').getBoundingClientRect();
        return { overflow: document.documentElement.scrollWidth > innerWidth,
          buttonFits: button.left >= card.left - 2 && button.right <= card.right + 2,
          forms: document.querySelectorAll('.form-card').length,
          copyVisible: getComputedStyle(document.querySelector('.hero-copy')).opacity === '1' };
      });
      assert.equal(measures.overflow, false, engineName + ' overflows at ' + width);
      assert.equal(measures.buttonFits, true, 'Form button clips at ' + width);
      assert.equal(measures.forms, 1, 'Unified form was duplicated');
      assert.equal(measures.copyVisible, true, 'Reduced-motion content was hidden');
      if (width === 1440 || width === 390) {
        for (const [name, selector] of [['hero', '.hero'], ['books', '#open-books'], ['team', '#team']]) {
          await page.locator(selector).screenshot({ path: path.join(output, `${engineName}-${name}-${width}.png`), animations: 'disabled' });
        }
      }
    }
    assert.equal(await page.locator('[data-form-id="LDDoxJ"]').count(), 1);
    assert.equal(await page.locator('.form-embed iframe').count(), 0);
    await page.locator('.form-load').click();
    assert.equal(await page.locator('.form-embed iframe').count(), 1);
    assert.match(await page.locator('.form-embed iframe').getAttribute('src'), /\/embed\/LDDoxJ\?/);
    await page.locator('.form-unload').click();
    assert.equal(await page.locator('.form-embed iframe').count(), 0);

    // A touch viewport keeps the band inside the art and does not add mouse tracking.
    const touchContext = await localContext(browser, { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const touch = await touchContext.newPage();
    touch.on('pageerror', error => errors.push(error.message));
    await touch.goto(origin);
    await touch.locator('[data-analytics-deny]').click();
    await touch.locator('.hero-art').scrollIntoViewIfNeeded();
    await touch.locator('.hero-art').dispatchEvent('pointermove', { pointerType: 'touch', clientX: 200, clientY: 300 });
    assert.equal(await touch.locator('.hero-art').evaluate(el => el.style.getPropertyValue('--wire-x')), '');
    assert.equal(await touch.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await touchContext.close();

    const noJS = await localContext(browser, { javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const staticPage = await noJS.newPage();
    await staticPage.goto(origin);
    assert.match(await staticPage.locator('h1').innerText(), /Staffing/);
    assert.equal(await staticPage.locator('.hero-copy').evaluate(el => getComputedStyle(el).opacity), '1');
    assert.equal(await staticPage.locator('.hero-art').evaluate(el => getComputedStyle(el).opacity), '1');
    assert.equal(await staticPage.locator('.customer-logo-track').evaluate(el => getComputedStyle(el).animationName), 'none');
    assert.equal(await staticPage.locator('.open-ledger').isVisible(), true);
    assert.equal(await staticPage.locator('.form-fallback a').getAttribute('href'), 'https://tally.so/r/LDDoxJ');
    assert.equal(await staticPage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await noJS.close();
    assert.deepEqual(errors, [], engineName + ' JavaScript errors');
    await context.close();
    console.log(`PASS ${engineName}: real motion; global and remembered pause; off-screen and visibility pause; OS preference; keyboard Easter egg; touch; 320–1440px layout; no-JS content; one consent-gated Tally form.`);
  } finally {
    await browser.close();
  }
}

(async () => {
  const names = (process.env.MOTION_QA_BROWSERS || 'chromium').split(',');
  for (const name of names) {
    assert.ok(['chromium', 'webkit'].includes(name), 'Unknown browser ' + name);
    await run(name, name === 'webkit' ? webkit : chromium);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
