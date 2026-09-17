import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Map, Box, Upload, Cpu, Layers, AlertTriangle,
  ShieldAlert, Edit3, Compass, MessageSquare, FileText, ExternalLink,
  Building2, Sliders, DollarSign, Sun, Waves
} from 'lucide-react';
import { useGISStore } from '../../store/gisStore';
import { useTranslation } from '../../i18n/translations';

export const Sidebar: React.FC = () => {
  const { language } = useGISStore();
  const { t } = useTranslation(language);

  const workflowSteps = [
    { step: '01', path: '/government/upload', key: 'step_upload', label: 'Survey Workspace (Input)', icon: Upload, subtitle: 'Drone RGB, ORI, DSM, DTM & Vector Inputs' },
    { step: '02', path: '/government/segmentation', key: 'step_seg', label: 'AI Feature Extraction', icon: Cpu, subtitle: 'Buildings, Roads, Vegetation & Land-Use' },
    { step: '03', path: '/government/parcels', key: 'step_parcel', label: 'AI Parcel Extraction', icon: Layers, subtitle: 'Boundary & Vector Polygon Generation' },
    { step: '04', path: '/government/topology', key: 'step_topo', label: 'Topology Validation', icon: AlertTriangle, subtitle: 'Gaps, Overlaps & Encroachment Checks' },
    { step: '05', path: '/government/workspace', key: 'step_gis', label: 'WebGIS Review & Editing', icon: Map, subtitle: '2D WebGIS Parcel Review Workspace' },
    { step: '05B', path: '/government/editor', key: 'step_editor', label: 'Geometry Polygon Editor', icon: Edit3, subtitle: 'Merge, Split & Polygon Geometry Editing' },
    { step: '05C', path: '/government/3d', key: 'step_3d', label: '3D Terrain & DSM Globe', icon: Box, subtitle: 'Cesium 3D Surface & Elevation Mesh' },
    { step: '06', path: '/government/verification', key: 'step_gnss', label: 'Field Verification (GNSS)', icon: Compass, subtitle: 'GNSS / CORS Survey Audit & Remarks' },
    { step: '07', path: '/government/reports', key: 'step_reports', label: 'Verified Map & GIS Export', icon: FileText, subtitle: 'PostGIS DB, GeoJSON, Shapefile, PDF' },
    { step: '08', path: '/government/complaints', key: 'step_complaints', label: 'Grievance & Complaints', icon: MessageSquare, subtitle: 'Citizen Dispute Resolution Pipeline' },
  ];

  const intelligenceSteps = [
    { step: 'AI-1', path: '/government/far-audit', label: 'FAR / FSI Violation Audit', icon: Building2, subtitle: '3D Building Height & Floor Space Index Audit' },
    { step: 'AI-2', path: '/government/temporal-change', label: 'Temporal AI Change Detection', icon: Sliders, subtitle: '2020 vs 2026 Split Curtain Comparison' },
    { step: 'AI-3', path: '/government/tax-audit', label: 'Municipal Property Tax Audit', icon: DollarSign, subtitle: 'Evasion Deficit & Recovery Notices (₹)' },
    { step: 'AI-4', path: '/government/solar-twin', label: 'Rooftop Solar PV Twin', icon: Sun, subtitle: 'kWh Yield, ROI & Net Zero Carbon Offset' },
    { step: 'AI-5', path: '/government/flood-modeler', label: 'Urban Flood Inundation Risk', icon: Waves, subtitle: 'Stormwater DEM Flood Rise Simulation' },
  ];

  return (
    <aside className="w-64 bg-slate-950/95 text-slate-300 flex flex-col border-r border-slate-800/80 h-full select-none shrink-0 font-sans shadow-xl backdrop-blur-xl">
      {/* Module Title Header */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/90 flex justify-between items-center">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block font-mono">P2P Cadastral Engine</span>
          <span className="text-xs font-extrabold text-white font-heading">Government Workflow</span>
        </div>
        <span className="bg-blue-500/15 text-blue-400 text-[10px] px-2 py-0.5 rounded-md border border-blue-500/30 font-mono font-bold shadow-sm">
          DoLR
        </span>
      </div>

      {/* Executive Overview Link */}
      <div className="p-2 border-b border-slate-800/60">
        <NavLink
          to="/government/dashboard"
          className={({ isActive }) =>
            `flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${isActive
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40'
              : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span>{t('exec_dashboard', 'Executive Dashboard')}</span>
        </NavLink>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-2.5 py-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
          {t('workflow_steps', 'Architecture Workflow Steps')}
        </div>

        {workflowSteps.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-start space-x-2 px-2.5 py-2 rounded-xl text-xs transition-all ${isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg shadow-blue-600/25 border border-blue-400/40'
                  : 'text-slate-300 hover:bg-slate-900/90 hover:text-white border border-transparent'
                }`
              }
            >
              <span className="text-[9px] font-mono font-bold bg-slate-900 text-amber-400 px-1.5 py-0.5 rounded-md shrink-0 mt-0.5 border border-slate-800 shadow-inner">
                {item.step}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5 truncate font-semibold">
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-90" />
                  <span className="truncate">{t(item.key, item.label)}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-normal truncate leading-tight mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </NavLink>
          );
        })}

        {/* Government Intelligence Analytics Section */}
        <div className="pt-3 border-t border-slate-800/80 mt-3">
          <div className="px-2.5 py-1 text-[9px] font-extrabold text-amber-400 uppercase tracking-wider font-mono flex items-center space-x-1">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>Govt Intelligence Analytics</span>
          </div>

          {intelligenceSteps.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-start space-x-2 px-2.5 py-1.5 rounded-xl text-xs transition-all ${isActive
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 font-black shadow-lg shadow-amber-600/30 border border-amber-400/40'
                    : 'text-slate-300 hover:bg-slate-900/90 hover:text-white border border-transparent'
                  }`
                }
              >
                <span className="text-[9px] font-mono font-bold bg-slate-900 text-amber-400 px-1.5 py-0.5 rounded-md shrink-0 mt-0.5 border border-slate-800 shadow-inner">
                  {item.step}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5 truncate font-semibold">
                    <Icon className="w-3.5 h-3.5 shrink-0 opacity-90 text-amber-400" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-normal truncate leading-tight mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Public Citizen Portal */}
        <div className="pt-2 border-t border-slate-800/80 mt-2">
          <NavLink
            to="/citizen/home"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-900/40 transition-all shadow-sm"
          >
            <span>Citizen Portal (Public)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </nav>

      {/* Sidebar Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950 text-[11px] text-slate-400">
        <div className="flex justify-between items-center mb-1 font-semibold text-slate-300">
          <span>Spatial Reference</span>
          <span className="text-amber-400 font-mono font-bold">EPSG:4326</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Survey Officer & GIS Analyst Workflow. Ministry of Rural Development.
        </p>
      </div>
    </aside>
  );
};
