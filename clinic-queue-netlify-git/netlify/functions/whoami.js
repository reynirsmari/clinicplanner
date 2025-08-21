module.exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ cwd: process.cwd(), ts: Date.now() }),
  };
};
