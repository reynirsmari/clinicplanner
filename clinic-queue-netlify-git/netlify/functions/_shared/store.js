
// netlify/functions/_shared/store.js
// Robust helper for Netlify Blobs across runtime-bound and token-based clients
// Works with older (@netlify/blobs BlobsClient) and newer (createClient/getStore) APIs.

let cachedStore = null;

function selectCred(name) {
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
      `Missing Netlify Blobs credentials for manual client (need siteID+token).`,
    );
  }
  return { siteID, token, name };
}

function toStore(client, name) {
  if (!client) throw new Error('Could not create Netlify Blobs client');
  // Newer SDK
  if (typeof client.getStore === 'function') return client.getStore({ name });
  // Older SDK
  if (typeof client.store === 'function') return client.store(name);
  throw new Error('Unsupported Netlify Blobs client shape');
}

async function getTicketsStore() {
  if (cachedStore) return cachedStore;

  const name = process.env.BLOBS_STORE || 'queue';

  // 1) Prefer bound runtime store (no token required)
  try {
    const cjs = require('@netlify/blobs');
    if (typeof cjs.getStore === 'function') {
      cachedStore = cjs.getStore({ name });
      return cachedStore;
    }
  } catch (_) {
    // ignore; will try dynamic ESM import next
  }

  // 2) Manual client via token (supports multiple SDK versions)
  const { siteID, token } = selectCred(name);

  // Use dynamic import to load ESM in CommonJS
  const mod = await import('@netlify/blobs');

  // Try several shapes to maximize compatibility
  const maybeDefault = mod && mod.default ? mod.default : null;
  let client = null;

  if (mod && typeof mod.createClient === 'function') {
    client = mod.createClient({ siteID, token });
  } else if (maybeDefault && typeof maybeDefault.createClient === 'function') {
    client = maybeDefault.createClient({ siteID, token });
  } else if (mod && typeof mod.BlobsClient === 'function') {
    client = new mod.BlobsClient({ siteID, token });
  } else if (maybeDefault && typeof maybeDefault.BlobsClient === 'function') {
    client = new maybeDefault.BlobsClient({ siteID, token });
  } else {
    throw new Error('No compatible client factory (createClient/BlobsClient) exported by @netlify/blobs');
  }

  cachedStore = toStore(client, name);
  return cachedStore;
}

module.exports = { getTicketsStore };
