
export async function handler(event) {
  try {
    const id = event.queryStringParameters?.id;
    if (!id) return res({ ok:false, error:'Missing id' }, 400);

    const { getJson, list } = await import('./_shared/storage.js');
    const item = await getJson(`tickets/${id}.json`);
    if (!item) return res({ ok:false, error:'Not found' }, 404);

    // compute position among waiting and not-done
    const keys = await list('tickets/');
    const all = [];
    for (const k of keys) {
      const one = await getJson(k);
      if (one && one.status !== 'done') all.push(one);
    }
    all.sort((a,b)=> a.createdAt.localeCompare(b.createdAt));
    const position = all.findIndex(t => t.id === id) + 1;

    return res({ ok:true, item, position });
  } catch (err) {
    return res({ ok:false, error: String(err.message || err) }, 500);
  }
}
function res(body, status=200){ return { statusCode: status, headers: { 'content-type':'application/json' }, body: JSON.stringify(body) }; }
