#!/usr/bin/env node
// Acceptance checks for the AI-search pass. Exits non-zero if anything regressed.
//
// Run after any generator or patch script: node scripts/verify-aeo.js

const fs = require('fs');
const path = require('path');
const entity = require('./lib/entity');

const ROOT = path.resolve(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'boroughs.json'), 'utf8'));
const SKIP = new Set(['404.html']);

function htmlFiles(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'assets', 'css', 'js', 'netlify', 'output', 'ads', 'ads_launch', 'seo', 'data', 'scripts'].includes(name)) continue;
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) htmlFiles(full, acc);
    else if (name.endsWith('.html') && !SKIP.has(name)) acc.push(full);
  }
  return acc;
}

const files = htmlFiles(ROOT);
const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
}

// --- markup integrity ---
let noLd = [], badJson = [], noOrg = [], noSite = [], noOffers = [], truncated = [];
let brokenImage = [], staleFounding = [], orphanPlace = [];
const IMAGES = new Set(fs.readdirSync(path.join(ROOT, 'assets')));

for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const html = fs.readFileSync(file, 'utf8');
  const m = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  if (!m) { noLd.push(rel); continue; }
  let d;
  try { d = JSON.parse(m[1]); } catch (e) { badJson.push(rel + ': ' + e.message); continue; }
  const graph = d['@graph'] || [d];
  const ids = new Set(graph.map(n => n['@id']));
  if (!ids.has(entity.ORG_ID)) noOrg.push(rel);
  if (!ids.has(entity.SITE_ID)) noSite.push(rel);

  for (const node of graph) {
    const type = Array.isArray(node['@type']) ? node['@type'][0] : node['@type'];
    if (type === 'Place' && !node['@id']) orphanPlace.push(rel);
    if (node.foundingDate && node.foundingDate !== entity.FOUNDING_DATE) staleFounding.push(rel + ': ' + node.foundingDate);
    if (type === 'Service') {
      if (rel.startsWith('areas/')) continue;            // hub pages list services, no single price
      if (!node.offers) noOffers.push(rel);
      const desc = node.description || '';
      // A description cut mid-word ends in a word fragment with no sentence end.
      // Acceptable endings: a full stop, or an ellipsis marking a deliberate trim.
      if (desc.length > 150 && !/[.!?…]$/.test(desc)) truncated.push(rel);
    }
  }

  // Images referenced in markup and og:image must exist on disk.
  for (const mm of html.matchAll(/https:\/\/hausio\.co\.uk\/assets\/([\w.-]+\.(?:jpg|png|webp))/g)) {
    if (!IMAGES.has(mm[1])) brokenImage.push(rel + ' → ' + mm[1]);
  }
}

check('JSON-LD присутствует и валиден', noLd.length === 0 && badJson.length === 0,
  [...noLd.map(f => 'нет блока: ' + f), ...badJson].join('; '));
check('#organization на каждой странице', noOrg.length === 0, noOrg.slice(0, 5).join(', '));
check('#website на каждой странице', noSite.length === 0, noSite.slice(0, 5).join(', '));
check('offers на сервисных страницах', noOffers.length === 0, `без offers: ${noOffers.length} → ${noOffers.slice(0, 3).join(', ')}`);
check('описания не обрезаны посреди слова', truncated.length === 0, `обрезано: ${truncated.length} → ${truncated.slice(0, 3).join(', ')}`);
check('картинки из разметки существуют', brokenImage.length === 0, [...new Set(brokenImage)].slice(0, 4).join(', '));
check('foundingDate = дата инкорпорации', staleFounding.length === 0, staleFounding.join(', '));
check('нет Place-сирот', orphanPlace.length === 0, `${orphanPlace.length} страниц`);

// --- phone ---
const noTel = files.filter(f => !fs.readFileSync(f, 'utf8').includes(entity.PHONE_HREF));
check('телефон tel: в HTML каждой страницы', noTel.length === 0,
  `без tel:: ${noTel.length} → ${noTel.slice(0, 3).map(f => path.relative(ROOT, f)).join(', ')}`);

// --- reviews in static HTML ---
const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const cachePath = path.join(ROOT, 'data', 'reviews-cache.json');
const cached = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : [];
const cards = (index.match(/class="review-card"/g) || []).length;
check('отзывы отрендерены в статику', cached.length === 0 || cards === Math.min(cached.length, 12),
  `в кэше ${cached.length}, карточек в HTML ${cards}`);
check('секция отзывов не скрыта, когда отзывы есть',
  cached.length === 0 || !index.includes('id="reviews" hidden'), '');

// --- cleaning coverage ---
const missingCleaning = Object.values(DATA)
  .filter(b => !fs.existsSync(path.join(ROOT, `cleaning-${b.slug}.html`)))
  .map(b => b.slug);
check('страница уборки для каждого района', missingCleaning.length === 0, missingCleaning.join(', '));

const hubsMissingLink = Object.values(DATA).filter(b => {
  const f = path.join(ROOT, 'areas', `${b.slug}.html`);
  return fs.existsSync(f) && !fs.readFileSync(f, 'utf8').includes(`/cleaning-${b.slug}.html`);
}).map(b => b.slug);
check('районный хаб ссылается на свою уборку', hubsMissingLink.length === 0, hubsMissingLink.join(', '));

// --- sitemap ---
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const missingFromSitemap = files.filter(f => {
  let rel = path.relative(ROOT, f).split(path.sep).join('/');
  const url = rel === 'index.html' ? 'https://hausio.co.uk/' : 'https://hausio.co.uk/' + rel.replace(/\/index\.html$/, '/');
  return !locs.includes(url);
}).map(f => path.relative(ROOT, f));
check('каждая страница есть в sitemap', missingFromSitemap.length === 0,
  `нет в sitemap: ${missingFromSitemap.length} → ${missingFromSitemap.slice(0, 4).join(', ')}`);
check('в sitemap нет дублей', new Set(locs).size === locs.length, `${locs.length} записей, ${new Set(locs).size} уникальных`);

// --- llms files ---
check('llms.txt на месте', fs.existsSync(path.join(ROOT, 'llms.txt')), '');
check('llms-full.txt на месте', fs.existsSync(path.join(ROOT, 'llms-full.txt')), '');

// --- no self-serving ratings ---
const withRatings = files.filter(f => /"aggregateRating"|"ratingValue"/.test(fs.readFileSync(f, 'utf8')));
check('aggregateRating не проставлен', withRatings.length === 0,
  withRatings.map(f => path.relative(ROOT, f)).join(', '));

let failed = 0;
for (const r of results) {
  console.log(`${r.pass ? '  OK  ' : ' FAIL '} ${r.name}${r.pass || !r.detail ? '' : '\n         ' + r.detail}`);
  if (!r.pass) failed++;
}
console.log(`\nСтраниц проверено: ${files.length}. Провалов: ${failed}.`);
process.exit(failed ? 1 : 0);
