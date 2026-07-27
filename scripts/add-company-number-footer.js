#!/usr/bin/env node
// Add a visible "Registered in England & Wales · Company No. 17167561" line to the
// footer-bottom of every page (no street address). Tag matches the footer's own
// pattern (<small> in hand pages, <p> in generated pages). Idempotent.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SKIP = ['node_modules', '.git', 'netlify', 'scripts', 'ads_launch', 'partnerships', 'seo', 'data', 'css', 'js', 'assets'];
const LINE_TEXT = 'Registered in England &amp; Wales · Company No. 17167561';

function walk(dir, out = []) {
  for (const n of fs.readdirSync(dir)) {
    const p = path.join(dir, n), st = fs.statSync(p);
    if (st.isDirectory()) { if (!SKIP.includes(n)) walk(p, out); }
    else if (n.endsWith('.html')) out.push(p);
  }
  return out;
}

let changed = 0, skipped = 0, nofooter = 0;
for (const f of walk(ROOT)) {
  let h = fs.readFileSync(f, 'utf8');
  if (h.includes('Company No. 17167561')) { skipped++; continue; }
  const fbIdx = h.indexOf('footer-bottom"');
  if (fbIdx < 0) { nofooter++; continue; }
  const closeIdx = h.indexOf('</div>', fbIdx);
  if (closeIdx < 0) { nofooter++; continue; }
  // detect the tag used inside this footer-bottom
  const inner = h.slice(fbIdx, closeIdx);
  const tag = inner.includes('<small') ? 'small' : 'p';
  // find indentation of the closing </div> to match formatting
  const lineStart = h.lastIndexOf('\n', closeIdx) + 1;
  const indent = h.slice(lineStart, closeIdx).match(/^\s*/)[0];
  const insert = `${indent}  <${tag}>${LINE_TEXT}</${tag}>\n${indent}`;
  h = h.slice(0, lineStart) + insert + h.slice(closeIdx);
  fs.writeFileSync(f, h, 'utf8');
  changed++;
}
console.log(`company-number footer line — added: ${changed}, already had: ${skipped}, no footer: ${nofooter}`);
