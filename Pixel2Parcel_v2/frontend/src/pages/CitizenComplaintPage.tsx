import React, { useState } from 'react';
import { MessageSquare, CheckCircle2, Search, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGISStore } from '../store/gisStore';

export const CitizenComplaintPage: React.FC = () => {
  const { triggerRefresh } = useGISStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isStatusView = location.pathname.endsWith('/status');

  const [parcelId, setParcelId] = useState('P2P-IND-MH-4005');
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCmp, setSubmittedCmp] = useState<any>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Status search state
  const [searchNo, setSearchNo] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackedCmp, setTrackedCmp] = useState<any>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Client pre-validation: check target parcel ID exists
      const parcels = await api.getParcels();
      const parcelExists = parcels.features.some(f => f.properties.parcel_id.toLowerCase() === parcelId.trim().toLowerCase());
      
      if (!parcelExists) {
        setSubmitError(`Target Parcel ID '${parcelId.trim()}' does not exist in the official Cadastral Database. Please verify Parcel ID.`);
        setIsSubmitting(false);
        return;
      }

      // 2. Submit complaint to backend
      const res = await api.createComplaint({
        parcel_id: parcelId.trim(),
        citizen_name: citizenName,
        citizen_phone: citizenPhone,
        citizen_email: citizenEmail,
        title,
        description
      });
      setSubmittedCmp(res.complaint);
      triggerRefresh();
    } catch (err: any) {
      console.error("Complaint filing error:", err);
      setSubmitError(err.response?.data?.detail || "Failed to submit grievance complaint.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNo.trim()) return;

    setIsTracking(true);
    setTrackError(null);
    setTrackedCmp(null);

    try {
      const data = await api.getPublicComplaint(searchNo.trim());
      setTrackedCmp(data);
    } catch (err: any) {
      console.error("Track error:", err);
      setTrackError(err.response?.data?.detail || `Complaint number '${searchNo.trim()}' not found.`);
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-xs text-amber-600 font-bold uppercase mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>DoLR Citizen Grievance Cell</span>
          </div>
          <h1 className="text-xl font-bold text-govt-navy">Land Boundary Grievance & Resurvey Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            File boundary dispute complaints and track real-time resolution timelines.
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/citizen/complaint')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              !isStatusView ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            File New Complaint
          </button>
          <button
            onClick={() => navigate('/citizen/status')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              isStatusView ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Track Status
          </button>
        </div>
      </div>

      {!isStatusView ? (
        /* File Complaint Form */
        <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-sm space-y-4">
          {submitError && (
            <div className="bg-red-50 border border-red-300 text-red-800 p-3.5 rounded-xl flex items-center space-x-2 text-xs font-bold">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {submittedCmp ? (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-6 rounded-xl space-y-3 text-xs">
              <div className="flex items-center space-x-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Complaint Successfully Registered!</span>
              </div>
              <p className="text-slate-700">
                Your complaint reference number is <strong className="font-mono text-blue-700 text-sm">{submittedCmp.complaint_no}</strong>. Keep this reference number to track live status.
              </p>
              <button
                onClick={() => {
                  setSearchNo(submittedCmp.complaint_no);
                  navigate('/citizen/status');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors"
              >
                Track Status Now
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Parcel ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. P2P-IND-MH-4005"
                    value={parcelId}
                    onChange={(e) => setParcelId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Complainant Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anish Sharma"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98220 12345"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="citizen@example.in"
                    value={citizenEmail}
                    onChange={(e) => setCitizenEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Grievance Subject / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Boundary Encroachment & Offset Error on Western Perimeter"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description of Discrepancy *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide exact details regarding land survey number, boundary marker deviation, or area difference..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-govt-navy hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg text-xs shadow transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> : <MessageSquare className="w-4 h-4 text-amber-400" />}
                <span>{isSubmitting ? 'Validating Parcel & Submitting...' : 'Submit Grievance Complaint to DoLR'}</span>
              </button>
            </form>
          )}
        </div>
      ) : (
        /* Track Status View */
        <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-sm space-y-5 text-xs">
          <form onSubmit={handleTrack} className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter Complaint Ref No. (e.g. GRV-2026-0891)..."
              value={searchNo}
              onChange={(e) => setSearchNo(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isTracking}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-colors shrink-0 flex items-center space-x-1"
            >
              {isTracking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Track Status</span>}
            </button>
          </form>

          {trackError && (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-lg flex items-center space-x-2 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{trackError}</span>
            </div>
          )}

          {trackedCmp && (
            <div className="border border-slate-200 p-4 rounded-xl space-y-4 bg-slate-50">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-mono font-bold text-blue-700 text-sm">{trackedCmp.complaint_no}</span>
                <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded text-xs">
                  {trackedCmp.current_stage}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{trackedCmp.title}</h3>
                <p className="text-slate-600 mt-1">{trackedCmp.description}</p>
              </div>

              {trackedCmp.officer_remarks && (
                <div className="bg-white p-3 rounded border border-slate-200">
                  <span className="font-bold text-slate-700 block text-[10px] uppercase">Officer Remarks:</span>
                  <span className="text-slate-800 font-medium">{trackedCmp.officer_remarks}</span>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-700 block mb-2">Resolution Stage Timeline:</span>
                <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                  {trackedCmp.timeline?.map((item: any, i: number) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                      <div className="font-bold text-slate-900">{item.stage}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{new Date(item.timestamp).toLocaleString()}</div>
                      <div className="text-slate-600">{item.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
