const {chromium}=require('playwright');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const root=path.resolve(__dirname,'../dist');
 const files=await fs.readdir(root,{recursive:true});
 const context=await browser.newContext();
 await context.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(u.hostname!=='www.silverback-network.com') { await route.abort();return; }
  let p=u.pathname==='/'?'index.html':u.pathname.slice(1);
  if(!path.extname(p))p+='.html';
  await route.fulfill({path:path.join(root,p)});
 });
 const page=await context.newPage();
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});
  for(const file of files.filter(x=>x.endsWith('.html'))){
   await page.goto('https://www.silverback-network.com/'+file);
   await page.evaluate(()=>localStorage.clear()); await page.reload();
   const dock=page.locator('[data-contact-dock]');
   if(await page.locator('[data-analytics-deny]').count()) await page.locator('[data-analytics-deny]').click();
   await dock.waitFor({state:'visible'});
   const box=await dock.boundingBox(); assert(box.x>=0&&box.x+box.width<=width&&box.y+box.height<=900,file);
   assert.equal(await dock.locator('a').count(),2);
   assert.equal(await dock.locator('a').first().getAttribute('href'),'tel:+4973140321375');
   assert.equal(await dock.locator('a').last().getAttribute('href'),'mailto:silverback@wescaleit.com');
   await dock.locator('a').first().focus();
   await page.keyboard.press('Tab'); assert(await dock.locator('a').last().evaluate(e=>e===document.activeElement));
   if(await page.locator('[data-analytics-settings]').count()) {
    await page.evaluate(()=>document.querySelector('[data-analytics-settings]').click());
    await dock.waitFor({state:'hidden'});
   }
  }
 }
 await page.goto('https://www.silverback-network.com/');
 await page.evaluate(()=>localStorage.clear()); await page.reload();
 await page.locator('[data-analytics-deny]').click();
 await page.locator('.forms').scrollIntoViewIfNeeded();
 await page.locator('[data-contact-dock]').waitFor({state:'hidden'});
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.locator('[data-contact-dock]').waitFor({state:'visible'});
 await page.waitForTimeout(1200);
 await page.screenshot({path:'/tmp/silverback-contact-dock.png'});
 console.log('PASS: contact dock on every page at 320/390/768/1440px, correct contacts, keyboard, consent and form avoidance');
 await browser.close();
})();
