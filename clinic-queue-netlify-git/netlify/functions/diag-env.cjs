// Reports presence of env vars (true/false) for debugging.
exports.handler = async () => {
  const names = [
    'BLOBS_SITE_ID','NETLIFY_SITE_ID','SITE_ID',
    'BLOBS_TOKEN','NETLIFY_API_TOKEN','NETLIFY_TOKEN'
  ];
  const present = Object.fromEntries(names.map(n => [n, !!process.env[n]]));
  return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(present) };
};
