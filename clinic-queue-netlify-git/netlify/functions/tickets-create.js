// netlify/functions/tickets-create.js
const { getTicketsStore } = require('./_shared/store');

function id10() {
  return Math.random().toString(36).slice(2, 12);
}

module.exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const now = new Date().toISOString();
    const id = payload.id || id10();

    const ticket = {
      id,
      createdAt: now,
      modifiedAt: now,
      status: 'waiting',
      priority: payload.priority || 'C',
      name: (payload.name || '').trim(),
      kt: (payload.kt || '').trim(),
      phone: (payload.phone || '').trim(),
      complaint: (payload.complaint || '').trim(),
      subcomplaints: Array.isArray(payload.subcomplaints) ? payload.subcomplaints : [],
      notes: payload.notes || '',
      redFlags: Array.isArray(payload.redFlags) ? payload.redFlags : [],
      notifiedAt: null,
      calledAt: null,
    };

    const store = await getTicketsStore();
    const key = `tickets/${id}.json`;
    await store.set(key, JSON.stringify(ticket), {
      metadata: { 'content-type': 'application/json' },
    });

    // Compute rough position among "waiting" tickets created up to now
    let position = 1;
    for await (const { key: k } of store.list({ prefix: 'tickets/' })) {
      if (k === key) continue;
      const t = await store.get(k, { type: 'json' });
      if (t && t.status === 'waiting' && t.createdAt <= now) position++;
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, id, position }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};