import React, { useState } from 'react';
import { Search, MapPin, ShieldCheck, Info, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { OpenLayersMap } from '../components/gis/OpenLayersMap';
import { api } from '../services/api';
import { useGISStore } from '../store/gisStore';

export const CitizenSearchPage: React.FC = () => {
  const { setSelectedParcel, selectedParcel } = useGISStore();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setErrorMsg(null);
    try {
      // Query public-safe parcel lookup (verified parcels only, PII stripped)
      const data = await api.getPublicParcelLookup(query.trim());
      if (data.features && data.features.length > 0) {
        setSelectedParcel(data.features[0] as any);
      } else {
        setErrorMsg(`No verified cadastral parcel found matching '${query.trim()}'.`);
      }
    } catch (err: any) {
      console.error("Public lookup error:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to search public cadastral database.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900 select-none">
      {/* Search Header Bar */}
      <div className="absolute top-4 left-4 z-20 bg-white border border-slate-300 rounded-xl p-3.5 shadow-xl w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-100px)] overflow-y-auto">
        <div className="flex items-center space-x-2 text-xs font-bold text-govt-navy mb-2">
          <Search className="w-4 h-4 text-blue-600" />
          <span>Public Cadastral Parcel Lookup (Verified Parcels)</span>
        </div>

        <form onSubmit={handleSearch} className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter Parcel ID (e.g. P2P-IND-MH-4001) or Survey No..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={searching}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors shrink-0 flex items-center space-x-1"
          >
            {searching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-3 bg-amber-50 border border-amber-300 text-amber-900 p-2.5 rounded-lg text-[11px] font-bold flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {selectedParcel && (
          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-blue-700">{selectedParcel.properties.parcel_id}</span>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">Officially Verified</span>
            </div>
            <div className="space-y-1 text-slate-700">
              <div>Survey Number: <strong>{selectedParcel.properties.survey_number}</strong></div>
              <div>Village / Tehsil: <strong>{selectedParcel.properties.village}, {selectedParcel.properties.taluk}</strong></div>
              <div>Geodesic Area: <strong>{selectedParcel.properties.area_sqm?.toLocaleString()} sq.m</strong></div>
              <div>Land Use: <strong>{selectedParcel.properties.land_use}</strong></div>
              <div>Registered Owner: <strong>{selectedParcel.properties.owner_name}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Map View */}
      <OpenLayersMap />
    </div>
  );
};
