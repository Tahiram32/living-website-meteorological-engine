import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function DemoDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#12141C] text-white p-4 font-sans">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center">
            <span className="text-2xl mr-2">☁️⚡</span>
            <span className="text-[#FFFFFF] text-xl font-bold tracking-wide">Weatherpulse</span>
          </div>
          <div className="flex-1 ml-5 bg-[#1C1F2B] rounded-lg px-3 py-2 border border-[#2A2E3F] relative">
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent border-none text-sm text-white w-full focus:outline-none placeholder-[#7A829A]"
            />
          </div>
        </div>

        <div className="text-[#7A829A] text-sm mb-4">
          <span className="text-white font-semibold text-base">Operations Dashboard</span> | May 21, 2024 - 14:35 EST
        </div>

        {/* Top Metrics - Horizontal Scroll */}
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 space-x-3 scrollbar-hide">
          <div className="bg-[#1C1F2B] p-4 rounded-xl w-48 shrink-0 border border-[#2A2E3F] shadow-[0_0_5px_rgba(255,215,0,0.2)] border-t-[#FFD700]">
            <div className="text-white text-base font-semibold mb-2">New York</div>
            <div className="text-[#7A829A] text-sm">AGI: <span className="text-[#FFD700]">65 Moderate - Yellow</span></div>
          </div>
          
          <div className="bg-[#1C1F2B] p-4 rounded-xl w-48 shrink-0 border border-[#2A2E3F] shadow-[0_0_5px_rgba(255,140,0,0.2)] border-t-[#FF8C00]">
            <div className="text-white text-base font-semibold mb-2">Atlanta</div>
            <div className="text-[#7A829A] text-sm">UV Index: <span className="text-[#FF8C00]">8 High - Orange</span></div>
          </div>
          
          <div className="bg-[#1C1F2B] p-4 rounded-xl w-48 shrink-0 border border-[#2A2E3F] shadow-[0_0_5px_rgba(0,255,127,0.2)] border-t-[#00FF7F]">
            <div className="text-white text-base font-semibold mb-2">Chicago</div>
            <div className="text-[#7A829A] text-sm">AQI: <span className="text-[#00FF7F]">32 Good - Green</span></div>
          </div>
        </div>

        {/* Alerts Panel (Stacked for Mobile) */}
        <div className="bg-[#151720] rounded-2xl p-5 border border-[#FF3366] shadow-[0_0_15px_rgba(255,51,102,0.4)]">
          <div className="flex justify-between w-full mb-4">
            <span className="text-[#7A829A] text-xs font-bold tracking-widest">ALERTS PANEL</span>
            <span className="text-[#7A829A] text-base cursor-pointer">✕</span>
          </div>
          
          <h2 className="text-white text-[26px] font-bold text-center leading-[34px] mb-5">
            Extreme <span className="text-[#00E5FF]">Weather</span><br/>
            Detected: <span className="text-[#FF3366]">1.5x<br/>Surge Pricing<br/>Activated</span>
          </h2>
          
          <div className="flex flex-col items-center mb-5">
            <span className="text-6xl mb-2">⛈️</span>
            <span className="text-[#7A829A] text-sm">14:32:01</span>
          </div>

          <div className="w-full bg-[#1C1F2B] p-4 rounded-lg space-y-1.5">
            <div className="text-[#7A829A] text-sm">Region: <span className="text-white">SE USA</span></div>
            <div className="text-[#7A829A] text-sm">Event: <span className="text-white">Severe Thunderstorms</span></div>
            <div className="text-[#7A829A] text-sm">Surge: <span className="text-white">Applied to 3 Clients</span></div>
          </div>
        </div>

        {/* Active Client Tenants */}
        <div className="flex justify-between items-center mt-2 mb-3">
          <h3 className="text-white text-base font-semibold">Active Client Tenants</h3>
        </div>
        
        <div className="bg-[#1C1F2B] p-4 rounded-xl border border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.4)] mb-3">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white text-base font-semibold">Global Logistics Inc.</span>
            <span className="text-[#7A829A] text-lg font-bold">⋮</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="bg-[#00FF7F]/10 px-3 py-1 rounded border border-[#00FF7F]">
              <span className="text-[#00FF7F] text-xs">Active</span>
            </div>
            <span className="text-[#FF3366] text-sm font-medium">14 Alerts</span>
          </div>
        </div>

        <div className="bg-[#1C1F2B] p-4 rounded-xl border border-[#FFD700] shadow-[0_0_5px_rgba(255,215,0,0.2)] mb-3">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white text-base font-semibold">Omni Solutions</span>
            <span className="text-[#7A829A] text-lg font-bold">⋮</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="bg-[#FFD700]/10 px-3 py-1 rounded border border-[#FFD700]">
              <span className="text-[#FFD700] text-xs">Warning</span>
            </div>
            <span className="text-[#FF3366] text-sm font-medium">3 Alerts</span>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-[#151720] rounded-2xl p-5 border border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.4)] h-96 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#7A829A] text-xs font-bold tracking-widest">Active Weather Map</span>
            <div className="bg-[#2A2E3F] px-2 py-1 rounded-xl">
              <span className="text-[#00E5FF] text-xs">Glow 🔵</span>
            </div>
          </div>
          
          <div className="flex-1 bg-[#1C1F2B] rounded-lg flex justify-center items-center overflow-hidden relative">
             <iframe 
                width="100%" 
                height="100%" 
                src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=in&metricTemp=%C2%B0F&metricWind=mph&zoom=5&overlay=radar&product=radar&level=surface&lat=36.00&lon=-80.00&message=true" 
                frameBorder="0"
                className="absolute inset-0 grayscale-[0.3] contrast-[1.2] scale-105"
                title="Live Weather Map"
              ></iframe>
          </div>
        </div>

      </div>
    </div>
  );
}
