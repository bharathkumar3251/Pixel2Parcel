import React, { useState } from 'react';
import { OpenLayersMap } from '../components/gis/OpenLayersMap';
import { LayerManager } from '../components/gis/LayerManager';
import { InspectorDrawer } from '../components/gis/InspectorDrawer';
import { MeasureTool } from '../components/gis/MeasureTool';
import { WmsLayerModal } from '../components/gis/WmsLayerModal';
import { useGISStore } from '../store/gisStore';
import { 
  Layers, Search, Globe, MapPin, Navigation, Maximize, 
  Plus, Check, Sparkles, Filter 
} from 'lucide-react';
import { api } from '../services/api';

export const GISWorkspacePage: React.FC = () => {
  const { 
    activeBasemap, 
    setActiveBasemap, 
    mouseCoords,
    selectedParcel,
    setSelectedParcel
  } = useGISStore();

  const [showLayerManager, setShowLayerManager] = useState(true);
  const [showWmsModal, setShowWmsModal] = useState(false);
  const [activeMeasureTool, setActiveMeasureTool] = useState<'distance' | 'area' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // 1. First check if searching by Parcel ID (e.g. P2P-IND-MH-4001)
      const parcels = await api.getParcels();
      const match = parcels.features.find(f => 
        f.properties.parcel_id.toLowerCase() === searchQuery.trim().toLowerCase() ||
        f.properties.survey_number.toLowerCase() === searchQuery.trim().toLowerCase()
      );

      if (match) {
        setSelectedParcel(match);
        setIsSearching(false);
        setSearchResults([]);
        return;
      }

      // 2. Otherwise search live Nominatim API
      const results = await api.searchNominatim(searchQuery);
      setSearchResults(results || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900 select-none">
      {/* Top Floating GIS Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Group: Search Bar & Presets */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center bg-white/95 backdrop-blur border border-slate-300 rounded-lg shadow-md overflow-hidden">
              <div className="pl-3 text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search Parcel ID (e.g. P2P-IND-MH-4001) or Address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 px-2 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 transition-colors"
              >
                {isSearching ? 'Searching...' : 'Find'}
              </button>
            </div>

            {/* Nominatim Search Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-xl overflow-hidden z-50 text-xs">
                {searchResults.map((res, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSearchQuery(res.display_name);
                      setSearchResults([]);
                    }}
                    className="p-2.5 hover:bg-blue-50 border-b border-slate-100 cursor-pointer text-slate-800 truncate"
                  >
                    <div className="font-bold flex items-center space-x-1 text-slate-900">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{res.display_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Measurement Toolbar */}
          <MeasureTool
            activeTool={activeMeasureTool}
            onSelectTool={setActiveMeasureTool}
          />
        </div>

        {/* Center Basemap Switcher */}
        <div className="bg-white/95 backdrop-blur border border-slate-300 rounded-lg shadow-md p-1 flex items-center space-x-1 pointer-events-auto text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2 border-r border-slate-200">
            Basemap
          </span>
          <button
            onClick={() => setActiveBasemap('esri')}
            className={`px-2.5 py-1 rounded font-semibold transition-all ${
              activeBasemap === 'esri' ? 'bg-govt-navy text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Esri Satellite
          </button>
          <button
            onClick={() => setActiveBasemap('osm')}
            className={`px-2.5 py-1 rounded font-semibold transition-all ${
              activeBasemap === 'osm' ? 'bg-govt-navy text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            OpenStreetMap
          </button>
          <button
            onClick={() => setActiveBasemap('carto')}
            className={`px-2.5 py-1 rounded font-semibold transition-all ${
              activeBasemap === 'carto' ? 'bg-govt-navy text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Carto Light
          </button>
          <button
            onClick={() => setActiveBasemap('opentopo')}
            className={`px-2.5 py-1 rounded font-semibold transition-all ${
              activeBasemap === 'opentopo' ? 'bg-govt-navy text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            OpenTopo
          </button>
        </div>

        {/* Right Tools Group: Add WMS & Toggle Layer Manager */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={() => setShowWmsModal(true)}
            className="bg-white/95 hover:bg-blue-50 text-blue-700 font-bold border border-slate-300 px-3 py-2 rounded-lg text-xs shadow-md flex items-center space-x-1.5 transition-colors"
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Add WMS/WMTS</span>
          </button>

          <button
            onClick={() => setShowLayerManager(!showLayerManager)}
            className={`px-3 py-2 rounded-lg text-xs font-bold border shadow-md flex items-center space-x-1.5 transition-colors ${
              showLayerManager
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white/95 text-slate-800 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Layers</span>
          </button>
        </div>
      </div>

      {/* Floating Layer Manager Overlay */}
      {showLayerManager && (
        <div className="absolute top-16 left-3 z-30 pointer-events-auto">
          <LayerManager />
        </div>
      )}

      {/* Main 2D OpenLayers Canvas */}
      <OpenLayersMap />

      {/* Inspector Drawer */}
      <InspectorDrawer />

      {/* Bottom Live Mouse Coordinates Status Bar */}
      <div className="absolute bottom-3 left-3 z-20 bg-govt-navy/90 text-white border border-slate-700 px-3 py-1.5 rounded-lg shadow-lg backdrop-blur text-xs flex items-center space-x-4 pointer-events-auto font-mono">
        <div className="flex items-center space-x-1.5 text-amber-400">
          <Navigation className="w-3.5 h-3.5" />
          <span>Coordinates:</span>
        </div>
        <div>
          <span className="text-slate-400">Lat:</span>{' '}
          <span className="text-white font-bold">{mouseCoords ? mouseCoords.lat : '18.558200'}°N</span>
        </div>
        <div>
          <span className="text-slate-400">Lon:</span>{' '}
          <span className="text-white font-bold">{mouseCoords ? mouseCoords.lon : '73.789500'}°E</span>
        </div>
        <div className="border-l border-slate-700 pl-3">
          <span className="text-slate-400">UTM:</span>{' '}
          <span className="text-emerald-400 font-bold">{mouseCoords ? mouseCoords.utm : '43N E:372140m N:2052840m'}</span>
        </div>
      </div>

      {/* WMS Layer Connection Modal */}
      <WmsLayerModal
        isOpen={showWmsModal}
        onClose={() => setShowWmsModal(false)}
      />
    </div>
  );
};
