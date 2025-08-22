
export async function handler() {
  const seen = {};
  for (const k of ['BLOBS_SITE_ID','NETLIFY_SITE_ID','SITE_ID','BLOBS_TOKEN','NETLIFY_API_TOKEN','NETLIFY_TOKEN','BLOBS_STORE']) {
    if (process.env[k]) seen[k] = k === 'BLOBS_STORE' ? process.env[k] : 'present';
  }
  return { statusCode: 200, headers:{'content-type':'application/json'}, body: JSON.stringify({ ok:true, seen }) };
}
