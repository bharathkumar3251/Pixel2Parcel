import React, { useState, useEffect } from 'react';
import { Waves, AlertTriangle, Users, MapPin, Compass, RefreshCw, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { useGISStore } from '../store/gisStore';

export const FloodModelerPage: React.FC = () => {
  const { selectedWard } = useGISStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [waterRise, setWaterRise] = useState<number>(1.5); // 1.5m rise default

  useEffect(() => {
    setIsLoading(true);
    api.getFloodRisk(waterRise)
      .then(res => setData(res))
      .finally(() => setIsLoading(false));
  }, [waterRise]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-sans min-h-screen text-slate-100 cyber-grid-bg">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 shadow-2xl flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 mb-1">
            <span className="bg-cyan-500/20 px-2.5 py-0.5 rounded border border-cyan-500/40 uppercase">DISASTER MANAGEMENT ENGINE</span>
            <span>•</span>
            <span>{selectedWard}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading flex items-center space-x-2">
            <Waves className="w-6 h-6 text-cyan-400 animate-pulse" />
            <span>Urban Stormwater Flood Inundation & Terrain Risk Modeler</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Simulate water level accumulation over Digital Terrain Elevation Meshes (DEM) to predict flooded parcels and plan emergency evacuation routes.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-slate-400 text-xs space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
          <span>Simulating Hydrodynamic Flood Water Elevation Mesh...</span>
        </div>
      ) : (
        <>
          {/* Water Rise Slider Widget Card */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/80 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-white font-heading">Simulated Water Accumulation Rise</h2>
                <p className="text-xs text-slate-400">Adjust the flood water height level to model inundation impact</p>
              </div>
              <span className="text-cyan-400 font-mono font-extrabold text-xl bg-slate-950 px-4 py-1.5 rounded-xl border border-cyan-500/40">
                +{waterRise.toFixed(1)} Meters
              </span>
            </div>

            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.5"
              value={waterRise}
              onChange={(e) => setWaterRise(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>+0.5m (Minor Waterlogging)</span>
              <span>+2.0m (Moderate Inundation)</span>
              <span>+4.0m (Severe Flash Flood)</span>
            </div>
          </div>

          {/* Metric Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-cyan-500/30">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Inundated Parcels</span>
              <span className="text-2xl font-black text-cyan-400 mt-1 block font-mono">{data.total_inundated_parcels} Plots</span>
              <span className="text-[10px] text-cyan-300 font-bold mt-1 block">Submerged Ground Level</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-amber-500/30">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Affected Resident Population</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block font-mono">{data.affected_population} Residents</span>
              <span className="text-[10px] text-amber-300 font-bold mt-1 block">Evacuation Priority</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-red-500/30">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Designated Evacuation Corridor</span>
              <span className="text-xl font-black text-red-400 mt-1 block font-mono">Route Alpha-2</span>
              <span className="text-[10px] text-red-300 font-bold mt-1 block">Baner Highway Connector</span>
            </div>
          </div>

          {/* High Risk Parcels List */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/80 shadow-2xl space-y-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 font-heading">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <span>Inundated Parcel Vulnerability Audit</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-950/90 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Parcel ID</th>
                    <th className="p-3">CTS Survey No.</th>
                    <th className="p-3">Ground Elevation</th>
                    <th className="p-3">Submerged Water Depth</th>
                    <th className="p-3">Exposure Level</th>
                    <th className="p-3 text-right">Evacuation Route</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {data.high_risk_parcels.map((p: any) => (
                    <tr key={p.parcel_id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3 font-mono font-bold text-cyan-300">{p.parcel_id}</td>
                      <td className="p-3 font-mono text-slate-300">CTS {p.survey_no}</td>
                      <td className="p-3 font-mono text-slate-200">{p.ground_elevation_m}m AMSL</td>
                      <td className="p-3 font-mono text-cyan-400 font-bold">{p.water_depth_m.toFixed(2)}m Depth</td>
                      <td className="p-3 font-bold text-red-400">{p.risk_level}</td>
                      <td className="p-3 text-right font-mono text-amber-300">{p.evacuation_zone}</td>
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
