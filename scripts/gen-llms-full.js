#!/usr/bin/env node
// Build llms-full.txt — the full text of every service hub, borough hub and blog
// post in one retrievable file.
//
// llms.txt lists what exists; llms-full.txt carries the actual content, so a
// retrieval system can answer from one fetch instead of crawling 313 pages.
// Local service × borough pages are excluded on purpose: 256 near-identical
// price tables would drown the file. Their pattern is documented in llms.txt.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'llms-full.txt');

const SERVICE_HUBS = [
  'cleaning-london.html',
  'man-and-van-london.html',
  'handyman-london.html',
  'furniture-assembly-london.html',
  'tv-mounting-london.html',
  'garden-clearance-london.html',
  'waste-removal-london.html',
  'painting-decorating-london.html',
];

const PAGES = ['pricing.html', 'about.html', 'how-it-works.html', 'faq.html', 'leave-a-review.html'];

function blogPosts() {
  const dir = path.join(ROOT, 'blog');
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .sort()
    .map(f => 'blog/' + f);
}

// Strip to readable text: drop scripts, styles, svg, nav and footer chrome,
// then collapse tags to their text with headings and list items marked up.
function toText(html) {
  let s = html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  s = s.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  s = s.replace(/<header class="site-header"[\s\S]*?<\/header>/i, '');
  s = s.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  s = s.replace(/<nav[\s\S]*?<\/nav>/gi, '');

  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => '\n\n# ' + t + '\n');
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => '\n\n## ' + t + '\n');
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => '\n\n### ' + t + '\n');
  s = s.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => '\n\n#### ' + t + '\n');
  s = s.replace(/<summary[^>]*>([\s\S]*?)<\/summary>/gi, (_, t) => '\n\nQ: ' + t + '\n');
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => '\n- ' + t);
  s = s.replace(/<\/(p|div|section|tr|article|details)>/gi, '\n');
  s = s.replace(/<\/t[dh]>/gi, ' | ');

  s = s.replace(/<[^>]+>/g, '');
  s = s
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
    .replace(/&pound;/g, '£').replace(/&middot;/g, '·').replace(/&hellip;/g, '…').replace(/&rarr;/g, '→')
    .replace(/&check;/g, '✓').replace(/&#10003;/g, '✓');

  return s
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .filter(line => line !== '-')
    .filter((line, i, arr) => line !== '' || (arr[i - 1] || '') !== '')
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function titleOf(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/);
  return m ? m[1].replace(/&amp;/g, '&').replace(/&mdash;/g, '—').trim() : '';
}

const parts = [];
parts.push('# Hausio — full content');
parts.push('');
parts.push('London home services: cleaning, man and van, handyman, furniture assembly, TV mounting, garden clearance, waste removal, painting & decorating. All 32 London boroughs. Hausio Ltd, company number 17167561. Phone +44 7304 330614.');
parts.push('');
parts.push('This file carries the full text of the service pages, company pages and blog. The 256 local service × borough pages follow the URL pattern https://hausio.co.uk/{service}-{borough}.html and are listed in https://hausio.co.uk/llms.txt');
parts.push('');
parts.push(`Generated: ${new Date().toISOString().slice(0, 10)}`);

let count = 0;
for (const rel of [...SERVICE_HUBS, ...PAGES, ...blogPosts()]) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) {
    console.warn('пропущен (нет файла): ' + rel);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  parts.push('');
  parts.push('---');
  parts.push('');
  parts.push(`URL: https://hausio.co.uk/${rel}`);
  parts.push(`Title: ${titleOf(html)}`);
  parts.push('');
  parts.push(toText(html));
  count++;
}

const out = parts.join('\n') + '\n';
fs.writeFileSync(OUT, out, 'utf8');
console.log(`llms-full.txt: ${count} страниц, ${Math.round(Buffer.byteLength(out) / 1024)} КБ`);
