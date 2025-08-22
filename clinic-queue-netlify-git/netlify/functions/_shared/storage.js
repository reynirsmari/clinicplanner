// CommonJS on purpose (works with your current build)
const { createClient } = require('@netlify/blobs');

function ensureStore() {
  const siteID =
    process.env.BLOBS_SITE_ID ||
    process.env.NETLIFY_SITE_ID ||
    process.env.SITE_ID;

  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_TOKEN;

  const storeName = process.env.BLOBS_STORE || 'queue';

  if (!siteID || !token) {
    throw new Error('Missing BLOBS credentials (siteID/token).');
  }

  const client = createClient({ siteID, token });
  return client.store(storeName);
}

async function putJson(key, obj) {
  const store = ensureStore();
  await store.setJSON(key, obj);
}

async function getJson(key) {
  const store = ensureStore();
  return await store.getJSON(key);
}

async function del(key) {
  const store = ensureStore();
  await store.delete(key);
}

async function list(prefix) {
  const store = ensureStore();
  const { objects } = await store.list({ prefix });
  return objects;
}

module.exports = { ensureStore, putJson, getJson, del, list };
