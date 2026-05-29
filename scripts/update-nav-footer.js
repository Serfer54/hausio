#!/usr/bin/env node
// Idempotent updater for site-wide nav + footer after the May 2026 services
// expansion (handyman + man-and-van + 5 new SEO-targeted clusters) and the
// April 2026 cleaning pivot-out.
//
// Touches: header nav dropdown, footer services list, footer service summary
// string, footer tel: link (now obfuscated).

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const NAV_OLD = `        <div class="nav-dropdown" role="menu">
          <a href="/cleaning-london.html" role="menuitem">Cleaning</a>
          <a href="/man-and-van-london.html" role="menuitem">Man and Van</a>
          <a href="/handyman-london.html" role="menuitem">Handyman</a>
        </div>`;

const NAV_NEW = `        <div class="nav-dropdown" role="menu">
          <a href="/man-and-van-london.html" role="menuitem">Man and Van</a>
          <a href="/handyman-london.html" role="menuitem">Handyman</a>
          <a href="/furniture-assembly-london.html" role="menuitem">Furniture Assembly</a>
          <a href="/tv-mounting-london.html" role="menuitem">TV Mounting</a>
          <a href="/garden-clearance-london.html" role="menuitem">Garden Clearance</a>
          <a href="/waste-removal-london.html" role="menuitem">Waste Removal</a>
          <a href="/painting-decorating-london.html" role="menuitem">Painting &amp; Decorating</a>
        </div>`;

const FOOTER_SERVICES_OLD = `      <h4>Services</h4>
      <ul>
        <li><a href="/cleaning-london.html">Cleaning</a></li>
        <li><a href="/man-and-van-london.html">Man and Van</a></li>
        <li><a href="/handyman-london.html">Handyman</a></li>
        <li><a href="/blog/">Blog</a></li>
      </ul>`;

const FOOTER_SERVICES_NEW = `      <h4>Services</h4>
      <ul>
        <li><a href="/man-and-van-london.html">Man and Van</a></li>
        <li><a href="/handyman-london.html">Handyman</a></li>
        <li><a href="/furniture-assembly-london.html">Furniture Assembly</a></li>
        <li><a href="/tv-mounting-london.html">TV Mounting</a></li>
        <li><a href="/garden-clearance-london.html">Garden Clearance</a></li>
        <li><a href="/waste-removal-london.html">Waste Removal</a></li>
        <li><a href="/painting-decorating-london.html">Painting &amp; Decorating</a></li>
        <li><a href="/blog/">Blog</a></li>
      </ul>`;

const FOOTER_PROSE_OLD = '<p>Cleaning · Man and Van · Handyman</p>';
const FOOTER_PROSE_NEW = '<p>Man and Van · Handyman · Furniture Assembly · TV Mounting · Garden Clearance · Waste Removal · Painting</p>';

// Tel obfuscation — strip the visible number, JS fills it back at load time.
// `tel:+447304330614` href is removed entirely; bots scanning for tel: prefix won't find it.
const TEL_OLD = '<a href="tel:+447304330614">+44 7304 330 614</a>';
const TEL_NEW = '<a href="#" data-tel data-tel-source="footer" rel="nofollow noopener">Call us</a>';

const TEL_HERO_OLD = '<a href="tel:+447304330614" class="btn btn-outline">Call +44 7304 330 614</a>';
const TEL_HERO_NEW = '<a href="#" data-tel data-tel-source="hero" class="btn btn-outline" rel="nofollow noopener">Call us — tap to dial</a>';

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
let navTouched = 0;
let footerSvcTouched = 0;
let footerProseTouched = 0;
let telTouched = 0;

for (const f of files) {
  let html = fs.readFileSync(f, 'utf8');
  const before = html;

  if (html.includes(NAV_OLD)) {
    html = html.split(NAV_OLD).join(NAV_NEW);
    navTouched++;
  }

  if (html.includes(FOOTER_SERVICES_OLD)) {
    html = html.split(FOOTER_SERVICES_OLD).join(FOOTER_SERVICES_NEW);
    footerSvcTouched++;
  }

  if (html.includes(FOOTER_PROSE_OLD)) {
    html = html.split(FOOTER_PROSE_OLD).join(FOOTER_PROSE_NEW);
    footerProseTouched++;
  }

  if (html.includes(TEL_OLD)) {
    html = html.split(TEL_OLD).join(TEL_NEW);
    telTouched++;
  }

  if (html.includes(TEL_HERO_OLD)) {
    html = html.split(TEL_HERO_OLD).join(TEL_HERO_NEW);
    telTouched++;
  }

  if (html !== before) {
    fs.writeFileSync(f, html, 'utf8');
    console.log('updated:', path.relative(ROOT, f));
  }
}

console.log('---');
console.log('nav dropdowns updated:', navTouched);
console.log('footer services lists updated:', footerSvcTouched);
console.log('footer prose updated:', footerProseTouched);
console.log('tel links obfuscated:', telTouched);
console.log('total files scanned:', files.length);
