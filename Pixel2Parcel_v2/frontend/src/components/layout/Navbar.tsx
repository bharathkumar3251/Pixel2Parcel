import React, { useState, useEffect } from 'react';
import { Shield, Clock, User, ChevronDown } from 'lucide-react';
import { useGISStore } from '../../store/gisStore';
import { UserRole } from '../../types/gis';
import { useNavigate, useLocation } from 'react-router-dom';
import { GIS_CONFIG } from '../../config/gisConfig';

export const Navbar: React.FC = () => {
  const { role, setRole } = useGISStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const roles: UserRole[] = ['Survey Officer', 'GIS Analyst', 'Revenue Inspector', 'Admin', 'Citizen'];
  const isCitizen = location.pathname.startsWith('/citizen');

  return (
    <header className="bg-govt-navy text-white border-b-2 border-amber-500 shadow-md select-none z-30 relative font-sans">
      {/* Top National Header Bar */}
      <div className="bg-[#051829] px-4 py-1 text.xs text-slate-300 flex justify-between items-center border-b border-slate-700 text-[11px]">
        <div className="flex items-center space-x-2 font-semibold">
          <span className="text-amber-400 uppercase tracking-wider">{GIS_CONFIG.GOVT_HEADER}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono">{timeStr}</span>
          </span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="px-4 py-2 flex items-center justify-between">
        {/* Emblem & Branding */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(isCitizen ? '/citizen/home' : '/government/dashboard')}>
          <div className="bg-white/10 p-2 rounded-lg border border-white/20 flex items-center justify-center shadow-sm">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white">{GIS_CONFIG.APP_NAME}</h1>
              <span className="bg-blue-600/90 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-blue-400/40 font-mono">
                {GIS_CONFIG.VERSION}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-normal">
              {GIS_CONFIG.APP_SUBTITLE}
            </p>
          </div>
        </div>

        {/* Center Portal Switcher Router */}
        <div className="flex items-center bg-[#071D33] p-1 rounded-lg border border-slate-700 shadow-inner">
          <button
            onClick={() => navigate('/government/dashboard')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all ${
              !isCitizen ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Government Portal
          </button>
          <button
            onClick={() => navigate('/citizen/home')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all ${
              isCitizen ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Citizen Portal (Public)
          </button>
        </div>

        {/* Right User Role Switcher & Profile */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-[#0A2E52] px-3 py-1.5 rounded-lg border border-slate-700">
            <User className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <div className="text-[9px] uppercase text-slate-400 font-bold leading-tight">Active Session Role</div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1"
              >
                {roles.map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
