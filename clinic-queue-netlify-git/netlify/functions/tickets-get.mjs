// netlify/functions/tickets-get.mjs
import { readJSON } from './_shared/storage.mjs';

export async function handler(event) {
  const id = event.queryStringParameters?.id;
  if (!id) return { statusCode: 400, body: 'Missing id' };
  const key = `tickets/${id}.json`;

  try {
    const data = await readJSON(key);
    if (!data) return { statusCode: 404, body: 'Not found' };
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, ticket: data }) };
  } catch (err) {
    return { statusCode: 500, body: String(err?.message || err) };
  }
}