// snippets/clinic-actions.js
// Drop this in your clinic page bundle (or import it).
// It wires up the Notify/Delete buttons using data-id attributes.
// Requires each button to have data-action="notify|delete" and data-id="TICKET_ID".
(function () {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const id = btn.dataset.id;
    if (!id) {
      alert('No ticket id found on this row.');
      return;
    }

    try {
      if (btn.dataset.action === 'notify') {
        const r = await fetch('/api/tickets-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || 'Notify failed');
        // Optional: reflect UI state
        btn.disabled = true;
        btn.textContent = 'Notified';
        btn.classList.add('is-notified');
      }

      if (btn.dataset.action === 'delete') {
        if (!confirm('Remove this patient from the queue?')) return;
        const r = await fetch('/api/tickets-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || 'Delete failed');
        // Optional: remove row from DOM
        const row = btn.closest('[data-ticket-row]') || btn.closest('tr') || btn.closest('li');
        if (row) row.remove();
      }
    } catch (err) {
      alert(`Failed to ${btn.dataset.action}: ${err.message}`);
    }
  });
})();
