#!/usr/bin/env node
// Point the borough hubs at their own cleaning page.
//
// Every areas/<borough>.html title promises "Cleaning in <Borough>", but until
// now cleaning was the one service with no borough pages, so the link went to
// the London-wide page instead. Now that cleaning-<borough>.html exists, the
// hubs should link to it — both in the service link block and anywhere the
// London-wide cleaning page was standing in for the local one.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'boroughs.json'), 'utf8'));

let hubs = 0;
let links = 0;
let added = 0;

for (const b of Object.values(DATA)) {
  const file = path.join(ROOT, 'areas', `${b.slug}.html`);
  if (!fs.existsSync(file)) continue;
  const before = fs.readFileSync(file, 'utf8');
  let html = before;

  // Local cleaning page replaces the London-wide stand-in.
  const stale = new RegExp('href="/?cleaning-london\.html"', 'g');
  const hits = (html.match(stale) || []).length;
  html = html.replace(stale, `href="/cleaning-${b.slug}.html"`);
  links += hits;

  // Add cleaning to the service link block if it is not there yet.
  const anchor = `      <a href="/handyman-${b.slug}.html">Handyman in ${b.name} →</a>`;
  if (html.includes(anchor) && !html.includes(`>Cleaning in ${b.name} →</a>`)) {
    html = html.replace(
      anchor,
      `      <a href="/cleaning-${b.slug}.html">Cleaning in ${b.name} →</a>\n${anchor}`
    );
    added++;
  }

  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    hubs++;
  }
}

console.log(`Хабов обновлено: ${hubs}`);
console.log(`Ссылок переведено на локальную уборку: ${links}`);
console.log(`Ссылок «Cleaning in <Borough>» добавлено: ${added}`);
