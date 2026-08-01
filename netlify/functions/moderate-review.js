// One-click review moderation from the owner-notification email.
// GET /api/moderate-review?id=<id>&action=publish|reject&token=<hmac>
//
// The token is an HMAC-SHA256 of "<id>:<action>" keyed with REVIEW_MODERATION_SECRET
// (the same value used to sign the links in submission-created.js). Without a valid
// token the request is rejected, so the links can't be forged or guessed.
const crypto = require('crypto');
const { getReviewsStore, hasManualBlobsConfig } = require('../lib/reviews-store');

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
}

// `detail` is only ever rendered on pages behind a valid HMAC token (i.e. the
// owner), so it can safely carry the raw error text needed to fix a failure.
function htmlResponse(statusCode, title, message, detail) {
  const detailBlock = detail
    ? `<pre style="text-align:left;white-space:pre-wrap;word-break:break-word;background:#f7f4ef;border:1px solid #e6dfd0;border-radius:6px;padding:12px;font-size:12px;line-height:1.45;color:#4a4a4a;margin:16px 0 0;">${escapeHtml(detail)}</pre>`
    : '';
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${title} — Hausio</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;background:#f7f4ef;color:#1a1a1a;display:flex;min-height:100vh;margin:0;align-items:center;justify-content:center;padding:24px;}
  .card{background:#fff;border:1px solid #d9d2c3;border-radius:8px;box-shadow:0 6px 24px rgba(26,26,26,.08);max-width:560px;padding:32px;text-align:center;}
  h1{font-size:1.4rem;margin:0 0 12px;}
  p{color:#2b2b2b;margin:0 0 8px;line-height:1.5;}
  a{color:#a48a5a;}
</style></head><body><div class="card"><h1>${title}</h1><p>${message}</p>${detailBlock}
<p style="margin-top:16px;"><a href="https://hausio.co.uk/">Back to hausio.co.uk</a></p></div></body></html>`;
  return { statusCode, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body };
}

function describeError(err) {
  if (!err) return 'unknown error';
  return `${err.name || 'Error'}: ${err.message || String(err)}`;
}

// Blobs failures used to surface as one opaque "something went wrong". Report
// which step broke instead, plus whether the store is reachable at all, so the
// owner can act on it without digging through function logs.
async function blobsDiagnostics() {
  const lines = [];
  lines.push(`auto context (NETLIFY_BLOBS_CONTEXT): ${process.env.NETLIFY_BLOBS_CONTEXT ? 'present' : 'MISSING'}`);
  lines.push(`manual config: SITE_ID ${process.env.SITE_ID ? 'present' : 'missing'} · NETLIFY_BLOBS_TOKEN ${(process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_API_TOKEN) ? 'present' : 'MISSING'} → manual mode ${hasManualBlobsConfig() ? 'ON' : 'off'}`);
  try {
    const store = getReviewsStore();
    const listing = await store.list();
    const keys = ((listing && listing.blobs) || []).map((b) => b.key);
    lines.push(`store.list(): OK — ${keys.length} key(s)`);
    if (keys.length) lines.push(`keys: ${keys.slice(0, 10).join(', ')}`);
  } catch (err) {
    lines.push(`store.list(): FAILED — ${describeError(err)}`);
    if (!hasManualBlobsConfig()) {
      lines.push('Fix: add a Netlify personal access token as env var NETLIFY_BLOBS_TOKEN, then redeploy.');
    }
  }
  return lines.join('\n');
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

exports.handler = async (event) => {
  const q = (event && event.queryStringParameters) || {};
  const id = q.id || '';
  const action = q.action || '';
  const token = q.token || '';

  const secret = process.env.REVIEW_MODERATION_SECRET || '';
  if (!secret) {
    return htmlResponse(500, 'Not configured', 'REVIEW_MODERATION_SECRET is not set in Netlify. Add it in Site settings → Environment variables, then redeploy.');
  }
  if (!id || (action !== 'publish' && action !== 'reject') || !token) {
    return htmlResponse(400, 'Bad request', 'This moderation link is missing or malformed.');
  }

  const expected = crypto.createHmac('sha256', secret).update(id + ':' + action).digest('hex');
  if (!safeEqual(token, expected)) {
    return htmlResponse(403, 'Invalid link', 'This moderation link is invalid or has been tampered with.');
  }

  // Each Blobs step is isolated so a failure names itself instead of collapsing
  // into a generic 500 — store init, read and write fail for different reasons.
  let store;
  try {
    store = getReviewsStore();
  } catch (err) {
    console.error('[moderate-review] getStore failed:', describeError(err));
    return htmlResponse(500, 'Storage unavailable',
      'Netlify Blobs could not be opened, so this review cannot be updated.',
      `step: getReviewsStore()\n${describeError(err)}\n\n${await blobsDiagnostics()}`);
  }

  let review;
  try {
    // Strong consistency: a review approved seconds after submission must not
    // read back as missing from a stale replica.
    review = await store.get(id, { type: 'json', consistency: 'strong' });
  } catch (err) {
    console.error('[moderate-review] read failed:', describeError(err));
    return htmlResponse(500, 'Read failed',
      'The review could not be read from storage.',
      `step: store.get('${id}')\n${describeError(err)}\n\n${await blobsDiagnostics()}`);
  }

  if (!review) {
    return htmlResponse(404, 'Not found',
      'This review is not in storage — it was most likely never saved (the write at submission time failed silently), or it has already been removed.',
      `step: store.get('${id}') returned null\n\n${await blobsDiagnostics()}`);
  }

  review.status = action === 'publish' ? 'published' : 'rejected';
  review.moderatedAt = new Date().toISOString();

  try {
    await store.setJSON(id, review);
  } catch (err) {
    console.error('[moderate-review] write failed:', describeError(err));
    return htmlResponse(500, 'Write failed',
      'The review was read but the new status could not be saved.',
      `step: store.setJSON('${id}')\n${describeError(err)}\n\n${await blobsDiagnostics()}`);
  }

  const who = escapeHtml(review.authorName || 'this review');
  const msg = action === 'publish'
    ? `Published ✓ — the review by ${who} will appear on the homepage within about 5 minutes (cache).`
    : `Rejected — the review by ${who} will not be shown.`;
  return htmlResponse(200, 'Done', msg);
};
