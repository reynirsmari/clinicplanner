
const { list, getJson } = require('./_shared/storage');

const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };

module.exports.handler = async () => {
  try {
    const blobs = await list('tickets/');
    const items = [];
    for (const b of blobs) {
      const obj = await getJson(b.key);
      if (obj) items.push(obj);
    }
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, count: items.length, items }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
