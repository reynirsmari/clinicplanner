
// Minimal delete endpoint. Keeps other functions unchanged.
const { BlobStore } = require('@netlify/blobs');
const storeName = process.env.BLOBS_STORE || 'queue';

exports.handler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: JSON.stringify({ ok:false, error:'Method Not Allowed' }) };
    }
  const id = (event.queryStringParameters||{}).id || '';
  if(!id){ return { statusCode: 400, body: JSON.stringify({ ok:false, error:'Missing id' }) }; }
  try{
    const store = BlobStore.getStore({ name: storeName, siteID: process.env.BLOBS_SITE_ID });
    await store.delete(`tickets/${id}.json`);
    return { statusCode: 200, body: JSON.stringify({ ok:true }) };
  }catch(err){
    return { statusCode: 500, body: JSON.stringify({ ok:false, error: err.message }) };
  }
};
