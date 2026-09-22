import React, { useEffect, useState } from 'react';
import { User, Lock, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { formatDate } from '../utils/formatters';

export const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      setProfileData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-slate-400">Loading user profile...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{profileData?.full_name}</h1>
          <p className="text-xs text-slate-400">User Profile & Data Governance History</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Details */}
        <div className="fintech-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Account Details</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Mobile Number:</span><span className="font-mono text-slate-200">{profileData?.mobile_number}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Email:</span><span className="text-slate-200">{profileData?.email}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Role:</span><span className="text-purple-300 font-semibold">{profileData?.role}</span></div>
            <div className="flex justify-between border-t border-slate-800 pt-2"><span className="text-slate-400">PAN Verification Status:</span><span className="text-emerald-400 font-semibold">{profileData?.pan_verification?.verification_status || 'Verified (Mock)'}</span></div>
          </div>
        </div>

        {/* Consent Logs */}
        <div className="fintech-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-blue-400" />
            <span>Recorded Financial Data Consents</span>
          </h3>

          <div className="space-y-3">
            {profileData?.consents?.length > 0 ? (
              profileData.consents.map((c: any) => (
                <div key={c.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-emerald-400 font-semibold">
                    <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Consent Granted</span>
                    <span className="text-[10px] text-slate-400">{formatDate(c.timestamp)}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{c.purpose}</p>
                  <span className="text-[10px] text-slate-500 font-mono">Version: {c.consent_version}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No consent history logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
