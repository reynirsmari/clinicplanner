const { ticketKey, putJson } = require('./_shared/storage.js');

function newId() {
  return Math.random().toString(36).slice(2, 7);
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
    const data = JSON.parse(event.body || '{}');

    const id = data.id || newId();
    const createdAt = new Date().toISOString();

    const item = {
      id,
      createdAt,
      status: 'waiting',
      // basic fields expected by the UI
      name: data.name || '',
      kt: data.kt || '',
      phone: data.phone || '',
      priority: data.priority || 'C',
      complaint: data.complaint || '',
      acute: !!data.acute,
      notes: data.notes || '',
      redFlags: Array.isArray(data.redFlags) ? data.redFlags : [],
    };

    await putJson(ticketKey(id), item);

    return {
      statusCode: 201,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, id, href: `/patient/ticket.html?id=${id}` }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: String(err && err.message || err) }),
    };
  }
};
