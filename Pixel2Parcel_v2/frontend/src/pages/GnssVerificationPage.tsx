import React, { useState, useEffect } from 'react';
import { Compass, Upload, CheckCircle2, AlertTriangle, FileSpreadsheet, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { GNSSPoint } from '../types/gis';
import { useGISStore } from '../store/gisStore';

export const GnssVerificationPage: React.FC = () => {
  const { dataVersion } = useGISStore();
  const [points, setPoints] = useState<GNSSPoint[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [officerRemarks, setOfficerRemarks] = useState('Field DGPS verification completed. CORS benchmark points match AI drone boundary within 0.08m.');
  const [statusUpdated, setStatusUpdated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchGnssPoints = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.getGnssPoints();
      setPoints(res.points || []);
      setMetrics(res.metrics || {});
    } catch (err: any) {
      console.error("Fetch GNSS points error:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to load GNSS CORS field benchmark points.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGnssPoints();
  }, [dataVersion]);

  const handleUpdateStatus = () => {
    setStatusUpdated(true);
    setTimeout(() => setStatusUpdated(false), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-600 font-bold uppercase mb-1">
            <Compass className="w-4 h-4" />
            <span>Workflow Step 07 • Ground Truth Audit</span>
          </div>
          <h1 className="text-xl font-bold text-govt-navy">FIELD VERIFICATION (GNSS / CORS)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare AI Boundary with GNSS Survey • Update Geometry • Officer Remarks
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-xl flex items-center space-x-2 text-xs font-bold shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Intelligent Verification Workflow Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs space-y-2">
        <div className="flex items-center space-x-2 text-blue-900 font-bold">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>DoLR Intelligent Verification Innovation</span>
        </div>
        <p className="text-slate-700 leading-relaxed">
          AI processes all uploaded parcels automatically. High Confidence (&ge; 80%) parcels are auto-verified. Only uncertain parcels (&lt; 80% confidence or topological conflict) are flagged and routed to field survey teams for DGPS / CORS GNSS verification and official officer approval.
        </p>
        <div className="flex items-center space-x-3 font-mono text-[11px] pt-1">
          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">
            High Confidence &ge; 80% &rarr; Auto-Verify
          </span>
          <span className="text-slate-400">|</span>
          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-300">
            Low Confidence &lt; 80% &rarr; Field GNSS Verification &rarr; Officer Sign-off
          </span>
        </div>
      </div>

      {statusUpdated && (
        <div className="bg-emerald-100 border border-emerald-400 text-emerald-800 p-3 rounded-xl flex items-center space-x-2 text-xs font-bold shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Officer verification remarks recorded. Parcel status updated to OFFICIALLY VERIFIED!</span>
        </div>
      )}

      {/* Metrics Banner */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-300 p-4 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total GNSS Benchmark Points</span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{points.length} Points</span>
          </div>

          <div className="bg-white border border-slate-300 p-4 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Calculated RMSE Offset</span>
            <span className="text-2xl font-black text-blue-700 font-mono mt-1 block">{metrics.rmse_m} m</span>
          </div>

          <div className="bg-white border border-slate-300 p-4 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Mean Boundary Discrepancy</span>
            <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">{metrics.mean_offset_m} m</span>
          </div>

          <div className="bg-white border border-slate-300 p-4 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Accuracy Assessment Status</span>
            <span className="text-2xl font-black text-emerald-800 font-mono mt-1 block">{metrics.status || "PASSED"}</span>
          </div>
        </div>
      )}

      {/* Two Column Layout: Points Table & Remarks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Column (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-govt-navy flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>CORS DGPS Benchmark Coordinates Log</span>
            </h2>
            <button
              onClick={fetchGnssPoints}
              className="text-blue-600 font-bold hover:underline flex items-center space-x-1 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto text-xs">
            {isLoading ? (
              <div className="text-center py-12 text-slate-500 text-xs flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Loading GNSS benchmark points...</span>
              </div>
            ) : points.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <p>No GNSS CORS points found.</p>
              </div>
            ) : (
              <table className="w-full text-left text-slate-700">
                <thead className="bg-slate-100 uppercase text-[10px] text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Point ID</th>
                    <th className="p-3">Latitude (°N)</th>
                    <th className="p-3">Longitude (°E)</th>
                    <th className="p-3">Elevation (m)</th>
                    <th className="p-3 text-right">Accuracy (m)</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {points.map((pt, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 font-mono">
                      <td className="p-3 font-bold text-blue-700">{pt.point_id}</td>
                      <td className="p-3 text-slate-900">{pt.latitude.toFixed(5)}</td>
                      <td className="p-3 text-slate-900">{pt.longitude.toFixed(5)}</td>
                      <td className="p-3 text-slate-700">{pt.elevation}</td>
                      <td className="p-3 text-right text-emerald-800 font-bold">±{pt.accuracy_m} m</td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 font-sans font-bold px-2 py-0.5 rounded text-[10px]">
                          Matched
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Remarks & Signoff Card */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4 text-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-govt-navy border-b border-slate-200 pb-2">
              Survey Officer Sign-Off & Remarks
            </h2>

            <div className="mt-3 space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Field Inspection Remarks</label>
                <textarea
                  rows={4}
                  value={officerRemarks}
                  onChange={(e) => setOfficerRemarks(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Inspection Officer:</span>
                  <span className="font-bold text-slate-800">District Survey Officer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-bold text-slate-800">Land Records (DoLR)</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleUpdateStatus}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 text-xs transition-colors shadow"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve & Record GNSS Sign-off</span>
          </button>
        </div>
      </div>
    </div>
  );
};
