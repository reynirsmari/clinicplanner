
const fs = require('fs');
const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };

module.exports.handler = async () => {
  const dir = __dirname;
  let files = [];
  try { files = fs.readdirSync(dir).filter(f => !f.startsWith('.')); } catch {}
  return { statusCode: 200, headers, body: JSON.stringify({ dir, files, marker: 'manual-auth-canary' }) };
};
