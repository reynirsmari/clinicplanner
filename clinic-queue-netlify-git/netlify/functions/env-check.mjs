// netlify/functions/env-check.mjs
export async function handler() {
  const mask = v => (v ? 'present' : 'absent');

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seen: {
        BLOBS_SITE_ID: process.env.BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID || null,
        SITE_ID: process.env.NETLIFY_SITE_ID || null,
        NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID || null,
        BLOBS_TOKEN: mask(process.env.BLOBS_TOKEN || process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_TOKEN),
        NETLIFY_API_TOKEN: mask(process.env.NETLIFY_API_TOKEN),
        NETLIFY_TOKEN: mask(process.env.NETLIFY_TOKEN),
      }
    })
  };
}