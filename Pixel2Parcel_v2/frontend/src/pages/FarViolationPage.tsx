import React, { useState, useEffect } from 'react';
import { Building2, AlertTriangle, CheckCircle2, FileText, ArrowUpRight, Filter, ShieldAlert, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useGISStore } from '../store/gisStore';
import { useNavigate } from 'react-router-dom';

export const FarViolationPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedState, selectedCity, selectedWard } = useGISStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState<any>(null);

  useEffect(() => {
    setIsLoading(true);
    api.getFarViolations(selectedState, selectedCity, selectedWard)
      .then(res => {
        setData(res);
        if (res.violations && res.violations.length > 0) {
          setSelectedViolation(res.violations[0]);
        }
      })
      .finally(() => setIsLoading(false));
  }, [selectedState, selectedCity, selectedWard]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-sans min-h-screen text-slate-100 cyber-grid-bg">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 shadow-2xl flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-red-500/10 blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-red-400 mb-1">
            <span className="bg-red-500/20 px-2.5 py-0.5 rounded border border-red-500/40 uppercase">ZONING COMPLIANCE ENGINE</span>
            <span>•</span>
            <span>{selectedWard}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-red-400" />
            <span>Automated FAR / FSI & Building Height Violation Audit</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Scan 3D extruded urban structures against municipal Floor Area Ratio (FAR/FSI) limits & right-of-way setback mandates.
          </p>
        </div>
        <button
          onClick={() => navigate('/government/3d')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-blue-600/30 flex items-center space-x-2 border border-blue-400/30 transition-all"
        >
          <span>View in 3D Digital Twin</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-slate-400 text-xs space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span>Auditing Municipal FAR Compliance Records...</span>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-slate-700/80">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Audited Structures</span>
              <span className="text-2xl font-black text-white mt-1 block font-mono">{data.total_audited_structures}</span>
              <span className="text-[10px] text-blue-400 font-bold mt-1 block">Full Ward 12 Coverage</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-emerald-500/30">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">FAR Compliant</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">{data.compliant_count}</span>
              <span className="text-[10px] text-emerald-400 font-bold mt-1 block">Within Statutory Limits</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-red-500/40">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">FAR Violations Flagged</span>
              <span className="text-2xl font-black text-red-400 mt-1 block font-mono">{data.violation_count}</span>
              <span className="text-[10px] text-red-400 font-bold mt-1 block">Requires Legal Notice</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-amber-500/30">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Estimated Penalty Revenue</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block font-mono">₹{(data.total_penalty_estimated_inr / 100000).toFixed(2)} Lakhs</span>
              <span className="text-[10px] text-amber-300 font-bold mt-1 block">Municipal Fine Potential</span>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Violations Table */}
            <div className="lg:col-span-8 glass-panel rounded-2xl p-5 border border-slate-700/80 shadow-2xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2 font-heading">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span>Non-Compliant Parcel Audit Register</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-slate-950/90 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Parcel / CTS No.</th>
                      <th className="p-3">Owner / Entity</th>
                      <th className="p-3">Land Use</th>
                      <th className="p-3">FAR (Actual / Max)</th>
                      <th className="p-3">Excess Built-up</th>
                      <th className="p-3">Fine Notice</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {data.violations.map((v: any) => (
                      <tr
                        key={v.building_id}
                        onClick={() => setSelectedViolation(v)}
                        className={`hover:bg-blue-950/40 cursor-pointer transition-colors ${
                          selectedViolation?.building_id === v.building_id ? 'bg-blue-950/60 border-l-2 border-l-blue-400' : ''
                        }`}
                      >
                        <td className="p-3 font-mono font-bold text-amber-300">{v.parcel_id}<br/><span className="text-slate-400 text-[10px]">CTS {v.survey_no}</span></td>
                        <td className="p-3 font-semibold text-slate-100">{v.owner}</td>
                        <td className="p-3 text-slate-300">{v.land_use}</td>
                        <td className="p-3 font-mono">
                          <span className="text-red-400 font-bold">{v.actual_far}</span> / <span className="text-slate-400">{v.permitted_far}</span>
                        </td>
                        <td className="p-3 font-mono text-red-300">+{v.excess_builtup_sqm} sq.m</td>
                        <td className="p-3 font-mono text-amber-400 font-bold">₹{v.penalty_notice_inr.toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] border border-red-500/30">
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Violation Details Inspector */}
            {selectedViolation && (
              <div className="lg:col-span-4 glass-panel rounded-2xl p-5 border border-slate-700/80 shadow-2xl space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">Violation Audit File</span>
                  <h3 className="text-base font-bold text-white font-heading">{selectedViolation.parcel_id}</h3>
                  <p className="text-xs text-slate-400">CTS No. {selectedViolation.survey_no} • {selectedViolation.owner}</p>
                </div>

                {/* FAR Gauge Meter Visual */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">FAR / FSI Excess Ratio:</span>
                    <span className="text-red-400 font-mono font-bold">
                      {((selectedViolation.actual_far / selectedViolation.permitted_far) * 100).toFixed(0)}% of Max Threshold
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Permitted: {selectedViolation.permitted_far}</span>
                    <span>Actual: {selectedViolation.actual_far}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-medium text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Permitted Height:</span>
                    <span className="font-mono">{selectedViolation.permitted_height_m}m</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Actual Height Extrusion:</span>
                    <span className="font-mono text-red-400 font-bold">{selectedViolation.actual_height_m}m</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Unauthorized Built-Up:</span>
                    <span className="font-mono text-red-300">{selectedViolation.excess_builtup_sqm} sq.m</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Calculated Municipal Penalty:</span>
                    <span className="font-mono text-amber-400 font-bold text-sm">₹{selectedViolation.penalty_notice_inr.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Official Municipal Penalty Notice generated for ${selectedViolation.owner} (${selectedViolation.parcel_id}).`)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Issue Statutory Penalty Notice (PDF)</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
