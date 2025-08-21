const { getTicketsStore } = require('./_shared/store');

module.exports.handler = async () => {
  try {
    const store = await getTicketsStore();
    const items = [];
    const { blobs } = await store.list({ prefix: 'tickets/' });
    for (const b of blobs) {
      const json = await store.get(b.key, { type: 'json' });
      if (json) items.push(json);
    }
    items.sort((a,b) => (a.createdAt > b.createdAt ? -1 : 1));
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok:true, count: items.length, items }) };
  } catch (err) {
    return { statusCode: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok:false, error: err.message }) };
  }
};
