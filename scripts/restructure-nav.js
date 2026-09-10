#!/usr/bin/env node
// Header nav restructure (Sept 2026): keep Services, How it works, Our work,
// Reviews and Become a partner at top level; move About, FAQ and Blog into a
// "Company" dropdown. Keeps each page's existing Services dropdown untouched.
// Idempotent: pages that already have the Company dropdown are skipped.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = ['node_modules', '.git', 'assets', 'css', 'js', 'netlify', 'output', 'tmp', 'ads', 'ads_launch', 'seo', 'data', 'scripts'];
const LINKS = [
  '      <a href="/how-it-works.html">How it works</a>',
  '      <a href="/portfolio.html">Our work</a>',
  '      <a href="/leave-a-review.html#reviews">Reviews</a>',
  '      <div class="nav-item has-dropdown">',
  '        <button type="button" class="nav-dropdown-toggle" aria-haspopup="true" aria-expanded="false">Company <span class="caret" aria-hidden="true">&#9662;</span></button>',
  '        <div class="nav-dropdown" role="menu">',
  '          <a href="/about.html" role="menuitem">About us</a>',
  '          <a href="/faq.html" role="menuitem">FAQ</a>',
  '          <a href="/blog/" role="menuitem">Blog</a>',
  '        </div>',
  '      </div>',
  '      <a href="/partners.html">Become a partner</a>',
];
function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.includes(name)) continue;
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, acc);
    else if (name.endsWith('.html')) acc.push(p);
  }
  return acc;
}
let changed = 0, skipped = 0, failed = [];
for (const file of walk(ROOT)) {
  const src = fs.readFileSync(file, 'utf8');
  const start = src.indexOf('<nav class="main-nav"');
  if (start === -1) continue;
  const end = src.indexOf('</nav>', start);
  const nav = src.slice(start, end);
  if (nav.includes('>Company <span')) { skipped++; continue; }
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  // Services dropdown = first has-dropdown block, closed by the "      </div>" line.
  const ddStart = nav.indexOf('      <div class="nav-item has-dropdown">');
  const ddEndMarker = eol + '      </div>' + eol;
  const ddEnd = nav.indexOf(ddEndMarker, ddStart);
  if (ddStart === -1 || ddEnd === -1) { failed.push(path.relative(ROOT, file)); continue; }
  const services = nav.slice(ddStart, ddEnd + ddEndMarker.length);
  const head = nav.slice(0, ddStart); // '<nav class="main-nav" aria-label="Main">' + eol
  const rebuilt = head + services + LINKS.join(eol) + eol + '    ';
  fs.writeFileSync(file, src.slice(0, start) + rebuilt + src.slice(end), 'utf8');
  changed++;
}
console.log(`nav restructure: changed ${changed}, already done ${skipped}, failed ${failed.length} ${failed.join(' ')}`);
