
import { readTickets, writeTickets, positionOf } from './_store.mjs';

export async function handler(event){
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try{
    const body = JSON.parse(event.body || '{}');
    const band = body.band || 'C';
    const id = `${band}-${Math.random().toString(36).slice(2,7)}`;
    const ticket = {
      id, band,
      complaint: body.complaint || '',
      redFlags: Array.isArray(body.redFlags) ? body.redFlags : [],
      name: body.name || '',
      kt: body.kt || '',
      createdAt: Date.now(),
      status: 'waiting',
      estWait: 0
    };
    const all = await readTickets();
    all.push(ticket);
    await writeTickets(all);
    const pos = positionOf(all, id);
    return { statusCode: 200, body: JSON.stringify({ ...ticket, position: pos }) };
  }catch{
    return { statusCode: 400, body: 'Bad Request' };
  }
}
