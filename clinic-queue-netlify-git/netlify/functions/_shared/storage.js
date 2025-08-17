
// netlify/functions/_shared/storage.js (CommonJS + dynamic ESM import)
// Central helpers for Netlify Blobs access that work in Functions.
const STORE_NAME = process.env.BLOBS_STORE || 'clinic-queue';

async function getBlobsModule() {
  // Load @netlify/blobs at runtime to avoid ESM/CJS loader issues
  const mod = await import('@netlify/blobs');
  return mod;
}

function getSiteAndToken() {
  const siteID =
    process.env.BLOBS_SITE_ID ||
    process.env.NETLIFY_SITE_ID ||
    process.env.SITE_ID;
  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_TOKEN ||
    process.env.NETLIFY_API_TOKEN;
  return { siteID, token };
}

async function getStore() {
  const mod = await getBlobsModule();
  // Prefer getStore when running on Netlify with auto env
  if (typeof mod.getStore === 'function') {
    return mod.getStore(STORE_NAME);
  }
  // Fall back to manual client
  const { siteID, token } = getSiteAndToken();
  if (typeof mod.createClient === 'function') {
    const client = mod.createClient({ siteID, token });
    if (typeof client.store === 'function') return client.store(STORE_NAME);
    if (typeof client.getStore === 'function') return client.getStore(STORE_NAME);
  }
  throw new Error('Unable to initialize Netlify Blobs client');
}

function normalizeKey(key) {
  if (!key) throw new Error('Key is required');
  return key.startsWith('tickets/') ? key : `tickets/${key}`;
}

async function saveJSON(key, data) {
  const store = await getStore();
  await store.setJSON(normalizeKey(key), data);
  return true;
}

async function readJSON(key) {
  const store = await getStore();
  const out = await store.getJSON(normalizeKey(key));
  return out ?? null;
}

async function listKeys(prefix = 'tickets/') {
  const store = await getStore();
  const keys = [];
  for await (const entry of store.list({ prefix })) {
    if (entry?.key) keys.push(entry.key);
  }
  return keys;
}

module.exports = {
  getStore,
  saveJSON,
  readJSON,
  listKeys,
};
