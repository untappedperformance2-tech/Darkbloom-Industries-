export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const referer = request.headers.get('Referer') || '';

    if (url.pathname.startsWith('/api/')) {
      // Determine which backend based on the page making the request
      const isWrenchWare = referer.includes('shop-dashboard') || referer.includes('insurer-dashboard') || referer.includes('wrenchware') || referer.includes('claimsync');
      
      let backendUrl;
      if (isWrenchWare) {
        backendUrl = 'https://web-production-f13e8.up.railway.app' + url.pathname + url.search;
      } else {
        const RAILWAY_URL = env.RAILWAY_URL || 'https://auditcore-api-production.up.railway.app';
        backendUrl = RAILWAY_URL + url.pathname + url.search;
      }

      const newRequest = new Request(backendUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      });

      try {
        const response = await fetch(newRequest);
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        return newResponse;
      } catch (e) {
        return new Response(JSON.stringify({ error: 'API unavailable', detail: e.message }), {
          status: 502, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Employee-ID,X-License-Key' } });
    }

    return fetch(request);
  }
};