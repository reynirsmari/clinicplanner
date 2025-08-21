
// netlify/functions/tickets-delete.js
// Deletes a ticket blob.
// POST /api/tickets-delete  body: { id: "abc123" }
const parseJson = async (event) => {
  try {
    if (!event.body) return null;
    return JSON.parse(event.body);
  } catch (e) {
    return null;
  }
};

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
  const name = process.env.BLOBS_STORE || 'queue';
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
    await store.delete(key);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err && err.message ? err.message : String(err) })
    };
  }
};
