#!/usr/bin/env node
// Put the phone number back into the visible page.
//
// The number was obfuscated behind `<a href="#" data-tel>` so scrapers could not
// read it — but it already sits in plain text inside the JSON-LD on every page,
// so the protection was notional while the cost was real: zero `tel:` links in
// the HTML, no phone number in the visible NAP, and nothing for an AI assistant
// to quote when someone asks how to reach Hausio.
//
// Click tracking is preserved: wa-obfuscate.js now also binds to real tel: links.

const fs = require('fs');
const path = require('path');
const entity = require('./lib/entity');

const ROOT = path.resolve(__dirname, '..');

const REPLACEMENTS = [
  [
    '<a href="tel:+447304330614" data-tel-source="footer">+44 7304 330614</a>',
    `<a href="${entity.PHONE_HREF}" data-tel-source="footer">${entity.PHONE_DISPLAY}</a>`,
  ],
  [
    '<a href="tel:+447304330614" data-tel-source="hero" class="btn btn-outline">Call +44 7304 330614</a>',
    `<a href="${entity.PHONE_HREF}" data-tel-source="hero" class="btn btn-outline">Call ${entity.PHONE_DISPLAY}</a>`,
  ],
];

function htmlFiles(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'assets', 'css', 'js', 'netlify', 'output', 'ads', 'ads_launch', 'seo', 'data', 'scripts'].includes(name)) continue;
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) htmlFiles(full, acc);
    else if (name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

let files = 0;
let links = 0;
for (const file of htmlFiles(ROOT)) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [from, to] of REPLACEMENTS) {
    const parts = after.split(from);
    links += parts.length - 1;
    after = parts.join(to);
  }
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    files++;
  }
}
console.log(`Телефон раскрыт: ${links} ссылок на ${files} страницах.`);
