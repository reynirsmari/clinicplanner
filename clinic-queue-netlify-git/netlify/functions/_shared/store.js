// Shared helper for Netlify Blobs
async function getTicketsStore() {
  const { getStore } = await import('@netlify/blobs');
  const name = process.env.BLOBS_STORE || 'queue';
  const opts = {};
  if (process.env.BLOBS_SITE_ID && process.env.BLOBS_TOKEN) {
    opts.siteID = process.env.BLOBS_SITE_ID;
    opts.token  = process.env.BLOBS_TOKEN;
  }
  return getStore({ name, ...opts });
}

function buildTicket(payload) {
  const id = (Math.random().toString(36).slice(2,7) + Math.random().toString(36).slice(2,5)).slice(0,8);
  const now = new Date().toISOString();
  return {
    id, createdAt: now, status: 'waiting',
    priority: payload?.priority || 'C',
    name: payload?.name || '',
    kt: payload?.kt || '',
    phone: payload?.phone || '',
    complaint: payload?.complaint || '',
    acute: Boolean(payload?.acute),
    notes: payload?.notes || '',
    redFlags: Array.isArray(payload?.redFlags) ? payload.redFlags : []
  };
}

module.exports = { getTicketsStore, buildTicket };
