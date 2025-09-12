// netlify/functions/_shared/store.js
// Robust store helper for Netlify Blobs across SDK/runtime variants.
// Works in CommonJS functions and falls back to REST if the SDK export shape changes.

const STORE_NAME = process.env.BLOBS_STORE || 'queue';

const SITE_ID =
  process.env.BLOBS_SITE_ID ||
  process.env.NETLIFY_SITE_ID ||
  process.env.SITE_ID ||
  '';

const TOKEN =
  process.env.BLOBS_TOKEN ||
  process.env.NETLIFY_API_TOKEN ||
  process.env.NETLIFY_TOKEN ||
  '';

const API_BASE = 'https://api.netlify.com/api/v1/blobs';

// tiny guard to keep responses consistent
function assert(ok, msg) {
  if (!ok) {
    const err = new Error(msg);
    err.expose = true;
    throw err;
  }
}

async function dynamicImportBlobs() {
  try {
    // The package is ESM; dynamic import works in CJS functions.
    return await import('@netlify/blobs');
  } catch {
    return null;
  }
}

// ---------- REST fallback client ----------
function restStore(name = STORE_NAME) {
  assert(SITE_ID && TOKEN, 'REST fallback needs SITE_ID and TOKEN env vars');

  const auth = { Authorization: `Bearer ${TOKEN}` };

  const objUrl = (key) =>
    `${API_BASE}/sites/${SITE_ID}/stores/${encodeURIComponent(
      name
    )}/objects/${encodeURIComponent(key)}`;

  const listUrl = (prefix) => {
    const url = new URL(
      `${API_BASE}/sites/${SITE_ID}/stores/${encodeURIComponent(name)}`
    );
    if (prefix) url.searchParams.set('prefix', prefix);
    // return many (default 100); bump if you expect more
    url.searchParams.set('limit', '1000');
    return url.toString();
  };

  return {
    async set(key, value, opts = {}) {
      const body =
        typeof value === 'string' || value instanceof Uint8Array
          ? value
          : JSON.stringify(value);
      const res = await fetch(objUrl(key), {
        method: 'PUT',
        headers: {
          ...auth,
          'content-type': opts.contentType || 'application/json',
        },
        body,
      });
      assert(res.ok, `REST put failed: ${res.status}`);
      return true;
    },

    async get(key, { type } = {}) {
      const res = await fetch(objUrl(key), { headers: auth });
      if (res.status === 404) return null;
      assert(res.ok, `REST get failed: ${res.status}`);
      if (type === 'json') return res.json();
      if (type === 'stream') return res.body;
      return res.text();
    },

    async delete(key) {
      const res = await fetch(objUrl(key), { method: 'DELETE', headers: auth });
      if (res.status === 404) return false;
      assert(res.ok, `REST delete failed: ${res.status}`);
      return true;
    },

    // For parity with the SDK’s listPrefix helper you used before
    async listPrefix(prefix = '') {
      const res = await fetch(listUrl(prefix), { headers: auth });
      assert(res.ok, `REST list failed: ${res.status}`);
      const data = await res.json();
      // data.objects: [{ key, size, etag, uploaded_at }]
      return (data.objects || []).map((o) => ({
        key: o.key,
        size: o.size,
        uploadedAt: o.uploaded_at,
      }));
    },
  };
}

// ---------- Primary factory ----------
async function getTicketsStore() {
  // 1) Runtime-bound store (best case; no token needed)
  const mod = await dynamicImportBlobs();
  if (mod && typeof mod.getStore === 'function') {
    return mod.getStore({ name: STORE_NAME });
  }

  // 2) SDK client (different export shapes across versions)
  if (mod) {
    // Newer SDK
    if (typeof mod.createClient === 'function') {
      assert(
        SITE_ID && TOKEN,
        'createClient requires SITE_ID and TOKEN env vars'
      );
      const client = mod.createClient({ siteID: SITE_ID, token: TOKEN });
      return client.getStore({ name: STORE_NAME });
    }
    // Older SDK
    if (typeof mod.BlobsClient === 'function') {
      assert(
        SITE_ID && TOKEN,
        'BlobsClient requires SITE_ID and TOKEN env vars'
      );
      const client = new mod.BlobsClient({ siteId: SITE_ID, token: TOKEN });
      return client.store(STORE_NAME);
    }
  }

  // 3) Final fallback: REST
  return restStore(STORE_NAME);
}

module.exports = { getTicketsStore };
