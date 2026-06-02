/* Inject favicon <link> tags into every page's <head>. Idempotent.
 * Run: node scripts/add-favicon.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const BLOCK = [
  '<link rel="icon" href="/favicon.ico" sizes="32x32" />',
  '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
  '<link rel="manifest" href="/site.webmanifest" />',
].join('\n');

const SKIP = new Set(['node_modules', '.git', '.netlify', 'scripts']);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

let added = 0, skipped = 0;
for (const file of walk(ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  if (/rel=["']icon["']/.test(html)) { skipped++; continue; }
  // insert right after the viewport meta tag
  const m = html.match(/<meta\s+name=["']viewport["'][^>]*>/i);
  if (!m) { console.warn('  ! no viewport in', path.relative(ROOT, file)); skipped++; continue; }
  html = html.replace(m[0], m[0] + '\n' + BLOCK);
  fs.writeFileSync(file, html);
  added++;
}
console.log(`Favicon links — added: ${added}, skipped (already had / no anchor): ${skipped}`);
