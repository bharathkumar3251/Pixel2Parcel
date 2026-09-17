import React, { useState, useEffect } from 'react';
import { Shield, Clock, User, Globe, LogIn, Megaphone } from 'lucide-react';
import { useGISStore } from '../../store/gisStore';
import { UserRole } from '../../types/gis';
import { useNavigate, useLocation } from 'react-router-dom';
import { GIS_CONFIG } from '../../config/gisConfig';
import { useTranslation, LanguageCode } from '../../i18n/translations';

export const Navbar: React.FC = () => {
  const { role, setRole, language, setLanguage } = useGISStore();
  const { t } = useTranslation(language);
  const navigate = useNavigate();
  const location = useLocation();
  const [timeStr, setTimeStr] = useState<string>('');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'small'>('normal');

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
  const isCitizen = location.pathname.startsWith('/citizen') || role === 'Citizen';

  return (
    <header className="bg-slate-950/95 text-white select-none z-30 relative font-sans shadow-2xl backdrop-blur-xl border-b border-slate-800/80">
      {/* 🇮🇳 Top Tricolor Flag Accent Bar with Ambient Glow */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] shadow-[0_0_12px_rgba(255,153,51,0.5)]" />

      {/* Top National Official Header Bar */}
      <div className="bg-slate-950 px-6 py-1.5 text-slate-300 flex flex-wrap justify-between items-center border-b border-slate-800/60 text-[11px]">
        <div className="flex items-center space-x-3 font-medium">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-500/15 text-amber-300 font-extrabold px-2.5 py-0.5 rounded text-[10px] tracking-wider uppercase border border-amber-500/30 font-mono shadow-sm flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>GOVT OF INDIA</span>
            </span>
            <span className="text-slate-300 font-semibold">{t('govt_header', GIS_CONFIG.GOVT_HEADER)}</span>
          </div>
        </div>

        {/* Accessibility, Language Bar & IST Time */}
        <div className="flex items-center space-x-4">
          {/* Font Scaler */}
          <div className="flex items-center space-x-1 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-800 text-[10px]">
            <span className="text-slate-400 mr-0.5 font-mono">Text:</span>
            <button onClick={() => setFontSize('small')} className={`px-1.5 hover:text-white font-bold transition ${fontSize === 'small' ? 'text-amber-400 font-extrabold' : 'text-slate-400'}`}>A-</button>
            <button onClick={() => setFontSize('normal')} className={`px-1.5 hover:text-white font-bold transition ${fontSize === 'normal' ? 'text-amber-400 font-extrabold' : 'text-slate-400'}`}>A</button>
            <button onClick={() => setFontSize('large')} className={`px-1.5 hover:text-white font-bold transition ${fontSize === 'large' ? 'text-amber-400 font-extrabold' : 'text-slate-400'}`}>A+</button>
          </div>

          {/* 8 Indian Languages Selector */}
          <div className="flex items-center space-x-1 text-slate-300">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="bg-slate-900 text-slate-200 text-[11px] font-semibold focus:outline-none cursor-pointer border border-slate-700/80 rounded px-2 py-0.5"
            >
              <option value="en" className="bg-slate-900 text-white">English</option>
              <option value="hi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
              <option value="mr" className="bg-slate-900 text-white">मराठी (Marathi)</option>
              <option value="ta" className="bg-slate-900 text-white">தமிழ் (Tamil)</option>
              <option value="te" className="bg-slate-900 text-white">తెలుగు (Telugu)</option>
              <option value="gu" className="bg-slate-900 text-white">ગુજરાતી (Gujarati)</option>
              <option value="bn" className="bg-slate-900 text-white">বাংলা (Bengali)</option>
              <option value="kn" className="bg-slate-900 text-white">கன்னட (Kannada)</option>
            </select>
          </div>

          {/* Time Display */}
          <div className="flex items-center space-x-1.5 text-slate-300 font-mono text-[11px] bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-bold">{timeStr}</span>
          </div>
        </div>
      </div>

      {/* Live Official Municipal Marquee Announcement Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/60 px-6 py-1 flex items-center text-[11px] text-amber-300 overflow-hidden">
        <div className="flex items-center space-x-1.5 font-bold shrink-0 mr-3 text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
          <Megaphone className="w-3.5 h-3.5" />
          <span>{t('urban_notices', 'URBAN NOTICES')}</span>
        </div>
        <div className="whitespace-nowrap animate-marquee flex space-x-8 font-medium text-slate-300">
          <span>{t('notice_text', '📢 City Survey Ward 12 Digital Property Register Cards (PR Cards) released for public verification.')}</span>
          <span className="text-amber-500">•</span>
          <span>📡 <b>CORS DGPS Kinematic Urban Reference Network</b> operating at sub-5cm precision across 742 districts.</span>
          <span className="text-amber-500">•</span>
          <span>🏛️ <b>MoHUA Smart City Cadastre Integration</b> active for Municipal Property Tax & Spatial Rights-of-Way.</span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="px-6 py-2.5 flex items-center justify-between border-b border-slate-800/80">
        {/* Emblem & Portal Branding */}
        <div className="flex items-center space-x-3.5 cursor-pointer group" onClick={() => navigate(isCitizen ? '/citizen/home' : '/government/dashboard')}>
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-2.5 rounded-xl border border-blue-400/40 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-all">
            <Shield className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center space-x-1.5 font-heading">
                <span className="text-gradient-blue">{t('app_title', GIS_CONFIG.APP_NAME)}</span>
              </h1>
              <span className="bg-amber-500/20 text-amber-300 text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-amber-500/40 font-mono shadow-sm">
                URBAN CADASTRE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              {t('app_subtitle', GIS_CONFIG.APP_SUBTITLE)}
            </p>
          </div>
        </div>

        {/* Center Dual Portal Switcher */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 shadow-inner space-x-1">
          <button
            onClick={() => {
              setRole('Survey Officer');
              navigate('/government/dashboard');
            }}
            className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
              !isCitizen ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {t('gov_portal', 'Government Officer Portal')}
          </button>
          <button
            onClick={() => {
              setRole('Citizen');
              navigate('/citizen/home');
            }}
            className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
              isCitizen ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 border border-amber-400/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {t('citizen_portal', 'Public Citizen Portal (PR Cards)')}
          </button>
        </div>

        {/* Right Session Role Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-inner">
            <User className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <div className="text-[9px] uppercase text-slate-400 font-bold leading-tight font-mono">{t('session_role', 'Session Role')}</div>
              <select
                value={role}
                onChange={(e) => {
                  const newRole = e.target.value as UserRole;
                  setRole(newRole);
                  if (newRole === 'Citizen') {
                    navigate('/citizen/home');
                  } else {
                    navigate('/government/dashboard');
                  }
                }}
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

          <button
            onClick={() => navigate('/login/government')}
            className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 p-2 rounded-xl border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
            title="Switch Officer Account / Relogin"
          >
            <LogIn className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">{t('relogin', 'Relogin')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
