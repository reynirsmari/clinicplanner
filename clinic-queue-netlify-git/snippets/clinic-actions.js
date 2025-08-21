
// snippets/clinic-actions.js
// Minimal wiring for Notify/Delete buttons on the clinic queue page.
// Looks for elements with [data-action="notify|delete"] and [data-id="<ticket-id>"]

(function () {
  const $root = document;
  function toast(msg) {
    // Fallback alert; replace with a nicer UI if you have one
    console.log(msg);
  }

  async function postJSON(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
    let data = null;
    try { data = await res.json(); } catch(e) {}
    return { ok: res.ok, status: res.status, data };
  }

  async function handle(action, id) {
    if (!id) return alert('Missing ticket id');
    const endpoint = action === 'notify' ? '/api/tickets-notify' : '/api/tickets-delete';
    const { ok, data } = await postJSON(endpoint, { id });
    if (!ok || !data || data.ok === false) {
      alert(`Failed to ${action}: ${JSON.stringify(data || {})}`);
      return;
    }
    // trigger a UI refresh if your app uses a reload() or fetchQueue()
    if (typeof window.fetchQueue === 'function') {
      try { await window.fetchQueue(); } catch(e) {}
    } else {
      // fallback: reload page
      window.location.reload();
    }
  }

  $root.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.getAttribute('data-action');
    if (action !== 'notify' && action !== 'delete') return;
    const id = el.getAttribute('data-id');
    e.preventDefault();
    handle(action, id);
  });
})();
