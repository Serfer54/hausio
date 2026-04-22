// Hausio — shared site JS
(function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('is-open'); });
    });
  }

  // Smooth scroll offset for sticky header
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  // GA4 event tracking (also pushes to dataLayer so GTM can fire Google Ads conversions)
  function track(name, params) {
    var p = params || {};
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, p);
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, p));
  }

  document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]').forEach(function (a) {
    a.addEventListener('click', function () { track('click_whatsapp', { link_url: a.href }); });
  });
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
    a.addEventListener('click', function () { track('click_phone', { link_url: a.href }); });
  });
  document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
    a.addEventListener('click', function () { track('click_email', { link_url: a.href }); });
  });
  document.querySelectorAll('a.btn, button.btn').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.id === 'cookie-accept' || b.id === 'cookie-reject') return;
      var label = (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      track('click_cta', { cta_label: label, cta_location: location.pathname });
    });
  });

  // Hero postcode form
  var heroQuote = document.querySelector('.hero-quote');
  if (heroQuote) {
    heroQuote.addEventListener('submit', function () {
      var pcEl = heroQuote.querySelector('input[name="postcode"]');
      var pc = pcEl && pcEl.value ? pcEl.value.trim().toUpperCase().slice(0, 10) : '';
      track('postcode_submit', { postcode_entered: pc });
    });
  }
})();
