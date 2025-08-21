// netlify/functions/tickets-delete.js
// Deletes a ticket (or you can soft-delete by writing status='done')
// Expects: POST with JSON body { id: "ticketId" }
const { ensureStore } = require('./_shared/storage');

const json = (status, body) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

module.exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return json(405, { ok: false, error: 'Method Not Allowed' });
    }

    let id;
    try { id = (JSON.parse(event.body || '{}')).id; } catch (_) {}
    if (!id) return json(400, { ok: false, error: 'Missing id' });

    const store = await ensureStore();
    const key = `tickets/${id}.json`;

    // Hard delete
    await store.delete(key);

    // // Soft delete (optional)
    // const current = await store.get(key, { type: 'json' });
    // if (current) {
    //   current.status = 'done';
    //   current.doneAt = new Date().toISOString();
    //   await store.set(key, JSON.stringify(current), { 'content-type': 'application/json' });
    // }

    return json(200, { ok: true, id });
  } catch (err) {
    return json(500, { ok: false, error: err.message || 'Server error' });
  }
};
