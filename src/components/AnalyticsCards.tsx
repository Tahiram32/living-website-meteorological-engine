import React from "react";
import { Activity } from "lucide-react";

export interface AnalyticsCardsProps {
  platformMetrics: { trades: number; revenue: number };
  metricsHealth: { status: string; lastUpdated: string };
}

export default function AnalyticsCards({ platformMetrics, metricsHealth }: AnalyticsCardsProps) {
  return (
    <div className="bg-white border border-slate-300 shadow-sm rounded-lg p-4 mb-4 flex gap-4 font-sans relative">
      {metricsHealth.status === "failed" && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium border border-rose-200 uppercase tracking-wider animate-pulse">
          <Activity size={10} />
          Stale Data Alert: Cron Failed
        </div>
      )}
      {metricsHealth.status === "healthy" && metricsHealth.lastUpdated && (
        <div className="absolute top-2 right-2 text-[10px] text-slate-400 font-medium">
          Sync: {new Date(metricsHealth.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-md p-4">
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Weekly Lead Trades</div>
        <div className="text-2xl text-slate-800 font-bold">{platformMetrics.trades}</div>
      </div>
      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-md p-4">
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Weekly Pipeline Revenue</div>
        <div className="text-2xl text-emerald-600 font-bold">${platformMetrics.revenue.toLocaleString()}</div>
      </div>
    </div>
  );
}
