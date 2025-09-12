// netlify/functions/_shared/store.js
// Use Netlify's built-in binding (no token/siteID required in production)

const { getStore } = require('@netlify/blobs');

// Match the store name you’ve been using
const STORE_NAME = process.env.BLOBS_STORE || 'queue';

function ticketsStore() {
  // v6+ of @netlify/blobs supports this
  return getStore({ name: STORE_NAME });
}

async function putJson(key, value) {
  const store = ticketsStore();
  await store.set(key, JSON.stringify(value), {
    contentType: 'application/json',
    // make sure overwrites are allowed
    overwrite: true,
  });
}

async function getJson(key) {
  const store = ticketsStore();
  // returns parsed JSON when { type: 'json' }
  return store.get(key, { type: 'json' });
}

async function list(prefix) {
  const store = ticketsStore();
  return store.list({ prefix }); // { objects: [{ key, size, uploadedAt }...] }
}

module.exports = {
  getTicketsStore: ticketsStore,
  putJson,
  getJson,
  list,
};
