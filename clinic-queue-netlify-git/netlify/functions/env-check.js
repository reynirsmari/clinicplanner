
// netlify/functions/env-check.js
function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  };
}

module.exports.handler = async () => {
  const keys = ['BLOBS_SITE_ID', 'SITE_ID', 'NETLIFY_SITE_ID', 'BLOBS_TOKEN', 'NETLIFY_API_TOKEN', 'NETLIFY_TOKEN'];
  const seen = {};
  for (const k of keys) {
    const v = process.env[k];
    seen[k] = !v ? 'missing' : (k.endsWith('_TOKEN') ? 'present' : String(v));
  }
  return jsonResponse(200, { seen });
};
