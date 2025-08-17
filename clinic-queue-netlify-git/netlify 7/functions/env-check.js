const { envSeen } = require('./storage.cjs');
exports.handler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ seen: envSeen() })
});
