
// netlify/functions/whoami.js
const fs = require('fs');
const path = require('path');

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  };
}

module.exports.handler = async () => {
  const dir = __dirname;
  let files = [];
  try {
    files = fs.readdirSync(dir).filter(f => f.endsWith('.js') || fs.statSync(path.join(dir, f)).isDirectory());
  } catch {}
  return jsonResponse(200, { dir, files, marker: 'manual-auth-canary' });
};
