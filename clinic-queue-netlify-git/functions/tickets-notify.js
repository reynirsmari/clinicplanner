const { getTicketsStore } = require('./_shared/store');

module.exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) };
    }
    const id = (event.queryStringParameters && event.queryStringParameters.id) || '';
    if (!id) return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing id' }) };
    const store = await getTicketsStore();
    const key = `tickets/${id}.json`;
    const ticket = await store.get(key, { type: 'json' });
    if (!ticket) return { statusCode: 404, body: JSON.stringify({ ok: false, error: 'Not found' }) };
    ticket.status = 'called';
    ticket.notifiedAt = new Date().toISOString();
    ticket.modifiedAt = ticket.notifiedAt;
    await store.set(key, JSON.stringify(ticket), { contentType: 'application/json' });
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};