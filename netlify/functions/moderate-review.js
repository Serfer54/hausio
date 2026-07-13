// One-click review moderation from the owner-notification email.
// GET /api/moderate-review?id=<id>&action=publish|reject&token=<hmac>
//
// The token is an HMAC-SHA256 of "<id>:<action>" keyed with REVIEW_MODERATION_SECRET
// (the same value used to sign the links in submission-created.js). Without a valid
// token the request is rejected, so the links can't be forged or guessed.
const crypto = require('crypto');
const { getStore } = require('@netlify/blobs');

function htmlResponse(statusCode, title, message) {
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${title} — Hausio</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;background:#f7f4ef;color:#1a1a1a;display:flex;min-height:100vh;margin:0;align-items:center;justify-content:center;padding:24px;}
  .card{background:#fff;border:1px solid #d9d2c3;border-radius:8px;box-shadow:0 6px 24px rgba(26,26,26,.08);max-width:440px;padding:32px;text-align:center;}
  h1{font-size:1.4rem;margin:0 0 12px;}
  p{color:#2b2b2b;margin:0 0 8px;line-height:1.5;}
  a{color:#a48a5a;}
</style></head><body><div class="card"><h1>${title}</h1><p>${message}</p>
<p style="margin-top:16px;"><a href="https://hausio.co.uk/">Back to hausio.co.uk</a></p></div></body></html>`;
  return { statusCode, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body };
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

  try {
    const store = getStore('reviews');
    const review = await store.get(id, { type: 'json' });
    if (!review) {
      return htmlResponse(404, 'Not found', 'This review no longer exists — it may already have been removed.');
    }

    review.status = action === 'publish' ? 'published' : 'rejected';
    review.moderatedAt = new Date().toISOString();
    await store.setJSON(id, review);

    const who = review.authorName || 'this review';
    const msg = action === 'publish'
      ? `Published ✓ — the review by ${who} will appear on the homepage within about 5 minutes (cache).`
      : `Rejected — the review by ${who} will not be shown.`;
    return htmlResponse(200, 'Done', msg);
  } catch (err) {
    console.error('[moderate-review] failed:', err && err.message);
    return htmlResponse(500, 'Error', 'Something went wrong updating this review. Please try again.');
  }
};
