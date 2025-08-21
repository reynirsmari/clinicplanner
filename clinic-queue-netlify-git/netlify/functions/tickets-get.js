import { getJSON } from './_shared/storage.js';

export async function handler(event) {
  const params = event.queryStringParameters || {};
  const id = params.id;
  if (!id) {
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Missing id' }),
    };
  }
  const ticket = await getJSON(`tickets/${id}.json`);
  if (!ticket) {
    return {
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Not found' }),
    };
  }
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ok: true, ticket }),
  };
}
