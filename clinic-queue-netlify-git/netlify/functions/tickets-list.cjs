const { readAll, recalc, json } = require('./storage.cjs');
exports.handler = async () => {
  const all = await readAll();
  recalc(all);
  return json(all);
};
