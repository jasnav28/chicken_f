import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../lib/formatters';
import { Language } from '../../lib/i18n';
import {
  Store,
  Phone,
  MapPin,
  Shield,
  Globe,
  Layers,
  PhoneCall,
  LogOut,
  ChevronRight,
  User,
  ShieldAlert,
} from 'lucide-react';

interface ShopProfileProps {
  onOpenStandingOrders: () => void;
  onLogout: () => void;
}

export const ShopProfile: React.FC<ShopProfileProps> = ({ onOpenStandingOrders, onLogout }) => {
  const { currentShop, setCurrentShop, shops, language, setLanguage, settings, t } = useApp();

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Profile Header Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-brand flex items-center justify-center shrink-0">
            <Store className="w-7 h-7 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl sm:text-2xl text-textPrimary">{currentShop.name}</h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-brand text-xs font-bold uppercase">
                {currentShop.area_route}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-textSecondary flex items-center gap-1.5 mt-0.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Owner: <strong className="text-slate-700">{currentShop.owner_name}</strong>
              <span className="text-slate-300">•</span>
              <span>ID: <strong className="font-mono text-brand">{currentShop.username}</strong></span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t.logout}</span>
        </button>
      </div>

      {/* 2-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Registration & Location Details */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200/80 text-xs font-bold uppercase tracking-wider text-textSecondary">
              Shop Registration Details
            </div>
            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="p-4 flex items-center justify-between">
                <span className="text-textSecondary flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  Phone Number
                </span>
                <span className="font-bold text-textPrimary font-mono">{currentShop.phone}</span>
              </div>

              <div className="p-4 flex items-start justify-between gap-4">
                <span className="text-textSecondary flex items-center gap-2 shrink-0">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Delivery Address
                </span>
                <span className="font-medium text-textPrimary text-right max-w-xs">{currentShop.address}</span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <span className="text-textSecondary">Assigned Delivery Route</span>
                <span className="font-bold text-brand px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-xs">
                  {currentShop.area_route}
                </span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <span className="text-textSecondary flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  Credit Limit
                </span>
                <span className="font-black text-textPrimary tabular-nums">
                  {formatINR(currentShop.credit_limit, false)}
                </span>
              </div>
            </div>
          </div>

          {/* Standing Orders Shortcut Card */}
          <button
            type="button"
            onClick={onOpenStandingOrders}
            className="w-full p-5 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50 flex items-center justify-between transition-colors shadow-sm text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-brand">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-textPrimary block group-hover:text-brand transition-colors">
                  {t.standingOrders}
                </span>
                <span className="text-xs text-textSecondary">
                  Set automatic recurring orders for everyday fresh delivery
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Right Column: Language & Distributor Contact */}
        <div className="space-y-6">
          {/* Language Selector Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3.5">
              <Globe className="w-4 h-4 text-brand" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-textSecondary">
                {t.selectLanguage}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    language === l.code
                      ? 'border-brand bg-emerald-50/80 text-brand shadow-sm font-bold ring-1 ring-brand/30'
                      : 'border-slate-200 bg-white text-textPrimary hover:bg-slate-50'
                  }`}
                >
                  <div className="text-sm font-bold">{l.native}</div>
                  <div className="text-[11px] text-textSecondary mt-0.5">{l.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Distributor Support Contact */}
          <div className="p-6 rounded-2xl border border-slate-200/80 bg-white text-center space-y-3 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Distributor Support & Dispatch Desk
            </span>
            <div className="text-base font-extrabold text-textPrimary">{settings.business_name}</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{settings.address}</p>

            <div className="pt-2">
              <a
                href={`tel:${settings.phone}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Call Helpline: {settings.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
