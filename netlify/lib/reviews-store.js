// Shared Netlify Blobs accessor for the on-site "reviews" store.
//
// Normally Netlify injects NETLIFY_BLOBS_CONTEXT into the function runtime and
// getStore('reviews') "just works". On this site that context is missing
// (MissingBlobsEnvironmentError), which silently broke BOTH storing a review at
// submission time and publishing it from the moderation email.
//
// So we fall back to explicit/manual configuration: SITE_ID (injected by
// Netlify) + a personal access token supplied as NETLIFY_BLOBS_TOKEN. When the
// token is present we use it; if the automatic context ever comes back, the
// manual branch is simply skipped and nothing else changes.
//
// This module lives OUTSIDE netlify/functions on purpose so Netlify does not
// try to deploy it as its own function — it is bundled into each function that
// require()s it.
const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'reviews';

function blobsSiteID() {
  return process.env.NETLIFY_BLOBS_SITE_ID || process.env.SITE_ID || process.env.NETLIFY_SITE_ID || '';
}

function blobsToken() {
  return process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_API_TOKEN || '';
}

// Throws if neither the auto context nor manual credentials are usable — the
// caller decides how to surface that.
function getReviewsStore() {
  const siteID = blobsSiteID();
  const token = blobsToken();

  // Manual mode wins when we have credentials — deterministic, independent of
  // the auto-injected context that is missing on this site.
  if (siteID && token) {
    return getStore({ name: STORE_NAME, siteID, token });
  }
  // Automatic mode (works only when NETLIFY_BLOBS_CONTEXT is present).
  return getStore(STORE_NAME);
}

// True when we can talk to Blobs in manual mode without relying on the missing
// auto context. Used to tailor diagnostics / owner-email warnings.
function hasManualBlobsConfig() {
  return !!(blobsSiteID() && blobsToken());
}

module.exports = { getReviewsStore, hasManualBlobsConfig, STORE_NAME };
