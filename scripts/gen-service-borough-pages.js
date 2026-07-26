#!/usr/bin/env node
// Generate service × borough pages from data/boroughs.json
// Output: /handyman-{slug}.html and /man-and-van-{slug}.html for each borough
//
// Note: the booking parameter `service=removals` is the internal ID — it is
// kept for analytics/GA4/Stripe continuity and never exposed in UI copy.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'boroughs.json'), 'utf8'));

const SERVICES = {
  handyman: {
    key: 'handyman',
    name: 'Handyman',
    label: 'handyman',
    framingKey: 'handyman',
    heroAsset: 'hero-handyman.jpg',
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
    title: (b) => `Handyman in ${b.name}, London | Hausio`,
    description: (b, framing) => `Handyman services in ${b.name} ${b.headlinePostcodes}. ${framing.slice(0, 130)}`,
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
  'man-and-van': {
    key: 'man-and-van',
    name: 'Man and Van',
    label: 'man and van',
    framingKey: 'man-and-van',
    heroAsset: 'hero-removals.jpg', // asset filename kept for cache continuity
    headline: 'Man and van in {borough} — DBS-checked crew, fixed pricing, same-day available.',
    leadeTpl: 'From a single-item delivery to a full flat or house move across {borough} — fully insured, DBS-checked crew, floor protection on every job, online booking in 60 seconds.',
    pricingItems: [
      '1 man + van — £55/hr',
      '2 men + van — £85/hr',
      '3 men + Luton van — £115/hr',
      'Packing & wrapping from £40',
    ],
    pricingNote: '2-hour minimum. £18 added for central-London (EC, WC, W1, SW1, SE1) congestion access. Same-day slots available — book before 10am.',
    bookParam: 'service=removals', // internal ID — NOT changed, keeps GA4/Stripe continuity
    schemaServiceType: 'Moving services',
    title: (b) => `Man and Van in ${b.name}, London — From £55/hr | Hausio`,
    description: (b, framing) => `Cheap, reliable man and van in ${b.name} ${b.headlinePostcodes}. 1 man + van £55/hr · 2 men £85/hr · 3 men + Luton £115/hr. Same-day available. Fully insured. ${framing.slice(0, 90)}`,
    cards: [
      {
        title: 'Single items & deliveries',
        body: 'IKEA pickup, single-sofa or fridge moves, one-piece deliveries, end-of-tenancy single-room clear-outs, storage drop-offs across London. Cheaper than a full move but with the same vetted, insured crew.',
        bullets: ['IKEA / Wayfair / Made.com pickup', 'Sofa, fridge, washing machine', 'Storage drop-off & pickup', '1 man + Transit van from £55/hr'],
      },
      {
        title: 'Flat & house moves',
        body: 'Studio, 1-bed, 2-bed and 3-bed full moves with a 2-3 person crew and a Luton van. Pickup floor + dropoff floor + lift coordination + floor protection — all built into the quote, no day-of surprises.',
        bullets: ['2 men + van £85/hr', '3 men + Luton £115/hr', 'Floor protection on every job', 'Goods-lift booking handled'],
      },
      {
        title: 'Office & specialist moves',
        body: 'Small office relocations, piano moves, antiques, listed-building friendly access, conservation-area aware. We do day-before recces for tricky jobs so move-day is predictable.',
        bullets: ['Office relocations', 'Piano & antique moves', 'Conservation-area aware', 'Day-before recce on tricky jobs'],
      },
    ],
  },
  'furniture-assembly': {
    key: 'furniture-assembly',
    name: 'Furniture Assembly',
    label: 'furniture assembly',
    framingKey: 'furniture-assembly',
    heroAsset: 'service-handyman.jpg',
    headline: 'Furniture assembly in {borough} — IKEA, Made.com, Wayfair, fixed-price by item.',
    leadeTpl: 'Pax wardrobes built in tight {borough} flats, Malm and Hemnes finished while you work, Made.com sofas put together properly. £45/hr or fixed-price by item across {borough}.',
    pricingItems: [
      'From £45/hr (1 hour minimum)',
      'IKEA Pax wardrobe £85 fixed',
      'IKEA Malm bed £45 · Hemnes £35',
      'IKEA Kallax £25 · Billy £20',
    ],
    pricingNote: 'No call-out fee. Materials and missing-parts protocol included.',
    bookParam: 'service=handyman',
    schemaServiceType: 'Furniture assembly',
    framingDefault: (b) => `Furniture assembly in ${b.name} is mostly IKEA PAX wardrobes and MALM beds in period conversions and new-build flats alike — we bring the right anchors for lath-and-plaster, stud or solid walls, check the fittings bag before we start, and clear the packaging when we leave.`,
    title: (b) => `Furniture Assembly in ${b.name} | Hausio`,
    description: (b, framing) => `Furniture assembly in ${b.name} ${b.headlinePostcodes}. ${framing.slice(0, 130)}`,
    cards: [
      {
        title: 'IKEA & flat-pack',
        body: 'Pax wardrobes, Malm beds, Hemnes drawers, Kallax shelving, Billy bookcases. We bring the right driver bits, allen keys, and a level. Fittings bag protocol means missing pieces get caught before they cost you a day.',
        bullets: ['Pax wardrobe £85 fixed', 'Malm bed £45 · Hemnes £35', 'Kallax £25 · Billy £20', 'Tight-flat Pax-against-low-cornice'],
      },
      {
        title: 'Wayfair, Made.com, Habitat',
        body: 'Sofa-bed mechanisms, oak dining tables, beds with under-storage drawers. We build to the spec sheet, not the photo on the box — half of Wayfair instructions miss a step.',
        bullets: ['Sofa beds & mechanisms', 'Dining tables & extensions', 'Storage beds & drawers', 'Replacement-fitting orders for you'],
      },
      {
        title: 'Office & complex builds',
        body: 'Standing-desk assembly, dual-monitor arm fitting, office chair builds, bookcase walls, conference-room flat-pack. Walk-in measurement on bigger jobs day before so the build day is just the build.',
        bullets: ['Standing desks & monitor arms', 'Office chair builds', 'Bookcase walls', 'Day-before recce on bigger jobs'],
      },
    ],
  },
  'tv-mounting': {
    key: 'tv-mounting',
    name: 'TV Mounting',
    label: 'TV mounting',
    framingKey: 'tv-mounting',
    heroAsset: 'service-handyman.jpg',
    headline: 'TV wall mounting in {borough} — plasterboard, brick, concrete, cable-conceal.',
    leadeTpl: 'TVs mounted properly across {borough} — right bracket for the wall type, right cable-conceal route for the room, no holes you regret. Up to 85" handled.',
    pricingItems: [
      'Up to 43" — £55',
      '44–55" — £75',
      '56–65" — £95',
      '66–85" — £150',
    ],
    pricingNote: 'Cable conceal +£40. Soundbar mount +£25. Bracket supplied at cost if you need one.',
    bookParam: 'service=handyman',
    schemaServiceType: 'TV installation',
    framingDefault: (b) => `TV mounting in ${b.name} lives or dies on the wall behind the plaster — solid brick in the older terraces, stud partitions and concrete in the newer blocks. We find what's there before we drill, match the bracket to it, and conceal the cables cleanly.`,
    title: (b) => `TV Mounting in ${b.name} — From £55 | Hausio`,
    description: (b, framing) => `TV wall mounting in ${b.name} ${b.headlinePostcodes}. Up to 43" £55, 44–55" £75, 56–65" £95, 66–85" £150. ${framing.slice(0, 90)}`,
    cards: [
      {
        title: 'Standard wall mount',
        body: 'Plasterboard with stud-finder + heavy-duty stud anchors, brick with rawl plugs and into-mortar fixings, concrete with hammer drill. We pick the right fixing for what is actually behind your plaster.',
        bullets: ['Plasterboard, brick, concrete', 'Stud-finder + correct anchors', 'Level on every install', 'Cable management included'],
      },
      {
        title: 'Cable concealment',
        body: 'Trunking (cheap, fast, removable) or in-wall concealment (£££, premium finish) — your call. We walk through both before we drill. HDMI extenders if the source is elsewhere.',
        bullets: ['Trunking +£20', 'In-wall concealment +£40', 'HDMI extenders supplied', 'Power-in-wall to BS 7671'],
      },
      {
        title: 'Multi-device & home cinema',
        body: 'Soundbar mounts, AV-receiver shelving, Sky/Virgin/aerial integration, multi-screen office walls. We co-ordinate with your Sonos/Sky engineer when needed.',
        bullets: ['Soundbar mount +£25', 'AV receiver shelving', 'Sky/Virgin/aerial integration', 'Multi-screen office walls'],
      },
    ],
  },
  'garden-clearance': {
    key: 'garden-clearance',
    name: 'Garden Clearance',
    label: 'garden clearance',
    framingKey: 'garden-clearance',
    heroAsset: 'service-removals.jpg',
    headline: 'Garden clearance in {borough} — overgrowth, sheds, decking, post-tenant recovery.',
    leadeTpl: 'Overgrown gardens cleared, sheds dismantled, decking lifted, end-of-tenancy gardens recovered across {borough}. Registered waste carrier — tip fees, transfer notes and licence all sorted by us.',
    pricingItems: [
      'Minimum — £120 (quarter-load)',
      'Half Luton van — £180',
      'Full Luton van — £280',
      'Stump grinding — +£80/stump',
    ],
    pricingNote: 'Includes loading, tip fees and waste carrier licence. Fly-tipping liability stays with us, not you.',
    bookParam: 'service=removals',
    schemaServiceType: 'Garden waste removal',
    framingDefault: (b) => `Garden clearance in ${b.name} runs from overgrown end-of-tenancy plots to shed and decking strip-outs. As a registered waste carrier we handle the tip fees, transfer notes and the licence, so fly-tipping liability never lands back on you.`,
    title: (b) => `Garden Clearance in ${b.name} | Hausio`,
    description: (b, framing) => `Garden clearance in ${b.name} ${b.headlinePostcodes}. From £120. Registered waste carrier — tip fees included. ${framing.slice(0, 90)}`,
    cards: [
      {
        title: 'One-off clearance',
        body: 'Years of accumulated overgrowth, old pots, broken planters, garden furniture beyond saving. We sort what can be donated locally from what goes to the tip, and we route green-waste separately (cheaper for you).',
        bullets: ['Overgrowth & green waste', 'Broken furniture & planters', 'Green-waste tip routing', 'Donation sorting'],
      },
      {
        title: 'Shed & decking dismantle',
        body: 'Shed flatpack-in-reverse, decking lifted with the joists, fence panels taken down without damaging neighbouring boundaries. Concrete pad removal on quote.',
        bullets: ['Shed dismantle +£60', 'Decking lift-out', 'Fence panel removal', 'Concrete pad on quote'],
      },
      {
        title: 'Post-tenancy recovery',
        body: "Landlord and letting-agent end-of-tenancy garden recovery. We send before/after photos for the deposit-dispute file, and we include the waste transfer note in the same email.",
        bullets: ['End-of-tenancy recovery', 'Before/after photo report', 'Waste transfer notes', 'Letting-agent invoicing'],
      },
    ],
  },
  'waste-removal': {
    key: 'waste-removal',
    name: 'Waste Removal',
    label: 'waste removal',
    framingKey: 'waste-removal',
    heroAsset: 'service-removals.jpg',
    headline: 'Waste removal in {borough} — single items, house clearance, builders’ waste.',
    leadeTpl: 'Single items, full house clearance, office and builders’ waste across {borough}. Registered waste carrier — transfer notes provided every job, so fly-tipping liability never lands back on you.',
    pricingItems: [
      'Single item — from £55',
      'Small van load — £100',
      'Half Luton van — £180',
      'Full Luton van — £280',
    ],
    pricingNote: 'Includes loading and all transfer notes. We hold a waste carrier licence (CBDU on file).',
    bookParam: 'service=removals',
    schemaServiceType: 'Waste removal',
    framingDefault: (b) => `Waste removal in ${b.name} covers single bulky items, full house clearances and post-renovation builders' waste. Every load comes with a waste transfer note, and mattresses, green waste and rubble each go to the right licensed transfer station.`,
    title: (b) => `Waste Removal in ${b.name} | Hausio`,
    description: (b, framing) => `Waste removal in ${b.name} ${b.headlinePostcodes}. From £55 single item, £100 small van. Licensed waste carrier — transfer notes included. ${framing.slice(0, 80)}`,
    cards: [
      {
        title: 'Single items & furniture',
        body: 'Sofa, mattress, fridge-freezer, washing machine, single-item house clearance. Mattresses are not kerb-collected by most councils — we take them properly to a licensed transfer station.',
        bullets: ['Sofa, mattress, fridge from £55', 'Washing machine + dryer', 'Single-item house clear', 'Licensed mattress disposal'],
      },
      {
        title: 'Full house clearance',
        body: 'End-of-tenancy, post-bereavement, downsizing. We sort what is donate-able locally (Emmaus, British Heart Foundation, local hospice) from what goes to the tip — you save on tip fees, charities benefit.',
        bullets: ['End-of-tenancy clearance', 'Post-bereavement house clear', 'Charity donation sorting', 'Itemised receipt for landlords'],
      },
      {
        title: 'Office & builders’ waste',
        body: 'Office furniture clear-out, post-renovation builders’ waste, plasterboard, broken tiles, concrete bagged-up. Builders’ waste goes to a different transfer station — we know which.',
        bullets: ['Office furniture clear-out', 'Builders’ waste & plasterboard', 'Transfer notes for VAT books', 'Same-day for emergencies'],
      },
    ],
  },
  'painting-decorating': {
    key: 'painting-decorating',
    name: 'Painting & Decorating',
    label: 'painting and decorating',
    framingKey: 'painting-decorating',
    heroAsset: 'service-handyman.jpg',
    headline: 'Painters and decorators in {borough} — single rooms to whole flats, prep included.',
    leadeTpl: 'Walls, ceilings, sash windows, external doors and trim painted properly across {borough}. Prep is 70% of the job — we don’t cut corners on sanding, filling and taping. Dulux Trade and Farrow & Ball stocked.',
    pricingItems: [
      'Day rate — £220/painter',
      'Standard room (walls + ceiling, 2 coats) — £320',
      'Sash window per side — £85',
      'External door — £140',
    ],
    pricingNote: 'Prep, filling, taping and dust-sheeting included. Materials supplied at trade cost — no markup.',
    bookParam: 'service=handyman',
    schemaServiceType: 'Painting and decorating',
    framingDefault: (b) => `Painting and decorating in ${b.name} is mostly single rooms and whole-flat repaints in period conversions and lettings. Prep is most of the job — sanding, filling and taping done properly — with Dulux Trade and Farrow & Ball finishes cut in by brush.`,
    title: (b) => `Painters & Decorators in ${b.name} | Hausio`,
    description: (b, framing) => `Painting and decorating in ${b.name} ${b.headlinePostcodes}. £220/day per painter, room £320 (prep + 2 coats included). ${framing.slice(0, 80)}`,
    cards: [
      {
        title: 'Single rooms',
        body: 'Walls and ceiling with proper prep — sanding, filling holes, taping skirting and architraves, dust-sheeting the floor. Two coats minimum, three if the base colour bleeds through (we tell you up front).',
        bullets: ['£320 standard room', 'Prep + 2 coats included', 'Dulux Trade or F&B', 'Three coats if base bleeds'],
      },
      {
        title: 'Whole flat',
        body: 'Studio to 3-bed flats end-to-end, typically 3–6 painter-days. We sequence rooms so you keep one habitable while the rest dries, and we stage furniture rather than move it out.',
        bullets: ['Studio: 2 painter-days', '2-bed: 4–5 painter-days', 'Sequenced rooms (1 habitable)', 'Furniture staged not moved'],
      },
      {
        title: 'Period property & external',
        body: 'Sash window restoration (rebrush after sand-back, glaze putty), external doors (primer + 2 topcoats), Farrow & Ball matte finishes done right (cutting in by brush, not roller). Lincrusta and picture rail work on quote.',
        bullets: ['Sash window per side £85', 'External door £140', 'F&B matte specialist', 'Lincrusta & picture rail on quote'],
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
  const url = `https://hausio.co.uk/${service.key}-${b.slug}.html`;
  const headline = service.headline.replace('{borough}', b.name);
  const lede = service.leadeTpl.replace('{borough}', b.name);
  const serviceFraming = b.serviceFraming[service.framingKey] || (service.framingDefault ? service.framingDefault(b) : '');
  const title = service.title(b);
  const description = service.description(b, serviceFraming);
  const ogTitle = `${service.name} in ${b.name} — Hausio`;

  const snippets = b.snippets;

  const faqLabel = service.label;
  const serviceFaq = [
    {
      q: `How quickly can a Hausio ${faqLabel} team reach ${b.name}?`,
      a: `Most ${faqLabel} bookings in ${b.name} can be filled same-day or next-day. Postcodes ${b.headlinePostcodes} are within our regular daily round, so the team is usually 15–30 minutes away from your address. Book before 10am for a same-day slot.`,
    },
    ...b.faq.slice(0, 2),
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
<meta property="og:image" content="https://hausio.co.uk/assets/${service.heroAsset}" />
<meta property="og:locale" content="en_GB" />

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="css/style.css?v=16" />

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
      "image": "https://hausio.co.uk/assets/${service.heroAsset}"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hausio.co.uk/" },
        { "@type": "ListItem", "position": 2, "name": "${escJson(service.name)}", "item": "https://hausio.co.uk/${service.key}-london.html" },
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
          <a href="/man-and-van-london.html" role="menuitem">Man and Van</a>
          <a href="/handyman-london.html" role="menuitem">Handyman</a>
          <a href="/furniture-assembly-london.html" role="menuitem">Furniture Assembly</a>
          <a href="/tv-mounting-london.html" role="menuitem">TV Mounting</a>
          <a href="/garden-clearance-london.html" role="menuitem">Garden Clearance</a>
          <a href="/waste-removal-london.html" role="menuitem">Waste Removal</a>
          <a href="/painting-decorating-london.html" role="menuitem">Painting &amp; Decorating</a>
        </div>
      </div>
      <a href="/how-it-works.html">How it works</a>
      <a href="/portfolio.html">Our work</a>
      <a href="/blog/">Blog</a>
      <a href="/#faq">FAQ</a>
    </nav>
    <a href="#" data-wa data-wa-source="nav" class="nav-wa" aria-label="WhatsApp" rel="nofollow noopener">
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
    <button class="nav-toggle" aria-label="Open menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<main>

<nav class="breadcrumbs container" aria-label="Breadcrumb">
  <a href="/">Home</a> <span aria-hidden="true">/</span> <a href="/${service.key}-london.html">${esc(service.name)}</a> <span aria-hidden="true">/</span> <span>${esc(b.name)}</span>
</nav>

<section class="page-hero">
  <div class="container">
    <p class="eyebrow">${esc(service.name)} · ${esc(b.name)} · ${esc(b.headlinePostcodes)}</p>
    <h1>${esc(headline)}</h1>
    <p class="lede">${esc(lede)}</p>
    <div class="hero-ctas">
      <a href="/book.html?${service.bookParam}" class="btn btn-dark">Book ${esc(service.label)} in ${esc(b.name)} →</a>
      <a href="#" data-tel data-tel-source="hero" class="btn btn-outline" rel="nofollow noopener">Call us — tap to dial</a>
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
${Object.keys(SERVICES).filter(k => k !== service.key).map(k => `      <a href="/${k}-${b.slug}.html">${esc(SERVICES[k].name)} in ${esc(b.name)} →</a>`).join('\n')}
${b.linkedBoroughs.map(slug => {
  const lb = DATA[slug];
  if (!lb) return '';
  return `      <a href="/${service.key}-${lb.slug}.html">${esc(service.name)} in ${esc(lb.name)} →</a>`;
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
    <h2>Book your ${esc(b.name)} ${esc(service.label)} today.</h2>
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
      <p>Man and Van · Handyman · Furniture Assembly · TV Mounting · Garden Clearance · Waste Removal · Painting</p>
      <p class="muted">Trusted home services across Greater London.</p>
    </div>
    <div>
      <h4>Services</h4>
      <ul>
        <li><a href="/man-and-van-london.html">Man and Van</a></li>
        <li><a href="/handyman-london.html">Handyman</a></li>
        <li><a href="/furniture-assembly-london.html">Furniture Assembly</a></li>
        <li><a href="/tv-mounting-london.html">TV Mounting</a></li>
        <li><a href="/garden-clearance-london.html">Garden Clearance</a></li>
        <li><a href="/waste-removal-london.html">Waste Removal</a></li>
        <li><a href="/painting-decorating-london.html">Painting &amp; Decorating</a></li>
      </ul>
    </div>
    <div>
      <h4>Company</h4>
      <ul>
        <li><a href="/about.html">About</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/privacy.html">Privacy</a></li>
      </ul>
    </div>
    <div>
      <h4>Contact</h4>
      <p><a href="#" data-tel data-tel-source="footer" rel="nofollow noopener">Call us</a></p>
      <p><a href="mailto:hausio.co.uk@proton.me">hausio.co.uk@proton.me</a></p>
    </div>
  </div>
  <div class="container footer-bottom">
    <p>© Hausio Ltd · London</p>
  </div>
</footer>

<script src="js/main.js" defer></script>
<script src="js/popup.js" defer></script>
<script src="/js/wa-obfuscate.js" defer></script>
</body>
</html>
`;
}

let count = 0;
Object.values(DATA).forEach(b => {
  ['handyman', 'man-and-van', 'furniture-assembly', 'tv-mounting', 'garden-clearance', 'waste-removal', 'painting-decorating'].forEach(svcKey => {
    const svc = SERVICES[svcKey];
    const out = renderServicePage(b, svc);
    const filePath = path.join(ROOT, `${svc.key}-${b.slug}.html`);
    fs.writeFileSync(filePath, out, 'utf8');
    count++;
    console.log(`✓ ${svc.key}-${b.slug}.html (${out.length} chars)`);
  });
});
console.log(`\nDone: ${count} service-borough pages generated.`);
