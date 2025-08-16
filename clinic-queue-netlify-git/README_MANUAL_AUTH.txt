Clinic Queue – Netlify Functions (Manual Blobs Auth)
===================================================

These functions use Netlify Blobs with explicit credentials so they work
without connectLambda() and without needing a "Blobs" toggle in the UI.

1) In Netlify → Project configuration → Environment variables, add:
   - BLOBS_SITE_ID  = your site's API ID (Project overview → Site details → API ID)
   - BLOBS_TOKEN    = a Personal Access Token from Netlify (User settings → Applications → New token)

   (Fallback names also accepted: NETLIFY_SITE_ID, NETLIFY_API_TOKEN, NETLIFY_TOKEN)

2) In Build settings set:
   - Build command: npm install
   - Functions directory: netlify/functions

3) Redeploy with "Clear cache and deploy site".

After deploy test:
- /.netlify/functions/health
- /.netlify/functions/tickets-list  → should return [] or a JSON list
- Create a ticket in the Patient app; it should appear in the Clinic app.
