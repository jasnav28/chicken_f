import React from 'react';
import { useApp } from '../../context/AppContext';
import { Store, ShieldCheck, Volume2, VolumeX, Globe, RotateCcw } from 'lucide-react';
import { Language } from '../../lib/i18n';
import { useNavigate, useLocation } from 'react-router-dom';

export const RoleSwitcher: React.FC = () => {
  const {
    shops,
    currentShop,
    setCurrentShop,
    language,
    setLanguage,
    settings,
    updateSettings,
    resetDemoData,
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  ];

  return (
    <div className="no-print bg-slate-900 text-white text-xs py-2 px-3 sm:px-6 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 z-50">
      {/* Route & Role Pill Switcher */}
      <div className="flex items-center gap-1.5 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
        <button
          type="button"
          onClick={() => navigate('/')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
            !isAdminRoute
              ? 'bg-brand text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Shop View (/)</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
            isAdminRoute
              ? 'bg-brand text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin Portal (/admin)</span>
        </button>
      </div>

      {/* Shop Selector (visible when in shop mode) */}
      {!isAdminRoute && (
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden sm:inline">Active Shop:</span>
          <select
            value={currentShop.id}
            onChange={(e) => {
              const matched = shops.find((s) => s.id === e.target.value);
              if (matched) setCurrentShop(matched);
            }}
            className="bg-slate-800 text-slate-100 text-xs rounded-md border border-slate-700 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand font-medium max-w-[200px] truncate"
          >
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.username})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Right controls: Language, Sound, Reset */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Picker */}
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-slate-800 text-slate-200 text-xs rounded-md border border-slate-700 pl-2 pr-6 py-1 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer appearance-none"
            aria-label="Select Language"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native} ({l.code.toUpperCase()})
              </option>
            ))}
          </select>
          <Globe className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
        </div>

        {/* Sound Alert Toggle */}
        <button
          type="button"
          onClick={() => updateSettings({ sound_alert_enabled: !settings.sound_alert_enabled })}
          title={settings.sound_alert_enabled ? 'Sound alerts active' : 'Sound alerts muted'}
          className={`p-1.5 rounded-md border transition-colors ${
            settings.sound_alert_enabled
              ? 'bg-slate-800 border-slate-700 text-green-400 hover:bg-slate-750'
              : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-750'
          }`}
        >
          {settings.sound_alert_enabled ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Reset Demo Data */}
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all sample orders, shops, rates and payments to fresh defaults?')) {
              resetDemoData();
            }
          }}
          title="Reset sample data"
          className="p-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
