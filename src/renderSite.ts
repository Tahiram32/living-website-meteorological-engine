export function escapeHtml(str: string | undefined | null): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function normalizeHex(hex: string): string {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  } else if (clean.length === 4) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2] + clean[3] + clean[3];
  }
  return "#" + clean;
}

export function sanitizeThemeColor(color: string | undefined | null): string {
  const allowedColors = [
    "blue",
    "emerald",
    "amber",
    "red",
    "cyan",
    "slate",
    "purple",
    "orange",
  ];
  const input = String(color || "emerald").trim();
  if (allowedColors.includes(input.toLowerCase())) {
    return input.toLowerCase();
  }
  const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
  if (hexRegex.test(input)) {
    return normalizeHex(input);
  }
  return "emerald";
}

export function darkenHex(hex: string, percent: number): string {
  const normalized = normalizeHex(hex);
  let clean = normalized.replace("#", "");
  if (clean.length === 8) {
    clean = clean.substring(0, 6);
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) {
    return "#10b981";
  }
  const amt = Math.round(2.55 * percent);
  let R = (num >> 16) - amt;
  let G = ((num >> 8) & 0x00ff) - amt;
  let B = (num & 0x0000ff) - amt;
  R = Math.max(0, Math.min(255, R));
  G = Math.max(0, Math.min(255, G));
  B = Math.max(0, Math.min(255, B));
  return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

export function hexToRgba(hex: string, alpha: number): string {
  const normalized = normalizeHex(hex);
  let clean = normalized.replace("#", "");
  if (clean.length === 8) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    const originalAlpha = parseInt(clean.substring(6, 8), 16) / 255;
    const finalAlpha = isNaN(originalAlpha) ? alpha : originalAlpha * alpha;
    return `rgba(${r}, ${g}, ${b}, ${finalAlpha})`;
  }
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return `rgba(16, 185, 129, ${alpha})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function renderClientSite(client: any, articles: any[], req: any, res: any) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Cache-Control",
    "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
  );
  const vertical = client.vertical || "Local Business";
  const theme = sanitizeThemeColor(client.themeColor);
  let primaryColor = "#10b981";
  let hoverColor = "#047857";
  let accentColor = "#10b981";
  let accentText = "#34d399";
  let accentBg = "rgba(16, 185, 129, 0.1)";
  if (theme.startsWith("#")) {
    primaryColor = theme;
    hoverColor = darkenHex(theme, 10);
    accentColor = theme;
    accentText = theme;
    accentBg = hexToRgba(theme, 0.1);
  } else if (theme === "blue") {
    primaryColor = "#2563eb";
    hoverColor = "#1d4ed8";
    accentColor = "#3b82f6";
    accentText = "#60a5fa";
    accentBg = "rgba(37, 99, 235, 0.1)";
  } else if (theme === "amber") {
    primaryColor = "#d97706";
    hoverColor = "#b45309";
    accentColor = "#f59e0b";
    accentText = "#fbbf24";
    accentBg = "rgba(217, 119, 6, 0.1)";
  } else if (theme === "red") {
    primaryColor = "#dc2626";
    hoverColor = "#b91c1c";
    accentColor = "#ef4444";
    accentText = "#fca5a5";
    accentBg = "rgba(220, 38, 38, 0.1)";
  } else if (theme === "cyan") {
    primaryColor = "#0891b2";
    hoverColor = "#0e7490";
    accentColor = "#06b6d4";
    accentText = "#67e8f9";
    accentBg = "rgba(8, 145, 178, 0.1)";
  } else if (theme === "slate") {
    primaryColor = "#475569";
    hoverColor = "#334155";
    accentColor = "#64748b";
    accentText = "#cbd5e1";
    accentBg = "rgba(71, 85, 105, 0.1)";
  } else if (theme === "purple") {
    primaryColor = "#7c3aed";
    hoverColor = "#6d28d9";
    accentColor = "#8b5cf6";
    accentText = "#c084fc";
    accentBg = "rgba(124, 58, 237, 0.1)";
  } else if (theme === "orange") {
    primaryColor = "#ea580c";
    hoverColor = "#c2410c";
    accentColor = "#f97316";
    accentText = "#fb923c";
    accentBg = "rgba(234, 88, 12, 0.1)";
  }
  let visualIcon = "⚡";
  const iconName = (client.icon || "").toLowerCase();
  const vert = vertical.toLowerCase();
  if (
    iconName === "snowflake" ||
    vert.includes("cool") ||
    vert.includes("business")
  )
    visualIcon = "❆";
  else if (
    iconName === "flame" ||
    vert.includes("heat") ||
    vert.includes("burn")
  )
    visualIcon = "🔥";
  else if (iconName === "wind" || vert.includes("air") || vert.includes("vent"))
    visualIcon = "💨";
  else if (
    iconName === "droplets" ||
    vert.includes("plumb") ||
    vert.includes("leak")
  )
    visualIcon = "💧";
  else if (
    iconName === "roof" ||
    vert.includes("roof") ||
    vert.includes("shingle")
  )
    visualIcon = "🏠";
  else if (
    iconName === "sun" ||
    vert.includes("solar") ||
    vert.includes("light")
  )
    visualIcon = "☀️";
  else if (iconName === "zap" || vert.includes("elect")) visualIcon = "⚡";
  const copy = client.lastWeatherCopy || {
    heroTitle: `Professional ${vertical} Solutions | ${client.businessName}`,
    heroSubtitle: `Your trusted local specialists in ${client.city}. Call us today at ${client.phone} for immediate assistance.`,
    alertBanner: "",
    seoHeading: `Premium ${vertical} Services in ${client.city}`,
    seoArticle: `Welcome to ${client.businessName}. We provide high-quality, professional ${vertical.toLowerCase()} repairs, preventative maintenance, and custom installation solutions for residential and commercial properties throughout the ${client.city} region.`,
    promotions: [
      "$50 First-Time Dispatch Discount",
      "Free Estimates & Diagnostic Assessments",
    ],
    cacheTags: ["homepage", "fallback", vertical.toLowerCase()],
  };
  const isAlertActive = copy.alertBanner && copy.alertBanner.trim().length > 0;
  const safeVertical = escapeHtml(vertical);
  const safeBusinessName = escapeHtml(client.businessName);
  const safeCity = escapeHtml(client.city);
  const safePhone = escapeHtml(client.phone);
  const safePhoneUrl = client.phone
    ? String(client.phone).replace(/\D/g, "")
    : "";
  const safeHeroTitle = escapeHtml(copy.heroTitle);
  const safeHeroSubtitle = escapeHtml(copy.heroSubtitle);
  const safeAlertBanner = escapeHtml(copy.alertBanner);
  const safeSeoHeading = escapeHtml(copy.seoHeading);
  const safeSeoArticle = escapeHtml(copy.seoArticle);
  const safeLastUpdated = client.lastUpdated
    ? escapeHtml(new Date(client.lastUpdated).toLocaleString())
    : "Just Now";
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeBusinessName} - ${safeVertical} Solutions in ${safeCity}</title>
  <meta name="description" content="${safeHeroTitle}">
  <style>
    :root {
      --primary-color: ${primaryColor};
      --hover-color: ${hoverColor};
      --accent-color: ${accentColor};
      --accent-text: ${accentText};
      --accent-bg: ${accentBg};
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { line-height: 1.5; -webkit-text-size-adjust: 100%; -moz-tab-size: 4; tab-size: 4; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    body { background-color: #f8fafc; color: #0f172a; display: flex; flex-direction: column; min-height: 100vh; }
    .max-w-7xl { max-width: 80rem; }
    .max-w-5xl { max-width: 64rem; }
    .max-w-4xl { max-width: 56rem; }
    .max-w-3xl { max-width: 48rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
    .py-16 { padding-top: 4rem; padding-bottom: 4rem; }
    .py-24 { padding-top: 6rem; padding-bottom: 6rem; }
    .sticky { position: -webkit-sticky; position: sticky; }
    .top-0 { top: 0; }
    .z-50 { z-index: 50; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .justify-center { justify-content: center; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    @media (min-width: 640px) {
      .sm\\:flex-row { flex-direction: row; }
      .sm\\:py-24 { padding-top: 6rem; padding-bottom: 6rem; }
    }
    @media (min-width: 768px) {
      .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .md\\:flex-row { flex-direction: row; }
    }
    .bg-white { background-color: #ffffff; }
    .bg-slate-50 { background-color: #f8fafc; }
    .bg-slate-900 { background-color: #0f172a; }
    .bg-primary { background-color: var(--primary-color); }
    .bg-accent { background-color: var(--accent-color); }
    .bg-accent-light { background-color: var(--accent-bg); }
    .bg-red-600 { background-color: #dc2626; }
    .border-b { border-bottom: 1px solid #e2e8f0; }
    .border-slate-200 { border-color: #e2e8f0; }
    .text-white { color: #ffffff; }
    .text-slate-900 { color: #0f172a; }
    .text-slate-500 { color: #64748b; }
    .text-slate-400 { color: #94a3b8; }
    .text-slate-300 { color: #cbd5e1; }
    .text-accent { color: var(--accent-text); }
    .text-primary { color: var(--primary-color); }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .font-extrabold { font-weight: 800; }
    .font-black { font-weight: 900; }
    .font-mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace; }
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .text-lg { font-size: 1.125rem; }
    .text-xl { font-size: 1.25rem; }
    .text-2xl { font-size: 1.5rem; }
    .text-3xl { font-size: 1.875rem; }
    .text-5xl { font-size: 3rem; }
    .tracking-wide { letter-spacing: 0.025em; }
    .tracking-tight { letter-spacing: -0.025em; }
    .uppercase { text-transform: uppercase; }
    .text-center { text-align: center; }
    .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
    .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
    .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
    .rounded { border-radius: 0.25rem; }
    .rounded-full { border-radius: 9999px; }
    .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .hover-bg-primary-dark:hover { background-color: var(--hover-color); }
    .hover-bg-accent-dark:hover { background-color: var(--primary-color); }
    .hover\\:bg-slate-800:hover { background-color: #1e293b; }
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
    .w-4 { width: 1rem; } .h-4 { height: 1rem; }
    .w-6 { width: 1.5rem; } .h-6 { height: 1.5rem; }
    .inline-flex { display: inline-flex; align-items: center; justify-content: center; }
  </style>
  <script src="https://unpkg.com/@tailwindcss/browser@4" defer></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
</head>
<body class="bg-[#f8fafc] text-[#0f172a] flex flex-col min-h-screen">
  ${
    isAlertActive
      ? `
  <div class="bg-red-600 text-white py-3 px-4 text-center font-semibold text-sm tracking-wide shadow-md animate-pulse">
    <div class="max-w-7xl mx-auto flex items-center justify-center gap-2">
      <span class="bg-white text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">CRITICAL</span>
      <span>${safeAlertBanner}</span>
    </div>
  </div>
  `
      : ""
  }
  ${
    client.lastTelemetry?.microClimateAlert
      ? `
  <div class="bg-amber-500 text-slate-900 py-2 px-4 text-center font-bold text-xs tracking-wider shadow-md">
    <div class="max-w-7xl mx-auto flex items-center justify-center gap-2">
      <span class="bg-slate-900 text-amber-500 text-[9px] font-black px-1.5 py-0.5 rounded uppercase font-mono">📡 AI RADAR</span>
      <span>${escapeHtml(client.lastTelemetry.microClimateAlert)}</span>
    </div>
  </div>
  `
      : ""
  }
  <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="flex items-center gap-3">
        <div class="bg-slate-900 text-accent p-2 font-mono font-bold text-lg rounded shadow">
          ${visualIcon}
        </div>
        <div>
          <h1 class="text-lg font-extrabold text-slate-900 tracking-tight leading-none">${safeBusinessName}</h1>
          <span class="text-xs text-slate-500 font-mono uppercase tracking-wider">${safeCity} • LICENSED ${safeVertical.toUpperCase()}</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="startVoiceAgent()" id="voice-agent-btn-header" class="inline-flex items-center gap-2 bg-primary hover-bg-primary-dark text-white font-bold py-2.5 px-5 rounded shadow-lg transition-all text-sm uppercase tracking-wide animate-pulse">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
          TAP TO TALK (AI)
        </button>
      </div>
    </div>
  </header>
  <section class="relative py-16 sm:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--accent-bg),transparent)]"></div>
    <div class="max-w-5xl mx-auto px-6 relative text-center">
      <div class="inline-flex items-center gap-2 bg-accent-light text-accent px-3 py-1 border border-emerald-500/10 rounded-full text-xs font-mono mb-6 uppercase tracking-wider">
        <span class="inline-block w-2 h-2 rounded-full bg-accent animate-ping"></span>
        Weather-Adaptive Operational Campaign
      </div>
      <h2 class="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight max-w-4xl mx-auto leading-tight mb-6">
        ${safeHeroTitle}
      </h2>
      <p class="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
        ${safeHeroSubtitle}
      </p>
      <div class="flex flex-wrap gap-4 justify-center">
        <button onclick="startVoiceAgent()" id="voice-agent-btn-hero" class="bg-accent hover-bg-accent-dark text-slate-950 font-extrabold py-3.5 px-8 text-sm uppercase tracking-wider shadow-xl transition-all rounded animate-pulse">
          Instant Service Dispatch (AI)
        </button>
        <a href="#seo-info" class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold py-3.5 px-8 text-sm uppercase tracking-wider transition-all rounded">
          Local Maintenance Guide
        </a>
      </div>
    </div>
  </section>
  <section class="py-12 bg-white border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-6">
      ${
        copy.emergencyRoutingMode
          ? `
      <div class="mb-8 bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-4">
        <div class="bg-red-500 text-white p-2 rounded shadow-sm shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <div>
          <h4 class="text-red-900 font-bold text-lg">Emergency Dispatch Mode Active</h4>
          <p class="text-red-800 text-sm mt-1">Due to severe weather conditions, we are prioritizing high-severity emergency calls. Routine maintenance is temporarily paused to serve our community.</p>
        </div>
      </div>
      `
          : ""
      }
      <div class="text-center mb-8">
        <span class="text-xs font-bold text-primary uppercase tracking-widest font-mono">SEASONAL SPECIALS</span>
        <h3 class="text-2xl font-extrabold text-slate-900 mt-1">Direct-to-Consumer Savings Programs</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        ${copy.promotions
          .map(
            (promo: string) => `
        <div class="bg-slate-50 border border-slate-200/80 p-6 rounded relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div class="absolute top-0 right-0 bg-accent text-slate-950 font-mono font-black text-[9px] px-3 py-1 rounded-bl uppercase" style="position: absolute; top: 0; right: 0;">
            ACTIVE
          </div>
          <div class="mt-2">
            <span class="text-slate-400 text-[10px] font-mono tracking-wider block mb-1">PROMOTION CODE: ${escapeHtml(vertical.toUpperCase())}-${escapeHtml(client.city.toUpperCase())}</span>
            <p class="text-lg font-bold text-slate-800 leading-tight">${escapeHtml(promo)}</p>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
            <span class="text-slate-500">Expires soon</span>
            <a href="tel:${safePhoneUrl}" class="text-primary hover:text-emerald-700 font-bold uppercase tracking-wider">CLAIM OFFER &rarr;</a>
          </div>
        </div>
        `,
          )
          .join("")}
      </div>
    </div>
  </section>
  <section id="seo-info" class="py-16 bg-slate-50">
    <div class="max-w-4xl mx-auto px-6">
      <div class="bg-white border border-slate-200 p-8 sm:p-12 shadow-sm rounded">
        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100" style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9;">
          <div class="bg-accent-light text-primary p-2.5 rounded-full" style="padding: 0.625rem; border-radius: 9999px;">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 1.5rem; height: 1.5rem;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono" style="display: block; font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">EDUCATIONAL BRIEFING</span>
            <h4 class="text-lg sm:text-xl font-bold text-slate-900 mt-0.5" style="margin-top: 0.125rem; font-size: 1.125rem; color: #0f172a;">${safeSeoHeading}</h4>
          </div>
        </div>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium mb-6" style="margin-bottom: 1.5rem; line-height: 1.625; color: #475569;">
          ${safeSeoArticle}
        </p>
        ${
          articles && articles.length > 0
            ? `
        <div class="mt-8">
          <h3 class="text-xl font-bold text-slate-900 mb-6 border-b pb-2">Latest Insights & SEO Articles</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${articles
              .map(
                (article: any) => `
              <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                <h4 class="text-lg font-bold text-slate-900 mb-3">${escapeHtml(article.title || "Article")}</h4>
                <div class="text-slate-600 text-sm leading-relaxed mb-4 flex-grow prose prose-sm max-w-none">
                  ${article.content || ""}
                </div>
                <div class="flex items-center justify-between text-xs text-slate-500 font-mono mt-auto pt-4 border-t border-slate-100">
                  <span>Autor: Autonomous Webmaster</span>
                  <span>Category: ${escapeHtml(article.category || "General")}</span>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
        `
            : ""
        }
        <div class="bg-slate-50 p-4 border border-slate-200/60 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs" style="background-color: #f8fafc; border: 1px solid rgba(226, 232, 240, 0.6); padding: 1rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
          <div>
            <span class="font-bold text-slate-700" style="font-weight: 700; color: #334155;">Need Immediate Assistance?</span>
            ${client.lastTelemetry?.surgeMultiplier && client.lastTelemetry.surgeMultiplier > 1.0 
               ? `<p class="text-red-600 font-bold mt-0.5 text-xs">⚠️ EXTREME WEATHER SURGE PRICING ACTIVE (${client.lastTelemetry.surgeMultiplier}x Dispatch Fee)</p>` 
               : `<p class="text-slate-500 mt-0.5" style="color: #64748b; margin-top: 0.125rem;">Our diagnostic dispatchers are online. Save on service fees when scheduling now.</p>`}
          </div>
          <a href="tel:${safePhoneUrl}" class="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-none uppercase tracking-wide text-[11px] whitespace-nowrap shadow" style="background-color: #0f172a; color: #ffffff; font-weight: 700; padding: 0.5rem 1rem; text-transform: uppercase; font-size: 11px; text-decoration: none; display: inline-block;">
            BOOK ${safeVertical.toUpperCase()} ONLINE
          </a>
        </div>
      </div>
    </div>
  </section>
  <footer class="bg-slate-900 text-slate-400 py-12 mt-auto border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6" style="display: flex; justify-content: space-between; align-items: center; gap: 1.5rem;">
      <div class="text-center md:text-left">
        <p class="text-white text-sm font-bold tracking-wide" style="color: #ffffff; font-size: 0.875rem; font-weight: 700;">${safeBusinessName}</p>
        <p class="text-xs text-slate-500 mt-1" style="color: #64748b; font-size: 0.75rem; margin-top: 0.25rem;">&copy; ${new Date().getFullYear()} All rights reserved. Managed autonomously by The Living Website.</p>
      </div>
      <div class="text-center md:text-right font-mono text-[10px] text-slate-500 flex flex-col items-center md:items-end gap-1" style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; font-family: monospace; font-size: 10px; color: #64748b;">
        <span>STATUS: SERVER_HYDRATED (SSR)</span>
        <span>LAST_MUTATION: ${safeLastUpdated}</span>
        <span>CACHE_TAGS: [${copy.cacheTags.map((t: string) => escapeHtml(t)).join(", ")}]</span>
      </div>
    </div>
  </footer>
  <script>
    function startVoiceAgent() {
      if (!window.voiceAgentAudio) {
         window.voiceAgentAudio = new Audio();
         window.voiceAgentAudio.play().catch(() => {});
      }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Your browser does not support the Web Speech API. Please try Google Chrome.");
        return;
      }
      const buttons = document.querySelectorAll('#voice-agent-btn-header, #voice-agent-btn-hero');
      buttons.forEach(b => {
         b.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> LISTENING...';
         b.classList.remove('animate-pulse');
         b.classList.add('bg-red-600');
      });
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.start();
      recognition.onresult = async function(event) {
        const transcript = event.results[0][0].transcript;
        buttons.forEach(b => {
           b.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> THINKING...';
        });
        try {
          const res = await fetch('/api/webhooks/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              domain: '${client.domain}',
              transcript: transcript,
              callerNumber: 'Web Browser Caller'
            })
          });
          const data = await res.json();
          if (data.audio_base64) {
             if (window.voiceAgentAudio) {
               window.voiceAgentAudio.src = "data:audio/mp3;base64," + data.audio_base64;
               window.voiceAgentAudio.play();
             } else {
               const audio = new Audio("data:audio/mp3;base64," + data.audio_base64);
               audio.play();
             }
          } else if (data.tts_text) {
             const utterance = new SpeechSynthesisUtterance(data.tts_text);
             window.speechSynthesis.speak(utterance);
          }
        } catch(e) {
          console.error("Voice Error", e);
        }
        buttons.forEach(b => {
           b.innerHTML = 'TAP TO TALK (AI)';
           b.classList.remove('bg-red-600');
           b.classList.add('animate-pulse');
        });
      };
      recognition.onerror = function(event) {
        buttons.forEach(b => {
           b.innerHTML = 'TAP TO TALK (AI)';
           b.classList.remove('bg-red-600');
           b.classList.add('animate-pulse');
        });
      };
    }
  </script>
</body>
</html>
  `);
}
