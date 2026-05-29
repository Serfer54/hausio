(function () {
  var phoneCodes = [52, 52, 55, 51, 48, 52, 51, 51, 48, 54, 49, 52];
  var waMsgCodes = [
    72, 105, 32, 72, 97, 117, 115, 105, 111, 32, 226, 128, 148, 32, 73, 39, 100,
    32, 108, 105, 107, 101, 32, 97, 32, 113, 117, 111, 116, 101, 46
  ];

  function decode(codes) {
    var s = '';
    for (var i = 0; i < codes.length; i++) s += String.fromCharCode(codes[i]);
    return s;
  }

  function waUrl() {
    return 'https://wa.me/' + decode(phoneCodes) + '?text=' + encodeURIComponent(decode(waMsgCodes));
  }

  function telUrl() {
    return 'tel:+' + decode(phoneCodes);
  }

  function track(name, source) {
    if (window.dataLayer) {
      window.dataLayer.push({ event: name, contact_source: source || 'nav' });
    }
  }

  function bind() {
    var waEls = document.querySelectorAll('[data-wa]');
    for (var i = 0; i < waEls.length; i++) {
      (function (el) {
        el.addEventListener('click', function (e) {
          if (e && e.preventDefault) e.preventDefault();
          var w = window.open(waUrl(), '_blank');
          if (w) { try { w.opener = null; } catch (_) {} }
          track('wa_click', el.dataset.waSource);
        });
        el.setAttribute('rel', 'nofollow noopener');
      })(waEls[i]);
    }

    var telEls = document.querySelectorAll('[data-tel]');
    for (var j = 0; j < telEls.length; j++) {
      (function (el) {
        if (el.tagName === 'A') el.setAttribute('rel', 'nofollow noopener');
        el.addEventListener('click', function (e) {
          if (e && e.preventDefault) e.preventDefault();
          location.href = telUrl();
          track('tel_click', el.dataset.telSource);
        });
        if (!el.textContent.trim()) {
          var p = decode(phoneCodes);
          el.textContent = '+' + p.slice(0, 2) + ' ' + p.slice(2, 6) + ' ' + p.slice(6, 9) + ' ' + p.slice(9);
        }
      })(telEls[j]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
