// netlify/functions/storage.cjs  (CommonJS, safe on Netlify)
// Purpose: create a Netlify Blobs client with explicit credentials so we
// never depend on auto-injection.

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

function pickEnv() {
  // Accept any of these names to avoid scope/name mismatches in Netlify UI
  const siteID =
    process.env.BLOBS_SITE_ID ||
    process.env.SITE_ID ||
    process.env.NETLIFY_SITE_ID ||
    '';

  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_TOKEN ||
    '';

  return { siteID, token };
}

async function getClientAndStore(name = 'tickets') {
  const { siteID, token } = pickEnv();
  if (!siteID || !token) {
    // Make the failure obvious and debuggable from the function response
    const missing = [];
    if (!siteID) missing.push('siteID');
    if (!token) missing.push('token');
    const msg = `Blobs manual auth missing: ${missing.join(', ')}. ` +
      `Expected BLOBS_SITE_ID/SITE_ID/NETLIFY_SITE_ID and ` +
      `BLOBS_TOKEN/NETLIFY_API_TOKEN/NETLIFY_TOKEN to be set.`;
    const err = new Error(msg);
    err._http = {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: msg, seen: pickEnv() }),
    };
    throw err;
  }

  // Dynamic import because @netlify/blobs is ESM
  const { createClient } = await import('@netlify/blobs');
  const client = createClient({ siteID, token }); // <— critical line
  return client.getStore(name);
}

// Convenience helpers used by list/create/etc.
// If your other functions already import getStore2/getStore, these names cover both.
async function getStore2() { return getClientAndStore('tickets'); }
async function getStore()  { return getClientAndStore('tickets'); }

module.exports = {
  JSON_HEADERS,
  pickEnv,
  getClientAndStore,
  getStore2,
  getStore,
};
