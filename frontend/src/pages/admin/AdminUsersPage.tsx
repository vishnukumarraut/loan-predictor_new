import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white">Registered Users & Consent Audit</h1>
        <p className="text-xs text-slate-400">User account registry with privacy consent logging flags</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading user registry...</div>
      ) : (
        <div className="fintech-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-4">User ID</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Mobile (Masked)</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Consent Status</th>
                  <th className="p-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="p-4 font-mono text-blue-400">{u.id}</td>
                    <td className="p-4 font-semibold text-white">{u.full_name}</td>
                    <td className="p-4 font-mono text-slate-400">{u.mobile_masked}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-900 text-slate-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.consent_recorded ? (
                        <span className="inline-flex items-center text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Consent Logged
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Pending</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
