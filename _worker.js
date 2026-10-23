export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const referer = request.headers.get('Referer') || '';
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Org-ID,X-Assessor-Token,X-Bridge-Token,x-admin-secret,X-Employee-ID,X-License-Key',
      }});
    }
    if (url.pathname.startsWith('/api/')) {
      const isWrenchWare = referer.includes('shop-dashboard') || referer.includes('insurer-dashboard') || referer.includes('wrenchware') || referer.includes('claimsync');
      const strippedPath = url.pathname.replace(/^\/api/, '');
      const backendUrl = isWrenchWare
        ? 'https://web-production-f13e8.up.railway.app' + strippedPath + url.search
        : 'https://auditcore-api-production.up.railway.app' + strippedPath + url.search;
      try {
        let bodyData = undefined;
        if (request.method !== 'GET' && request.method !== 'HEAD') { bodyData = await request.arrayBuffer(); }
        const forwardHeaders = new Headers();
        request.headers.forEach((value, key) => {
          if (!['host','cf-connecting-ip','cf-ray','cf-visitor','cf-ipcountry','cf-ew-via','cdn-loop'].includes(key.toLowerCase())) {
            forwardHeaders.set(key, value);
          }
        });
        const response = await fetch(backendUrl, { method: request.method, headers: forwardHeaders, body: bodyData });
        const responseBody = await response.arrayBuffer();
        const newResponse = new Response(responseBody, { status: response.status, statusText: response.statusText, headers: response.headers });
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        return newResponse;
      } catch (e) {
        return new Response(JSON.stringify({ error: 'API unavailable', detail: e.message }), {
          status: 502, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }
    return env.ASSETS.fetch(request);
  },
};