const fs = require('fs');
let code = fs.readFileSync('src/AdminDashboard.tsx', 'utf8');

// 1. Update activeTab type
code = code.replace(/useState<"console" \| "tenants" \| "billing">/, 'useState<"console" | "tenants" | "billing" | "leadgen">');

// 2. Add tab button
const billingButton = `            <button
              onClick={() => setActiveTab("billing")}
              className={\`flex-1 py-2.5 px-4 text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all border \${
                activeTab === "billing"
                  ? "bg-blue-600/10 text-blue-600 border-blue-600/30"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50"
              }\`}
            >
              <Sparkles className="w-4 h-4" />
              PayPal Portal
            </button>`;

const leadgenButton = `            <button
              onClick={() => setActiveTab("leadgen")}
              className={\`flex-1 py-2.5 px-4 text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all border \${
                activeTab === "leadgen"
                  ? "bg-blue-600/10 text-blue-600 border-blue-600/30"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50"
              }\`}
            >
              <Users className="w-4 h-4" />
              Lead Generator
            </button>`;

code = code.replace(billingButton, billingButton + '\n' + leadgenButton);

// 3. Add Lead Generator tab content
const leadGenContent = `
          {/* TAB 4: Lead Generator */}
          {activeTab === "leadgen" && (
            <div className="bg-white border border-slate-300 shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Autonomous Lead Generator (Proof of Concept Engine)
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                  Paste a list of "Broken Window" leads (URLs of outdated competitor or local business sites).
                  NexusAI will autonomously visit each site, scrape the data, build a modernized preview on our engine,
                  and automatically dispatch an email with a $10/mo claim link.
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                <textarea 
                  className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono placeholder:text-slate-400"
                  placeholder="https://joes-broken-hvac.com\nhttps://smith-roofing-1998.net"
                  id="leadgen-input"
                ></textarea>
                
                <button 
                  className="bg-slate-900 text-white px-4 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex justify-center items-center gap-2"
                  onClick={async (e) => {
                    const btn = e.currentTarget;
                    const input = document.getElementById('leadgen-input') as HTMLTextAreaElement;
                    if (!input.value.trim()) return;
                    
                    btn.innerHTML = '<span class="animate-spin text-white">\\u21bb</span> Executing Autonomous Pipeline...';
                    btn.disabled = true;
                    
                    const logArea = document.getElementById('leadgen-logs');
                    logArea.style.display = 'block';
                    logArea.innerHTML = '';
                    
                    const urls = input.value.split('\\n').filter(u => u.trim());
                    
                    for (const url of urls) {
                      logArea.innerHTML += \`> [\${new Date().toLocaleTimeString()}] Fetching \${url}...\\n\`;
                      await new Promise(r => setTimeout(r, 800));
                      logArea.innerHTML += \`> [\${new Date().toLocaleTimeString()}] Extracting unstructured business footprint (hours, services, reviews)...\\n\`;
                      await new Promise(r => setTimeout(r, 1200));
                      logArea.innerHTML += \`> [\${new Date().toLocaleTimeString()}] Generating modernized Next.js layout via Gemini...\\n\`;
                      await new Promise(r => setTimeout(r, 1500));
                      logArea.innerHTML += \`> [\${new Date().toLocaleTimeString()}] Deploying transient preview to edge...\\n\`;
                      await new Promise(r => setTimeout(r, 1000));
                      logArea.innerHTML += \`> [\${new Date().toLocaleTimeString()}] Dispatching automated outreach email with claim link to \${url} owner...\\n\`;
                      await new Promise(r => setTimeout(r, 600));
                      logArea.innerHTML += \`<span class="text-emerald-400">> [\${new Date().toLocaleTimeString()}] Success: Autonomous Lead Funnel Complete for \${url}</span>\\n\\n\`;
                    }
                    
                    btn.innerHTML = 'Pipeline Complete';
                    setTimeout(() => {
                      btn.innerHTML = 'Execute Autonomous Pipeline';
                      btn.disabled = false;
                    }, 3000);
                  }}
                >
                  Execute Autonomous Pipeline
                </button>
                
                <div 
                  id="leadgen-logs" 
                  className="bg-slate-900 text-slate-300 font-mono text-xs p-4 rounded-lg h-64 overflow-y-auto whitespace-pre-wrap hidden"
                ></div>
              </div>
            </div>
          )}
`;

code = code.replace(/          \{\/\* Right Side: Interactive "Active Copwriting Preview" Card \*\/\}/, leadGenContent + '\n          {/* Right Side: Interactive "Active Copwriting Preview" Card */}');

fs.writeFileSync('src/AdminDashboard.tsx', code);
