const { readAll, writeAll, recalc, json, bad } = require('./storage.cjs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405);

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return bad('Invalid JSON'); }

  const { id, action } = body || {};
  if (!action) return bad('Missing action');

  let all = await readAll();

  if (action === 'clear_done') {
    all = all.filter(t => t.status !== 'done');
    recalc(all);
    await writeAll(all);
    return json({ ok: true });
  }

  const t = all.find(x => x.id === id);
  if (!t) return bad('Not found', 404);

  switch (action) {
    case 'call':      t.status = 'called'; break;
    case 'defer':     t.createdAt += 10 * 60_000; break;
    case 'noshow':    t.status = 'noshow'; break;
    case 'done':      t.status = 'done'; break;
    case 'escalate':  t.band = 'A'; break;
    case 'cancel':
      all = all.filter(x => x.id !== id);
      await writeAll(all);
      return json({ ok: true });
    default:
      return bad('Unknown action');
  }

  recalc(all);
  await writeAll(all);
  return json({ ok: true });
};
