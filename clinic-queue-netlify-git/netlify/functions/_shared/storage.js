// CommonJS helper around Netlify Blobs
const { getStore } = require('@netlify/blobs');

function getTicketsStore() {
  const name = process.env.BLOBS_STORE || 'queue';

  // If we’re not in a first-party Netlify env, fall back to manual creds.
  const siteID =
    process.env.BLOBS_SITE_ID ||
    process.env.NETLIFY_SITE_ID ||
    process.env.SITE_ID;

  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_TOKEN ||
    process.env.NETLIFY_API_TOKEN;

  const opts = { name };
  if (siteID && token) {
    opts.siteID = siteID;
    opts.token = token;
  }
  return getStore(opts);
}

function ticketKey(id) {
  return `tickets/${id}.json`;
}

async function putJson(key, value) {
  const store = getTicketsStore();
  await store.setJSON(key, value);
}

async function getJson(key) {
  const store = getTicketsStore();
  return await store.getJSON(key);
}

async function list(prefix) {
  const store = getTicketsStore();
  return await store.list({ prefix }); // => { blobs: [{ key, size, ... }], cursor? }
}

module.exports = { getTicketsStore, ticketKey, putJson, getJson, list };
