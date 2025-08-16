let { readAll, writeAll, recalc, json, bad } = require('./storage.cjs');

exports.handler = async function (event) {
  const { connectLambda } = await import('@netlify/blobs');
  connectLambda(event);

  if (event.httpMethod !== 'POST') return bad('POST only', 405);
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return bad('Invalid JSON');
  }
  const { id, action } = body || {};
  if (!action) return bad('Missing action');

  let all = await readAll();

  if (action === 'clear_done') {
    all = all.filter((t) => t.status !== 'done');
    recalc(all);
    await writeAll(all);
    return json({ ok: true });
  }

  const t = all.find((x) => x.id === id);
  if (!t) return bad('Not found', 404);

  if (action === 'call') t.status = 'called';
  else if (action === 'defer') t.createdAt += 10 * 60000;
  else if (action === 'noshow') t.status = 'noshow';
  else if (action === 'done') t.status = 'done';
  else if (action === 'escalate') t.band = 'A';
  else if (action === 'cancel') {
    all = all.filter((x) => x.id !== id);
    await writeAll(all);
    return json({ ok: true });
  } else {
    return bad('Unknown action');
  }

  recalc(all);
  await writeAll(all);
  return json({ ok: true });
};
