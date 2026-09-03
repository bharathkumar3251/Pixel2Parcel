import React, { useState } from 'react';
import { Ruler, Maximize2, X, Check } from 'lucide-react';

interface Props {
  onSelectTool: (tool: 'distance' | 'area' | null) => void;
  activeTool: 'distance' | 'area' | null;
  measurementResult?: string | null;
}

export const MeasureTool: React.FC<Props> = ({ onSelectTool, activeTool, measurementResult }) => {
  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-md p-1.5 flex items-center space-x-1 select-none text-xs">
      <button
        onClick={() => onSelectTool(activeTool === 'distance' ? null : 'distance')}
        className={`flex items-center space-x-1 px-2.5 py-1.5 rounded font-semibold transition-colors ${
          activeTool === 'distance'
            ? 'bg-blue-600 text-white'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
        title="Measure Distance in Meters"
      >
        <Ruler className="w-3.5 h-3.5" />
        <span>Distance</span>
      </button>

      <button
        onClick={() => onSelectTool(activeTool === 'area' ? null : 'area')}
        className={`flex items-center space-x-1 px-2.5 py-1.5 rounded font-semibold transition-colors ${
          activeTool === 'area'
            ? 'bg-blue-600 text-white'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
        title="Measure Polygon Area in Sq.M"
      >
        <Maximize2 className="w-3.5 h-3.5" />
        <span>Area</span>
      </button>

      {activeTool && (
        <button
          onClick={() => onSelectTool(null)}
          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded"
          title="Clear Measurement"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {measurementResult && (
        <div className="bg-amber-100 border border-amber-300 text-amber-900 font-mono font-bold px-2 py-1 rounded text-xs ml-2">
          {measurementResult}
        </div>
      )}
    </div>
  );
};
