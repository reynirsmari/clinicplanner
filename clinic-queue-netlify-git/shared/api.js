/** Minimal client for Netlify Functions API */
const API = {
  async createTicket(body){
    const r = await fetch('/api/tickets-create', {
      method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)
    });
    if (!r.ok) throw new Error('Create failed');
    return await r.json();
  },
  async listTickets(){
    const r = await fetch('/api/tickets-list');
    if (!r.ok) throw new Error('List failed');
    return await r.json();
  },
  async getTicket(id){
    const r = await fetch('/api/tickets-get?id=' + encodeURIComponent(id));
    if (!r.ok) throw new Error('Get failed');
    return await r.json();
  },
  async action(id, action){
    const r = await fetch('/api/tickets-action', {
      method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ id, action })
    });
    if (!r.ok) throw new Error('Action failed');
    return await r.json();
  }
};
window.API = API;
