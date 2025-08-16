// Try to wire Netlify Blobs automatically when available, but don't fail if not.
// Supports different @netlify/blobs versions and Lambda compat.
async function connectIfPossible(event){
  try {
    const blobs = await import('@netlify/blobs');
    if (typeof blobs.connectLambda === 'function') { blobs.connectLambda(event); }
    else if (typeof blobs.connect === 'function') { blobs.connect(event); }
  } catch {}
}
const { readAll, writeAll, computeBand, json, bad, recalc, positionOf } = require('./storage.cjs');

exports.handler = async function (event) {
  await connectIfPossible(event);
  if (event.httpMethod !== 'POST') return bad('POST only', 405);
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return bad('Invalid JSON'); }

  const now = Date.now();
  const band = computeBand(body);
  const id = `${band}-${Math.random().toString(36).slice(2, 7)}`;
  const ticket = {
    id, band,
    complaint: body.complaint || '',
    redFlags: Array.isArray(body.redFlags) ? body.redFlags : [],
    name: body.name || '', kt: body.kt || '', phone: body.phone || '',
    details: body.details || '', acute: body.acute || 'no',
    createdAt: now, status: 'waiting', estWait: 0,
  };

  const all = await readAll();
  all.push(ticket);
  recalc(all);
  await writeAll(all);
  const pos = positionOf(all, id);
  return json({ ...ticket, position: pos });
};
