import React from "react";
import { Terminal, Database, Sparkles, Users } from "lucide-react";

export interface SidebarProps {
  activeTab: "console" | "tenants" | "billing" | "leadgen";
  setActiveTab: (tab: "console" | "tenants" | "billing" | "leadgen") => void;
  clientCount: number;
}

export default function Sidebar({ activeTab, setActiveTab, clientCount }: SidebarProps) {
  return (
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
        Client Directory ({clientCount})
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
      <button
        onClick={() => setActiveTab("leadgen")}
        className={`flex-1 py-2.5 px-4 text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all border ${
          activeTab === "leadgen"
            ? "bg-blue-600/10 text-blue-600 border-blue-600/30"
            : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50"
        }`}
      >
        <Users className="w-4 h-4" />
        Lead Generator
      </button>
    </div>
  );
}
