import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Phone, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import api from '../services/api';

export const VerifyMobilePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMobile = location.state?.mobile_number || '9876543210';

  const [mobileNumber, setMobileNumber] = useState(initialMobile);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/auth/send-otp', { mobile_number: mobileNumber });
      setOtpSent(true);
      setCountdown(res.data.expires_in_seconds || 120);
      if (res.data.otp_demo_display) {
        setDemoOtp(res.data.otp_demo_display);
        setOtpCode(res.data.otp_demo_display); // Pre-fill in mock mode for instant developer convenience!
      }
      setSuccessMsg('OTP sent successfully!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/verify-otp', {
        mobile_number: mobileNumber,
        otp_code: otpCode
      });
      setSuccessMsg('Mobile verified successfully!');
      setTimeout(() => {
        navigate('/loan-eligibility');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full fintech-card p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 shadow-glow">
            <Phone className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Mobile Authentication</h2>
          <p className="text-xs text-slate-400">Verify your mobile number to begin loan eligibility analysis</p>
        </div>

        {/* Development Mock Mode Badge */}
        <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/30 text-xs text-blue-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="font-semibold">MOCK_OTP_MODE = true</span>
          </div>
          <span className="text-[10px] bg-blue-900/60 px-2 py-0.5 rounded text-blue-200 uppercase font-mono">Dev Sandbox</span>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={`+91 ${mobileNumber}`}
                onChange={(e) => setMobileNumber(e.target.value.replace('+91 ', ''))}
                className="flex-1 glass-input px-4 py-2.5 rounded-lg text-sm font-mono"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || (countdown > 0)}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white whitespace-nowrap transition-colors"
              >
                {otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>
          </div>

          {demoOtp && (
            <div className="p-3 rounded-lg bg-purple-950/50 border border-purple-500/40 text-center space-y-1">
              <span className="text-[11px] text-purple-300 block uppercase font-semibold tracking-wider">Dev Mock OTP Generated:</span>
              <span className="text-2xl font-black text-purple-200 tracking-widest font-mono">{demoOtp}</span>
            </div>
          )}

          {otpSent && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">Enter 6-Digit OTP</label>
                  {countdown > 0 && (
                    <span className="text-xs text-slate-400 font-mono">Expires in: {countdown}s</span>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="_ _ _ _ _ _"
                  className="w-full glass-input px-4 py-3 rounded-lg text-center text-xl font-bold tracking-widest font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full fintech-glow-button py-3 rounded-lg text-sm font-semibold text-white shadow-glow flex items-center justify-center space-x-2"
              >
                {loading ? <span>Verifying...</span> : (
                  <>
                    <span>Verify OTP & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
