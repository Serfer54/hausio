// Hausio — multi-step booking flow + live price calculator + (optional) Stripe £50 deposit
(function () {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.step[data-step]'));
  const progressItems = Array.from(document.querySelectorAll('.progress li[data-step]'));
  const panels = Array.from(form.querySelectorAll('.service-panel'));
  const summaryList = document.getElementById('summary-list');
  const summaryTotal = document.getElementById('summary-total');

  let current = 1;
  const maxSteps = 4;

  // Feature flag — set to true to re-enable the £50 Stripe deposit at booking.
  // Off by default while building review velocity (post-job billing only).
  // Re-enable after ~50 reviews + 4.5+ Trustpilot/Google rating.
  const DEPOSIT_ENABLED = false;

  /* ---------- Checkout session state ---------- */
  // When DEPOSIT_ENABLED is true, the £50 deposit is charged through Stripe-
  // hosted Checkout. The session is created on /api/checkout-session and we
  // redirect to session.url; the secret key never touches the browser.
  const CHECKOUT_STATE_KEY = 'hausio_pending_booking';
  let checkoutInFlight = false;

  /* ---------- Pricing model ---------- */
  const PRICES = {
    cleaning: {
      regular: 22, 'one-off': 26, deep: 28, eot: 32, builders: 30,
      extras: { oven: 25, fridge: 15, windows: 20, ironing: 20, laundry: 15 },
      supplies: { own: 0, hausio: 15 },
      bedroomSurcharge: 4,   // per bedroom beyond 2
      bathroomSurcharge: 5,  // per bathroom beyond 1
    },
    removals: {
      crew: { 1: 55, 2: 85, 3: 115 },
      extras: { luton: 15 /*per hour*/, packing: 40, materials: 35, dismantle: 30 },
    },
    handyman: {
      firstHour: 65,
      laterHour: 50,
      halfDay: 215,
      fullDay: 395,
    },
    frequency: { 'one-off': 1, weekly: 1, fortnightly: 1, monthly: 1 },
    congestionCharge: 18, // Central London access surcharge
  };

  // Outward codes inside the TfL Central London Congestion Zone.
  // Allow EC1-4 + sub-district letter, WC1-2 + sub-district letter, and the exact W1/SW1/SE1 areas
  // (with optional sub-district letter) so that W10-W14, SW2-SW20, SE2-SE28 are NOT matched.
  const CENTRAL_OUTWARD = /^(EC[1-4][A-Z]?|WC[12][A-Z]?|W1[A-Z]?|SW1[A-Z]?|SE1[A-Z]?)$/;

  function isCentralLondon(postcode) {
    if (!postcode) return false;
    const p = postcode.toUpperCase().trim();
    // Extract the outward code (e.g. "W14", "SW1", "EC1V") from a full or partial UK postcode.
    let m = p.match(/^([A-Z]{1,2}[0-9][A-Z0-9]?)\s*[0-9][A-Z]{2}$/);
    if (!m) m = p.match(/^([A-Z]{1,2}[0-9][A-Z0-9]?)$/);
    if (!m) return false;
    return CENTRAL_OUTWARD.test(m[1]);
  }

  /* ---------- Analytics helper ---------- */
  function track(name, params) {
    const p = params || {};
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, p);
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, p));
  }

  /* ---------- Navigation ---------- */
  function showStep(n) {
    current = n;
    steps.forEach(s => {
      const step = Number(s.dataset.step);
      s.classList.toggle('is-active', step === n);
    });
    progressItems.forEach(li => {
      const step = Number(li.dataset.step);
      li.classList.toggle('is-active', step === n);
      li.classList.toggle('is-done', step < n);
    });
    window.scrollTo({ top: document.querySelector('.booking').offsetTop - 80, behavior: 'smooth' });
    track('booking_step', { step_number: n });
  }

  /* ---------- Stripe Checkout ---------- */
  function setPaymentError(msg) {
    const el = document.getElementById('payment-error');
    if (!el) return;
    if (!msg) { el.hidden = true; el.textContent = ''; return; }
    el.hidden = false;
    el.textContent = msg;
  }

  function buildBookingPayload() {
    const formData = new FormData(form);
    const chosenService = form.querySelector('input[name="service"]:checked');
    const totalStr = summaryTotal ? summaryTotal.textContent.replace(/[^0-9.]/g, '') : '0';
    const totalNum = Number(totalStr) || 0;

    const isMove = chosenService && chosenService.value === 'removals';
    const checkoutPayload = {
      service: chosenService ? chosenService.value : '',
      fullName: formData.get('name') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      postcode: formData.get('postcode') || '',
      address: formData.get('address') || '',
      date: formData.get('date') || '',
      time: formData.get('time') || '',
      frequency: formData.get('frequency') || '',
      estimatedTotal: '£' + totalNum,
    };
    if (isMove) {
      checkoutPayload.dropoffPostcode = formData.get('dropoff-postcode') || '';
      checkoutPayload.dropoffAddress = formData.get('dropoff-address') || '';
      checkoutPayload.pickupFloor = formData.get('pickup-floor') || '';
      checkoutPayload.pickupLift = formData.get('pickup-lift') || '';
      checkoutPayload.dropoffFloor = formData.get('dropoff-floor') || '';
      checkoutPayload.dropoffLift = formData.get('dropoff-lift') || '';
    }

    // Filter to only fields relevant to the chosen service so the email is clean
    const svc = checkoutPayload.service;
    const COMMON = new Set([
      'service', 'frequency', 'date', 'time', 'postcode', 'address',
      'name', 'email', 'phone', 'notes', 'terms',
    ]);
    const SERVICE_FIELDS = {
      cleaning: ['clean-type', 'clean-bed', 'clean-bath', 'clean-hours', 'clean-supplies', 'clean-extra'],
      removals: ['move-type', 'move-crew', 'move-hours', 'move-extra',
                 'pickup-postcode', 'pickup-address', 'pickup-floor', 'pickup-lift',
                 'dropoff-postcode', 'dropoff-address', 'dropoff-floor', 'dropoff-lift'],
      handyman: ['handy-type', 'handy-hours', 'handy-extra'],
    };
    const allowed = new Set([...COMMON, ...(SERVICE_FIELDS[svc] || [])]);
    const formSubmitPayload = {};
    formData.forEach((v, k) => { if (allowed.has(k) && v !== '' && v !== null && v !== undefined) formSubmitPayload[k] = v; });
    formSubmitPayload['estimated-total'] = '£' + totalNum;
    formSubmitPayload['deposit-paid'] = DEPOSIT_ENABLED ? '£50' : '£0 (pay-after-job)';
    formSubmitPayload['submitted-from'] = location.href;
    const subjectTail = DEPOSIT_ENABLED ? ' · deposit paid' : ' · pay after job';
    formSubmitPayload._subject = 'New Hausio booking: ' + (checkoutPayload.service || 'unknown') + ' · £' + totalNum + subjectTail;
    formSubmitPayload._template = 'table';
    formSubmitPayload._captcha = 'false';
    formSubmitPayload._cc = 'serfer7501@gmail.com';

    return { checkoutPayload, formSubmitPayload, totalNum, service: checkoutPayload.service };
  }

  function showSuccess() {
    steps.forEach(s => s.classList.remove('is-active'));
    const ok = form.querySelector('[data-step="success"]');
    if (ok) ok.classList.add('is-active');
    progressItems.forEach(li => { li.classList.add('is-done'); li.classList.remove('is-active'); });
  }

  function validateStep(n) {
    if (n === 1) {
      const chosen = form.querySelector('input[name="service"]:checked');
      if (!chosen) { alert('Please choose a service to continue.'); return false; }
      return true;
    }
    if (n === 3) {
      const date = form.date.value;
      const postcode = form.postcode.value.trim();
      const address = form.address.value.trim();
      if (!date || !postcode || !address) {
        alert('Please fill in the date, postcode, and address.');
        return false;
      }
      if (isRemovals()) {
        const dPostcode = (form['dropoff-postcode'] && form['dropoff-postcode'].value || '').trim();
        const dAddress = (form['dropoff-address'] && form['dropoff-address'].value || '').trim();
        if (!dPostcode || !dAddress) {
          alert('Please fill in the dropoff postcode and address for the removal.');
          return false;
        }
      }
    }
    return true;
  }

  function isRemovals() {
    const chosen = form.querySelector('input[name="service"]:checked');
    return !!(chosen && chosen.value === 'removals');
  }

  form.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!validateStep(current)) return;
      if (current < maxSteps) showStep(current + 1);
    });
  });
  form.querySelectorAll('[data-prev]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (current > 1) showStep(current - 1);
    });
  });

  /* ---------- Service panel switching ---------- */
  function updatePanels() {
    const chosen = form.querySelector('input[name="service"]:checked');
    const val = chosen ? chosen.value : null;
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.for === val));
    applyRemovalsLayout(val === 'removals');
    calculate();
  }

  function applyRemovalsLayout(isMove) {
    // Re-label the existing postcode/address pair so it reads "Pickup …" for removals
    // and reverts to "Postcode" / "Address" for cleaning + handyman jobs.
    const postcodeLabel = form.querySelector('[data-label-for-postcode]');
    const addressLabel = form.querySelector('[data-label-for-address]');
    if (postcodeLabel) postcodeLabel.textContent = isMove ? 'Pickup postcode' : 'Postcode';
    if (addressLabel) addressLabel.textContent = isMove ? 'Pickup address' : 'Address';

    // Show / hide the dropoff block and toggle required on its inputs.
    form.querySelectorAll('[data-removals-only]').forEach(el => {
      el.hidden = !isMove;
      el.querySelectorAll('input, select').forEach(input => {
        if (input.name === 'dropoff-postcode' || input.name === 'dropoff-address') {
          input.required = isMove;
        }
      });
    });

    // Removals are one-off jobs by definition, so the frequency picker is meaningless there.
    form.querySelectorAll('[data-removals-hidden]').forEach(el => {
      el.hidden = isMove;
    });
    if (isMove && form.frequency) form.frequency.value = 'one-off';
  }
  form.querySelectorAll('input[name="service"]').forEach(r =>
    r.addEventListener('change', () => {
      updatePanels();
      if (r.checked) track('select_service', { service: r.value });
    })
  );

  /* ---------- Price calculation ---------- */
  function calculate() {
    const chosen = form.querySelector('input[name="service"]:checked');
    if (!chosen) {
      renderSummary([], 0);
      return;
    }
    const service = chosen.value;
    let total = 0;
    const lines = [];

    if (service === 'cleaning') {
      const type = form['clean-type'].value;
      const hours = Number(form['clean-hours'].value);
      const beds = Number(form['clean-bed'].value);
      const baths = Number(form['clean-bath'].value);
      const rate = PRICES.cleaning[type] || 22;
      const subtotal = rate * hours;
      lines.push([labelCleanType(type) + ' · ' + hours + 'h', '£' + subtotal]);
      total += subtotal;
      const bedExtra = Math.max(0, beds - 2) * PRICES.cleaning.bedroomSurcharge * hours;
      if (bedExtra) { lines.push([`${beds} bedrooms surcharge`, '£' + bedExtra]); total += bedExtra; }
      const bathExtra = Math.max(0, baths - 1) * PRICES.cleaning.bathroomSurcharge * hours;
      if (bathExtra) { lines.push([`${baths} bathrooms surcharge`, '£' + bathExtra]); total += bathExtra; }
      const supplies = form['clean-supplies'].value;
      const suppliesAmt = PRICES.cleaning.supplies[supplies] || 0;
      if (suppliesAmt) {
        lines.push(['Eco-friendly products', '£' + suppliesAmt]);
        total += suppliesAmt;
      }
      form.querySelectorAll('input[name="clean-extra"]:checked').forEach(c => {
        const amt = PRICES.cleaning.extras[c.value] || 0;
        lines.push([labelExtra(c.value), '£' + amt]);
        total += amt;
      });
    }

    if (service === 'removals') {
      const crew = Number(form['move-crew'].value);
      const hours = Number(form['move-hours'].value);
      const rate = PRICES.removals.crew[crew] || 85;
      const subtotal = rate * hours;
      lines.push([`${crew} mover${crew > 1 ? 's' : ''} + van · ${hours}h`, '£' + subtotal]);
      total += subtotal;
      form.querySelectorAll('input[name="move-extra"]:checked').forEach(c => {
        let amt = PRICES.removals.extras[c.value] || 0;
        if (c.value === 'luton') amt = amt * hours;
        lines.push([labelExtra(c.value), '£' + amt]);
        total += amt;
      });
    }

    if (service === 'handyman') {
      const hours = Number(form['handy-hours'].value);
      let subtotal;
      if (hours === 4) subtotal = PRICES.handyman.halfDay;
      else if (hours === 8) subtotal = PRICES.handyman.fullDay;
      else subtotal = PRICES.handyman.firstHour + Math.max(0, hours - 1) * PRICES.handyman.laterHour;
      lines.push([`Handyman · ${hours}h`, '£' + subtotal]);
      total += subtotal;
    }

    // Central London congestion surcharge (step 3 postcode)
    const postcodeEl = form.postcode;
    if (postcodeEl && isCentralLondon(postcodeEl.value)) {
      lines.push(['Central London access', '£' + PRICES.congestionCharge]);
      total += PRICES.congestionCharge;
    }

    renderSummary(lines, total);
  }

  function renderSummary(lines, total) {
    if (!summaryList) return;
    if (!lines.length) {
      summaryList.innerHTML = '<li class="summary-empty">Select a service to see your live quote.</li>';
    } else {
      summaryList.innerHTML = lines.map(([l, v]) =>
        `<li><span>${l}</span><span>${v}</span></li>`
      ).join('');
    }
    summaryTotal.textContent = '£' + total;
  }

  /* ---------- Labels ---------- */
  function labelCleanType(v) {
    return ({ regular: 'Regular clean', 'one-off': 'One-off clean', deep: 'Deep clean', eot: 'End of tenancy', builders: 'After-builders' })[v] || v;
  }
  function labelExtra(v) {
    return ({
      oven: 'Oven cleaning', fridge: 'Inside fridge', windows: 'Inside windows',
      ironing: 'Ironing', laundry: 'Laundry',
      luton: 'Large Luton van', packing: 'Packing service', materials: 'Boxes & materials', dismantle: 'Dismantle/reassemble',
    })[v] || v;
  }

  /* ---------- Live recalculate ---------- */
  form.addEventListener('change', calculate);
  form.addEventListener('input', calculate);

  /* ---------- Submit ---------- */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.terms.checked) {
      alert('Please accept the terms to continue.');
      return;
    }
    if (checkoutInFlight) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.textContent : '';
    setPaymentError('');
    checkoutInFlight = true;

    const { checkoutPayload, formSubmitPayload, totalNum, service: serviceVal } = buildBookingPayload();

    // ---- Pay-after-job flow (DEPOSIT_ENABLED = false) ----
    if (!DEPOSIT_ENABLED) {
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending booking…'; }

      // Dual delivery: Web3Forms (primary email via SendGrid - delivers to proton)
      // + Netlify Forms (backup inbox + triggers submission-created Resend function)
      const w3Payload = Object.assign(
        { access_key: '2037c101-86d9-46c3-804d-883183a79376', subject: 'New Hausio booking: ' + (serviceVal || 'unknown'), from_name: 'Hausio Website' },
        formSubmitPayload
      );
      const fsCall = fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(w3Payload),
      }).catch(err => { track('booking_email_error', { error: String(err && err.message || err) }); });

      const netlifyParams = new URLSearchParams({ 'form-name': 'booking', ...formSubmitPayload }).toString();
      const nfCall = fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: netlifyParams,
      }).catch(err => { track('booking_netlify_error', { error: String(err && err.message || err) }); });

      // Wait for whichever finishes; do not block the user on a slow one
      await Promise.race([Promise.all([fsCall, nfCall]), new Promise(r => setTimeout(r, 3500))]);
      track('generate_lead', { service: serviceVal, value: totalNum, currency: 'GBP' });
      track('booking_submitted', { service: serviceVal, value: totalNum, currency: 'GBP' });
      showSuccess();
      checkoutInFlight = false;
      return;
    }

    // ---- Deposit flow (DEPOSIT_ENABLED = true) ----
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Redirecting to secure payment…'; }

    // Persist booking details for the post-payment success page so we can render
    // the confirmation, fire conversion events, and email the team after the
    // Stripe redirect.
    try {
      sessionStorage.setItem(CHECKOUT_STATE_KEY, JSON.stringify({
        formSubmitPayload,
        service: serviceVal,
        total: totalNum,
        savedAt: Date.now(),
      }));
    } catch (err) {
      // sessionStorage can throw in private modes; the booking still works,
      // we just lose the FormSubmit notification on return.
    }

    track('add_payment_info', { value: 50, currency: 'GBP', service: serviceVal });

    try {
      const resp = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutPayload),
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error('Checkout setup failed (HTTP ' + resp.status + ') ' + text.slice(0, 200));
      }
      const data = await resp.json();
      if (!data.url) throw new Error('Checkout did not return a redirect URL.');
      window.location.assign(data.url);
    } catch (err) {
      setPaymentError(err.message || 'Could not start checkout. Please try again or call us.');
      track('payment_init_error', { error: String(err && err.message || err) });
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel || 'Pay £50 deposit securely →'; }
      checkoutInFlight = false;
    }
  });

  /* ---------- Return from Stripe Checkout ---------- */
  async function handleCheckoutReturn() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('payment');
    if (!status) return;

    if (status === 'cancelled') {
      setPaymentError('Payment was cancelled. Your booking is not confirmed yet — please try again.');
      track('payment_failed', { reason: 'cancelled' });
      // Strip the query so a refresh doesn't keep showing the banner.
      history.replaceState(null, '', location.pathname);
      return;
    }

    if (status !== 'success') return;

    let stored = null;
    try {
      const raw = sessionStorage.getItem(CHECKOUT_STATE_KEY);
      stored = raw ? JSON.parse(raw) : null;
    } catch (err) {
      stored = null;
    }

    const sessionId = params.get('session_id') || '';
    const serviceVal = (stored && stored.service) || '';
    const totalNum = (stored && Number(stored.total)) || 0;

    track('purchase', {
      transaction_id: sessionId,
      value: 50,
      currency: 'GBP',
      items: [{ item_name: 'Hausio booking deposit', item_category: serviceVal, quantity: 1, price: 50 }],
    });
    track('generate_lead', { service: serviceVal, value: totalNum, currency: 'GBP' });
    track('booking_submitted', { service: serviceVal, value: totalNum, currency: 'GBP' });
    showSuccess();

    if (stored && stored.formSubmitPayload) {
      const payload = Object.assign({}, stored.formSubmitPayload, {
        'stripe-checkout-session': sessionId,
      });
      // Dual delivery on post-Stripe success too (Web3Forms + Netlify Forms)
      try {
        const w3p = Object.assign(
          { access_key: '2037c101-86d9-46c3-804d-883183a79376', subject: 'New Hausio booking (paid): ' + (payload.service || 'unknown'), from_name: 'Hausio Website' },
          payload
        );
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(w3p),
        }).catch(() => {});
        const params = new URLSearchParams({ 'form-name': 'booking', ...payload }).toString();
        const resp = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params,
        });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.json().catch(() => ({}));
        if (data && data.success === 'false') throw new Error(data.message || 'FormSubmit error');
      } catch (err) {
        track('booking_email_error', {
          error: String(err && err.message || err),
          checkout_session: sessionId,
        });
      }
    }

    try { sessionStorage.removeItem(CHECKOUT_STATE_KEY); } catch (_) { /* ignore */ }
    history.replaceState(null, '', location.pathname);
  }
  handleCheckoutReturn();

  /* ---------- Prefill from URL ---------- */
  const params = new URLSearchParams(window.location.search);
  const preService = params.get('service');
  const prePostcode = params.get('postcode');
  if (preService) {
    const r = form.querySelector(`input[name="service"][value="${preService}"]`);
    if (r) { r.checked = true; updatePanels(); }
  }
  if (prePostcode) form.postcode.value = prePostcode;

  // Set min date to today
  const today = new Date().toISOString().slice(0, 10);
  form.date.min = today;
  form.date.value = today;

  updatePanels();
  calculate();
})();
