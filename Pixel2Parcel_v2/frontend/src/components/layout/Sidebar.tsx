import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Map, Box, Upload, Cpu, Layers, AlertTriangle,
  ShieldAlert, Edit3, Compass, MessageSquare, FileText, ExternalLink
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const workflowSteps = [
    { step: '01', path: '/government/upload', label: 'Survey Workspace (Input)', icon: Upload, subtitle: 'Drone RGB, ORI, DSM, DTM & Vector Inputs' },
    { step: '02', path: '/government/segmentation', label: 'AI Feature Extraction', icon: Cpu, subtitle: 'Buildings, Roads, Vegetation & Land-Use' },
    { step: '03', path: '/government/parcels', label: 'AI Parcel Extraction', icon: Layers, subtitle: 'Boundary & Vector Polygon Generation' },
    { step: '04', path: '/government/topology', label: 'Topology Validation', icon: AlertTriangle, subtitle: 'Gaps, Overlaps & Encroachment Checks' },
    { step: '05', path: '/government/workspace', label: 'WebGIS Review & Editing', icon: Map, subtitle: '2D WebGIS Parcel Review Workspace' },
    { step: '05B', path: '/government/editor', label: 'Geometry Polygon Editor', icon: Edit3, subtitle: 'Merge, Split & Polygon Geometry Editing' },
    { step: '05C', path: '/government/3d', label: '3D Terrain & DSM Globe', icon: Box, subtitle: 'Cesium 3D Surface & Elevation Mesh' },
    { step: '06', path: '/government/verification', label: 'Field Verification (GNSS)', icon: Compass, subtitle: 'GNSS / CORS Survey Audit & Remarks' },
    { step: '07', path: '/government/reports', label: 'Verified Map & GIS Export', icon: FileText, subtitle: 'PostGIS DB, GeoJSON, Shapefile, PDF' },
    { step: '08', path: '/government/complaints', label: 'Grievance & Complaints', icon: MessageSquare, subtitle: 'Citizen Dispute Resolution Pipeline' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 h-full select-none shrink-0">
      {/* Module Title */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/80 flex justify-between items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">P2P Cadastral Engine</span>
          <span className="text-xs font-bold text-white">Government Workflow</span>
        </div>
        <span className="bg-blue-900/80 text-blue-300 text-[10px] px-2 py-0.5 rounded border border-blue-700 font-mono font-bold">DoLR</span>
      </div>

      {/* Executive Overview Link */}
      <div className="p-2 border-b border-slate-800/60">
        <NavLink
          to="/government/dashboard"
          className={({ isActive }) =>
            `flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${isActive
              ? 'bg-blue-600 text-white font-bold shadow'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Executive Dashboard</span>
        </NavLink>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Architecture Workflow Steps
        </div>

        {workflowSteps.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-start space-x-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${isActive
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="text-[10px] font-mono font-bold bg-slate-800 text-amber-400 px-1 py-0.5 rounded shrink-0 mt-0.5 border border-slate-700">
                {item.step}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5 truncate font-semibold">
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span className="truncate">{item.label}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-normal truncate leading-tight mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </NavLink>
          );
        })}

        {/* Public Citizen Portal */}
        <div className="pt-2 border-t border-slate-800/80 mt-2">
          <NavLink
            to="/citizen/home"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-900/50 transition-colors"
          >
            <span>Citizen Portal (Public)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </nav>

      {/* Sidebar Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-400">
        <div className="flex justify-between items-center mb-1 font-semibold text-slate-300">
          <span>Spatial Reference</span>
          <span className="text-amber-400 font-mono">EPSG:4326</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          Survey Officer & GIS Analyst Workflow. Ministry of Rural Development.
        </p>
      </div>
    </aside>
  );
};
