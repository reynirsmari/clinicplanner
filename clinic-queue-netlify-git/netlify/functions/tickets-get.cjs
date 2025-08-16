// Try to wire Netlify Blobs automatically when available, but don't fail if not.
// Supports different @netlify/blobs versions and Lambda compat.
async function connectIfPossible(event){
  try {
    const blobs = await import('@netlify/blobs');
    if (typeof blobs.connectLambda === 'function') { blobs.connectLambda(event); }
    else if (typeof blobs.connect === 'function') { blobs.connect(event); }
  } catch {}
}
const { readAll, recalc, positionOf, json, bad } = require('./storage.cjs');

exports.handler = async function (event) {
  await connectIfPossible(event);
  const id = (event.queryStringParameters || {}).id;
  if (!id) return bad('Missing id');
  const all = await readAll();
  recalc(all);
  const t = all.find((x) => x.id === id);
  if (!t) return bad('Not found', 404);
  const pos = positionOf(all, id);
  return json({ ...t, position: pos });
};
