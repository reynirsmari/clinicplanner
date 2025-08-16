import { readAll, recalc, json } from './storage.mjs';

export async function handler(){
  const all = await readAll();
  recalc(all);
  return json(all);
}
