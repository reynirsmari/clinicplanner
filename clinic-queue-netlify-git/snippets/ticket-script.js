/* Minimal ticket page script: robust 'id' parsing + safe polling.
   Replace your existing ticket script block with this,
   OR include via: <script src="/snippets/ticket-script.js" defer></script> */

(function () {
  const $ = (sel) => document.querySelector(sel);
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  const statusEl = $("#ticket-status");
  const numberEl = $("#queue-number");
  const nameEl = $("#ticket-name");
  const complaintEl = $("#ticket-complaint");
  const calledBox = $("#called-box");

  function setMessage(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  if (!id) {
    setMessage("Missing ticket id in URL.");
    return;
  }

  async function fetchTicket() {
    try {
      const res = await fetch(`/api/tickets-get?id=${encodeURIComponent(id)}`, { headers: { "Accept": "application/json" } });
      const data = await res.json().catch(() => ({}));

      if (!data || data.ok === false) {
        // Only show "Ticket not found" if the server explicitly tells us it cannot find it.
        // Otherwise keep waiting (temporary edge propagation, etc.).
        if (data && (data.error || "").toLowerCase().includes("not")) {
          setMessage("Ticket not found.");
        } else {
          setMessage("Looking up your ticket…");
        }
        return;
      }

      const t = data.item || data.ticket || data;
      if (!t || !t.id) {
        setMessage("Looking up your ticket…");
        return;
      }

      // Populate basics (guard each in case the page uses different markup)
      if (nameEl && t.name) nameEl.textContent = t.name;
      if (complaintEl && t.complaint) complaintEl.textContent = t.complaint;
      if (numberEl && typeof t.position === "number") numberEl.textContent = String(t.position);

      // Status messaging
      const isCalled = t.status === "called" || !!t.notifiedAt;
      if (isCalled) {
        if (calledBox) {
          calledBox.hidden = false;
          calledBox.setAttribute("aria-hidden", "false");
        }
        setMessage("It's your turn now. Please proceed to the reception desk immediately.");
      } else {
        // Friendly waiting status with queue number if available
        if (typeof t.position === "number") {
          setMessage(t.position <= 1 ? "You're next. Please stay nearby." : `You are #${t.position} in the queue.`);
        } else {
          setMessage("You're in the queue. We'll update this page automatically.");
        }
      }
    } catch (err) {
      // Network/edge hiccup: keep it gentle
      setMessage("Reconnecting…");
    }
  }

  // First paint
  setMessage("Looking up your ticket…");
  fetchTicket();
  // Poll
  setInterval(fetchTicket, 5000);
})();
