
// netlify/functions/tickets-reorder.js
// Reorder tickets without using createClient. We reuse the same store helper the rest
// of your functions use, so it works in your current runtime.

const { getTicketsStore } = require('./_shared/store');

/** Persist JSON with backward compatibility for clients that don't expose setJSON */
async function putJsonCompat(store, key, value) {
  if (typeof store.setJSON === 'function') {
    return store.setJSON(key, value);
  }
  // Fallback
  return store.set(key, JSON.stringify(value), { contentType: 'application/json' });
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'Missing body' }),
      };
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch {
      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'Invalid JSON' }),
      };
    }

    const order = Array.isArray(body.order) ? body.order : null;
    if (!order || !order.length || !order.every(id => typeof id === 'string')) {
      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'Invalid order payload' }),
      };
    }

    const store = await getTicketsStore();

    // Update each ticket's position based on the list order (1-based index).
    // We do this sequentially to keep write pressure low.
    let updated = 0;
    for (let i = 0; i < order.length; i++) {
      const id = order[i];
      const key = `tickets/${id}.json`;
      const ticket = await store.get(key, { type: 'json' });
      if (!ticket) continue; // if missing, just skip

      // Only write when the position actually changes
      const newPos = i + 1;
      if (ticket.position !== newPos) {
        ticket.position = newPos;
        ticket.modifiedAt = new Date().toISOString();
        await putJsonCompat(store, key, ticket);
        updated++;
      }
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, updated }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: err.message || 'Unexpected error' }),
    };
  }
};
