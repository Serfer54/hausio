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

const entity = require('./lib/entity');
const ORG_JSON = entity.nodeJson(entity.orgNode(), 4);
const SITE_JSON = entity.nodeJson(entity.websiteNode(), 4);

const SERVICES = {
  cleaning: {
    key: 'cleaning',
    name: 'Cleaning',
    label: 'cleaning',
    framingKey: 'cleaning',
    heroAsset: 'service-cleaning.jpg',
    headline: 'House cleaning in {borough} — vetted, insured, care for your home.',
    leadeTpl: 'Regular, one-off, deep, end-of-tenancy and after-builders cleaning across {borough}. Same cleaner each visit where you want one, optional eco-friendly products for £15 per visit, nothing to pay until the clean is done.',
    pricingItems: [
      'Regular clean £27/hr',
      'One-off clean £30/hr',
      'Deep £45/hr · after-builders £30/hr',
      'End of tenancy £32/hr',
    ],
    pricingNote: '5-hour minimum. Optional products +£15 per visit. £18 added for central-London (EC, WC, W1, SW1, SE1) congestion access.',
    totals: {
      title: 'What a full end-of-tenancy clean costs in {borough}',
      head: ['Property', 'Typical total'],
      rows: [
        ['Studio', '£180–£240'],
        ['1-bed flat', '£220–£300'],
        ['2-bed flat', '£280–£380'],
        ['3-bed house', '£400–£520'],
        ['4-bed house', '£550–£620'],
      ],
      note: 'Oven and fridge interiors are included in end-of-tenancy cleaning. Optional products cost £15 per visit; any specialist work is quoted before you agree.',
    },
    bookParam: 'service=cleaning',
    schemaServiceType: 'House cleaning',
    priceLow: '27',
    priceHigh: '45',
    offers: [
      { name: 'Regular clean', price: '27', unit: 'HUR' },
      { name: 'One-off clean', price: '30', unit: 'HUR' },
      { name: 'Deep clean', price: '45', unit: 'HUR' },
      { name: 'After-builders clean', price: '30', unit: 'HUR' },
      { name: 'End of tenancy clean', price: '32', unit: 'HUR' },
    ],
    framingDefault: (b) => `Cleaning in ${b.name} is split between regular weekly and fortnightly visits in occupied flats and one-off end-of-tenancy cleans against a letting agent's inventory. We offer eco-friendly products for £15 per visit, work to the inventory where a deposit is at stake, and send the same cleaner back where you want continuity.`,
    title: (b) => `Cleaners in ${b.name}, London — From £27/hr | Hausio`,
    description: (b, framing) => `House cleaning in ${b.name} ${b.headlinePostcodes}. Regular £27/hr, one-off £30/hr, deep £45/hr, end of tenancy £32/hr. ${trimWords(framing, 90)}`,
    cards: [
      {
        title: 'Regular & one-off cleaning',
        body: 'Weekly, fortnightly or one-off visits — kitchens, bathrooms, floors, dusting, beds changed and bins out. Same cleaner each visit where you want continuity, and a key-safe arrangement if you are out at work.',
        bullets: ['Regular £27/hr · one-off £30/hr', 'Same cleaner on request', 'Optional products +£15 per visit', 'Key-safe or keyholder arrangements'],
      },
      {
        title: 'Deep & after-builders cleaning',
        body: 'Limescale, oven interiors, extractor filters, skirting, behind and under appliances, window sills and frames. After a renovation we take the dust down in stages so it does not settle back onto what we just cleaned.',
        bullets: ['Deep £45/hr · after-builders £30/hr', 'Extractor filters; oven interior optional', 'Limescale and grout treatment', 'Post-renovation dust in stages'],
      },
      {
        title: 'End of tenancy cleaning',
        body: 'Built around the inventory your agent will check against, not a generic list — appliances, cupboard interiors, marks on walls and the details deposits actually get held for. Receipt provided for the agent.',
        bullets: ['End of tenancy £32/hr', 'Worked against the inventory', 'Oven, fridge and cupboard interiors', 'Receipt for your letting agent'],
      },
    ],
  },
  handyman: {
    key: 'handyman',
    name: 'Handyman',
    label: 'handyman',
    framingKey: 'handyman',
    heroAsset: 'service-handyman.jpg',
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
    priceLow: '50',
    priceHigh: '395',
    offers: [
      { name: 'First hour', price: '65' },
      { name: 'Each additional hour', price: '50', unit: 'HUR' },
      { name: 'Half day (4 hours)', price: '215' },
      { name: 'Full day (8 hours)', price: '395' },
    ],
    title: (b) => `Handyman in ${b.name}, London | Hausio`,
    description: (b, framing) => `Handyman services in ${b.name} ${b.headlinePostcodes}. ${trimWords(framing, 130)}`,
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
    heroAsset: 'service-removals.jpg',
    headline: 'Man and van in {borough} — DBS-checked crew, transparent hourly pricing, same-day available.',
    leadeTpl: 'From a single-item delivery to a full flat or house move across {borough} — fully insured, DBS-checked crew, floor protection on every job, online booking in 60 seconds.',
    pricingItems: [
      '1 man + van — £65/hr',
      '2 men + van — £90/hr',
      '3 men + Luton van — £115/hr',
      'Packing & wrapping from £40',
    ],
    pricingNote: '3-hour minimum. £18 added for central-London (EC, WC, W1, SW1, SE1) congestion access. Same-day slots available — book before 10am.',
    bookParam: 'service=removals', // internal ID — NOT changed, keeps GA4/Stripe continuity
    schemaServiceType: 'Moving services',
    priceLow: '40',
    priceHigh: '115',
    offers: [
      { name: '1 man + van', price: '65', unit: 'HUR' },
      { name: '2 men + van', price: '90', unit: 'HUR' },
      { name: '3 men + Luton van', price: '115', unit: 'HUR' },
      { name: 'Packing and wrapping from', price: '40' },
    ],
    title: (b) => `Man and Van in ${b.name}, London — From £65/hr | Hausio`,
    description: (b, framing) => `Cheap, reliable man and van in ${b.name} ${b.headlinePostcodes}. 1 man + van £65/hr · 2 men £90/hr · 3 men + Luton £115/hr. Same-day available. Fully insured. ${trimWords(framing, 90)}`,
    cards: [
      {
        title: 'Single items & deliveries',
        body: 'IKEA pickup, single-sofa or fridge moves, one-piece deliveries, end-of-tenancy single-room clear-outs, storage drop-offs across London. Cheaper than a full move but with the same vetted, insured crew.',
        bullets: ['IKEA / Wayfair / Made.com pickup', 'Sofa, fridge, washing machine', 'Storage drop-off & pickup', '1 man + Transit van from £65/hr'],
      },
      {
        title: 'Flat & house moves',
        body: 'Studio, 1-bed, 2-bed and 3-bed full moves with a 2-3 person crew and a Luton van. Pickup floor + dropoff floor + lift coordination + floor protection — all built into the quote, no day-of surprises.',
        bullets: ['2 men + van £90/hr', '3 men + Luton £115/hr', 'Floor protection on every job', 'Goods-lift booking handled'],
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
    priceLow: '20',
    priceHigh: '85',
    offers: [
      { name: 'Hourly rate', price: '45', unit: 'HUR' },
      { name: 'IKEA Pax wardrobe', price: '85' },
      { name: 'IKEA Malm bed', price: '45' },
      { name: 'IKEA Hemnes drawers', price: '35' },
      { name: 'IKEA Kallax', price: '25' },
      { name: 'IKEA Billy bookcase', price: '20' },
    ],
    framingDefault: (b) => `Furniture assembly in ${b.name} is mostly IKEA PAX wardrobes and MALM beds in period conversions and new-build flats alike — we bring the right anchors for lath-and-plaster, stud or solid walls, check the fittings bag before we start, and clear the packaging when we leave.`,
    title: (b) => `Furniture Assembly in ${b.name} | Hausio`,
    description: (b, framing) => `Furniture assembly in ${b.name} ${b.headlinePostcodes}. ${trimWords(framing, 130)}`,
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
    priceLow: '25',
    priceHigh: '150',
    offers: [
      { name: 'TV up to 43 inch', price: '55' },
      { name: 'TV 44 to 55 inch', price: '75' },
      { name: 'TV 56 to 65 inch', price: '95' },
      { name: 'TV 66 to 85 inch', price: '150' },
      { name: 'Cable concealment', price: '40' },
      { name: 'Soundbar mount', price: '25' },
    ],
    framingDefault: (b) => `TV mounting in ${b.name} lives or dies on the wall behind the plaster — solid brick in the older terraces, stud partitions and concrete in the newer blocks. We find what's there before we drill, match the bracket to it, and conceal the cables cleanly.`,
    title: (b) => `TV Mounting in ${b.name} — From £55 | Hausio`,
    description: (b, framing) => `TV wall mounting in ${b.name} ${b.headlinePostcodes}. Up to 43" £55, 44–55" £75, 56–65" £95, 66–85" £150. ${trimWords(framing, 90)}`,
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
    priceLow: '80',
    priceHigh: '280',
    offers: [
      { name: 'Quarter load', price: '120' },
      { name: 'Half Luton van', price: '180' },
      { name: 'Full Luton van', price: '280' },
      { name: 'Stump grinding per stump', price: '80' },
      { name: 'Shed dismantle', price: '60' },
    ],
    framingDefault: (b) => `Garden clearance in ${b.name} runs from overgrown end-of-tenancy plots to shed and decking strip-outs. As a registered waste carrier we handle the tip fees, transfer notes and the licence, so fly-tipping liability never lands back on you.`,
    title: (b) => `Garden Clearance in ${b.name} | Hausio`,
    description: (b, framing) => `Garden clearance in ${b.name} ${b.headlinePostcodes}. From £120. Registered waste carrier — tip fees included. ${trimWords(framing, 90)}`,
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
    priceLow: '55',
    priceHigh: '280',
    offers: [
      { name: 'Single item from', price: '55' },
      { name: 'Small van load', price: '100' },
      { name: 'Half Luton van', price: '180' },
      { name: 'Full Luton van', price: '280' },
    ],
    framingDefault: (b) => `Waste removal in ${b.name} covers single bulky items, full house clearances and post-renovation builders' waste. Every load comes with a waste transfer note, and mattresses, green waste and rubble each go to the right licensed transfer station.`,
    title: (b) => `Waste Removal in ${b.name} | Hausio`,
    description: (b, framing) => `Waste removal in ${b.name} ${b.headlinePostcodes}. From £55 single item, £100 small van. Licensed waste carrier — transfer notes included. ${trimWords(framing, 80)}`,
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
    priceLow: '85',
    priceHigh: '320',
    offers: [
      { name: 'Day rate per painter', price: '220' },
      { name: 'Standard room, walls and ceiling, two coats', price: '320' },
      { name: 'Sash window per side', price: '85' },
      { name: 'External door', price: '140' },
    ],
    framingDefault: (b) => `Painting and decorating in ${b.name} is mostly single rooms and whole-flat repaints in period conversions and lettings. Prep is most of the job — sanding, filling and taping done properly — with Dulux Trade and Farrow & Ball finishes cut in by brush.`,
    title: (b) => `Painters & Decorators in ${b.name} | Hausio`,
    description: (b, framing) => `Painting and decorating in ${b.name} ${b.headlinePostcodes}. £220/day per painter, room £320 (prep + 2 coats included). ${trimWords(framing, 80)}`,
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

// Service-specific FAQs (with extractable prices) — replace the generic borough
// faq pull that was bleeding one service's pricing onto another service's page.
// {borough} tokens are replaced per page.
const SERVICE_FAQS = {
  cleaning: [
    { q: 'How much does a cleaner cost in {borough}?', a: 'A cleaner in {borough} is £27/hour for a regular clean, £30/hour one-off, £45/hour for a deep clean, £30/hour for an after-builders clean and £32/hour for end of tenancy, with a 5-hour minimum. Cleaning products can be added for £15 per visit and there is nothing to pay until the clean is done. A typical 2-bed flat regular clean has a 5-hour minimum.' },
    { q: 'How much is end of tenancy cleaning in {borough}?', a: 'End of tenancy cleaning in {borough} is £32/hour, which usually works out at £180–£240 for a studio, £220–£300 for a 1-bed, £280–£380 for a 2-bed and £400–£520 for a 3-bed. We work against the inventory your agent will check against and give you a receipt for them.' },
  ],
  handyman: [
    { q: 'How much does a handyman cost in {borough}?', a: 'A Hausio handyman in {borough} is £65 for the first hour, then £50/hour, with no call-out fee and nothing to pay until the job is done. A half-day (4h) is £215 and a full day (8h) £395. Most small jobs — a few shelves, a TV mount, a leaking tap — are finished within the first hour or two.' },
    { q: 'What can a handyman do without a registered electrician or plumber?', a: 'Non-notifiable work: swapping taps, washers and toilet seats, changing light fittings, sockets and switches, unblocking waste pipes, hanging TVs, shelves and blinds, and easing doors or changing locks. Anything notifiable — new circuits, gas or boiler work — we will tell you needs a registered specialist.' },
  ],
  'man-and-van': [
    { q: 'How much does a man and van cost in {borough}?', a: 'In {borough} it is £65/hour for 1 man + van, £90/hour for 2 men + van and £115/hour for 3 men + a Luton van, with a 3-hour minimum. Even a short single-item move has a 3-hour minimum; allow a 1-bed flat 3–4 hours and a 2-bed 4–6 hours. Central-zone congestion access adds £18.' },
    { q: 'How much does it cost to move a 1-bed flat in {borough}?', a: 'A 1-bed flat move in {borough} typically runs £195–£360 — usually 1–2 movers and a van for 3–4 hours at £65–£90/hour. A 2-bed is around £360–£540 (2 men, 4–6h) and a studio or single-item move from £195. We provide an estimate up front. Every hour uses the same crew rate, with a 3-hour minimum; selected extras are additional.' },
  ],
  'furniture-assembly': [
    { q: 'How much does furniture assembly cost in {borough}?', a: 'Furniture assembly in {borough} is from £45/hour (1-hour minimum), or fixed-price by item: an IKEA Pax wardrobe is £85, a Malm bed £45, Hemnes drawers £35, Kallax £25 and a Billy bookcase £20. There is no call-out fee and we clear the packaging away when we leave.' },
    { q: 'Do you assemble Made.com, Wayfair and Habitat furniture too?', a: 'Yes — as well as IKEA we build Made.com, Wayfair and Habitat sofa-beds, dining tables and storage beds, working to the spec sheet rather than the box photo. If a fitting is missing we run a missing-parts protocol so it is caught before it costs you a day.' },
  ],
  'tv-mounting': [
    { q: 'How much does TV wall mounting cost in {borough}?', a: 'TV mounting in {borough} is £55 up to 43", £75 for 44–55", £95 for 56–65" and £150 for 66–85". Cable concealment is +£40, a soundbar mount +£25, and we can supply the bracket at cost. We match the fixing to what is behind your plaster — brick, stud or concrete.' },
    { q: 'Can you hide the TV cables in the wall?', a: 'Yes — either surface trunking (cheaper and removable, +£20) or full in-wall concealment for a clean finish (+£40), with power taken to BS 7671. We walk you through both before drilling and add HDMI extenders if your Sky or console box lives elsewhere.' },
  ],
  'garden-clearance': [
    { q: 'How much does garden clearance cost in {borough}?', a: 'Garden clearance in {borough} starts at £120 for a quarter-load, £180 for a half Luton van and £280 for a full load, with stump grinding +£80 per stump. Loading, tip fees and our waste-carrier licence are all included, so fly-tipping liability stays with us, not you.' },
    { q: 'Do you remove sheds and decking in {borough}?', a: 'Yes — we dismantle sheds (+£60), lift decking with the joists and take down fence panels without damaging boundaries; concrete-pad removal is quoted on site. Everything is loaded and taken to a licensed transfer station with the waste transfer note included.' },
  ],
  'waste-removal': [
    { q: 'How much does waste removal cost in {borough}?', a: 'Waste removal in {borough} is from £55 for a single item, £100 for a small van load, £180 for a half Luton and £280 for a full load. Loading and all waste transfer notes are included, and we hold a registered waste-carrier licence (CBDU on file).' },
    { q: 'Can you take away a mattress or fridge in {borough}?', a: 'Yes — mattresses, sofas, fridge-freezers and washing machines are our most common single items, from £55. Mattresses are not kerb-collected by most councils, so we take them properly to a licensed transfer station and send you the transfer note.' },
  ],
  'painting-decorating': [
    { q: 'How much do painters and decorators cost in {borough}?', a: 'Painting in {borough} is £220 per painter per day, or about £320 for a standard room (walls + ceiling, prep and two coats included). Sash windows are £85 per side and external doors £140. Materials are supplied at trade cost with no markup.' },
    { q: 'How long does it take to paint a flat in {borough}?', a: 'A studio is usually 2 painter-days and a 2-bed flat 4–5, done properly with sanding, filling and taping first — prep is most of the job. We sequence rooms so you keep one habitable while the rest dries, and stage furniture rather than move it out.' },
  ],
};

const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const escJson = s => String(s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\r/g, '');

// Trim to a whole-word boundary — never mid-word. Meta descriptions and
// Service.description are what AI models quote back, so a truncated
// "…Wayfair and Habi" reads as a broken page.
const trimWords = (str, max) => {
  const t = String(str || '').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  // Prefer a full sentence; otherwise trim to a word and mark the truncation.
  const dot = cut.lastIndexOf('. ');
  if (dot > max * 0.5) return cut.slice(0, dot + 1);
  const at = cut.lastIndexOf(' ');
  return (at > 0 ? cut.slice(0, at) : cut).replace(/[\s,.;:—-]+$/, '') + '…';
};

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

// Whole-job totals, not just the hourly rate.
// The GSC "AI features" report shows the pages that actually earn AI impressions
// are the ones answering "what will this cost me in total" with a concrete
// number per item or property size — furniture assembly and TV mounting lead
// on exactly that. Hourly rates alone do not answer the question.
function renderTotals(service, b) {
  if (!service.totals) return '';
  return `
    <div class="pricing-totals" style="max-width:680px;margin:28px auto 0;">
      <h3 style="text-align:center;font-size:1.05rem;margin-bottom:14px;">${esc(service.totals.title.replace(/\{borough\}/g, b.name))}</h3>
      <table style="width:100%;border-collapse:collapse;font-size:0.95rem;">
        <thead>
          <tr>
            <th style="text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);">${esc(service.totals.head[0])}</th>
            <th style="text-align:right;padding:10px 12px;border-bottom:1px solid var(--line);">${esc(service.totals.head[1])}</th>
          </tr>
        </thead>
        <tbody>
${service.totals.rows.map(r => `          <tr><td style="padding:10px 12px;border-bottom:1px solid var(--line);">${esc(r[0])}</td><td style="padding:10px 12px;border-bottom:1px solid var(--line);text-align:right;">${esc(r[1])}</td></tr>`).join('\n')}
        </tbody>
      </table>
      <p style="text-align:center;color:var(--muted);margin-top:14px;font-size:0.9rem;">${esc(service.totals.note)}</p>
    </div>`;
}

function renderOffer(o) {
  const unit = o.unit
    ? `, "priceSpecification": { "@type": "UnitPriceSpecification", "price": "${o.price}", "priceCurrency": "GBP", "unitCode": "${o.unit}" }`
    : '';
  return `          { "@type": "Offer", "name": "${escJson(o.name)}", "price": "${o.price}", "priceCurrency": "GBP", "availability": "https://schema.org/InStock"${unit} }`;
}

function renderFaqSchema(f) {
  return `        { "@type": "Question", "name": "${escJson(f.q)}", "acceptedAnswer": { "@type": "Answer", "text": "${escJson(f.a)}" } }`;
}

function renderServicePage(b, service) {
  const url = `https://hausio.co.uk/${service.key}-${b.slug}.html`;
  const specialist = !['cleaning', 'handyman', 'man-and-van'].includes(service.key);
  const bookingAttrs = specialist
    ? `href="#" data-wa data-wa-source="specialist-quote" data-wa-message="${esc(`Hi Hausio, I'd like a quote for ${service.label} in ${b.name}. Page: ${url}`)}"`
    : `href="/book.html?${service.bookParam}"`;
  const headline = service.headline.replace(/\{borough\}/g, b.name);
  const lede = service.leadeTpl.replace(/\{borough\}/g, b.name);
  const serviceFraming = b.serviceFraming[service.framingKey] || (service.framingDefault ? service.framingDefault(b) : '');
  const title = service.title(b);
  const description = service.description(b, serviceFraming);
  const ogTitle = `${service.name} in ${b.name} — Hausio`;

  const snippets = b.snippets;

  const faqLabel = service.label;
  const svcFaqs = (SERVICE_FAQS[service.key] || []).map(f => ({
    q: f.q.replace(/\{borough\}/g, b.name),
    a: f.a.replace(/\{borough\}/g, b.name),
  }));
  const serviceFaq = [
    {
      q: `How quickly can a Hausio ${faqLabel} team reach ${b.name}?`,
      a: `Most ${faqLabel} bookings in ${b.name} can be filled same-day or next-day. Postcodes ${b.headlinePostcodes} are within our regular daily round, so the team is usually 15–30 minutes away from your address. Book before 10am for a same-day slot.`,
    },
    ...svcFaqs,
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
<link rel="stylesheet" href="css/style.css?v=20260909-moving" />

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "${url}#webpage",
      "url": "${url}",
      "name": "${escJson(title)}",
      "description": "${escJson(description)}",
      "inLanguage": "en-GB",
      "isPartOf": { "@id": "https://hausio.co.uk/#website" },
      "about": { "@id": "https://hausio.co.uk/#organization" },
      "breadcrumb": { "@id": "${url}#breadcrumb" },
      "primaryImageOfPage": { "@id": "${url}#primaryimage" },
      "mainEntity": [
        { "@id": "${url}#service" },
        { "@id": "${url}#faq" }
      ],
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [".hero h1", ".hero .lede", ".pricing-card"]
      }
    },
    {
      "@type": "ImageObject",
      "@id": "${url}#primaryimage",
      "url": "https://hausio.co.uk/assets/${service.heroAsset}",
      "contentUrl": "https://hausio.co.uk/assets/${service.heroAsset}"
    },
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
      "image": { "@id": "${url}#primaryimage" },
      "priceRange": "££",
      "termsOfService": "https://hausio.co.uk/book.html",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "GBP",
        "lowPrice": "${service.priceLow}",
        "highPrice": "${service.priceHigh}",
        "availability": "https://schema.org/InStock",
        "areaServed": { "@type": "AdministrativeArea", "name": "London Borough of ${escJson(b.name)}" },
        "offers": [
${service.offers.map(renderOffer).join(',\n')}
        ]
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "${url}#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hausio.co.uk/" },
        { "@type": "ListItem", "position": 2, "name": "${escJson(service.name)}", "item": "https://hausio.co.uk/${service.key}-london.html" },
        { "@type": "ListItem", "position": 3, "name": "${escJson(b.name)}", "item": "${url}" }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "${url}#faq",
      "isPartOf": { "@id": "${url}#webpage" },
      "mainEntity": [
${serviceFaq.map(renderFaqSchema).join(',\n')}
      ]
    },
${ORG_JSON},
${SITE_JSON}
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
          <a href="/man-and-van-london.html" role="menuitem">Man and Van</a>
          <a href="/handyman-london.html" role="menuitem">Handyman</a>
          <a href="/building-works-london.html" role="menuitem">Building Works</a>
          <a href="/plumbing-london.html" role="menuitem">Plumbing</a>
          <a href="/furniture-assembly-london.html" role="menuitem">Furniture Assembly</a>
          <a href="/tv-mounting-london.html" role="menuitem">TV Mounting</a>
          <a href="/garden-maintenance-london.html" role="menuitem">Garden Maintenance</a>
          <a href="/garden-clearance-london.html" role="menuitem">Garden Clearance</a>
          <a href="/waste-removal-london.html" role="menuitem">Waste Removal</a>
          <a href="/painting-decorating-london.html" role="menuitem">Painting &amp; Decorating</a>
        </div>
      </div>
      <a href="/how-it-works.html">How it works</a>
      <a href="/portfolio.html">Our work</a>
      <a href="/leave-a-review.html#reviews">Reviews</a>
      <div class="nav-item has-dropdown">
        <button type="button" class="nav-dropdown-toggle" aria-haspopup="true" aria-expanded="false">Company <span class="caret" aria-hidden="true">&#9662;</span></button>
        <div class="nav-dropdown" role="menu">
          <a href="/about.html" role="menuitem">About us</a>
          <a href="/faq.html" role="menuitem">FAQ</a>
          <a href="/blog/" role="menuitem">Blog</a>
        </div>
      </div>
      <a href="/partners.html">Become a partner</a>
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
      <a ${bookingAttrs} class="btn btn-dark">${specialist ? 'Request a quote for' : 'Book'} ${esc(service.label)} in ${esc(b.name)} →</a>
      <a href="tel:+447304330614" data-tel-source="hero" class="btn btn-outline">Call +44 7304 330614</a>
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
${renderTotals(service, b)}
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
    <p>Vetted, insured, ${service.key === 'man-and-van' ? 'transparent hourly pricing' : 'fixed pricing'}. Online in 60 seconds.</p>
    <a ${bookingAttrs} class="btn btn-light">${specialist ? 'Request a quote on WhatsApp' : 'Get your instant quote'} →</a>
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
        <li><a href="/building-works-london.html">Building Works</a></li>
        <li><a href="/plumbing-london.html">Plumbing</a></li>
        <li><a href="/garden-maintenance-london.html">Garden Maintenance</a></li>
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
      <p><a href="tel:+447304330614" data-tel-source="footer">+44 7304 330614</a></p>
      <p><a href="mailto:hausio.co.uk@proton.me">hausio.co.uk@proton.me</a></p>
    </div>
  </div>
  <div class="container footer-bottom">
    <p>© Hausio Ltd · London</p>
    <p>Registered in England &amp; Wales · Company No. 17167561</p>
  </div>
</footer>

<script src="js/main.js?v=20260909-moving" defer></script>
<script src="js/popup.js?v=20260909-moving" defer></script>
<script src="/js/wa-obfuscate.js?v=20260909-moving" defer></script>
</body>
</html>
`;
}

let count = 0;
Object.values(DATA).forEach(b => {
  Object.keys(SERVICES).forEach(svcKey => {
    const svc = SERVICES[svcKey];
    const out = renderServicePage(b, svc);
    const filePath = path.join(ROOT, `${svc.key}-${b.slug}.html`);
    fs.writeFileSync(filePath, out, 'utf8');
    count++;
    console.log(`✓ ${svc.key}-${b.slug}.html (${out.length} chars)`);
  });
});
console.log(`\nDone: ${count} service-borough pages generated.`);
