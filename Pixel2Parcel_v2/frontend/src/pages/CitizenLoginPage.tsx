import React, { useState } from 'react';
import { Landmark, Smartphone, KeyRound, CheckCircle2, ArrowRight, ShieldCheck, Search, FileCheck2, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGISStore } from '../store/gisStore';

export const CitizenLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useGISStore();
  const [mobileOrId, setMobileOrId] = useState('9822012345');
  const [otp, setOtp] = useState('482019');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileOrId) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRole('Citizen');
      navigate('/citizen/home');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-slate-100 font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Header */}
      <div className="bg-[#081827] border-b border-slate-800 px-6 py-2.5 flex justify-between items-center text-xs text-slate-300">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider border border-emerald-500/30">
            PUBLIC CITIZEN LAND SERVICES PORTAL
          </div>
          <span className="text-slate-400 font-medium">Department of Land Resources • Government of India</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
          <button onClick={() => navigate('/login/government')} className="text-blue-400 hover:underline font-semibold">
            Government Staff Login (Officers / Surveyors)
          </button>
        </div>
      </div>

      {/* Main Login Body */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a1628] to-black">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Left Feature Column */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#182613] via-[#0E1F29] to-[#0A1624] p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700/70">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-amber-500 p-2.5 rounded-xl text-slate-950 font-bold shadow-lg shadow-amber-500/30 border border-amber-300/40">
                  <Landmark className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-white tracking-tight">Citizen Land Cadastre</h1>
                  <p className="text-xs text-amber-400 font-medium">Public Records & Dispute Portal</p>
                </div>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed mb-6">
                Search verified digital parcel boundaries, verify survey numbers, download certified land title certificates, and lodge boundary dispute grievances online.
              </p>

              <div className="space-y-3.5 border-t border-slate-700/80 pt-5 text-xs text-slate-300">
                <div className="flex items-start space-x-2.5">
                  <Search className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Public Land Parcel & Survey Search</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <FileCheck2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>QR-Certified Downloadable Land Title PDF</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Transparent Public Cadastral Boundaries</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <UserCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Lodge & Track Land Dispute Grievances</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-700/60 text-[11px] text-slate-400">
              <span>Verified Public Access • Free Citizen Service</span>
            </div>
          </div>

          {/* Right Mobile OTP Column */}
          <div className="md:col-span-7 p-8 flex flex-col justify-center bg-slate-800/40">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Citizen Portal Login</h2>
              <p className="text-xs text-slate-400">Enter your registered mobile number or Unique Landholder ID to receive a secure OTP.</p>
            </div>

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mobile Number / Landholder Unique ID</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={mobileOrId}
                    onChange={(e) => setMobileOrId(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 px-4 rounded-lg text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Enter 6-Digit One Time Password (OTP)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="482019"
                    className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-center tracking-[0.5em] text-base font-mono font-bold text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                  <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>OTP sent to +91 {mobileOrId}</span>
                  </p>
                </div>

                <div className="pt-2 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="w-1/3 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-3 rounded-lg text-xs transition-all"
                  >
                    Change Number
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>{loading ? 'Verifying OTP...' : 'Verify & Enter Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-slate-700/60 text-center">
              <p className="text-[11px] text-slate-400">
                Are you a Government District Survey Officer?{' '}
                <button onClick={() => navigate('/login/government')} className="text-blue-400 hover:underline font-semibold">
                  Access Officer Single-Sign-On
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#040E1B] border-t border-slate-800 px-6 py-3 text-center text-xs text-slate-400">
        <p>© 2026 Department of Land Resources (DoLR), Government of India. Official Public Land Records Access.</p>
      </footer>
    </div>
  );
};
