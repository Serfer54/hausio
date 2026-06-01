(function () {
  'use strict';

  const DELAY_MS = 27000;
  const LS_KEY = 'hausio_popup_v1';
  const SUPPRESS_DAYS = 30;
  const PROMO_CODE = 'HAUSIO10';
  // TURNSTILE_SITEKEY_PROD_REQUIRED — null disables Turnstile widget entirely.
  // Test sitekey 1x00000000000000000000AA renders a red Russian warning to
  // real visitors (kills conversion). When you create a production Turnstile
  // site at dash.cloudflare.com → Turnstile → Add Site, paste the SITE KEY
  // below — the widget code further down auto-activates. See SECURITY_DEPLOY_CHECKLIST.md.
  const TURNSTILE_SITE_KEY = null;

  // Don't show on booking flow or legal pages
  const path = location.pathname;
  if (/\/book\.html$/.test(path) || /\/privacy\.html$/.test(path)) return;

  // Suppress if dismissed or submitted within SUPPRESS_DAYS
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data && data.ts && Date.now() - data.ts < SUPPRESS_DAYS * 86400000) return;
    }
  } catch (e) {}

  function injectStyles() {
    if (document.getElementById('hs-popup-styles')) return;
    const css = `
.hs-popup-overlay{position:fixed;inset:0;background:rgba(20,18,15,0.62);display:flex;align-items:center;justify-content:center;z-index:9000;opacity:0;transition:opacity 220ms ease;padding:16px;font-family:inherit}
.hs-popup-overlay.is-open{opacity:1}
.hs-popup{background:#f7f4ef;max-width:460px;width:100%;padding:38px 34px 32px;border-radius:4px;box-shadow:0 24px 64px rgba(0,0,0,0.22);position:relative;transform:translateY(18px);transition:transform 220ms ease;color:#1a1a1a}
.hs-popup-overlay.is-open .hs-popup{transform:translateY(0)}
.hs-popup-close{position:absolute;top:10px;right:12px;background:none;border:0;width:34px;height:34px;font-size:24px;line-height:1;cursor:pointer;color:#777;border-radius:3px}
.hs-popup-close:hover{color:#000;background:rgba(0,0,0,0.05)}
.hs-popup-eyebrow{font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7a766e;margin:0 0 10px;font-weight:500}
.hs-popup h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;font-weight:400;line-height:1.18;margin:0 0 14px;color:#1a1a1a}
.hs-popup p{font-size:15px;line-height:1.5;color:#454239;margin:0 0 18px}
.hs-popup-form{display:flex;flex-direction:column;gap:10px}
.hs-popup-input{padding:14px 14px;border:1px solid #d0cbc1;border-radius:3px;font-size:15px;background:#fff;font-family:inherit;color:#1a1a1a}
.hs-popup-input:focus{outline:none;border-color:#1a1a1a;box-shadow:0 0 0 1px #1a1a1a}
.hs-popup-btn{background:#1a1a1a;color:#f7f4ef;border:0;padding:14px 24px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;border-radius:3px;font-family:inherit;font-weight:500}
.hs-popup-btn:hover{background:#000}
.hs-popup-btn:disabled{opacity:0.6;cursor:wait}
.hs-popup-fineprint{font-size:12px;color:#8a857a;margin:14px 0 0;line-height:1.45}
.hs-popup-fineprint a{color:#454239;text-decoration:underline}
.hs-popup-code{display:inline-block;background:#1a1a1a;color:#f7f4ef;padding:12px 26px;border-radius:3px;font-family:'Courier New',monospace;font-size:20px;letter-spacing:0.18em;margin:6px 0 14px;font-weight:600}
.hs-popup-success{text-align:center}
.hs-popup-success h2{margin-bottom:10px}
.hs-popup-bot{position:absolute;left:-9999px}
@media (max-width:480px){.hs-popup{padding:30px 22px 26px}.hs-popup h2{font-size:25px}.hs-popup p{font-size:14px}}
`;
    const style = document.createElement('style');
    style.id = 'hs-popup-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'hs-popup-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'hs-popup-title');
    overlay.innerHTML = `
      <div class="hs-popup">
        <button type="button" class="hs-popup-close" aria-label="Close">&times;</button>
        <div class="hs-popup-form-state">
          <p class="hs-popup-eyebrow">Hausio Insider</p>
          <h2 id="hs-popup-title">Get 10% off your first booking.</h2>
          <p>Join Hausio Insider and we'll send you a one-time discount on your first cleaning, man and van, or handyman booking — plus the occasional London-only tip.</p>
          <form class="hs-popup-form" name="newsletter" method="POST" data-netlify="true" netlify-honeypot="bot-field" novalidate>
            <input type="hidden" name="form-name" value="newsletter" />
            <p class="hs-popup-bot"><label>Don't fill this out: <input name="bot-field" tabindex="-1" autocomplete="off" /></label></p>
            <input type="email" name="email" class="hs-popup-input" placeholder="you@example.com" required autocomplete="email" aria-label="Your email" />
            <input type="hidden" name="source" value="" />
            ${TURNSTILE_SITE_KEY ? `<div class="hs-popup-turnstile" data-sitekey="${TURNSTILE_SITE_KEY}"></div>` : ''}
            <button type="submit" class="hs-popup-btn">Send me my 10% off →</button>
          </form>
          <p class="hs-popup-fineprint">By subscribing you agree to our <a href="/privacy.html">privacy policy</a>. One or two emails per month. Unsubscribe anytime.</p>
        </div>
        <div class="hs-popup-success" style="display:none;">
          <p class="hs-popup-eyebrow">You're in</p>
          <h2>Welcome to Hausio Insider.</h2>
          <p>Use this code on your first booking for 10% off:</p>
          <div class="hs-popup-code">${PROMO_CODE}</div>
          <p class="hs-popup-fineprint">We've emailed a copy to your inbox. Code valid on bookings £80+. Excludes the £18 central-London congestion access fee.</p>
        </div>
      </div>
    `;
    return overlay;
  }

  function track(name, params) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: name }, params || {}));
    } catch (e) {}
  }

  function persist(state) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(Object.assign({ ts: Date.now() }, state))); } catch (e) {}
  }

  function loadTurnstile() {
    return new Promise(function (resolve) {
      if (window.turnstile) return resolve(window.turnstile);
      const existing = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.turnstile));
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.defer = true;
      s.onload = () => resolve(window.turnstile);
      document.head.appendChild(s);
    });
  }

  function show() {
    if (document.querySelector('.hs-popup-overlay')) return;
    injectStyles();
    const overlay = buildPopup();
    document.body.appendChild(overlay);

    // Stash current page as `source` so we know where signups came from
    const sourceInput = overlay.querySelector('input[name="source"]');
    if (sourceInput) sourceInput.value = path;

    requestAnimationFrame(() => overlay.classList.add('is-open'));
    track('newsletter_popup_shown', { page: path });

    const form = overlay.querySelector('form');
    const formState = overlay.querySelector('.hs-popup-form-state');
    const successState = overlay.querySelector('.hs-popup-success');
    const closeBtn = overlay.querySelector('.hs-popup-close');
    const submitBtn = form.querySelector('button[type="submit"]');
    const turnstileBox = overlay.querySelector('.hs-popup-turnstile');

    // Render Turnstile widget once the script is loaded — only if a
    // production sitekey is configured (TURNSTILE_SITE_KEY is non-null).
    let turnstileWidgetId = null;
    if (TURNSTILE_SITE_KEY && turnstileBox) {
      loadTurnstile().then(function (ts) {
        if (!ts || !document.body.contains(turnstileBox)) return;
        turnstileWidgetId = ts.render(turnstileBox, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'light',
          size: 'flexible',
        });
      });
    }

    function close() {
      if (!document.body.contains(overlay)) return;
      overlay.classList.remove('is-open');
      setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 240);
      // Only persist dismissal if user actively closed (not after submit — which writes its own state)
      if (!form.dataset.submitted) {
        persist({ dismissed: true });
        track('newsletter_popup_closed', { page: path });
      }
    }

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    function escHandler(e) {
      if (e.key === 'Escape' && document.body.contains(overlay)) {
        close();
        document.removeEventListener('keydown', escHandler);
      }
    }
    document.addEventListener('keydown', escHandler);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const emailInput = form.querySelector('input[name="email"]');
      const email = (emailInput.value || '').trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailInput.focus();
        emailInput.setAttribute('aria-invalid', 'true');
        return;
      }
      // Require Turnstile token only when widget is active (production sitekey).
      // When TURNSTILE_SITE_KEY is null, fall through — Netlify honeypot still
      // catches most bots, and server can re-add Turnstile verification later.
      if (TURNSTILE_SITE_KEY) {
        const tokenInput = form.querySelector('input[name="cf-turnstile-response"]');
        if (!tokenInput || !tokenInput.value) {
          submitBtn.textContent = 'Please complete the challenge';
          setTimeout(() => { submitBtn.textContent = 'Send me my 10% off →'; }, 2200);
          return;
        }
      }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      const params = new URLSearchParams();
      new FormData(form).forEach((v, k) => params.append(k, v));

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      }).then(function (res) {
        if (!res.ok) throw new Error('http ' + res.status);
        form.dataset.submitted = '1';
        formState.style.display = 'none';
        successState.style.display = 'block';
        persist({ submitted: true });
        track('newsletter_signup', { page: path });
      }).catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Try again →';
      });
    });
  }

  function schedule() {
    setTimeout(show, DELAY_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  } else {
    schedule();
  }
})();
