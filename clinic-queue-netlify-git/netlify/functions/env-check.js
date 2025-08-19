
const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
module.exports.handler = async () => {
  const seen = {
    BLOBS_SITE_ID: process.env.BLOBS_SITE_ID || false,
    SITE_ID: process.env.SITE_ID || false,
    NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID || false,
    BLOBS_TOKEN: process.env.BLOBS_TOKEN ? 'present' : false,
    NETLIFY_API_TOKEN: process.env.NETLIFY_API_TOKEN ? 'present' : false,
    NETLIFY_TOKEN: process.env.NETLIFY_TOKEN ? 'present' : false,
  };
  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, seen }) };
};
