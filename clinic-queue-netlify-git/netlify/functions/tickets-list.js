
export async function handler() {
  try {
    const { getJson, list } = await import('./_shared/storage.js');
    const keys = await list('tickets/');
    const out = [];
    for (const k of keys) {
      const t = await getJson(k);
      if (t && t.status !== 'done') out.push(t);
    }
    out.sort((a,b)=> a.createdAt.localeCompare(b.createdAt));
    // annotate positions
    out.forEach((t,i)=> t.position = i+1);
    return res({ ok:true, items: out });
  } catch (err) {
    return res({ ok:false, error: String(err.message || err) }, 500);
  }
}
function res(body, status=200){ return { statusCode: status, headers: { 'content-type':'application/json' }, body: JSON.stringify(body) }; }
