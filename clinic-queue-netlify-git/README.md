
# Clinicplan Patch: Notify/Delete endpoints + Clinic actions helper

This patch adds two Netlify Functions and a tiny front-end helper to **notify** a patient
and **delete** a ticket. It assumes your queue is stored in a Netlify **Blobs** store (same
one your create/list functions already use).

## Files

- `netlify/functions/tickets-notify.js` — `POST /api/tickets-notify` with JSON body `{ "id": "<ticketId>" }`.
- `netlify/functions/tickets-delete.js` — `POST /api/tickets-delete` with JSON body `{ "id": "<ticketId>" }`.
- `snippets/clinic-actions.js` — client-side glue for your clinic page.
- `README.md` — these instructions.

## 1) Install

Copy the files into your repo keeping the same paths:

```
/netlify/functions/tickets-notify.js
/netlify/functions/tickets-delete.js
/snippets/clinic-actions.js
```

## 2) Ensure the redirect is present

Your `netlify.toml` should map `/api/*` to Netlify Functions:

```toml
[[redirects]]
from = "/api/*"
to   = "/.netlify/functions/:splat"
status = 200
```

## 3) Add the front‑end helper on the clinic page

Open your clinic page (usually **`/clinic/index.html`** or **`/clinic.html`**)
and include this **right before `</body>`**:

```html
<script src="/snippets/clinic-actions.js"></script>
```

Your table rows (or cards) should render buttons like:

```html
<button class="btn btn-notify" data-action="notify" data-id="{id}">Notify</button>
<button class="btn btn-delete" data-action="delete" data-id="{id}">Delete</button>
```

> If you already bundle JS, you can instead *copy the contents* of
> `snippets/clinic-actions.js` into your existing page script.

## 4) Environment

These functions will automatically pick up either the **implicit runtime** configuration
or the manual environment variables. For manual, make sure your site has these:

- `BLOBS_SITE_ID` = your **Site ID** (same as `NETLIFY_SITE_ID`)
- `BLOBS_TOKEN`   = a Netlify **Personal Access Token** with Blobs access
- `BLOBS_STORE`   = the name of your store (e.g. `queue`) — optional if your code sets it

You can confirm everything via your existing `/.netlify/functions/env-check` route.

## 5) Test

- Notify: `curl -X POST https://<yoursite>/api/tickets-notify -H "content-type: application/json" -d '{"id":"abc123"}'`
- Delete: `curl -X POST https://<yoursite>/api/tickets-delete -H "content-type: application/json" -d '{"id":"abc123"}'`

Both should return: `{ "ok": true }`

## Notes

- The functions deliberately return **405** for non-POST requests.
- The code uses a **dynamic ESM import** of `@netlify/blobs` so it works even if the
  rest of your functions use CommonJS (`module.exports`).
- If your store uses a different folder/naming, adjust the `key = \`tickets/{id}.json\`` lines.

Good luck!
