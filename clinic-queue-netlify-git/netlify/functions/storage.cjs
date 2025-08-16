// netlify/functions/storage.cjs

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

function pickEnv() {
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
    const missing = [];
    if (!siteID) missing.push('siteID');
    if (!token) missing.push('token');
    const msg = `Blobs manual auth missing: ${missing.join(', ')}.`;
    const err = new Error(msg);
    err._http = {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: msg, seen: pickEnv() }),
    };
    throw err;
  }

  // ✅ Use getStore with explicit credentials (works across Blobs versions)
  const { getStore } = await import('@netlify/blobs');
  return getStore(name, { siteID, token });
}

// Back-compat names if other functions import these:
async function getStore2() { return getClientAndStore('tickets'); }
async function getStore()  { return getClientAndStore('tickets'); }

module.exports = {
  JSON_HEADERS,
  pickEnv,
  getClientAndStore,
  getStore2,
  getStore,
};
