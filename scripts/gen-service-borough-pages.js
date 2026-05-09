#!/usr/bin/env node
// Generate service × borough pages from data/boroughs.json
// Output: /handyman-{slug}.html and /removals-{slug}.html for each borough

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'boroughs.json'), 'utf8'));

const SERVICES = {
  handyman: {
    name: 'Handyman',
    nameLower: 'handyman',
    headline: 'Local handyman in {borough} — repairs, assembly, mounting, small jobs.',
    leadeTpl: 'IKEA flatpacks, TV wall mounting, sash window restoration, minor plumbing and electrics, painting touch-ups. One booking, one visit, one bill — DBS-checked, fully insured, across {borough}.',
    pricingItems: [
      'First hour £65',
      'Subsequent hours £50/hr',
      'Half-day (4h) £215',
      'Full day (8h) £395',
    ],
    pricingNote: 'No call-out fee. Pay after the job is done.',
    bookParam: 'service=handyman',
    schemaServiceType: 'Home repair and maintenance',
    cards: [
      {
        title: 'Repairs & maintenance',
        body: 'Door alignment, lock changes, draught-strip fitting, cabinet handle changes, drawer rail fixes, tile re-grouting, silicone sealing, smoke alarm replacement.',
        bullets: ['Doors, locks, hinges', 'Cabinet & drawer fixes', 'Re-grout & silicone', 'Smoke / CO alarms'],
      },
      {
        title: 'Assembly & mounting',
        body: 'Flat-pack furniture (IKEA, Made.com, Wayfair, Habitat), TV brackets up to 65", curtain rails, blinds, picture hangs, shelving units, mirror mounts.',
        bullets: ['IKEA Pax, Malm, Hemnes, Kallax', 'TV mounting (plasterboard, brick, concrete)', 'Curtain rails & blinds', 'Floating shelves & picture walls'],
      },
      {
        title: 'Plumbing & electrics (non-notifiable)',
        body: 'Tap and washer replacement, toilet seat changes, shower-head swaps, waste-pipe unblocking, light fittings, socket replacement, fuse box trips.',
        bullets: ['Tap & washer changes', 'Toilet seats / cisterns', 'Light fittings & sockets', 'Waste-pipe unblocking'],
      },
    ],
  },
  removals: {
    name: 'Removals',
    nameLower: 'removals',
    headline: 'Man and van removals in {borough} — DBS-checked team, fixed pricing.',
    leadeTpl: 'From a single-item delivery to a full-flat or house move across {borough} — fully insured, DBS-checked team, floor protection on every job, online booking in 60 seconds.',
    pricingItems: [
      '1 mover + van — £55/hr',
      '2 movers + van — £85/hr',
      '3 movers + Luton van — £115/hr',
      'Packing service from £40',
    ],
    pricingNote: '2-hour minimum. £18 added for central-London (EC, WC, W1, SW1, SE1) congestion access.',
    bookParam: 'service=removals',
    schemaServiceType: 'Moving services',
    cards: [
      {
        title: 'Man & van — single items',
        body: 'IKEA delivery, single sofa or fridge moves, single-room packs, one-piece deliveries within London. Cheaper than a full removal but with the same insured, vetted crew.',
        bullets: ['IKEA / Wayfair pickup', 'Sofa, fridge, washing machine', 'Storage drop-offs', '1-mover + Transit from £55/hr'],
      },
      {
        title: 'Flat & house moves',
        body: 'Studio, 1-bed, 2-bed, 3-bed full moves with a 2-3 person crew and a Luton van. Pickup floor + dropoff floor + lift coordination, all built into the quote.',
        bullets: ['2 movers + van £85/hr', '3 movers + Luton £115/hr', 'Floor protection standard', 'Goods-lift booking included'],
      },
      {
        title: 'Office & specialist moves',
        body: 'Small office relocations, piano moves, antiques, listed-building friendly access. We do recces day before for tricky jobs so the move-day is predictable.',
        bullets: ['Office relocations', 'Piano / antique moves', 'Conservation-area aware', 'Day-before recce on tricky jobs'],
      },
    ],
  },
};

const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const escJson = s => String(s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\r/g, '');

function renderSnippet(s) {
  return `      <li class="work-snippet">
        <span class="pc">${esc(s.pc)}</span>
        <h4>${esc(s.title)}</h4>
        <p>${esc(s.body)}</p>
      </li>`;
}

function renderFaqHtml(f) {
  return `      <details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`;
}

function renderFaqSchema(f) {
  return `        { "@type": "Question", "name": "${escJson(f.q)}", "acceptedAnswer": { "@type": "Answer", "text": "${escJson(f.a)}" } }`;
}

function renderServicePage(b, service) {
  const url = `https://hausio.co.uk/${service.nameLower}-${b.slug}.html`;
  const headline = service.headline.replace('{borough}', b.name);
  const lede = service.leadeTpl.replace('{borough}', b.name);
  const title = `${service.name} in ${b.name}, London — Hausio | ${b.headlinePostcodes}`;
  const description = `${service.name} services in ${b.name} ${b.headlinePostcodes}. ${b.serviceFraming[service.nameLower].slice(0, 130)}`;
  const ogTitle = `${service.name} in ${b.name} — Hausio`;

  // Service-specific framing as the lead paragraph in the "Why" section
  const serviceFraming = b.serviceFraming[service.nameLower];

  // Pick borough snippets that mention this service area context (we use all 6 — relevant to all services)
  const snippets = b.snippets;

  // FAQ — we use the borough's general FAQ but prefix with one service-specific question
  const serviceFaq = [
    {
      q: `How quickly can a Hausio ${service.nameLower} reach ${b.name}?`,
      a: `Most ${service.nameLower} bookings in ${b.name} can be filled same-day or next-day. Postcodes ${b.headlinePostcodes} are within our regular daily round, so the team is usually 15–30 minutes away from your address. Book before 10am for a same-day slot.`,
    },
    ...b.faq.slice(0, 2), // First 2 borough FAQ
  ];

  return `<!doctype html>
<html lang="en">
<head>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5RN3TRV4');</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WWJDVWFL7V"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
  gtag('js', new Date()); gtag('config','G-WWJDVWFL7V');
</script>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta name="theme-color" content="#f7f4ef" />
<link rel="canonical" href="${url}" />
<meta name="robots" content="index,follow,max-image-preview:large" />
<meta name="geo.region" content="${esc(b.geoCode)}" />
<meta name="geo.placename" content="${esc(b.name)}, London" />

<meta property="og:type" content="website" />
<meta property="og:site_name" content="Hausio" />
<meta property="og:title" content="${esc(ogTitle)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="https://hausio.co.uk/assets/hero-${service.nameLower === 'removals' ? 'removals' : 'handyman'}.jpg" />
<meta property="og:locale" content="en_GB" />

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="css/style.css?v=13" />

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "${url}#service",
      "name": "Hausio ${escJson(service.name)} in ${escJson(b.name)}",
      "serviceType": "${escJson(service.schemaServiceType)}",
      "description": "${escJson(description)}",
      "provider": { "@id": "https://hausio.co.uk/#organization" },
      "areaServed": {
        "@type": "AdministrativeArea",
        "name": "London Borough of ${escJson(b.name)}",
        "containedInPlace": { "@type": "City", "name": "London" }
      },
      "url": "${url}",
      "image": "https://hausio.co.uk/assets/hero-${service.nameLower === 'removals' ? 'removals' : 'handyman'}.jpg"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hausio.co.uk/" },
        { "@type": "ListItem", "position": 2, "name": "${escJson(service.name)}", "item": "https://hausio.co.uk/${service.nameLower}-london.html" },
        { "@type": "ListItem", "position": 3, "name": "${escJson(b.name)}", "item": "${url}" }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
${serviceFaq.map(renderFaqSchema).join(',\n')}
      ]
    }
  ]
}
</script>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5RN3TRV4" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

<header class="site-header" id="top">
  <div class="container nav">
    <a href="/" class="brand" aria-label="Hausio home">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 48 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 24 L24 8 L42 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 22 V38 H38 V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="20" y="26" width="8" height="8" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </span>
      <span class="brand-name">HAUSIO</span>
    </a>
    <nav class="main-nav" aria-label="Main">
      <div class="nav-item has-dropdown">
        <button type="button" class="nav-dropdown-toggle" aria-haspopup="true" aria-expanded="false">Services <span class="caret" aria-hidden="true">&#9662;</span></button>
        <div class="nav-dropdown" role="menu">
          <a href="/cleaning-london.html" role="menuitem">Cleaning</a>
          <a href="/removals-london.html" role="menuitem">Removals</a>
          <a href="/handyman-london.html" role="menuitem">Handyman</a>
        </div>
      </div>
      <a href="/#how">How it works</a>
      <a href="/blog/">Blog</a>
      <a href="/#faq">FAQ</a>
    </nav>
    <a href="https://wa.me/447304330614" target="_blank" class="nav-wa" aria-label="WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
    <button class="nav-toggle" aria-label="Open menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<main>

<nav class="breadcrumbs container" aria-label="Breadcrumb">
  <a href="/">Home</a> <span aria-hidden="true">/</span> <a href="/${service.nameLower}-london.html">${esc(service.name)}</a> <span aria-hidden="true">/</span> <span>${esc(b.name)}</span>
</nav>

<section class="page-hero">
  <div class="container">
    <p class="eyebrow">${esc(service.name)} · ${esc(b.name)} · ${esc(b.headlinePostcodes)}</p>
    <h1>${esc(headline)}</h1>
    <p class="lede">${esc(lede)}</p>
    <div class="hero-ctas">
      <a href="/book.html?${service.bookParam}" class="btn btn-dark">Book ${esc(service.nameLower)} in ${esc(b.name)} →</a>
      <a href="tel:+447304330614" class="btn btn-outline">Call +44 7304 330 614</a>
    </div>
  </div>
</section>

<section class="services">
  <div class="container">
    <header class="section-head">
      <p class="eyebrow">${esc(service.name)} in ${esc(b.name)}</p>
      <p class="section-lede">${esc(serviceFraming)}</p>
    </header>
    <div class="service-grid">
${service.cards.map(c => `      <article class="service-card">
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.body)}</p>
        <ul class="service-list">
${c.bullets.map(b => `          <li>${esc(b)}</li>`).join('\n')}
        </ul>
      </article>`).join('\n\n')}
    </div>
  </div>
</section>

<section class="why">
  <div class="container">
    <header class="section-head">
      <p class="eyebrow">${esc(b.name)} local intelligence</p>
    </header>
    <ul class="work-snippets">
${snippets.map(renderSnippet).join('\n')}
    </ul>
  </div>
</section>

<section class="pricing">
  <div class="container">
    <header class="section-head">
      <p class="eyebrow">Pricing</p>
    </header>
    <ul class="service-list" style="max-width:480px;margin:0 auto;font-size:1.1em;">
${service.pricingItems.map(i => `      <li>${esc(i)}</li>`).join('\n')}
    </ul>
    <p style="text-align:center;color:var(--muted);margin-top:16px;">${esc(service.pricingNote)}</p>
  </div>
</section>

<section class="coverage">
  <div class="container">
    <header class="section-head">
      <p class="eyebrow">${esc(b.name)} neighbourhoods we cover</p>
      <p class="section-lede">All of ${esc(b.postcodes.join(', '))} plus boundary streets.</p>
    </header>
    <p style="text-align:center; max-width: 720px; margin: 0 auto; color: var(--muted);">
      ${esc(b.neighborhoods.join(' · '))}
    </p>
    <div class="area-links" style="margin-top: 28px;">
      <a href="/areas/${b.slug}.html">All ${esc(b.name)} services →</a>
${b.linkedBoroughs.map(slug => {
  const lb = DATA[slug];
  if (!lb) return '';
  return `      <a href="/${service.nameLower}-${lb.slug}.html">${esc(service.name)} in ${esc(lb.name)} →</a>`;
}).join('\n')}
    </div>
  </div>
</section>

<section class="faq">
  <div class="container">
    <header class="section-head">
      <p class="eyebrow">${esc(service.name)} in ${esc(b.name)} — FAQ</p>
    </header>
    <div class="faq-list">
${serviceFaq.map(renderFaqHtml).join('\n')}
    </div>
  </div>
</section>

<section class="cta-final">
  <div class="container cta-box">
    <h2>Book your ${esc(b.name)} ${esc(service.nameLower)} today.</h2>
    <p>Vetted, insured, fixed pricing. Online in 60 seconds.</p>
    <a href="/book.html?${service.bookParam}" class="btn btn-light">Get your instant quote →</a>
  </div>
</section>

</main>

<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <div class="brand">
        <span class="brand-mark">
          <svg viewBox="0 0 48 44" fill="none"><path d="M6 24 L24 8 L42 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 22 V38 H38 V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="20" y="26" width="8" height="8" stroke="currentColor" stroke-width="1.5"/></svg>
        </span>
        <span class="brand-name">HAUSIO</span>
      </div>
      <p>Cleaning · Removals · Handyman</p>
      <p class="muted">Trusted home services across Greater London.</p>
    </div>
    <div>
      <h4>Services</h4>
      <ul>
        <li><a href="/cleaning-london.html">Cleaning</a></li>
        <li><a href="/removals-london.html">Removals</a></li>
        <li><a href="/handyman-london.html">Handyman</a></li>
      </ul>
    </div>
    <div>
      <h4>Company</h4>
      <ul>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/privacy.html">Privacy</a></li>
      </ul>
    </div>
    <div>
      <h4>Contact</h4>
      <p><a href="tel:+447304330614">+44 7304 330 614</a></p>
      <p><a href="mailto:hausio.co.uk@proton.me">hausio.co.uk@proton.me</a></p>
    </div>
  </div>
  <div class="container footer-bottom">
    <p>© Hausio Ltd · London</p>
  </div>
</footer>

<script src="js/main.js" defer></script>
</body>
</html>
`;
}

let count = 0;
Object.values(DATA).forEach(b => {
  ['handyman', 'removals'].forEach(svcKey => {
    const svc = SERVICES[svcKey];
    const out = renderServicePage(b, svc);
    const filePath = path.join(ROOT, `${svcKey}-${b.slug}.html`);
    fs.writeFileSync(filePath, out, 'utf8');
    count++;
    console.log(`✓ ${svcKey}-${b.slug}.html (${out.length} chars)`);
  });
});
console.log(`\nDone: ${count} service-borough pages generated.`);
