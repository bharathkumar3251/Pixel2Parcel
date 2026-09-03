import React, { useState } from 'react';
import { ShieldAlert, Calculator, HelpCircle, CheckCircle2, Map, AlertCircle, RefreshCw, AlertTriangle, Layers } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const RiskAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();

  // Confidence inputs
  const [aiScore, setAiScore] = useState(94);
  const [boundaryMatch, setBoundaryMatch] = useState(92);
  const [dsmDtmVal, setDsmDtmVal] = useState(90);

  // Risk inputs
  const [aiUncertainty, setAiUncertainty] = useState(12);
  const [topologyErrorScore, setTopologyErrorScore] = useState(15);
  const [boundaryDiffM, setBoundaryDiffM] = useState(0.18);
  const [gnssOffsetM, setGnssOffsetM] = useState(0.10);

  // Computed results
  const confidence = Math.round((aiScore * 0.5 + boundaryMatch * 0.3 + dsmDtmVal * 0.2) * 10) / 10;
  const riskPct = Math.round((aiUncertainty * 0.40 + topologyErrorScore * 0.35 + (boundaryDiffM * 20) * 0.15 + (gnssOffsetM * 25) * 0.10) * 10) / 10;

  const getRiskRating = (pct: number) => {
    if (pct >= 60) return { label: 'High Risk', badge: 'Red', color: 'bg-red-100 text-red-800 border-red-300' };
    if (pct >= 30) return { label: 'Medium Risk', badge: 'Amber', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: 'Low Risk', badge: 'Green', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  };

  const riskRating = getRiskRating(riskPct);

  const getReasons = () => {
    const reasons = [];
    if (topologyErrorScore > 20) {
      reasons.push("Boundary overlap detected with adjacent parcel.");
    }
    if (boundaryDiffM > 0.25) {
      reasons.push(`Boundary mismatch of ${boundaryDiffM.toFixed(2)}m exceeds 0.15m tolerance threshold.`);
    }
    if (gnssOffsetM > 0.15) {
      reasons.push(`GNSS offset of ${gnssOffsetM.toFixed(2)}m detected against field benchmark.`);
    }
    if (aiUncertainty > 20) {
      reasons.push("AI boundary confidence score is below high-precision threshold.");
    }
    if (reasons.length === 0) {
      reasons.push("Parcel geometry satisfies all DoLR topological, GNSS, and AI precision benchmarks.");
    }
    return reasons;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-xs text-red-600 font-bold uppercase mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Workflow Step 05 • DoLR Core Innovation Engine</span>
          </div>
          <h1 className="text-xl font-bold text-govt-navy">CONFIDENCE ENGINE & EXPLAINABLE RISK ENGINE</h1>
          <p className="text-xs text-slate-500 mt-1">
            Confidence Formula • Explainable Risk Scoring • Itemized Risk Reasons Breakdown
          </p>
        </div>

        <button
          onClick={() => navigate('/government/workspace')}
          className="bg-govt-navy hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs shadow flex items-center space-x-1.5 transition-colors"
        >
          <Map className="w-4 h-4 text-amber-400" />
          <span>Overlay Risk Heatmap on WebGIS</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Engine Panel */}
        <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold text-govt-navy flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>1. AI Confidence Engine</span>
            </h2>
            <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded font-mono text-xs">
              Confidence: {confidence}%
            </span>
          </div>

          <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] border border-slate-700">
            <span className="text-amber-400 font-bold block mb-1">DoLR Mathematical Formula:</span>
            Confidence = 0.5(AI Score) + 0.3(Boundary Match) + 0.2(DSM/DTM Validation)
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>AI Boundary Score:</span>
                <span className="font-mono text-blue-700">{aiScore}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={aiScore}
                onChange={(e) => setAiScore(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Boundary Consistency Match:</span>
                <span className="font-mono text-emerald-700">{boundaryMatch}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={boundaryMatch}
                onChange={(e) => setBoundaryMatch(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>DSM / DTM Elevation Validation:</span>
                <span className="font-mono text-purple-700">{dsmDtmVal}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={dsmDtmVal}
                onChange={(e) => setDsmDtmVal(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-lg font-mono text-[11px]">
            Formula Breakdown: Confidence ({confidence}%) = 0.5×({aiScore}%) + 0.3×({boundaryMatch}%) + 0.2×({dsmDtmVal}%)
          </div>
        </div>

        {/* Explainable Risk Engine Panel */}
        <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold text-govt-navy flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>2. Explainable Risk Engine</span>
            </h2>
            <span className={`font-extrabold px-3 py-1 rounded text-xs border ${riskRating.color}`}>
              {riskRating.label.toUpperCase()} ({riskPct}%)
            </span>
          </div>

          <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] border border-slate-700">
            <span className="text-amber-400 font-bold block mb-1">Explainable Risk Formula:</span>
            Risk = 40%(AI Uncertainty) + 35%(Topology Error) + 15%(Boundary Difference) + 10%(GNSS Offset)
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">AI Uncertainty (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={aiUncertainty}
                  onChange={(e) => setAiUncertainty(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded p-2 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Topology Error Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={topologyErrorScore}
                  onChange={(e) => setTopologyErrorScore(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded p-2 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Boundary Difference (meters)</label>
                <input
                  type="number"
                  step="0.05"
                  value={boundaryDiffM}
                  onChange={(e) => setBoundaryDiffM(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded p-2 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">GNSS Offset (meters)</label>
                <input
                  type="number"
                  step="0.02"
                  value={gnssOffsetM}
                  onChange={(e) => setGnssOffsetM(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded p-2 font-mono text-xs"
                />
              </div>
            </div>

            {/* Explainable Reasons Box */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg space-y-2">
              <span className="font-bold text-slate-900 block uppercase text-[10px]">Itemized Risk Reasons Explanation:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium">
                {getReasons().map((reason, idx) => (
                  <li key={idx} className="leading-relaxed">{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

