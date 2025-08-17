// netlify/functions/tickets-create.mjs
import { saveJSON } from './_shared/storage.mjs';

function randomId(len = 7) {
  // short, URL-safe id
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random()*chars.length)];
  return out;
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // Generate server-side ID if caller didn't supply one
  const id = body.id || randomId();
  const createdAt = new Date().toISOString();

  const ticket = {
    id,
    createdAt,
    status: 'waiting',
    kt: body.kt || '',
    name: body.name || '',
    phone: body.phone || '',
    acute: !!body.acute,
    complaint: body.complaint || '',
    notes: body.notes || '',
    redFlags: Array.isArray(body.redFlags) ? body.redFlags : [],
    priority: body.priority || (body.acute ? 'A' : 'C'),
  };

  try {
    await saveJSON(`tickets/${id}.json`, ticket);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, id })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: String(err?.message || err) })
    };
  }
}