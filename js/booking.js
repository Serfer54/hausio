// Hausio — multi-step booking flow + live price calculator
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
    }
    return true;
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
    calculate();
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

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting...'; }

    const chosenService = form.querySelector('input[name="service"]:checked');
    const serviceVal = chosenService ? chosenService.value : '';
    const totalStr = summaryTotal ? summaryTotal.textContent.replace(/[^0-9.]/g, '') : '0';
    const totalNum = Number(totalStr) || 0;

    const payload = {};
    const formData = new FormData(form);
    formData.forEach((v, k) => { payload[k] = v; });
    payload['estimated-total'] = '£' + totalNum;
    payload['submitted-from'] = location.href;
    payload._subject = 'New Hausio booking: ' + (serviceVal || 'unknown') + ' · £' + totalNum;
    payload._template = 'table';
    payload._captcha = 'false';
    // Backup recipient — keeps a copy on personal Gmail in case Proton bounces.
    // Proton inbox is the eventual home for booking notifications, but FormSubmit only delivers
    // to a recipient once their activation link is clicked. Until that's done we keep Gmail as
    // the active endpoint and copy Proton via CC so it gets the activation email.
    payload._cc = 'hausio.co.uk@proton.me';

    try {
      const resp = await fetch('https://formsubmit.co/ajax/serfer7501@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json().catch(() => ({}));
      if (data && data.success === 'false') throw new Error(data.message || 'FormSubmit error');

      track('generate_lead', {
        service: serviceVal,
        value: totalNum,
        currency: 'GBP'
      });
      track('booking_submitted', {
        service: serviceVal,
        value: totalNum,
        currency: 'GBP'
      });
      showSuccess();
    } catch (err) {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel || 'Confirm booking →'; }
      alert("Sorry, we couldn't submit your booking right now. Please try again, or call us on +44 7304 330 614.");
      track('booking_submit_error', { error: String(err && err.message || err) });
    }
  });

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
