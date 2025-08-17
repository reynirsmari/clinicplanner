const { getStore } = require('./storage.cjs');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const body = JSON.parse(event.body || '{}');
    const id   = body.id;
    const action = body.action;

    if (!id || !action) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'id and action required' }) };
    }

    const store = await getStore('tickets');
    const current = await store.get(id, { type: 'json' });
    if (!current) {
      return { statusCode: 404, body: JSON.stringify({ ok: false, error: 'not found' }) };
    }

    const now = new Date().toISOString();
    switch (action) {
      case 'call': current.status = 'called'; current.calledAt = now; break;
      case 'defer': current.status = 'waiting'; current.deferUntil = Date.now() + 10*60*1000; break;
      case 'noshow': current.status = 'no-show'; current.closedAt = now; break;
      case 'done': current.status = 'done'; current.closedAt = now; break;
      case 'escalate': current.status = 'escalated'; current.closedAt = now; break;
      default: return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'unknown action' }) };
    }

    await store.setJSON(id, current);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, ticket: current }) };
  } catch (err) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: false, error: err.message, stack: err.stack }) };
  }
};
