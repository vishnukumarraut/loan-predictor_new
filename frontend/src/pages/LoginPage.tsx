import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', {
        login_id: loginId,
        password: password
      });
      onLoginSuccess(res.data.access_token, res.data);
      if (res.data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/loan-eligibility');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = () => {
    setLoginId('9876543210');
    setPassword('demo123');
  };

  const fillDemoAdmin = () => {
    setLoginId('admin@loancompare.ai');
    setPassword('admin123');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full fintech-card p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center mx-auto shadow-glow">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Sign In to LoanCompare AI</h2>
          <p className="text-xs text-slate-400">Access your financial assessment & application tracking</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number or Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="e.g. 9876543210 or user@example.com"
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-lg text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full fintech-glow-button py-3 rounded-lg text-sm font-semibold text-white shadow-glow flex items-center justify-center space-x-2"
          >
            {loading ? <span>Signing In...</span> : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 space-y-3">
          <p className="text-xs text-center text-slate-400">Quick Demo Logins:</p>
          <div className="flex gap-2">
            <button
              onClick={fillDemoUser}
              type="button"
              className="flex-1 py-1.5 px-3 rounded bg-blue-950/60 border border-blue-800/40 text-xs text-blue-300 hover:bg-blue-900/60"
            >
              User Demo
            </button>
            <button
              onClick={fillDemoAdmin}
              type="button"
              className="flex-1 py-1.5 px-3 rounded bg-purple-950/60 border border-purple-800/40 text-xs text-purple-300 hover:bg-purple-900/60"
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
