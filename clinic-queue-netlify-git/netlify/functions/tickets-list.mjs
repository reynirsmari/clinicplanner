// netlify/functions/tickets-list.mjs
import { listKeys, readJSON } from './_shared/storage.mjs';

export async function handler() {
  try {
    const keys = await listKeys('tickets/');
    const items = await Promise.all(
      keys.map(k => readJSON(k))
    );
    // Sort newest first
    items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, count: items.length, items })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: String(err?.message || err) }) };
  }
}