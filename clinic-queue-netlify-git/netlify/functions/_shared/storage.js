
/**
 * Storage helper that works with multiple @netlify/blobs versions and
 * both auto and manual environment.  Defaults to store name 'queue'.
 */
export async function openStore() {
  const mod = await import('@netlify/blobs');
  const name = process.env.BLOBS_STORE || 'queue';

  const siteID = process.env.BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token  = process.env.BLOBS_TOKEN    || process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_TOKEN;

  // Try new signature: getStore({ name, siteID?, token? })
  if (typeof mod.getStore === 'function') {
    try {
      return mod.getStore({ name, ...(siteID && token ? { siteID, token } : {}) });
    } catch (e) {
      // Try legacy signature: getStore(name, { siteID, token })
      try {
        return mod.getStore(name, (siteID && token) ? { siteID, token } : {});
      } catch (e2) {
        throw e2;
      }
    }
  }
  // Older: createClient + client.store(name)
  if (typeof mod.createClient === 'function') {
    const client = mod.createClient((siteID && token) ? { siteID, token } : {});
    if (typeof client.store === 'function') {
      return client.store(name);
    }
  }
  throw new Error('Unsupported @netlify/blobs version');
}

export async function putJson(key, value){
  const store = await openStore();
  await store.set(key, JSON.stringify(value), { contentType: 'application/json' });
}

export async function getJson(key){
  const store = await openStore();
  const res = await store.get(key, { type: 'json' });
  return res;
}

export async function del(key){
  const store = await openStore();
  await store.delete(key);
}

export async function list(prefix){
  const store = await openStore();
  const out = await store.list({ prefix });
  return out.blobs?.map(b => b.key) || [];
}
