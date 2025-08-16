/** Shared storage helpers using Netlify Blobs (ESM entrypoint) */
import { getStore } from '@netlify/blobs/dist/main.js';

const STORE_NAME = 'tickets';
const KEY = 'queue.json';

export async function readAll() {
  const store = getStore(STORE_NAME);
  const data = await store.get(KEY, { type: 'json' });
  return Array.isArray(data) ? data : [];
}

export async function writeAll(arr) {
  const store = getStore(STORE_NAME);
  await store.set(KEY, JSON.stringify(arr), { contentType: 'application/json' });
}

export function sortTickets(arr){
  const rank = (b)=> b==='A'?0 : b==='B'?1 : 2;
  return [...arr].sort((a,b)=>{
    const r = rank(a.band) - rank(b.band);
    if (r!==0) return r;
    return (a.createdAt||0) - (b.createdAt||0);
  });
}

export function recalc(all){
  const waiting = sortTickets(all.filter(t=>t.status==='waiting'));
  waiting.forEach((t, idx)=> t.estWait = (t.band==='A'?3 : t.band==='B'?6 : 8) * idx);
}

export function positionOf(all, id){
  const waiting = sortTickets(all.filter(t=>t.status==='waiting'));
  const idx = waiting.findIndex(t=>t.id===id);
  return idx >= 0 ? idx : 0;
}

export function computeBand(body){
  if (body.acute==='yes') return 'A';
  if (Array.isArray(body.redFlags) && body.redFlags.length>0) return 'A';
  if ((body.details||'').trim().length>60) return 'B';
  return 'C';
}

export function json(res, status=200){
  return {
    statusCode: status,
    headers: {
      'content-type':'application/json; charset=utf-8',
      'access-control-allow-origin':'*'
    },
    body: JSON.stringify(res)
  };
}

export function bad(msg, status=400){ return json({ error: msg }, status); }
