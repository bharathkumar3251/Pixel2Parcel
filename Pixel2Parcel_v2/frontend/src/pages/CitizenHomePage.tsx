import React from 'react';
import { Search, MessageSquare, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CitizenHomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 select-none">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0A2540] to-[#1E3A8A] text-white rounded-2xl p-8 shadow-xl border-b-4 border-amber-500">
        <div className="max-w-2xl">
          <span className="bg-amber-500 text-slate-900 text-xs font-black uppercase px-2.5 py-1 rounded-md mb-3 inline-block">
            Workflow Step 10 • Public Access Portal
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">CITIZEN PORTAL (VIEW ONLY) + RAISE COMPLAINT</h1>
          <p className="text-sm text-slate-200 mt-2 leading-relaxed font-semibold">
            Search Parcel • View Verified Boundary • Submit Complaint • Track Status
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/citizen/search')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-3 rounded-xl text-xs shadow-lg transition-all flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Verified Parcel Boundaries</span>
            </button>
            <button
              onClick={() => navigate('/citizen/complaint')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-xl text-xs border border-white/30 backdrop-blur transition-all flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>File Land Boundary Complaint</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-sm space-y-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg w-fit">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-govt-navy">Verified Parcel Lookup</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Search land records by Parcel ID, Survey Number, Village, or Street address using Nominatim geocoding.
          </p>
          <button
            onClick={() => navigate('/citizen/search')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1 pt-2"
          >
            <span>Search Parcels</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-sm space-y-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg w-fit">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-govt-navy">Register Boundary Grievance</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Report encroachment, boundary overlap, or area discrepancy directly to District Survey Officers.
          </p>
          <button
            onClick={() => navigate('/citizen/complaint')}
            className="text-xs font-bold text-amber-600 hover:underline flex items-center space-x-1 pt-2"
          >
            <span>Submit Complaint</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-sm space-y-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-govt-navy">Track Complaint Timeline</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Check live progress of submitted complaints as they transition through Field Resurvey and Resolution.
          </p>
          <button
            onClick={() => navigate('/citizen/status')}
            className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1 pt-2"
          >
            <span>Track Status</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
