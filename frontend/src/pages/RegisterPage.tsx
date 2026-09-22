import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User as UserIcon, Phone, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface RegisterPageProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Clean phone number
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/register', {
        full_name: fullName,
        mobile_number: cleanMobile,
        email: email,
        password: password
      });
      onLoginSuccess(res.data.access_token, res.data);
      // Navigate to OTP verification page
      navigate('/verify-mobile', { state: { mobile_number: cleanMobile } });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full fintech-card p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center mx-auto shadow-glow">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
          <p className="text-xs text-slate-400">Assess loan eligibility & find matching loan products</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number (+91)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-lg text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full fintech-glow-button py-3 rounded-lg text-sm font-semibold text-white shadow-glow flex items-center justify-center space-x-2"
          >
            {loading ? <span>Creating Account...</span> : (
              <>
                <span>Register & Verify Mobile</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already registered?{' '}
          <Link to="/login" className="text-blue-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
