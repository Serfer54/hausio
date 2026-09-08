// Regression check for cleaning rates across the calculator and generated pages.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const booking = fs.readFileSync(path.join(root, 'js/booking.js'), 'utf8');
const model = booking.match(/const PRICES = (\{[\s\S]*?\n  \});/);
assert.ok(model, 'Pricing model must exist');
const prices = vm.runInNewContext('(' + model[1] + ')');
for (const [type, rate] of Object.entries({regular:27, 'one-off':30, deep:45, eot:32, builders:30})) {
  assert.equal(prices.cleaning[type], rate, type);
}

// Exercise the actual calculation function, including minimum enforcement.
const calculateSource = booking.slice(booking.indexOf('  function calculate()'), booking.indexOf('  function renderSummary'));
function quote(type, hours, supplies = 'own', extras = []) {
  const fields = {'clean-type':{value:type}, 'clean-hours':{value:String(hours)}, 'clean-bed':{value:'2'}, 'clean-bath':{value:'1'}, 'clean-supplies':{value:supplies}, postcode:{value:''}};
  fields.querySelector = () => ({value:'cleaning'});
  fields.querySelectorAll = () => extras.map(value=>({value}));
  const context = {PRICES:prices, form:fields, mileageState:{status:'idle'}, labelCleanType:x=>x, labelExtra:x=>x, isCentralLondon:()=>false, renderSummary:(lines,total)=>{context.result=total;}};
  vm.runInNewContext(calculateSource + '\ncalculate();', context);
  return context.result;
}
assert.equal(quote('one-off',5),150);
assert.equal(quote('regular',5),135);
assert.equal(quote('deep',5),225);
assert.equal(quote('one-off',2),150,'Under-minimum input must still price five hours');
assert.equal(quote('deep',6,'hausio'),285);
assert.equal(quote('eot',5,'own',['oven','fridge']),160,'Included end-of-tenancy tasks must not be billed twice');
assert.equal(quote('deep',5,'own',['oven','fridge']),265,'Deep-clean optional extras');

const expected = {'Regular clean':27,'Regular cleaning':27,'One-off clean':30,'One-off cleaning':30,'Deep clean':45,'Deep cleaning':45,'After-builders clean':30,'End of tenancy clean':32,'End of tenancy cleaning':32};
let checked = 0;
function visit(node) {
  if (!node || typeof node !== 'object') return;
  if (node['@type'] === 'Offer' && expected[node.name] !== undefined) {
    assert.equal(Number(node.price), expected[node.name], node.name);
    if (node.priceSpecification) assert.equal(Number(node.priceSpecification.price), expected[node.name]);
    checked++;
  }
  Object.values(node).forEach(value => Array.isArray(value) ? value.forEach(visit) : visit(value));
}
for (const name of fs.readdirSync(root).filter(n => /^cleaning-.*\.html$/.test(n))) {
  const html = fs.readFileSync(path.join(root,name),'utf8');
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) visit(JSON.parse(match[1]));
  assert.ok(html.includes('5-hour minimum'),name+' must show the minimum');
  assert.ok(!/£(?:22|26|28)\b/.test(html),name+' has an old rate');
}
assert.ok(checked >= 164,'Expected offers on all 33 cleaning pages');
const bookHtml = fs.readFileSync(path.join(root,'book.html'),'utf8');
const durations = bookHtml.match(/<select name="clean-hours">([\s\S]*?)<\/select>/)[1];
for (const match of durations.matchAll(/value="(\d+)"/g)) assert.ok(Number(match[1])>=5);
console.log(`Cleaning pricing passed: calculator, five-hour guard, product charge, duration options and ${checked} schema offers.`);
