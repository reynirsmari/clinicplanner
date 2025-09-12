const { getTicketsStore } = require('./_shared/store');

module.exports.handler = async (event) => {
  try {
    const id = (event.queryStringParameters && event.queryStringParameters.id) || '';
    if (!id) return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing id' }) };
    const store = await getTicketsStore();
    const json = await store.get(`tickets/${id}.json`, { type: 'json' });
    if (!json) return { statusCode: 404, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: false, error: 'Not found' }) };
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: true, ticket: json }) };
  } catch (err) {
    return { statusCode: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};