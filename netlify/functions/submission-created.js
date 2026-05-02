// Triggered automatically by Netlify when ANY form on the site is submitted.
// Sends an email to the configured recipient via Resend (free tier: 3000/mo).
//
// Required env var: RESEND_API_KEY
// Optional env vars:
//   FORM_NOTIFY_TO     (default: hausio.co.uk@proton.me)
//   FORM_NOTIFY_FROM   (default: Hausio Bookings <bookings@hausio.co.uk>)
//
// IMPORTANT: the default FROM address requires hausio.co.uk to be verified
// in Resend (Domains tab). Until verified, override with env var:
//   FORM_NOTIFY_FROM = "Hausio <onboarding@resend.dev>"
// (testing sender — only delivers to the email you signed up to Resend with)

const RECIPIENT = process.env.FORM_NOTIFY_TO || 'hausio.co.uk@proton.me';
const SENDER    = process.env.FORM_NOTIFY_FROM || 'Hausio Bookings <bookings@hausio.co.uk>';

exports.handler = async (event) => {
  console.log('[submission-created] invoked');

  let payload;
  try {
    const parsed = JSON.parse(event.body);
    payload = parsed.payload;
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

  const textLines = [
    `New ${formName} submission from hausio.co.uk`,
    '',
    ...fields.map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`),
    '',
    `Submitted: ${new Date(payload.created_at || Date.now()).toISOString()}`,
    payload.site_url ? `Site: ${payload.site_url}` : '',
  ].filter(Boolean);

  const htmlRows = fields
    .map(([k, v]) => `<tr><td style="padding:6px 14px;color:#777;">${k}</td><td style="padding:6px 14px;"><b>${
      typeof v === 'object' ? JSON.stringify(v) : String(v).replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))
    }</b></td></tr>`)
    .join('');
  const html = `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;">
    <h2 style="margin:0 0 8px;">New ${formName} submission</h2>
    <p style="color:#777;margin:0 0 16px;">From hausio.co.uk · ${new Date().toLocaleString('en-GB',{timeZone:'Europe/London'})}</p>
    <table style="border-collapse:collapse;width:100%;border:1px solid #eee;">${htmlRows}</table>
  </div>`;

  const apiKey = process.env.RESEND_API_KEY;
  console.log('[submission-created] env check — RESEND_API_KEY present:', !!apiKey, '| FROM:', SENDER, '| TO:', RECIPIENT);

  if (!apiKey) {
    console.warn('[submission-created] RESEND_API_KEY missing — submission saved by Netlify but no email sent');
    return { statusCode: 200, body: 'OK (no email — RESEND_API_KEY missing)' };
  }

  const replyTo = data.email || data.contact_email || undefined;

  try {
    console.log('[submission-created] calling Resend API…');
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: SENDER,
        to: [RECIPIENT],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject: `New ${formName}: ${data.service || data.name || 'Hausio'}`,
        text: textLines.join('\n'),
        html,
      }),
    });

    const respBody = await res.text();
    console.log('[submission-created] Resend response:', res.status, respBody.slice(0, 500));

    if (!res.ok) {
      console.error('[submission-created] Resend rejected the email');
      return { statusCode: 200, body: `Email failed (${res.status})` };
    }
    console.log('[submission-created] email sent OK');
    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('[submission-created] fetch threw:', err.message);
    return { statusCode: 200, body: 'OK (email threw)' };
  }
};
