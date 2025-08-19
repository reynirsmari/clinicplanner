
const { putJson } = require('./_shared/storage');

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

function makeId(len = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function parseBody(event) {
  const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '');
  try { return raw ? JSON.parse(raw) : {}; } catch (e) {
    return { __parseError: e.message };
  }
}

module.exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) };
    }

    const data = parseBody(event);
    if (data.__parseError) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Invalid JSON', detail: data.__parseError }) };
    }

    const id = data.id || makeId(8);
    const now = new Date().toISOString();

    const ticket = {
      id,
      createdAt: now,
      status: 'waiting',
      name: data.name || '',
      kt: data.kt || '',
      phone: data.phone || '',
      acute: !!data.acute,
      complaint: data.complaint || '',
      notes: data.notes || '',
      redFlags: Array.isArray(data.redFlags) ? data.redFlags : [],
      priority: data.priority || 'C'
    };

    await putJson(`tickets/${id}.json`, ticket);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ ok: true, id, url: `/patient/ticket.html?id=${id}` })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        ok: false,
        error: err.message || 'Internal error',
        env: {
          hasSite: !!(process.env.BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID || process.env.SITE_ID),
          hasToken: !!(process.env.BLOBS_TOKEN || process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_TOKEN)
        }
      })
    };
  }
};
