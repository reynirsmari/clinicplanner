// netlify/functions/tickets-list.js
// Returns all active tickets, including waiting, called, and notified.
// Response: { ok:true, items:[{... , position: N}] }
async function getStoreCompat(){
  const { getStore } = await import('@netlify/blobs');
  const siteID = process.env.BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token  = process.env.BLOBS_TOKEN   || process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_TOKEN;
  const name = process.env.BLOBS_STORE || 'queue';
  return getStore({ name, siteID, token });
}
function json(body, statusCode=200){
  return { statusCode, headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) };
}
module.exports.handler = async () => {
  try{
    const store = await getStoreCompat();
    const items = [];
    let cursor;
    do{
      const page = await store.list({ prefix:'tickets/', limit: 1000, cursor });
      for(const b of (page.blobs || [])){
        const t = await store.get(b.key, { type:'json' });
        if (!t) continue;
        // include statuses we actively manage in the clinic
        if (t.status === 'waiting' || t.status === 'called' || t.status === 'notified') {
          items.push(t);
        }
      }
      cursor = page.cursor;
    } while (cursor);
    items.sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt));
    items.forEach((t,i)=> t.position = i+1);
    return json({ ok:true, items });
  }catch(err){
    return json({ ok:false, error: (err && err.message) || String(err) }, 500);
  }
};
