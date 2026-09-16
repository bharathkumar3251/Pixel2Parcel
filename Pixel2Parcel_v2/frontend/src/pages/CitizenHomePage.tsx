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
    <div className="p-6 max-w-6xl mx-auto space-y-6 select-none font-sans">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B1E36] via-[#0D284B] to-[#0A192F] text-white rounded-2xl p-8 shadow-xl border-b-4 border-amber-500 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="max-w-3xl relative z-10">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 mb-2">
            <span className="bg-amber-500/20 px-2.5 py-1 rounded border border-amber-500/40 uppercase">PUBLIC URBAN PORTAL</span>
            <span>•</span>
            <span>MoHUA Urban Land Records & Property Card Services</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{t('public_hero_title', 'PUBLIC URBAN PROPERTY CARD & CADASTRE PORTAL')}</h1>
          <p className="text-sm text-slate-200 mt-2 leading-relaxed font-normal">
            {t('public_hero_desc', 'Search verified City Survey Numbers (CTS No.), view municipal property boundaries, verify QR-certified Urban Property Cards (PR Cards), and lodge property dispute grievances online.')}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/citizen/search')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-3 rounded-xl text-xs shadow-lg transition-all flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>{t('search_cts', 'Search City Survey Numbers (CTS No.)')}</span>
            </button>
            <button
              onClick={() => navigate('/citizen/complaint')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-xl text-xs border border-white/30 backdrop-blur transition-all flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>{t('file_grievance', 'File Property Boundary Grievance')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Certified PR Card Verification Widget Card */}
      <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 uppercase">
            <QrCode className="w-4 h-4 text-amber-500" />
            <span>Digital Certificate Verification Suite</span>
          </div>
          <h2 className="text-xl font-bold text-govt-navy">{t('verify_pr_card_title', 'Verify Official Urban Property Register Card (PR Card)')}</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('verify_pr_desc', 'Enter the 16-digit Certificate Reference Number or scan the QR Code on your issued PR Card to verify digital signatures, municipal seal, and geodesic area calculations.')}
          </p>
          <div className="pt-2 flex max-w-md">
            <input
              type="text"
              value={certQuery}
              onChange={(e) => setCertQuery(e.target.value)}
              placeholder="e.g. PR-MH-4001 or CTS-104/1A"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-l-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600"
            />
            <button
              onClick={() => navigate(`/citizen/search?parcel_id=${certQuery || 'P2P-IND-MH-4001'}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-r-xl text-xs flex items-center space-x-1.5 transition-all shadow"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{t('verify_btn', 'Verify PR Card')}</span>
            </button>
          </div>
        </div>

        <div className="md:col-span-4 bg-slate-900 text-white p-5 rounded-xl border border-slate-700 text-center space-y-3">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mx-auto border border-amber-500/40">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">{t('qr_active', 'QR Code Scanner Active')}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Scan physical PR Card QR code using your mobile device camera for instant verification.</p>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-govt-navy">{t('cts_ward_search_title', 'CTS Number & Ward Search')}</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('cts_ward_search_desc', 'Look up verified municipal land boundaries by City Survey Number (CTS No.), Ward Number, Plot ID, or street location.')}
          </p>
          <button
            onClick={() => navigate('/citizen/search')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1 pt-2"
          >
            <span>{t('search_cts', 'Search Urban Parcels')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-govt-navy">{t('lodge_dispute_title', 'Register Boundary Grievance')}</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('lodge_dispute_desc', 'Report encroachment, setback violations, or property boundary discrepancies directly to Municipal Survey Officers.')}
          </p>
          <button
            onClick={() => navigate('/citizen/complaint')}
            className="text-xs font-bold text-amber-600 hover:underline flex items-center space-x-1 pt-2"
          >
            <span>{t('file_grievance', 'Lodge Dispute Grievance')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-govt-navy">{t('track_dispute_title', 'Track Dispute Timeline')}</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('track_dispute_desc', 'Check real-time progress of lodged complaints as they transition through DGPS Field Survey and Officer Resolution.')}
          </p>
          <button
            onClick={() => navigate('/citizen/status')}
            className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1 pt-2"
          >
            <span>{t('track_dispute_title', 'Track Complaint Status')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
