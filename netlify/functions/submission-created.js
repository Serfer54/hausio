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
//   TURNSTILE_SECRET_KEY  — Cloudflare Turnstile secret. If set, submissions
//                           without a valid cf-turnstile-response token are
//                           silently dropped (no email, no Sheets, no review).
//                           Submission still appears in Netlify Forms dashboard
//                           for audit. Without this env var, verification is
//                           skipped (useful in dev / before Cloudflare setup).

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

  // === BOT GATE — Cloudflare Turnstile token verification ===
  // Spam bots can submit Netlify Forms even with honeypot in place. The
  // Turnstile token, attached client-side by the widget on book.html /
  // popup.js, is verified here BEFORE we send any operator notification.
  // Invalid token → log + drop. Submission still lands in Netlify Forms
  // dashboard so legitimate-looking ones can be reviewed manually.
  if (process.env.TURNSTILE_SECRET_KEY) {
    const token = data['cf-turnstile-response'] || data['cf_turnstile_response'] || '';
    const ip = (payload.human_fields && payload.human_fields.ip) || payload.remote_ip || '';
    const ok = await verifyTurnstile(token, ip);
    if (!ok) {
      console.warn(`[submission-created] turnstile FAILED for ${formName} — dropping notifications. Submission still stored in Netlify Forms.`);
      return { statusCode: 200, body: 'Dropped by Turnstile' };
    }
    console.log('[submission-created] turnstile OK');
  } else {
    console.warn('[submission-created] TURNSTILE_SECRET_KEY missing — skipping bot verification');
  }

  // Drop framework noise + empty values so the email/log only shows fields
  // the customer actually filled in (handyman bookings shouldn't show empty
  // cleaning/man-and-van fields, and vice versa).
  const SKIP = new Set(['bot-field', 'form-name', 'cf-turnstile-response']);
  const isEmpty = v => v === '' || v == null || (Array.isArray(v) && v.length === 0);
  const fields = Object.entries(data).filter(([k, v]) => !SKIP.has(k) && !isEmpty(v));

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

  // === LEAD STORAGE #3 + #4 + #5 — Email to operator + Sheets + scheduled review request ===
  const tasks = [];
  const taskLabels = [];
  if (process.env.RESEND_API_KEY) {
    tasks.push(sendResendEmail(formName, data, fields));
    taskLabels.push('lead-email');
  } else console.warn('[submission-created] RESEND_API_KEY missing — skipping lead email');

  if (process.env.SHEETS_WEBHOOK_URL) {
    tasks.push(sendToSheets(formName, data, payload));
    taskLabels.push('sheets');
  } else console.warn('[submission-created] SHEETS_WEBHOOK_URL missing — skipping Sheets');

  // Schedule a review-request email to the customer for +48h after booking.
  // Skip if Resend key missing, customer email missing, or review URLs not configured.
  if (process.env.RESEND_API_KEY && data.email && (process.env.REVIEW_TRUSTPILOT_URL || process.env.REVIEW_GOOGLE_URL)) {
    tasks.push(scheduleReviewRequest(data));
    taskLabels.push('review-request');
  } else if (!data.email) {
    console.warn('[submission-created] customer email missing — skipping review request');
  } else if (!process.env.REVIEW_TRUSTPILOT_URL && !process.env.REVIEW_GOOGLE_URL) {
    console.warn('[submission-created] REVIEW_TRUSTPILOT_URL / REVIEW_GOOGLE_URL missing — skipping review request');
  }

  const results = await Promise.allSettled(tasks);
  results.forEach((r, i) => {
    const label = taskLabels[i] || 'task' + i;
    if (r.status === 'fulfilled') console.log(`[submission-created] ${label}: OK`, r.value || '');
    else console.error(`[submission-created] ${label}: FAILED`, r.reason && r.reason.message);
  });

  return { statusCode: 200, body: 'OK' };
};

// Verify a Cloudflare Turnstile token against siteverify.
// Returns true if Cloudflare confirms the challenge passed, false otherwise.
// Network errors fail closed (return false) so a Cloudflare outage stops
// spam dropping into the inbox — operator can still review in Netlify dashboard.
async function verifyTurnstile(token, ip) {
  if (!token) return false;
  try {
    const params = new URLSearchParams();
    params.append('secret', process.env.TURNSTILE_SECRET_KEY);
    params.append('response', token);
    if (ip) params.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!res.ok) {
      console.error(`[turnstile] siteverify HTTP ${res.status}`);
      return false;
    }
    const json = await res.json();
    if (!json.success) {
      console.warn('[turnstile] siteverify rejected:', JSON.stringify(json['error-codes'] || []));
    }
    return !!json.success;
  } catch (err) {
    console.error('[turnstile] verify error:', err.message);
    return false;
  }
}

async function sendResendEmail(formName, data, fields) {
  const replyTo = data.email || data.contact_email || undefined;
  const total = data['estimated-total'] || data.estimated_total || data.total || data.price || '';
  const service = data.service || '';
  const subjectParts = [`New ${formName}`, service, total].filter(Boolean);
  const subject = subjectParts.join(' · ');

  const textLines = [
    `New ${formName} submission from hausio.co.uk`,
    total ? `Total: ${total}` : '',
    '',
    ...fields.map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`),
    '',
    `Submitted: ${new Date().toISOString()}`,
  ].filter(Boolean);
  const htmlRows = fields
    .map(([k, v]) => `<tr><td style="padding:6px 14px;color:#777;">${k}</td><td style="padding:6px 14px;"><b>${
      typeof v === 'object' ? JSON.stringify(v) : String(v).replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))
    }</b></td></tr>`).join('');
  const totalBanner = total
    ? `<div style="background:#111;color:#fff;padding:14px 18px;border-radius:8px;margin:0 0 16px;font-size:18px;"><b>Total: ${total}</b>${service ? ` · ${service}` : ''}</div>`
    : '';
  const html = `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;">
    <h2 style="margin:0 0 8px;">New ${formName} submission</h2>
    <p style="color:#777;margin:0 0 16px;">From hausio.co.uk · ${new Date().toLocaleString('en-GB',{timeZone:'Europe/London'})}</p>
    ${totalBanner}
    <table style="border-collapse:collapse;width:100%;border:1px solid #eee;">${htmlRows}</table>
  </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: SENDER,
      to: [RECIPIENT],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
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

// Schedule a single review-request email to the customer for ~48h after booking.
// Resend handles the delay via `scheduled_at` — no cron, no Blobs, no state on
// our side. Default delay is 48h; override with REVIEW_DELAY_HOURS env.
async function scheduleReviewRequest(data) {
  const trustpilotUrl = process.env.REVIEW_TRUSTPILOT_URL || '';
  const googleUrl = process.env.REVIEW_GOOGLE_URL || '';
  const delayHours = Number(process.env.REVIEW_DELAY_HOURS) || 48;
  const sendAt = new Date(Date.now() + delayHours * 3600 * 1000).toISOString();
  const customerName = (data.name || '').split(' ')[0] || 'there';
  const service = data.service || 'booking';

  const ctaButtons = [];
  if (googleUrl) ctaButtons.push(`<a href="${googleUrl}" style="display:inline-block;background:#4285f4;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin:6px;">⭐ Leave a Google review</a>`);
  if (trustpilotUrl) ctaButtons.push(`<a href="${trustpilotUrl}" style="display:inline-block;background:#00b67a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin:6px;">⭐ Review on Trustpilot</a>`);

  const html = `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;line-height:1.55;">
    <h2 style="margin:0 0 12px;color:#111;">Hi ${customerName},</h2>
    <p>Thanks for booking your <b>${service}</b> with Hausio. We hope the team did a great job.</p>
    <p>If you've got 30 seconds, a quick review helps another Londoner find us — and tells our team they nailed it.</p>
    <div style="text-align:center;margin:24px 0;">
      ${ctaButtons.join('')}
    </div>
    <p style="color:#666;font-size:14px;">If anything wasn't perfect, please <a href="mailto:hausio.co.uk@proton.me">reply to this email</a> first — we'd rather hear from you and fix it than read about it on a 3-star review.</p>
    <p style="color:#666;font-size:14px;margin-top:32px;">— The Hausio team<br/>+44 7304 330 614 · <a href="https://hausio.co.uk">hausio.co.uk</a></p>
  </div>`;

  const textLines = [
    `Hi ${customerName},`,
    '',
    `Thanks for booking your ${service} with Hausio. We hope the team did a great job.`,
    '',
    `If you've got 30 seconds, a quick review helps another Londoner find us:`,
    googleUrl ? `Google: ${googleUrl}` : '',
    trustpilotUrl ? `Trustpilot: ${trustpilotUrl}` : '',
    '',
    `If anything wasn't perfect, please reply to this email first.`,
    '',
    `— The Hausio team`,
    `+44 7304 330 614 · https://hausio.co.uk`,
  ].filter(Boolean);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: SENDER,
      to: [data.email],
      reply_to: 'hausio.co.uk@proton.me',
      subject: `How was your Hausio ${service}? (30 seconds — really)`,
      text: textLines.join('\n'),
      html,
      scheduled_at: sendAt,
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Resend (review) ${res.status}: ${body.slice(0, 300)}`);
  return `scheduled for ${sendAt}`;
}
