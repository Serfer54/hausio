// Triggered automatically by Netlify when ANY form on the site is submitted.
// Sends submission to Resend (email) AND to Google Apps Script (Sheets) — both
// run in parallel and independently, so a Sheets failure does not block email
// and vice versa. Use whichever you have configured; both is fine.
//
// Env vars (all optional — function does what it can with what is set):
//   RESEND_API_KEY        — enables email via Resend
//   FORM_NOTIFY_TO        — email recipient (default: hausio.co.uk@proton.me)
//   FORM_NOTIFY_FROM      — email sender   (default: Hausio Bookings <onboarding@resend.dev>)
//   SHEETS_WEBHOOK_URL    — Google Apps Script Web App URL — appends rows to a Sheet

const RECIPIENT = process.env.FORM_NOTIFY_TO || 'hausio.co.uk@proton.me';
const SENDER    = process.env.FORM_NOTIFY_FROM || 'Hausio Bookings <onboarding@resend.dev>';

exports.handler = async (event) => {
  console.log('[submission-created] invoked');

  let payload;
  try {
    payload = JSON.parse(event.body).payload;
    console.log('[submission-created] form_name:', payload && payload.form_name);
  } catch (err) {
    console.error('[submission-created] payload parse error:', err.message);
    return { statusCode: 400, body: 'Invalid payload' };
  }
  if (!payload || !payload.data) {
    console.error('[submission-created] no payload.data');
    return { statusCode: 400, body: 'No data' };
  }

  const formName = payload.form_name || 'unknown';
  const data = payload.data || {};
  const SKIP = new Set(['bot-field', 'form-name']);
  const fields = Object.entries(data).filter(([k]) => !SKIP.has(k));

  // === LEAD STORAGE #1 — Netlify Function Logs (always visible, no setup) ===
  // Open https://app.netlify.com/projects/celebrated-babka-f215f3/logs/functions
  // and search for [LEAD] to see every submission with all fields.
  console.log('========== [LEAD] new ' + formName + ' submission ==========');
  fields.forEach(([k, v]) => console.log('[LEAD] ' + k + ': ' + (typeof v === 'object' ? JSON.stringify(v) : v)));
  console.log('[LEAD] received_at: ' + new Date().toISOString());
  console.log('[LEAD] ============================================');

  // === LEAD STORAGE #2 — Netlify Forms inbox (always on) ===
  // Open https://app.netlify.com/projects/celebrated-babka-f215f3/forms
  // and click on the "booking" form.

  // === LEAD STORAGE #3 + #4 — Email + Sheets (parallel, optional) ===
  const tasks = [];
  if (process.env.RESEND_API_KEY) tasks.push(sendResendEmail(formName, data, fields));
  else console.warn('[submission-created] RESEND_API_KEY missing — skipping email');

  if (process.env.SHEETS_WEBHOOK_URL) tasks.push(sendToSheets(formName, data, payload));
  else console.warn('[submission-created] SHEETS_WEBHOOK_URL missing — skipping Sheets');

  const results = await Promise.allSettled(tasks);
  results.forEach((r, i) => {
    const label = i === 0 && process.env.RESEND_API_KEY ? 'email' : 'sheets';
    if (r.status === 'fulfilled') console.log(`[submission-created] ${label}: OK`, r.value || '');
    else console.error(`[submission-created] ${label}: FAILED`, r.reason && r.reason.message);
  });

  return { statusCode: 200, body: 'OK' };
};

async function sendResendEmail(formName, data, fields) {
  const replyTo = data.email || data.contact_email || undefined;
  const textLines = [
    `New ${formName} submission from hausio.co.uk`,
    '',
    ...fields.map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`),
    '',
    `Submitted: ${new Date().toISOString()}`,
  ];
  const htmlRows = fields
    .map(([k, v]) => `<tr><td style="padding:6px 14px;color:#777;">${k}</td><td style="padding:6px 14px;"><b>${
      typeof v === 'object' ? JSON.stringify(v) : String(v).replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))
    }</b></td></tr>`).join('');
  const html = `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;">
    <h2 style="margin:0 0 8px;">New ${formName} submission</h2>
    <p style="color:#777;margin:0 0 16px;">From hausio.co.uk · ${new Date().toLocaleString('en-GB',{timeZone:'Europe/London'})}</p>
    <table style="border-collapse:collapse;width:100%;border:1px solid #eee;">${htmlRows}</table>
  </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: SENDER,
      to: [RECIPIENT],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject: `New ${formName}: ${data.service || data.name || 'Hausio'}`,
      text: textLines.join('\n'),
      html,
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Resend ${res.status}: ${body.slice(0, 300)}`);
  return `status ${res.status}`;
}

async function sendToSheets(formName, data, payload) {
  const res = await fetch(process.env.SHEETS_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      form_name: formName,
      submitted_at: payload.created_at || null,
      site_url: payload.site_url || null,
      ...data,
    }),
    redirect: 'follow', // Apps Script returns 302 to a googleusercontent.com URL
  });
  if (!res.ok && res.status !== 302) {
    const body = await res.text();
    throw new Error(`Sheets ${res.status}: ${body.slice(0, 300)}`);
  }
  return `status ${res.status}`;
}
