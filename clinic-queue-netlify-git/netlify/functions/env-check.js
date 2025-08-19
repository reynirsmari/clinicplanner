import { json } from "./_shared/json.js";

export const handler = async () => {
  const seen = {
    BLOBS_SITE_ID: process.env.BLOBS_SITE_ID ? "present" : "missing",
    SITE_ID: process.env.SITE_ID ? "present" : "missing",
    NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID ? "present" : "missing",
    BLOBS_TOKEN: process.env.BLOBS_TOKEN ? "present" : "missing",
    NETLIFY_API_TOKEN: process.env.NETLIFY_API_TOKEN ? "present" : "missing",
    NETLIFY_TOKEN: process.env.NETLIFY_TOKEN ? "present" : "missing",
  };
  return json(200, { seen });
};
