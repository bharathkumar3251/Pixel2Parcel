import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Compass,
  RotateCcw,
  Layers,
  MapPin,
  Sun,
  Building2,
  TrendingUp,
  Eye,
  Sliders,
  Ruler,
  Maximize2,
  Info,
  Play,
  Pause
} from 'lucide-react';
import { useGISStore } from '../../store/gisStore';
import { useNavigate } from 'react-router-dom';

interface Building3D {
  id: string;
  name: string;
  parcelId: string;
  landUse: string;
  baseHeight: number;
  extrudedHeight: number;
  floors: number;
  footprintArea: number; // sq m
  parcelArea: number; // sq m
  color: string;
  coordinates: number[];
}

export const CesiumMap: React.FC = () => {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const buildingEntitiesRef = useRef<Record<string, any>>({});
  const { setViewMode } = useGISStore();
  const navigate = useNavigate();

  // Active Control Panel Tab
  const [activeTab, setActiveTab] = useState<'extrusion' | 'shadows' | 'elevation' | 'inspector'>('extrusion');

  // Building Extrusion State
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('bld-1');
  const [buildingHeight, setBuildingHeight] = useState<number>(24);
  const [landUseZoning, setLandUseZoning] = useState<string>('Commercial IT');

  // Shadow Simulation State
  const [timeOfDay, setTimeOfDay] = useState<number>(14); // 14:00 (2 PM)
  const [shadowsEnabled, setShadowsEnabled] = useState<boolean>(true);
  const [season, setSeason] = useState<string>('Summer Solstice');
  const [isAnimatingTime, setIsAnimatingTime] = useState<boolean>(false);

  // Terrain Elevation Profile State
  const [profilingActive, setProfilingActive] = useState<boolean>(false);
  const [profileResult, setProfileResult] = useState<{
    lengthMeters: number;
    startElev: number;
    endElev: number;
    maxElev: number;
    minElev: number;
    avgSlopeDeg: number;
    samples: { distance: number; elev: number }[];
  } | null>({
    lengthMeters: 420.5,
    startElev: 562.1,
    endElev: 578.4,
    maxElev: 581.2,
    minElev: 561.8,
    avgSlopeDeg: 4.8,
    samples: [
      { distance: 0, elev: 562.1 },
      { distance: 70, elev: 564.5 },
      { distance: 140, elev: 569.2 },
      { distance: 210, elev: 574.0 },
      { distance: 280, elev: 581.2 },
      { distance: 350, elev: 579.0 },
      { distance: 420.5, elev: 578.4 }
    ]
  });

  // Selected Entity Info
  const [inspectedEntity, setInspectedEntity] = useState<any>({
    parcelId: 'P2P-IND-MH-4003',
    surveyNo: '107/3B',
    owner: 'Vertex Tech Parks Pvt. Ltd.',
    structureType: 'Commercial RCC Frame (G+7)',
    footprint: '1,450 sq.m',
    totalBuiltup: '11,600 sq.m',
    farAllowed: 2.50,
    farActual: 2.12,
    complianceStatus: 'Compliant',
    lastSurveyed: '2026-08-18'
  });

  // Sample initial 3D building dataset
  const buildings: Building3D[] = [
    {
      id: 'bld-1',
      name: 'Commercial IT Complex (Tower A)',
      parcelId: 'P2P-IND-MH-4003',
      landUse: 'Commercial IT',
      baseHeight: 0,
      extrudedHeight: 24,
      floors: 8,
      footprintArea: 1450,
      parcelArea: 5500,
      color: '#1D4ED8',
      coordinates: [73.7887, 18.5584, 73.7893, 18.5584, 73.7893, 18.5591, 73.7887, 18.5591]
    },
    {
      id: 'bld-2',
      name: 'Residential Apartments (Block 1)',
      parcelId: 'P2P-IND-MH-4001',
      landUse: 'Residential High-Density',
      baseHeight: 0,
      extrudedHeight: 15,
      floors: 5,
      footprintArea: 920,
      parcelArea: 3200,
      color: '#166534',
      coordinates: [73.7887, 18.5577, 73.7890, 18.5577, 73.7890, 18.5580, 73.7887, 18.5580]
    },
    {
      id: 'bld-3',
      name: 'Light Industrial Workshop',
      parcelId: 'P2P-IND-MH-4004',
      landUse: 'Industrial',
      baseHeight: 0,
      extrudedHeight: 9,
      floors: 2,
      footprintArea: 1800,
      parcelArea: 4800,
      color: '#D97706',
      coordinates: [73.7895, 18.5574, 73.7901, 18.5574, 73.7901, 18.5579, 73.7895, 18.5579]
    }
  ];

  // Initialize Cesium
  useEffect(() => {
    if (!cesiumContainerRef.current) return;

    let isMounted = true;

    import('cesium').then((Cesium) => {
      if (!isMounted || !cesiumContainerRef.current) return;

      Cesium.Ion.defaultAccessToken = '';

      const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
        animation: false,
        timeline: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        navigationHelpButton: false,
        fullscreenButton: false,
        infoBox: true,
        selectionIndicator: true
      });

      viewerRef.current = viewer;

      // Enable shadows
      viewer.shadows = shadowsEnabled;
      viewer.terrainShadows = Cesium.ShadowMode.RECEIVE_ONLY;

      // Set initial clock time (14:00 UTC)
      const date = new Date(2026, 5, 21, timeOfDay, 0, 0); // June 21, 2026
      viewer.clock.currentTime = Cesium.JulianDate.fromDate(date);

      // Camera view setup
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(73.7895, 18.5582, 480),
        orientation: {
          heading: Cesium.Math.toRadians(15.0),
          pitch: Cesium.Math.toRadians(-40.0),
          roll: 0.0
        },
        duration: 1.5
      });

      // Add 3D Extruded Buildings
      buildings.forEach((bld) => {
        const entity = viewer.entities.add({
          id: bld.id,
          name: bld.name,
          description: `
            <div style="font-family: sans-serif; font-size: 13px; line-height: 1.5;">
              <b>Parcel ID:</b> ${bld.parcelId}<br/>
              <b>Land Use:</b> ${bld.landUse}<br/>
              <b>Height:</b> ${bld.extrudedHeight} m (${bld.floors} floors)<br/>
              <b>Footprint:</b> ${bld.footprintArea} sq.m<br/>
              <b>FAR Ratio:</b> ${((bld.footprintArea * bld.floors) / bld.parcelArea).toFixed(2)}
            </div>
          `,
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(bld.coordinates),
            height: bld.baseHeight,
            extrudedHeight: bld.extrudedHeight,
            material: Cesium.Color.fromCssColorString(bld.color).withAlpha(0.85),
            outline: true,
            outlineColor: Cesium.Color.WHITE
          }
        });
        buildingEntitiesRef.current[bld.id] = entity;
      });

      // Add 3D Parcel Boundary Lines
      viewer.entities.add({
        name: "Cadastral Boundary P2P-IND-MH-4003",
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray([
            73.7885, 18.5582,
            73.7895, 18.5582,
            73.7895, 18.5593,
            73.7885, 18.5593
          ]),
          material: Cesium.Color.fromCssColorString('#3B82F6').withAlpha(0.2),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#60A5FA'),
          height: 0.2
        }
      });

      // Add Terrain elevation cross-section line visualizer
      viewer.entities.add({
        name: "Elevation Profile Transect Line A-B",
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            73.7885, 18.5575, 562.1,
            73.7905, 18.5592, 578.4
          ]),
          width: 4,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.2,
            color: Cesium.Color.YELLOW
          })
        }
      });
    }).catch(err => console.error("Cesium initialization error:", err));

    return () => {
      isMounted = false;
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Update Extruded Building Height in real time
  const handleHeightChange = (newHeight: number) => {
    setBuildingHeight(newHeight);
    if (!viewerRef.current) return;
    const entity = buildingEntitiesRef.current[selectedBuildingId];
    if (entity && entity.polygon) {
      entity.polygon.extrudedHeight = newHeight;
    }
  };

  // Update Time of Day & Shadows in real time
  useEffect(() => {
    if (!viewerRef.current || viewerRef.current.isDestroyed()) return;
    import('cesium').then((Cesium) => {
      viewerRef.current.shadows = shadowsEnabled;
      const monthIndex = season === 'Summer Solstice' ? 5 : season === 'Winter Solstice' ? 11 : 2;
      const date = new Date(2026, monthIndex, 21, Math.floor(timeOfDay), (timeOfDay % 1) * 60, 0);
      viewerRef.current.clock.currentTime = Cesium.JulianDate.fromDate(date);
    });
  }, [timeOfDay, shadowsEnabled, season]);

  // Sunlight animation loop
  useEffect(() => {
    let interval: any;
    if (isAnimatingTime) {
      interval = setInterval(() => {
        setTimeOfDay((prev) => {
          if (prev >= 18) return 6;
          return Math.round((prev + 0.25) * 100) / 100;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isAnimatingTime]);

  // Camera presets
  const triggerCameraPreset = (mode: 'top' | 'oblique' | 'street' | 'reset') => {
    if (!viewerRef.current) return;
    import('cesium').then((Cesium) => {
      const camera = viewerRef.current.camera;
      if (mode === 'top') {
        camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(73.7892, 18.5582, 600),
          orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 }
        });
      } else if (mode === 'oblique') {
        camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(73.7892, 18.5568, 380),
          orientation: { heading: 0, pitch: Cesium.Math.toRadians(-35), roll: 0 }
        });
      } else if (mode === 'street') {
        camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(73.7885, 18.5580, 25),
          orientation: { heading: Cesium.Math.toRadians(60), pitch: Cesium.Math.toRadians(-5), roll: 0 }
        });
      } else {
        camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(73.7895, 18.5582, 480),
          orientation: { heading: Cesium.Math.toRadians(15.0), pitch: Cesium.Math.toRadians(-40.0), roll: 0 }
        });
      }
    });
  };

  // FAR Calculation derived values
  const currentBld = buildings.find(b => b.id === selectedBuildingId) || buildings[0];
  const calculatedFloors = Math.max(1, Math.round(buildingHeight / 3.0));
  const totalBuiltup = currentBld.footprintArea * calculatedFloors;
  const currentFar = (totalBuiltup / currentBld.parcelArea).toFixed(2);
  const farAllowed = 2.50;
  const isFarCompliant = parseFloat(currentFar) <= farAllowed;

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden font-sans select-none">
      {/* Cesium WebGL Canvas Container */}
      <div ref={cesiumContainerRef} className="w-full h-full" />

      {/* Header Status Overlay */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/90 text-white border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md flex items-center space-x-4">
        <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
          <Box className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-sm text-slate-100">3D Cadastral Digital Twin</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              CORS RTK Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Baner Survey Cluster 107/3 • DSM Mesh Resolution: <span className="text-amber-400 font-mono">0.05m/px</span>
          </p>
        </div>

        <button
          onClick={() => {
            setViewMode('2d');
            navigate('/government/workspace');
          }}
          className="ml-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center space-x-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
          <span>Switch to 2D GIS</span>
        </button>
      </div>

      {/* Floating Camera View Control Pad */}
      <div className="absolute top-4 right-4 z-20 bg-slate-900/90 border border-slate-700/80 rounded-xl p-2 shadow-2xl backdrop-blur-md flex items-center space-x-1 text-xs">
        <button
          onClick={() => triggerCameraPreset('reset')}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition flex items-center space-x-1"
          title="Reset 3D Perspective"
        >
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>Reset</span>
        </button>
        <button
          onClick={() => triggerCameraPreset('top')}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          title="Top-Down 2D Ortho"
        >
          2D Ortho
        </button>
        <button
          onClick={() => triggerCameraPreset('oblique')}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          title="45° Oblique View"
        >
          45° Oblique
        </button>
        <button
          onClick={() => triggerCameraPreset('street')}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          title="Street Level Perspective"
        >
          Street Level
        </button>
      </div>

      {/* Main Interactive Control Panel (Tabs: Extrusion | Shadows | Elevation | Inspector) */}
      <div className="absolute bottom-6 left-6 z-20 w-[420px] bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-200 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('extrusion')}
            className={`py-3 flex flex-col items-center justify-center space-y-1 transition-all ${
              activeTab === 'extrusion'
                ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>3D Extrude</span>
          </button>

          <button
            onClick={() => setActiveTab('shadows')}
            className={`py-3 flex flex-col items-center justify-center space-y-1 transition-all ${
              activeTab === 'shadows'
                ? 'bg-amber-600/20 text-amber-400 border-b-2 border-amber-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Sun & Shadow</span>
          </button>

          <button
            onClick={() => setActiveTab('elevation')}
            className={`py-3 flex flex-col items-center justify-center space-y-1 transition-all ${
              activeTab === 'elevation'
                ? 'bg-emerald-600/20 text-emerald-400 border-b-2 border-emerald-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>Elevation</span>
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`py-3 flex flex-col items-center justify-center space-y-1 transition-all ${
              activeTab === 'inspector'
                ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Parcel Info</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-4 space-y-4 max-h-[380px] overflow-y-auto custom-scrollbar">
          {/* TAB 1: 3D BUILDING EXTRUSION & FAR */}
          {activeTab === 'extrusion' && (
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-100">Select Target Structure</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                  {currentBld.parcelId}
                </span>
              </div>

              <select
                value={selectedBuildingId}
                onChange={(e) => {
                  const bId = e.target.value;
                  setSelectedBuildingId(bId);
                  const target = buildings.find((b) => b.id === bId);
                  if (target) setBuildingHeight(target.extrudedHeight);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-medium focus:ring-1 focus:ring-blue-500"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.parcelId})
                  </option>
                ))}
              </select>

              {/* Height Extrusion Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Extruded Height (m):</span>
                  <span className="text-blue-400 font-mono text-sm">{buildingHeight}m ({calculatedFloors} Floors)</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="60"
                  step="1"
                  value={buildingHeight}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>3m (Single Story)</span>
                  <span>30m (G+9)</span>
                  <span>60m (Tower)</span>
                </div>
              </div>

              {/* Live FAR / FSI Calculation Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Floor Area Ratio (FAR / FSI):</span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      isFarCompliant ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {currentFar} / {farAllowed} Max
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isFarCompliant ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (parseFloat(currentFar) / farAllowed) * 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Footprint Area</span>
                    <span className="font-semibold text-slate-200">{currentBld.footprintArea} sq.m</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Total Built-up</span>
                    <span className="font-semibold text-slate-200">{totalBuiltup.toLocaleString()} sq.m</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUN & SHADOW SIMULATION */}
          {activeTab === 'shadows' && (
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-100">Solar Position & Shadow Projection</span>
                <button
                  onClick={() => setShadowsEnabled(!shadowsEnabled)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                    shadowsEnabled
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {shadowsEnabled ? 'Shadows ON' : 'Shadows OFF'}
                </button>
              </div>

              {/* Time of Day Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-slate-400">Time of Day (UTC+5:30):</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-amber-400 font-mono text-sm">
                      {Math.floor(timeOfDay).toString().padStart(2, '0')}:
                      {Math.round((timeOfDay % 1) * 60).toString().padStart(2, '0')} IST
                    </span>
                    <button
                      onClick={() => setIsAnimatingTime(!isAnimatingTime)}
                      className="p-1 bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30 transition"
                      title={isAnimatingTime ? 'Pause Time Animation' : 'Play Time Animation'}
                    >
                      {isAnimatingTime ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <input
                  type="range"
                  min="6"
                  max="18"
                  step="0.25"
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />

                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>06:00 (Sunrise)</span>
                  <span>12:00 (Noon)</span>
                  <span>18:00 (Sunset)</span>
                </div>
              </div>

              {/* Season Selector */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block text-[11px]">Solstice / Equinox Preset:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Summer Solstice', 'Equinox', 'Winter Solstice'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeason(s)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition ${
                        season === s
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Solar Elevation Angle:</span>
                  <span className="font-mono text-slate-200">54.2°</span>
                </div>
                <div className="flex justify-between">
                  <span>Solar Azimuth Angle:</span>
                  <span className="font-mono text-slate-200">248.5° SW</span>
                </div>
                <div className="flex justify-between">
                  <span>Shadow Coverage Ratio:</span>
                  <span className="font-mono text-amber-400">18.4% of Adjacent Parcel</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ELEVATION CROSS-SECTION PROFILE */}
          {activeTab === 'elevation' && (
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-100">Terrain Elevation Cross-Section</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  Transect Line A-B
                </span>
              </div>

              {profileResult && (
                <div className="space-y-3">
                  {/* Summary Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                      <span className="text-slate-400 block">Distance</span>
                      <span className="font-mono font-bold text-emerald-400 text-xs">{profileResult.lengthMeters}m</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                      <span className="text-slate-400 block">Elevation Delta</span>
                      <span className="font-mono font-bold text-slate-200 text-xs">
                        +{(profileResult.endElev - profileResult.startElev).toFixed(1)}m
                      </span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                      <span className="text-slate-400 block">Avg Slope</span>
                      <span className="font-mono font-bold text-amber-400 text-xs">{profileResult.avgSlopeDeg}°</span>
                    </div>
                  </div>

                  {/* SVG Elevation Profile Chart */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                    <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                      Elevation Profile (m AMSL):
                    </span>
                    <div className="w-full h-24 flex items-end justify-between space-x-1 pt-2">
                      {profileResult.samples.map((s, idx) => {
                        const min = profileResult.minElev - 2;
                        const max = profileResult.maxElev + 2;
                        const pct = ((s.elev - min) / (max - min)) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group relative">
                            <div
                              className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all group-hover:from-emerald-500 group-hover:to-teal-300"
                              style={{ height: `${pct}%` }}
                            />
                            {/* Hover tooltip */}
                            <div className="absolute -top-7 hidden group-hover:block bg-slate-800 text-slate-100 text-[9px] px-1.5 py-0.5 rounded shadow z-30 font-mono whitespace-nowrap">
                              {s.elev}m
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 pt-1">
                      <span>Pt A (562.1m)</span>
                      <span>Mid (581.2m)</span>
                      <span>Pt B (578.4m)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PARCEL & BUILDING INSPECTOR */}
          {activeTab === 'inspector' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-100">Cadastral Parcel Attributes</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30">
                  {inspectedEntity.parcelId}
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Survey Number:</span>
                  <span className="font-semibold text-slate-200">{inspectedEntity.surveyNo}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Title Owner:</span>
                  <span className="font-semibold text-slate-200">{inspectedEntity.owner}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Structure Type:</span>
                  <span className="font-semibold text-slate-200">{inspectedEntity.structureType}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Footprint Area:</span>
                  <span className="font-mono text-slate-200">{inspectedEntity.footprint}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Built-Up Area:</span>
                  <span className="font-mono text-slate-200">{inspectedEntity.totalBuiltup}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Zoning Compliance:</span>
                  <span className="font-bold text-emerald-400">{inspectedEntity.complianceStatus}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Last DGPS Resurvey:</span>
                  <span className="font-mono text-slate-400">{inspectedEntity.lastSurveyed}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
