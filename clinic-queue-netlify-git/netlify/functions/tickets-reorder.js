// netlify/functions/tickets-reorder.js
module.exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ ok:false, error: 'Method not allowed' }) };
    }
    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch {}
    const order = Array.isArray(body.order) ? body.order : null;
    if (!order || order.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ ok:false, error:'Missing order array' }) };
    }

    const { createClient } = await import('@netlify/blobs');
    const siteID = process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_API_TOKEN;
    const client = createClient(siteID && token ? { siteID, token } : undefined);
    const store = client.getStore('tickets'); // keep same store name as other functions

    let updated = 0;
    for (let i = 0; i < order.length; i++) {
      const id = String(order[i] || '');
      if (!/^[a-zA-Z0-9_-]+$/.test(id)) continue;
      const item = await store.getJSON(id);
      if (!item) continue;
      item.position = i + 1;
      item.updatedAt = new Date().toISOString();
      await store.setJSON(id, item);
      updated++;
    }

    return { statusCode: 200, body: JSON.stringify({ ok:true, updated }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok:false, error: String(err && err.message || err) }) };
  }
};
