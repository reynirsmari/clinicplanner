
/* eslint-disable */
const { getJson, putJson } = require('./_shared/storage.js');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) };
    }
    const params = new URLSearchParams(event.queryStringParameters || {});
    const id = params.get('id') || (event.queryStringParameters && event.queryStringParameters.id);
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing id' }) };
    }
    const key = `tickets/${id}.json`;
    const ticket = await getJson(key);
    if (!ticket) {
      return { statusCode: 404, body: JSON.stringify({ ok: false, error: 'Ticket not found' }) };
    }
    ticket.status = 'called';
    ticket.notifiedAt = new Date().toISOString();
    await putJson(key, ticket);
    return { statusCode: 200, body: JSON.stringify({ ok: true, id, ticket }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
