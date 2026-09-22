import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { FileText, Users, CheckCircle2, ShieldAlert, Building2, Download, RefreshCw, Cpu, Layers } from 'lucide-react';
import api from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-slate-400">Loading admin analytics dashboard...</div>;

  const { kpis, charts } = data || {};
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono text-purple-400">Admin Control Center</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Underwriting & Analytics Dashboard</h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/reports"
            className="fintech-glow-button px-4 py-2 rounded-lg text-xs font-semibold text-white flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Excel Export</span>
          </Link>
          <button
            onClick={fetchDashboard}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="fintech-card p-4 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Total Apps</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-black text-white">{kpis?.total_applications}</span>
        </div>

        <div className="fintech-card p-4 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Today Apps</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-2xl font-black text-purple-300">{kpis?.today_applications}</span>
        </div>

        <div className="fintech-card p-4 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Verified Users</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400">{kpis?.verified_users}</span>
        </div>

        <div className="fintech-card p-4 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Eligibility Checks</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-black text-cyan-300">{kpis?.eligibility_checks}</span>
        </div>

        <div className="fintech-card p-4 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Matched Products</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-black text-blue-300">{kpis?.matched_products}</span>
        </div>

        <div className="fintech-card p-4 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Manual Review</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-400">{kpis?.manual_reviews}</span>
        </div>
      </div>

      {/* RECHARTS ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Applications Volume by Day */}
        <div className="fintech-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Applications Volume (Last 7 Days)</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.applications_by_day}>
                <defs>
                  <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6' }} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorApp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: ML Risk Category Distribution */}
        <div className="fintech-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>ML Risk Categories Distribution</span>
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.risk_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts?.risk_distribution?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#8b5cf6' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Applications by Loan Type */}
        <div className="fintech-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Applications by Loan Type</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.loan_types}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="type" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Income Range Demographics */}
        <div className="fintech-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Applicant Monthly Income Ranges</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.income_ranges}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#10b981' }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
