import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, Download, ExternalLink, Filter, Map, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { ParcelFeature } from '../types/gis';
import { useNavigate } from 'react-router-dom';
import { useGISStore } from '../store/gisStore';

export const ParcelExtractPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedParcel, dataVersion } = useGISStore();
  const [parcels, setParcels] = useState<ParcelFeature[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchParcels = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getParcels();
      setParcels(data.features || []);
    } catch (err: any) {
      console.error("Fetch parcels error:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to load cadastral parcel database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, [dataVersion]);

  const filtered = parcels.filter(p => 
    p.properties.parcel_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.properties.survey_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.properties.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'Green':
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">Low Risk</span>;
      case 'Amber':
        return <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">Medium Risk</span>;
      case 'Red':
        return <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[10px]">High Risk</span>;
      default:
        return <span>{level}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-xs text-blue-600 font-bold uppercase mb-1">
            <Layers className="w-4 h-4" />
            <span>Workflow Steps 03 & 04 • Boundary & Vector Engine</span>
          </div>
          <h1 className="text-xl font-bold text-govt-navy">AI PARCEL EXTRACTION & GIS POLYGON GENERATION</h1>
          <p className="text-xs text-slate-500 mt-1">
            Boundary Delineation • Parcel Mask Generation • Vector Conversion (GeoJSON / Shapefile / Editable Polygons)
          </p>
        </div>

        <button
          onClick={() => navigate('/government/topology')}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs shadow flex items-center space-x-1.5 transition-colors"
        >
          <span>Run Topology Validation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-xl flex items-center space-x-2 text-xs font-bold shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Filter by Parcel ID, Survey No, or Owner Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />

          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={fetchParcels}
              className="text-blue-600 font-bold hover:underline flex items-center space-x-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <span className="text-slate-500 font-medium">
              Total Cadastral Parcels: <strong className="text-slate-900 font-mono">{filtered.length}</strong>
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 text-xs flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Fetching verified parcels from backend...</span>
            </div>
          ) : parcels.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-3">
              <Layers className="w-10 h-10 mx-auto text-slate-400" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Awaiting Dataset Upload</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  No cadastral parcel geometries found. Upload a survey file in the Data Ingestion Studio to run parcel extraction.
                </p>
              </div>
              <button
                onClick={() => navigate('/government/upload')}
                className="bg-govt-navy hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-lg text-xs shadow inline-flex items-center space-x-1.5"
              >
                <span>Go to Survey Data Ingestion Studio</span>
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <p>No matching cadastral parcels found for search query '{searchTerm}'.</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-100 uppercase text-[10px] text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Parcel ID</th>
                  <th className="p-3">Survey No.</th>
                  <th className="p-3">Record Owner</th>
                  <th className="p-3">Land Use</th>
                  <th className="p-3 text-right">Area (sq.m)</th>
                  <th className="p-3 text-right">Perimeter (m)</th>
                  <th className="p-3 text-center">Confidence</th>
                  <th className="p-3 text-center">Risk Rating</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((p, idx) => {
                  const props = p.properties;
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">{props.parcel_id}</td>
                      <td className="p-3 font-semibold text-slate-900">{props.survey_number}</td>
                      <td className="p-3 font-medium text-slate-800">{props.owner_name}</td>
                      <td className="p-3">{props.land_use}</td>
                      <td className="p-3 text-right font-bold text-emerald-800">{props.area_sqm.toLocaleString()}</td>
                      <td className="p-3 text-right font-semibold text-slate-700">{props.perimeter_m}</td>
                      <td className="p-3 text-center font-bold text-slate-900">{props.confidence_score}%</td>
                      <td className="p-3 text-center">{getRiskBadge(props.risk_level)}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedParcel(p);
                            navigate('/government/workspace');
                          }}
                          className="text-blue-600 font-bold hover:underline flex items-center space-x-1 justify-end"
                        >
                          <Map className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
