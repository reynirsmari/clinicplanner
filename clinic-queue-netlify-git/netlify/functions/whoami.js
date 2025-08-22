
export async function handler(){
  return {
    statusCode: 200,
    headers: { 'content-type':'application/json' },
    body: JSON.stringify({ cwd: process.cwd(), ts: Date.now() })
  };
}
