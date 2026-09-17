import React, { useState, useEffect } from 'react';
import { Layers, Sliders, Calendar, ArrowRight, ShieldCheck, Cpu, RefreshCw, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useGISStore } from '../store/gisStore';

export const TemporalChangePage: React.FC = () => {
  const { selectedWard } = useGISStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sliderPosition, setSliderPosition] = useState(50); // 50% split

  useEffect(() => {
    setIsLoading(true);
    api.getTemporalChanges(2020, 2026)
      .then(res => setData(res))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-sans min-h-screen text-slate-100 cyber-grid-bg">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 shadow-2xl flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-blue-500/10 blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 mb-1">
            <span className="bg-amber-500/20 px-2.5 py-0.5 rounded border border-amber-500/40 uppercase">TEMPORAL AI ANALYTICS</span>
            <span>•</span>
            <span>{selectedWard}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading flex items-center space-x-2">
            <Layers className="w-6 h-6 text-blue-400" />
            <span>Temporal AI Land Use & Encroachment Change Detection</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Side-by-side temporal split curtain comparison between baseline aerial orthomosaic (2020) and AI resurvey vector layer (2026).
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-slate-400 text-xs space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span>Processing Multi-Temporal AI Change Detection Layers...</span>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-blue-500/30">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Total Change Events</span>
              <span className="text-2xl font-black text-white mt-1 block font-mono">{data.total_change_events}</span>
              <span className="text-[10px] text-blue-400 font-bold mt-1 block">2020 vs 2026 Resurvey</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-emerald-500/30">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">New Construction</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">{data.new_buildings_constructed}</span>
              <span className="text-[10px] text-emerald-400 font-bold mt-1 block">Approved Structural Footprints</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-purple-500/30">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Vertical Extensions</span>
              <span className="text-2xl font-black text-purple-300 mt-1 block font-mono">{data.vertical_floor_extensions}</span>
              <span className="text-[10px] text-purple-400 font-bold mt-1 block">Floor Additions Detected</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-amber-500/30">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Encroachments Flagged</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block font-mono">{data.encroachments_detected}</span>
              <span className="text-[10px] text-amber-300 font-bold mt-1 block">Road Right-of-Way Conflicts</span>
            </div>
          </div>

          {/* Split Curtain Interactive Comparison View */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/80 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2 font-heading">
                  <Sliders className="w-5 h-5 text-blue-400" />
                  <span>Interactive Split Curtain Comparison View</span>
                </h2>
                <p className="text-xs text-slate-400">Drag the slider horizontally to compare 2020 Baseline vs 2026 Resurvey</p>
              </div>

              {/* Slider Control Handle Info */}
              <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-amber-400 flex items-center space-x-3">
                <span>2020 Baseline ({100 - sliderPosition}%)</span>
                <span>|</span>
                <span>2026 AI Resurvey ({sliderPosition}%)</span>
              </div>
            </div>

            {/* Split Screen Image Container */}
            <div className="relative w-full h-[380px] rounded-xl overflow-hidden border border-slate-700 shadow-2xl select-none">
              {/* Baseline Image (2020) */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=1200&auto=format&fit=crop')`
                }}
              >
                <div className="absolute top-4 left-4 bg-slate-950/90 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono font-bold shadow-lg">
                  📅 Baseline Aerial Survey (January 2020)
                </div>
              </div>

              {/* Resurvey Overlay (2026) - Clipped by Slider */}
              <div
                className="absolute inset-0 bg-cover bg-center border-r-2 border-amber-400 shadow-2xl"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=1200&auto=format&fit=crop')`,
                  clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`
                }}
              >
                <div className="absolute top-4 right-4 bg-blue-950/90 text-amber-300 px-3 py-1.5 rounded-lg border border-blue-500/40 text-xs font-mono font-bold shadow-lg flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>2026 AI Resurvey Change Layer</span>
                </div>
              </div>

              {/* Slider Input Handle Overlay */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              />
            </div>
          </div>

          {/* Change Events Table */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/80 shadow-2xl space-y-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 font-heading">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <span>AI Detected Spatial Change Register</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-950/90 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Event ID</th>
                    <th className="p-3">Parcel / CTS No.</th>
                    <th className="p-3">Change Event Type</th>
                    <th className="p-3">AI Confidence</th>
                    <th className="p-3">Area Affected</th>
                    <th className="p-3">Date Detected</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {data.changes.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-400">{c.id}</td>
                      <td className="p-3 font-mono text-slate-200">{c.parcel_id} (CTS {c.survey_no})</td>
                      <td className="p-3 font-semibold text-white">{c.change_type}</td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">{(c.confidence_score * 100).toFixed(0)}%</td>
                      <td className="p-3 font-mono text-slate-300">+{c.area_changed_sqm} sq.m</td>
                      <td className="p-3 font-mono text-slate-400">{c.date_detected}</td>
                      <td className="p-3 text-right">
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] border border-blue-500/30">
                          {c.status}
                        </span>
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
