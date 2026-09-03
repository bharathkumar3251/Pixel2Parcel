import React, { useState } from 'react';
import { X, Globe, Plus, Link, CheckCircle2 } from 'lucide-react';
import { useGISStore } from '../../store/gisStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WmsLayerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addLayer } = useGISStore();
  const [layerName, setLayerName] = useState('');
  const [serviceType, setServiceType] = useState<'wms' | 'wmts' | 'arcgis'>('wms');
  const [serviceUrl, setServiceUrl] = useState('');
  const [layerNameParam, setLayerNameParam] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!layerName || !serviceUrl) return;

    const newLayerId = `ext_${Date.now()}`;
    addLayer({
      id: newLayerId,
      name: `${layerName} (${serviceType.toUpperCase()})`,
      type: 'wms',
      url: serviceUrl,
      visible: true,
      opacity: 0.9,
      crs: 'EPSG:4326'
    });

    setStatusMsg(`Service '${layerName}' connected and added to map workspace!`);
    setTimeout(() => {
      setStatusMsg('');
      onClose();
    }, 1200);
  };

  const sampleServices = [
    { name: 'Survey of India Topographic WMS', url: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms', type: 'wms' },
    { name: 'ISRO Bhuvan Satellite Imagery WMTS', url: 'https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms', type: 'wmts' },
    { name: 'National Land Records GeoServer', url: 'https://geoserver.dolr.gov.in/geoserver/wms', type: 'wms' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-govt-navy text-white px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 font-bold text-sm">
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Connect External Government WMS / WMTS Service</span>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAdd} className="p-4 space-y-4 text-xs">
          {statusMsg && (
            <div className="bg-emerald-100 border border-emerald-400 text-emerald-800 p-2.5 rounded flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{statusMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Layer Title / Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Survey of India Cadastral Layer"
              value={layerName}
              onChange={(e) => setLayerName(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Service Protocol</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="wms">OGC WMS (Web Map Service)</option>
                <option value="wmts">OGC WMTS (Web Map Tile Service)</option>
                <option value="arcgis">ArcGIS REST Map Server</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Layer Identifier / Name</label>
              <input
                type="text"
                placeholder="e.g. dolr:cadastral_parcels"
                value={layerNameParam}
                onChange={(e) => setLayerNameParam(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">WMS / WMTS Service Endpoint URL *</label>
            <div className="flex items-center space-x-2">
              <Link className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="url"
                required
                placeholder="https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms"
                value={serviceUrl}
                onChange={(e) => setServiceUrl(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 font-mono text-[11px] focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="block font-semibold text-slate-600 mb-1.5">Official Government Presets:</span>
            <div className="space-y-1.5">
              {sampleServices.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setLayerName(preset.name);
                    setServiceUrl(preset.url);
                    setServiceType(preset.type as any);
                  }}
                  className="w-full text-left bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-2 rounded flex justify-between items-center transition-colors"
                >
                  <span className="font-medium text-slate-800">{preset.name}</span>
                  <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                    {preset.type.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service Layer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
