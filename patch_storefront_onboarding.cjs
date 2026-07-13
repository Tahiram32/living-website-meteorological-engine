const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

// Update state variables
code = code.replace(/const \[businessName, setBusinessName\] = useState\(""\);\n  const \[zipCode, setZipCode\] = useState\(""\);/, 'const [websiteUrl, setWebsiteUrl] = useState("");');

// Update Hero copy
code = code.replace(/Enterprise Autonomous Agents/, 'Zero-Click Autonomous Onboarding');
code = code.replace(/Deeply integrated\. <br\/>\n\s*<span className="text-blue-600">Fully autonomous\.<\/span>/, 'Zero coding. <br/>\n              <span className="text-blue-600">Fully autonomous.</span>');
code = code.replace(/NexusAI provisions secure, localized, weather-adaptive digital assets for field service organizations\. Stop building static websites\. Start deploying context-aware lead generation engines integrated directly with your CRM\./, 'Enter your business name or existing link, pay $10, and your new AI-managed website is live in 4 seconds. Zero coding, zero copywriting, zero effort. It even runs your autonomous A/B testing 24/7.');

// Update overlay steps
code = code.replace(/\{checkoutStep === 2 && "Synchronizing local meteorological datasets\.\.\."\}/, '{checkoutStep === 2 && "Scraping existing public footprint..."}');
code = code.replace(/\{checkoutStep === 3 && "Generating neural layout architecture\.\.\."\}/, '{checkoutStep === 3 && "Autonomously generating highly-converting layout..."}');

// Update inputs
const oldInputs = `<div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-slate-700 uppercase">Organization Name</label>
                <input 
                  type="text" 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Industrial Roofing"
                  className="px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-slate-700 uppercase">Target Territory (ZIP Code)</label>
                <input 
                  type="text" 
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="e.g. 89012"
                  className="px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
              </div>`;

const newInputs = `<div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-slate-700 uppercase">Existing Website or Maps URL</label>
                <input 
                  type="text" 
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="e.g. your-broken-site.com or Google Maps Link"
                  className="px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
              </div>`;

code = code.replace(oldInputs, newInputs);

// Update PayPal logic
code = code.replace(/disabled=\{!businessName \|\| !zipCode \|\| checkoutStep > 0\}/, 'disabled={!websiteUrl || checkoutStep > 0}');
code = code.replace(/amount: \{ value: "199\.00", currency_code: "USD" \}/, 'amount: { value: "10.00", currency_code: "USD" }');
code = code.replace(/description: \`NexusAI Enterprise Provisioning - \$\{businessName\}\`,/, 'description: `Living Website - Auto Onboarding`,');
code = code.replace(/businessName: businessName,\n\s*zipCode: zipCode,/, 'websiteUrl: websiteUrl,');
code = code.replace(/businessName: businessName,\n\s*zipCode: zipCode/, 'websiteUrl: websiteUrl');
code = code.replace(/199\.00/g, '10.00'); // Ensure it says $10

fs.writeFileSync('src/Storefront.tsx', code);
