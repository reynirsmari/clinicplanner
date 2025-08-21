
// netlify/functions/tickets-delete.js (ESM)
import { del, ticketKey } from "./_shared/storage.js";

function json(status, data) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

export async function handler(event) {
  if (event.httpMethod !== "DELETE") {
    return json(405, { ok: false, error: "Method Not Allowed" });
  }
  const id = event.queryStringParameters?.id;
  if (!id) return json(400, { ok: false, error: "Missing id" });

  try {
    await del(ticketKey(id));
    return json(200, { ok: true });
  } catch (err) {
    return json(200, { ok: false, error: String(err?.message || err) });
  }
}
