// netlify/functions/tickets-create.js
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let input;
  try {
    input = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // pull creds from env (you already have them set)
  const siteID =
    process.env.BLOBS_SITE_ID ||
    process.env.NETLIFY_SITE_ID ||
    process.env.SITE_ID;
  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_TOKEN;

  if (!siteID || !token) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error:
          'Missing siteID/token for Netlify Blobs. Check env vars: BLOBS_SITE_ID and BLOBS_TOKEN.',
      }),
    };
  }

  const { createClient } = await import('@netlify/blobs');
  const client = createClient({ siteID, token });
  const store = client.store('tickets');

  // generate a short id like "k88j1p"
  const id = Math.random().toString(36).slice(2, 8);
  const key = `tickets/${id}.json`;
  const createdAt = new Date().toISOString();

  // minimal ticket shape (add any fields you expect)
  const ticket = {
    id,
    status: 'waiting',
    priority: input.acute ? 'A' : 'C',
    kt: input.kt || '',
    name: input.name || '',
    phone: input.phone || '',
    acute: !!input.acute,
    complaint: input.complaint || '',
    notes: input.notes || '',
    redFlags: Array.isArray(input.redFlags) ? input.redFlags : [],
    createdAt,
  };

  await store.set(key, JSON.stringify(ticket), {
    contentType: 'application/json',
  });

  return {
    statusCode: 201,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    body: JSON.stringify({
      ok: true,
      id,          // <— IMPORTANT: always present
      key,         // for debugging / fallback
      url: `/patient/ticket.html?id=${encodeURIComponent(id)}`,
    }),
  };
};
