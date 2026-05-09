#!/usr/bin/env node
// Append all generated borough + service-borough pages to sitemap.xml
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'boroughs.json'), 'utf8'));
const TODAY = new Date().toISOString().slice(0, 10);

const newUrls = [];

// Borough overview pages
Object.values(DATA).forEach(b => {
  newUrls.push({ loc: `https://hausio.co.uk/areas/${b.slug}.html`, priority: '0.7' });
});

// Service × borough pages (handyman + removals)
Object.values(DATA).forEach(b => {
  newUrls.push({ loc: `https://hausio.co.uk/handyman-${b.slug}.html`, priority: '0.75' });
  newUrls.push({ loc: `https://hausio.co.uk/removals-${b.slug}.html`, priority: '0.75' });
});

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');

// Read existing URLs
const existingLocs = new Set();
sitemap.match(/<loc>([^<]+)<\/loc>/g).forEach(m => existingLocs.add(m.replace(/<\/?loc>/g, '')));

// Add only new ones
const additions = newUrls.filter(u => !existingLocs.has(u.loc));
console.log(`Existing URLs: ${existingLocs.size}, new to add: ${additions.length}`);

const blocks = additions.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');

const updated = sitemap.replace('</urlset>', blocks + '\n</urlset>');
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), updated, 'utf8');
console.log(`Sitemap now has ${existingLocs.size + additions.length} URLs.`);
