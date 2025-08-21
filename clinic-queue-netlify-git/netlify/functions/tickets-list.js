const { list, getJson } = require('./_shared/storage.js');

module.exports.handler = async () => {
  try {
    const { blobs = [] } = await list('tickets/');
    const items = [];
    for (const b of blobs) {
      const obj = await getJson(b.key);
      if (obj) items.push({ key: b.key, ...obj });
    }
    items.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, count: items.length, items }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: String(err && err.message || err) }),
    };
  }
};
