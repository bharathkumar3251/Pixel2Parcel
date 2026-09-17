import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Map, AlertTriangle, MessageSquare, Upload, Cpu, 
  CheckCircle, ArrowUpRight, Compass, FileText, RefreshCw, HardDrive, Building2, Search, Layers, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useGISStore } from '../store/gisStore';
import { OpenLayersMap } from '../components/gis/OpenLayersMap';
import { useTranslation } from '../i18n/translations';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { dataVersion, triggerRefresh, language } = useGISStore();
  const { t } = useTranslation(language);

  const [surveys, setSurveys] = useState<any[]>([]);
  const [parcels, setParcels] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingBenchmark, setLoadingBenchmark] = useState<boolean>(false);

  // Jurisdiction Selector State
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedCity, setSelectedCity] = useState<string>('Pune Municipal Corporation (PMC)');
  const [selectedWard, setSelectedWard] = useState<string>('Ward 12 - Baner Smart Sector');
  const [ctsQuery, setCtsQuery] = useState<string>('');

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
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-sans min-h-screen text-slate-100 cyber-grid-bg">
      {/* Hero Glass Banner & Command Header */}
      <div className="relative rounded-2xl p-6 shadow-2xl border border-slate-700/60 overflow-hidden mesh-gradient-dark group">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-mono tracking-wider mb-2">
              <span className="bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>MoHUA URBAN GIS COMMAND</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-medium">Smart Cities Municipal Cadastral Engine</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
              <span className="text-gradient-blue font-heading">{t('command_center', 'Municipal Property Cadastre & PR Card Platform')}</span>
            </h1>
            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {t('sub_title_desc', 'Sub-5cm CORS DGPS Kinematic Precision • AI Building Footprints & Height Extrusions • City Survey Numbers (CTS No.)')}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => navigate('/government/workspace')}
              className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold px-5 py-3 rounded-xl text-xs shadow-lg shadow-blue-600/30 flex items-center space-x-2.5 transition-all border border-blue-400/40 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Map className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{t('open_workspace', 'Launch Urban 2D GIS Workstation')}</span>
            </button>
          </div>
        </div>

        {/* Hierarchical Urban Jurisdiction Selector Bar */}
        <div className="mt-6 pt-5 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/70 shadow-inner">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono">{t('state_jurisdiction', 'State Nodal Jurisdiction')}</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-lg p-2 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Maharashtra">Maharashtra (Directorate of Land Records)</option>
              <option value="Karnataka">Karnataka (Urban Property Directorate)</option>
              <option value="Gujarat">Gujarat (Urban Development Department)</option>
              <option value="Delhi">Delhi (DDA Urban GIS)</option>
            </select>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/70 shadow-inner">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono">{t('corp_jurisdiction', 'Municipal Corporation / ULB')}</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-lg p-2 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Pune Municipal Corporation (PMC)">Pune Municipal Corporation (PMC)</option>
              <option value="Brihanmumbai Municipal Corp (BMC)">Brihanmumbai Municipal Corp (BMC)</option>
              <option value="Pimpri Chinchwad Corp (PCMC)">Pimpri Chinchwad Corp (PCMC)</option>
              <option value="Nagpur Municipal Corporation (NMC)">Nagpur Municipal Corporation (NMC)</option>
            </select>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/70 shadow-inner">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono">{t('ward_jurisdiction', 'Municipal Ward & Sector')}</label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-lg p-2 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Ward 12 - Baner Smart Sector">Ward 12 - Baner Smart Sector</option>
              <option value="Ward 14 - Kothrud Sector">Ward 14 - Kothrud Sector</option>
              <option value="Ward 08 - Shivajinagar Sector">Ward 08 - Shivajinagar Sector</option>
              <option value="Ward 22 - Aundh Sector">Ward 22 - Aundh Sector</option>
            </select>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/70 shadow-inner">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono">Quick CTS No. Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder={t('cts_search_placeholder', 'e.g. 104/1A or P2P-IND-MH-4001')}
                value={ctsQuery}
                onChange={(e) => setCtsQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-lg pl-8 pr-3 py-2 font-mono focus:outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-xs space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="font-semibold text-sm">Initializing Urban Cadastral Intelligence Engine...</span>
        </div>
      ) : !hasDataset ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-5 border border-slate-700/80 shadow-2xl max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto border border-blue-500/30 shadow-lg shadow-blue-500/20">
            <HardDrive className="w-10 h-10 animate-bounce" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white font-heading">Awaiting Urban Cadastral Dataset</h2>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              No municipal survey files loaded. Upload GeoTIFF orthomosaics, GeoJSON property vectors, or CORS GNSS field survey points in the Survey Workspace.
            </p>
          </div>
          <div className="pt-3 flex justify-center space-x-4">
            <button
              onClick={() => navigate('/government/upload')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-6 py-3 rounded-xl text-xs shadow-lg border border-slate-600 inline-flex items-center space-x-2 transition-all"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Upload Survey in Workspace</span>
            </button>
            <button
              onClick={handleLoadBenchmark}
              disabled={loadingBenchmark}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 inline-flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {loadingBenchmark ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              <span>Load Official Urban Benchmark Dataset</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Glass KPI Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card glass-card-hover p-4 rounded-2xl border border-emerald-500/20 flex items-center justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Verified PR Cards</span>
                <span className="text-2xl font-black text-white mt-1 block font-mono tracking-tight">{verifiedCount} <span className="text-sm font-normal text-slate-400">/ {parcels.length}</span></span>
                <span className="text-[10px] text-emerald-400 font-bold mt-1.5 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Officially Sealed & Approved</span>
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card glass-card-hover p-4 rounded-2xl border border-blue-500/20 flex items-center justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Survey Datasets</span>
                <span className="text-2xl font-black text-white mt-1 block font-mono tracking-tight">{surveys.length} <span className="text-sm font-normal text-slate-400">Rasters/Vectors</span></span>
                <span className="text-[10px] text-blue-400 font-bold mt-1.5 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span>Drone GeoTIFF & Shapefiles</span>
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10">
                <Upload className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card glass-card-hover p-4 rounded-2xl border border-amber-500/20 flex items-center justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Overlaps & Setbacks</span>
                <span className="text-2xl font-black text-amber-400 mt-1 block font-mono tracking-tight">{highRiskCount} <span className="text-sm font-normal text-slate-400">Flagged</span></span>
                <span className="text-[10px] text-amber-300 font-bold mt-1.5 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Requires Inspector Review</span>
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card glass-card-hover p-4 rounded-2xl border border-purple-500/20 flex items-center justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Property Disputes</span>
                <span className="text-2xl font-black text-purple-300 mt-1 block font-mono tracking-tight">{complaints.length} <span className="text-sm font-normal text-slate-400">Active</span></span>
                <span className="text-[10px] text-purple-400 font-bold mt-1.5 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span>&lt; 48h Resolution SLA</span>
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Interactive Map Preview & Quick Operations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Live OpenLayers GIS Preview */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-700/80 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2 font-heading">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span>Live Urban Municipal GIS Map Backdrop</span>
                  </h2>
                  <p className="text-xs text-slate-400">Baner Smart Sector • City Survey Numbers (CTS No.)</p>
                </div>
                <button
                  onClick={() => navigate('/government/workspace')}
                  className="text-xs font-extrabold text-blue-400 hover:text-blue-300 flex items-center space-x-1.5 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/30 transition-all hover:bg-blue-500/20"
                >
                  <span>Expand Full GIS Workspace</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* Map Canvas Container */}
              <div className="w-full h-[340px] rounded-xl overflow-hidden border border-slate-700 shadow-2xl relative">
                <OpenLayersMap />
                <div className="absolute top-3 left-3 bg-slate-950/90 text-white text-[11px] font-mono px-3.5 py-1.5 rounded-lg border border-slate-700 shadow-xl backdrop-blur-md flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Precision: Sub-5cm CORS Kinematic DGPS</span>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Quick Launchpad */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-700/80 shadow-2xl space-y-4">
              <h2 className="text-lg font-bold text-white border-b border-slate-800/80 pb-3 flex items-center space-x-2 font-heading">
                <Shield className="w-5 h-5 text-amber-400" />
                <span>Urban Officer Operations</span>
              </h2>

              <div className="space-y-2.5 text-xs">
                <button
                  onClick={() => navigate('/government/segmentation')}
                  className="w-full bg-slate-900/80 hover:bg-blue-950/50 border border-slate-700/80 hover:border-blue-500/50 p-3.5 rounded-xl text-left flex items-center space-x-3.5 transition-all group shadow-sm"
                >
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 group-hover:bg-blue-500/20 transition-all">
                    <Cpu className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 block text-sm group-hover:text-blue-300">AI Building & Cadastre Vectorizer</span>
                    <span className="text-slate-400 text-[10px]">Extract building footprints & height extrusions</span>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/government/topology')}
                  className="w-full bg-slate-900/80 hover:bg-amber-950/50 border border-slate-700/80 hover:border-amber-500/50 p-3.5 rounded-xl text-left flex items-center space-x-3.5 transition-all group shadow-sm"
                >
                  <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500/20 transition-all">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 block text-sm group-hover:text-amber-300">Shapely Urban Topology Inspector</span>
                    <span className="text-slate-500 text-[10px]">Scan road right-of-way setback conflicts</span>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/government/verification')}
                  className="w-full bg-slate-900/80 hover:bg-emerald-950/50 border border-slate-700/80 hover:border-emerald-500/50 p-3.5 rounded-xl text-left flex items-center space-x-3.5 transition-all group shadow-sm"
                >
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500/20 transition-all">
                    <Compass className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 block text-sm group-hover:text-emerald-300">CORS GNSS DGPS Urban Audit</span>
                    <span className="text-slate-500 text-[10px]">Sub-5cm precision urban boundary verification</span>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/government/reports')}
                  className="w-full bg-slate-900/80 hover:bg-purple-950/50 border border-slate-700/80 hover:border-purple-500/50 p-3.5 rounded-xl text-left flex items-center space-x-3.5 transition-all group shadow-sm"
                >
                  <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 group-hover:bg-purple-500/20 transition-all">
                    <FileText className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 block text-sm group-hover:text-purple-300">Urban Property Card (PR Card)</span>
                    <span className="text-slate-500 text-[10px]">Issue official PDF PR Cards with QR verification</span>
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

