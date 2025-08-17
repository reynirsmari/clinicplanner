// netlify/functions/tickets-create.js
exports.handler = async (event) => {
  const { getStore } = await import('@netlify/blobs');

  const siteID =
    process.env.BLOBS_SITE_ID ||
    process.env.SITE_ID ||
    process.env.NETLIFY_SITE_ID;

  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_TOKEN;

  const store = getStore({
    name: 'clinic-queue',
    ...(siteID ? { siteID } : {}),
    ...(token ? { token } : {}),
  });

  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Use POST' };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const id = body.id || Math.random().toString(36).slice(2, 8);
    const now = new Date().toISOString();

    const ticket = {
      id,
      createdAt: now,
      status: 'waiting',
      priority: body.priority || 'C',
      kt: body.kt || '',
      name: body.name || '',
      phone: body.phone || '',
      acute: !!body.acute,
      complaint: body.complaint || '',
      notes: body.notes || '',
      redFlags: Array.isArray(body.redFlags) ? body.redFlags : [],
    };

    await store.setJSON(`tickets/${id}.json`, ticket);

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, ticket }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: String(err?.message || err) }),
    };
  }
};
