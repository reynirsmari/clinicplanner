// Minimal helper used by all functions
const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

function pickEnv() {
  const siteID =
    process.env.BLOBS_SITE_ID ||
    process.env.SITE_ID ||
    process.env.NETLIFY_SITE_ID || '';

  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_TOKEN || '';

  return { siteID, token };
}

async function getClientAndStore(name = 'tickets') {
  const { siteID, token } = pickEnv();
  if (!siteID || !token) {
    const msg = `Blobs manual auth missing: ${!siteID ? 'siteID ' : ''}${!token ? 'token' : ''}`.trim();
    const err = new Error(msg);
    err._http = {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: msg, seen: pickEnv() }),
    };
    throw err;
  }

  // ✅ Works across blobs versions
  const { getStore } = await import('@netlify/blobs');
  return getStore(name, { siteID, token });
}

module.exports = { JSON_HEADERS, pickEnv, getClientAndStore };
