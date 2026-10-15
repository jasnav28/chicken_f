import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shop } from '../../types';
import { Phone, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ShopLoginProps {
  onLoginSuccess: () => void;
}

export const ShopLogin: React.FC<ShopLoginProps> = ({ onLoginSuccess }) => {
  const { shops, setCurrentShop, setRole, t } = useApp();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    // Match phone to registered shop
    const matched = shops.find((s) => s.phone.endsWith(phoneNumber.slice(-10)));
    if (matched) {
      setSelectedShop(matched);
      setOtpSent(true);
    } else {
      // Auto-assign first shop for demo convenience if unknown number
      setSelectedShop(shops[0]);
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedShop) {
      setCurrentShop(selectedShop);
      onLoginSuccess();
    }
  };

  const handleQuickDemoLogin = (shop: Shop) => {
    setCurrentShop(shop);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-4 py-8">
      <div className="w-full max-w-sm mx-auto bg-surface rounded-card border border-border p-6 shadow-subtle">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center mx-auto mb-3 shadow-sm">
            <span className="text-white font-extrabold text-2xl tracking-tighter">CL</span>
          </div>
          <h1 className="text-xl font-bold text-textPrimary">ChickenLink Retailer</h1>
          <p className="text-xs text-textSecondary mt-1">Daily fresh chicken order & delivery</p>
        </div>

        {!otpSent ? (
          /* Step 1: Phone Number */
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-textPrimary mb-1.5">
                Registered Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary text-sm font-medium">
                  +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="9845012345"
                  className="w-full h-12 pl-12 pr-3 rounded-btn border border-border bg-surface text-textPrimary font-semibold text-base focus:ring-2 focus:ring-brand focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-btn bg-brand hover:bg-brand-hover text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors touch-manipulation"
            >
              <span>Get Login OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 rounded-card bg-emerald-50 border border-emerald-100 text-xs text-emerald-900">
              <span className="font-semibold block">OTP Sent via SMS!</span>
              Enter the 4-digit verification code sent to +91 {phoneNumber || selectedShop?.phone}.
            </div>

            <div>
              <label className="block text-xs font-semibold text-textPrimary mb-1.5">Enter OTP Code</label>
              <input
                type="text"
                maxLength={4}
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1234"
                className="w-full h-12 text-center tracking-[1em] text-xl font-bold rounded-btn border border-border bg-surface text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-btn bg-brand hover:bg-brand-hover text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors touch-manipulation"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Enter Shop</span>
            </button>
          </form>
        )}

        {/* Quick Demo Shop Selectors */}
        <div className="mt-6 pt-5 border-t border-border">
          <span className="text-[11px] font-bold uppercase tracking-wider text-textSecondary block text-center mb-2.5">
            1-Click Demo Login
          </span>
          <div className="space-y-1.5">
            {shops.slice(0, 3).map((shop) => (
              <button
                key={shop.id}
                type="button"
                onClick={() => handleQuickDemoLogin(shop)}
                className="w-full p-2.5 rounded-btn border border-border bg-slate-50 hover:bg-emerald-50 hover:border-brand/40 text-left transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-semibold text-textPrimary block">{shop.name}</span>
                  <span className="text-[10px] text-textSecondary">{shop.area_route}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-textSecondary" />
              </button>
            ))}
          </div>

          {/* Quick toggle to Admin */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setRole('admin')}
              className="text-xs text-brand hover:underline font-semibold flex items-center justify-center gap-1 mx-auto"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Distributor Admin Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
