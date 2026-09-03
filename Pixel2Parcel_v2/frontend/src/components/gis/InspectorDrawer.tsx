import React from 'react';
import { X, FileText, Edit3, ShieldCheck, AlertTriangle, MapPin, CheckCircle, Compass, Layers } from 'lucide-react';
import { useGISStore } from '../../store/gisStore';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const InspectorDrawer: React.FC = () => {
  const { selectedParcel, setSelectedParcel, setIsEditingGeometry } = useGISStore();
  const navigate = useNavigate();

  if (!selectedParcel) return null;

  const props = selectedParcel.properties;
  const areaAcres = (props.area_sqm / 4046.86).toFixed(3);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'Green':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded text-xs">Low Risk</span>;
      case 'Amber':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded text-xs">Medium Risk</span>;
      case 'Red':
        return <span className="bg-red-100 text-red-800 border border-red-300 font-bold px-2 py-0.5 rounded text-xs">High Risk / Conflict</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">{level}</span>;
    }
  };

  const handleDownloadPdf = () => {
    const pdfUrl = api.getReportPdfUrl(props.parcel_id);
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="fixed right-4 top-20 bottom-12 max-h-[calc(100vh-100px)] w-96 max-w-[calc(100vw-2rem)] bg-white border border-slate-300 rounded-lg shadow-2xl z-40 flex flex-col overflow-hidden select-none animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="bg-govt-navy text-white px-4 py-3 flex justify-between items-center border-b border-amber-500 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-500 text-slate-900 font-extrabold text-[10px] px-1.5 py-0.5 rounded uppercase">Parcel Inspector</span>
            <span className="font-mono text-xs font-bold text-slate-200">{props.parcel_id}</span>
          </div>
          <h2 className="text-sm font-bold text-white mt-0.5">Survey No. {props.survey_number} ({props.village})</h2>
        </div>
        <button onClick={() => setSelectedParcel(null)} className="text-slate-300 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs min-h-0">
        {/* Risk & Confidence Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">AI Parcel Confidence</div>
            <div className="text-xl font-extrabold text-govt-navy">{props.confidence_score}%</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Risk Category</div>
            {getRiskBadge(props.risk_level)}
          </div>
        </div>

        {/* Administrative Location Attributes */}
        <div>
          <h3 className="font-bold text-govt-navy border-b border-slate-200 pb-1 mb-2 flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Administrative Location</span>
          </h3>
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 block">State</span>
              <span className="font-semibold text-slate-800">{props.state}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">District</span>
              <span className="font-semibold text-slate-800">{props.district}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Taluk / Tehsil</span>
              <span className="font-semibold text-slate-800">{props.taluk}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Village / Ward</span>
              <span className="font-semibold text-slate-800">{props.village} ({props.ward_number})</span>
            </div>
          </div>
        </div>

        {/* Land Record Attributes */}
        <div>
          <h3 className="font-bold text-govt-navy border-b border-slate-200 pb-1 mb-2 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Record Ownership & Land Use</span>
          </h3>
          <div className="space-y-2 bg-slate-50 p-2.5 rounded border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 block">Record Owner (7/12 Extract)</span>
              <span className="font-bold text-slate-900">{props.owner_name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 block">Land Use Category</span>
                <span className="font-semibold text-slate-800">{props.land_use}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Verification Status</span>
                <span className="font-semibold text-blue-700">{props.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spatial Geometry Metrics */}
        <div>
          <h3 className="font-bold text-govt-navy border-b border-slate-200 pb-1 mb-2 flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Geodesic Geometry Metrics</span>
          </h3>
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 block">Geodesic Area</span>
              <span className="font-bold text-emerald-800">{props.area_sqm.toLocaleString()} sq.m</span>
              <span className="text-[10px] text-slate-500 block">({areaAcres} Acres)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Calculated Perimeter</span>
              <span className="font-bold text-slate-900">{props.perimeter_m} m</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Polysby Compactness</span>
              <span className="font-semibold text-slate-800">{props.compactness}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Spatial Datum</span>
              <span className="font-mono text-slate-800">EPSG:4326</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Action Buttons */}
      <div className="p-3 bg-slate-100 border-t border-slate-300 space-y-2">
        <button
          onClick={handleDownloadPdf}
          className="w-full bg-govt-navy hover:bg-blue-800 text-white font-bold py-2 px-3 rounded flex items-center justify-center space-x-2 transition-colors shadow-sm"
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Generate Official PDF Report</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate('/government/topology')}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-1.5 px-2 rounded flex items-center justify-center space-x-1"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Check Topology</span>
          </button>
          <button
            onClick={() => {
              setIsEditingGeometry(true);
              navigate('/government/editor');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-2 rounded flex items-center justify-center space-x-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Vertices</span>
          </button>
        </div>
      </div>
    </div>
  );
};
