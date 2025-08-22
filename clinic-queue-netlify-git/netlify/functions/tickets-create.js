
export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') return res({ ok:false, error:'Method Not Allowed' }, 405);

    const body = JSON.parse(event.body || '{}');
    const required = ['name','phone','kt','complaint'];
    for (const k of required) if (!body[k] || String(body[k]).trim()==='') return res({ ok:false, error:`Missing ${k}` }, 400);

    const id = Math.random().toString(36).slice(2, 8);
    const item = {
      id, name: body.name, phone: body.phone, kt: body.kt,
      complaint: body.complaint, notes: body.notes || '',
      createdAt: new Date().toISOString(),
      notified: false, status: 'waiting'
    };
    const { putJson } = await import('./_shared/storage.js');
    await putJson(`tickets/${id}.json`, item);
    return res({ ok:true, id });
  } catch (err) {
    return res({ ok:false, error: String(err.message || err) }, 500);
  }
}
function res(body, status=200){ return { statusCode: status, headers: { 'content-type':'application/json' }, body: JSON.stringify(body) }; }
