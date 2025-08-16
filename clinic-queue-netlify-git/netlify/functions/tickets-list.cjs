// Try to wire Netlify Blobs automatically when available, but don't fail if not.
// Supports different @netlify/blobs versions and Lambda compat.
async function connectIfPossible(event){
  try {
    const blobs = await import('@netlify/blobs');
    if (typeof blobs.connectLambda === 'function') { blobs.connectLambda(event); }
    else if (typeof blobs.connect === 'function') { blobs.connect(event); }
  } catch {}
}
const { readAll, recalc, json } = require('./storage.cjs');

exports.handler = async function (event) {
  await connectIfPossible(event);
  const all = await readAll();
  recalc(all);
  return json(all);
};
