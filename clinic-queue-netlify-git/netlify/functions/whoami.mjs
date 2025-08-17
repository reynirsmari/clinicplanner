// netlify/functions/whoami.mjs
import { readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function handler() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const dir = dirname(__filename);
    const files = readdirSync(dir).filter(f => !f.startsWith('.'));
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dir, files, marker: 'manual-auth-canary' }) };
  } catch (e) {
    return { statusCode: 500, body: String(e?.message || e) };
  }
}