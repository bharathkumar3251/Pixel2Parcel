import React, { useState, useEffect } from 'react';
import { Edit3, Save, RotateCcw, CheckCircle2, ArrowRight, Layers, Info, AlertTriangle, RefreshCw } from 'lucide-react';
import { OpenLayersMap } from '../components/gis/OpenLayersMap';
import { useGISStore } from '../store/gisStore';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const GeometryEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedParcel, setIsEditingGeometry, setSelectedParcel } = useGISStore();
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [topologyStatus, setTopologyStatus] = useState<string | null>(null);

  useEffect(() => {
    // Auto-enable vertex editing when entering GeometryEditorPage
    setIsEditingGeometry(true);
    return () => {
      setIsEditingGeometry(false);
    };
  }, []);

  const handleSave = async () => {
    if (!selectedParcel) return;
    setIsSaving(true);
    try {
      const pId = selectedParcel.properties.parcel_id;
      const res = await api.saveEditedGeometry(pId, selectedParcel.geometry);
      
      // Update store with newly computed area & perimeter
      const updatedProps = {
        ...selectedParcel.properties,
        area_sqm: res.recalculated_area_sqm,
        perimeter_m: res.recalculated_perimeter_m,
        status: "Edited & Under Review"
      };
      setSelectedParcel({
        ...selectedParcel,
        properties: updatedProps
      });

      // Trigger automatic re-run of topology validation for affected parcel
      const topoRes = await api.checkTopology();
      const hasIssue = topoRes.issues?.some((i: any) => i.parcel_id === pId);
      setTopologyStatus(hasIssue ? "Topology Conflict Detected after Edit" : "Topology Validation Passed");

      setSaveSuccessMsg(`Geometry for ${pId} saved! New Geodesic Area: ${res.recalculated_area_sqm} sq.m (${res.recalculated_perimeter_m}m perimeter).`);
    } catch (err: any) {
      console.error("Save geometry error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const props = selectedParcel?.properties;
  const originalArea = props ? props.area_sqm : 845.20;
  const originalPerim = props ? props.perimeter_m : 118.40;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-xs text-blue-600 font-bold uppercase mb-1">
            <Edit3 className="w-4 h-4" />
            <span>Interactive Digitization Engine • Step 06b</span>
          </div>
          <h1 className="text-xl font-bold text-govt-navy">OpenLayers Vector Geometry & Vertex Editor</h1>
          <p className="text-xs text-slate-500 mt-1">
            Move, add, or delete boundary vertices; snap to adjacent cadastral parcels; recalculate geodesic area.
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !selectedParcel}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs shadow flex items-center space-x-1.5 transition-colors"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving Geometry...' : 'Save Updated Geometry'}</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-100 border border-emerald-400 text-emerald-800 p-3 rounded-xl flex justify-between items-center text-xs font-bold shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
          {topologyStatus && (
            <span className="bg-white text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded">
              {topologyStatus}
            </span>
          )}
        </div>
      )}

      {/* Editor Map Frame & Diff Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[480px] bg-slate-900 rounded-xl border border-slate-300 overflow-hidden shadow-sm relative">
          <OpenLayersMap />
          <div className="absolute top-3 left-3 bg-slate-900/90 text-amber-400 border border-slate-700 font-mono text-[10px] px-3 py-1.5 rounded-lg backdrop-blur">
            ACTIVE MODE: OpenLayers Vertex Modify & Snap Enabled
          </div>
        </div>

        {/* Diff & Geometry Comparison Panel */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4 text-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-govt-navy border-b border-slate-200 pb-2 flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Before vs After Geometry Diff</span>
            </h2>

            {props ? (
              <div className="mt-3 space-y-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Target Parcel ID</span>
                  <span className="font-mono font-extrabold text-blue-700 text-sm">{props.parcel_id}</span>
                  <div className="flex justify-between mt-2">
                    <span className="text-slate-600">Land Use:</span>
                    <span className="font-bold text-slate-800">{props.land_use}</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <span className="text-[10px] text-blue-700 font-bold uppercase block">Current Digitized Polygon</span>
                  <div className="flex justify-between mt-1">
                    <span className="text-blue-800">Recalculated Geodesic Area:</span>
                    <span className="font-bold text-blue-900 font-mono">{props.area_sqm.toLocaleString()} sq.m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-800">Recalculated Perimeter:</span>
                    <span className="font-bold text-blue-900 font-mono">{props.perimeter_m} m</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-1.5 mt-1.5">
                    <span className="text-blue-700 font-bold">Status:</span>
                    <span className="font-bold text-emerald-700">{props.status || "Verified"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <p>Click any parcel on the map to inspect and edit its vertices.</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/government/reports')}
            className="w-full bg-govt-navy hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 text-xs transition-colors shadow"
          >
            <span>Generate Official Updated Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
