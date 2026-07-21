import React from "react";
import { Globe, Trash2, RefreshCw, Plus } from "lucide-react";
import { TenantClient } from "../types";
import { useClients } from "../hooks/useClients";

export interface ClientTableProps {
  pendingClients: TenantClient[];
  selectedClient: TenantClient | null;
  setSelectedClient: (c: TenantClient | null) => void;
  deleteClient: (domain: string) => void;
  setIsAdding: (val: boolean) => void;
}

export default function ClientTable({
  pendingClients,
  selectedClient,
  setSelectedClient,
  deleteClient,
  setIsAdding,
}: ClientTableProps) {
  const { clients, loading } = useClients();

  if (loading) {
    return <div className="p-4 text-sm text-slate-500">Loading clients...</div>;
  }

  if (clients.length === 0 && pendingClients.length === 0) {
    return (
      <div className="bg-white border border-slate-300 shadow-sm overflow-hidden text-center py-16 px-6">
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
    );
  }

  return (
    <div className="bg-white border border-slate-300 shadow-sm overflow-hidden">
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
    </div>
  );
}
