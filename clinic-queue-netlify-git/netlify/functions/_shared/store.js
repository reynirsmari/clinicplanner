// netlify/functions/_shared/store.js
// CommonJS helper for Netlify Blobs that does NOT require manual tokens.
const { getStore } = require('@netlify/blobs');

const STORE_NAME = process.env.BLOBS_STORE || 'queue';

async function getTicketsStore() {
  // In Netlify Functions this automatically binds to your site's Blobs storage.
  return getStore({ name: STORE_NAME });
}

async function putJson(key, value) {
  const store = await getTicketsStore();
  await store.set(key, JSON.stringify(value), {
    metadata: { 'content-type': 'application/json' },
  });
}

async function getJson(key) {
  const store = await getTicketsStore();
  return await store.get(key, { type: 'json' });
}

async function list(prefix) {
  const store = await getTicketsStore();
  const out = [];
  for await (const entry of store.list({ prefix })) {
    out.push(entry);
  }
  return out;
}

module.exports = { getTicketsStore, putJson, getJson, list };