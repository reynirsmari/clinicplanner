import { getStore } from '@netlify/blobs';

const STORE_NAME = process.env.BLOBS_STORE || 'queue';

function manualOptions() {
  const siteID =
    process.env.BLOBS_SITE_ID ||
    process.env.NETLIFY_SITE_ID ||
    process.env.SITE_ID;

  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_TOKEN;

  if (siteID && token) return { siteID, token };
  return undefined;
}

export function getTicketsStore() {
  return getStore(STORE_NAME, manualOptions());
}

export async function putJSON(key, value) {
  const store = getTicketsStore();
  await store.setJSON(key, value);
}

export async function getJSON(key) {
  const store = getTicketsStore();
  return await store.getJSON(key);
}

export async function listPrefix(prefix) {
  const store = getTicketsStore();
  const items = [];
  let cursor = undefined;
  do {
    const page = await store.list({ prefix, cursor, limit: 100 });
    if (page && page.blobs) items.push(...page.blobs);
    cursor = page && page.cursor;
  } while (cursor);
  return items;
}
