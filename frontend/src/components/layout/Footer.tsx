import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#02050e] border-t border-slate-900 text-slate-400 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-bold text-white">LoanCompare AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Check your loan eligibility, understand your financial profile with explainable AI, and compare matching loan products across partner lenders.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/loan-eligibility" className="hover:text-blue-400 transition-colors">Check Loan Eligibility</Link></li>
              <li><Link to="/applications" className="hover:text-blue-400 transition-colors">Track Applications</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">User Login</Link></li>
              <li><Link to="/admin/login" className="hover:text-purple-400 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Legal & Compliance</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              <li><span className="text-xs text-slate-500">Consent Architecture v1.0</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Security & Architecture</h4>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/40">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Consent-based financial data access</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-blue-400 bg-blue-950/40 p-2.5 rounded-lg border border-blue-800/40">
              <Info className="w-4 h-4 shrink-0" />
              <span>Sandbox & Mock Data Mode</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 LoanCompare AI. Demo & Academic Project implementation.</p>
          <div className="mt-4 md:mt-0 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 max-w-xl text-center md:text-right">
            <span className="font-semibold text-amber-400">DISCLAIMER:</span> Eligibility results are indicative model assessments and do not constitute loan approval or a guarantee of credit. Final lending decisions remain solely with authorized lenders.
          </div>
        </div>
      </div>
    </footer>
  );
};
