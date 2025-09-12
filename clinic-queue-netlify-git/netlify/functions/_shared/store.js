/**
 * Shared store helper for Netlify Blobs.
 *
 * Prefers the built‑in runtime binding (no tokens needed).
 * Falls back to manual client when BLOBS_SITE_ID + BLOBS_TOKEN are provided.
 */
let boundGetStore = null;
try {
  // Netlify Blobs v6+ exposes getStore directly for bound credentials
  ({ getStore: boundGetStore } = require('@netlify/blobs'));
} catch (_) {
  boundGetStore = null;
}

function getEnv(name) {
  return (
    process.env[name] ||
    process.env[`NETLIFY_${name}`] || // compatibility
    null
  );
}

async function getTicketsStore() {
  const name = process.env.BLOBS_STORE || 'queue';

  // 1) Prefer the bound runtime: no tokens in code, works in production
  if (typeof boundGetStore === 'function') {
    try {
      const store = boundGetStore({ name });
      // Touch a cheap op to surface misconfiguration early
      // (list() is lazy, so we do not await to avoid extra latency)
      return store;
    } catch (e) {
      // fall through to manual if bound is unavailable
    }
  }

  // 2) Manual client fallback (useful for local dev or older runtimes)
  const siteID =
    process.env.BLOBS_SITE_ID ||
    getEnv('SITE_ID') ||
    getEnv('SITEID') ||
    process.env.NETLIFY_SITE_ID;
  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_TOKEN;

  if (!siteID || !token) {
    throw new Error(
      'Blobs credentials missing: use Netlify bound runtime OR set BLOBS_SITE_ID + BLOBS_TOKEN.'
    );
  }

  const { createClient } = require('@netlify/blobs');
  const client = createClient({ siteID, token });
  return client.getStore({ name });
}

module.exports = { getTicketsStore };
