
// netlify/functions/tickets-list.js
const { listKeys, readJSON } = require('./_shared/storage.js');

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  };
}

module.exports.handler = async () => {
  try {
    const keys = await listKeys('tickets/');
    const items = [];
    for (const key of keys) {
      const t = await readJSON(key);
      if (t) items.push(t);
    }
    items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return jsonResponse(200, { ok: true, count: items.length, items });
  } catch (err) {
    console.error('tickets-list error', err);
    return jsonResponse(500, { ok: false, error: 'Server error' });
  }
};
