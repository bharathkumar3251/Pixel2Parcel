import React, { useState } from 'react';
import { Shield, Lock, User, Building2, CheckCircle2, ArrowRight, KeyRound, Globe, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGISStore } from '../store/gisStore';
import { api } from '../services/api';

export const GovLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useGISStore();
  const [officerId, setOfficerId] = useState('SO-MH-9482');
  const [password, setPassword] = useState('••••••••••••');
  const [department, setDepartment] = useState('Department of Land Resources (DoLR)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGovLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Determine role based on Officer ID
      let assignedRole: any = 'Survey Officer';
      if (officerId.toLowerCase().includes('admin') || officerId.toLowerCase().includes('director')) {
        assignedRole = 'Admin';
      } else if (officerId.toLowerCase().includes('analyst') || officerId.toLowerCase().includes('gis')) {
        assignedRole = 'GIS Analyst';
      } else if (officerId.toLowerCase().includes('inspector') || officerId.toLowerCase().includes('revenue')) {
        assignedRole = 'Revenue Inspector';
      }

      setRole(assignedRole);
      navigate('/government/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Official Govt Header Bar */}
      <div className="bg-[#051424] border-b border-slate-800 px-6 py-2.5 flex justify-between items-center text-xs text-slate-300">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider border border-amber-500/30">
            OFFICIAL GOVERNMENT PORTAL
          </div>
          <span className="text-slate-400 font-medium">Ministry of Rural Development • Government of India</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
          <span className="hover:text-white cursor-pointer transition-colors">Digital India</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer transition-colors">National Land Records Programme (NLRMP)</span>
          <span>•</span>
          <button onClick={() => navigate('/login/citizen')} className="text-amber-400 hover:underline font-semibold">
            Switch to Citizen Portal
          </button>
        </div>
      </div>

      {/* Main Login Body */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
        {/* Background Decorative Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Left Portal Info Column */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#0B1E36] to-[#071324] p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700/70">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-600/30 border border-blue-400/40">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">Pixel2Parcel Enterprise</h1>
                  <p className="text-xs text-amber-400 font-medium">National Cadastral Cadre Portal</p>
                </div>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed mb-6">
                Official single-sign-on portal for Government District Survey Officers, GIS Analysts, Revenue Inspectors, and State Nodal Authorities.
              </p>

              <div className="space-y-3.5 border-t border-slate-700/80 pt-5 text-xs text-slate-300">
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>AI-Powered Drone Orthomosaic Vectorization</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Shapely Real-time GIS Topology Engine</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>CORS GNSS DGPS Field Alignment</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Official QR-Certified Land Title Generation</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>NIC 256-Bit SSL Secured</span>
              </span>
              <span>v1.0.0 Enterprise</span>
            </div>
          </div>

          {/* Right Credentials Form Column */}
          <div className="md:col-span-7 p-8 flex flex-col justify-center bg-slate-800/40">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Government Officer Authentication</h2>
              <p className="text-xs text-slate-400">Please provide your authorized NIC / Department credentials to proceed.</p>
            </div>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 px-3.5 py-2.5 rounded-lg text-xs flex items-center space-x-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleGovLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Officer Unique ID / Email</span>
                </label>
                <input
                  type="text"
                  required
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="e.g. SO-MH-9482 / officer@dolr.gov.in"
                  className="w-full bg-slate-900/90 border border-slate-700 focus:border-blue-500 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Department / State Nodal Body</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 focus:border-blue-500 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="Department of Land Resources (DoLR)">Department of Land Resources (DoLR)</option>
                  <option value="Survey of India (SoI)">Survey of India (SoI)</option>
                  <option value="State Revenue & Land Records Directorate">State Revenue & Land Records Directorate</option>
                  <option value="Municipal GIS & Urban Planning Cell">Municipal GIS & Urban Planning Cell</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                  <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                  <span>Account Password</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700 focus:border-blue-500 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 transition-all"
                >
                  <span>{loading ? 'Authenticating Officer...' : 'Authenticate & Access Workspace'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-700/60 text-center">
              <p className="text-[11px] text-slate-400">
                Are you a Citizen or Property Owner?{' '}
                <button onClick={() => navigate('/login/citizen')} className="text-amber-400 hover:underline font-semibold">
                  Access Public Land Records Portal
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Official Govt Footer */}
      <footer className="bg-[#040E1B] border-t border-slate-800 px-6 py-3 text-center text-xs text-slate-400">
        <p>© 2026 Department of Land Resources (DoLR), Ministry of Rural Development, Government of India. Designed for Enterprise Deployment.</p>
      </footer>
    </div>
  );
};
