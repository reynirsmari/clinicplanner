// netlify/functions/tickets-reorder.js
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
async function readJson(shared, store, key){
  if (typeof shared.getJson === 'function') return await shared.getJson(store, key);
  if (typeof store.getJSON === 'function') return await store.getJSON(key);
  const raw = await (typeof store.get === 'function' ? store.get(key) : null);
  return raw ? JSON.parse(raw) : null;
}
async function writeJson(shared, store, key, value){
  if (typeof shared.putJson === 'function') return await shared.putJson(store, key, value);
  if (typeof store.setJSON === 'function') return await store.setJSON(key, value);
  if (typeof store.set === 'function') return await store.set(key, JSON.stringify(value), { contentType: 'application/json' });
  throw new Error('No write method available on store.');
}
module.exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers:{'content-type':'application/json'}, body: JSON.stringify({ ok:false, error:'Method not allowed' }) };
    let body = {}; try { body = JSON.parse(event.body || '{}'); } catch {}
    const order = Array.isArray(body.order) ? body.order : null;
    if (!order || order.length === 0) return { statusCode: 400, headers:{'content-type':'application/json'}, body: JSON.stringify({ ok:false, error:'Missing order array' }) };
    const shared = getShared(); const store = await getStore(shared);
    let updated = 0;
    for (let i = 0; i < order.length; i++) {
      const id = String(order[i] || '');
      if (!/^[a-zA-Z0-9_-]+$/.test(id)) continue;
      const key = `tickets/${id}.json`;
      const item = await readJson(shared, store, key);
      if (!item) continue;
      const newPos = i + 1;
      if (item.position !== newPos) {
        item.position = newPos;
        item.updatedAt = new Date().toISOString();
        await writeJson(shared, store, key, item);
        updated++;
      }
    }
    return { statusCode: 200, headers:{'content-type':'application/json'}, body: JSON.stringify({ ok:true, updated }) };
  } catch (err) {
    return { statusCode: 500, headers:{'content-type':'application/json'}, body: JSON.stringify({ ok:false, error: err.message || String(err) }) };
  }
};
