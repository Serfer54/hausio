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
      materials: { no: 0, small: 25, med: 60, large: 0 },
    },
    frequency: { 'one-off': 1, weekly: 0.9, fortnightly: 0.95, monthly: 1 },
  };

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
    r.addEventListener('change', updatePanels)
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
      const mat = form['handy-materials'].value;
      let subtotal;
      if (hours === 4) subtotal = PRICES.handyman.halfDay;
      else if (hours === 8) subtotal = PRICES.handyman.fullDay;
      else subtotal = PRICES.handyman.firstHour + Math.max(0, hours - 1) * PRICES.handyman.laterHour;
      lines.push([`Handyman · ${hours}h`, '£' + subtotal]);
      total += subtotal;
      const matAmt = PRICES.handyman.materials[mat] || 0;
      if (matAmt) { lines.push(['Materials', '£' + matAmt]); total += matAmt; }
    }

    // Frequency discount (step 3)
    const freqEl = form.frequency;
    if (freqEl && freqEl.value) {
      const mult = PRICES.frequency[freqEl.value] || 1;
      if (mult < 1) {
        const discounted = Math.round(total * mult);
        const saving = total - discounted;
        lines.push([`${labelFreq(freqEl.value)} discount`, '-£' + saving]);
        total = discounted;
      }
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
  function labelFreq(v) {
    return ({ weekly: 'Weekly', fortnightly: 'Fortnightly' })[v] || v;
  }

  /* ---------- Live recalculate ---------- */
  form.addEventListener('change', calculate);
  form.addEventListener('input', calculate);

  /* ---------- Submit ---------- */
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.terms.checked) {
      alert('Please accept the terms to continue.');
      return;
    }
    // TODO: POST to backend / email endpoint
    showSuccess();
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
