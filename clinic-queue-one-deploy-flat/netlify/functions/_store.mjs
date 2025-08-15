
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'clinic-queue';
const KEY = 'tickets.json';

let memory = null;

function rank(b){ return b==='A'?0 : b==='B'?1 : 2; }
function sortTickets(arr){
  return arr.sort((a,b)=>{
    const r = rank(a.band) - rank(b.band);
    if (r!==0) return r;
    return a.createdAt - b.createdAt;
  });
}
function recalc(tickets){
  const waiting = sortTickets(tickets.filter(t=>t.status==='waiting'));
  waiting.forEach((t, idx)=> t.estWait = (t.band==='A'?3: t.band==='B'?6:8) * idx);
}
export async function readTickets(){
  try{
    const store = getStore(STORE_NAME);
    const json = await store.get(KEY, { type: 'json' });
    if (json && Array.isArray(json)){ memory = json; return json; }
  }catch{}
  memory = memory || [];
  return memory;
}
export async function writeTickets(tickets){
  recalc(tickets);
  memory = tickets;
  try{
    const store = getStore(STORE_NAME);
    await store.set(KEY, JSON.stringify(tickets), { contentType: 'application/json' });
  }catch{}
}
export function positionOf(all, id){
  const waiting = sortTickets(all.filter(t=>t.status==='waiting'));
  const idx = waiting.findIndex(t=>t.id===id);
  return idx >= 0 ? idx : 0;
}
