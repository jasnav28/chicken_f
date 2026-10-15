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
    <div className="p-4 pb-24 space-y-4">
      {/* Profile Header */}
      <div className="p-4 rounded-card bg-surface border border-border shadow-subtle flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-brand flex items-center justify-center shrink-0">
          <Store className="w-6 h-6 stroke-[2]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base text-textPrimary truncate">{currentShop.name}</h1>
          <p className="text-xs text-textSecondary flex items-center gap-1 mt-0.5">
            <User className="w-3 h-3 text-slate-400" />
            {currentShop.owner_name}
          </p>
        </div>
      </div>

      {/* Shop Details Card */}
      <div className="rounded-card border border-border bg-surface overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-border text-xs font-bold uppercase tracking-wider text-textSecondary">
          Shop Registration Details
        </div>
        <div className="divide-y divide-border text-xs">
          <div className="p-3 flex items-center justify-between">
            <span className="text-textSecondary flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Phone Number
            </span>
            <span className="font-semibold text-textPrimary">{currentShop.phone}</span>
          </div>

          <div className="p-3 flex items-start justify-between gap-4">
            <span className="text-textSecondary flex items-center gap-2 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Address
            </span>
            <span className="font-medium text-textPrimary text-right">{currentShop.address}</span>
          </div>

          <div className="p-3 flex items-center justify-between">
            <span className="text-textSecondary">Assigned Delivery Route</span>
            <span className="font-semibold text-brand px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100">
              {currentShop.area_route}
            </span>
          </div>

          <div className="p-3 flex items-center justify-between">
            <span className="text-textSecondary flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Credit Limit
            </span>
            <span className="font-bold text-textPrimary tabular-nums">
              {formatINR(currentShop.credit_limit, false)}
            </span>
          </div>
        </div>
      </div>

      {/* Language Selector Card */}
      <div className="rounded-card border border-border bg-surface p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-brand" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-textSecondary">
            {t.selectLanguage}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={`p-3 rounded-btn border text-left transition-all ${
                language === l.code
                  ? 'border-brand bg-emerald-50/70 text-brand shadow-sm font-semibold'
                  : 'border-border bg-surface text-textPrimary hover:bg-slate-50'
              }`}
            >
              <div className="text-sm font-medium">{l.native}</div>
              <div className="text-[11px] text-textSecondary">{l.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Standing Orders Shortcut */}
      <button
        type="button"
        onClick={onOpenStandingOrders}
        className="w-full p-3.5 rounded-card border border-border bg-surface hover:bg-slate-50 flex items-center justify-between transition-colors shadow-subtle touch-manipulation"
      >
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-brand" />
          <div className="text-left">
            <span className="text-sm font-semibold text-textPrimary block">{t.standingOrders}</span>
            <span className="text-xs text-textSecondary">Manage automatic recurring daily orders</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>

      {/* Switch Shop Demo Dropdown */}
      <div className="p-4 rounded-card border border-border bg-slate-50">
        <label className="block text-xs font-bold uppercase tracking-wider text-textSecondary mb-1.5">
          {t.switchShop}
        </label>
        <select
          value={currentShop.id}
          onChange={(e) => {
            const matched = shops.find((s) => s.id === e.target.value);
            if (matched) setCurrentShop(matched);
          }}
          className="w-full h-11 px-3 rounded-btn border border-border bg-surface text-xs font-medium text-textPrimary focus:outline-none focus:ring-1 focus:ring-brand"
        >
          {shops.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} - {s.owner_name} ({s.area_route})
            </option>
          ))}
        </select>
      </div>

      {/* Distributor Support Contact */}
      <div className="p-4 rounded-card border border-border bg-surface text-center space-y-2">
        <span className="text-xs text-textSecondary block">Distributor Helpline</span>
        <div className="text-sm font-bold text-textPrimary">{settings.business_name}</div>
        <a
          href={`tel:${settings.phone}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-btn bg-slate-100 hover:bg-slate-200 text-textPrimary font-semibold text-xs transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5 text-brand" />
          <span>Call: {settings.phone}</span>
        </a>
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={onLogout}
        className="w-full h-12 rounded-btn bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 flex items-center justify-center gap-2 transition-colors touch-manipulation"
      >
        <LogOut className="w-4 h-4" />
        <span>{t.logout}</span>
      </button>
    </div>
  );
};
