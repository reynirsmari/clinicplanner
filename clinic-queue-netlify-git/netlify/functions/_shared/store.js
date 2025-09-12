// netlify/functions/_shared/store.js
// Use Netlify's built-in Blobs binding (no token required in production)
const { getStore } = require('@netlify/blobs');

const STORE_NAME = process.env.BLOBS_STORE || 'queue';

function getTicketsStore() {
  return getStore({ name: STORE_NAME });
}

async function putJson(key, value) {
  const store = getTicketsStore();
  await store.set(key, JSON.stringify(value), {
    contentType: 'application/json',
    overwrite: true,
  });
}

async function getJson(key) {
  const store = getTicketsStore();
  return store.get(key, { type: 'json' });
}

async function list(prefix) {
  const store = getTicketsStore();
  return store.list({ prefix });
}

module.exports = { getTicketsStore, putJson, getJson, list };
