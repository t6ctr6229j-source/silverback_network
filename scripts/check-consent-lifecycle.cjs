const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const root = require('node:path').resolve(__dirname, '..') + '/';
const LIFE = 180*86400000;
const configs = [
 {repo:'FCTH_Website',file:'assets/consent.js',host:'www.ciso2hero.com',id:'G-2Z0DKLDG8P',key:'fcth_consent_v1',accept:'[data-consent-accept]',deny:'[data-consent-reject]',value:(yes,exp)=>({version:3,analytics:yes,expires:exp})},
 {repo:'psoydo_website',file:'app.js',host:'psoydo.com',id:'G-EYFT82SFN7',key:'psoydo-consent-v3',accept:'#consent-accept',deny:'#consent-decline',value:(yes,exp)=>({version:4,analytics:yes,ads:false,expires:exp})},
 {repo:'wescaleIT_website',file:'js/analytics.js',host:'wescaleit.com',id:'G-7QYEF752NM',key:'wescaleit.statistics.v1',accept:'[data-statistics-accept]',deny:'[data-statistics-deny]',value:(yes,exp)=>({choice:yes?'granted':'denied',expires:exp})},
 {repo:'silverback_network',file:'dist/analytics.js',host:'www.silverback-network.com',id:'G-RWGM8X6QGH',key:'silverback.analytics-consent.v1',accept:'[data-analytics-accept]',deny:'[data-analytics-deny]',value:(yes,exp)=>({choice:yes?'accepted':'denied',expires:exp})}
];
function make(c, {saved,blocked=false}={}) {
 let clock=1800000000000, reloads=0, serial=0;
 const storage=new Map(saved?[ [c.key,JSON.stringify(saved(clock))] ]:[]);
 const timers=new Map(), all=[], events=new Map(), cookieDeletes=[], scripts=[];
 class El {
  constructor(sel=''){this.sel=sel;this.dataset={};this.events={};this.children=new Map();this.classList={add(){},remove(){},contains(){return false;}};this.textContent='';this.hidden=false;this.open=false;this.checked=false;all.push(this);}
  querySelector(sel){if(!this.children.has(sel))this.children.set(sel,new El(sel));return this.children.get(sel);}
  querySelectorAll(){return [];}
  addEventListener(k,f){(this.events[k]??=[]).push(f);}
  removeAttribute(){} setAttribute(){} focus(){} remove(){} append(){} appendChild(){} close(){this.open=false;} showModal(){this.open=true;}
 }
 const ids=new Map();
 const el=s=>{if(!ids.has(s))ids.set(s,new El(s));return ids.get(s);};
 const footer=el('.footer-legal button');footer.textContent='Cookie Einstellungen';
 const document={readyState:'complete',documentElement:el('html'),body:el('body'),activeElement:el('active'),head:{appendChild:s=>scripts.push(s),append:s=>scripts.push(s)},
  getElementById:id=>el('#'+id),createElement:tag=>new El(tag),
  querySelector:s=>s==='.goodie-footer'?null:el(s),
  querySelectorAll:s=>s==='.footer-legal button'?[footer]:s==='[data-statistics-settings]'?[el(s)]:[],
  addEventListener(){},removeEventListener(){},referrer:'https://example.org/start?secret=yes'};
 Object.defineProperty(document,'cookie',{get:()=>`_ga=example; _ga_${c.id.slice(2)}=example; _gcl_au=example; essential=keep`,set:v=>cookieDeletes.push(v)});
 const location={hostname:c.host,protocol:'https:',pathname:'/test.html',origin:'https://'+c.host,href:'https://'+c.host+'/test.html?secret=yes#fragment',reload(){reloads++;}};
 const window={location,addEventListener(k,f){if(!events.has(k))events.set(k,[]);events.get(k).push(f);},dispatchEvent(){},setTimeout:(f,d)=>{timers.set(++serial,{f,d});return serial;}};
 const context={window,document,location,localStorage:{getItem:k=>{if(blocked)throw Error('blocked');return storage.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error('blocked');storage.set(k,v);}},
  setTimeout:window.setTimeout,clearTimeout:id=>timers.delete(id),URL,Date:class extends Date {constructor(...a){super(...(a.length?a:[clock]));} static now(){return clock;}},CustomEvent:class {constructor(type,options){Object.assign(this,{type,...options});}}};
 let source=fs.readFileSync(root+c.file,'utf8');
 if(c.repo==='psoydo_website') source='(function(){\n'+source.slice(source.indexOf("  var box=document.getElementById('consent');"));
 vm.runInNewContext(source,context,{filename:c.file});
 return {window,document,scripts,cookieDeletes,storage,el,
  get reloads(){return reloads;},get now(){return clock;},
  click(sel){let e=[...all].reverse().find(e=>e.sel===sel&&e.events.click);assert.ok(e,`missing ${sel}`);for(const f of e.events.click)f({});},
  grant(){if(c.repo==='FCTH_Website')window.FCTHConsent.open();if(c.repo==='psoydo_website')el('#consent-analytics').checked=true;this.click(c.accept);},
  revoke(){if(c.repo==='FCTH_Website')window.FCTHConsent.open();this.click(c.deny);},
  event(type,e){for(const f of events.get(type)||[])f(e);},
  expire(){clock+=LIFE+1;for(const [id,t] of [...timers]){timers.delete(id);t.f();}},
  configs(){return (window.dataLayer||[]).filter(a=>a[0]==='config');}
 };
}
let count=0;
function check(name,fn){fn();count++;console.log('PASS',name);}
for(const c of configs.filter(c=>c.repo==='silverback_network')){
 check(c.repo+' no consent / rejection blocks tag',()=>{const x=make(c);assert.equal(x.scripts.length,0);x.revoke();assert.equal(x.scripts.length,0);assert.equal(x.window['ga-disable-'+c.id],true);});
 check(c.repo+' grant, 180-day cookie and withdraw',()=>{const x=make(c);x.grant();assert.equal(x.scripts.length,1);assert.equal(x.configs().find(a=>a[1]===c.id)[2].cookie_expires,LIFE/1000);assert.equal(x.configs().find(a=>a[1]===c.id)[2].cookie_update,false);assert.equal(JSON.parse(x.storage.get(c.key)).expires,x.now+LIFE);x.revoke();assert.equal(x.window['ga-disable-'+c.id],true);assert.equal(x.reloads,1);assert.ok(x.cookieDeletes.some(s=>s.startsWith('_ga=;')));assert.ok(!x.cookieDeletes.some(s=>s.startsWith('essential=')));});
 check(c.repo+' stored grant / deny / expired / malformed',()=>{assert.equal(make(c,{saved:n=>c.value(true,n+10000)}).scripts.length,1);for(const saved of [n=>c.value(false,n+10000),n=>c.value(true,n-1),n=>c.value(true,n+LIFE+1),n=>c.value(true,'forever')])assert.equal(make(c,{saved}).scripts.length,0);});
 check(c.repo+' expiry stops an already loaded tag',()=>{const x=make(c);x.grant();x.expire();assert.equal(x.window['ga-disable-'+c.id],true);assert.equal(x.reloads,1);});
 check(c.repo+' withdrawal in another tab',()=>{const x=make(c,{saved:n=>c.value(true,n+10000)});x.storage.set(c.key,JSON.stringify(c.value(false,x.now+10000)));x.event('storage',{key:c.key});assert.equal(x.window['ga-disable-'+c.id],true);assert.equal(x.reloads,1);});
 check(c.repo+' clearing all storage stops tracking',()=>{const x=make(c,{saved:n=>c.value(true,n+10000)});x.storage.clear();x.event('storage',{key:null});assert.equal(x.window['ga-disable-'+c.id],true);assert.equal(x.reloads,1);});
 check(c.repo+' unrelated storage does not reload',()=>{const x=make(c);x.event('storage',{key:'other'});assert.equal(x.reloads,0);});
 check(c.repo+' blocked storage stays usable',()=>{const x=make(c,{blocked:true});assert.equal(x.scripts.length,0);x.grant();assert.equal(x.scripts.length,1);x.revoke();assert.equal(x.window['ga-disable-'+c.id],true);assert.equal(x.reloads,1);});
 check(c.repo+' back-forward cache revalidates',()=>{const x=make(c);x.event('pageshow',{persisted:true});assert.equal(x.reloads,1);});
}
console.log(`${count} behavioral checks passed (isolated DOM/timer/storage harness, no Google network).`);
