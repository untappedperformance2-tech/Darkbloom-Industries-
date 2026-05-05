export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }
    const railwayUrl = (env.RAILWAY_URL || 'https://auditcore-api-production.up.railway.app')
      + url.pathname.slice(4) + url.search;
    const railwayReq = new Request(railwayUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });
    const resp = await fetch(railwayReq);
    const newResp = new Response(resp.body, resp);
    newResp.headers.set('Access-Control-Allow-Origin', '*');
    newResp.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    newResp.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-admin-secret');
    if (request.method === 'OPTIONS') return new Response(null, {headers: newResp.headers});
    return newResp;
  }
};