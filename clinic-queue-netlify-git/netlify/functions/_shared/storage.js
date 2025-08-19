
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

  if (siteID && token) {
    return getStore({ siteID, token }, name);
  }
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
  const items = [];
  let cursor;
  do {
    const page = await store.list({ prefix, cursor });
    items.push(...page.blobs);
    cursor = page.cursor;
  } while (cursor);
  return items;
}

module.exports = { ensureStore, putJson, getJson, list };
