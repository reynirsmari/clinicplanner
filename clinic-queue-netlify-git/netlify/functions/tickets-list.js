import { json } from "./_shared/json.js";
import { list, getJson } from "./_shared/storage.js";

export const handler = async () => {
  try {
    const res = await list("tickets/");
    const blobs = res?.blobs || res || [];
    const items = [];
    for (const b of blobs) {
      const key = b.key || b.pathname || b.name || b;
      if (!key) continue;
      const t = await getJson(key);
      if (t) items.push({ key, id: t.id, createdAt: t.createdAt, status: t.status, priority: t.priority, kt: t.kt, name: t.name, phone: t.phone, acute: t.acute, complaint: t.complaint, redFlags: t.redFlags || [] });
    }
    items.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
    return json(200, { ok: true, count: items.length, items });
  } catch (e) {
    return json(500, { ok: false, error: e?.message || String(e) });
  }
};
