#!/usr/bin/env node
// Carry the entity onto every page.
//
// @id references only resolve inside a single document, so a page that says
// "provider": { "@id": ".../#organization" } without also carrying that node
// resolves to an empty, typeless node. This walks every HTML file, and:
//   - adds the compact #organization and #website nodes where missing
//   - normalises a bare (non-@graph) JSON-LD block into a @graph
//   - creates a block from scratch on pages that have none
//   - drops the orphan Place node on the borough hubs
//   - corrects foundingDate to the Companies House incorporation date
//   - repairs Blog.blogPost @id references that point nowhere
//
// Idempotent: running it twice changes nothing.

const fs = require('fs');
const path = require('path');
const entity = require('./lib/entity');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['404.html']);

const LD_RE = /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/;

function htmlFiles(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'assets', 'css', 'js', 'netlify', 'output', 'ads', 'ads_launch', 'seo', 'data', 'scripts'].includes(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) htmlFiles(full, acc);
    else if (name.endsWith('.html') && !SKIP.has(name)) acc.push(full);
  }
  return acc;
}

function urlFor(file) {
  let rel = path.relative(ROOT, file).split(path.sep).join('/');
  if (rel === 'index.html') return 'https://hausio.co.uk/';
  if (rel.endsWith('/index.html')) rel = rel.slice(0, -'index.html'.length);
  return 'https://hausio.co.uk/' + rel;
}

function titleOf(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/);
  if (!m) return null;
  return m[1].replace(/&amp;/g, '&').replace(/&mdash;/g, '—').trim();
}

function typeOf(node) {
  const t = node['@type'];
  return Array.isArray(t) ? t[0] : t;
}

function hasId(graph, id) {
  return graph.some(n => n['@id'] === id);
}

const report = { org: 0, site: 0, wrapped: 0, created: 0, place: 0, founding: 0, blogpost: 0, contact: 0, skipped: [] };

for (const file of htmlFiles(ROOT)) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  let html = fs.readFileSync(file, 'utf8');
  const m = html.match(LD_RE);
  const url = urlFor(file);
  let graph;
  let creating = false;
  let changed = false;

  if (!m) {
    // No structured data at all — build a minimal page node.
    const name = titleOf(html) || 'Hausio';
    graph = [{
      '@type': 'WebPage',
      '@id': url + '#webpage',
      url,
      name,
      inLanguage: 'en-GB',
      isPartOf: { '@id': entity.SITE_ID },
      about: { '@id': entity.ORG_ID },
      breadcrumb: { '@id': url + '#breadcrumb' },
    }, {
      '@type': 'BreadcrumbList',
      '@id': url + '#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hausio.co.uk/' },
        { '@type': 'ListItem', position: 2, name: name.split('—')[0].trim(), item: url },
      ],
    }];
    creating = true;
    changed = true;
    report.created++;
  } else {
    let parsed;
    try {
      parsed = JSON.parse(m[1]);
    } catch (err) {
      report.skipped.push(rel + ' (JSON: ' + err.message + ')');
      continue;
    }
    if (Array.isArray(parsed['@graph'])) {
      graph = parsed['@graph'];
    } else {
      // Bare node — wrap it so the entity nodes have somewhere to live.
      graph = [parsed];
      delete graph[0]['@context'];
      changed = true;
      report.wrapped++;
    }
  }

  // Drop the orphan Place node (borough hubs): no @id, nothing references it,
  // and Service.areaServed already carries the same locality inline.
  const before = graph.length;
  graph = graph.filter(n => !(typeOf(n) === 'Place' && !n['@id']));
  if (graph.length !== before) { changed = true; report.place++; }

  for (const node of graph) {
    // Companies House 17167561 — incorporated 19 April 2026.
    if (node.foundingDate && node.foundingDate !== entity.FOUNDING_DATE) {
      node.foundingDate = entity.FOUNDING_DATE;
      changed = true;
      report.founding++;
    }
    // The full organization node on the homepage and about page lacked a contactPoint.
    if (node['@id'] === entity.ORG_ID && !node.contactPoint) {
      node.contactPoint = entity.orgNode().contactPoint;
      changed = true;
      report.contact++;
    }
    // Blog.blogPost entries must point at the article @id, which is <url>#article.
    if (typeOf(node) === 'Blog' && Array.isArray(node.blogPost)) {
      node.blogPost = node.blogPost.map(entry => {
        if (entry && entry['@id'] && !entry['@id'].includes('#')) {
          changed = true;
          report.blogpost++;
          return { '@id': entry['@id'] + '#article' };
        }
        return entry;
      });
    }
  }

  if (!hasId(graph, entity.ORG_ID)) { graph.push(entity.orgNode()); changed = true; report.org++; }
  if (!hasId(graph, entity.SITE_ID)) { graph.push(entity.websiteNode()); changed = true; report.site++; }

  if (!changed) continue;

  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
  const block = '<script type="application/ld+json">\n' + json + '\n</script>';

  if (creating) {
    html = html.replace('</head>', block + '\n</head>');
  } else {
    html = html.replace(LD_RE, block);
  }
  fs.writeFileSync(file, html, 'utf8');
}

console.log('#organization добавлен на страниц: ' + report.org);
console.log('#website добавлен на страниц:      ' + report.site);
console.log('одиночных нод обёрнуто в @graph:   ' + report.wrapped);
console.log('блоков создано с нуля:             ' + report.created);
console.log('Place-сирот удалено:               ' + report.place);
console.log('foundingDate исправлено:           ' + report.founding);
console.log('contactPoint добавлено:            ' + report.contact);
console.log('ссылок Blog.blogPost починено:     ' + report.blogpost);
if (report.skipped.length) console.log('пропущено:\n  ' + report.skipped.join('\n  '));
