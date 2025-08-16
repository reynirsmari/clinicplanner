async function _fetchJSON(url, opts){
  const r = await fetch(url, opts);
  if (r.status === 404 && url.startsWith('/api/')){
    const fnUrl = '/.netlify/functions/' + url.replace(/^\/api\//, '');
    const r2 = await fetch(fnUrl, opts);
    if (!r2.ok){ const tx = await r2.text().catch(()=>'');
      throw new Error(`${opts?.method||'GET'} ${fnUrl} -> ${r2.status} ${r2.statusText}${tx?' — '+tx.slice(0,200):''}`);
    }
    return await r2.json();
  }
  if (!r.ok){ const tx = await r.text().catch(()=>'');
    throw new Error(`${opts?.method||'GET'} ${url} -> ${r.status} ${r.statusText}${tx?' — '+tx.slice(0,200):''}`);
  }
  return await r.json();
}
const API = {
  createTicket(body){ return _fetchJSON('/api/tickets-create', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body) }); },
  listTickets(){ return _fetchJSON('/api/tickets-list'); },
  getTicket(id){ return _fetchJSON('/api/tickets-get?id=' + encodeURIComponent(id)); },
  action(id, action){ return _fetchJSON('/api/tickets-action', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ id, action }) }); }
};
window.API = API;
