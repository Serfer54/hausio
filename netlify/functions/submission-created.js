// Triggered automatically by Netlify when ANY form on the site is submitted.
// Sends an email to the configured recipient via Resend (free tier: 3000/mo).
//
// Required env var: RESEND_API_KEY
// Optional env vars:
//   FORM_NOTIFY_TO     (default: hausio.co.uk@proton.me)
//   FORM_NOTIFY_FROM   (default: Hausio Bookings <onboarding@resend.dev>)

const RECIPIENT = process.env.FORM_NOTIFY_TO || 'hausio.co.uk@proton.me';
const SENDER    = process.env.FORM_NOTIFY_FROM || 'Hausio Bookings <onboarding@resend.dev>';

exports.handler = async (event) => {
  let payload;
  try {
    payload = JSON.parse(event.body).payload;
  } catch {
    return { statusCode: 400, body: 'Invalid payload' };
  }

  const formName = payload.form_name || 'unknown';
  const data = payload.data || {};

  // Skip the honeypot/internal fields
  const SKIP = new Set(['bot-field', 'form-name']);
  const fields = Object.entries(data).filter(([k]) => !SKIP.has(k));

  // Plain-text body for proton-friendly rendering
  const textLines = [
    `New ${formName} submission from hausio.co.uk`,
    '',
    ...fields.map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`),
    '',
    `Submitted: ${new Date(payload.created_at || Date.now()).toISOString()}`,
    payload.site_url ? `Site: ${payload.site_url}` : '',
  ].filter(Boolean);

  // Lightweight HTML version
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
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — submission saved by Netlify but email not sent');
    return { statusCode: 200, body: 'OK (no email — RESEND_API_KEY missing)' };
  }

  // Use customer email as reply-to so you can reply directly from inbox
  const replyTo = data.email || data.contact_email || undefined;

  try {
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

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend send failed', res.status, errText);
      return { statusCode: 200, body: `Email failed (${res.status})` };
    }
    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('submission-created error', err);
    return { statusCode: 200, body: 'OK (email threw)' };
  }
};
