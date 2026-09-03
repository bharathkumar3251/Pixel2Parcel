import React from 'react';
import { Eye, EyeOff, Sliders, Layers, Trash2, ZoomIn } from 'lucide-react';
import { useGISStore } from '../../store/gisStore';

export const LayerManager: React.FC = () => {
  const { layers, toggleLayerVisibility, setLayerOpacity, removeLayer } = useGISStore();

  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-lg w-72 p-3 text-xs select-none">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
        <div className="flex items-center space-x-2 font-bold text-govt-navy">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Layer Manager</span>
        </div>
        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-300">
          {layers.length} Layers
        </span>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {layers.map((layer) => (
          <div key={layer.id} className="border border-slate-200 rounded p-2 bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2 truncate">
                <button
                  onClick={() => toggleLayerVisibility(layer.id)}
                  className="text-slate-600 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  {layer.visible ? <Eye className="w-4 h-4 text-blue-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                </button>
                <span className={`font-semibold truncate ${layer.visible ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                  {layer.name}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {layer.featureCount !== undefined && (
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                    {layer.featureCount}
                  </span>
                )}
              </div>
            </div>

            {/* Opacity Control */}
            {layer.visible && (
              <div className="mt-2 pt-1 border-t border-slate-200 flex items-center space-x-2">
                <Sliders className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] text-slate-500 w-12">Opacity: {Math.round(layer.opacity * 100)}%</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={layer.opacity}
                  onChange={(e) => setLayerOpacity(layer.id, parseFloat(e.target.value))}
                  className="w-full accent-blue-600 h-1 bg-slate-200 rounded cursor-pointer"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
