// Hausio — on-site review form: photo downscale + EXIF/GPS strip + multipart submit
// Submits to Netlify Forms (form name "review"); submission-created.js stores it as
// pending and emails the owner one-click Approve/Reject links. Approved reviews are
// served by /api/reviews and rendered on the homepage by js/reviews.js.
(function () {
  var form = document.getElementById('review-form');
  if (!form) return;

  var fileInput = document.getElementById('photo-input');
  var dropText = document.getElementById('photo-drop-text');
  var preview = document.getElementById('photo-preview');
  var errorEl = document.getElementById('review-error');
  var successEl = document.getElementById('review-success');
  var submitBtn = document.getElementById('review-submit');

  var MAX_DIM = 1600;        // longest edge after downscale
  var JPEG_QUALITY = 0.82;
  var MAX_INPUT_BYTES = 25 * 1024 * 1024; // reject monster originals before we even decode

  /* ---------- Analytics helper (mirrors main.js / booking.js) ---------- */
  function track(name, params) {
    var p = params || {};
    if (typeof window.gtag === 'function') window.gtag('event', name, p);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, p));
  }

  function showError(msg) {
    if (!errorEl) return;
    if (!msg) { errorEl.hidden = true; errorEl.textContent = ''; return; }
    errorEl.hidden = false;
    errorEl.textContent = msg;
  }

  /* ---------- Photo preview ---------- */
  if (fileInput) {
    fileInput.addEventListener('change', function () {
      showError('');
      var file = fileInput.files && fileInput.files[0];
      if (!file) { if (preview) { preview.hidden = true; preview.innerHTML = ''; } if (dropText) dropText.textContent = 'Tap to add a photo — JPG, PNG or WebP'; return; }
      if (!/^image\//.test(file.type)) { showError('That file is not an image. Please choose a JPG, PNG or WebP.'); fileInput.value = ''; return; }
      if (file.size > MAX_INPUT_BYTES) { showError('That photo is very large. Please choose one under 25 MB.'); fileInput.value = ''; return; }
      if (dropText) dropText.textContent = 'Change photo';
      if (preview) {
        var url = URL.createObjectURL(file);
        preview.innerHTML = '<img alt="Preview of the photo you selected" src="' + url + '" />';
        preview.hidden = false;
      }
    });
  }

  /* ---------- Downscale + re-encode (canvas re-encode strips EXIF/GPS) ---------- */
  async function processPhoto(file) {
    if (!file || !/^image\//.test(file.type)) return null;
    var bitmap = null;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (e) {
      try { bitmap = await createImageBitmap(file); } catch (e2) { bitmap = null; }
    }
    if (!bitmap) return file; // decode failed — fall back to original (Netlify still caps at 8MB)

    var scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    var w = Math.round(bitmap.width * scale);
    var h = Math.round(bitmap.height * scale);
    var canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, w, h);
    if (bitmap.close) bitmap.close();

    var blob = await new Promise(function (res) { canvas.toBlob(res, 'image/jpeg', JPEG_QUALITY); });
    if (!blob) return file;
    return new File([blob], 'review-photo.jpg', { type: 'image/jpeg' });
  }

  /* ---------- Success ---------- */
  function showSuccess() {
    form.hidden = true;
    if (successEl) successEl.hidden = false;
    var intro = document.querySelector('.review-intro');
    if (intro) intro.hidden = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- Submit ---------- */
  var sending = false;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (sending) return;
    showError('');

    var rating = form.querySelector('input[name="rating"]:checked');
    var body = (form.body && form.body.value || '').trim();
    var name = (form.name && form.name.value || '').trim();
    var email = (form.email && form.email.value || '').trim();
    var consent = form.consent && form.consent.checked;

    if (!rating) { showError('Please choose a star rating.'); return; }
    if (body.length < 10) { showError('Please tell us a little more — at least a sentence.'); return; }
    if (!name) { showError('Please add your name.'); return; }
    if (!email) { showError('Please add your email so we can reach you if needed.'); return; }
    if (!consent) { showError('Please tick the box to let us publish your review.'); return; }

    sending = true;
    var originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Posting…'; }

    try {
      var fd = new FormData(form);
      fd.set('form-name', 'review');

      var file = fileInput && fileInput.files && fileInput.files[0];
      if (file) {
        if (submitBtn) submitBtn.textContent = 'Processing photo…';
        var processed = await processPhoto(file);
        if (processed) fd.set('photo', processed, 'review-photo.jpg');
        else fd.delete('photo');
      } else {
        fd.delete('photo'); // avoid submitting an empty file field
      }

      if (submitBtn) submitBtn.textContent = 'Posting…';
      // Multipart POST to Netlify Forms. DO NOT set Content-Type — the browser
      // sets the multipart boundary itself. Same-origin, so no third-party call.
      var resp = await fetch('/', { method: 'POST', body: fd });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);

      track('leave_review_submitted', {
        rating: Number(rating.value),
        service: (form.service && form.service.value) || '',
        has_photo: !!file,
      });
      showSuccess();
    } catch (err) {
      showError('Sorry — something went wrong sending your review. Please try again, or email us at hausio.co.uk@proton.me.');
      track('leave_review_error', { error: String(err && err.message || err) });
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel || 'Post my review →'; }
      sending = false;
    }
  });
})();
