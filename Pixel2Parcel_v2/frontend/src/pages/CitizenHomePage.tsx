import React, { useState } from 'react';
import { Search, MessageSquare, ShieldCheck, ArrowRight, QrCode, Building2, FileCheck2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGISStore } from '../store/gisStore';
import { useTranslation } from '../i18n/translations';

export const CitizenHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useGISStore();
  const { t } = useTranslation(language);
  const [certQuery, setCertQuery] = useState('');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 select-none font-sans min-h-screen text-slate-100 cyber-grid-bg">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl p-8 shadow-2xl border border-slate-700/80 overflow-hidden mesh-gradient-dark">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="max-w-3xl relative z-10">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 mb-2">
            <span className="bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40 uppercase shadow-sm flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>PUBLIC URBAN PORTAL</span>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">MoHUA Urban Land Records & Property Card Services</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">{t('public_hero_title', 'PUBLIC URBAN PROPERTY CARD & CADASTRE PORTAL')}</h1>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed font-normal">
            {t('public_hero_desc', 'Search verified City Survey Numbers (CTS No.), view municipal property boundaries, verify QR-certified Urban Property Cards (PR Cards), and lodge property dispute grievances online.')}
          </p>

          <div className="mt-7 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/citizen/search')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2.5 transform hover:-translate-y-0.5"
            >
              <Search className="w-4 h-4" />
              <span>{t('search_cts', 'Search City Survey Numbers (CTS No.)')}</span>
            </button>
            <button
              onClick={() => navigate('/citizen/complaint')}
              className="bg-slate-900/90 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl text-xs border border-slate-700 backdrop-blur-xl transition-all flex items-center space-x-2.5 shadow-md"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>{t('file_grievance', 'File Property Boundary Grievance')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Certified PR Card Verification Widget Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-700/80 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Digital Certificate Verification Suite</span>
          </div>
          <h2 className="text-xl font-bold text-white font-heading">{t('verify_pr_card_title', 'Verify Official Urban Property Register Card (PR Card)')}</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t('verify_pr_desc', 'Enter the 16-digit Certificate Reference Number or scan the QR Code on your issued PR Card to verify digital signatures, municipal seal, and geodesic area calculations.')}
          </p>
          <div className="pt-2 flex max-w-md">
            <input
              type="text"
              value={certQuery}
              onChange={(e) => setCertQuery(e.target.value)}
              placeholder="e.g. PR-MH-4001 or CTS-104/1A"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-l-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => navigate(`/citizen/search?parcel_id=${certQuery || 'P2P-IND-MH-4001'}`)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold px-5 py-3 rounded-r-xl text-xs flex items-center space-x-2 transition-all shadow-lg shadow-blue-600/30"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{t('verify_btn', 'Verify PR Card')}</span>
            </button>
          </div>
        </div>

        <div className="md:col-span-4 bg-slate-950/90 text-white p-5 rounded-xl border border-slate-800 text-center space-y-3 shadow-inner">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mx-auto border border-amber-500/30 shadow-md">
            <QrCode className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">{t('qr_active', 'QR Code Scanner Active')}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Scan physical PR Card QR code using your mobile device camera for instant verification.</p>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-700/80 shadow-xl space-y-3.5">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit border border-blue-500/30 shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-white font-heading">{t('cts_ward_search_title', 'CTS Number & Ward Search')}</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t('cts_ward_search_desc', 'Look up verified municipal land boundaries by City Survey Number (CTS No.), Ward Number, Plot ID, or street location.')}
          </p>
          <button
            onClick={() => navigate('/citizen/search')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1.5 pt-2 transition-colors"
          >
            <span>{t('search_cts', 'Search Urban Parcels')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-700/80 shadow-xl space-y-3.5">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit border border-amber-500/30 shadow-md">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-white font-heading">{t('lodge_dispute_title', 'Register Boundary Grievance')}</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t('lodge_dispute_desc', 'Report encroachment, setback violations, or property boundary discrepancies directly to Municipal Survey Officers.')}
          </p>
          <button
            onClick={() => navigate('/citizen/complaint')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1.5 pt-2 transition-colors"
          >
            <span>{t('file_grievance', 'Lodge Dispute Grievance')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-700/80 shadow-xl space-y-3.5">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit border border-emerald-500/30 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-white font-heading">{t('track_dispute_title', 'Track Dispute Timeline')}</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t('track_dispute_desc', 'Check real-time progress of lodged complaints as they transition through DGPS Field Survey and Officer Resolution.')}
          </p>
          <button
            onClick={() => navigate('/citizen/status')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1.5 pt-2 transition-colors"
          >
            <span>{t('track_dispute_title', 'Track Complaint Status')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
