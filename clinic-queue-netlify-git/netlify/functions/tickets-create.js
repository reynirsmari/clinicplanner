import { json } from "./_shared/json.js";
import { putJson } from "./_shared/storage.js";

function id() {
  // short-ish unique id
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).slice(-8);
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method Not Allowed" });
  }
  try {
    const body = event.body ? JSON.parse(event.body) : null;
    if (!body) return json(400, { ok: false, error: "Missing JSON body" });

    const required = ["name", "kt", "phone"];
    for (const k of required) {
      if (!body[k]) return json(400, { ok: false, error: `Missing field: ${k}` });
    }

    const ticket = {
      id: id(),
      createdAt: new Date().toISOString(),
      status: "waiting",
      priority: body.priority || "C",
      kt: body.kt,
      name: body.name,
      phone: body.phone,
      acute: !!body.acute,
      complaint: body.complaint || "",
      notes: body.notes || "",
      redFlags: Array.isArray(body.redFlags) ? body.redFlags : [],
    };

    await putJson(`tickets/${ticket.id}.json`, ticket);
    return json(200, { ok: true, id: ticket.id, redirect: `/patient/ticket.html?id=${ticket.id}` });
  } catch (e) {
    return json(500, { ok: false, error: e?.message || String(e) });
  }
};
