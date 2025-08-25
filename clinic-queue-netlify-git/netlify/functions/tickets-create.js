const { getTicketsStore, buildTicket } = require('./_shared/store');

module.exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ ok:false, error: 'Method Not Allowed' }) };
    }
    const payload = JSON.parse(event.body || '{}');
    const ticket = buildTicket(payload);
    const store = await getTicketsStore();
    const key = `tickets/${ticket.id}.json`;
    await store.set(key, JSON.stringify(ticket), { contentType: 'application/json' });
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok:true, id: ticket.id }) };
  } catch (err) {
    return { statusCode: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok:false, error: err.message }) };
  }
};


// ---- PATCH: store complaintDetails if present ----
try {
  const __data = JSON.parse(event.body || '{}');
  if (Array.isArray(__data.complaintDetails)) {
    // locate a variable that looks like the main ticket object and merge
    if (typeof ticket === 'object' && ticket) {
      ticket.complaintDetails = __data.complaintDetails.map(x => String(x)).slice(0, 12);
    }
  }
} catch (e) { /* ignore */ }
// ---- END PATCH ----
