import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, LayoutDashboard } from 'lucide-react';
import api from '../../services/api';

interface AdminLoginPageProps {
  onAdminLoginSuccess: (token: string, user: any) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onAdminLoginSuccess }) => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('admin@loancompare.ai');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/admin/login', {
        login_id: loginId,
        password: password
      });
      onAdminLoginSuccess(res.data.access_token, res.data);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Admin login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full fintech-card p-8 space-y-6 relative overflow-hidden">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center mx-auto shadow-purple-glow">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Management Portal</h2>
          <p className="text-xs text-purple-300">LoanCompare AI Underwriting & Criteria Manager</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Email / Username</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-lg text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-3 rounded-lg text-sm font-semibold text-white shadow-purple-glow flex items-center justify-center space-x-2 transition-all"
          >
            {loading ? <span>Authenticating Admin...</span> : (
              <>
                <span>Access Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-200 text-center">
          Default Admin Demo: <span className="font-mono text-white">admin@loancompare.ai</span> / <span className="font-mono text-white">admin123</span>
        </div>
      </div>
    </div>
  );
};
