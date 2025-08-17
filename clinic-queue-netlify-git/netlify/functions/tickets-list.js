const { getStore, readAllJSON } = require('./storage.cjs');

exports.handler = async () => {
  try {
    const store = await getStore('tickets');
    const items = await readAllJSON(store);
    items.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, items }) };
  } catch (err) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: false, error: err.message, stack: err.stack }) };
  }
};
