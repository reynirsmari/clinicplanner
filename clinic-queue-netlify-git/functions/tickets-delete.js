const { getTicketsStore } = require('./_shared/store');

module.exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST' && event.httpMethod !== 'DELETE') {
      return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) };
    }
    const id = (event.queryStringParameters && event.queryStringParameters.id) || '';
    if (!id) return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing id' }) };
    const store = await getTicketsStore();
    await store.delete(`tickets/${id}.json`);
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};