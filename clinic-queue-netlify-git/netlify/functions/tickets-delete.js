const { del, getJson } = require('./_shared/storage');

module.exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) };
    }
    const { id } = JSON.parse(event.body || '{}');
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing id' }) };
    }

    const key = `tickets/${id}.json`;
    const exists = await getJson(key);
    if (!exists) {
      return { statusCode: 404, body: JSON.stringify({ ok: false, error: 'Not found' }) };
    }

    await del(key);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: String(err.message || err) }) };
  }
};
