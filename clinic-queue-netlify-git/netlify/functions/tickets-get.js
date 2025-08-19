
const { getJson } = require('./_shared/storage');

const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };

module.exports.handler = async (event) => {
  try {
    const id = event.queryStringParameters && event.queryStringParameters.id;
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Missing id' }) };
    const obj = await getJson(`tickets/${id}.json`);
    if (!obj) return { statusCode: 404, headers, body: JSON.stringify({ ok: false, error: 'Not found' }) };
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ticket: obj }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
