#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const pricing = read('pricing.html');
const pricingText = read('pricing.md');
const pricingData = JSON.parse(read('pricing.json'));
const businessData = JSON.parse(read('business.json'));
const booking = read('book.html');
const llms = read('llms.txt');
const sitemap = read('sitemap.xml');
const reviewUrl = 'https://search.google.com/local/writereview?placeid=ChIJq_sQzkx5x0wRgoDebyMQYMI';

const requiredPricing = [
  ['Regular cleaning', '&pound;27/hour'],
  ['One-off cleaning', '&pound;30/hour'],
  ['Deep cleaning', '&pound;45/hour'],
  ['1 mover + van', '&pound;65/hour'],
  ['2 movers + van', '&pound;90/hour'],
  ['3 movers + van', '&pound;115/hour'],
  ['First hour', '&pound;65'],
  ['Each additional hour', '&pound;50/hour'],
];
for (const [label, price] of requiredPricing) {
  check(pricing.includes(label) && pricing.includes(price), `pricing.html missing ${label} ${price}`);
}

check(pricing.includes('5-hour minimum per cleaner'), 'pricing.html missing cleaning minimum');
check(pricing.includes('3-hour minimum'), 'pricing.html missing moving minimum');
check(pricingText.includes('Regular cleaning: £27 per hour'), 'pricing.md has stale cleaning price');
check(pricingText.includes('2 movers and van: £90 per hour'), 'pricing.md has stale moving price');
check(pricingData.services.cleaning.rates.regular === 27, 'pricing.json has stale regular cleaning price');
check(pricingData.services.cleaning.rates.oneOff === 30, 'pricing.json has stale one-off cleaning price');
check(pricingData.services.cleaning.rates.deep === 45, 'pricing.json has stale deep cleaning price');
check(pricingData.services.cleaning.minimumHours === 5, 'pricing.json has stale cleaning minimum');
check(pricingData.services.manAndVan.rates.oneMoverAndVan === 65, 'pricing.json has stale one-mover price');
check(pricingData.services.manAndVan.rates.twoMoversAndVan === 90, 'pricing.json has stale two-mover price');
check(pricingData.services.manAndVan.minimumHours === 3, 'pricing.json has stale moving minimum');
check(pricingData.services.manAndVan.sameRateEveryHour === true, 'pricing.json must state a uniform moving rate');
check(pricingData.services.quotedServices.buildingWorks.includes('Project quote'), 'pricing.json missing building works quote model');
check(pricingData.services.quotedServices.plumbing.includes('Job-specific quote'), 'pricing.json missing plumbing quote model');
check(pricingData.services.quotedServices.gardenMaintenance.includes('Quote based'), 'pricing.json missing garden maintenance quote model');
check(businessData.telephone === '+44 7304 330614', 'business.json has a non-canonical phone number');
check(businessData.identifier.value === '17167561', 'business.json has a non-canonical company number');
check(businessData.openingHoursSpecification.opens === '08:00' && businessData.openingHoursSpecification.closes === '20:00', 'business.json has stale hours');
check(booking.includes('value="regular">Regular clean — £27/hr'), 'calculator has stale regular cleaning price');
check(booking.includes('value="2" selected>2 movers + van — £90/hr'), 'calculator has stale two-mover price');
check(llms.includes('https://hausio.co.uk/pricing.html'), 'llms.txt does not expose pricing page');
check(sitemap.includes('<loc>https://hausio.co.uk/pricing.html</loc>'), 'pricing page missing from sitemap');
for (const service of ['building-works', 'plumbing', 'garden-maintenance']) {
  check(fs.existsSync(path.join(root, `${service}-london.html`)), `${service} page missing`);
  check(sitemap.includes(`<loc>https://hausio.co.uk/${service}-london.html</loc>`), `${service} page missing from sitemap`);
}
check(read('leave-a-review.html').includes(reviewUrl), 'review page Google review URL missing');
check(read('index.html').includes('/leave-a-review.html#reviews'), 'homepage Reviews navigation link missing');
check(!read('index.html').includes('class="testimonials" id="reviews"'), 'reviews section still appears on homepage');
check(!fs.existsSync(path.join(root, 'design-preview.html')), 'rejected design preview still exists');

const scripts = [...pricing.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
check(scripts.length > 0, 'pricing.html has no JSON-LD');
for (const match of scripts) {
  try { JSON.parse(match[1]); } catch (error) { failures.push(`pricing.html invalid JSON-LD: ${error.message}`); }
}

const trackedHtml = execFileSync('git', ['ls-files', '*.html'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean);
for (const rel of trackedHtml) {
  const html = read(rel);
  check(!html.includes('"latitude": 51.50735'), `${rel} uses generic London-centre geo coordinates`);
}

if (failures.length) {
  console.error(`Public pricing verification failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Public pricing verification passed (${trackedHtml.length} tracked HTML pages checked).`);
