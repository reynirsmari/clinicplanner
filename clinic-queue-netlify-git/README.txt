# Clinic Queue — Netlify (Shared online queue)

This bundle contains:
- Static UI (patient, clinic, index)
- Serverless API in `netlify/functions/*` using **Netlify Blobs** for storage
- Redirects so `/api/*` maps to functions

## One-time deploy (no terminal)
1. Go to https://app.netlify.com → **Add new site** → **Deploy manually**.
2. Drag & drop this ZIP.
3. After deploy, open **Site settings → Blobs** and click **Enable** (if it's off).
   - Store name used: `tickets`
4. Visit your site:
   - `/` → chooser
   - `/patient/` → check-in
   - `/clinic/` → dashboard

## Notes
- Polling every 5s keeps Patient/Clinic in sync across devices.
- “Only clinic calls the patient” is enforced: patient sees "Called in" only after staff presses **Call in**.
- If functions return 404: ensure `_redirects` is present and maps `/api/*` to `/.netlify/functions/:splat`.
- If you see storage errors: confirm **Blobs** is enabled for the site.

Enjoy!
