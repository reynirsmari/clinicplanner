const { getTicketsStore } = require('./_shared/store');

module.exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) };
    }
    const payload = JSON.parse(event.body || '{}');
    const id = payload.id || Math.random().toString(36).slice(2, 9);
    const createdAt = new Date().toISOString();
    const store = await getTicketsStore();
    const { blobs } = await store.list({ prefix: 'tickets/' });
    const position = (blobs?.length || 0) + 1;

    const ticket = {
      id, createdAt, status: 'waiting', position,
      name: payload.name || '', kt: payload.kt || '', phone: payload.phone || '',
      complaint: payload.complaint || '', subcomplaints: payload.subcomplaints || [],
      notes: payload.notes || '', priority: payload.priority || 'C',
      notifiedAt: null, modifiedAt: createdAt
    };
    await store.set(`tickets/${id}.json`, JSON.stringify(ticket), { contentType: 'application/json' });
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: true, id, ticket }) };
  } catch (err) {
    return { statusCode: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};