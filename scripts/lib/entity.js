// Shared JSON-LD entity nodes.
//
// Why this exists: @id references only resolve inside a single document.
// Crawlers parse each page in isolation and never follow #organization back
// to the homepage, so every page that references the entity must also carry
// a copy of it. Before this, 276 pages pointed at an organization node that
// was defined on two pages only — Service.provider and BlogPosting.publisher
// resolved to nothing.

const ORG_ID = 'https://hausio.co.uk/#organization';
const SITE_ID = 'https://hausio.co.uk/#website';

const PHONE = '+44-7304-330614';
const PHONE_HREF = 'tel:+447304330614';
const PHONE_DISPLAY = '+44 7304 330614';
const EMAIL = 'hausio.co.uk@proton.me';

// Verified against Companies House 17167561 — incorporated 19 April 2026.
const FOUNDING_DATE = '2026-04-19';

// Only profiles that actually exist. Do not add a placeholder here.
const SAME_AS = [
  'https://www.google.com/maps?cid=14006212585508995202',
  'https://find-and-update.company-information.service.gov.uk/company/17167561',
];

const OPENING_HOURS = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  opens: '08:00',
  closes: '20:00',
};

// Compact organization node — carried on every page so provider/publisher/about
// resolve locally. The homepage and about.html keep the full node on top of this.
function orgNode() {
  return {
    '@type': ['Organization', 'LocalBusiness', 'HomeAndConstructionBusiness'],
    '@id': ORG_ID,
    name: 'Hausio',
    legalName: 'Hausio Ltd',
    url: 'https://hausio.co.uk/',
    logo: { '@type': 'ImageObject', url: 'https://hausio.co.uk/assets/logo.png' },
    telephone: PHONE,
    email: EMAIL,
    priceRange: '££',
    foundingDate: FOUNDING_DATE,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'London',
      addressRegion: 'Greater London',
      addressCountry: 'GB',
    },
    areaServed: { '@type': 'AdministrativeArea', name: 'Greater London' },
    identifier: { '@type': 'PropertyValue', propertyID: 'Companies House', value: '17167561' },
    contactPoint: [{
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: PHONE,
      email: EMAIL,
      areaServed: 'GB',
      availableLanguage: ['en-GB'],
      hoursAvailable: OPENING_HOURS,
    }],
    openingHoursSpecification: [OPENING_HOURS],
    sameAs: SAME_AS.slice(),
  };
}

function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: 'https://hausio.co.uk/',
    name: 'Hausio',
    description: 'London home services — cleaning, man and van, handyman, across all 32 boroughs.',
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-GB',
  };
}

// Render a node as JSON indented to sit inside an existing "@graph": [ ... ].
function nodeJson(node, indentSpaces) {
  const pad = ' '.repeat(indentSpaces);
  return JSON.stringify(node, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? pad + line : pad + line))
    .join('\n');
}

module.exports = {
  ORG_ID, SITE_ID, PHONE, PHONE_HREF, PHONE_DISPLAY, EMAIL, FOUNDING_DATE, SAME_AS, OPENING_HOURS,
  orgNode, websiteNode, nodeJson,
};
