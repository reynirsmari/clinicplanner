const { readAll, recalc, json } = require('./storage.cjs');

exports.handler = async function(){
  const all = await readAll();
  recalc(all);
  return json(all);
};
