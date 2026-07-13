import React, { useState } from 'react';
import { Zap, Shield, Check, Loader2, AlertTriangle, Smartphone, Mail } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function Storefront() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-xl text-slate-900">
              Living Website <span className="text-blue-600 font-sans">Engine</span>
            </span>
          </div>
          
        </div>
      </nav>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-20 lg:py-32">
        {/* Headline Section */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-8">
            Stop Wasting Hours <br/>
            <span className="text-blue-600">Managing A Website.</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            You run your business. We run your digital presence. Here is how you get online and start capturing leads in under 60 seconds.
          </p>
        </div>

        <div className="flex flex-col gap-32">
          {/* Step 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-6">
              <div className="text-blue-600 font-bold tracking-wide uppercase text-sm">Step 1</div>
              <h2 className="text-3xl font-bold text-slate-900">Tell Us What You Do</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                You do not need to write copy or design layouts. You simply paste your Google Maps link or enter your business name into our secure checkout.
              </p>
              <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 mt-4 font-mono text-sm text-slate-700">
                <span className="text-slate-500 block mb-2">// Example Input:</span>
                Business Name: Mobile Notary & Loan Signing<br/>
                Location: Henderson, NV 89015
              </div>
            </div>

            {/* Checkout Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent blur-3xl -z-10 rounded-full"></div>
              <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden relative">
                
                {checkoutStep > 0 && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                      {checkoutStep === 5 ? (
                        <Check className="w-8 h-8 text-emerald-500" />
                      ) : (
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {checkoutStep === 5 ? "Site Provisioned!" : "Provisioning Infrastructure..."}
                    </h3>
                    <p className="text-slate-500 max-w-xs mx-auto">
                      {checkoutStep === 1 && "Establishing secure payment channel..."}
                      {checkoutStep === 2 && "Scraping existing public footprint..."}
                      {checkoutStep === 3 && "Autonomously generating highly-converting layout..."}
                      {checkoutStep === 4 && "Distributing to global edge network..."}
                      {checkoutStep === 5 && "Check your email for the live link."}
                    </p>
                  </div>
                )}

                <div className="p-8 border-b border-slate-100 flex flex-col bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-900">Activate Your AI Engine</h3>
                  <p className="text-sm text-slate-500 mt-1">Enter your website URL or Google Maps link. We handle the rest.</p>
                </div>
                
                <div className="p-8 flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wide text-slate-700 uppercase">Existing Website or Maps URL</label>
                    <input 
                      type="text" 
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="e.g. your-broken-site.com or Maps Link"
                      className="px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="mt-2">
                    <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", components: "buttons", currency: "USD" }}>
                      <PayPalButtons 
                        style={{ layout: "vertical", shape: "rect", color: "blue" }}
                        disabled={!websiteUrl || checkoutStep > 0}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                              {
                                amount: { value: "50.00", currency_code: "USD" },
                                description: `Living Website - Auto Onboarding`,
                                custom_id: JSON.stringify({
                                  websiteUrl: websiteUrl,
                                  tier: "smb-adaptive"
                                })
                              }
                            ]
                          });
                        }}
                        onApprove={async (data, actions) => {
                          if (!actions.order) return;
                          
                          setCheckoutStep(1); // Verifying
                          try {
                            const details = await actions.order.capture();
                            setCheckoutStep(2); // Analyzing territory
                            
                            const mockTxId = details.id;
                            const mockTime = new Date().toISOString();
                            const mockSig = `sig_live_${Math.random().toString(36).substring(2, 24)}`;
                            const mockCertUrl = "https://api.paypal.com/v1/certs/mock-cert-bundle.pem";
                            
                            await wait(600);
                            setCheckoutStep(3); // Generating
                            
                            const res = await fetch("/api/webhooks/mock-paypal", {
                              method: "POST",
                              headers: { 
                                "Content-Type": "application/json",
                                "paypal-transmission-id": mockTxId,
                                "paypal-transmission-time": mockTime,
                                "paypal-transmission-sig": mockSig,
                                "paypal-cert-url": mockCertUrl,
                                "paypal-auth-algo": "SHA256withRSA"
                              },
                              body: JSON.stringify({
                                event_type: "CHECKOUT.ORDER.APPROVED",
                                resource: {
                                  payer: {
                                    email_address: details.payer?.email_address || "business@example.com"
                                  },
                                  custom_id: JSON.stringify({
                                    websiteUrl: websiteUrl
                                  })
                                }
                              })
                            });
                            
                            if (!res.ok) throw new Error(`Server returned HTTP Status ${res.status}`);
                            
                            setCheckoutStep(4); // Deploying
                            await wait(1000);
                            
                            setCheckoutStep(5); // Complete!
                            
                          } catch (err: any) {
                            setErrorMessage(err.message || "Secure connection failed. Please try again.");
                            setCheckoutStep(0);
                          }
                        }}
                        onError={(err) => {
                          setErrorMessage("Payment gateway error. Please try again or contact support.");
                          setCheckoutStep(0);
                        }}
                      />
                    </PayPalScriptProvider>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure Payment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col gap-6 max-w-3xl">
            <div className="text-blue-600 font-bold tracking-wide uppercase text-sm">Step 2</div>
            <h2 className="text-3xl font-bold text-slate-900">The Autonomous Engine Deploys</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              The moment your payment clears, our AI instantly builds your entire website. It scrapes your existing public footprint, writes professional sales copy specifically for your industry, provisions a beautiful mobile design, and launches it live on the web.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col gap-6 max-w-3xl ml-auto text-left lg:text-right">
            <div className="text-blue-600 font-bold tracking-wide uppercase text-sm">Step 3</div>
            <h2 className="text-3xl font-bold text-slate-900">Your Site Actively Sells For You</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              This is where traditional websites fail. Your new site is alive. Our engine acts as your 24/7 marketing manager. It continuously runs silent A/B tests to figure out which headlines convert best. It autonomously adapts your offers based on the time of day, local events, or changing seasons to ensure you capture the maximum amount of traffic. It optimizes itself so you don't have to.
            </p>
          </div>

          {/* Step 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-6 lg:order-2">
              <div className="text-blue-600 font-bold tracking-wide uppercase text-sm">Step 4</div>
              <h2 className="text-3xl font-bold text-slate-900">You Just Take The Phone Calls</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                There is no confusing dashboard to log into and no maintenance required. Whenever our engine updates your site or runs a successful optimization, we send a simple "Value Receipt" directly to your inbox showing you exactly what we did to increase your leads. You just focus on running your business.
              </p>
            </div>
            
            {/* iPhone Mockup for Receipt */}
            <div className="lg:order-1 flex justify-center">
              <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] p-4 shadow-2xl border-4 border-slate-800 shrink-0">
                <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
                  <div className="w-24 h-5 bg-slate-900 rounded-b-2xl"></div>
                </div>
                <div className="w-full h-full bg-white rounded-[2.25rem] overflow-hidden flex flex-col">
                  {/* Email Header */}
                  <div className="bg-slate-50 border-b border-slate-200 p-4 pt-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Living Website Engine</div>
                        <div className="text-xs text-slate-500">Weekly Value Receipt</div>
                      </div>
                    </div>
                  </div>
                  {/* Email Body */}
                  <div className="p-5 flex flex-col gap-4 bg-white flex-1 overflow-y-auto">
                    <h4 className="text-lg font-bold text-slate-900">Optimization Report</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      We tested a new headline focused on "Emergency Same-Day Service" during Tuesday's storm front.
                    </p>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-2">
                      <div className="text-blue-600 font-bold text-2xl">+3</div>
                      <div className="text-sm font-medium text-blue-900">New Phone Calls This Week</div>
                    </div>
                    <div className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
                      Your site is fully optimized. No action required.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
