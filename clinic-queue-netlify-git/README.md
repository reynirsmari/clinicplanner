# Clinic Queue — Complete Netlify Repo

Upload the **contents** of this folder to the **root** of your GitHub repo, or set Netlify Base directory to this folder name.

## Netlify settings (Project configuration → Build settings)
- Base directory: *(blank)* (or this folder name if nested)
- Publish directory: `.`
- Functions directory: `netlify/functions`
- Build command: *(blank)*

Then **Deploys → Trigger deploy → Clear cache and deploy site**.

## Verify after deploy
- `/.netlify/functions/health` → `{ ok: true }`
- `/.netlify/functions/tickets-list` → `[]` (or JSON)
- `/api/tickets-list` → JSON (redirects working)
- `/` → chooser → create ticket → appears in `/clinic/`.

Tech notes:
- Functions use the ESM entrypoint of Netlify Blobs: `@netlify/blobs/dist/main.js`.
- `package.json` declares `@netlify/blobs` so esbuild bundles it.
- Client auto-falls back to `/.netlify/functions/*` if `/api/*` redirect isn’t active yet.
