
(function(){
  async function api(url, body){
    const res = await fetch(url, {
      method:'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body || {})
    });
    return res.json();
  }
  document.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button.action');
    if (!btn) return;
    const row = btn.closest('tr');
    const id = btn.dataset.id || (row ? row.dataset.id : null);

    if (btn.dataset.act === 'notify'){
      if (!id) return alert('Missing id');
      const out = await api('/api/tickets-notify?id='+encodeURIComponent(id));
      if (!out.ok) alert('Failed to notify: '+JSON.stringify(out));
    }
    if (btn.dataset.act === 'delete'){
      if (!id) return alert('Missing id');
      if (!confirm('Remove this patient from the queue?')) return;
      const out = await api('/api/tickets-delete?id='+encodeURIComponent(id));
      if (!out.ok) alert('Failed to delete: '+JSON.stringify(out));
    }
  });
})();
