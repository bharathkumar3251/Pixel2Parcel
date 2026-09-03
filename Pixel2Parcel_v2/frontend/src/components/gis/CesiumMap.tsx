import React, { useEffect, useRef } from 'react';
import { Box, Compass, RotateCcw, Layers, MapPin } from 'lucide-react';
import { useGISStore } from '../../store/gisStore';
import { useNavigate } from 'react-router-dom';

export const CesiumMap: React.FC = () => {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const { setViewMode } = useGISStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!cesiumContainerRef.current) return;

    // Load Cesium dynamically
    import('cesium').then((Cesium) => {
      // Set Cesium Ion default access token
      Cesium.Ion.defaultAccessToken = '';

      const viewer = new Cesium.Viewer(cesiumContainerRef.current!, {
        animation: false,
        timeline: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        navigationHelpButton: false,
        fullscreenButton: false
      });

      // Fly camera to Pune Baner Cadastral Survey location
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(73.7895, 18.5582, 450),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-45.0),
          roll: 0.0
        }
      });

      // Add 3D Extruded Buildings for IT Complex & Residential Parcels
      const building1 = viewer.entities.add({
        name: "Commercial IT Complex (P2P-IND-MH-4003)",
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray([
            73.7887, 18.5584,
            73.7893, 18.5584,
            73.7893, 18.5591,
            73.7887, 18.5591
          ]),
          height: 0,
          extrudedHeight: 24, // 24m Height (8 floors)
          material: Cesium.Color.fromCssColorString('#1D4ED8').withAlpha(0.8),
          outline: true,
          outlineColor: Cesium.Color.WHITE
        }
      });

      const building2 = viewer.entities.add({
        name: "Residential Complex (P2P-IND-MH-4001)",
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray([
            73.7887, 18.5577,
            73.7890, 18.5577,
            73.7890, 18.5580,
            73.7887, 18.5580
          ]),
          height: 0,
          extrudedHeight: 12.5, // 12.5m Height (4 floors)
          material: Cesium.Color.fromCssColorString('#166534').withAlpha(0.8),
          outline: true,
          outlineColor: Cesium.Color.WHITE
        }
      });

      // Add 3D Parcel Boundary Polygons
      viewer.entities.add({
        name: "Cadastral Parcel P2P-IND-MH-4001",
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray([
            73.7885, 18.5575,
            73.7892, 18.5575,
            73.7892, 18.5582,
            73.7885, 18.5582
          ]),
          material: Cesium.Color.fromCssColorString('#22C55E').withAlpha(0.3),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#166534')
        }
      });
    }).catch(err => console.error("Cesium loading error:", err));

  }, []);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      {/* Cesium Canvas Container */}
      <div ref={cesiumContainerRef} className="w-full h-full" />

      {/* Floating 3D Controls Toolbar */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/90 text-white border border-slate-700 rounded-lg p-3 shadow-2xl backdrop-blur select-none">
        <div className="flex items-center space-x-2 font-bold text-xs border-b border-slate-700 pb-2 mb-2">
          <Box className="w-4 h-4 text-amber-400" />
          <span>CesiumJS 3D Terrain & Building Workspace</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between space-x-4">
            <span className="text-slate-400">View Mode:</span>
            <span className="font-semibold text-blue-400">3D Photogrammetric Mesh</span>
          </div>

          <div className="flex items-center justify-between space-x-4">
            <span className="text-slate-400">DSM Elevation:</span>
            <span className="font-mono text-emerald-400">562.8m AMSL</span>
          </div>

          <div className="pt-2 border-t border-slate-700 flex space-x-2">
            <button
              onClick={() => {
                setViewMode('2d');
                navigate('/government/workspace');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-1.5 px-3 rounded text-xs transition-colors flex items-center justify-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Switch to 2D OpenLayers</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
