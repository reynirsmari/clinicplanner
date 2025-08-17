let _createClient = null;

async function ensureCreateClient() {
  if (!_createClient) {
    const mod = await import('@netlify/blobs');
    if (!mod || typeof mod.createClient !== 'function') {
      throw new Error('createClient is not available from @netlify/blobs');
    }
    _createClient = mod.createClient;
  }
  return _createClient;
}

function pickEnv(...keys) {
  for (const k of keys) {
    const v = process.env[k];
    if (v) return v;
  }
  return undefined;
}

async function getClient() {
  const siteID = pickEnv('BLOBS_SITE_ID', 'SITE_ID', 'NETLIFY_SITE_ID');
  const token  = pickEnv('BLOBS_TOKEN', 'NETLIFY_API_TOKEN', 'NETLIFY_TOKEN');
  if (!siteID || !token) {
    throw new Error(`Blobs client missing credentials. siteID=${!!siteID}, token=${!!token}`);
  }
  const createClient = await ensureCreateClient();
  return createClient({ siteID, token });
}

async function getStore(name) {
  const client = await getClient();
  return client.getStore(name);
}

async function readAllJSON(store) {
  const { blobs } = await store.list();
  const results = [];
  for (const b of blobs) {
    const data = await store.get(b.key, { type: 'json' });
    results.push({ key: b.key, ...data });
  }
  return results;
}

function envSeen() {
  return {
    BLOBS_SITE_ID: process.env.BLOBS_SITE_ID || null,
    SITE_ID: process.env.SITE_ID || null,
    NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID || null,
    BLOBS_TOKEN: process.env.BLOBS_TOKEN ? 'present' : '',
    NETLIFY_API_TOKEN: process.env.NETLIFY_API_TOKEN ? 'present' : '',
    NETLIFY_TOKEN: process.env.NETLIFY_TOKEN ? 'present' : ''
  };
}

module.exports = { getClient, getStore, readAllJSON, envSeen };
