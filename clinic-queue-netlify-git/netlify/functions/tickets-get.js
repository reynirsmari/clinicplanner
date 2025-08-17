
// netlify/functions/tickets-get.js
const { readJSON } = require('./_shared/storage.js');

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  };
}

module.exports.handler = async (event) => {
  const id = event.queryStringParameters && event.queryStringParameters.id;
  if (!id) return jsonResponse(400, { ok: false, error: 'Missing id' });
  try {
    const ticket = await readJSON(`${id}.json`);
    if (!ticket) return jsonResponse(404, { ok: false, error: 'Ticket not found' });
    return jsonResponse(200, { ok: true, ticket });
  } catch (err) {
    console.error('tickets-get error', err);
    return jsonResponse(500, { ok: false, error: 'Server error' });
  }
};
