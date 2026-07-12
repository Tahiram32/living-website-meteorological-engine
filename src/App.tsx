/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Database,
  Activity,
  CloudSun,
  Terminal,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Globe,
  Phone,
  MapPin,
  RefreshCw,
  Copy,
  Check,
  Cpu,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { HVACClient, PipelineRun, PipelineLog } from "./types";
import { db } from "./firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

export default function App() {
  const [activeTab, setActiveTab] = useState<"console" | "tenants" | "billing">("console");
  const [clients, setClients] = useState<HVACClient[]>([]);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [activeRun, setActiveRun] = useState<PipelineRun | null>(null);
  const [selectedCity, setSelectedCity] = useState("Dallas");
  const [customCity, setCustomCity] = useState("");
  const [selectedClient, setSelectedClient] = useState<HVACClient | null>(null);
  const [hasRealApiKey, setHasRealApiKey] = useState(false);

  // Client registration form state
  const [newClientDomain, setNewClientDomain] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientCity, setNewClientCity] = useState("Dallas");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientIsr, setNewClientIsr] = useState("");
  const [newClientSecret, setNewClientSecret] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [pendingClients, setPendingClients] = useState<HVACClient[]>([]);
  const [submitError, setSubmitError] = useState("");

  // PayPal Checkout Form States
  const [checkoutName, setCheckoutName] = useState("Gulf Stream AC & Heating");
  const [checkoutZipCode, setCheckoutZipCode] = useState("75201");
  const [checkoutDomain, setCheckoutDomain] = useState("gulfstreamac.com");
  const [checkoutCity, setCheckoutCity] = useState("Dallas");
  const [checkoutPhone, setCheckoutPhone] = useState("(214) 555-0199");
  const [selectedTier, setSelectedTier] = useState<"static" | "ai-adaptive">("ai-adaptive");
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [checkoutLog, setCheckoutLog] = useState<string[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<number>(0);

  // UI state
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [logsEndRef, setLogsEndRef] = useState<HTMLDivElement | null>(null);

  // Trigger autonomous weather pipeline
  const triggerPipeline = async (cityToRun: string) => {
    try {
      setIsPolling(true);
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: cityToRun, delayMs: 1500 }),
      });
      const data = await res.json();
      if (data.runId) {
        setActiveRunId(data.runId);
      }
    } catch (err) {
      console.error("Error starting pipeline:", err);
      setIsPolling(false);
    }
  };

  const [queueMode, setQueueMode] = useState<"simulated" | "monolithic" | "gcp-tasks" | "github-actions">("simulated");

  // Trigger autonomous meteorological sync cron across all cities
  const triggerMeteorologicalSync = async (mode: "simulated" | "monolithic" | "gcp-tasks" | "github-actions") => {
    if (mode === "github-actions") {
      return;
    }
    try {
      setIsPolling(true);
      const res = await fetch("/api/pipeline/sync-weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ async: true, queueMode: mode }),
      });
      const data = await res.json();
      // OnSnapshot automatically sets the active runId once Firestore commits
    } catch (err) {
      console.error("Error starting full meteorological sync:", err);
      setIsPolling(false);
    }
  };

  // Delete client domain
  const deleteClient = async (domain: string) => {
    if (!confirm(`Are you sure you want to de-register ${domain}?`)) return;
    try {
      const res = await fetch(`/api/clients/${domain}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedClient?.domain === domain) {
          setSelectedClient(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete client:", err);
    }
  };

  // Register new client
  const registerClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!newClientDomain || !newClientName || !newClientPhone) {
      setSubmitError("Please fill out all required fields.");
      return;
    }

    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(newClientDomain)) {
      setSubmitError("Please enter a valid domain name (e.g. business.com)");
      return;
    }

    try {
      const tempClient: HVACClient = {
        domain: newClientDomain,
        businessName: newClientName,
        city: newClientCity,
        phone: newClientPhone,
        isrUrl: newClientIsr || undefined,
        isrSecret: newClientSecret || undefined,
        createdAt: new Date().toISOString()
      };
      setPendingClients(prev => [...prev, tempClient]);
      setIsAdding(false);

      const payload = {
        domain: newClientDomain,
        businessName: newClientName,
        city: newClientCity,
        phone: newClientPhone,
        isrUrl: newClientIsr || undefined,
        isrSecret: newClientSecret || undefined,
      };

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setPendingClients(prev => prev.filter(p => p.domain !== tempClient.domain));
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to save client.");
      }

      // Reset form
      setNewClientDomain("");
      setNewClientName("");
      setNewClientPhone("");
      setNewClientIsr("");
      setNewClientSecret("");
      setIsAdding(false);
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred.");
    }
  };

  // Handle Simulated PayPal Checkout Webhook trigger
  const handlePayPalSubscriptionSimulate = async () => {
    setIsSubmittingCheckout(true);
    setCheckoutStep(1); // Verifying payment...
    setCheckoutLog([`[PAYPAL SDK] Initializing payment session...`]);

    const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

    try {
      await wait(800);
      setCheckoutLog(prev => [...prev, `[PAYPAL SDK] Customer approved subscription.`]);
      setCheckoutStep(2); // Analyzing territory data...
      
      const mockTxId = `tx_mock_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
      const mockTime = new Date().toISOString();
      const mockSig = `sig_mock_${Math.random().toString(36).substring(2, 24)}`;
      const mockCertUrl = "https://api.paypal.com/v1/certs/mock-cert-bundle.pem";

      await wait(600);
      setCheckoutStep(3); // Generating dynamic layout...

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
          event_type: "BILLING.SUBSCRIPTION.ACTIVATED",
          resource: {
            custom_id: JSON.stringify({
              businessName: checkoutName,
              zipCode: checkoutZipCode
            })
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP Status ${res.status}`);
      }

      setCheckoutStep(4); // Deploying to edge...
      await wait(1000);

      const data = await res.json();
      setCheckoutStep(5); // Complete!
      
      setTimeout(() => setActiveTab("tenants"), 2000);

    } catch (err: any) {
      setCheckoutLog(prev => [...prev, `[ERROR] ${err.message}`]);
      setCheckoutStep(-1);
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  // Subscribe to multi-tenant clients/registrants in Firestore in real-time
  useEffect(() => {
    const clientsQuery = query(collection(db, "clients"));
    const unsubscribe = onSnapshot(clientsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as HVACClient);
      setClients(data);
      setPendingClients(prev => prev.filter(p => !data.some(d => d.domain === p.domain)));
      if (data.length > 0) {
        setSelectedClient(prev => {
          if (!prev) return data[0];
          const matched = data.find(c => c.domain === prev.domain);
          return matched || data[0];
        });
      }
    }, (error) => {
      console.error("Error in clients real-time subscription:", error);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to pipeline runs collection in Firestore in real-time
  useEffect(() => {
    const runsQuery = query(collection(db, "runs"));
    const unsubscribe = onSnapshot(runsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as PipelineRun);
      // Sort in-memory descending by startedAt to avoid needing compound Firestore index
      data.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
      setRuns(data);
    }, (error) => {
      console.error("Error in runs real-time subscription:", error);
    });
    return () => unsubscribe();
  }, []);

  // Sync activeRun details when the runs directory or selected activeRunId changes
  useEffect(() => {
    if (runs.length > 0) {
      if (activeRunId) {
        const current = runs.find(r => r.id === activeRunId);
        if (current) {
          setActiveRun(current);
          setIsPolling(current.status === "running");
        }
      } else {
        setActiveRunId(runs[0].id);
        setActiveRun(runs[0]);
        setIsPolling(runs[0].status === "running");
      }
    }
  }, [runs, activeRunId]);

  // Initial load: Fetch API and API Key status info
  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => setHasRealApiKey(data.hasRealApiKey))
      .catch((err) => console.error("Error fetching API status:", err));
  }, []);

  // Scroll to bottom of terminal when logs update
  useEffect(() => {
    if (logsEndRef) {
      logsEndRef.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeRun?.logs?.length]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Google Cloud Function Code Strings for copying
  const cloudFunctionCode = `/**
 * Google Cloud Function (2nd Gen) - Autonomous Webmaster Weather Pipeline
 * Triggered by Cloud Scheduler every 12 hours (e.g., cron: "0 */12 * * *")
 * or via secure webhook requests.
 * 
 * Target: Queries Firestore tenants, resolves weather metrics, 
 * generates strict schema-validated copywriting with Gemini 3.5, 
 * and triggers isolated Next.js ISR revalidation.
 */

const { Firestore } = require("@google-cloud/firestore");
const { GoogleGenAI, Type } = require("@google/genai");
const fetch = require("node-fetch"); // Use standard fetch or native fetch in Node 18+

// Initialize SDKs
const db = new Firestore();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

exports.weatherWebmasterPipeline = async (req, res) => {
  // Support both GET query or POST payload for city parameters
  const city = req.query.city || (req.body && req.body.city);
  if (!city) {
    return res.status(400).send("Error: 'city' parameter is required.");
  }

  console.log(\`Starting weather-revalidation pipeline for city: \${city}\`);

  try {
    // 1. Query Firestore for clients situated in this city
    // Next.js Multi-tenant mapping uses domain names as document IDs
    const clientsRef = db.collection("hvac-clients");
    const snapshot = await clientsRef.where("city", "==", city).get();

    if (snapshot.empty) {
      console.log(\`No multi-tenant HVAC clients active in city: \${city}\`);
      return res.status(200).send(\`Finished: 0 clients found in \${city}\`);
    }

    const clients = [];
    snapshot.forEach(doc => {
      clients.push({ domain: doc.id, ...doc.data() });
    });

    console.log(\`Identified \${clients.length} matching tenants in \${city}.\`);

    // 2. Fetch Live atmospheric metrics from Open-Meteo
    // First, geocode the city to resolve coordinates safely
    const geoUrl = \`https://geocoding-api.open-meteo.com/v1/search?name=\${encodeURIComponent(city)}&count=1&language=en&format=json\`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(\`Geocode failed for city: \${city}\`);
    }
    const { latitude, longitude, name: canonicalCity } = geoData.results[0];

    const weatherUrl = \`https://api.open-meteo.com/v1/forecast?latitude=\${latitude}&longitude=\${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&temperature_unit=fahrenheit\`;
    const weatherRes = await fetch(weatherUrl);
    const rawWeather = await weatherRes.json();
    
    const weatherMetrics = {
      temp: rawWeather.current.temperature_2m,
      humidity: rawWeather.current.relative_humidity_2m,
      condition: rawWeather.current.weather_code >= 95 ? "Severe Storms" : "Normal Readings"
    };

    console.log(\`Weather fetched successfully for \${canonicalCity}: \${weatherMetrics.temp}°F\`);

    // 3. Process Multi-Tenant updates SEQUENTIALLY to mitigate API rate-limits (HTTP 429)
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      console.log(\`[Sequence \${i + 1}/\${clients.length}] Processing tenant: \${client.domain}\`);

      // Throttle delay of 1.5 seconds between subsequent client iterations
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      try {
        // Enforce schemas natively using the API's responseSchema configuration
        const prompt = \`
          You are 'The Living Website' Autonomous AI Webmaster. Update homepages for HVAC client "\${client.businessName}" in \${client.city}.
          Weather: \${weatherMetrics.temp}°F, \${weatherMetrics.condition}, \${weatherMetrics.humidity}% Humidity.
          Contact: \${client.phone}
        \`;

        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            heroTitle: { type: Type.STRING },
            heroSubtitle: { type: Type.STRING },
            alertBanner: { type: Type.STRING },
            seoHeading: { type: Type.STRING },
            seoArticle: { type: Type.STRING },
            promotions: { type: Type.ARRAY, items: { type: Type.STRING } },
            cacheTags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["heroTitle", "heroSubtitle", "alertBanner", "seoHeading", "seoArticle", "promotions", "cacheTags"]
        };

        const result = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.7,
          }
        });

        const weatherCopy = JSON.parse(result.text.trim());

        // Save generated copy back into Firestore under tenant's domain doc ID
        await db.collection("hvac-clients").doc(client.domain).update({
          lastWeatherCopy: weatherCopy,
          lastUpdated: new Date().toISOString()
        });

        console.log(\`Committed Firestore mutations for \${client.domain}\`);

        // 4. Trigger Next.js ISR. Wrap request in an isolated try/catch block
        // to prevent a single client failure from breaking the entire sequential pipeline.
        console.log(\`Dispatching Next.js revalidation call to \${client.isrUrl}\`);
        
        try {
          // Absolute timeout configuration (4 seconds)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const isrRes = await fetch(client.isrUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": \`Bearer \${client.isrSecret}\`
            },
            body: JSON.stringify({
              tags: weatherCopy.cacheTags,
              weatherCopy: weatherCopy
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!isrRes.ok) {
            throw new Error(\`HTTP Status \${isrRes.status}\`);
          }

          console.log(\`[ISR SUCCESS] Tenant \${client.domain} revalidated successfully.\`);
          successCount++;
        } catch (isrError) {
          console.warn(\`[ISR FAILURE] Non-blocking exception on \${client.domain}: \`, isrError.message);
          failCount++;
        }

      } catch (clientError) {
        console.error(\`[CRITICAL CLIENT ERROR] Failed to process tenant \${client.domain}: \`, clientError.message);
        failCount++;
      }
    }

    res.status(200).send({
      message: "Pipeline completed successfully.",
      city,
      totalClients: clients.length,
      successes: successCount,
      failures: failCount
    });

  } catch (globalError) {
    console.error("Fatal pipeline crash: ", globalError.message);
    res.status(500).send(\`Fatal Server Exception: \${globalError.message}\`);
  }
};`;

  const packageJsonCode = `{
  "name": "autonomous-weather-webmaster",
  "version": "1.0.0",
  "description": "Production Google Cloud Function weather revalidation backend",
  "main": "index.js",
  "dependencies": {
    "@google-cloud/firestore": "^7.5.0",
    "@google/genai": "^2.4.0",
    "node-fetch": "^2.7.0"
  }
}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Global Header */}
      <header className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tight text-xl text-slate-900">
            Living Website <span className="text-blue-600 font-sans">Engine</span>
          </span>
        </div>

        {/* Status Indicators */}
        <div className="flex gap-8 items-center">
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold tracking-wider text-slate-500">MODE</span>
            <span className="text-xs font-semibold text-slate-800">Production</span>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold tracking-wider text-slate-500">AI ASSISTANT</span>
            <span className="text-xs font-semibold text-slate-800">Gemini 1.5 Flash</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-wider text-slate-500">API STATUS</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {hasRealApiKey ? (
                <span className="text-xs bg-sky-500/10 border border-sky-500/30 rounded px-2 py-0.5 text-sky-400 font-bold uppercase">
                  Connected
                </span>
              ) : (
                <span className="text-xs bg-amber-500/10 border border-amber-500/30 rounded px-2 py-0.5 text-amber-500 font-bold uppercase">
                  Local Sandbox
                </span>
              )}
            </div>
          </div>
          <div className="px-3 py-1 bg-blue-600/10 border border-blue-600/30 rounded text-blue-600 text-xs font-semibold">
            System Online
          </div>
        </div>
      </header>      {/* 2. Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Navigation & Primary Modules */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Module Selector Tabs */}
          <div className="bg-white border border-slate-300 shadow-sm rounded-lg p-1 flex gap-1 font-sans">
            <button
              onClick={() => setActiveTab("console")}
              className={`flex-1 py-2.5 px-4 text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all border ${
                activeTab === "console"
                  ? "bg-blue-600/10 text-blue-600 border-blue-600/30"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50"
              }`}
            >
              <Terminal className="w-4 h-4" />
              Campaign Console
            </button>
            <button
              onClick={() => setActiveTab("tenants")}
              className={`flex-1 py-2.5 px-4 text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all border ${
                activeTab === "tenants"
                  ? "bg-blue-600/10 text-blue-600 border-blue-600/30"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50"
              }`}
            >
              <Database className="w-4 h-4" />
              Client Directory ({clients.length})
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`flex-1 py-2.5 px-4 text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all border ${
                activeTab === "billing"
                  ? "bg-blue-600/10 text-blue-600 border-blue-600/30"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              PayPal Portal
            </button>
          </div>

          {/* TAB 1: Autonomous Webmaster Console */}
          {activeTab === "console" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Launcher Card - 7 cols */}
              <div className="md:col-span-7 bg-white border border-slate-300 shadow-sm p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold tracking-wider text-slate-500">Automatic Copy Optimizer</span>
                  <h2 className="text-sm font-semibold text-slate-800 mt-1 mb-3 tracking-tight">
                    Weather-Adaptive Content Control
                  </h2>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Automatically tailor your landing pages to live weather conditions. Run a test for a single city or sync your entire fleet of clients to update their sites based on current temperatures, humidity, and storm events.
                  </p>
                </div>

                <div className="flex flex-col gap-5 border-t border-slate-200 pt-4">
                  {/* Action Group 1: Single City */}
                  <div>
                    <span className="text-xs font-bold text-slate-500 font-sans tracking-wider block mb-2">
                      1. Run a Single-City Test
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={selectedCity}
                        onChange={(e) => {
                          setSelectedCity(e.target.value);
                          if (e.target.value !== "custom") setCustomCity("");
                        }}
                        className="w-full sm:flex-1 bg-white border border-slate-300 shadow-sm px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans rounded-lg min-w-0"
                        disabled={isPolling}
                      >
                        <option value="Dallas">Dallas, TX</option>
                        <option value="Phoenix">Phoenix, AZ</option>
                        <option value="Chicago">Chicago, IL</option>
                        <option value="Seattle">Seattle, WA</option>
                        <option value="custom">-- Custom City --</option>
                      </select>

                      {selectedCity === "custom" && (
                        <input
                          type="text"
                          placeholder="E.g., Las Vegas"
                          value={customCity}
                          onChange={(e) => setCustomCity(e.target.value)}
                          className="w-full sm:flex-1 bg-white border border-slate-300 shadow-sm px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans rounded-lg"
                          disabled={isPolling}
                        />
                      )}

                      <button
                        onClick={() => triggerPipeline(selectedCity === "custom" ? customCity : selectedCity)}
                        disabled={isPolling || (selectedCity === "custom" && !customCity)}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-600 disabled:bg-white disabled:text-slate-500 text-white font-bold font-sans text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-all tracking-wider whitespace-nowrap"
                      >
                        {isPolling ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-white" />
                            Tuning...
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current text-white" />
                            Run Weather Sync
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action Group 2: Full Fleet Weather Cron */}
                  <div className="border-t border-slate-200/60 pt-4">
                    <span className="text-xs font-bold text-slate-500 font-sans tracking-wider block mb-2">
                      2. Sync All Clients (Fleet-wide)
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={queueMode}
                        onChange={(e) => setQueueMode(e.target.value as any)}
                        className="w-full sm:flex-1 bg-white border border-slate-300 shadow-sm px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-sans rounded-lg min-w-0"
                        disabled={isPolling}
                      >
                        <option value="simulated">Local Simulated Queue (100% Free - No GCP Setup)</option>
                        <option value="github-actions">GitHub Actions Cron (100% Free - Production Grade)</option>
                        <option value="monolithic">Sequential Pool (Monolithic loop)</option>
                        <option value="gcp-tasks">GCP Cloud Tasks (Requires GCP Billing)</option>
                      </select>

                      <button
                        onClick={() => triggerMeteorologicalSync(queueMode)}
                        disabled={isPolling || queueMode === "github-actions"}
                        className={`w-full sm:w-auto font-bold font-sans text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all tracking-wider whitespace-nowrap ${
                          queueMode === "github-actions"
                            ? "bg-white text-slate-500 cursor-not-allowed border border-slate-200 shadow-sm"
                            : "bg-sky-500 hover:bg-sky-400 text-white cursor-pointer"
                        }`}
                      >
                        {isPolling ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Queuing...
                          </>
                        ) : queueMode === "github-actions" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            External Cron Active
                          </>
                        ) : (
                          <>
                            <Activity className="w-3 h-3" />
                            Sync All Clients
                          </>
                        )}
                      </button>
                    </div>
                    {queueMode === "github-actions" ? (
                      <div className="mt-4 p-4 bg-slate-50 border border-sky-500/30 font-sans text-xs text-slate-700 space-y-3">
                        <div className="flex items-center gap-2 text-sky-400 font-bold tracking-wider border-b border-slate-200 pb-1.5">
                          <Terminal className="w-4 h-4 text-sky-400" />
                          <span>Enterprise Hybrid-Cloud Orchestrator</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-500">
                          To run fleet synchronization completely for <span className="text-blue-600 font-bold">free</span> without hitting Cloud Run CPU limits or paying for Google Cloud Tasks, configure these secrets in your <span className="text-slate-900 font-bold">GitHub Repository Settings &rarr; Secrets and Variables &rarr; Actions</span>:
                        </p>
                        <ul className="space-y-2 text-xs border-y border-slate-200/80 py-2">
                          <li className="flex flex-col gap-0.5">
                            <span className="text-slate-900 font-bold font-sans">1. FIREBASE_SERVICE_ACCOUNT_KEY</span>
                            <span className="text-slate-500">Your Firebase Admin private key JSON string (enables the GitHub Action to securely query registered clients).</span>
                          </li>
                          <li className="flex flex-col gap-0.5">
                            <span className="text-slate-900 font-bold font-sans">2. APP_BASE_URL</span>
                            <span className="text-slate-500">Your Cloud Run base address (e.g., <code className="text-sky-300">https://your-app-url.com</code>).</span>
                          </li>
                          <li className="flex flex-col gap-0.5">
                            <span className="text-slate-900 font-bold font-sans">3. TASK_WORKER_SECRET</span>
                            <span className="text-slate-500">A secure secret token matching your server env to shield the mutation endpoint.</span>
                          </li>
                        </ul>
                        <div className="bg-blue-600/10 border-l-2 border-blue-600 p-2.5 text-xs text-blue-800 leading-relaxed">
                          ⚡ <strong>How it works:</strong> The GitHub workflow runs twice daily on GitHub's infrastructure. It fetches clients, resolves weather, and updates landing pages sequentially for each client.
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 font-sans mt-2 leading-relaxed">
                        * Local Simulated mode is <span className="text-blue-600 font-bold">100% free with no Google Cloud account required</span>, spawning background task workers instantly.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Gemini & Capacity block - 5 cols */}
              <div className="md:col-span-5 bg-white border border-slate-300 shadow-sm p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold tracking-wider text-slate-500">Gemini AI Engine Settings</span>
                  <div className="mt-2.5 p-3.5 bg-blue-600/10 border-l-2 border-blue-600 text-xs leading-relaxed text-blue-800 font-sans">
                    Strict JSON schema enforcement is active. The AI output is structured and validated automatically to ensure flawless landing page updates.
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold tracking-wider text-slate-500">Queue Capacity</span>
                    <div className="flex items-end gap-1 mt-1">
                      <span className="metric-val text-slate-900">98.4</span>
                      <span className="text-xs mb-1 text-slate-500 font-sans">%</span>
                    </div>
                    <div className="w-full h-3.5 grid grid-cols-10 gap-0.5 mt-2">
                      <div className="bg-blue-600"></div>
                      <div className="bg-blue-600"></div>
                      <div className="bg-blue-600"></div>
                      <div className="bg-blue-600"></div>
                      <div className="bg-blue-600"></div>
                      <div className="bg-blue-600"></div>
                      <div className="bg-blue-600"></div>
                      <div className="bg-blue-600"></div>
                      <div className="bg-blue-600"></div>
                      <div className="bg-white"></div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold tracking-wider text-slate-500">Request Interval</span>
                      <div className="flex items-end gap-1 mt-0.5">
                        <span className="text-lg font-light font-sans text-slate-900">1500</span>
                        <span className="text-xs text-slate-500 font-sans">MS</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold tracking-wider text-slate-500">Weather API Latency</span>
                      <div className="flex items-end gap-1 mt-0.5">
                        <span className="text-lg font-light font-sans text-slate-900">42</span>
                        <span className="text-xs text-slate-500 font-sans">MS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Terminal Terminal Console - 12 cols */}
              <div className="md:col-span-12 bg-white border border-slate-300 shadow-sm flex flex-col">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold tracking-wider text-slate-500">DevOps Logs Terminal</span>
                  </div>
                  {activeRun && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-sans bg-white px-2 py-0.5 border border-slate-200 shadow-sm text-slate-500">
                        ID: {activeRun.id}
                      </span>
                      <span className={`text-xs font-sans px-2 py-0.5 rounded-lg font-bold border ${
                        activeRun.status === "running" ? "bg-sky-500/10 text-sky-400 border-sky-500/20 animate-pulse" :
                        activeRun.status === "completed" ? "bg-blue-600/10 text-blue-600 border-blue-600/20" :
                        "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {activeRun.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pipeline Metrics Summary */}
                {activeRun && (
                  <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50/40 text-center text-xs font-sans py-2.5 text-slate-500">
                    <div className="border-r border-slate-200">
                      <div className="text-[10px] text-slate-500 tracking-wider">Total Clients</div>
                      <div className="font-semibold text-slate-800 mt-0.5">{activeRun.totalClients} domains</div>
                    </div>
                    <div className="border-r border-slate-200">
                      <div className="text-[10px] text-slate-500 tracking-wider">Processed</div>
                      <div className="font-semibold text-sky-400 mt-0.5">{activeRun.processedClients}</div>
                    </div>
                    <div className="border-r border-slate-200">
                      <div className="text-[10px] text-slate-500 tracking-wider">Revalidated</div>
                      <div className="font-semibold text-blue-600 mt-0.5">{activeRun.successfulClients}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 tracking-wider">Bypassed</div>
                      <div className="font-semibold text-amber-500 mt-0.5">{activeRun.failedClients}</div>
                    </div>
                  </div>
                )}

                {/* Shell Logs Canvas */}
                <div className="bg-slate-50 p-5 min-h-[300px] max-h-[450px] overflow-y-auto font-sans text-xs flex flex-col gap-2 relative">
                  {!activeRun ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-2">
                      <Terminal className="w-8 h-8 text-slate-800" />
                      <p className="text-center text-xs max-w-sm text-slate-500">No active execution logs. Run the weather webmaster pipeline to stream real-time events.</p>
                    </div>
                  ) : (
                    <>
                      {activeRun.logs.map((log: PipelineLog, idx: number) => {
                        let textClass = "text-slate-700";
                        let tagClass = "text-slate-500";
                        if (log.level === "success") {
                          textClass = "text-blue-600 font-medium";
                          tagClass = "text-emerald-600";
                        } else if (log.level === "warn") {
                          textClass = "text-amber-400";
                          tagClass = "text-amber-600";
                        } else if (log.level === "error") {
                          textClass = "text-rose-400 font-semibold";
                          tagClass = "text-rose-600";
                        }

                        return (
                          <div key={idx} className="flex gap-2.5 items-start leading-relaxed animate-fadeIn">
                            <span className="text-slate-500 select-none text-xs font-medium shrink-0 pt-0.5">{log.timestamp}</span>
                            <span className={`font-bold select-none shrink-0 ${tagClass}`}>
                              [{log.level}]
                            </span>
                            <span className={`flex-1 ${textClass}`}>{log.message}</span>
                          </div>
                        );
                      })}
                      <div ref={(el) => setLogsEndRef(el)}></div>
                    </>
                  )}
                </div>
              </div>

              {/* Try/Catch Resiliency - 4 cols */}
              <div className="md:col-span-4 bg-white border border-slate-300 shadow-sm p-5 flex flex-col justify-between">
                <span className="text-xs font-semibold tracking-wider text-slate-500">System Reliability</span>
                <div className="mt-4 grid grid-cols-2 gap-4 flex-1">
                  <div className="border border-slate-200 shadow-sm p-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 font-sans">Error Coverage</span>
                      <div className="text-lg font-sans text-slate-900 mt-1">100%</div>
                    </div>
                    <div className="h-1 w-full bg-blue-600 mt-2"></div>
                  </div>
                  <div className="border border-slate-200 shadow-sm p-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 font-sans">Client Protection</span>
                      <div className="text-lg font-sans text-slate-900 mt-1">ENABLED</div>
                    </div>
                    <div className="h-1 w-full bg-blue-600 mt-2"></div>
                  </div>
                </div>
              </div>

              {/* Analytics - 8 cols */}
              <div className="md:col-span-8 bg-white border border-slate-300 shadow-sm p-5 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold tracking-wider text-slate-500">Weather Sync Activity (Last 12 Hours)</span>
                  <div className="flex gap-4 font-sans text-[10px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>Temperature Data</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <span>Generated Content</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex items-end gap-1.5 px-2 pb-2 h-24">
                  <div className="w-full bg-blue-500/20 hover:bg-blue-500/40 transition-colors" style={{ height: "30%" }}></div>
                  <div className="w-full bg-blue-50 hover:bg-blue-100 hover:bg-blue-600/40 transition-colors" style={{ height: "45%" }}></div>
                  <div className="w-full bg-blue-500/20 hover:bg-blue-500/40 transition-colors" style={{ height: "25%" }}></div>
                  <div className="w-full bg-blue-50 hover:bg-blue-100 hover:bg-blue-600/40 transition-colors" style={{ height: "60%" }}></div>
                  <div className="w-full bg-blue-500/20 hover:bg-blue-500/40 transition-colors" style={{ height: "40%" }}></div>
                  <div className="w-full bg-blue-50 hover:bg-blue-100 hover:bg-blue-600/40 transition-colors" style={{ height: "70%" }}></div>
                  <div className="w-full bg-blue-500/20 hover:bg-blue-500/40 transition-colors" style={{ height: "55%" }}></div>
                  <div className="w-full bg-blue-50 hover:bg-blue-100 hover:bg-blue-600/40 transition-colors" style={{ height: "85%" }}></div>
                  <div className="w-full bg-blue-500/20 hover:bg-blue-500/40 transition-colors" style={{ height: "30%" }}></div>
                  <div className="w-full bg-blue-50 hover:bg-blue-100 hover:bg-blue-600/40 transition-colors" style={{ height: "90%" }}></div>
                  <div className="w-full bg-blue-500/20 hover:bg-blue-500/40 transition-colors" style={{ height: "20%" }}></div>
                  <div className="w-full bg-blue-50 hover:bg-blue-100 hover:bg-blue-600/40 transition-colors" style={{ height: "45%" }}></div>
                  <div className="w-full bg-blue-500/20 hover:bg-blue-500/40 transition-colors" style={{ height: "35%" }}></div>
                  <div className="w-full bg-blue-50 hover:bg-blue-100 hover:bg-blue-600/40 transition-colors" style={{ height: "80%" }}></div>
                </div>
              </div>

              {/* History Table - 12 cols */}
              <div className="md:col-span-12 bg-white border border-slate-300 shadow-sm">
                <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-semibold tracking-wider text-slate-500">Activity History</h3>
                  <span className="text-xs text-slate-500 font-sans">Execution History Logs</span>
                </div>
                <div className="divide-y divide-slate-800 max-h-[180px] overflow-y-auto">
                  {runs.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 font-sans">No historical sync tasks have run yet.</div>
                  ) : (
                    runs.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          setActiveRunId(r.id);
                          setActiveRun(r);
                        }}
                        className={`px-5 py-3 flex items-center justify-between text-xs cursor-pointer hover:bg-white/50 transition-all border-b border-slate-200 last:border-b-0 ${
                          activeRunId === r.id ? "bg-white font-semibold" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Activity className={`w-4 h-4 ${r.status === "completed" ? "text-blue-600" : r.status === "failed" ? "text-rose-500" : "text-sky-500 animate-pulse"}`} />
                          <div>
                            <div className="font-sans text-slate-700">Run for: <span className="text-blue-600">{r.city}</span></div>
                            <div className="text-xs text-slate-500 font-sans mt-0.5">Started: {new Date(r.startedAt).toLocaleTimeString()}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right text-xs font-sans text-slate-500 hidden sm:block">
                            {r.successfulClients}/{r.totalClients} Success
                          </div>
                          <span className={`text-[10px] font-sans font-bold px-2 py-0.5 border ${
                            r.status === "completed" ? "bg-blue-600/10 text-blue-600 border-blue-600/20" :
                            r.status === "running" ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
                            "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}>
                            {r.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}          {/* TAB 2: Multi-Tenant Registrar */}
          {activeTab === "tenants" && (
            <div className="flex flex-col gap-6">
              
              {/* Add Client Header */}
              <div className="bg-white border border-slate-300 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs font-semibold tracking-wider text-slate-500">Client Directory</span>
                    <h2 className="text-sm font-semibold text-slate-800 mt-1">Registered Client Domains</h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">
                      Register and manage your clients' web domains. Adding a client here creates their custom dashboard, allowing the weather-adaptive system to dynamically tailor their landing pages.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-white hover:bg-white text-slate-800 px-4 py-2 text-xs font-semibold tracking-wider flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-sm rounded-lg font-sans"
                  >
                    <Plus className={`w-3.5 h-3.5 transition-transform ${isAdding ? "rotate-45" : ""}`} />
                    {isAdding ? "Close Form" : "Add New Client"}
                  </button>
                </div>

                {/* Add Form Collapsible */}
                {isAdding && (
                  <form onSubmit={registerClient} className="border-t border-slate-200 pt-5 mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {submitError && (
                      <div className="col-span-1 md:col-span-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 p-3 rounded-lg text-xs flex items-center gap-2 font-sans">
                        <AlertTriangle className="w-4 h-4" />
                        {submitError}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-xs font-sans text-slate-500 mb-1.5">Client Domain URL (e.g. hendersonhvac.com) *</label>
                      <input
                        type="text"
                        placeholder="E.g., hendersonhvac.com"
                        value={newClientDomain}
                        onChange={(e) => setNewClientDomain(e.target.value.toLowerCase())}
                        className="w-full bg-white border border-slate-300 shadow-sm rounded-md px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans text-slate-500 mb-1.5">Business Name *</label>
                      <input
                        type="text"
                        placeholder="E.g., Henderson HVAC Services"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="w-full bg-white border border-slate-300 shadow-sm rounded-md px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans text-slate-500 mb-1.5">Service City *</label>
                      <select
                        value={newClientCity}
                        onChange={(e) => setNewClientCity(e.target.value)}
                        className="w-full bg-white border border-slate-300 shadow-sm rounded-md px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                      >
                        <option value="Dallas">Dallas</option>
                        <option value="Phoenix">Phoenix</option>
                        <option value="Chicago">Chicago</option>
                        <option value="Seattle">Seattle</option>
                        <option value="Las Vegas">Las Vegas</option>
                        <option value="New York">New York</option>
                        <option value="Miami">Miami</option>
                        <option value="Denver">Denver</option>
                        <option value="Minneapolis">Minneapolis</option>
                        <option value="Atlanta">Atlanta</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-sans text-slate-500 mb-1.5">Phone Number / Hotline *</label>
                      <input
                        type="text"
                        placeholder="E.g., (214) 555-0192"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        className="w-full bg-white border border-slate-300 shadow-sm rounded-md px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans text-slate-500 mb-1.5">Webmaster Revalidation URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="E.g., https://clientdomain.com/api/revalidate"
                        value={newClientIsr}
                        onChange={(e) => setNewClientIsr(e.target.value)}
                        className="w-full bg-white border border-slate-300 shadow-sm rounded-md px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans text-slate-500 mb-1.5">Security Token (Optional)</label>
                      <input
                        type="text"
                        placeholder="E.g., sec_client_reval_983"
                        value={newClientSecret}
                        onChange={(e) => setNewClientSecret(e.target.value)}
                        className="w-full bg-white border border-slate-300 shadow-sm rounded-md px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2 flex justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 font-sans"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-600 text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer font-sans tracking-wider"
                      >
                        Save Client Domain
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Tenants Grid/List */}
              <div className="bg-white border border-slate-300 shadow-sm overflow-hidden">
                
                {clients.length === 0 && pendingClients.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                      <Globe className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">No clients registered</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                      Add your first client to provision their dashboard and enable weather-adaptive landing pages.
                    </p>
                    <button
                      onClick={() => setIsAdding(true)}
                      className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-6 py-2.5 rounded-lg text-xs font-semibold font-sans transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add your first client
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-xs font-sans text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Client Domain</th>
                      <th className="px-6 py-4">Business Name</th>
                      <th className="px-6 py-4">City</th>
                      <th className="px-6 py-4">Phone Hotline</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {clients.map((c) => (
                      <tr
                        key={c.domain}
                        onClick={() => setSelectedClient(c)}
                        className={`hover:bg-slate-50 cursor-pointer transition-all ${
                          selectedClient?.domain === c.domain ? "bg-slate-50 font-semibold text-slate-900" : ""
                        }`}
                      >
                        <td className="px-6 py-4 font-sans text-blue-600 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-500" />
                          {c.domain}
                        </td>
                        <td className="px-6 py-4 text-slate-800">{c.businessName}</td>
                        <td className="px-6 py-4">
                          <span className="bg-white border border-slate-200 shadow-sm px-2 py-0.5 rounded-lg text-slate-700 font-sans text-xs">
                            {c.city}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-sans text-slate-500">{c.phone}</td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => deleteClient(c.domain)}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                            title="De-register domain"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pendingClients.map((c) => (
                      <tr
                        key={c.domain}
                        className="opacity-50 pointer-events-none"
                      >
                        <td className="px-6 py-4 font-sans text-blue-600 flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                          {c.domain}
                        </td>
                        <td className="px-6 py-4 text-slate-800">{c.businessName}</td>
                        <td className="px-6 py-4">
                          <span className="bg-white border border-slate-200 shadow-sm px-2 py-0.5 rounded-lg text-slate-700 font-sans text-xs">
                            {c.city}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-sans text-slate-500">{c.phone}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs text-slate-400 italic">Syncing...</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 3: PayPal SaaS Onboarding & Subscription Portal */}
          {activeTab === "billing" && (
            <div className="flex flex-col gap-6">
              {/* Concept Block */}
              <div className="bg-white border border-slate-300 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                    <h3 className="font-sans text-xs font-bold tracking-widest text-slate-800">
                      SaaS Billing Integration
                    </h3>
                  </div>
                  <span className="font-sans text-xs text-blue-600 bg-blue-600/10 px-2 py-0.5 border border-blue-600/20 tracking-wider">
                    Secure Gateway Connected
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Our service platform is fully integrated with PayPal for automated client registration. 
                  Rather than manual setup, business owners subscribe directly via PayPal buttons on your sales page. 
                  Our secure webhook handler at <code className="text-blue-600 font-sans">/api/webhooks/paypal</code> immediately 
                  receives the subscription details and automatically provisions their dynamic website and theme.
                </p>

                <div className="bg-slate-50 p-4 border border-slate-200 shadow-sm font-sans text-xs leading-relaxed text-slate-500">
                  <div className="text-slate-500 mb-1 font-bold">Automated Provisioning Flow:</div>
                  <div>[Customer Checkout] &mdash;(PayPal Smart Button)&mdash;&gt; [PayPal API Gateway]</div>
                  <div className="pl-44">&lsquo;&mdash;&mdash;&mdash;(Secure Webhook POST) &mdash;&mdash;&mdash;&gt; [/api/webhooks/paypal]</div>
                  <div className="pl-96">&lsquo;&mdash;&mdash;&mdash;&gt; [Client Website Dashboard Provisioned]</div>
                </div>
              </div>

              {/* Form & Sandbox Terminal */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Simulation Form */}
                <div className="md:col-span-7 bg-white border border-slate-300 shadow-sm p-6 flex flex-col gap-5">
                  <div>
                    <h4 className="font-sans text-xs font-bold text-slate-800 mb-1">
                      1. Client Checkout Details
                    </h4>
                    <p className="text-xs text-slate-500">
                      Enter the client's business details to test our checkout. The system will use PayPal's secure payload pass-through to register the domain dynamically upon payment.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                      <label className="text-xs font-sans text-slate-500">Business Name</label>
                      <input
                        type="text"
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        placeholder="e.g. Gulf Stream AC & Heating"
                        className="w-full bg-white border border-slate-300 shadow-sm rounded-md px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                      <label className="text-xs font-sans text-slate-500">Checkout ZIP Code</label>
                      <input
                        type="text"
                        value={checkoutZipCode}
                        onChange={(e) => setCheckoutZipCode(e.target.value)}
                        placeholder="e.g. 75201"
                        className="w-full bg-white border border-slate-300 shadow-sm rounded-md px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                      />
                    </div>
                    <div className="col-span-2 bg-slate-50 p-3 border border-slate-200 rounded">
                      <div className="flex items-center gap-1.5 text-xs font-sans text-blue-600 font-bold mb-1">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                        AI-Powered Client Setup Active
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        To simplify onboarding, only Name and ZIP are required. The system automatically launches Gemini to resolve vertical (e.g. Roofing, Plumbing), map territory cities, design visual themes, and define dynamic meteorological triggers.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 my-2"></div>

                  {/* PayPal Buttons */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-sans text-xs font-bold text-slate-700 uppercase mb-1">Select Subscription Tier</label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedTier("static")}
                          className={`flex-1 border p-3 rounded text-left transition-all ${
                            selectedTier === "static" ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="text-sm font-semibold text-slate-800">Static</div>
                          <div className="text-xs text-slate-500 mt-1">Standard template</div>
                          <div className="text-sm font-bold text-slate-700 mt-2">$49 / month</div>
                        </button>
                        <button
                          onClick={() => setSelectedTier("ai-adaptive")}
                          className={`flex-1 border p-3 rounded text-left transition-all ${
                            selectedTier === "ai-adaptive" ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="text-sm font-semibold text-slate-800">AI-Adaptive</div>
                          <div className="text-xs text-slate-500 mt-1">Dynamic vertical matching</div>
                          <div className="text-sm font-bold text-slate-700 mt-2">$199 / month</div>
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs mt-2">
                      <span className="font-sans text-xs text-slate-500">Product ID: {selectedTier === "static" ? "LIVING-OS-STATIC" : "LIVING-OS-ADAPTIVE"}</span>
                      <span className="font-bold text-slate-700 font-sans">{selectedTier === "static" ? "$49" : "$199"} / month</span>
                    </div>

                    <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", components: "buttons", currency: "USD" }}>
                      <PayPalButtons 
                        style={{ layout: "vertical" }}
                        disabled={isSubmittingCheckout || !checkoutName || !checkoutZipCode}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                              {
                                amount: {
                                  value: selectedTier === "static" ? "49.00" : "199.00",
                                  currency_code: "USD"
                                },
                                description: `Living OS Subscription - ${selectedTier === "static" ? "Static" : "AI-Adaptive"}`,
                                custom_id: JSON.stringify({
                                  businessName: checkoutName,
                                  zipCode: checkoutZipCode,
                                  tier: selectedTier
                                })
                              }
                            ]
                          });
                        }}
                        onApprove={async (data, actions) => {
                          if (!actions.order) return;
                          
                          setIsSubmittingCheckout(true);
                          setCheckoutStep(1); // Verifying payment...
                          setCheckoutLog([`[PAYPAL SDK] Initializing payment session...`]);

                          try {
                            const details = await actions.order.capture();
                            setCheckoutLog(prev => [...prev, `[PAYPAL SDK] Customer approved payment. Transaction ID: ${details.id}`]);
                            setCheckoutStep(2); // Analyzing territory data...
                            
                            // Note: In a real production flow, your backend webhook (/api/webhooks/paypal) 
                            // would receive the event and asynchronously provision the client.
                            // To simulate that same async backend experience here on the frontend quickly:
                            const mockTxId = details.id;
                            const mockTime = new Date().toISOString();
                            const mockSig = `sig_live_${Math.random().toString(36).substring(2, 24)}`;
                            const mockCertUrl = "https://api.paypal.com/v1/certs/mock-cert-bundle.pem";
                      
                            const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
                            await wait(600);
                            setCheckoutStep(3); // Generating dynamic layout...
                      
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
                                  custom_id: JSON.stringify({
                                    businessName: checkoutName,
                                    zipCode: checkoutZipCode
                                  })
                                }
                              })
                            });
                      
                            if (!res.ok) {
                              throw new Error(`Server returned HTTP Status ${res.status}`);
                            }
                      
                            setCheckoutStep(4); // Deploying to edge...
                            await wait(1000);
                      
                            setCheckoutStep(5); // Complete!
                            setTimeout(() => setActiveTab("tenants"), 2000);
                          } catch (err: any) {
                            setCheckoutLog(prev => [...prev, `[ERROR] ${err.message || err.toString()}`]);
                            setCheckoutStep(-1);
                          } finally {
                            setIsSubmittingCheckout(false);
                          }
                        }}
                        onError={(err) => {
                          setCheckoutLog(prev => [...prev, `[ERROR] PayPal Error: ${err.toString()}`]);
                          setCheckoutStep(-1);
                        }}
                      />
                    </PayPalScriptProvider>
                    
                    <button
                      onClick={() => handlePayPalSubscriptionSimulate()}
                      disabled={isSubmittingCheckout || !checkoutName || !checkoutZipCode}
                      className="mt-2 text-[10px] text-slate-400 hover:text-slate-600 underline text-center w-full"
                    >
                      (Or click here to run webhook simulation directly without payment)
                    </button>
                  </div>
                </div>

                {/* Live Output Console */}
                <div className="md:col-span-5 flex flex-col gap-4">
                  <div className="bg-white border border-slate-300 shadow-sm p-5 flex-1 flex flex-col gap-4 min-h-[350px]">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <span className="font-sans text-xs font-bold text-slate-500 uppercase">
                        Billing Integration Stream
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        <span className="font-sans text-[10px] text-blue-600">Ready</span>
                      </div>
                    </div>

                    {/* Logs Screen */}
                    <div className="flex-1 overflow-y-auto font-sans text-xs leading-relaxed flex flex-col gap-0 max-h-[250px] scrollbar-thin">
                      {checkoutStep === 0 && checkoutLog.length === 0 ? (
                        <div className="text-slate-500 italic">
                          No active checkout session. Fill out the business details on the left and click "PayPal Subscribe" to simulate a live secure subscription purchase flow.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6 py-2">
                          {/* Step 1 */}
                          <div className={`flex items-start gap-4 transition-opacity duration-500 ${checkoutStep >= 1 || checkoutStep === -1 ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            <div className="mt-0.5 relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 shrink-0">
                              {checkoutStep > 1 || checkoutStep === -1 ? <Check className="w-3 h-3" /> : <RefreshCw className="w-3 h-3 animate-spin" />}
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className={`font-semibold ${checkoutStep >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>Verifying payment via PayPal</span>
                              {checkoutStep === 1 && <span className="text-slate-500 text-[11px]">Contacting secure gateway...</span>}
                            </div>
                          </div>
                          
                          {/* Step 2 */}
                          <div className={`flex items-start gap-4 transition-opacity duration-500 ${checkoutStep >= 2 || checkoutStep === -1 ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            <div className="mt-0.5 relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 shrink-0">
                              {checkoutStep > 2 || checkoutStep === -1 ? <Check className="w-3 h-3" /> : <RefreshCw className="w-3 h-3 animate-spin" />}
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className={`font-semibold ${checkoutStep >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>Analyzing territory data</span>
                              {checkoutStep === 2 && <span className="text-slate-500 text-[11px]">Identifying vertical mapping and weather conditions...</span>}
                            </div>
                          </div>

                          {/* Step 3 */}
                          <div className={`flex items-start gap-4 transition-opacity duration-500 ${checkoutStep >= 3 || checkoutStep === -1 ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            <div className="mt-0.5 relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 shrink-0">
                              {checkoutStep > 3 || checkoutStep === -1 ? <Check className="w-3 h-3" /> : <RefreshCw className="w-3 h-3 animate-spin" />}
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className={`font-semibold ${checkoutStep >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>Generating dynamic layout</span>
                              {checkoutStep === 3 && <span className="text-slate-500 text-[11px]">Orchestrating AI models for copy & assets...</span>}
                            </div>
                          </div>

                          {/* Step 4 */}
                          <div className={`flex items-start gap-4 transition-opacity duration-500 ${checkoutStep >= 4 || checkoutStep === -1 ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            <div className="mt-0.5 relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 shrink-0">
                              {checkoutStep > 4 || checkoutStep === 5 ? <Check className="w-3 h-3" /> : (checkoutStep === 4 ? <RefreshCw className="w-3 h-3 animate-spin" /> : <div className="w-2 h-2 rounded-full bg-slate-300"></div>)}
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className={`font-semibold ${checkoutStep >= 4 ? 'text-slate-900' : 'text-slate-400'}`}>Deploying to edge</span>
                              {checkoutStep === 4 && <span className="text-slate-500 text-[11px]">Provisioning client dashboard...</span>}
                              {checkoutStep === 5 && <span className="text-emerald-600 font-semibold text-[11px]">Dashboard successfully provisioned! Redirecting...</span>}
                            </div>
                          </div>
                          
                          {/* Error State */}
                          {checkoutStep === -1 && (
                            <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              <div className="text-rose-600 font-sans text-xs">
                                <strong>Checkout Failed:</strong> {checkoutLog[checkoutLog.length - 1]?.replace('[ERROR] ', '')}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Webhook target info */}
                    <div className="bg-slate-50 p-3 border border-slate-850 flex items-center gap-3 text-xs">
                      <div className="text-slate-500">⚡</div>
                      <div>
                        <span className="text-xs font-sans text-slate-500 block leading-none">
                          Webhook Listener
                        </span>
                        <span className="font-sans text-xs text-blue-600">
                          POST /api/webhooks/paypal
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Interactive "Active Copwriting Preview" Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-300 shadow-sm p-5 sticky top-24 flex flex-col gap-4 rounded-lg">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold tracking-wider text-slate-500">Live Website Monitor</span>
              </div>
              <h2 className="text-sm font-semibold tracking-tight text-slate-800">Active Weather Adaptive Preview</h2>
            </div>

            {/* Selector/Fallback */}
            {selectedClient ? (
              <div className="flex flex-col gap-4">
                {/* Micro Meta-info */}
                <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-lg p-3 text-xs font-sans">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-slate-500">Domain ID:</span>
                    <span className="text-blue-600 font-semibold">{selectedClient.domain}</span>
                  </div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-slate-500">Territory:</span>
                    <span className="text-slate-700">{selectedClient.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cache Status:</span>
                    <span className="text-blue-600 font-semibold">Active ISR</span>
                  </div>
                  {selectedClient.lastUpdated && (
                    <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1.5 text-xs">
                      <span className="text-slate-600">Last Sync:</span>
                      <span className="text-slate-500">{new Date(selectedClient.lastUpdated).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>

                {/* The "Living Website" SSR Iframe Viewer */}
                <div className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white text-slate-900 shadow-inner flex flex-col h-[520px]">
                  
                  {/* Header bar representing the browser */}
                  <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex items-center gap-1.5 text-xs text-slate-500 font-sans select-none rounded-lg shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                    <span className="bg-white px-3 py-0.5 rounded-lg border border-slate-200 shadow-sm text-center flex-1 truncate text-slate-500 font-sans flex items-center justify-between">
                      <span>https://{selectedClient.domain}</span>
                      <a 
                        href={`/site/${selectedClient.domain}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-emerald-600 ml-2 text-[10px] font-bold tracking-wider"
                      >
                        Open Site &nearr;
                      </a>
                    </span>
                  </div>

                  {/* Real dynamic iframe loading the server-side-rendered site */}
                  <iframe
                    src={`/site/${selectedClient.domain}`}
                    className="w-full flex-1 border-0 bg-[#f8fafc]"
                    title={`Preview of ${selectedClient.domain}`}
                    key={selectedClient.domain + "-" + (selectedClient.lastUpdated || "initial")}
                  />
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 shadow-sm border-dashed rounded-lg p-10 text-center text-slate-500 text-xs font-sans">
                No client selected. Choose one from the list to preview their live weather-adaptive website.
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}
