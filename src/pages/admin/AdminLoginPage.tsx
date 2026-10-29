import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreview } from '../../context/PreviewContext';

interface AdminLoginPageProps {
  navigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ navigate }) => {
  const { signIn, resetPassword, loginAsPreviewAdmin, isAdmin } = useAuth();
  const { isConfigured, setShowSetupModal } = usePreview();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  // If already authenticated as admin, jump to dashboard
  if (isAdmin) {
    navigate('/admin');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn(email, password);
      if (res.success) {
        navigate('/admin');
      } else {
        setError(res.error || 'Invalid credentials or unauthorized account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    if (!email.trim()) {
      setError('Please provide your administrator email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email);
      if (res.success) {
        setResetMessage(res.message || 'Password reset link sent to your email.');
      } else {
        setError(res.error || 'Failed to request password reset.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#FFFEFC] border border-[#D8CBBE] rounded-sm p-6 sm:p-8 shadow-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#241C19] text-[#B99A64] mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#241C19]">
            Administrator Portal
          </h1>
          <p className="text-xs text-[#241C19]/60">
            ESTCHAY LUX LADY’S BAGS Store Management
          </p>
        </div>

        {/* Notices */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {resetMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs">
            {resetMessage}
          </div>
        )}

        {/* Form */}
        {!showForgot ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="admin-password" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                  Dashboard Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full text-xs pl-9 pr-3 py-3 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
                />
                <Lock className="w-4 h-4 text-[#241C19]/40 absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#241C19] hover:bg-[#6D2638] text-[#F8F5EF] text-xs font-semibold rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:bg-stone-300"
            >
              <span>{loading ? 'Verifying...' : 'Access Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="admin-reset-email" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                Administrator Email Address
              </label>
              <input
                id="admin-reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@estchaybags.com"
                className="w-full text-xs px-3 py-2.5 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#241C19] hover:bg-[#6D2638] text-[#F8F5EF] text-xs font-semibold rounded-xs transition-colors"
            >
              <span>{loading ? 'Sending link...' : 'Send Password Reset Email'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="w-full text-center text-xs text-[#241C19]/60 hover:text-[#241C19]"
            >
              ← Back to login
            </button>
          </form>
        )}

        {/* Preview / Unconfigured Mode Fast-Track for Developer & Owner Inspection */}
        {!isConfigured && (
          <div className="pt-4 border-t border-[#D8CBBE]/50 space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xs text-[11px] text-amber-900 leading-relaxed">
              <strong>Supabase Not Connected:</strong> In this evaluation preview without live credentials, you can inspect all admin dashboard features using Preview Admin Mode.
            </div>

            <button
              type="button"
              onClick={() => {
                loginAsPreviewAdmin();
                navigate('/admin');
              }}
              className="w-full py-2.5 px-3 bg-[#B99A64] hover:bg-[#a68853] text-[#241C19] text-xs font-semibold rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Enter Preview Admin Dashboard</span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowSetupModal(true)}
                className="text-[11px] text-[#241C19]/70 hover:underline inline-flex items-center gap-1"
              >
                <Info className="w-3 h-3" />
                <span>View Supabase setup instructions</span>
              </button>
            </div>
          </div>
        )}

        {/* Return to Storefront */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-[#241C19]/60 hover:text-[#241C19] hover:underline"
          >
            ← Return to public storefront
          </button>
        </div>
      </div>
    </div>
  );
};
