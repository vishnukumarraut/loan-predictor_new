import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Building2, Layers, Sliders, Cpu, Download, ArrowLeft } from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Applications Registry', path: '/admin/applications', icon: FileText },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Manage Banks', path: '/admin/banks', icon: Building2 },
    { name: 'Loan Products', path: '/admin/loan-products', icon: Layers },
    { name: 'Visual Criteria Rules', path: '/admin/criteria', icon: Sliders },
    { name: 'ML Model Analytics', path: '/admin/ml-model', icon: Cpu },
    { name: 'Excel Reports', path: '/admin/reports', icon: Download },
  ];

  return (
    <aside className="w-64 bg-[#070d1e] border-r border-slate-800 p-4 space-y-6 flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40">
          <span className="text-[10px] uppercase tracking-wider text-purple-300 font-bold block">Admin Portal</span>
          <span className="text-xs text-slate-300 font-semibold">Underwriting Manager</span>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${active ? 'bg-purple-600 text-white shadow-purple-glow' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <Link to="/" className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white px-3 py-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public App</span>
        </Link>
      </div>
    </aside>
  );
};
