import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, AlertCircle, ArrowUpRight, Shield, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useGISStore } from '../store/gisStore';

export const TaxAnalyticsPage: React.FC = () => {
  const { selectedWard } = useGISStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getTaxDeficits()
      .then(res => setData(res))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-sans min-h-screen text-slate-100 cyber-grid-bg">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 shadow-2xl flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 mb-1">
            <span className="bg-emerald-500/20 px-2.5 py-0.5 rounded border border-emerald-500/40 uppercase">MUNICIPAL REVENUE ENGINE</span>
            <span>•</span>
            <span>{selectedWard}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span>Municipal Property Tax Revenue Deficit & Evasion Audit</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Cross-reference AI-measured actual floor space against self-declared municipal tax records to recover leaked tax revenue.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-slate-400 text-xs space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
          <span>Cross-Referencing Municipal Property Tax Records...</span>
        </div>
      ) : (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-blue-500/30">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Annual Tax Revenue Collected</span>
              <span className="text-2xl font-black text-white mt-1 block font-mono">₹{(data.total_ward_tax_revenue_collected_inr / 10000000).toFixed(2)} Cr</span>
              <span className="text-[10px] text-blue-400 font-bold mt-1 block">Ward 12 Municipal Treasury</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-red-500/40">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Unreported Tax Evasion Leakage</span>
              <span className="text-2xl font-black text-red-400 mt-1 block font-mono">₹{(data.estimated_tax_evasion_leakage_inr / 100000).toFixed(2)} Lakhs</span>
              <span className="text-[10px] text-red-400 font-bold mt-1 block">Annual Recoverable Deficit</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-700/80">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Total Audited Parcels</span>
              <span className="text-2xl font-black text-white mt-1 block font-mono">{data.audited_parcels}</span>
              <span className="text-[10px] text-slate-400 font-bold mt-1 block">Baner Cadastral Sector</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-amber-500/30">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Area Mismatch Parcels</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block font-mono">{data.mismatched_parcels}</span>
              <span className="text-[10px] text-amber-300 font-bold mt-1 block">Flagged for Re-Assessment</span>
            </div>
          </div>

          {/* Audit List Table */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/80 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 font-heading">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span>Tax Evasion Audit Register & Notice Generator</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-950/90 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Parcel ID</th>
                    <th className="p-3">Owner / Entity</th>
                    <th className="p-3">Declared Built-up</th>
                    <th className="p-3">AI Measured Built-up</th>
                    <th className="p-3">Unreported Deficit</th>
                    <th className="p-3">Tax Paid</th>
                    <th className="p-3">Annual Tax Due</th>
                    <th className="p-3">Evasion Penalty</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {data.evasion_summary.map((item: any) => (
                    <tr key={item.parcel_id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-300">{item.parcel_id}</td>
                      <td className="p-3 font-semibold text-white">{item.owner}</td>
                      <td className="p-3 font-mono text-slate-400">{item.declared_builtup_sqft.toLocaleString()} sq.ft</td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">{item.ai_measured_builtup_sqft.toLocaleString()} sq.ft</td>
                      <td className="p-3 font-mono text-red-400 font-bold">+{item.unreported_sqft.toLocaleString()} sq.ft</td>
                      <td className="p-3 font-mono text-slate-300">₹{item.annual_tax_paid_inr.toLocaleString()}</td>
                      <td className="p-3 font-mono text-white font-bold">₹{item.actual_tax_due_inr.toLocaleString()}</td>
                      <td className="p-3 font-mono text-amber-400 font-bold">₹{item.penalty_inr.toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => alert(`Generated Tax Assessment Notice for ${item.owner} (${item.parcel_id}). Tax Deficit: ₹${item.annual_deficit_inr.toLocaleString()}`)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-md transition-all flex items-center space-x-1 ml-auto"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Generate Notice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
