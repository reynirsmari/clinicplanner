(function(){
  async function api(url, body){
    const res = await fetch(url, {
      method:'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body || {})
    });
    const data = await res.json().catch(()=>({ ok:false }));
    return { ok: !!data.ok, data };
  }

  document.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button.action');
    if (!btn) return;
    const row = btn.closest('tr');
    const id = btn.dataset.id || (row ? row.dataset.id : null);
    const act = btn.dataset.act;

    if (act === 'notify'){
      if (!id) return alert('Missing id');
      const { ok, data } = await api('/api/tickets-notify?id='+encodeURIComponent(id));
      if (!ok) return alert('Failed to notify: ' + (data && data.error ? data.error : ''));
      // Immediate UI feedback: gray out and rename the button
      btn.textContent = 'Notified';
      btn.setAttribute('disabled', 'true');
      btn.setAttribute('aria-disabled', 'true');
    }

    if (act === 'delete'){
      if (!id) return alert('Missing id');
      if (!confirm('Remove this patient from the queue?')) return;
      const { ok, data } = await api('/api/tickets-delete?id='+encodeURIComponent(id));
      if (!ok) return alert('Failed to delete: ' + (data && data.error ? data.error : ''));
      // Remove the two rows (main + details) if they exist; otherwise let the auto-refresh hide it
      const tr = row;
      const next = tr && tr.nextElementSibling;
      if (tr) tr.remove();
      if (next && next.querySelector && next.querySelector('.card')) next.remove();
    }
  });
})();
