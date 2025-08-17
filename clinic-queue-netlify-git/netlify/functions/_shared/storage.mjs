// netlify/functions/_shared/storage.mjs
import { createClient } from '@netlify/blobs';

/**
 * Returns a Blobs store named "clinic-queue".
 * Works both in Netlify Functions (auto env) and when you pass
 * explicit env (BLOBS_SITE_ID, BLOBS_TOKEN). We prefer explicit if present.
 */
export function getStore() {
  const siteID = process.env.BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID;
  const token  = process.env.BLOBS_TOKEN   || process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_TOKEN;

  const client = (siteID && token)
    ? createClient({ siteID, token })
    : createClient();

  return client.store('clinic-queue');
}

// --- helpers ----

export async function saveJSON(key, data) {
  const store = getStore();
  await store.set(key, JSON.stringify(data), { contentType: 'application/json' });
}

export async function readJSON(key) {
  const store = getStore();
  return await store.get(key, { type: 'json' });
}

export async function listKeys(prefix = '') {
  const store = getStore();
  const { blobs } = await store.list({ prefix });
  return blobs?.map(b => b.key) || [];
}