import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ChevronRight, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      setApplications(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load applications. Please log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Application Tracking</h1>
          <p className="text-xs text-slate-400">Track and inspect your loan eligibility assessments</p>
        </div>

        <Link to="/loan-eligibility" className="fintech-glow-button px-5 py-2.5 rounded-lg text-xs font-semibold text-white shadow-glow">
          + New Eligibility Check
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading applications...</div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      ) : applications.length === 0 ? (
        <div className="fintech-card p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Applications Found</h3>
          <p className="text-xs text-slate-400">You haven't run any loan eligibility assessments yet.</p>
          <Link to="/loan-eligibility" className="inline-block fintech-glow-button px-6 py-2.5 rounded-lg text-xs font-semibold text-white">
            Start First Assessment
          </Link>
        </div>
      ) : (
        <div className="fintech-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-4">Application ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Loan Type</th>
                  <th className="p-4">Requested Amount</th>
                  <th className="p-4">Risk Level</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-mono text-blue-400 font-bold">{app.id}</td>
                    <td className="p-4 text-slate-400">{formatDate(app.created_at)}</td>
                    <td className="p-4 font-semibold text-white">{app.loan_type}</td>
                    <td className="p-4 font-bold text-emerald-400">{formatCurrency(app.requested_amount)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${app.risk_category === 'LOW' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30' : app.risk_category === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border-amber-500/30' : 'bg-red-950 text-red-300 border-red-500/30'}`}>
                        {app.risk_category || 'MEDIUM'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 text-[10px] font-semibold uppercase tracking-wider border border-blue-800">
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/application/${app.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition-colors"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
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
