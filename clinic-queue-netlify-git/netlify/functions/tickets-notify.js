// netlify/functions/tickets-notify.js
// Marks a ticket as "called" so the patient sees the green message.
// Accepts POST (preferred) or GET. ID can be in JSON body { id } or query string ?id=...

const parseJson = async (event) => {
  try { return event.body ? JSON.parse(event.body) : null; } catch { return null; }
};

async function getStoreCompat() {
  // Dynamic import to work inside CommonJS functions
  const { getStore } = await import('@netlify/blobs');
  const siteID =
    process.env.BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token  =
    process.env.BLOBS_TOKEN   || process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_TOKEN;
  const name = process.env.BLOBS_STORE || 'queue';
  // Works with automatic context when siteID/token are undefined
  return getStore({ name, siteID, token });
}

module.exports.handler = async (event) => {
  if (!['POST','GET','OPTIONS'].includes(event.httpMethod)) {
    return { statusCode: 405, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ok:false, error:'Method Not Allowed' }) };
  }
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }

  const body = (await parseJson(event)) || {};
  const qs = event.queryStringParameters || {};
  const id = body.id || body.ticketId || qs.id;
  if (!id) {
    return { statusCode: 400, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ok:false, error:'Missing id' }) };
  }

  try {
    const store = await getStoreCompat();
    const key = `tickets/${id}.json`;
    const ticket = await store.get(key, { type: 'json' });
    if (!ticket) {
      return { statusCode: 404, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ok:false, error:'Ticket not found' }) };
    }

    // Update status used by patient UI
    ticket.status = 'called';
    ticket.notifiedAt = new Date().toISOString();

    await store.set(key, JSON.stringify(ticket), { contentType: 'application/json; charset=utf-8' });

    return { statusCode: 200, headers:{'Access-Control-Allow-Origin':'*','Content-Type':'application/json'}, body: JSON.stringify({ ok:true }) };
  } catch (err) {
    return { statusCode: 500, headers:{'Access-Control-Allow-Origin':'*','Content-Type':'application/json'}, body: JSON.stringify({ ok:false, error: (err && err.message) || String(err) }) };
  }
};
