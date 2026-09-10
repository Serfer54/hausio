(function () {
  const form = document.getElementById('partner-form');
  if (!form) return;
  const button = form.querySelector('button[type="submit"]');
  const status = document.getElementById('partner-status');
  let pending = false;
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    pending = true;
    button.disabled = true;
    status.textContent = 'Sending your application...';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Submission failed');
      window.location.assign('/partner-thank-you.html');
    } catch (error) {
      status.textContent = 'We could not confirm receipt. Your answers are still here. Please try again, or email hausio.co.uk@proton.me if this keeps happening.';
      pending = false;
      button.disabled = false;
    } finally {
      clearTimeout(timeout);
    }
  });
})();
