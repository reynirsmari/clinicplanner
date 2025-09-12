// netlify/functions/_shared/store.js
const { getStore } = require('@netlify/blobs');
const STORE_NAME = process.env.BLOBS_STORE || 'queue';
async function getTicketsStore() {
  const opts = { name: STORE_NAME };
  if (process.env.BLOBS_SITE_ID && process.env.BLOBS_TOKEN) {
    opts.siteID = process.env.BLOBS_SITE_ID;
    opts.token = process.env.BLOBS_TOKEN;
  }
  return getStore(opts);
}
module.exports = { getTicketsStore };