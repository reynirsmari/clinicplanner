
import { randomBytes } from 'node:crypto';
import { putJson } from './_shared/storage.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }),
    };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Invalid JSON' }),
    };
  }

  const id = body.id || randomBytes(5).toString('hex');
  const ticket = {
    id,
    createdAt: new Date().toISOString(),
    status: 'waiting',
    ...body,
  };

  await putJson(`tickets/${id}.json`, ticket);

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ok: true, id, url: `/patient/ticket.html?id=${id}` }),
  };
}
