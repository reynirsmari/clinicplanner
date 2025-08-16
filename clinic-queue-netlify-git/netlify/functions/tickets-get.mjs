import { readAll, recalc, positionOf, json, bad } from './storage.mjs';

export async function handler(event){
  const id = (event.queryStringParameters||{}).id;
  if (!id) return bad('Missing id');
  const all = await readAll();
  recalc(all);
  const t = all.find(x=>x.id===id);
  if (!t) return bad('Not found', 404);
  const pos = positionOf(all, id);
  return json({ ...t, position: pos });
}
