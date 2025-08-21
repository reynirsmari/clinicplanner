// netlify/functions/tickets-notify.js
// Marks a ticket as "called" so the patient's ticket page can show a green banner.
//
// NOTE: This uses the same helper as your other functions:
//   const { getStore } = require('./_shared/storage')
// Make sure _shared/storage.js exists (it was in your repo earlier).

const { getStore } = require('./_shared/storage');

async function getTicketsStore() {
  const storeName = process.env.BLOBS_STORE || 'queue';
  const store = await getStore(storeName);
  return store;
}

module.exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ ok:false, error: 'Method Not Allowed' }) };
  }
  try {
    const url = new URL(event.rawUrl || `https://${event.headers.host}${event.path}`);
    let id = url.searchParams.get('id');
    if (!id && event.body) {
      try { id = JSON.parse(event.body).id } catch {}
    }
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ ok:false, error:'Missing id' }) };
    }

    const store = await getTicketsStore();
    const key = `tickets/${id}.json`;

    const existing = await store.get(key, { type: 'json' });
    if (!existing) {
      return { statusCode: 404, body: JSON.stringify({ ok:false, error:'Not found' }) };
    }

    existing.status = 'called';
    existing.notifiedAt = new Date().toISOString();

    await store.put(key, JSON.stringify(existing), {
      httpMetadata: { contentType: 'application/json' }
    });

    return { statusCode: 200, body: JSON.stringify({ ok:true, id, status: existing.status }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok:false, error: err.message }) };
  }
};