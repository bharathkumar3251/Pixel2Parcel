import React, { useState, useEffect } from 'react';
import { CesiumMap } from '../components/gis/CesiumMap';
import { Box, Upload, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const Cesium3DPage: React.FC = () => {
  const navigate = useNavigate();
  const [hasDsm, setHasDsm] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.getSurveys().then(res => {
      const surveys = res.surveys || [];
      const dsmExists = surveys.length > 0 || surveys.some((s: any) => {
        const ext = s.extension?.toLowerCase();
        const fn = s.filename?.toLowerCase() || '';
        return fn.includes('dsm') || fn.includes('dtm') || ext === '.tif' || ext === '.tiff';
      });
      // Always enable 3D Digital Twin workspace (sample/DSM data available)
      setHasDsm(true);
    }).catch(err => {
      console.error("Survey check error:", err);
      setHasDsm(true); // Fallback to 3D sample twin mode
    }).finally(() => {
      setChecking(false);
    });
  }, []);

  return (
    <div className="w-full h-full relative bg-slate-950 select-none">
      {checking ? (
        <div className="flex items-center justify-center h-full text-slate-400 text-xs space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          <span>Initializing 3D Cadastral Engine...</span>
        </div>
      ) : !hasDsm ? (
        <div className="flex items-center justify-center h-full p-6">
          <div className="max-w-md bg-white border border-slate-300 rounded-2xl p-8 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
              <Box className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-govt-navy">3D Terrain Workspace Inactive</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Upload a Digital Surface Model (DSM) or Digital Terrain Model (DTM) GeoTIFF in the Survey Workspace to enable 3D terrain elevation mesh rendering.
              </p>
            </div>

            <button
              onClick={() => navigate('/government/upload')}
              className="w-full bg-govt-navy hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow transition-colors"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Upload DSM / DTM in Survey Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <CesiumMap />
      )}
    </div>
  );
};
