import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Download } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [riskFilter, statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (riskFilter) params.risk = riskFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/applications', { params });
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return app.id.toLowerCase().includes(term) || app.user_name.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Application Master Registry</h1>
          <p className="text-xs text-slate-400">Searchable table with sensitive field masking compliance</p>
        </div>

        <Link to="/admin/reports" className="fintech-glow-button px-4 py-2 rounded-lg text-xs font-semibold text-white flex items-center space-x-1.5">
          <Download className="w-4 h-4" />
          <span>Export Excel</span>
        </Link>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="fintech-card p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Application ID or User Name..."
            className="w-full glass-input pl-10 pr-4 py-2 rounded-lg text-xs"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="glass-input px-3 py-2 rounded-lg text-xs bg-slate-900 text-slate-200"
          >
            <option value="">All Risk Levels</option>
            <option value="LOW">LOW Risk</option>
            <option value="MEDIUM">MEDIUM Risk</option>
            <option value="HIGH">HIGH Risk</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input px-3 py-2 rounded-lg text-xs bg-slate-900 text-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ELIGIBILITY_CHECKED">ELIGIBILITY_CHECKED</option>
            <option value="MANUAL_REVIEW">MANUAL_REVIEW</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading applications table...</div>
      ) : (
        <div className="fintech-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-4">Application ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">User Name</th>
                  <th className="p-4">Mobile (Masked)</th>
                  <th className="p-4">Loan Type</th>
                  <th className="p-4">Requested Loan</th>
                  <th className="p-4">Risk Level</th>
                  <th className="p-4">Matched Products</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-mono text-blue-400 font-bold">{app.id}</td>
                    <td className="p-4 text-slate-400">{formatDate(app.created_at)}</td>
                    <td className="p-4 font-semibold text-white">{app.user_name}</td>
                    <td className="p-4 font-mono text-slate-400">{app.user_mobile_masked}</td>
                    <td className="p-4">{app.loan_type}</td>
                    <td className="p-4 font-bold text-emerald-400">{formatCurrency(app.requested_amount)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${app.risk_category === 'LOW' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30' : app.risk_category === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border-amber-500/30' : 'bg-red-950 text-red-300 border-red-500/30'}`}>
                        {app.risk_category || 'MEDIUM'}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-purple-300">{app.matched_products_count} Products</td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/application/${app.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-blue-400 hover:border-blue-500/50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
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
