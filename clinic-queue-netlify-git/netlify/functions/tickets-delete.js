// netlify/functions/tickets-delete.js
// Removes a ticket from the queue.
// Accepts DELETE (preferred) or POST. ID can be in JSON body { id } or query string ?id=...

const parseJson = async (event) => {
  try {
    return event.body ? JSON.parse(event.body) : null;
  } catch {
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
  // Allow DELETE (recommended) and POST for convenience.
  if (!['DELETE', 'POST', 'OPTIONS'].includes(event.httpMethod)) {
    return { statusCode: 405, body: JSON.stringify({ ok:false, error:'Method Not Allowed' }) };
  }
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }

  const payload = (await parseJson(event)) || {};
  const qs = event.queryStringParameters || {};
  const id = payload.id || payload.ticketId || qs.id;

  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ ok:false, error:'Missing id' }) };
  }

  try {
    const store = await getStoreCompat();
    const key = `tickets/${id}.json`;

    // Delete the blob if it exists.
    // Some Netlify Blobs versions use .delete(), others use .del(). Try both.
    if (typeof store.delete === 'function') {
      await store.delete(key);
    } else if (typeof store.del === 'function') {
      await store.del(key);
    } else {
      throw new Error('delete API not available on store');
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type':'application/json' },
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type':'application/json' },
      body: JSON.stringify({ ok:false, error: (err && err.message) || String(err) })
    };
  }
};
