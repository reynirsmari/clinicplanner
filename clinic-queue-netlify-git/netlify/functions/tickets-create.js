
// netlify/functions/tickets-create.js (CommonJS)
const { saveJSON } = require('./_shared/storage.js');

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  };
}

function makeId(len = 6) {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += alphabet[(Math.random() * alphabet.length) | 0];
  }
  return out;
}

module.exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'Method Not Allowed' });
  }
  let payload = {};
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch (e) {
    return jsonResponse(400, { ok: false, error: 'Invalid JSON body' });
  }

  const id = payload.id || makeId();
  const now = new Date().toISOString();

  const ticket = {
    id,
    createdAt: now,
    status: 'waiting',
    priority: payload.priority || 'C',
    kt: payload.kt || '',
    name: payload.name || '',
    phone: payload.phone || '',
    acute: !!payload.acute,
    complaint: payload.complaint || '',
    notes: payload.notes || '',
    redFlags: Array.isArray(payload.redFlags) ? payload.redFlags : [],
  };

  try {
    await saveJSON(`${id}.json`, ticket);
    return jsonResponse(200, { ok: true, id });
  } catch (err) {
    console.error('tickets-create error', err);
    return jsonResponse(500, { ok: false, error: err.message || 'Failed to save ticket' });
  }
};
