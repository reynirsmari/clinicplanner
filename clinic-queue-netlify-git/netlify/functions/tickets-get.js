
import { getJson } from './_shared/storage.js';

export async function handler(event) {
  const id = event.queryStringParameters?.id;
  if (!id) {
    return { statusCode: 400, body: 'Missing id' };
  }
  const data = await getJson(`tickets/${id}.json`);
  if (!data) return { statusCode: 404, body: 'Not found' };

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  };
}
