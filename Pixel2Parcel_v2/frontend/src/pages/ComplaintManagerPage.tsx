import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle2, XCircle, ArrowRight, User, Phone, Mail, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { ComplaintItem } from '../types/gis';
import { useGISStore } from '../store/gisStore';

export const ComplaintManagerPage: React.FC = () => {
  const { triggerRefresh } = useGISStore();
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [newRemarks, setNewRemarks] = useState('');
  const [updatingStage, setUpdatingStage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchComplaints = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.getComplaints();
      const list = res.complaints || [];
      setComplaints(list);
      if (list.length > 0) {
        if (!selectedComplaint) {
          setSelectedComplaint(list[0]);
        } else {
          // Refresh selected complaint in place
          const match = list.find(c => c.complaint_no === selectedComplaint.complaint_no);
          if (match) setSelectedComplaint(match);
        }
      }
    } catch (err: any) {
      console.error("Fetch complaints error:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to load grievance complaints list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStageUpdate = async (stage: string) => {
    if (!selectedComplaint) return;
    setUpdatingStage(true);
    try {
      await api.updateComplaintStage(selectedComplaint.complaint_no, stage, newRemarks);
      setNewRemarks('');
      triggerRefresh();
      await fetchComplaints();
    } catch (err: any) {
      console.error("Update stage error:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to update complaint stage.");
    } finally {
      setUpdatingStage(false);
    }
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'Submitted':
        return <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded text-[10px]">Submitted</span>;
      case 'Under Review':
        return <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded text-[10px]">Under Review</span>;
      case 'Field Verification':
        return <span className="bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded text-[10px]">Field Verification</span>;
      case 'Resolved':
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded text-[10px]">Resolved</span>;
      case 'Rejected':
        return <span className="bg-red-100 text-red-800 font-bold px-2.5 py-0.5 rounded text-[10px]">Rejected</span>;
      default:
        return <span>{stage}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-xs text-purple-600 font-bold uppercase mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Citizen Grievance Lifecycle Management • Step 09</span>
          </div>
          <h1 className="text-xl font-bold text-govt-navy">Land Boundary Complaints & Resurvey Workflow</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review citizen boundary complaints, assign field teams, and manage multi-stage resolution timelines.
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          disabled={isLoading}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5 transition-colors border border-slate-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-xl flex items-center space-x-2 text-xs font-bold shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List Column (1 col) */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-govt-navy border-b border-slate-200 pb-2">
            Submitted Citizen Complaints ({complaints.length})
          </h2>

          {isLoading ? (
            <div className="text-center py-10 text-slate-500 text-xs flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
              <span>Loading complaints queue...</span>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <p>No complaints submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 text-xs">
              {complaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedComplaint?.id === c.id
                      ? 'bg-blue-50 border-blue-400 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold text-blue-700">{c.complaint_no}</span>
                    {getStageBadge(c.current_stage)}
                  </div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{c.title}</h3>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Parcel: <strong>{c.parcel_id}</strong></span>
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail & Stage Transition Column (2 cols) */}
        {selectedComplaint && (
          <div className="lg:col-span-2 bg-white border border-slate-300 rounded-xl p-6 shadow-sm space-y-5 text-xs">
            {/* Header Block */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-blue-700 text-sm">{selectedComplaint.complaint_no}</span>
                  {getStageBadge(selectedComplaint.current_stage)}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedComplaint.title}</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Target Parcel ID</span>
                <span className="font-mono font-extrabold text-govt-navy text-sm">{selectedComplaint.parcel_id}</span>
              </div>
            </div>

            {/* Citizen Details */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Citizen Name</span>
                  <span className="font-bold text-slate-900">{selectedComplaint.citizen_name}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Contact Phone</span>
                  <span className="font-medium text-slate-800">{selectedComplaint.citizen_phone}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Email Address</span>
                  <span className="font-medium text-slate-800">{selectedComplaint.citizen_email}</span>
                </div>
              </div>
            </div>

            {/* Complaint Description */}
            <div>
              <span className="font-bold text-slate-700 block mb-1">Grievance Description:</span>
              <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-medium">
                {selectedComplaint.description}
              </p>
            </div>

            {/* Multi-stage Timeline */}
            <div>
              <span className="font-bold text-slate-700 block mb-2">Stage Timeline Log:</span>
              <div className="space-y-2 border-l-2 border-blue-600 pl-4 py-1">
                {selectedComplaint.timeline.map((t, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full border border-white" />
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{t.stage}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({new Date(t.timestamp).toLocaleString()})</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{t.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Transition Control Box */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <span className="font-bold text-slate-900 block">Update Complaint Workflow Stage:</span>

              <div>
                <input
                  type="text"
                  placeholder="Enter officer notes or remarks..."
                  value={newRemarks}
                  onChange={(e) => setNewRemarks(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleStageUpdate('Under Review')}
                  disabled={updatingStage}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded text-xs transition-colors disabled:opacity-50"
                >
                  Set 'Under Review'
                </button>
                <button
                  onClick={() => handleStageUpdate('Field Verification')}
                  disabled={updatingStage}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded text-xs transition-colors disabled:opacity-50"
                >
                  Deploy 'Field Verification'
                </button>
                <button
                  onClick={() => handleStageUpdate('Resolved')}
                  disabled={updatingStage}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded text-xs transition-colors disabled:opacity-50"
                >
                  Mark 'Resolved'
                </button>
                <button
                  onClick={() => handleStageUpdate('Rejected')}
                  disabled={updatingStage}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-xs transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
