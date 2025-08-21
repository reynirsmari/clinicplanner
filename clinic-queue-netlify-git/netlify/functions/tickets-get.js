const { ticketKey, getJson } = require('./_shared/storage.js');

module.exports.handler = async (event) => {
  const id = (event.queryStringParameters && event.queryStringParameters.id) || '';
  if (!id) {
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Missing id' }),
    };
  }

  const obj = await getJson(ticketKey(id));
  if (!obj) {
    return {
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Not found' }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ok: true, item: obj }),
  };
};
