// Robust Blobs store helper for Netlify Functions (CJS)
//
// Prefers the bound runtime `getStore({ name })` (no tokens needed),
// with a safe fallback to the ESM `createClient()` for local/dev.
//
let boundGetStore = null;
try {
  // On Netlify runtime this is available and requires no credentials
  ({ getStore: boundGetStore } = require('@netlify/blobs'));
} catch (_) {
  // ignore — we'll fallback below
}

const STORE_NAME = process.env.BLOBS_STORE || 'queue';

/**
 * Returns a Netlify Blobs store instance.
 * In production we use the bound runtime. If that's unavailable (e.g. local),
 * we fall back to the ESM `createClient()` with site/token from env.
 */
async function getTicketsStore() {
  // 1) Prefer bound runtime (production on Netlify)
  if (typeof boundGetStore === 'function') {
    try {
      return boundGetStore({ name: STORE_NAME });
    } catch (e) {
      // continue to fallback
    }
  }

  // 2) Fallback for local/dev or older runtimes — uses manual credentials
  const siteID =
    process.env.BLOBS_SITE_ID ||
    process.env.NETLIFY_SITE_ID ||
    process.env.SITE_ID;
  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_TOKEN;

  if (!siteID || !token) {
    throw new Error(
      'Blobs credentials missing for manual client. ' +
      'Either enable the bound runtime (preferred) or set BLOBS_SITE_ID and BLOBS_TOKEN.'
    );
  }

  // IMPORTANT: @netlify/blobs is ESM. Use dynamic import from CJS.
  const blobs = await import('@netlify/blobs');
  if (typeof blobs.createClient !== 'function') {
    throw new Error('createClient not available from @netlify/blobs');
  }
  const client = blobs.createClient({ siteID, token });
  return client.getStore({ name: STORE_NAME });
}

module.exports = { getTicketsStore };
