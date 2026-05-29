#!/usr/bin/env node
// Idempotent extender: adds scaffold entries for the 17 London boroughs
// missing from data/boroughs.json. Existing entries are NEVER touched.
//
// Scaffolding fields are factual (postcodes, neighborhoods, geoCodes from
// ISO 3166-2:GB, ULEZ status) — not fabricated local colour. Snippets are
// generic-but-true-per-borough so generated pages are not thin content but
// also not falsely specific. Borough-specific deep snippets come next pass.

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.resolve(__dirname, '..', 'data', 'boroughs.json');
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

const SCAFFOLD = {
  westminster: {
    name: 'Westminster', slug: 'westminster', geoCode: 'GB-WSM',
    postcodes: ['W1', 'W2', 'SW1', 'NW1', 'WC1', 'WC2'],
    headlinePostcodes: 'W1 · SW1 · W2',
    neighborhoods: ['Mayfair', 'Marylebone', 'Soho', 'Belgravia', 'Pimlico', 'Bayswater', 'Paddington', 'Knightsbridge (north)', 'Victoria', "St James's", 'Westminster', 'Marble Arch', 'Fitzrovia (south)'],
    boundary: ['Camden', 'Kensington & Chelsea', 'Wandsworth (river)', 'Southwark (river)'],
    linkedBoroughs: ['camden', 'kensington-chelsea'],
    ulez: 'inside Central',
    cpz: 'CPZ Mon–Fri 08:30–18:30 (many sub-zones); £18 Central London Congestion Charge 07:00–18:00 Mon–Fri, 12:00–18:00 Sat–Sun'
  },
  camden: {
    name: 'Camden', slug: 'camden', geoCode: 'GB-CMD',
    postcodes: ['NW1', 'NW3', 'NW5', 'NW6', 'N1C', 'WC1', 'W1T', 'WC2'],
    headlinePostcodes: 'NW1 · NW3 · WC1',
    neighborhoods: ['Camden Town', 'Belsize Park', 'Hampstead', 'Kentish Town', 'Bloomsbury', "King's Cross", 'Holborn (north)', 'Fitzrovia', 'Primrose Hill', 'West Hampstead', 'Tufnell Park', 'Gospel Oak'],
    boundary: ['Westminster', 'Islington', 'Haringey', 'Barnet', 'Brent'],
    linkedBoroughs: ['westminster', 'islington', 'haringey'],
    ulez: 'inside extended ULEZ',
    cpz: 'Camden CPZ Mon–Fri 08:30–18:30 (most sub-zones); part of central postcodes (WC1/W1) inside Congestion Charge'
  },
  hackney: {
    name: 'Hackney', slug: 'hackney', geoCode: 'GB-HCK',
    postcodes: ['N1', 'N16', 'E2', 'E5', 'E8', 'E9'],
    headlinePostcodes: 'E8 · N16 · E5',
    neighborhoods: ['Shoreditch', 'Hoxton', 'Dalston', 'Stoke Newington', 'London Fields', 'Hackney Central', 'Clapton', 'Homerton', 'Stamford Hill', 'De Beauvoir Town'],
    boundary: ['Islington', 'Haringey', 'Waltham Forest', 'Newham', 'Tower Hamlets'],
    linkedBoroughs: ['islington', 'tower-hamlets', 'haringey'],
    ulez: 'inside extended ULEZ',
    cpz: 'Hackney CPZ Mon–Fri 08:30–18:30 (varies); Shoreditch postcodes inside Congestion Charge'
  },
  islington: {
    name: 'Islington', slug: 'islington', geoCode: 'GB-ISL',
    postcodes: ['N1', 'N5', 'N7', 'N19', 'EC1'],
    headlinePostcodes: 'N1 · N7 · EC1',
    neighborhoods: ['Angel', 'Highbury', 'Holloway', 'Archway', 'Tufnell Park (east)', 'Caledonian Road', 'Finsbury', 'Clerkenwell', 'Barnsbury', 'Canonbury'],
    boundary: ['Hackney', 'Haringey', 'Camden', 'City of London'],
    linkedBoroughs: ['camden', 'hackney'],
    ulez: 'inside extended ULEZ',
    cpz: 'Islington CPZ Mon–Fri 08:30–18:30; EC1 postcodes inside Congestion Charge'
  },
  wandsworth: {
    name: 'Wandsworth', slug: 'wandsworth', geoCode: 'GB-WND',
    postcodes: ['SW8', 'SW11', 'SW12', 'SW15', 'SW17', 'SW18', 'SW19'],
    headlinePostcodes: 'SW11 · SW18 · SW15',
    neighborhoods: ['Battersea', 'Clapham (south)', 'Wandsworth', 'Putney', 'Tooting', 'Balham', 'Earlsfield', 'Roehampton', 'Southfields', 'Nine Elms'],
    boundary: ['Hammersmith & Fulham (river)', 'Kensington & Chelsea (river)', 'Lambeth', 'Merton', 'Richmond'],
    linkedBoroughs: ['lambeth', 'merton', 'richmond', 'hammersmith-fulham'],
    ulez: 'inside extended ULEZ',
    cpz: 'Wandsworth CPZ Mon–Fri 08:00–18:30; SW8 boundary with Vauxhall inside Congestion Charge boundary'
  },
  bromley: {
    name: 'Bromley', slug: 'bromley', geoCode: 'GB-BRY',
    postcodes: ['BR1', 'BR2', 'BR3', 'BR5', 'BR6', 'BR7', 'SE6', 'SE9', 'SE12', 'SE19', 'SE20', 'SE25', 'SE26'],
    headlinePostcodes: 'BR1 · BR2 · BR3',
    neighborhoods: ['Bromley', 'Beckenham', 'Orpington', 'Penge', 'West Wickham', 'Chislehurst', 'Bickley', 'Hayes', 'Crystal Palace (south)', 'Mottingham'],
    boundary: ['Lewisham', 'Croydon', 'Bexley', 'Greenwich'],
    linkedBoroughs: ['lewisham', 'greenwich'],
    ulez: 'inside extended ULEZ',
    cpz: 'Bromley CPZ around BR1 town centre only (Mon–Sat 08:30–18:30); most outer postcodes free street parking'
  },
  croydon: {
    name: 'Croydon', slug: 'croydon', geoCode: 'GB-CRY',
    postcodes: ['CR0', 'CR2', 'CR5', 'CR7', 'CR8', 'SE19', 'SE25'],
    headlinePostcodes: 'CR0 · CR2 · CR7',
    neighborhoods: ['Croydon', 'Purley', 'South Norwood', 'Selsdon', 'Thornton Heath', 'Addiscombe', 'Coulsdon', 'Norbury', 'Crystal Palace (south)', 'New Addington'],
    boundary: ['Lambeth', 'Lewisham', 'Sutton', 'Bromley'],
    linkedBoroughs: ['lambeth', 'lewisham'],
    ulez: 'inside extended ULEZ',
    cpz: 'Croydon CPZ around CR0 town centre and CR7 Thornton Heath (Mon–Sat 08:30–18:30); most outer postcodes free'
  },
  bexley: {
    name: 'Bexley', slug: 'bexley', geoCode: 'GB-BEX',
    postcodes: ['DA1', 'DA5', 'DA6', 'DA7', 'DA8', 'DA14', 'DA15', 'DA16', 'SE2', 'SE9', 'SE18', 'SE28'],
    headlinePostcodes: 'DA6 · DA7 · DA8',
    neighborhoods: ['Bexley', 'Bexleyheath', 'Sidcup', 'Welling', 'Crayford', 'Erith', 'Belvedere', 'Slade Green', 'Thamesmead (south)'],
    boundary: ['Greenwich', 'Bromley', 'Dartford', 'Havering (river)'],
    linkedBoroughs: ['greenwich', 'bromley'],
    ulez: 'inside extended ULEZ',
    cpz: 'Bexleyheath town centre CPZ only (Mon–Sat); most postcodes free street parking — among the cheapest move-day costs in London'
  },
  enfield: {
    name: 'Enfield', slug: 'enfield', geoCode: 'GB-ENF',
    postcodes: ['EN1', 'EN2', 'EN3', 'N9', 'N11', 'N13', 'N14', 'N18', 'N21'],
    headlinePostcodes: 'EN1 · N14 · N21',
    neighborhoods: ['Enfield Town', 'Edmonton', 'Palmers Green', 'Southgate', 'Winchmore Hill', 'Cockfosters', 'Bush Hill Park', 'Bowes Park', 'Oakwood'],
    boundary: ['Haringey', 'Barnet', 'Waltham Forest', 'Hertfordshire (border)'],
    linkedBoroughs: ['haringey', 'barnet', 'waltham-forest'],
    ulez: 'inside extended ULEZ',
    cpz: 'Enfield CPZ around EN1 and EN2 town centres only; most postcodes free parking'
  },
  harrow: {
    name: 'Harrow', slug: 'harrow', geoCode: 'GB-HRW',
    postcodes: ['HA1', 'HA2', 'HA3', 'HA5', 'HA7', 'HA8'],
    headlinePostcodes: 'HA1 · HA5 · HA8',
    neighborhoods: ['Harrow', 'Harrow on the Hill', 'Pinner', 'Stanmore', 'Wealdstone', 'Hatch End', 'Kenton', 'Edgware (south)', 'North Harrow'],
    boundary: ['Brent', 'Barnet', 'Hillingdon', 'Hertfordshire (border)'],
    linkedBoroughs: ['brent', 'barnet', 'hillingdon'],
    ulez: 'inside extended ULEZ',
    cpz: 'Harrow CPZ around HA1 town centre and station areas; outer postcodes free parking'
  },
  hillingdon: {
    name: 'Hillingdon', slug: 'hillingdon', geoCode: 'GB-HIL',
    postcodes: ['UB7', 'UB8', 'UB9', 'UB10', 'HA4', 'HA6'],
    headlinePostcodes: 'UB8 · UB7 · HA4',
    neighborhoods: ['Uxbridge', 'Hayes', 'West Drayton', 'Ruislip', 'Northwood', 'Eastcote', 'Yiewsley', 'Hillingdon', 'Ickenham', 'Heathrow Airport (north)'],
    boundary: ['Harrow', 'Ealing', 'Hounslow', 'Buckinghamshire (border)'],
    linkedBoroughs: ['ealing', 'harrow', 'hounslow'],
    ulez: 'inside extended ULEZ',
    cpz: 'Uxbridge town centre CPZ only; most postcodes free parking. Heathrow corridor — frequent corporate relocations'
  },
  hounslow: {
    name: 'Hounslow', slug: 'hounslow', geoCode: 'GB-HNS',
    postcodes: ['TW3', 'TW4', 'TW5', 'TW7', 'TW8', 'TW13', 'TW14', 'W4'],
    headlinePostcodes: 'W4 · TW8 · TW3',
    neighborhoods: ['Hounslow', 'Chiswick', 'Brentford', 'Isleworth', 'Feltham', 'Heston', 'Cranford', 'Hanworth'],
    boundary: ['Ealing', 'Hillingdon', 'Richmond', 'Hammersmith & Fulham'],
    linkedBoroughs: ['ealing', 'richmond', 'hammersmith-fulham'],
    ulez: 'inside extended ULEZ',
    cpz: 'Chiswick (W4) CPZ Mon–Fri 09:00–17:00; Hounslow town centre CPZ; Feltham postcodes mostly free'
  },
  kingston: {
    name: 'Kingston upon Thames', slug: 'kingston', geoCode: 'GB-KTT',
    postcodes: ['KT1', 'KT2', 'KT3', 'KT4', 'KT5', 'KT6', 'KT9'],
    headlinePostcodes: 'KT1 · KT2 · KT5',
    neighborhoods: ['Kingston', 'Surbiton', 'New Malden', 'Chessington', 'Tolworth', 'Norbiton', 'Coombe', 'Berrylands'],
    boundary: ['Richmond', 'Merton', 'Sutton', 'Surrey (border)'],
    linkedBoroughs: ['richmond', 'merton'],
    ulez: 'inside extended ULEZ',
    cpz: 'Kingston town centre and Surbiton CPZ Mon–Sat 08:30–18:30; outer postcodes free parking'
  },
  sutton: {
    name: 'Sutton', slug: 'sutton', geoCode: 'GB-STN',
    postcodes: ['SM1', 'SM2', 'SM3', 'SM4', 'SM5', 'SM6', 'KT4'],
    headlinePostcodes: 'SM1 · SM2 · SM5',
    neighborhoods: ['Sutton', 'Cheam', 'Wallington', 'Carshalton', 'Belmont', 'Worcester Park', 'Rose Hill', 'Hackbridge'],
    boundary: ['Kingston', 'Merton', 'Croydon', 'Surrey (border)'],
    linkedBoroughs: ['merton', 'croydon', 'kingston'],
    ulez: 'inside extended ULEZ',
    cpz: 'Sutton town centre CPZ Mon–Sat; most postcodes free parking'
  },
  redbridge: {
    name: 'Redbridge', slug: 'redbridge', geoCode: 'GB-RDB',
    postcodes: ['IG1', 'IG2', 'IG3', 'IG4', 'IG5', 'IG6', 'E11', 'E12', 'E18'],
    headlinePostcodes: 'IG1 · IG4 · E11',
    neighborhoods: ['Ilford', 'Wanstead', 'Woodford', 'Hainault', 'Barkingside', 'Gants Hill', 'South Woodford', 'Chigwell (west)'],
    boundary: ['Waltham Forest', 'Newham', 'Barking & Dagenham', 'Havering', 'Essex (border)'],
    linkedBoroughs: ['waltham-forest', 'newham'],
    ulez: 'inside extended ULEZ',
    cpz: 'Ilford town centre (IG1) CPZ; most postcodes free parking. Crossrail-driven gentrification in Ilford and Goodmayes'
  },
  havering: {
    name: 'Havering', slug: 'havering', geoCode: 'GB-HAV',
    postcodes: ['RM1', 'RM2', 'RM3', 'RM4', 'RM5', 'RM7', 'RM11', 'RM12', 'RM13', 'RM14'],
    headlinePostcodes: 'RM1 · RM11 · RM14',
    neighborhoods: ['Romford', 'Hornchurch', 'Upminster', 'Rainham', 'Harold Hill', 'Collier Row', 'Elm Park', 'Cranham', 'Gidea Park'],
    boundary: ['Redbridge', 'Barking & Dagenham', 'Essex (border)'],
    linkedBoroughs: ['redbridge', 'barking-dagenham'],
    ulez: 'inside extended ULEZ',
    cpz: 'Romford town centre CPZ; most outer postcodes free parking. Larger family homes than central London — full-day move-day budgets'
  },
  'barking-dagenham': {
    name: 'Barking & Dagenham', slug: 'barking-dagenham', geoCode: 'GB-BDG',
    postcodes: ['IG11', 'RM6', 'RM8', 'RM9', 'RM10'],
    headlinePostcodes: 'IG11 · RM8 · RM10',
    neighborhoods: ['Barking', 'Dagenham', 'Becontree', 'Chadwell Heath', 'Marks Gate', 'Rush Green', 'Upney'],
    boundary: ['Newham', 'Redbridge', 'Havering', 'Bexley (river)'],
    linkedBoroughs: ['newham', 'redbridge', 'havering'],
    ulez: 'inside extended ULEZ',
    cpz: 'Limited CPZ — only around Barking town centre. Most postcodes free street parking — among the cheapest move-day costs in east London'
  }
};

function buildSnippets(b) {
  const first = b.postcodes[0];
  const last = b.postcodes[b.postcodes.length - 1];
  return [
    { pc: first, title: `${b.name} postcode coverage`, body: `We cover all of ${b.name} — ${b.postcodes.join(', ')} — at standard hourly rates. ${b.neighborhoods.slice(0, 4).join(', ')} and the rest of the borough are all within our regular service round.` },
    { pc: 'All', title: 'ULEZ-compliant fleet', body: `${b.name} is ${b.ulez}. All Hausio vans are ULEZ-compliant — no daily charge passed on to you, on any postcode in the borough.` },
    { pc: 'All', title: 'Parking & permits', body: `${b.cpz}. Tradesperson permits when needed are roughly £10/half-day and included in the quote — no day-of surprises.` }
  ];
}

function buildFaq(b) {
  return [
    { q: `Do you cover ${b.name}?`, a: `Yes — we cover all ${b.name} postcodes (${b.postcodes.join(', ')}) at standard hourly rates. ${b.neighborhoods.slice(0, 5).join(', ')} and the rest of the borough are all within our regular round. Same-day slots usually available outside peak Saturdays.` },
    { q: `Are prices the same as central London?`, a: `Same hourly rates across all London boroughs — £55/hr for 1 man and van, £85/hr for 2 men, £115/hr for 3 men + Luton (man and van). Handyman £65 first hour, £50 after. We don't add a central-London premium except where a postcode is inside the £18 Congestion Charge zone (in which case it's shown transparently on the quote, not hidden).` }
  ];
}

function buildFraming(b) {
  return {
    'man-and-van': `Man and van work across ${b.name} ${b.headlinePostcodes} at standard hourly rates — 1 man + van £55/hr, 2 men + van £85/hr, 3 men + Luton £115/hr. ULEZ-compliant fleet on every job. Same-day slots usually available; book before 10am for an early window.`,
    handyman: `Handyman work across ${b.name} — repairs, IKEA and flat-pack assembly, TV mounting, picture hangs, sash window restoration, minor plumbing and electrics. £65 first hour, £50 each additional, fully insured, DBS-checked. Same-week slots standard.`,
    'furniture-assembly': `Furniture assembly across ${b.name} — IKEA Pax wardrobes, Malm beds, Hemnes drawers, Kallax shelving, plus Made.com, Wayfair and Habitat flat-pack. £45/hr or fixed-price by item (Pax £85, Malm £45, Hemnes £35).`,
    'tv-mounting': `TV wall mounting across ${b.name} — plasterboard, brick or concrete walls handled. Up to 43" £55, 44–55" £75, 56–65" £95, 66–85" £150. Cable conceal +£40, soundbar mount +£25. Bracket supplied at cost if needed.`,
    'garden-clearance': `Garden clearance across ${b.name} — overgrowth, hard rubbish, shed and decking dismantle, end-of-tenancy garden recovery. Minimum £120 (quarter-load), half Luton £180, full Luton £280. We're a registered waste carrier — tip fees and transfer notes included.`,
    'waste-removal': `Waste removal across ${b.name} — single items, full house clearance, office and builders' waste. Single item from £55, small van £100, half Luton £180, full Luton £280. We're a registered waste carrier; transfer notes always provided.`,
    'painting-decorating': `Painting and decorating across ${b.name} — single rooms, whole flats, sash window restoration, external doors and trim. Day rate £220/painter or fixed per room (£320 for walls + ceiling, prep included). Dulux trade and Farrow & Ball stocked.`
  };
}

let added = 0;
for (const [slug, meta] of Object.entries(SCAFFOLD)) {
  if (data[slug]) continue;
  data[slug] = {
    name: meta.name,
    slug: meta.slug,
    geoCode: meta.geoCode,
    postcodes: meta.postcodes,
    headlinePostcodes: meta.headlinePostcodes,
    neighborhoods: meta.neighborhoods,
    boundary: meta.boundary,
    linkedBoroughs: meta.linkedBoroughs,
    snippets: buildSnippets(meta),
    faq: buildFaq(meta),
    serviceFraming: buildFraming(meta),
    _scaffold: true
  };
  added++;
  console.log('added scaffold:', slug);
}

if (added > 0) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
console.log('---');
console.log('total boroughs in data:', Object.keys(data).length);
console.log('newly added scaffold:', added);
