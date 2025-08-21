
// netlify/functions/tickets-notify.js
// Marks a ticket as "notified" so the patient sees a green message.
// POST /api/tickets-notify  body: { id: "abc123" }
const parseJson = async (event) => {
  try {
    if (!event.body) return null;
    return JSON.parse(event.body);
  } catch (e) {
    return null;
  }
};

// Dynamic ESM import so this works in CommonJS functions
async function getStoreCompat() {
  const { getStore } = await import('@netlify/blobs');
  const siteID =
    process.env.BLOBS_SITE_ID ||
    process.env.NETLIFY_SITE_ID ||
    process.env.SITE_ID;
  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_TOKEN;
  const name = process.env.BLOBS_STORE || 'queue'; // default store name
  return getStore({ name, siteID, token });
}

module.exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) };
  }
  const payload = await parseJson(event) || {};
  const id = payload.id || (payload.ticketId);
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing id' }) };
  }

  try {
    const store = await getStoreCompat();
    const key = `tickets/${id}.json`;
    // Read existing ticket
    const existing = await store.get(key, { type: 'json' });
    if (!existing) {
      return { statusCode: 404, body: JSON.stringify({ ok: false, error: 'Ticket not found' }) };
    }
    // Update
    existing.status = 'notified';
    existing.notifiedAt = new Date().toISOString();

    // Persist
    await store.set(key, JSON.stringify(existing), {
      contentType: 'application/json; charset=utf-8'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err && err.message ? err.message : String(err) })
    };
  }
};
