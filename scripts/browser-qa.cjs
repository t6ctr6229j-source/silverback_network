const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const publicPath = file => file === 'index.html' ? '/' : '/' + file.replace(/\.html$/, '');
const sourcePath = pathname => pathname === '/' ? '/index.html' : path.extname(pathname) ? pathname : pathname + '.html';

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
    const file = path.resolve(root, '.' + sourcePath(url.pathname));
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

  // Service discovery is a crawlable part of the document and remains usable on phones.
  assert.equal(await page.locator('#navigation a[href="#leistungen"]').count(), 1);
  assert.equal(await page.locator('.service-finder-main a').count(), 2);
  assert.equal(await page.locator('.service-finder-topics a').count(), 7);
  assert.equal(await page.locator('img:not([alt])').count(), 0);
  for (const width of [1440, 1024, 800, 390, 320]) {
    await page.setViewportSize({width,height:1000});
    await page.locator('#leistungen').scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false,
      'Service navigation must fit at '+width);
    for (const link of await page.locator('.service-finder-main a, .service-finder-topics a').all()) {
      assert.equal(await link.isVisible(), true);
      const box = await link.boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width + 1, 'Service link outside viewport');
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.locator('.menu-toggle').click();
  await page.locator('#navigation a[href="#leistungen"]').click();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
  await page.locator('.service-finder-topics a[href="/netapp-freelancer"]').click();
  assert.equal(new URL(page.url()).pathname, '/netapp-freelancer');
  await page.locator('.topic-breadcrumb a[href="/#leistungen"]').click();
  assert.equal(new URL(page.url()).hash, '#leistungen');
  await page.goBack();
  assert.equal(new URL(page.url()).pathname, '/netapp-freelancer');
  await page.goForward();
  assert.equal(new URL(page.url()).hash, '#leistungen');
  await page.goto(origin);

  // Disclosure signs are decorative UI, not semantic bold content.
  assert.equal(await page.locator('summary > .disclosure-icon[aria-hidden="true"]').count(), 10);
  assert.equal(await page.locator('summary > b').count(), 0);
  for (const summary of await page.locator('details > summary').all()) {
    const icon = summary.locator('.disclosure-icon');
    assert.equal(await icon.textContent(), '+');
    const style = await icon.evaluate(el => ({size:getComputedStyle(el).fontSize,weight:getComputedStyle(el).fontWeight,spacing:getComputedStyle(el).letterSpacing,parentSpacing:getComputedStyle(el.parentElement).letterSpacing}));
    assert.equal(style.size, '30px');
    assert.equal(style.weight, '400');
    assert.equal(style.spacing, style.parentSpacing);
    const initiallyOpen = await summary.evaluate(el => el.parentElement.open);
    await summary.focus();
    await page.keyboard.press('Enter');
    assert.equal(await summary.evaluate(el => el.parentElement.open), !initiallyOpen);
    await page.keyboard.press('Enter');
    assert.equal(await summary.evaluate(el => el.parentElement.open), initiallyOpen);
  }

  // One shared Tally form serves both companies and independent experts.
  assert.equal(await page.locator('.form-card').count(), 1, 'There must be exactly one form card');
  assert.equal(await page.locator('[data-form-id="LDDoxJ"]').count(), 1,
    'The unified published Tally form must be used');
  for (const id of ['anfrage-formular','projekt-formular','experten-formular']) {
    assert.equal(await page.locator('#'+id).count(), 1, 'Missing existing form anchor '+id);
  }
  for (const width of [1440, 1024, 800, 390, 320]) {
    await page.setViewportSize({width,height:1000});
    const measures=await page.locator('.form-card').evaluate(el=>{
      const card=el.getBoundingClientRect();
      const button=el.querySelector('.form-load').getBoundingClientRect();
      return {cardLeft:card.left,cardRight:card.right,
        btnLeft:button.left,btnRight:button.right,btnBottom:button.bottom};
    });
    assert.ok(measures.btnLeft >= measures.cardLeft - 2 &&
      measures.btnRight <= measures.cardRight + 2,
      'Unified form button must fit at '+width+'px: '+JSON.stringify(measures));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,'Horizontal overflow at '+width);
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
  assert.equal(await page.locator('.form-fallback a').getAttribute('href'),'https://tally.so/r/LDDoxJ');
  await page.locator('#anfrage-formular .form-load').click();
  assert.equal(await page.locator('.form-embed iframe').count(), 1,
    'Only one shared consent-gated iframe must load');
  assert.match(await page.locator('.form-embed iframe').getAttribute('src'),
    /^https:\/\/tally\.so\/embed\/LDDoxJ\?/);
  await page.locator('#anfrage-formular .form-unload').click();
  assert.equal(await page.locator('.form-embed iframe').count(), 0);
  await fs.mkdir('qa-screenshots', { recursive: true });
  for (const file of [...JSON.parse(await fs.readFile(path.join(root, 'content-clusters.json'), 'utf8')).map(x => x.slug + '.html'), 'index.html', 'interim-manager-tagessatz.html', 'vermittlung-bei-silverback.html', 'externe-it-experten.html', 'it-management-auf-zeit.html', 'sap-freelancer.html', 'freelancer-softwareentwicklung.html']) {
    await page.goto(origin + publicPath(file));
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), origin + publicPath(file));
    const links = await page.locator('a[href]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')));
    for (const href of links.filter(href => !/^(https?:|mailto:|tel:)/.test(href))) {
      const target = new URL(href, page.url());
      const fragment = decodeURIComponent(target.hash.slice(1));
      const content = await fs.readFile(path.join(root, sourcePath(target.pathname)), 'utf8');
      if (fragment) assert.ok(content.includes('id="' + fragment + '"'), 'Missing target: ' + href);
    }
    await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.forEach(n => JSON.parse(n.textContent)));
    for (const width of [1440, 1024, 800, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, file + ' overflows at ' + width);
      if (width === 1440 || width === 390) {
        await page.screenshot({ path: 'qa-screenshots/' + file.replaceAll('/', '-') + '-' + width + '.png', fullPage: true, animations: 'disabled' });
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
    await page.goto(origin + publicPath(file));
    const legalTitle = file === 'impressum.html' ? 'Impressum und Anbieterangaben.' : 'Datenschutz auf dieser Website.';
    assert.equal(await page.locator('h1').textContent(), legalTitle);
    if (file === 'impressum.html') {
      const spacing = await page.locator('section[aria-labelledby="orientierung"] h3').evaluateAll(nodes => nodes.map(el => [getComputedStyle(el).marginTop,getComputedStyle(el).marginBottom]));
      assert.deepEqual(spacing, Array(5).fill(['24px','10px']), 'Editorial heading spacing must load with current CSS');
    }
    for (const width of [320, 390, 800, 1440]) {
      await page.setViewportSize({width, height:1000});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, file+' legal overflow '+width);
      const bounds = await page.locator('h1').evaluate(el => { const r=el.getBoundingClientRect(); return {left:r.left,right:r.right,width:innerWidth}; });
      assert.ok(bounds.left >= 0 && bounds.right <= bounds.width, file+' heading clipped');
      if (width === 390 || width === 1440) await page.screenshot({path:'qa-screenshots/'+file+'-'+width+'.png',fullPage:true,animations:'disabled'});
    }
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


