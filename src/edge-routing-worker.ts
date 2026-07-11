/**
 * LIVING WEBSITE AI SYSTEMS &mdash; MULTI-TENANT EDGE ROUTER
 * Cloudflare Workers (ESM) Production-Grade Architecture
 * 
 * DESIGN MISSION:
 * 1. Eliminate the "Monolith Trap" (Express thread starvation) by isolating custom host-routing at the network edge.
 * 2. Deliver near-zero cold-starts (Edge Execution) and high-availability SSL termination.
 * 3. Cache client HTML configurations directly in Cloudflare KV / Cache API for sub-10ms Time-to-First-Byte (TTFB).
 */

// Local type declarations for standalone Worker environment compilation
export interface KVNamespace {
  get(key: string, type: "json"): Promise<any>;
  put(key: string, value: string): Promise<void>;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export interface Env {
  // Cloudflare KV Namespace containing synchronized tenant documents
  TENANT_REGISTRAR_KV: KVNamespace;
  // Fallback origin server hosting the admin portal (Express App / Cloud Run container)
  BACKEND_ORIGIN_URL: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase().trim();

    // 1. Identify System Domains (Admin portal, health checks, webhook, and assets)
    const systemHosts = [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "3000",
      "3001"
    ];
    const isSystemHost = systemHosts.includes(host) || 
                         host.endsWith(".run.app") || 
                         host.endsWith(".github.dev") || 
                         host.endsWith(".aistudio.google");

    const isSystemPath = url.pathname.startsWith("/api") || 
                         url.pathname.startsWith("/assets") || 
                         url.pathname.startsWith("/site") || 
                         url.pathname.startsWith("/@vite") || 
                         url.pathname.startsWith("/node_modules") || 
                         url.pathname.startsWith("/src");

    // Route system administrative tools and core APIs directly to the backend origin container
    if (isSystemHost || isSystemPath) {
      return fetch(request);
    }

    // 2. Client Domain Custom Routing at the Serverless Edge
    if (url.pathname === "/") {
      try {
        // Attempt to fetch tenant configuration from high-speed, replicated Edge KV storage
        const cachedClientData = await env.TENANT_REGISTRAR_KV.get(host, "json") as any;
        
        let clientData = cachedClientData;
        let isFallbackResolve = false;

        if (!clientData) {
          // Trigger instant high-speed fallback lookup to the main registrar database (Express API)
          const originHost = env.BACKEND_ORIGIN_URL || "http://localhost:3000";
          try {
            const resolveRes = await fetch(`${originHost}/api/clients/resolve?domain=${encodeURIComponent(host)}`);
            if (resolveRes.ok) {
              clientData = await resolveRes.json();
              isFallbackResolve = true;
              // Background hydrate the Edge KV cache so subsequent loads take <10ms!
              ctx.waitUntil(env.TENANT_REGISTRAR_KV.put(host, JSON.stringify(clientData)));
            }
          } catch (fetchErr) {
            console.error("Direct fallback resolver fetch failed:", fetchErr);
          }
        }

        if (clientData) {
          // Found high-speed edge tenant. Hydrate the static template or weather-cached HTML
          const copy = clientData.lastWeatherCopy || {
            heroTitle: `Professional HVAC Repair & Install | ${clientData.businessName}`,
            heroSubtitle: `Your trusted local comfort experts in ${clientData.city}. Call us today at ${clientData.phone}.`,
            alertBanner: "",
            seoHeading: `Premium Heating & Cooling Services in ${clientData.city}`,
            seoArticle: `Welcome to ${clientData.businessName}. We provide professional HVAC repair, installation, and seasonal maintenance across ${clientData.city} and surrounding areas.`,
            promotions: ["$20 Off First Service Call", "Free System Replacement Estimates"],
            cacheTags: ["homepage", "edge-cached"]
          };

          const isAlertActive = copy.alertBanner && copy.alertBanner.trim().length > 0;

          // Assemble pre-rendered high-performance HTML directly at the edge
          const edgeHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${clientData.businessName} - HVAC Solutions in ${clientData.city}</title>
  <meta name="description" content="${copy.heroTitle}">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { line-height: 1.5; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    body { background-color: #f8fafc; color: #0f172a; display: flex; flex-direction: column; min-height: 100vh; }
    .max-w-7xl { max-width: 80rem; }
    .max-w-5xl { max-width: 64rem; }
    .max-w-4xl { max-width: 56rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .py-16 { padding-top: 4rem; padding-bottom: 4rem; }
    .py-24 { padding-top: 6rem; padding-bottom: 6rem; }
    .bg-white { background-color: #ffffff; }
    .bg-slate-900 { background-color: #0f172a; }
    .bg-emerald-600 { background-color: #059669; }
    .bg-emerald-500 { background-color: #10b981; }
    .bg-red-600 { background-color: #dc2626; }
    .text-white { color: #ffffff; }
    .text-slate-900 { color: #0f172a; }
    .text-slate-300 { color: #cbd5e1; }
    .text-emerald-400 { color: #34d399; }
    .font-mono { font-family: monospace; }
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .text-lg { font-size: 1.125rem; }
    .text-5xl { font-size: 3rem; }
    .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
  </style>
  <script src="https://unpkg.com/@tailwindcss/browser@4" defer></script>
</head>
<body class="bg-[#f8fafc] text-[#0f172a] flex flex-col min-h-screen">
  \${isAlertActive ? \`
  <div class="bg-red-600 text-white py-3 px-4 text-center font-semibold text-sm tracking-wide shadow-md animate-pulse">
    <div class="max-w-7xl mx-auto flex items-center justify-center gap-2">
      <span class="bg-white text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">CRITICAL</span>
      <span>\${copy.alertBanner}</span>
    </div>
  </div>
  \` : ''}

  <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="bg-slate-900 text-emerald-400 p-2 font-mono font-bold text-lg rounded">❆</div>
        <div>
          <h1 class="text-lg font-extrabold text-slate-900 tracking-tight leading-none">\${clientData.businessName}</h1>
          <span class="text-xs text-slate-500 font-mono uppercase">\${clientData.city} • LICENSED HVAC</span>
        </div>
      </div>
      <a href="tel:\${clientData.phone.replace(/\\D/g, '')}" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded text-sm uppercase">
        CALL \${clientData.phone}
      </a>
    </div>
  </header>

  <section class="relative py-16 sm:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white">
    <div class="max-w-5xl mx-auto px-6 text-center">
      <div class="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-mono mb-6 uppercase">
        Edge-Served Client Site
      </div>
      <h2 class="text-3xl sm:text-5xl font-black mb-6 tracking-tight">\${copy.heroTitle}</h2>
      <p class="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">\${copy.heroSubtitle}</p>
      <a href="tel:\${clientData.phone.replace(/\\D/g, '')}" class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3.5 px-8 text-sm uppercase tracking-wider rounded">
        Instant Comfort Dispatch
      </a>
    </div>
  </section>

  <footer class="bg-slate-900 text-slate-400 py-12 mt-auto border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-6 flex justify-between items-center">
      <div>
        <p class="text-white text-sm font-bold">\${clientData.businessName}</p>
        <p class="text-xs text-slate-500 mt-1">&copy; \${new Date().getFullYear()} Living Website AI Systems.</p>
      </div>
      <div class="text-right font-mono text-[10px] text-slate-500 flex flex-col gap-1">
        <span>STATUS: \${isFallbackResolve ? "EDGE_RESOLVED_FALLBACK (REST)" : "EDGE_SERVED (KV)"}</span>
        <span>CACHE_TAGS: [\${copy.cacheTags.join(', ')}]</span>
      </div>
    </div>
  </footer>
</body>
</html>
          `;

          return new Response(edgeHtml, {
            headers: {
              "Content-Type": "text/html; charset=utf-8",
              "X-Edge-Served": "true",
              "X-Edge-Fallback-Resolved": isFallbackResolve ? "true" : "false",
              "Cache-Control": "public, max-age=60, s-maxage=3600"
            }
          });
        }
      } catch (kvError) {
        // Fallback gracefully to the main backend server if KV fetch fails
        console.error("KV fetch failed, falling back to core application server:", kvError);
      }
    }

    // 3. Complete Fallback: Transparent Proxy to Express Back-End App
    const proxyRequest = new Request(request);
    proxyRequest.headers.set("X-Forwarded-Host", host);
    proxyRequest.headers.set("X-Edge-Proxy", "true");

    return fetch(`${env.BACKEND_ORIGIN_URL || "http://localhost:3000"}${url.pathname}${url.search}`, proxyRequest);
  }
};
