// Patched tickets-create.js (CommonJS).
// Drop-in replacement to fix 500s by validating input and writing to Netlify Blobs safely.
// Uses the same _shared/store helper used by the other functions.
const { getTicketsStore } = require('./_shared/store');

// Small helper: make a short id
function shortId() {
  return Math.random().toString(36).slice(2, 10);
}

module.exports.handler = async (event) => {
  // Only allow POST when called from the form. GET in the address bar should say "Method Not Allowed".
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse JSON body defensively
    let payload = {};
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (e) {
      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'Invalid JSON body' }),
      };
    }

    const required = ['name', 'kt', 'phone', 'complaint'];
    for (const k of required) {
      if (!payload[k] || String(payload[k]).trim() === '') {
        return {
          statusCode: 400,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ok: false, error: `Missing field: ${k}` }),
        };
      }
    }

    const store = await getTicketsStore();

    // Work out current queue length for a default position.
    let position = 1;
    try {
      const listed = await store.list({ prefix: 'tickets/' });
      if (listed && listed.blobs && Array.isArray(listed.blobs)) {
        position = listed.blobs.length + 1;
      }
    } catch (_) {
      // If listing fails, we still create the ticket with position 1
    }

    const id = shortId();
    const ticket = {
      id,
      createdAt: new Date().toISOString(),
      status: 'waiting',
      priority: payload.priority || 'C',
      name: String(payload.name || '').trim(),
      kt: String(payload.kt || '').trim(),
      phone: String(payload.phone || '').trim(),
      complaint: payload.complaint || '',
      subcomplaints: Array.isArray(payload.subcomplaints) ? payload.subcomplaints : [],
      notes: String(payload.notes || ''),
      redFlags: Array.isArray(payload.redFlags) ? payload.redFlags : [],
      notifiedAt: null,
      position,
    };

    // Persist as JSON. We stringify explicitly to avoid issues with BlobPart coercion.
    const key = `tickets/${id}.json`;
    await store.set(key, JSON.stringify(ticket), { contentType: 'application/json' });

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, id, ticket }),
    };
  } catch (err) {
    // Surface the message to help diagnose deploy-time issues.
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: err.message, stack: err.stack }),
    };
  }
};
