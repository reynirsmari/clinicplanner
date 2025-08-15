
import { readTickets, writeTickets } from './_store.mjs';

export async function handler(event){
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try{
    const body = JSON.parse(event.body || '{}');
    const { id, action } = body;
    const all = await readTickets();

    if (action === 'clear_done') {
      const kept = all.filter(t => t.status !== 'done');
      await writeTickets(kept);
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    const t = all.find(x=>x.id===id);
    if (!t) return { statusCode: 404, body: 'Not found' };

    if (action === 'call') t.status='called';
    else if (action === 'defer') t.createdAt += 10*60000;
    else if (action === 'noshow') t.status='noshow';
    else if (action === 'done') t.status='done';
    else if (action === 'escalate') t.band='A';
    else if (action === 'cancel') { const i = all.findIndex(x=>x.id===id); if (i>=0) all.splice(i,1); }
    else return { statusCode: 400, body: 'Unknown action' };

    await writeTickets(all);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }catch{
    return { statusCode: 400, body: 'Bad Request' };
  }
}
