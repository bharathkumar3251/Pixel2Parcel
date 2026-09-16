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
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-sans">
      {/* Top Banner & Urban Title */}
      <div className="bg-gradient-to-r from-[#0B1E36] via-[#0D284B] to-[#0A192F] text-white rounded-2xl p-6 shadow-xl border border-blue-500/30 border-l-4 border-l-amber-500 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-600/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-[11px] text-amber-400 font-bold uppercase tracking-wider mb-1 font-mono">
              <span className="bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">MoHUA URBAN GIS</span>
              <span>•</span>
              <span>Smart Cities Municipal Cadastral Command Center</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span>{t('command_center', 'Municipal Property Cadastre & PR Card Platform')}</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {t('sub_title_desc', 'Sub-5cm CORS DGPS Kinematic Precision • AI Building Footprints & Height Extrusions • City Survey Numbers (CTS No.)')}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/government/workspace')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-blue-900/40 flex items-center space-x-2 transition-all border border-blue-400/40"
            >
              <Map className="w-4 h-4 text-amber-400" />
              <span>{t('open_workspace', 'Launch Urban 2D GIS Workstation')}</span>
            </button>
          </div>
        </div>

        {/* Hierarchical Urban Jurisdiction Selector Bar */}
        <div className="mt-5 pt-4 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">{t('state_jurisdiction', 'State Nodal Jurisdiction')}</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 text-xs text-white rounded-lg p-2 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="Maharashtra">Maharashtra (Directorate of Land Records)</option>
              <option value="Karnataka">Karnataka (Urban Property Directorate)</option>
              <option value="Gujarat">Gujarat (Urban Development Department)</option>
              <option value="Delhi">Delhi (DDA Urban GIS)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">{t('corp_jurisdiction', 'Municipal Corporation / ULB')}</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 text-xs text-white rounded-lg p-2 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="Pune Municipal Corporation (PMC)">Pune Municipal Corporation (PMC)</option>
              <option value="Brihanmumbai Municipal Corp (BMC)">Brihanmumbai Municipal Corp (BMC)</option>
              <option value="Pimpri Chinchwad Corp (PCMC)">Pimpri Chinchwad Corp (PCMC)</option>
              <option value="Nagpur Municipal Corporation (NMC)">Nagpur Municipal Corporation (NMC)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">{t('ward_jurisdiction', 'Municipal Ward & Sector')}</label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 text-xs text-white rounded-lg p-2 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="Ward 12 - Baner Smart Sector">Ward 12 - Baner Smart Sector</option>
              <option value="Ward 14 - Kothrud Sector">Ward 14 - Kothrud Sector</option>
              <option value="Ward 08 - Shivajinagar Sector">Ward 08 - Shivajinagar Sector</option>
              <option value="Ward 22 - Aundh Sector">Ward 22 - Aundh Sector</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Quick CTS No. Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder={t('cts_search_placeholder', 'e.g. 104/1A or P2P-IND-MH-4001')}
                value={ctsQuery}
                onChange={(e) => setCtsQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 text-xs text-white rounded-lg pl-8 pr-3 py-2 font-mono focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 text-xs space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="font-semibold">Loading Urban Cadastral analytics...</span>
        </div>
      ) : !hasDataset ? (
        <div className="bg-white border border-slate-300 rounded-2xl p-10 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto border border-blue-200">
            <HardDrive className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-govt-navy">Awaiting Urban Cadastral Upload</h2>
            <p className="text-xs text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
              No municipal survey files loaded. Upload GeoTIFF orthomosaics, GeoJSON property vectors, or CORS GNSS field survey points in the Survey Workspace.
            </p>
          </div>
          <div className="pt-2 flex justify-center space-x-3">
            <button
              onClick={() => navigate('/government/upload')}
              className="bg-govt-navy hover:bg-blue-800 text-white font-bold px-5 py-3 rounded-xl text-xs shadow inline-flex items-center space-x-2 transition-colors"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Upload Survey in Workspace</span>
            </button>
            <button
              onClick={handleLoadBenchmark}
              disabled={loadingBenchmark}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs shadow inline-flex items-center space-x-2 transition-colors disabled:opacity-50"
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
            <div className="p-4 rounded-xl border bg-gradient-to-br from-emerald-50 to-white border-emerald-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Verified Property Cards (PR Cards)</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">{verifiedCount} / {parcels.length}</span>
                <span className="text-[10px] text-emerald-700 font-bold mt-1 block">Officially Sealed & Approved</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Urban Survey Rasters & Vectors</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">{surveys.length} Datasets</span>
                <span className="text-[10px] text-blue-700 font-bold mt-1 block">Drone GeoTIFF & Shapefiles</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                <Upload className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-gradient-to-br from-amber-50 to-white border-amber-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Overlaps & Setback Issues</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">{highRiskCount} Flagged</span>
                <span className="text-[10px] text-amber-700 font-bold mt-1 block">Requires Inspector Review</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-gradient-to-br from-purple-50 to-white border-purple-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Citizen Property Disputes</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">{complaints.length} Active</span>
                <span className="text-[10px] text-purple-700 font-bold mt-1 block">Resolved in &lt; 48 Hours SLA</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Interactive Map Preview & Quick Operations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Live OpenLayers GIS Preview */}
            <div className="lg:col-span-2 bg-white border border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-base font-bold text-govt-navy flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>Live Urban Municipal GIS Map Backdrop</span>
                  </h2>
                  <p className="text-xs text-slate-500">Baner Smart Sector • City Survey Numbers (CTS No.)</p>
                </div>
                <button
                  onClick={() => navigate('/government/workspace')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span>Expand Full GIS Workspace</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* Map Canvas Container */}
              <div className="w-full h-[320px] rounded-xl overflow-hidden border border-slate-300 shadow-inner relative">
                <OpenLayersMap />
                <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[11px] font-mono px-3 py-1.5 rounded-lg border border-slate-700 shadow-lg backdrop-blur">
                  Coordinate Precision: Sub-5cm CORS Kinematic DGPS
                </div>
              </div>
            </div>

            {/* Right 1 Col: Quick Launchpad */}
            <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-govt-navy border-b border-slate-200 pb-2 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <span>Urban Officer Operations</span>
              </h2>

              <div className="space-y-2 text-xs">
                <button
                  onClick={() => navigate('/government/segmentation')}
                  className="w-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-3 rounded-xl text-left flex items-center space-x-3 transition-colors"
                >
                  <Cpu className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">AI Building & Cadastre Vectorizer</span>
                    <span className="text-slate-500 text-[10px]">Extract building footprints & height extrusions</span>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/government/topology')}
                  className="w-full bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 p-3 rounded-xl text-left flex items-center space-x-3 transition-colors"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Shapely Urban Topology Inspector</span>
                    <span className="text-slate-500 text-[10px]">Scan road right-of-way setback conflicts</span>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/government/verification')}
                  className="w-full bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 p-3 rounded-xl text-left flex items-center space-x-3 transition-colors"
                >
                  <Compass className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">CORS GNSS DGPS Urban Audit</span>
                    <span className="text-slate-500 text-[10px]">Sub-5cm precision urban boundary verification</span>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/government/reports')}
                  className="w-full bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 p-3 rounded-xl text-left flex items-center space-x-3 transition-colors"
                >
                  <FileText className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Urban Property Card (PR Card) Generator</span>
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

