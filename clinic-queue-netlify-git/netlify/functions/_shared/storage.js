// CommonJS helper for Netlify Blobs
// Uses manual credentials from env (BLOBS_SITE_ID, BLOBS_TOKEN)
// and falls back to auto-detection when available.

const { getStore } = require('@netlify/blobs');

function ensureStore(name = 'tickets') {
  const siteID =
    process.env.BLOBS_SITE_ID ||
    process.env.NETLIFY_SITE_ID ||
    process.env.SITE_ID;

  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_TOKEN;

  // If both available, use manual auth (works everywhere)
  if (siteID && token) {
    return getStore({ siteID, token }, name);
  }

  // Otherwise let Netlify auto-detect (works only in correctly
  // configured Functions/Edge runtimes)
  return getStore(name);
}

async function putJson(key, value) {
  const store = ensureStore();
  await store.setJSON(key, value);
}

async function getJson(key) {
  const store = ensureStore();
  return store.getJSON(key);
}

async function list(prefix = '') {
  const store = ensureStore();
  const out = [];
  let cursor;

  do {
    const page = await store.list({ prefix, cursor });
    out.push(...page.blobs);
    cursor = page.cursor;
  } while (cursor);

  return out;
}

module.exports = { putJson, getJson, list };
