const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/booking.js'), 'utf8');
const prices = vm.runInNewContext('(' + source.match(/const PRICES = (\{[\s\S]*?\n  \});/)[1] + ')');
const calculate = source.slice(source.indexOf('  function calculate()'), source.indexOf('  function renderSummary'));
function quote(crew, hours, extras = []) {
  const form = {'move-crew': {value:String(crew)}, 'move-hours': {value:String(hours)}, postcode:{value:''}};
  form.querySelector = () => ({value:'removals'});
  form.querySelectorAll = () => extras.map(value=>({value}));
  const context = {PRICES:prices, form, mileageState:{status:'idle'}, labelExtra:x=>x, isCentralLondon:()=>false, renderSummary:(_, total)=>{context.total=total;}};
  vm.runInNewContext(calculate + '\ncalculate();', context);
  return context.total;
}
assert.equal(quote(1,3),195);
assert.equal(quote(1,4),260);
assert.equal(quote(1,2),195);
assert.equal(quote(2,3),270);
assert.equal(quote(2,4),360);
assert.equal(quote(2,0),270);
assert.equal(quote(3,3),345);
assert.equal(quote(1,4,['luton']),320);
let offers=0;
function visit(node) {
  if (!node || typeof node !== 'object') return;
  const expected={'1 man + van':65,'2 men + van':90,'3 men + van':115,'3 men + Luton van':115};
  if(node['@type']==='Offer' && expected[node.name]) {
    assert.equal(Number(node.price),expected[node.name]);
    if(node.priceSpecification) assert.equal(Number(node.priceSpecification.price),expected[node.name]);
    offers++;
  }
  Object.values(node).forEach(v=>Array.isArray(v)?v.forEach(visit):visit(v));
}
for(const name of fs.readdirSync(root).filter(n=>/^man-and-van-.*\.html$/.test(n))) {
  const html=fs.readFileSync(path.join(root,name),'utf8');
  assert.ok(html.includes('3-hour minimum'),name);
  assert.ok(!/£(?:55|85)\b/.test(html),name+' has an old rate');
  for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) visit(JSON.parse(m[1]));
}
assert.ok(offers>=96,'Expected borough moving offers');
const book=fs.readFileSync(path.join(root,'book.html'),'utf8');
for(const m of book.match(/<select name="move-hours">([\s\S]*?)<\/select>/)[1].matchAll(/value="(\d+)"/g)) assert.ok(Number(m[1])>=3);
console.log(`Moving pricing passed: uniform hourly rates, minimum guard, extras, duration options and ${offers} offers.`);
