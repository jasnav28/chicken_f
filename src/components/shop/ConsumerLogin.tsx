import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shop } from '../../types';
import {
  UtensilsCrossed,
  BarChart3,
  Receipt,
  Package,
  Truck,
  Store,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConsumerLoginProps {
  onLoginSuccess?: () => void;
}

export const ConsumerLogin: React.FC<ConsumerLoginProps> = ({ onLoginSuccess }) => {
  const { shops, setCurrentShop, setRole } = useApp();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter your User ID, Email, or Phone number.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    const cleanUser = username.trim().toLowerCase();

    // Match consumer in shops database
    const matched = shops.find(
      (s) =>
        s.username?.toLowerCase() === cleanUser ||
        s.phone === cleanUser ||
        s.email?.toLowerCase() === cleanUser
    );

    setTimeout(() => {
      setIsLoading(false);
      if (!matched) {
        setErrorMsg('Invalid User ID or Email. Please check credentials or contact admin.');
        return;
      }

      if (!matched.is_active) {
        setErrorMsg('This consumer account has been deactivated by the distributor.');
        return;
      }

      // Check password (allow specific password or admin override 'admin123')
      if (matched.password && matched.password !== password && password !== 'admin123') {
        setErrorMsg('Incorrect password. Please try again or ask admin to reset.');
        return;
      }

      // Successful Consumer Login
      localStorage.setItem('ckl_authenticated_shop_id', matched.id);
      setCurrentShop(matched);
      setRole('shop');
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      navigate('/');
    }, 350);
  };

  const handleQuickDemoLogin = (shop: Shop) => {
    localStorage.setItem('ckl_authenticated_shop_id', shop.id);
    setCurrentShop(shop);
    setRole('shop');
    setShowDemoModal(false);
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#1A060E]">
      {/* ============================================================== */}
      {/* LEFT BRANDING PANEL (RestoPilot with Poultry Farm Image)       */}
      {/* ============================================================== */}
      <div
        className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden min-h-[500px] md:min-h-screen border-b md:border-b-0 md:border-r border-[#360F1D]"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(32, 7, 16, 0.92) 0%, rgba(48, 10, 24, 0.88) 100%), url('/poultry-farm-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Subtle Decorative Pattern Layer */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#F97316 1px, transparent 1px)`,
            backgroundSize: `36px 36px`,
          }}
        />

        {/* Top: RestoPilot Brand by BluNet */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#F97316] flex items-center justify-center text-white shadow-lg shadow-orange-950/40">
              <UtensilsCrossed className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-white leading-none">
                RestoPilot
              </div>
              <div className="text-xs text-orange-200/90 font-medium tracking-wide mt-1">
                By BluNet IT Services
              </div>
            </div>
          </div>
        </div>

        {/* Center: Main Headline, Subtitle & 4 Feature Badges */}
        <div className="relative z-10 my-auto py-8 max-w-lg">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Manage your restaurant, simplify your{' '}
            <span className="text-[#F97316]">success.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200/90 mt-4 leading-relaxed font-normal">
            Chicken distribution service by BluNet IT Services helps you handle daily fresh poultry
            orders, smart scale weight billing, live market rates, and purchases — all in one
            powerful platform.
          </p>

          {/* 4 Feature Cards (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            {/* 1. Sales Dashboard */}
            <div className="flex items-start gap-3 bg-[#260A15]/60 backdrop-blur-sm p-2.5 rounded-xl border border-white/5">
              <div className="w-9 h-9 rounded-lg bg-[#33101E] border border-[#F97316]/40 flex items-center justify-center text-[#F97316] shrink-0 mt-0.5">
                <BarChart3 className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Sales Dashboard</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Track restaurant performance.
                </p>
              </div>
            </div>

            {/* 2. Smart Billing */}
            <div className="flex items-start gap-3 bg-[#260A15]/60 backdrop-blur-sm p-2.5 rounded-xl border border-white/5">
              <div className="w-9 h-9 rounded-lg bg-[#33101E] border border-[#F97316]/40 flex items-center justify-center text-[#F97316] shrink-0 mt-0.5">
                <Receipt className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Smart Billing</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Create bills quickly.
                </p>
              </div>
            </div>

            {/* 3. Inventory */}
            <div className="flex items-start gap-3 bg-[#260A15]/60 backdrop-blur-sm p-2.5 rounded-xl border border-white/5">
              <div className="w-9 h-9 rounded-lg bg-[#33101E] border border-[#F97316]/40 flex items-center justify-center text-[#F97316] shrink-0 mt-0.5">
                <Package className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Inventory</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Monitor ingredients and stock.
                </p>
              </div>
            </div>

            {/* 4. Purchases */}
            <div className="flex items-start gap-3 bg-[#260A15]/60 backdrop-blur-sm p-2.5 rounded-xl border border-white/5">
              <div className="w-9 h-9 rounded-lg bg-[#33101E] border border-[#F97316]/40 flex items-center justify-center text-[#F97316] shrink-0 mt-0.5">
                <Truck className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Purchases</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Track stock purchases.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Decorative Store Outline Watermark */}
        <div className="relative z-10 flex items-center justify-between text-slate-300 text-xs pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#F97316]" />
            <span className="text-xs text-slate-200 font-medium">BluNet IT Services • Poultry Cloud</span>
          </div>
          <span className="text-[11px] text-orange-200/80 font-mono">RestoPilot v2.0</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT LOGIN PANEL (Matches screenshot exact form design)       */}
      {/* ============================================================== */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Header Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Welcome <span className="text-[#F97316]">Back!</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 font-normal">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3.5 rounded-card bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email / User ID Input */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Email or User ID
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="name@example.com or user_id"
                className="w-full h-12 px-3.5 rounded-btn border border-[#E2E8F0] bg-white text-[#0F172A] text-sm focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">Password</label>
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      'Please contact your distributor admin to reset your credentials.'
                    )
                  }
                  className="text-xs font-semibold text-[#F97316] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-3.5 pr-10 rounded-btn border border-[#E2E8F0] bg-white text-[#0F172A] text-sm focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-[#64748B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#F97316] focus:ring-[#F97316] border-[#CBD5E1]"
                />
                <span>Remember me</span>
              </label>

              <span className="text-[11px] text-slate-400">Default pass: star123</span>
            </div>

            {/* Solid Vibrant Orange Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-btn bg-[#F97316] hover:bg-[#EA580C] active:bg-[#C2410C] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all touch-manipulation disabled:opacity-60"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register Info */}
          <div className="text-center text-xs text-[#64748B]">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() =>
                alert(
                  'The distributor creates consumer profiles. Please enter /admin in URL to create new consumer user IDs and passwords.'
                )
              }
              className="font-semibold text-[#F97316] hover:underline"
            >
              Register your restaurant
            </button>
          </div>

          {/* OR Divider Line */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E2E8F0] w-full" />
            <span className="bg-white px-3 text-xs uppercase tracking-wider text-slate-400 font-semibold absolute">
              OR
            </span>
          </div>

          {/* Secondary Outline Button */}
          {shops.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowDemoModal(true)}
              className="w-full h-12 rounded-btn border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] font-semibold text-xs flex items-center justify-center gap-2 transition-colors touch-manipulation"
            >
              <Store className="w-4 h-4 text-[#F97316]" />
              <span>Select Registered Consumer ({shops.length} Available)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/admin/shops')}
              className="w-full h-12 rounded-btn border border-dashed border-[#F97316] hover:bg-orange-50/50 text-[#F97316] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Store className="w-4 h-4" />
              <span>No shops yet • Create Shop Accounts in /admin</span>
            </button>
          )}

          {/* Direct Link to /admin */}
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="text-xs font-semibold text-slate-600 hover:text-[#0F172A] inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Distributor Admin? Enter <strong>/admin</strong> directly</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Demo Consumer Selector Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-card border border-[#E2E8F0] shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-base text-textPrimary">Select Registered Consumer</h3>
                <p className="text-xs text-textSecondary">
                  Log in directly as any shop with User ID & Password
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="divide-y divide-border my-3 max-h-72 overflow-y-auto">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => handleQuickDemoLogin(shop)}
                  className="p-3 hover:bg-orange-50/60 cursor-pointer transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-sm text-textPrimary block">{shop.name}</span>
                    <span className="text-[11px] text-textSecondary">
                      User ID: <strong className="font-mono text-brand">{shop.username}</strong> •
                      Pass: <span className="font-mono">{shop.password || 'star123'}</span>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-600 text-[10px]">
                    {shop.area_route}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowDemoModal(false)}
              className="w-full h-10 rounded-btn bg-slate-100 text-textSecondary font-semibold text-xs hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
