import { json } from "./_shared/json.js";
import { getJson } from "./_shared/storage.js";

export const handler = async (event) => {
  const id = event.queryStringParameters?.id;
  if (!id) return json(400, { ok: false, error: "Missing id" });
  try {
    const data = await getJson(`tickets/${id}.json`);
    if (!data) return json(404, { ok: false, error: "Ticket not found" });
    return json(200, { ok: true, ticket: data });
  } catch (e) {
    return json(500, { ok: false, error: e?.message || String(e) });
  }
};
