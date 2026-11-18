const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('dist/app.js','utf8').split('// Curated, visible context only.')[1];
for(const [query,expected] of [['?anliegen=kunde&thema=netapp','NetApp'],['?anliegen=experte','Experte'],['?anliegen=__proto__&thema=constructor',null],['?thema=%3Cscript%3Ebad%3C/script%3E',null],['',null]]){
 const box={hidden:true,textContent:''};vm.runInNewContext('//'+source,{document:{querySelector:()=>box},location:{search:query},URLSearchParams});assert.equal(box.hidden,!expected);if(expected){assert.ok(box.textContent.includes(expected));assert.ok(box.textContent.includes('nicht automatisch'));}
}
console.log('PASS customer/expert/topic context, unknown and prototype URL values rejected; no external transfer');
