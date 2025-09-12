const { getTicketsStore } = require('./_shared/store');

module.exports.handler = async () => {
  try {
    const store = await getTicketsStore();
    const { blobs } = await store.list({ prefix: 'tickets/' });
    const items = await Promise.all((blobs || []).map(b => store.get(b.key, { type: 'json' })));
    items.sort((a,b) => {
      const pa = a?.position ?? Number.MAX_SAFE_INTEGER;
      const pb = b?.position ?? Number.MAX_SAFE_INTEGER;
      if (pa !== pb) return pa - pb;
      return (a?.createdAt || '').localeCompare(b?.createdAt || '');
    });
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: true, items }) };
  } catch (err) {
    return { statusCode: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};