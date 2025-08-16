// netlify/functions/tickets-list.js
const { JSON_HEADERS, getClientAndStore } = require('./storage.cjs');

exports.handler = async () => {
  try {
    const store = await getClientAndStore('tickets');

    const items = [];
    let cursor;

    do {
      // list returns { blobs: [{ key, size, uploadedAt, ... }], cursor }
      const { blobs, cursor: next } = await store.list({ cursor });

      for (const { key } of blobs) {
        // If you prefixed keys, e.g. "ticket:123", keep the filter below.
        // if (!key.startsWith('ticket:')) continue;

        // get JSON back directly
        const data = await store.get(key, { type: 'json' });
        if (data) items.push(data);
      }

      cursor = next;
    } while (cursor);

    // Optional: stable ordering by priority (A,B,C) and createdAt
    const rank = { A: 0, B: 1, C: 2 };
    items.sort((a, b) => {
      const pa = rank[a.priority] ?? 2;
      const pb = rank[b.priority] ?? 2;
      return pa !== pb ? pa - pb : (a.createdAt || 0) - (b.createdAt || 0);
    });

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify(items),
    };
  } catch (err) {
    return err._http || {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: err.message, stack: err.stack }),
    };
  }
};
