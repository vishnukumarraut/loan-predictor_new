import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LogOut, User as UserIcon, LayoutDashboard, ChevronRight } from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();


  return (
    <header className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-md border-b border-blue-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
                LoanCompare <span className="text-purple-400">AI</span>
              </span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Gradient Boosting Engine
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link to="/" className={`hover:text-blue-400 transition-colors ${location.pathname === '/' ? 'text-blue-400 font-semibold' : 'text-slate-300'}`}>
              Home
            </Link>
            <Link to="/loan-eligibility" className={`hover:text-blue-400 transition-colors ${location.pathname === '/loan-eligibility' ? 'text-blue-400 font-semibold' : 'text-slate-300'}`}>
              Check Eligibility
            </Link>
            <Link to="/applications" className={`hover:text-blue-400 transition-colors ${location.pathname === '/applications' ? 'text-blue-400 font-semibold' : 'text-slate-300'}`}>
              My Applications
            </Link>
          </nav>

          {/* Dev Demo Mode Indicator & User Controls */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-xs text-blue-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>MOCK_OTP_MODE = true</span>
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-sm text-slate-200 hover:border-blue-500/50 transition-colors">
                  <UserIcon className="w-4 h-4 text-blue-400" />
                  <span className="max-w-[120px] truncate">{user.full_name}</span>
                </Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="px-3 py-1.5 rounded-lg bg-purple-900/40 border border-purple-500/40 text-xs text-purple-300 hover:bg-purple-900/60 flex items-center space-x-1">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="fintech-glow-button px-4 py-2 rounded-lg text-sm font-medium text-white shadow-glow flex items-center space-x-1">
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
