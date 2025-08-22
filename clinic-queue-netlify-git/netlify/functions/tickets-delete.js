
export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') return res({ ok:false, error:'Method Not Allowed' }, 405);
    const id = event.queryStringParameters?.id;
    if (!id) return res({ ok:false, error:'Missing id' }, 400);

    const { del } = await import('./_shared/storage.js');
    await del(`tickets/${id}.json`);
    return res({ ok:true });
  } catch (err) {
    return res({ ok:false, error: String(err.message || err) }, 500);
  }
}
function res(body, status=200){ return { statusCode: status, headers: { 'content-type':'application/json' }, body: JSON.stringify(body) }; }
