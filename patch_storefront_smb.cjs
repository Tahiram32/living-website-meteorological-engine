const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

// Remove Simulator
code = code.replace(/const \[isDemoActive, setIsDemoActive\] = useState\(false\);\n  const \[demoState, setDemoState\] = useState\(0\);/, '');
code = code.replace(/const runDemo = async \(\) => \{[\s\S]*?setDemoState\(0\);\n  \};\n/, '');

// Fix NavBar
code = code.replace(/Nexus<span className="text-blue-600">AI<\/span>/, 'Living Website <span className="text-blue-600 font-sans">Engine</span>');
code = code.replace(/<a href="#enterprise" className="hover:text-slate-900 transition-colors">Enterprise<\/a>/, '');
code = code.replace(/Zero-Trust Security/, 'How it works');

// Fix Hero Copy
code = code.replace(/<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold tracking-wide uppercase mb-6">\s*<span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"><\/span>\s*Zero-Click Autonomous Onboarding\s*<\/div>/, `<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold tracking-wide uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Small Business Services
            </div>`);

code = code.replace(/<h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-\[1\.1\]">\s*Zero coding\. <br\/>\s*<span className="text-blue-600">Fully autonomous\.<\/span>\s*<\/h1>/, `<h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Your AI Marketing Manager. <br/>
              <span className="text-blue-600">Always Optimizing.</span>
            </h1>`);

code = code.replace(/<p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-lg">[\s\S]*?<\/p>/, `<p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-lg">
              Stop losing leads to an outdated website. Paste your current link, and our AI will autonomously build, launch, and manage a highly-converting, weather-adaptive site that works 24/7.
            </p>`);

// Fix Features under Hero
code = code.replace(/<div className="flex items-center gap-2 text-sm text-slate-700 font-medium bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">\s*<Shield className="w-4 h-4 text-emerald-500" \/> SOC2 Compliant\s*<\/div>/, `<div className="flex items-center gap-2 text-sm text-slate-700 font-medium bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
              <Zap className="w-4 h-4 text-emerald-500" /> Zero-Click Onboarding
            </div>`);

code = code.replace(/<Globe className="w-4 h-4 text-emerald-500" \/> Edge Distributed/, `<Globe className="w-4 h-4 text-emerald-500" /> Continuous A/B Testing`);

// Fix Provision Header & Remove Simulator Button
code = code.replace(/<div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">[\s\S]*?<\/button>\s*<\/div>/, `<div className="p-8 border-b border-slate-100 flex flex-col bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Activate Your AI Engine</h3>
              <p className="text-sm text-slate-500 mt-1">Enter your website URL or Google Maps link. We handle the rest.</p>
            </div>`);

// Remove Simulator Log window
code = code.replace(/\{isDemoActive && \([\s\S]*?\}\)/, '');

// Update Pricing
code = code.replace(/value: "10\.00"/g, 'value: "50.00"');
code = code.replace(/NexusAI Enterprise Provisioning/, 'Living Website Engine');

// Remove Fake Compliances at the bottom of the card
code = code.replace(/<span className="flex items-center gap-1"><Shield className="w-3 h-3" \/> PCI-DSS Compliant<\/span>\s*<span className="flex items-center gap-1"><Lock className="w-3 h-3" \/> Zero-Trust Architecture<\/span>/, `<span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure Payment</span>`);

// Write back
fs.writeFileSync('src/Storefront.tsx', code);
