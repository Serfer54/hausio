#!/usr/bin/env node
// Add "Become a partner" to the header nav on every page. Idempotent.
// The link goes last in .main-nav, right before </nav>, so it sits after
// FAQ (313 pages) or Reviews (7 pages) regardless of which nav variant a page has.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = ['node_modules', '.git', 'assets', 'css', 'js', 'netlify', 'output', 'tmp', 'ads', 'ads_launch', 'seo', 'data', 'scripts'];
const LINK = '      <a href="/partners.html">Become a partner</a>\n';
function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.includes(name)) continue;
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, acc);
    else if (name.endsWith('.html')) acc.push(p);
  }
  return acc;
}
let changed = 0, skipped = 0, noNav = [];
for (const file of walk(ROOT)) {
  const src = fs.readFileSync(file, 'utf8');
  const start = src.indexOf('<nav class="main-nav"');
  if (start === -1) { noNav.push(path.relative(ROOT, file)); continue; }
  const end = src.indexOf('</nav>', start);
  const nav = src.slice(start, end);
  if (nav.includes('href="/partners.html"')) { skipped++; continue; }
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const link = LINK.replace('\n', eol);
  // </nav> is preceded by the closing indentation "    "; insert the link before that line.
  const lineStart = src.lastIndexOf(eol, end) + eol.length;
  const out = src.slice(0, lineStart) + link + src.slice(lineStart);
  fs.writeFileSync(file, out, 'utf8');
  changed++;
}
console.log(`partner nav link: added ${changed}, already present ${skipped}, no main-nav: ${noNav.length} ${noNav.join(' ')}`);
