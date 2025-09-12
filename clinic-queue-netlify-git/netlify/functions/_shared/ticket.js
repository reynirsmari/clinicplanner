// netlify/functions/_shared/ticket.js
const crypto = require('crypto');

function _id(len = 7) {
  return crypto.randomBytes(10).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').slice(0, len);
}

function buildTicket(input = {}) {
  const now = new Date().toISOString();
  const id = (input.id && String(input.id)) || _id(7);
  const sub = Array.isArray(input.subcomplaints) ? input.subcomplaints : [];
  return {
    id,
    createdAt: now,
    modifiedAt: now,
    status: 'waiting',               // waiting | notified | called | done
    priority: (input.priority || 'C'),
    name: (input.name || '').trim(),
    kt: (input.kt || '').trim(),
    phone: (input.phone || '').trim(),
    complaint: (input.complaint || '').trim(),
    subcomplaints: sub,
    notes: (input.notes || ''),
    redFlags: Array.isArray(input.redFlags) ? input.redFlags : [],
    notifiedAt: null,
    calledAt: null
  };
}

module.exports = { buildTicket };
