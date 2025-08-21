
// CommonJS helper that works with both modern and legacy @netlify/blobs APIs.
/* eslint-disable */
const STORE_NAME = process.env.BLOBS_STORE || 'queue';

function readEnv(name) {
  return process.env[name] || process.env['NETLIFY_' + name] || process.env[name.replace('BLOBS_', '')];
}

function getStoreCompat() {
  let mod;
  try { mod = require('@netlify/blobs'); } catch (e) { mod = null; }
  if (!mod) {
    throw new Error('Netlify Blobs SDK not available');
  }

  // Modern API: getStore({ name })
  if (typeof mod.getStore === 'function') {
    return mod.getStore({ name: STORE_NAME });
  }

  // Legacy API: createClient({ siteId, token }).getStore(name)
  if (typeof mod.createClient === 'function') {
    const siteId = readEnv('BLOBS_SITE_ID') || readEnv('SITE_ID') || readEnv('SITEID');
    const token  = readEnv('BLOBS_TOKEN')    || readEnv('API_TOKEN') || readEnv('TOKEN');
    if (!siteId || !token) {
      const err = new Error('Missing Netlify Blobs credentials');
      err.details = { siteId: !!siteId, token: !!token };
      throw err;
    }
    const client = mod.createClient({ siteId, token });
    return client.getStore(STORE_NAME);
  }

  throw new Error('Unsupported @netlify/blobs API shape');
}

async function putJson(key, value) {
  const store = getStoreCompat();
  if (typeof store.setJSON === 'function') return store.setJSON(key, value);
  if (typeof store.put === 'function') return store.put(key, JSON.stringify(value), { contentType: 'application/json' });
  throw new Error('No put method on store');
}

async function getJson(key) {
  const store = getStoreCompat();
  if (typeof store.getJSON === 'function') return store.getJSON(key);
  if (typeof store.get === 'function') {
    const res = await store.get(key);
    if (!res) return null;
    if (typeof res.json === 'function') return res.json();
    try { return JSON.parse(res); } catch { return null; }
  }
  throw new Error('No get method on store');
}

async function list(prefix) {
  const store = getStoreCompat();
  if (typeof store.list === 'function') return store.list({ prefix });
  throw new Error('No list method on store');
}

async function del(key) {
  const store = getStoreCompat();
  if (typeof store.delete === 'function') return store.delete(key);
  if (typeof store.del === 'function') return store.del(key);
  throw new Error('No delete method on store');
}

module.exports = { getStoreCompat, putJson, getJson, list, del };
