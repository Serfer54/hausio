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

  // Services dropdown toggle (touch + a11y)
  document.querySelectorAll('.nav-dropdown-toggle').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.nav-dropdown-toggle[aria-expanded="true"]').forEach(function (btn) {
      if (!btn.parentElement.contains(e.target)) btn.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-dropdown-toggle[aria-expanded="true"]').forEach(function (btn) {
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      });
    }
  });

  // Smooth scroll offset for sticky header (supports #anchor and /#anchor on home)
  var onHome = location.pathname === '/' || location.pathname === '/index.html';
  document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      var id;
      if (href.charAt(0) === '/') {
        if (!onHome) return;
        id = href.slice(1);
      } else {
        id = href;
      }
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

  // Scroll reveal: auto-tag service cards + work snippets, fade in when visible
  if ('IntersectionObserver' in window) {
    var revealTargets = document.querySelectorAll('.service-grid .service-card, .work-snippets .work-snippet, .why-list-centered li');
    revealTargets.forEach(function (el) { el.classList.add('reveal'); });
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        revealObs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    revealTargets.forEach(function (el) { revealObs.observe(el); });
  }

  // Lazy-load Google Maps iframe via IntersectionObserver (no Maps JS until in view)
  var mapFrames = document.querySelectorAll('.map-frame[data-src]');
  if (mapFrames.length && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var iframe = document.createElement('iframe');
        iframe.src = el.dataset.src;
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('aria-label', el.getAttribute('aria-label') || 'Map');
        iframe.style.cssText = 'width:100%;height:100%;border:0;display:block;';
        el.appendChild(iframe);
        el.removeAttribute('data-src');
        obs.unobserve(el);
      });
    }, { rootMargin: '200px' });
    mapFrames.forEach(function (m) { obs.observe(m); });
  }
})();
