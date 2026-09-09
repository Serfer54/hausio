#!/usr/bin/env node
// Render approved reviews into the customer reviews page at build time.
//
// Before this, the reviews section shipped as `<section id="reviews" hidden>`
// with an empty grid, filled by js/reviews.js from /api/reviews. Two things made
// dynamic-only reviews invisible to every crawler: /api/ is disallowed in robots.txt for
// User-agent: *, and the AI crawlers (GPTBot, ClaudeBot, PerplexityBot) do not
// execute JavaScript at all. So the page showed "What London says about Hausio"
// with nothing underneath.
//
// js/reviews.js still runs and refreshes the grid client-side, so a newly
// approved review appears immediately for human visitors; re-run this script to
// bake it into the HTML for crawlers.
//
// Usage:  node scripts/render-reviews-static.js [--offline]

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REVIEWS_PAGE = path.join(ROOT, 'leave-a-review.html');
const CACHE = path.join(ROOT, 'data', 'reviews-cache.json');
const SOURCE = 'https://hausio.co.uk/api/reviews';

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function stars(n) {
  n = Math.max(0, Math.min(5, parseInt(n, 10) || 0));
  return '<span class="filled">' + '★'.repeat(n) + '</span>' + '☆'.repeat(5 - n);
}

// Mirrors cardHtml() in js/reviews.js so the static and client-rendered markup match.
function cardHtml(r) {
  const photo = r.photoUrl
    ? '<div class="review-photo"><img src="' + esc(r.photoUrl) + '" alt="Photo shared by a Hausio customer" loading="lazy" /></div>'
    : '';
  const avatar = r.avatarUrl
    ? '<img class="review-avatar" src="' + esc(r.avatarUrl) + '" alt="" loading="lazy" />'
    : '<span class="review-avatar review-avatar-initial" aria-hidden="true">' + esc((r.authorName || '?').charAt(0)) + '</span>';
  const badge = r.verified ? '<span class="review-badge" title="Identity verified via Google">&#10003; Verified</span>' : '';
  const tag = [r.service, r.borough].filter(Boolean).map(esc).join(' · ');
  return '<article class="review-card">'
    + '<div class="review-stars" aria-label="' + (parseInt(r.rating, 10) || 0) + ' out of 5 stars">' + stars(r.rating) + '</div>'
    + (r.title ? '<h3 class="review-title">' + esc(r.title) + '</h3>' : '')
    + '<p class="review-body">' + esc(r.body) + '</p>'
    + photo
    + '<div class="review-author">' + avatar
    + '<span class="review-meta"><b>' + esc(r.authorName) + '</b>' + badge
    + (tag ? '<small>' + tag + '</small>' : '') + '</span></div>'
    + '</article>';
}

async function load() {
  if (process.argv.includes('--offline')) {
    return JSON.parse(fs.readFileSync(CACHE, 'utf8'));
  }
  const res = await fetch(SOURCE, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`${SOURCE} → HTTP ${res.status}`);
  const data = await res.json();
  const list = (data && data.reviews) || [];
  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  fs.writeFileSync(CACHE, JSON.stringify(list, null, 2), 'utf8');
  return list;
}

(async () => {
  let list;
  try {
    list = await load();
  } catch (err) {
    if (fs.existsSync(CACHE)) {
      console.warn(`Не удалось получить ${SOURCE} (${err.message}) — беру кэш.`);
      list = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
    } else {
      console.error(`Не удалось получить отзывы: ${err.message}`);
      process.exit(1);
    }
  }

  const cards = list.slice(0, 12).map(cardHtml).join('\n      ');
  let html = fs.readFileSync(REVIEWS_PAGE, 'utf8');

  // Open the section only when there is something to show.
  const sectionOpen = list.length
    ? '<section class="testimonials" id="reviews">'
    : '<section class="testimonials" id="reviews" hidden>';
  html = html.replace(/<section class="testimonials" id="reviews"(?: hidden)?>/, sectionOpen);

  const grid = list.length
    ? '<div class="reviews-grid" id="reviews-grid">\n      ' + cards + '\n    </div>'
    : '<div class="reviews-grid" id="reviews-grid"></div>';
  // The file mixes CRLF and LF, so match either line ending.
  html = html.replace(
    /<div class="reviews-grid" id="reviews-grid">[\s\S]*?<\/div>(\r?\n)([ \t]*)<div class="how-cta">/,
    grid + '$1$2<div class="how-cta">'
  );

  fs.writeFileSync(REVIEWS_PAGE, html, 'utf8');
  console.log(`Отзывов вписано в leave-a-review.html: ${list.length}${list.length ? '' : ' (секция остаётся скрытой)'}`);
})();
