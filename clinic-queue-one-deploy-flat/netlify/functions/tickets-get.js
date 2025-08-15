
import { readTickets, positionOf } from './_store.mjs';

export async function handler(event){
  const id = event.queryStringParameters?.id;
  const all = await readTickets();
  if (!id) return { statusCode: 400, body: 'Missing id' };
  const t = all.find(x=>x.id===id);
  if (!t) return { statusCode: 404, body: 'Not found' };
  const pos = positionOf(all, id);
  return { statusCode: 200, body: JSON.stringify({ ...t, position: pos }) };
}
