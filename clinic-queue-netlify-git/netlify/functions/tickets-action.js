// netlify/functions/tickets-action.js
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
    const { id, action } = body;
    if (!id || !action) {
      return { statusCode: 400, body: 'id and action are required' };
    }

    const key = `tickets/${id}.json`;
    const ticket = await store.get(key, { type: 'json' });
    if (!ticket) {
      return { statusCode: 404, body: 'Ticket not found' };
    }

    const now = new Date().toISOString();

    switch (action) {
      case 'call':
        ticket.status = 'called';
        ticket.calledAt = now;
        break;
      case 'defer':
        ticket.deferredAt = now;
        // add a small ETA bump if you want:
        break;
      case 'done':
        ticket.status = 'done';
        ticket.doneAt = now;
        break;
      case 'escalate':
        ticket.escalatedAt = now;
        ticket.priority = 'A';
        break;
      default:
        return { statusCode: 400, body: 'Unknown action' };
    }

    await store.setJSON(key, ticket);

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
