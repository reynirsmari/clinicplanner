// netlify/functions/tickets-list.js
function getShared(){
  try { return require('./_shared/store'); } catch(e) {
    try { return require('./_shared/storage'); } catch(e2) {
      return {};
    }
  }
}
async function getStore(shared){
  if (typeof shared.getTicketsStore === 'function') return await shared.getTicketsStore();
  if (typeof shared.ensureStore === 'function') return await shared.ensureStore('tickets');
  throw new Error('No shared store helper found.');
}
async function listKeys(shared, store){
  if (typeof shared.list === 'function') {
    try { return await shared.list(store, 'tickets/'); } catch {}
    try { const all = await shared.list(store); return (all || []).filter(k => typeof k === 'string' ? k.startsWith('tickets/') : k.key?.startsWith('tickets/')); } catch {}
  }
  if (typeof store.list === 'function') {
    const out = await store.list({ prefix: 'tickets/' });
    if (Array.isArray(out?.blobs)) return out.blobs.map(b => b.key);
    if (Array.isArray(out)) return out.map(b => b.key || b);
  }
  return [];
}
async function readJson(shared, store, key){
  if (typeof shared.getJson === 'function') return await shared.getJson(store, key);
  if (typeof store.getJSON === 'function') return await store.getJSON(key);
  const raw = await (typeof store.get === 'function' ? store.get(key) : null);
  return raw ? JSON.parse(raw) : null;
}
module.exports.handler = async () => {
  try {
    const shared = getShared();
    const store = await getStore(shared);
    const keys = await listKeys(shared, store);
    const items = [];
    for (const k of keys) {
      const key = typeof k === 'string' ? k : (k.key || '');
      if (!key || !key.endsWith('.json')) continue;
      const t = await readJson(shared, store, key);
      if (!t) continue;
      items.push(t);
    }
    return { statusCode: 200, headers: { 'content-type':'application/json' }, body: JSON.stringify({ ok:true, items }) };
  } catch (err) {
    return { statusCode: 500, headers: { 'content-type':'application/json' }, body: JSON.stringify({ ok:false, error: err.message || 'Unexpected error' }) };
  }
};
