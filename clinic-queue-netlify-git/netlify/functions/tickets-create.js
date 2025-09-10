// netlify/functions/tickets-create.js
// Replace your current tickets-create.js with this if it doesn't already copy complaintDetails.
const { getTicketsStore, id } = require('./_shared/store');

module.exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ ok:false, error:'Method not allowed' }) };
  }
  try {
    const body = JSON.parse(event.body || '{}');
    const store = await getTicketsStore();
    const ticketId = id();
    const now = new Date().toISOString();

    const ticket = {
      id: ticketId,
      kt: String(body.kt || ''),
      name: String(body.name || ''),
      phone: String(body.phone || ''),
      complaint: String(body.complaint || ''),
      notes: String(body.notes || ''),
      complaintDetails: Array.isArray(body.complaintDetails) ? body.complaintDetails.map(String).slice(0, 20) : undefined,
      status: 'waiting',
      createdAt: now
    };

    await store.set(`tickets/${ticketId}.json`, JSON.stringify(ticket), { contentType: 'application/json' });
    return { statusCode: 200, headers:{'content-type':'application/json'}, body: JSON.stringify({ ok:true, id: ticketId, ticket }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok:false, error: err.message || 'Internal error' }) };
  }
};
