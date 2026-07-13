// Public read endpoint for the homepage testimonials section.
// GET /api/reviews  ->  { reviews: [ ...published only, public fields only... ] }
//
// Reviews are stored in the Netlify Blobs store "reviews" by submission-created.js
// (status: pending) and flipped to "published" by moderate-review.js. This endpoint
// exposes ONLY published reviews and ONLY public fields — never the reviewer's email
// or any internal moderation data.
const { getStore } = require('@netlify/blobs');

const PUBLIC_FIELDS = ['id', 'rating', 'title', 'body', 'authorName', 'avatarUrl', 'verified', 'service', 'borough', 'photoUrl', 'createdAt'];

exports.handler = async () => {
  try {
    const store = getStore('reviews');
    const listing = await store.list();
    const blobs = (listing && listing.blobs) || [];

    const items = await Promise.all(
      blobs.map((b) => store.get(b.key, { type: 'json' }).catch(() => null))
    );

    const published = items
      .filter((r) => r && r.status === 'published')
      .map((r) => {
        const out = {};
        PUBLIC_FIELDS.forEach((k) => { out[k] = r[k]; });
        return out;
      })
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      body: JSON.stringify({ reviews: published }),
    };
  } catch (err) {
    // Never break the homepage — degrade to an empty list.
    console.error('[reviews] list failed:', err && err.message);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews: [] }),
    };
  }
};
