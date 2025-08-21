
import { createClient } from '@netlify/blobs';

const STORE_NAME = process.env.BLOBS_STORE || 'queue';

/**
 * Build a Netlify Blobs client from env vars (works even when
 * the site isn't auto-provisioned for Blobs).
 */
function getClient() {
  const siteID =
    process.env.BLOBS_SITE_ID ||
    process.env.SITE_ID ||
    process.env.NETLIFY_SITE_ID;

  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_TOKEN;

  if (!siteID || !token) {
    throw new Error(
      'Missing Netlify Blobs credentials (siteID/token). ' +
      'Set BLOBS_SITE_ID and BLOBS_TOKEN in your Netlify environment.'
    );
  }
  return createClient({ siteID, token });
}

/** Get a handle to the store (readOnly supported for clarity). */
export function getStore(readOnly = false) {
  const client = getClient();
  return client.store(STORE_NAME, { readOnly });
}

export async function putJson(key, value) {
  const store = getStore(false);
  await store.setJSON(key, value);
}

export async function getJson(key) {
  const store = getStore(true);
  return await store.getJSON(key);
}

export async function listKeys(prefix = '') {
  const store = getStore(true);
  const out = [];
  for await (const entry of store.list({ prefix })) {
    out.push(entry.key);
  }
  return out;
}

/** Return JSON objects for all keys under a prefix. */
export async function listAll(prefix = '') {
  const store = getStore(true);
  const items = [];
  for await (const entry of store.list({ prefix })) {
    const data = await store.getJSON(entry.key);
    if (data) items.push({ key: entry.key, ...data });
  }
  return items;
}
