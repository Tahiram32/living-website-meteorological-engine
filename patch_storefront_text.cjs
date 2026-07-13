const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

// Social Proof & Metrics replacements
code = code.replace(/<p className="text-slate-500 text-sm">Global edge latency, ensuring immediate rendering of optimized localized content\.<\/p>/, '<p className="text-slate-500 text-sm">Lightning Fast Loading on Mobile, keeping your visitors engaged and preventing bounces.</p>');
code = code.replace(/<h4 className="text-3xl font-bold text-slate-900">&lt;50ms<\/h4>/, '<h4 className="text-3xl font-bold text-slate-900">Instant</h4>');

code = code.replace(/12\.4k/g, '50+');
code = code.replace(/<p className="text-slate-500 text-sm">Autonomous assets currently provisioned and actively optimizing in the wild\.<\/p>/, '<p className="text-slate-500 text-sm">Websites actively managed by AI for local businesses this month.</p>');

// ROI Calculator replacements
code = code.replace(/NexusAI continuously adapts your field service pipeline\. Use our predictive model to forecast your localized conversion uplift based on regional historical weather patterns\./, 'The Living Website Engine continuously adapts to get you more monthly leads. Use our predictive model to forecast your extra phone calls based on local weather and event patterns.');

code = code.replace(/<span className="text-slate-400">Current Monthly Traffic<\/span>/, '<span className="text-slate-400">Current Monthly Visitors</span>');
code = code.replace(/<span className="text-slate-400">Severe Weather Events \(Annually\)<\/span>/, '<span className="text-slate-400">Local Weather/Event Triggers</span>');
code = code.replace(/Projected Additional High-Intent Leads/, 'Projected Additional Phone Calls');
code = code.replace(/\* Based on a 314% conversion increase during active meteorological events compared to static baselines\./, '* Based on average conversion increase during dynamic weather/event campaigns compared to static websites.');
code = code.replace(/Live Telemetry Mode/, 'Active Lead Capture');
code = code.replace(/Connect your CRM for personalized predictive intelligence and pipeline optimization\./, 'Instantly route new customer calls and form submissions directly to your phone.');

fs.writeFileSync('src/Storefront.tsx', code);
