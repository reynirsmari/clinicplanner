
/* eslint-disable */
const { getJson, del } = require('./_shared/storage.js');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'DELETE' && event.httpMethod !== 'POST') {
      // Allow POST as well for environments that don't allow DELETE from browsers easily.
      return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) };
    }
    const params = new URLSearchParams(event.queryStringParameters || {});
    const id = params.get('id') || (event.queryStringParameters && event.queryStringParameters.id);
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing id' }) };
    }
    const key = `tickets/${id}.json`;
    const exists = await getJson(key);
    if (!exists) {
      return { statusCode: 404, body: JSON.stringify({ ok: false, error: 'Ticket not found' }) };
    }
    await del(key);
    return { statusCode: 200, body: JSON.stringify({ ok: true, id }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
