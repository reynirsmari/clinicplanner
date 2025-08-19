// Blobs helper with robust fallbacks for different @netlify/blobs versions
// Works with: createClient().store(), or legacy getStore({ name, siteId, token })
const STORE_NAME = "tickets";

const SITE_ID =
  process.env.BLOBS_SITE_ID ||
  process.env.NETLIFY_SITE_ID ||
  process.env.SITE_ID ||
  "";
const TOKEN =
  process.env.BLOBS_TOKEN ||
  process.env.NETLIFY_TOKEN ||
  process.env.NETLIFY_API_TOKEN ||
  "";

async function loadBlobs() {
  // dynamic import to avoid bundler resolution issues
  const mod = await import("@netlify/blobs");
  return mod || {};
}

export async function ensureStore() {
  const blobs = await loadBlobs();
  if (typeof blobs.createClient === "function") {
    // Preferred modern API
    const client =
      SITE_ID && TOKEN ? blobs.createClient({ siteId: SITE_ID, token: TOKEN }) : blobs.createClient();
    if (typeof client.store !== "function") {
      throw new Error("Netlify Blobs client missing .store()");
    }
    return client.store(STORE_NAME);
  }
  if (typeof blobs.getStore === "function") {
    // Legacy API
    return blobs.getStore({
      name: STORE_NAME,
      siteId: SITE_ID || undefined,
      token: TOKEN || undefined,
    });
  }
  throw new Error("No compatible Netlify Blobs API found (createClient/getStore missing).");
}

export async function putJson(key, obj) {
  const store = await ensureStore();
  if (typeof store.setJSON === "function") {
    await store.setJSON(key, obj);
  } else if (typeof store.set === "function") {
    await store.set(key, JSON.stringify(obj), { contentType: "application/json" });
  } else {
    throw new Error("Blobs store has no set/setJSON");
  }
}

export async function getJson(key) {
  const store = await ensureStore();
  if (typeof store.getJSON === "function") {
    return await store.getJSON(key);
  }
  if (typeof store.get === "function") {
    const res = await store.get(key);
    if (!res) return null;
    if (typeof res.json === "function") return await res.json();
    if (res.body) return JSON.parse(await res.text());
    return typeof res === "string" ? JSON.parse(res) : res;
  }
  throw new Error("Blobs store has no get/getJSON");
}

export async function list(prefix = "tickets/") {
  const store = await ensureStore();
  if (typeof store.list === "function") {
    return await store.list({ prefix });
  }
  // minimal legacy fallback: no list -> empty
  return { blobs: [] };
}
