exports.handler = async () => {
  const fs = require('fs');
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      dir: __dirname,
      files: fs.readdirSync(__dirname).filter(n => n.endsWith('.cjs')),
      marker: 'manual-auth-canary'
    }),
  };
};
