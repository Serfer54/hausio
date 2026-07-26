#!/usr/bin/env node
// Front-load an extractable "how much" answer + a semantic pricing <table> at the
// top of each of the 8 service hub pages (right after the hero), so AI answer
// engines can lift a concise, tabular price answer instead of the buried <details>.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const CSS = `<style>
  .answer-block{padding:44px 0;border-bottom:1px solid var(--line)}
  .answer-block .container{max-width:840px}
  .answer-block h2{font-size:clamp(1.5rem,2.6vw,2.05rem);margin:0 0 14px}
  .answer-block .answer-lede{font-size:1.06rem;color:var(--ink-2);line-height:1.6;margin:0 0 24px;max-width:70ch}
  .price-table{width:100%;border-collapse:collapse;font-size:1rem;background:#fff;border:1px solid var(--line)}
  .price-table caption{caption-side:top;text-align:left;font-family:var(--sans);font-size:.76rem;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);padding:0 0 10px}
  .price-table th,.price-table td{text-align:left;padding:12px 18px;border-bottom:1px solid var(--line)}
  .price-table thead th{background:var(--cream);font-weight:600;font-size:.78rem;letter-spacing:.05em;text-transform:uppercase;color:var(--ink)}
  .price-table tbody tr:last-child td{border-bottom:none}
  .price-table td b{font-variant-numeric:tabular-nums;white-space:nowrap}
  .answer-note{font-size:.9rem;color:var(--muted);margin:16px 0 0}
</style>`;

const HUBS = {
  'cleaning-london.html': {
    h2: 'How much does a house cleaner cost in London?',
    answer: 'A house cleaner in London costs £22–£32 per hour with Hausio: regular £22/hr, one-off £26/hr, deep cleans £28/hr and end-of-tenancy £32/hr — with a 2-hour minimum and all products and equipment included. A full end-of-tenancy clean typically totals £180–£620 depending on the size of the property.',
    caption: 'Hausio London cleaning prices (2026)',
    head: ['Clean type', 'Price'],
    rows: [['Regular (weekly / fortnightly)', '£22/hr'], ['One-off clean', '£26/hr'], ['Deep clean', '£28/hr'], ['After-builders clean', '£28/hr'], ['End of tenancy', '£32/hr']],
    note: '2-hour minimum · all products & equipment included · Congestion Zone (EC, WC, W1, SW1, SE1) +£18.',
  },
  'man-and-van-london.html': {
    h2: 'How much does a man and van cost in London?',
    answer: 'A man and van in London costs £55/hr for 1 man + van, £85/hr for 2 men + van and £115/hr for 3 men + a Luton van, with a 2-hour minimum. As a total move, a 1-bed flat usually runs £165–£340, a 2-bed £340–£510 and a studio or single item from £110.',
    caption: 'Hausio London move prices (2026)',
    head: ['Move size', 'Crew &amp; time', 'Typical total'],
    rows: [['Single item / studio', '1 man + van · 2–3h', '£110–£165'], ['1-bed flat', '1–2 movers · 3–4h', '£165–£340'], ['2-bed flat', '2 movers · 4–6h', '£340–£510'], ['3-bed house', '3 movers · 6–8h', '£690–£920']],
    note: 'Hourly: 1 man+van £55 · 2 men £85 · 3 men+Luton £115 · 2-hour minimum · Congestion Zone +£18.',
  },
  'handyman-london.html': {
    h2: 'How much does a handyman cost in London?',
    answer: 'A handyman in London costs £65 for the first hour then £50/hour with Hausio, with no call-out fee and nothing to pay until the job is done. A half-day (4 hours) is £215 and a full day (8 hours) £395. Most small jobs — a few shelves, a TV mount, a leaking tap — are finished within the first hour or two.',
    caption: 'Hausio London handyman prices (2026)',
    head: ['Booking', 'Price'],
    rows: [['First hour', '£65'], ['Each hour after', '£50/hr'], ['Half-day (4 hours)', '£215'], ['Full day (8 hours)', '£395']],
    note: 'No call-out fee · pay after the job is done · Congestion Zone +£18.',
  },
  'furniture-assembly-london.html': {
    h2: 'How much does furniture assembly cost in London?',
    answer: 'Furniture assembly in London is from £45/hour (1-hour minimum), or a fixed price by item: an IKEA Pax wardrobe is £85, a Malm bed £45, Hemnes drawers £35, Kallax £25 and a Billy bookcase £20. There is no call-out fee and we clear the packaging when we leave.',
    caption: 'Hausio London flat-pack assembly prices (2026)',
    head: ['Item', 'Fixed price'],
    rows: [['Hourly rate', 'from £45/hr'], ['IKEA Pax wardrobe', '£85'], ['IKEA Malm bed', '£45'], ['IKEA Hemnes drawers', '£35'], ['IKEA Kallax shelving', '£25'], ['IKEA Billy bookcase', '£20']],
    note: '1-hour minimum · IKEA, Made.com, Wayfair &amp; Habitat · packaging cleared away.',
  },
  'tv-mounting-london.html': {
    h2: 'How much does TV wall mounting cost in London?',
    answer: 'TV wall mounting in London is £55 up to 43", £75 for 44–55", £95 for 56–65" and £150 for 66–85". Cable concealment is +£40, a soundbar mount +£25, and we can supply the bracket at cost. We match the fixing to what is behind your plaster — brick, stud or concrete.',
    caption: 'Hausio London TV mounting prices (2026)',
    head: ['TV size', 'Price'],
    rows: [['Up to 43"', '£55'], ['44–55"', '£75'], ['56–65"', '£95'], ['66–85"', '£150']],
    note: 'Cable concealment +£40 · soundbar mount +£25 · bracket supplied at cost.',
  },
  'garden-clearance-london.html': {
    h2: 'How much does garden clearance cost in London?',
    answer: 'Garden clearance in London starts at £120 for a quarter-load, £180 for a half Luton van and £280 for a full load, with stump grinding +£80 per stump. Loading, tip fees and our registered waste-carrier licence are all included, so fly-tipping liability stays with us, not you.',
    caption: 'Hausio London garden clearance prices (2026)',
    head: ['Load size', 'Price'],
    rows: [['Minimum (quarter-load)', '£120'], ['Half Luton van', '£180'], ['Full Luton van', '£280'], ['Stump grinding', '+£80/stump']],
    note: 'Loading, tip fees &amp; waste-carrier licence included · shed dismantle +£60.',
  },
  'waste-removal-london.html': {
    h2: 'How much does waste removal cost in London?',
    answer: 'Waste removal in London is from £55 for a single item, £100 for a small van load, £180 for a half Luton and £280 for a full load. Loading and all waste transfer notes are included, and we hold a registered waste-carrier licence (CBDU on file).',
    caption: 'Hausio London waste removal prices (2026)',
    head: ['Load', 'Price'],
    rows: [['Single item', 'from £55'], ['Small van load', '£100'], ['Half Luton van', '£180'], ['Full Luton van', '£280']],
    note: 'Loading &amp; waste transfer notes included · licensed mattress disposal.',
  },
  'painting-decorating-london.html': {
    h2: 'How much do painters and decorators cost in London?',
    answer: 'Painting and decorating in London is £220 per painter per day, or about £320 for a standard room (walls + ceiling, with prep and two coats included). Sash windows are £85 per side and external doors £140. Materials are supplied at trade cost with no markup.',
    caption: 'Hausio London painting &amp; decorating prices (2026)',
    head: ['Job', 'Price'],
    rows: [['Day rate (per painter)', '£220'], ['Standard room (2 coats)', '£320'], ['Sash window (per side)', '£85'], ['External door', '£140']],
    note: 'Prep, filling, taping &amp; dust-sheeting included · materials at trade cost.',
  },
};

function renderTable(h) {
  const thead = '        <tr>' + h.head.map(c => `<th scope="col">${c}</th>`).join('') + '</tr>';
  const tbody = h.rows.map(r => {
    const cells = r.map((c, i) => i === r.length - 1 ? `<td><b>${c}</b></td>` : `<td>${c}</td>`).join('');
    return '        <tr>' + cells + '</tr>';
  }).join('\n');
  return `      <table class="price-table">
        <caption>${h.caption}</caption>
        <thead>
${thead}
        </thead>
        <tbody>
${tbody}
        </tbody>
      </table>`;
}

function renderBlock(h) {
  return `
<section class="answer-block" id="cost">
  <div class="container">
    <h2>${h.h2}</h2>
    <p class="answer-lede">${h.answer}</p>
${renderTable(h)}
    <p class="answer-note">${h.note}</p>
  </div>
</section>
`;
}

const CSS_ANCHOR = '<link rel="stylesheet" href="css/style.css?v=16" />';
let done = 0;
for (const [file, h] of Object.entries(HUBS)) {
  const fp = path.join(ROOT, file);
  let html = fs.readFileSync(fp, 'utf8');
  if (html.includes('class="answer-block"')) { console.log('skip (already has block):', file); continue; }

  // 1) inject table CSS after the stylesheet link (in <head>)
  if (!html.includes(CSS_ANCHOR)) throw new Error('CSS anchor missing in ' + file);
  html = html.replace(CSS_ANCHOR, CSS_ANCHOR + '\n' + CSS);

  // 2) insert the answer block right after the page-hero </section>
  const heroStart = html.indexOf('<section class="page-hero">');
  if (heroStart < 0) throw new Error('no page-hero in ' + file);
  const heroClose = html.indexOf('</section>', heroStart);
  if (heroClose < 0) throw new Error('no hero close in ' + file);
  const insertAt = heroClose + '</section>'.length;
  html = html.slice(0, insertAt) + '\n' + renderBlock(h) + html.slice(insertAt);

  fs.writeFileSync(fp, html, 'utf8');
  console.log('✓ ' + file);
  done++;
}
console.log('\nDone: ' + done + ' hub pages updated.');
