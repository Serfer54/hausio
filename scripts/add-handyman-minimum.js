#!/usr/bin/env node
// One-off: handyman теперь бронируется только от 2 часов.
// Оставляем ставку £65 first hour / £50 after, но везде помечаем "2-hour minimum".
// Идемпотентно: ищем исходные строки, после первой прогонки их не остаётся.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// [find, replace] — литеральные замены (split/join), без regex.
const REPLACEMENTS = [
  // borough handyman-*.html: pricing list
  ['<li>First hour £65</li>',
   '<li>First hour £65 <small>(2-hour minimum)</small></li>'],

  // handyman-london.html: service-price cards (×3)
  ['<p class="service-price">From <b>£65</b> first hour</p>',
   '<p class="service-price">From <b>£65</b> first hour · 2-hour minimum</p>'],

  // handyman-london.html: meta description
  ['£65 first hour, then £50/hr.',
   '£65 first hour, then £50/hr (2-hour minimum).'],

  // handyman-london.html: schema Service description
  ['£65 first hour, £50 each additional hour, fully insured.',
   '£65 first hour, £50 each additional hour, 2-hour minimum, fully insured.'],

  // handyman-london.html: FAQ schema answer
  ['£65 for the first hour and £50 for each additional hour. A half-day',
   '£65 for the first hour and £50 for each additional hour, with a 2-hour minimum booking. A half-day'],

  // handyman-london.html: visible FAQ answer
  ['£65 first hour, £50 each additional hour. Half-day',
   '£65 first hour, £50 each additional hour, 2-hour minimum booking. Half-day'],

  // areas/*.html: handyman overview paragraph
  ['£65 first hour, £50 each additional, fully insured, DBS-checked.',
   '£65 first hour, £50 each additional, 2-hour minimum, fully insured, DBS-checked.'],

  // areas/*.html: handyman service-card list item
  ['<li>£65 first hour, £50/hr after</li>',
   '<li>£65 first hour, £50/hr after <small>(2-hour minimum)</small></li>'],

  // areas/*.html: "Are prices the same as central London?" (schema + visible)
  ['Handyman £65 first hour, £50 after.',
   'Handyman £65 first hour, £50 after, 2-hour minimum.'],

  // index.html: pricing schema answer
  ['Handyman £65 first hour, £50/hour after, with half-day at £215',
   'Handyman £65 first hour, £50/hour after (2-hour minimum), with half-day at £215'],

  // index.html: visible pricing FAQ
  ['Handyman £65 first hour, £50/hr after, with half-day at £215',
   'Handyman £65 first hour, £50/hr after (2-hour minimum), with half-day at £215'],

  // index.html: handyman service-price card
  ['<p class="service-price">From <b>£65</b></p>',
   '<p class="service-price">From <b>£65</b> · 2-hour minimum</p>'],

  // book.html: handyman service tile
  ['<small>from £65</small>',
   '<small>from £65 · 2h min</small>'],

  // areas/kensington-chelsea.html: bespoke pricing FAQ (schema + visible)
  ['£65 first hour handyman.',
   '£65 first hour handyman (2-hour minimum).'],

  // blog ULEZ post
  ['handyman from £65 first hour.',
   'handyman from £65 first hour (2-hour minimum).'],
];

function walk(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '.git') continue;
      walk(p, acc);
    } else if (name.endsWith('.html')) {
      acc.push(p);
    }
  }
  return acc;
}

const files = walk(ROOT, []);
let totalHits = 0;
let touched = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  let out = src;
  let fileHits = 0;
  for (const [find, repl] of REPLACEMENTS) {
    const parts = out.split(find);
    if (parts.length > 1) {
      fileHits += parts.length - 1;
      out = parts.join(repl);
    }
  }
  if (out !== src) {
    fs.writeFileSync(file, out, 'utf8');
    touched++;
    totalHits += fileHits;
    console.log(`${path.relative(ROOT, file)}: ${fileHits} replacement(s)`);
  }
}

console.log(`\nDone. ${totalHits} replacement(s) across ${touched} file(s).`);
