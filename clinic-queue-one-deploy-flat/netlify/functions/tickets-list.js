
import { readTickets } from './_store.mjs';

export async function handler(){
  const all = await readTickets();
  return { statusCode: 200, body: JSON.stringify(all) };
}
