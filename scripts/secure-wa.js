const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const OLD_LINK = '<a href="https://wa.me/447304330614" target="_blank" class="nav-wa" aria-label="WhatsApp">';
const NEW_LINK = '<a href="#" data-wa data-wa-source="nav" class="nav-wa" aria-label="WhatsApp" rel="nofollow noopener">';

const SCRIPT_TAG = '<script src="/js/wa-obfuscate.js" defer></script>';

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (['node_modules', '.git', 'netlify', 'scripts', 'ads_launch', 'partnerships', 'seo', 'data', 'css', 'js', 'assets'].includes(name)) continue;
      walk(p, out);
    } else if (name.endsWith('.html')) {
      out.push(p);
    }
  }
  return out;
}

const files = walk(ROOT);
let touched = 0;
let scriptAdded = 0;

for (const f of files) {
  let html = fs.readFileSync(f, 'utf8');
  const before = html;

  if (html.includes(OLD_LINK)) {
    html = html.split(OLD_LINK).join(NEW_LINK);
  }

  if (!html.includes('wa-obfuscate.js') && /<a[^>]*data-wa\b/.test(html)) {
    if (html.includes('</body>')) {
      html = html.replace('</body>', '  ' + SCRIPT_TAG + '\n</body>');
      scriptAdded++;
    }
  }

  if (html !== before) {
    fs.writeFileSync(f, html, 'utf8');
    touched++;
    console.log('updated:', path.relative(ROOT, f));
  }
}

console.log('---');
console.log('files touched:', touched);
console.log('script tag inserted:', scriptAdded);
