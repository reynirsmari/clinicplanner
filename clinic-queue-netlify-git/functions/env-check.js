exports.handler = async () => {
  const seen = {
    BLOBS_SITE_ID: !!process.env.BLOBS_SITE_ID,
    NETLIFY_SITE_ID: !!process.env.NETLIFY_SITE_ID,
    SITE_ID: !!process.env.SITE_ID,
    BLOBS_TOKEN: !!process.env.BLOBS_TOKEN,
    NETLIFY_API_TOKEN: !!process.env.NETLIFY_API_TOKEN,
    NETLIFY_TOKEN: !!process.env.NETLIFY_TOKEN,
    BLOBS_STORE: process.env.BLOBS_STORE || 'queue',
  };
  return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ seen }) };
};