import React from 'react';
import { GIS_CONFIG } from '../../config/gisConfig';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 px-4 py-2 text-xs flex justify-between items-center z-20 select-none font-sans">
      <div className="flex items-center space-x-3">
        <span className="font-medium">{GIS_CONFIG.FOOTER_TEXT}</span>
      </div>
      <div className="flex items-center space-x-4 text-[11px]">
        <span>Official Urban Cadastral Verification Platform</span>
        <span className="text-amber-400 font-semibold font-mono">EPSG:4326</span>
      </div>
    </footer>
  );
};
