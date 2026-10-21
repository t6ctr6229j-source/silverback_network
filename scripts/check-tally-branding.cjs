'use strict';
const {chromium} = require('playwright');
const forms = [
  ['ja1WdE','wescaleIT'],
  ['yPO8Od','Silverback experts'],
  ['pbgYgP','Silverback projects'],
  ['0Q4bE0','FCTH Game'],
  ['jaKaR9','FCTH Golden Ticket'],
  ['eqbqJo','FCTH Session'],
  ['rjXj4L','FCTH Audiobook'],
  ['44Z4Mo','FCTH Contact']
];
(async () => {
  const browser=await chromium.launch({headless:true});
  const problems=[];
  for(const [id,label] of forms){
    const page=await browser.newPage({viewport:{width:390,height:844}});
    try{
      const response=await page.goto('https://tally.so/r/'+id,{waitUntil:'domcontentloaded',timeout:45000});
      await page.waitForTimeout(1800);
      const status=response?.status()||0;
      const body=await page.locator('body').innerText({timeout:20000});
      const inputs=await page.locator('input,textarea,[contenteditable=true],[role=textbox]').count();
      const branding=/(Made with Tally|Powered by Tally|Create a form with Tally|Erstellt mit Tally|Mit Tally erstellt)/i.test(body);
      if(status!==200||inputs===0||branding){
        problems.push({id,label,status,inputs,branding});
      }
      console.log(label+': HTTP='+status+' inputs='+inputs+' Tally-branding-visible='+branding);
    }catch(error){problems.push({id,label,error:String(error).slice(0,350)});}
    finally{await page.close();}
  }
  await browser.close();
  if(problems.length){console.error('FORM CHECK ISSUES:',JSON.stringify(problems,null,2));process.exit(1);}
  console.log('PASS: all eight public forms render without visible Tally footer branding.');
})().catch(e=>{console.error(e);process.exit(1)});
