import { listPrefix, getJSON } from './_shared/storage.js';

export async function handler() {
  const blobs = await listPrefix('tickets/');
  const ids = blobs.map(b => b.key.replace(/^tickets\//, '').replace(/\.json$/, ''));
  const items = [];
  for (const id of ids) {
    const t = await getJSON(`tickets/${id}.json`);
    if (t) items.push(t);
  }
  items.sort((a, b) => (new Date(b.createdAt)) - (new Date(a.createdAt)));
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ok: true, count: items.length, items }),
  };
}
