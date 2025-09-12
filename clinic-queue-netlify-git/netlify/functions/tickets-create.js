// netlify/functions/tickets-create.js
const { getTicketsStore } = require('./_shared/store');
const { buildTicket } = require('./_shared/ticket');

module.exports.handler = async (event) => {
  try {
    if (event.httpMethod && event.httpMethod !== 'POST') {
      return { statusCode: 405, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const store = getTicketsStore();
    const ticket = buildTicket(body);

    // Save ticket
    await store.set(`tickets/${ticket.id}.json`, JSON.stringify(ticket), {
      contentType: 'application/json',
      overwrite: true,
    });

    // Compute queue position among waiting tickets
    const listing = await store.list({ prefix: 'tickets/' });
    const waiting = [];
    for (const obj of (listing.objects || [])) {
      const t = await store.get(obj.key, { type: 'json' });
      if (t && t.status === 'waiting') waiting.push(t);
    }
    waiting.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const position = waiting.findIndex(t => t.id === ticket.id) + 1;

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, id: ticket.id, position }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};
