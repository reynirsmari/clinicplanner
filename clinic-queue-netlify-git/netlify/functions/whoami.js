const fs = require('fs');
exports.handler = async () => {
  const dir = __dirname;
  let files = [];
  try { files = fs.readdirSync(dir); } catch {}
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dir, files, marker: 'manual-auth-canary' }) };
};
