// netlify/functions/tickets-get.mjs
// Reads a single ticket by id from the same place tickets-create writes.

export async function handler(event) {
  try {
    const qp = event.queryStringParameters || {};
    const id = (qp.id || '').trim();

    if (!id) {
      return { statusCode: 400, body: 'Missing id' };
    }

    // Use the same storage helper used by tickets-create
    const mod = await import('./storage.cjs');
    const storage = mod.default || mod;

    const ticket = await storage.readTicket(id); // must use same key logic as writeTicket
    if (!ticket) {
      return {
        statusCode: 404,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'not_found', id }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, ticket }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error: err.message,
        trace: (err.stack || '').split('\n').slice(0, 10),
      }),
    };
  }
}
