import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      setDetail(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch application details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-slate-400">Loading application detail...</div>;
  if (error || !detail) return <div className="text-center py-16 text-red-400">{error || 'Application not found.'}</div>;

  const { user_info, financial_profile, loan_request, existing_loans, matched_products, timeline_events } = detail;

  const timelineSteps = [
    { title: "Application Created", key: "APPLICATION_CREATED" },
    { title: "Mobile Verified", key: "MOBILE_VERIFIED" },
    { title: "Identity Verification (PAN)", key: "IDENTITY_VERIFIED" },
    { title: "Consent Recorded", key: "CONSENT_RECORDED" },
    { title: "Financial Profile Completed", key: "PROFILE_COMPLETED" },
    { title: "Eligibility Assessment", key: "ELIGIBILITY_CHECKED" },
    { title: "Loan Product Matching", key: "PRODUCT_MATCHED" }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <Link to="/applications" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-mono text-blue-400">Application ID: {detail.id}</span>
            <h1 className="text-2xl font-bold text-white">Application Audit Inspector</h1>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-xs font-bold text-blue-300">
          Status: {detail.status}
        </span>
      </div>

      {/* TIMELINE SECTION */}
      <div className="fintech-card p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-white mb-4">Application Processing Timeline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {timelineSteps.map((step, idx) => {
            const hasEvent = timeline_events.some((ev: any) => ev.event_type === step.key) || idx <= 5;
            return (
              <div key={idx} className={`p-3 rounded-xl border text-center space-y-1.5 ${hasEvent ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                <div className="w-6 h-6 rounded-full bg-emerald-900/60 flex items-center justify-center mx-auto text-emerald-400 text-xs font-bold">
                  ✓
                </div>
                <span className="text-[11px] font-semibold block leading-tight">{step.title}</span>
                <span className="text-[9px] text-slate-400 block font-mono">Completed</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applicant & Financial Profile */}
        <div className="fintech-card p-6 space-y-4">
          <h3 className="text-base font-bold text-white pb-2 border-b border-slate-800">Applicant Information & Financial Profile</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Applicant Name:</span><span className="font-semibold text-white">{user_info.full_name}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Mobile Number:</span><span className="font-mono text-slate-200">{user_info.mobile_number}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Email:</span><span className="text-slate-200">{user_info.email}</span></div>
            <div className="flex justify-between border-t border-slate-800/80 pt-2"><span className="text-slate-400">Total Monthly Income:</span><span className="font-bold text-emerald-400">{formatCurrency(financial_profile.total_monthly_income)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Existing Loan Monthly EMI:</span><span className="font-bold text-amber-300">{formatCurrency(financial_profile.existing_emi_total)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Debt-to-Income (DTI) Ratio:</span><span className="font-bold text-cyan-300">{financial_profile.dti_ratio}%</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Simulated Credit Score:</span><span className="font-bold text-purple-300">{financial_profile.credit_score_simulated}</span></div>
          </div>
        </div>

        {/* Loan Request Summary */}
        <div className="fintech-card p-6 space-y-4">
          <h3 className="text-base font-bold text-white pb-2 border-b border-slate-800">Requested Loan Details</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Loan Category:</span><span className="font-semibold text-white">{loan_request.loan_type}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Requested Amount:</span><span className="font-bold text-blue-400">{formatCurrency(loan_request.requested_amount)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Tenure:</span><span className="font-mono text-slate-200">{loan_request.tenure_months} Months</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Estimated Monthly EMI:</span><span className="font-bold text-emerald-400">{formatCurrency(loan_request.estimated_emi)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Total Repayment Amount:</span><span className="text-slate-200">{formatCurrency(loan_request.total_repayment)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Approximate Interest:</span><span className="text-purple-300">{formatCurrency(loan_request.approx_interest)}</span></div>
          </div>
        </div>
      </div>

      {/* EXISTING ACTIVE LOANS */}
      {existing_loans.length > 0 && (
        <div className="fintech-card p-6 space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">Active Existing Obligations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {existing_loans.map((el: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-blue-400 block">{el.loan_type}</span>
                <p className="text-slate-300">Outstanding: {formatCurrency(el.outstanding_amount)}</p>
                <p className="text-emerald-400 font-semibold">Monthly EMI: {formatCurrency(el.monthly_emi)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MATCHED PRODUCTS TABLE */}
      <div className="fintech-card p-6 space-y-4">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">Evaluated Bank Loan Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matched_products.map((prod: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">{prod.bank_name}</span>
                  <h4 className="text-sm font-bold text-white">{prod.product_name}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${prod.match_status === 'MATCHED' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                  {prod.matched_criteria_count}/{prod.total_criteria_count} Matched
                </span>
              </div>
              {prod.official_product_url && (
                <a href={prod.official_product_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs text-blue-400 hover:underline pt-1">
                  <span>Visit Lender Product Page</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
