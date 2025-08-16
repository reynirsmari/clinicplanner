exports.handler = async () => {
  const keys = [
    'BLOBS_SITE_ID', 'SITE_ID', 'NETLIFY_SITE_ID',
    'BLOBS_TOKEN', 'NETLIFY_API_TOKEN', 'NETLIFY_TOKEN'
  ];
  const seen = {};
  for (const k of keys) {
    const v = process.env[k];
    seen[k] = v
      ? (k.includes('TOKEN') ? `present(${v.slice(0,6)}…${v.slice(-4)})` : v)
      : null;
  }
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ seen }),
  };
};
