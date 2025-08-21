import { putJSON } from './_shared/storage.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }),
    };
  }

  let data = {};
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Invalid JSON body' }),
    };
  }

  const required = ['name', 'kt', 'phone', 'complaint'];
  for (const f of required) {
    if (!data[f]) {
      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ok: false, error: `Missing field: ${f}` }),
      };
    }
  }

  const id = (data.id || Math.random().toString(36).slice(2, 9)).toLowerCase();
  const ticket = {
    id,
    createdAt: new Date().toISOString(),
    status: 'waiting',
    priority: data.priority || 'C',
    name: data.name,
    kt: data.kt,
    phone: data.phone,
    complaint: data.complaint,
    notes: data.notes || '',
    acute: !!data.acute,
    redFlags: Array.isArray(data.redFlags) ? data.redFlags : [],
  };

  await putJSON(`tickets/${id}.json`, ticket);

  return {
    statusCode: 201,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      ok: true,
      id,
      url: `/patient/ticket.html?id=${id}`,
    }),
  };
}
