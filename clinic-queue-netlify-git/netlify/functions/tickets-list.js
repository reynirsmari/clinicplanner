
import { listAll } from './_shared/storage.js';

export async function handler() {
  const items = await listAll('tickets/');
  // Sort newest first
  items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ok: true, count: items.length, items }),
  };
}
