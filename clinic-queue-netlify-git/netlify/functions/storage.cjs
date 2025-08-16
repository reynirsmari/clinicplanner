// Shared storage helpers (manual-auth for Netlify Blobs)
const STORE_NAME = 'tickets';
const KEY = 'queue.json';

async function getStore() {
  const { getStore } = await import('@netlify/blobs');
  const siteID =
    process.env.BLOBS_SITE_ID ||
    process.env.NETLIFY_SITE_ID ||
    process.env.SITE_ID;
  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_TOKEN;
  if (!siteID || !token) {
    throw new Error('Missing BLOBS_SITE_ID and/or BLOBS_TOKEN environment variables.');
  }
  return getStore(STORE_NAME, { siteID, token });
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
  waiting.forEach((t, idx) => {
    const minsPer = t.band === 'A' ? 3 : t.band === 'B' ? 6 : 8;
    t.estWait = minsPer * idx;
  });
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
  readAll, writeAll, sortTickets, recalc, positionOf, computeBand, json, bad
};
