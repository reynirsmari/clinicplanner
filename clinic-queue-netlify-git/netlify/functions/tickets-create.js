const { getStore } = require('./storage.cjs');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const body = JSON.parse(event.body || '{}');

    const kt = String(body.kt || '').replace(/\D/g, '');
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const acute = !!body.acute;
    const complaint = body.complaint || '';
    const details = body.details || '';
    const redFlags = Array.isArray(body.redFlags) ? body.redFlags : [];

    if (!(kt && kt.length === 10 && name && phone)) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing or invalid fields' }) };
    }

    const id = 't-' + Math.random().toString(36).slice(2, 8);
    const createdAt = new Date().toISOString();
    const priority = acute ? 'A' : (redFlags.length ? 'B' : 'C');

    const ticket = { id, kt, name, phone, acute, complaint, details, redFlags, priority, status: 'waiting', createdAt };

    const store = await getStore('tickets');
    await store.setJSON(id, ticket);

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, ticket }) };
  } catch (err) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: false, error: err.message, stack: err.stack }) };
  }
};
