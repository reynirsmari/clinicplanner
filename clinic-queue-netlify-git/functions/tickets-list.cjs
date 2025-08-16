const { readAll, recalc, json } = require('./storage.cjs');

exports.handler = async function (event) {
  const { connectLambda } = await import('@netlify/blobs');
  connectLambda(event);

  const all = await readAll();
  recalc(all);
  return json(all);
};
