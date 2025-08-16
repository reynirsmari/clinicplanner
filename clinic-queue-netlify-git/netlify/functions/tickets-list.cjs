const { JSON_HEADERS, getClientAndStore } = require('./storage.cjs');

exports.handler = async () => {
  try {
    const store = await getClientAndStore('tickets');

    const items = [];
    let cursor;
    do {
      const { blobs, cursor: next } = await store.list({ cursor });
      for (const { key } of blobs) {
        const data = await store.get(key, { type: 'json' });
        if (data) items.push(data);
      }
      cursor = next;
    } while (cursor);

    // Optional: deterministic sort by priority then createdAt
    const rank = { A: 0, B: 1, C: 2 };
    items.sort((a, b) => {
      const pa = rank[a.priority] ?? 2, pb = rank[b.priority] ?? 2;
      return pa !== pb ? pa - pb : (a.createdAt || 0) - (b.createdAt || 0);
    });

    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify(items) };
  } catch (err) {
    return err._http || {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: err.message, stack: err.stack }),
    };
  }
};
