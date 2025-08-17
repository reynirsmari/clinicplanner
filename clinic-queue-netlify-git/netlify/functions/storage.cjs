// netlify/functions/storage.cjs
// Works with both modern (@netlify/blobs getStore) and older (createClient) shapes.

const { env } = process;

function creds() {
  return {
    siteID:
      env.BLOBS_SITE_ID ||
      env.NETLIFY_SITE_ID ||
      env.SITE_ID,
    token:
      env.BLOBS_TOKEN ||
      env.NETLIFY_API_TOKEN ||
      env.NETLIFY_TOKEN,
  };
}

async function loadModule() {
  // ESM module – always dynamic import from CJS
  return await import('@netlify/blobs');
}

async function getStore(name) {
  const mod = await loadModule();
  const { siteID, token } = creds();

  // Prefer the current API
  if (typeof mod.getStore === 'function') {
    return await mod.getStore({ name, siteID, token });
  }

  // Fallback API
  if (typeof mod.createClient === 'function') {
    const client = mod.createClient({ siteID, token });
    return await client.getStore(name);
  }

  throw new Error('No compatible Netlify Blobs API in @netlify/blobs');
}

/* ---------- JSON helpers that work across versions ---------- */
async function setJSON(store, key, value) {
  if (typeof store.setJSON === 'function') return store.setJSON(key, value);
  if (typeof store.set === 'function') {
    return store.set(key, JSON.stringify(value), {
      contentType: 'application/json',
    });
  }
  throw new Error('Blobs store has no JSON writer');
}

async function getJSON(store, key) {
  if (typeof store.getJSON === 'function') return store.getJSON(key);

  const blob = await store.get(key);
  if (!blob) return null;

  if (typeof blob.json === 'function') return blob.json();
  const text = await blob.text();
  return JSON.parse(text);
}

async function listItems(store) {
  // Current API returns { items: [...] }
  if (typeof store.list === 'function') {
    const res = await store.list();
    return res.items || res.blobs || [];
  }
  throw new Error('Blobs store has no list()');
}

/* ---------- Public helpers used by your endpoints ---------- */
exports.getTicketsStore = async () => getStore('tickets');

exports.writeTicket = async (id, data) => {
  const store = await exports.getTicketsStore();
  await setJSON(store, `tickets/${id}.json`, data);
  return { ok: true };
};

exports.readTicket = async (id) => {
  const store = await exports.getTicketsStore();
  return getJSON(store, `tickets/${id}.json`);
};

exports.listTickets = async () => {
  const store = await exports.getTicketsStore();
  return listItems(store);
};

exports.deleteTicket = async (id) => {
  const store = await exports.getTicketsStore();
  if (typeof store.delete === 'function') {
    return store.delete(`tickets/${id}.json`);
  }
  if (typeof store.del === 'function') {
    return store.del(`tickets/${id}.json`);
  }
  throw new Error('Blobs store has no delete()');
};
