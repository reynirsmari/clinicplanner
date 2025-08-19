import { json } from "./_shared/json.js";
import fs from "node:fs";
import path from "node:path";
export const handler = async () => {
  const dir = path.dirname(new URL(import.meta.url).pathname);
  let files = [];
  try { files = fs.readdirSync(dir).filter(f => f.endsWith(".js")); } catch {}
  return json(200, { dir, files, marker: "manual-auth-canary" });
};
