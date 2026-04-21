// Hausio — cookie consent banner + GA4 Consent Mode v2 update
(function () {
  var KEY = 'hausio_consent';
  var banner = document.getElementById('cookie-banner');
  var acceptBtn = document.getElementById('cookie-accept');
  var rejectBtn = document.getElementById('cookie-reject');

  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}

  function grant() {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted'
      });
    }
  }

  if (stored === 'granted') {
    grant();
  } else if (stored === 'denied') {
    // default denied state already active — do nothing
  } else if (banner) {
    banner.hidden = false;
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', function () {
      try { localStorage.setItem(KEY, 'granted'); } catch (e) {}
      grant();
      if (banner) banner.hidden = true;
    });
  }
  if (rejectBtn) {
    rejectBtn.addEventListener('click', function () {
      try { localStorage.setItem(KEY, 'denied'); } catch (e) {}
      if (banner) banner.hidden = true;
    });
  }
})();
