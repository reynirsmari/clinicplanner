// netlify/functions/tickets-list.js
exports.handler = async () => {
  // Use the modern Blobs SDK surface
  const { getStore } = await import('@netlify/blobs');

  // Prefer explicit overrides if present; otherwise Netlify auto-config takes over
  const siteID =
    process.env.BLOBS_SITE_ID ||
    process.env.SITE_ID ||
    process.env.NETLIFY_SITE_ID;

  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_TOKEN;

  // Name the store anything you like; using a stable name keeps your data in one place
  const store = getStore({
    name: 'clinic-queue',
    // Only pass these if you’ve set them; otherwise let Netlify’s environment do it
    ...(siteID ? { siteID } : {}),
    ...(token ? { token } : {}),
  });

  try {
    // List all blobs under "tickets/"
    const { blobs } = await store.list({ prefix: 'tickets/' });

    // Pull each ticket’s JSON
    const items = [];
    for (const b of blobs) {
      const data = await store.get(b.key, { type: 'json' });
      items.push({ key: b.key, ...data });
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, count: items.length, items }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: String(err?.message || err) }),
    };
  }
};
