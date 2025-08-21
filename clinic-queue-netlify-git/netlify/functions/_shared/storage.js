
// netlify/functions/_shared/storage.js (ESM)
let _store;

/**
 * Resolve site/token in all the ways folks typically configure Netlify.
 */
function resolveSiteId() {
  return (
    process.env.BLOBS_SITE_ID ||
    process.env.SITE_ID ||
    process.env.NETLIFY_SITE_ID ||
    ""
  );
}
function resolveToken() {
  return (
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_TOKEN ||
    ""
  );
}
function resolveStoreName() {
  return process.env.BLOBS_STORE || "queue";
}

async function ensureSdk() {
  // Load lazily to avoid bundling surprises
  const mod = await import("@netlify/blobs");
  // Some bundlers place the API on default
  return mod.getStore || (mod.default && mod.default.getStore);
}

export async function ensureStore() {
  if (_store) return _store;
  const getStore = await ensureSdk();
  if (typeof getStore !== "function") {
    throw new Error("Netlify Blobs SDK not available: getStore is not a function");
  }
  _store = getStore({
    name: resolveStoreName(),
    siteID: resolveSiteId(),
    token: resolveToken(),
  });
  return _store;
}

export function ticketKey(id) {
  return `tickets/${id}.json`;
}

export async function putJson(key, value) {
  const store = await ensureStore();
  await store.setJSON(key, value);
}

export async function getJson(key) {
  const store = await ensureStore();
  return await store.getJSON(key);
}

export async function list(prefix = "") {
  const store = await ensureStore();
  const { objects = [] } = await store.list({ prefix });
  return objects;
}

export async function del(key) {
  const store = await ensureStore();
  await store.delete(key);
}
