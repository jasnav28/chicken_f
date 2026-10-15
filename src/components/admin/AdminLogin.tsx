import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const { setRole, settings } = useApp();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (
        (username.trim().toLowerCase() === 'admin' || username.trim().toLowerCase() === 'distributor') &&
        password === 'admin123'
      ) {
        setRole('admin');
        onLoginSuccess();
      } else {
        setErrorMsg('Invalid admin credentials. Use admin / admin123 for demo access.');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center px-4 py-8 relative">
      <div className="w-full max-w-sm mx-auto bg-surface rounded-card border border-border p-6 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-textPrimary">Distributor Admin Portal</h1>
          <p className="text-xs text-textSecondary">{settings.business_name}</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-card bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-textPrimary mb-1">Admin Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-btn border border-border bg-surface text-textPrimary font-semibold focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-textPrimary mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-btn border border-border bg-surface text-textPrimary font-semibold focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-btn bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px]">
            Demo credentials: <strong>admin</strong> / <strong>admin123</strong>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-btn bg-brand hover:bg-brand-hover text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <span>Access Admin Management</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-border text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-xs text-textSecondary hover:text-brand inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Consumer Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
