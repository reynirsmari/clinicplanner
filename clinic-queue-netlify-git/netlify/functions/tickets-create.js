// netlify/functions/tickets-create.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const storage = require('./storage.cjs');

function genId() {
  // short, url-safe id
  return (
    Math.random().toString(36).slice(2, 6) +
    Date.now().toString(36).slice(-4)
  );
}

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const body = JSON.parse(event.body || '{}');

    const id = genId();
    const now = new Date().toISOString();
    const ticket = {
      id,
      createdAt: now,
      status: 'waiting',
      priority: body.priority || 'C',
      kt: body.kt,
      name: body.name,
      phone: body.phone,
      acute: !!body.acute,
      complaint: body.complaint || '',
      notes: body.notes || '',
      redFlags: Array.isArray(body.redFlags) ? body.redFlags : [],
    };

    await storage.writeTicket(id, ticket);

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, id }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        errorType: err.name,
        errorMessage: err.message,
        stack: err.stack?.split('\n').slice(0, 4),
      }),
    };
  }
}
