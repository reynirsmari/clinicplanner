// storage.cjs — shared helpers for ticket storage using Netlify Blobs
// - Works in Lambda compatibility mode via connectLambda(event) in each handler
// - Falls back to manual credentials via env vars if needed

const STORE_NAME = 'tickets';
const KEY = 'queue.json';

async function getStore() {
  const blobs = await import('@netlify/blobs');
  try {
    // Preferred: environment already wired by connectLambda(event) in the handler
    return blobs.getStore(STORE_NAME);
  } catch (e) {
    const siteID = process.env.NETLIFY_SITE_ID || process.env.BLOBS_SITE_ID || process.env.SITE_ID;
    const token  = process.env.NETLIFY_API_TOKEN || process.env.BLOBS_TOKEN  || process.env.NETLIFY_TOKEN;
    if (siteID && token) return blobs.getStore(STORE_NAME, { siteID, token });
    throw e;
  }
}

async function readAll() {
  const store = await getStore();
  const data = await store.get(KEY, { type: 'json' });
  return Array.isArray(data) ? data : [];
}

async function writeAll(arr) {
  const store = await getStore();
  await store.set(KEY, JSON.stringify(arr), { contentType: 'application/json' });
}

function sortTickets(arr) {
  const rank = (b) => (b === 'A' ? 0 : b === 'B' ? 1 : 2);
  return [...arr].sort((a, b) => {
    const r = rank(a.band) - rank(b.band);
    if (r !== 0) return r;
    return (a.createdAt || 0) - (b.createdAt || 0);
  });
}

function recalc(all) {
  const waiting = sortTickets(all.filter((t) => t.status === 'waiting'));
  waiting.forEach((t, idx) => (t.estWait = (t.band === 'A' ? 3 : t.band === 'B' ? 6 : 8) * idx));
}

function positionOf(all, id) {
  const waiting = sortTickets(all.filter((t) => t.status === 'waiting'));
  const idx = waiting.findIndex((t) => t.id === id);
  return idx >= 0 ? idx : 0;
}

function computeBand(body) {
  if (body.acute === 'yes') return 'A';
  if (Array.isArray(body.redFlags) && body.redFlags.length > 0) return 'A';
  if ((body.details || '').trim().length > 60) return 'B';
  return 'C';
}

function json(res, status = 200) {
  return {
    statusCode: status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
    },
    body: JSON.stringify(res),
  };
}

function bad(msg, status = 400) {
  return json({ error: msg }, status);
}

module.exports = {
  readAll,
  writeAll,
  sortTickets,
  recalc,
  positionOf,
  computeBand,
  json,
  bad,
};
