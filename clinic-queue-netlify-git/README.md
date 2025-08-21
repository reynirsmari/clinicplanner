# Clinic queue — Netlify version
What you get:
- `netlify.toml` routes `/api/*` → Netlify functions
- `netlify/functions/` : tickets-create / tickets-get / tickets-list + helpers
- `patient/` and `staff/` simple pages

Env vars to set on your Netlify site:
- `BLOBS_STORE` = `queue` (optional; default `queue`)
- `BLOBS_SITE_ID` = your Site ID (UUID)
- `BLOBS_TOKEN`   = a Personal Access Token with Blobs access

Deploy:
1) Push to GitHub
2) Connect on Netlify (no build step needed)
3) Visit `/patient/` to create a ticket; `/staff/` to view the queue
