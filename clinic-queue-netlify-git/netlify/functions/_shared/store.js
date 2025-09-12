// netlify/functions/_shared/store.js
const { getStore, createClient } = require('@netlify/blobs');

const STORE_NAME =
  process.env.BLOBS_STORE || 'queue';

function pickAuth() {
  // Prefer BLOBS_* if present, fall back to NETLIFY_* names
  const siteID =
    process.env.BLOBS_SITE_ID ||
    process.env.NETLIFY_SITE_ID ||
    process.env.SITE_ID;

  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_TOKEN;

  return (siteID && token) ? { siteID, token } : null;
}

async function getTicketsStore() {
  const auth = pickAuth();

  // If we have explicit credentials, use them and (optionally) ensure the store exists
  if (auth) {
    try {
      const client = createClient(auth);
      // idempotent; ignore if it already exists
      await client.createStore({ name: STORE_NAME }).catch(() => {});
    } catch (_) {
      // ignore create errors; store may already exist or token may lack manage permission
    }
    return getStore({ name: STORE_NAME, ...auth });
  }

  // Fallback: rely on Netlify runtime auto config
  return getStore({ name: STORE_NAME });
}

module.exports = { getTicketsStore };
