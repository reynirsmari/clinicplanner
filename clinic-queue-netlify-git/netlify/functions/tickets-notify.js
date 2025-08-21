
// netlify/functions/tickets-notify.js (ESM)
import { getJson, putJson, ticketKey } from "./_shared/storage.js";

function json(status, data) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method Not Allowed" });
  }
  const id = event.queryStringParameters?.id;
  if (!id) return json(400, { ok: false, error: "Missing id" });

  try {
    const key = ticketKey(id);
    const doc = await getJson(key);
    if (!doc) return json(404, { ok: false, error: "Not found" });
    doc.status = "called";
    doc.calledAt = new Date().toISOString();
    await putJson(key, doc);
    return json(200, { ok: true });
  } catch (err) {
    return json(200, { ok: false, error: String(err?.message || err) });
  }
}
