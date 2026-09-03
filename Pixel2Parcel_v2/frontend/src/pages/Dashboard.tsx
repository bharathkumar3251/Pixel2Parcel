import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Map, AlertTriangle, MessageSquare, Upload, Cpu, 
  CheckCircle, ArrowUpRight, TrendingUp, Compass, FileText, RefreshCw, HardDrive, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useGISStore } from '../store/gisStore';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { dataVersion, triggerRefresh } = useGISStore();

  const [surveys, setSurveys] = useState<any[]>([]);
  const [parcels, setParcels] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingBenchmark, setLoadingBenchmark] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.getSurveys().catch(() => ({ surveys: [] })),
      api.getParcels().catch(() => ({ features: [] })),
      api.getComplaints().catch(() => ({ complaints: [] }))
    ]).then(([srvRes, pclRes, cmpRes]) => {
      setSurveys(srvRes.surveys || []);
      setParcels(pclRes.features || []);
      setComplaints(cmpRes.complaints || []);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [dataVersion]);

  const hasDataset = surveys.length > 0 || parcels.length > 0;
  const verifiedCount = parcels.filter(p => p.properties?.status === 'Verified' || p.properties?.status === 'Approved').length;
  const highRiskCount = parcels.filter(p => p.properties?.risk_level === 'Red').length;
  const pendingVerificationCount = parcels.filter(p => p.properties?.status === 'Under Verification' || p.properties?.status === 'Draft').length;

  const handleLoadBenchmark = async () => {
    setLoadingBenchmark(true);
    try {
      await api.loadBenchmarkDataset();
      triggerRefresh();
    } catch (e) {
      console.error("Benchmark load error:", e);
    } finally {
      setLoadingBenchmark(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Welcome Banner */}
      <div className="bg-govt-navy text-white rounded-xl p-6 shadow-lg border-l-4 border-amber-500 flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
            <span>Department of Land Resources (DoLR)</span>
            <span>•</span>
            <span>National GIS Command Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Urban Cadastral Mapping & Parcel Verification Platform</h1>
          <p className="text-sm text-slate-300 mt-1">
            Real-time geospatial analytics, AI drone segmentation, Shapely topology engine, and GNSS verification portal.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/government/workspace')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs shadow transition-all flex items-center space-x-2"
          >
            <Map className="w-4 h-4" />
            <span>Open 2D GIS Workstation</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 text-xs space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="font-semibold">Loading GIS analytics dashboard...</span>
        </div>
      ) : !hasDataset ? (
        /* Empty Dataset Baseline State */
        <div className="bg-white border border-slate-300 rounded-xl p-10 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto border border-blue-200">
            <HardDrive className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-govt-navy">Awaiting Dataset Upload</h2>
            <p className="text-xs text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
              The platform is initialized in an empty state. No spatial datasets have been ingested yet. Upload drone imagery, GeoJSON boundaries, or shapefiles in the Survey Workspace to activate live GIS analytics.
            </p>
          </div>
          <div className="pt-2 flex justify-center space-x-3">
            <button
              onClick={() => navigate('/government/upload')}
              className="bg-govt-navy hover:bg-blue-800 text-white font-bold px-5 py-3 rounded-xl text-xs shadow inline-flex items-center space-x-2 transition-colors"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Upload Dataset in Survey Studio</span>
            </button>
            <button
              onClick={handleLoadBenchmark}
              disabled={loadingBenchmark}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs shadow inline-flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              {loadingBenchmark ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              <span>Load SIH Official Benchmark Dataset</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-600 block">Total Verified Parcels</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{verifiedCount} / {parcels.length}</span>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">Officially Signed Off</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-blue-50 border-blue-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-600 block">Survey Datasets Ingested</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{surveys.length} Datasets</span>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">Rasters & Vectors</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm text-blue-600">
                <Upload className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-amber-50 border-amber-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-600 block">High Risk / Overlaps</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{highRiskCount} Flagged</span>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">Requires Inspector Review</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-purple-50 border-purple-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-600 block">Pending Complaints</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{complaints.length} Filed</span>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">Citizen Grievance Queue</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm text-purple-600">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Two Column Layout: Recent Surveys & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table Column (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-300 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-base font-bold text-govt-navy">Ingested Survey Datasets Repository</h2>
                  <p className="text-xs text-slate-500">Raster drone orthomosaics & vector cadastral layers</p>
                </div>
                <button
                  onClick={() => navigate('/government/upload')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span>Upload New Survey</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-100 uppercase text-[10px] text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Filename</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">File Size</th>
                      <th className="p-3">CRS</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {surveys.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-blue-700 truncate max-w-xs">{row.filename}</td>
                        <td className="p-3 font-semibold text-slate-900">{row.category}</td>
                        <td className="p-3 font-mono">{row.size_mb ? `${row.size_mb} MB` : '0.4 MB'}</td>
                        <td className="p-3 font-mono text-slate-600">EPSG:4326 / UTM 43N</td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {row.status || "Processed"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => navigate('/government/workspace')}
                            className="text-blue-600 font-bold hover:underline"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Launchpad Column */}
            <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-govt-navy border-b border-slate-200 pb-2">
                Government GIS Launchpad
              </h2>

              <div className="space-y-2.5 text-xs">
                <button
                  onClick={() => navigate('/government/segmentation')}
                  className="w-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-3 rounded-lg text-left flex items-center space-x-3 transition-colors"
                >
                  <Cpu className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">AI Drone Segmentation</span>
                    <span className="text-slate-500 text-[11px]">Run multi-class feature extraction on drone TIFFs</span>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/government/topology')}
                  className="w-full bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 p-3 rounded-lg text-left flex items-center space-x-3 transition-colors"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Shapely Topology Inspector</span>
                    <span className="text-slate-500 text-[11px]">Scan parcel overlaps, gaps, and invalid rings</span>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/government/verification')}
                  className="w-full bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 p-3 rounded-lg text-left flex items-center space-x-3 transition-colors"
                >
                  <Compass className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">GNSS Field Verification</span>
                    <span className="text-slate-500 text-[11px]">Compare CORS DGPS points against AI boundaries</span>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/government/reports')}
                  className="w-full bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 p-3 rounded-lg text-left flex items-center space-x-3 transition-colors"
                >
                  <FileText className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Government PDF Generator</span>
                    <span className="text-slate-500 text-[11px]">Export official parcel certificates with QR code</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

