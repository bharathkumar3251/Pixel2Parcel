import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, MapPin, Edit3, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { TopologyIssue } from '../types/gis';
import { useNavigate } from 'react-router-dom';
import { useGISStore } from '../store/gisStore';

export const TopologyPage: React.FC = () => {
  const navigate = useNavigate();
  const { setIsEditingGeometry, dataVersion } = useGISStore();
  const [issues, setIssues] = useState<TopologyIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTopology = async () => {
    setIsScanning(true);
    setErrorMsg(null);
    try {
      const res = await api.checkTopology();
      setIssues(res.issues || []);
    } catch (err: any) {
      console.error("Topology check error:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to execute Shapely topology scan.");
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    fetchTopology();
  }, [dataVersion]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <span className="bg-red-100 text-red-800 border border-red-300 font-bold px-2 py-0.5 rounded text-[10px]">Critical</span>;
      case 'High':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded text-[10px]">High</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">{severity}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-xs text-amber-600 font-bold uppercase mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Workflow Step 04 • Diamond Decision Module</span>
          </div>
          <h1 className="text-xl font-bold text-govt-navy">TOPOLOGY VALIDATION ENGINE</h1>
          <p className="text-xs text-slate-500 mt-1">
            Polygon Overlap • Gap Detection • Self Intersection • Boundary Conflict • Encroachment • Invalid Geometry
          </p>
        </div>

        <button
          onClick={fetchTopology}
          disabled={isScanning}
          className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-lg text-xs shadow flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning Topology Rules...' : 'Re-Run Shapely Scan'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-xl flex items-center space-x-2 text-xs font-bold shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Issues Table Card */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2 font-bold text-xs text-govt-navy">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Detected Topological Conflicts & Boundary Violations</span>
          </div>
          <span className={`font-bold px-2.5 py-1 rounded text-xs ${issues.length > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
            {issues.length} Issues Flagged
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isScanning ? (
            <div className="text-center py-12 text-slate-500 text-xs flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
              <span>Executing Shapely geometric topology validation rules...</span>
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-12 text-emerald-700 text-xs flex flex-col items-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <p className="font-bold text-sm">Topology Check Passed Cleanly!</p>
              <p className="text-slate-500 text-[11px]">0 polygon overlaps, gaps, or self-intersections detected in cadastral layer.</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-100 uppercase text-[10px] text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Parcel ID</th>
                  <th className="p-3">Conflict Category</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Diagnostic Description</th>
                  <th className="p-3">Coordinates (Lat, Lon)</th>
                  <th className="p-3 text-right">Resolve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {issues.map((issue, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-700">{issue.parcel_id}</td>
                    <td className="p-3 font-bold text-slate-900">{issue.issue_type}</td>
                    <td className="p-3">{getSeverityBadge(issue.severity)}</td>
                    <td className="p-3 font-medium text-slate-800 max-w-md">{issue.description}</td>
                    <td className="p-3 font-mono text-slate-600">
                      [{issue.coordinates[1].toFixed(4)}°N, {issue.coordinates[0].toFixed(4)}°E]
                    </td>
                    <td className="p-3 text-right flex justify-end space-x-2">
                      <button
                        onClick={async () => {
                          const parcelsData = await api.getParcels();
                          const match = parcelsData.features.find(f => f.properties.parcel_id === issue.parcel_id);
                          if (match) {
                            useGISStore.getState().setSelectedParcel(match);
                          }
                          navigate('/government/workspace');
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-1 px-2.5 rounded text-[11px] flex items-center space-x-1 border border-slate-300"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>Zoom to Issue</span>
                      </button>
                      <button
                        onClick={async () => {
                          const parcelsData = await api.getParcels();
                          const match = parcelsData.features.find(f => f.properties.parcel_id === issue.parcel_id);
                          if (match) {
                            useGISStore.getState().setSelectedParcel(match);
                          }
                          setIsEditingGeometry(true);
                          navigate('/government/editor');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2.5 rounded text-[11px] flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Vertices</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
