# ClinicPlan patch: notify & delete endpoints + clinic button wiring

This zip includes two Netlify Functions and a tiny front-end helper to fix:
- **"Missing id"** when notifying patients
- **"Method Not Allowed"** when deleting patients

## Files

```
netlify/functions/tickets-notify.js   # POST /api/tickets-notify { id }
netlify/functions/tickets-delete.js   # POST /api/tickets-delete { id }
snippets/clinic-actions.js            # front-end click handler for Notify/Delete
```

> These functions expect your existing `netlify/functions/_shared/storage.js`
> to export: `ensureStore()` returning a Netlify Blobs store with `.get/.set/.delete`.
> (Same module used by your current list/get/create.)

## Install

1. Copy the two files into your repo:
   - `netlify/functions/tickets-notify.js`
   - `netlify/functions/tickets-delete.js`

2. Ensure your `netlify.toml` has the redirect so `/api/*` maps to functions:

```toml
[[redirects]]
from = "/api/*"
to   = "/.netlify/functions/:splat"
status = 200
```

3. Front-end (clinic page):
   - Make sure action buttons include `data-action` and `data-id`:
     ```html
     <tr data-ticket-row>
       <!-- ...cells... -->
       <td>
         <button class="btn btn-notify" data-action="notify" data-id="{{id}}">Notify</button>
         <button class="btn btn-delete" data-action="delete" data-id="{{id}}">Delete</button>
       </td>
     </tr>
     ```
   - Include the helper (or merge its logic into your bundle):
     ```html
     <script src="/snippets/clinic-actions.js"></script>
     ```
     Or copy the file contents into your existing clinic JS.

4. Deploy on Netlify.

## Quick test in the browser console

```js
// use an actual ticket id from your queue
const id = 'REPLACE_ME';

await fetch('/api/tickets-notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id })
}).then(r => r.json());

await fetch('/api/tickets-delete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id })
}).then(r => r.json());
```

You should get `{ ok: true, id: '...' }` responses.

## Notes

- If you still see "The environment has not been configured to use Netlify Blobs",
  verify your environment variables via `/.netlify/functions/env-check` and that
  `ensureStore()` uses them. You should see `BLOBS_SITE_ID`, `BLOBS_TOKEN` present,
  and `BLOBS_STORE` set to your store name (e.g., `queue`).

- If you prefer *soft delete*, uncomment the block in `tickets-delete.js` and remove the
  `store.delete(key)` line.
