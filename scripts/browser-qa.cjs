const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const key = 'silverback.analytics-consent.v1';
  const origin = 'https://www.silverback-network.com';
  const root = path.resolve(__dirname, '../dist');
  const context = await browser.newContext();
  const google = [];
  const errors = [];
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'www.googletagmanager.com') {
      google.push(url.href);
      // Never send QA traffic to the real Analytics property.
      await route.fulfill({ contentType: 'text/javascript', body: 'window.analyticsTestLoaded = true;' });
      return;
    }
    if (url.hostname === 'tally.so') { await route.fulfill({ contentType: 'text/html', body: '<p>Mock form for consent check</p>' }); return; }
    assert.equal(url.origin, origin, 'Unexpected external request: ' + url.origin);
    const file = path.resolve(root, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
    assert.ok(file.startsWith(root + path.sep));
    await route.fulfill({ path: file });
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin);
  assert.equal(google.length, 0, 'Analytics must not load before consent');
  assert.equal(await page.locator('#analytics-consent').isVisible(), true);
  await page.click('[data-analytics-deny]');
  await page.reload();
  assert.equal(google.length, 0, 'Analytics must not load after rejection');
  assert.equal(await page.locator('#analytics-consent').isVisible(), false);

  for (const width of [1440, 1024, 800, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const bounds = await page.locator('.form-consent').evaluateAll(nodes => nodes.map(node => ({
      top: node.getBoundingClientRect().top, left: node.getBoundingClientRect().left
    })));
    if (width > 760) assert.ok(Math.abs(bounds[0].top - bounds[1].top) < 1, 'Forms misaligned at ' + width);
    else assert.ok(bounds[1].top > bounds[0].top, 'Mobile forms must stack');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Horizontal overflow at ' + width);
  }

  // The FAQ schema must describe exactly the visible questions and answers.
  const faq = await page.evaluate(() => {
    const graph = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
    return { schema: graph.find(x => x['@type'] === 'FAQPage').mainEntity.map(x => [x.name, x.acceptedAnswer.text]),
      visible: [...document.querySelectorAll('#fragen details')].map(x => [x.querySelector('summary').childNodes[0].textContent, x.querySelector('p').textContent]) };
  });
  assert.ok(faq.visible.length >= 5);
  assert.deepEqual(faq.schema, faq.visible);
  assert.equal(await page.locator('.form-embed iframe').count(), 0);
  for (const id of ['projekt-formular', 'experten-formular']) {
    await page.locator('#' + id + ' .form-load').click();
    assert.equal(await page.locator('.form-embed iframe').count(), 1, 'Only the chosen form loads');
    await page.locator('#' + id + ' .form-unload').click();
    assert.equal(await page.locator('.form-embed iframe').count(), 0);
  }
  await fs.mkdir('qa-screenshots', { recursive: true });
  for (const file of ['index.html', 'interim-manager-tagessatz.html', 'vermittlung-bei-silverback.html']) {
    await page.goto(origin + '/' + file);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), origin + (file === 'index.html' ? '/' : '/' + file));
    const links = await page.locator('a[href]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')));
    for (const href of links.filter(href => !/^(https?:|mailto:|tel:)/.test(href))) {
      const [target, fragment] = href.split('#');
      const content = await fs.readFile(path.join(root, target || file), 'utf8');
      if (fragment) assert.ok(content.includes('id="' + fragment + '"'), 'Missing target: ' + href);
    }
    await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.forEach(n => JSON.parse(n.textContent)));
    for (const width of [1440, 1024, 800, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, file + ' overflows at ' + width);
      if (width === 1440 || width === 390) {
        await page.screenshot({ path: 'qa-screenshots/' + file + '-' + width + '.png', fullPage: true, animations: 'disabled' });
      }
    }
  }
  await page.goto(origin);
  await page.click('[data-analytics-settings]');
  await page.click('[data-analytics-accept]');
  await page.waitForFunction(() => window.analyticsTestLoaded);
  assert.equal(google.length, 1);
  const commands = await page.evaluate(() => dataLayer.map(args => Array.from(args)));
  assert.equal(commands[0][0], 'consent');
  assert.equal(commands[0][2].analytics_storage, 'denied');
  assert.equal(commands[1][2].analytics_storage, 'granted');
  assert.equal(commands[0][2].ad_storage, 'denied');
  assert.equal(commands.find(command => command[0] === 'config')[1], 'G-RWGM8X6QGH');
  await context.addCookies([{ name: '_ga', value: 'test', domain: '.silverback-network.com', path: '/' }]);
  await page.click('[data-analytics-settings]');
  await Promise.all([page.waitForEvent('load'), page.click('[data-analytics-deny]')]);
  assert.equal(google.length, 1, 'Withdrawal must not reload Analytics');
  assert.ok(!(await context.cookies()).some(cookie => cookie.name.startsWith('_ga')));

  for (const file of ['impressum.html', 'datenschutz.html']) {
    await page.goto(origin + '/' + file);
    assert.equal(await page.locator('[data-analytics-settings]').count(), 1);
    await page.click('[data-analytics-settings]');
    assert.equal(await page.locator('#analytics-consent').isVisible(), true);
    await page.click('[data-analytics-deny]');
  }
  for (const stored of ['broken JSON', JSON.stringify({ choice: 'accepted', expires: Date.now() - 1 })]) {
    await page.evaluate(({ key, stored }) => localStorage.setItem(key, stored), { key, stored });
    await page.reload();
    assert.equal(google.length, 1, 'Invalid/expired consent must not load Analytics');
    assert.equal(await page.locator('#analytics-consent').isVisible(), true);
  }
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({ choice: 'accepted', expires: Date.now() + 60000 })), key);
  await page.reload();
  await page.waitForFunction(() => window.analyticsTestLoaded);
  assert.equal(google.length, 2, 'Valid remembered consent should load Analytics');

  const second = await context.newPage();
  await second.goto(origin);
  await second.waitForFunction(() => window.analyticsTestLoaded);
  const beforeWithdrawal = google.length;
  await second.click('[data-analytics-settings]');
  await Promise.all([page.waitForEvent('load'), second.waitForEvent('load'), second.click('[data-analytics-deny]')]);
  assert.equal(google.length, beforeWithdrawal, 'Withdrawal must apply to all open tabs');
  assert.equal(await page.evaluate(() => window['ga-disable-G-RWGM8X6QGH']), true);
  assert.deepEqual(errors, []);
  await browser.close();
  console.log('PASS: consent, rejection, withdrawal, storage expiry, cross-tab withdrawal, legal pages, desktop and mobile layout.');
})().catch(error => { console.error(error); process.exit(1); });

