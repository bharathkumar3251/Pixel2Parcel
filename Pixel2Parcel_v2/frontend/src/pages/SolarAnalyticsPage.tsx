import React, { useState, useEffect } from 'react';
import { Sun, Zap, Leaf, DollarSign, Clock, Building2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useGISStore } from '../store/gisStore';

export const SolarAnalyticsPage: React.FC = () => {
  const { selectedWard } = useGISStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [targetParcel, setTargetParcel] = useState('P2P-IND-MH-4003');

  useEffect(() => {
    setIsLoading(true);
    api.getSolarPotential(targetParcel)
      .then(res => setData(res))
      .finally(() => setIsLoading(false));
  }, [targetParcel]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-sans min-h-screen text-slate-100 cyber-grid-bg">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 shadow-2xl flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-amber-500/10 blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 mb-1">
            <span className="bg-amber-500/20 px-2.5 py-0.5 rounded border border-amber-500/40 uppercase">SOLAR DIGITAL TWIN</span>
            <span>•</span>
            <span>{selectedWard}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading flex items-center space-x-2">
            <Sun className="w-6 h-6 text-amber-400" />
            <span>Rooftop Solar PV Energy Potential & Carbon Yield Calculator</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Estimate roof surface solar incidence, annual kilowatt-hour (kWh) clean energy yield, electricity bill savings, and payback period.
          </p>
        </div>

        {/* Target Parcel Switcher */}
        <select
          value={targetParcel}
          onChange={(e) => setTargetParcel(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-xs text-amber-300 font-mono font-bold rounded-xl p-2.5 focus:outline-none focus:border-amber-500 cursor-pointer shadow-inner"
        >
          <option value="P2P-IND-MH-4003">P2P-IND-MH-4003 (Commercial IT Complex)</option>
          <option value="P2P-IND-MH-4001">P2P-IND-MH-4001 (Residential Apartments)</option>
          <option value="P2P-IND-MH-4004">P2P-IND-MH-4004 (Industrial Workshop)</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-slate-400 text-xs space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
          <span>Simulating Solar Radiation & PV Yield Metrics...</span>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-amber-500/30">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Solar PV System Capacity</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block font-mono">{data.solar_pv_capacity_kwp} kWp</span>
              <span className="text-[10px] text-slate-400 font-bold mt-1 block">Usable Roof: {data.usable_solar_area_sqm} sq.m</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-blue-500/30">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Annual Clean Energy Generation</span>
              <span className="text-2xl font-black text-blue-400 mt-1 block font-mono">{data.annual_energy_generation_kwh.toLocaleString()} kWh</span>
              <span className="text-[10px] text-blue-400 font-bold mt-1 block">Grid Feeding Potential</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-emerald-500/30">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Annual Electricity Savings</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">₹{(data.annual_electricity_savings_inr / 100000).toFixed(2)} Lakhs</span>
              <span className="text-[10px] text-emerald-400 font-bold mt-1 block">Net Metering ROI</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-green-500/30">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">CO₂ Offset Reduction</span>
              <span className="text-2xl font-black text-green-300 mt-1 block font-mono">{data.co2_reduction_tons_per_year} Tons/yr</span>
              <span className="text-[10px] text-green-400 font-bold mt-1 block">Payback: {data.payback_period_years} Years</span>
            </div>
          </div>

          {/* Technical Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-5 border border-slate-700/80 shadow-2xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2 font-heading">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Rooftop Solar Radiation & Incidence Profile</span>
              </h2>

              <div className="space-y-3 text-xs font-medium">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Total Structural Roof Area:</span>
                  <span className="font-mono text-white">{data.roof_area_sqm} sq.m</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Net Unshaded Usable Solar Area:</span>
                  <span className="font-mono text-amber-400 font-bold">{data.usable_solar_area_sqm} sq.m (80%)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Recommended Solar Module Type:</span>
                  <span className="font-mono text-slate-200">Monocrystalline PERC (21.5% Efficiency)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Optimal Tilt Angle:</span>
                  <span className="font-mono text-slate-200">18.5° South Orientation</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Estimated CAPEX Investment:</span>
                  <span className="font-mono text-emerald-400 font-bold">₹78,30,000</span>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 border border-slate-700/80 shadow-2xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2 font-heading">
                <Leaf className="w-5 h-5 text-green-400" />
                <span>Sustainability & Net Zero Municipal Impact</span>
              </h2>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center space-x-3 text-green-400">
                  <Leaf className="w-8 h-8" />
                  <div>
                    <span className="font-extrabold text-sm text-white block">Equivalency Impact</span>
                    <span className="text-slate-400 text-[11px]">Equivalent to planting 10,200 mature trees over 25 years lifecycle.</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-400 h-full w-[85%]" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
