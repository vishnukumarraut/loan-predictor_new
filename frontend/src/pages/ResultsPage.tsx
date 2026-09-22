import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Cpu, CheckCircle2, AlertTriangle, ExternalLink, Info, Eye, X } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';
import type { AssessmentResponse, MatchedProductItem } from '../types';

export const ResultsPage: React.FC = () => {
  const location = useLocation();
  const resultData: AssessmentResponse = location.state?.result;
  const [selectedProduct, setSelectedProduct] = useState<MatchedProductItem | null>(null);

  if (!resultData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-slate-400">No active eligibility result found.</p>
        <Link to="/loan-eligibility" className="fintech-glow-button px-6 py-2.5 rounded-lg text-sm text-white">
          Run Loan Eligibility Assessment
        </Link>
      </div>
    );
  }

  const { derived_financials, loan_request_summary, ml_result, matched_products, application_id } = resultData;

  const riskBadgeColor = {
    LOW: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    MEDIUM: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    HIGH: 'bg-red-950/80 text-red-300 border-red-500/40'
  }[ml_result.risk_category] || 'bg-blue-950 text-blue-300';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* TOP SUMMARY BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono text-blue-400">Application ID: {application_id}</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Eligibility & Risk Assessment Results</h1>
        </div>
        <Link to={`/application/${application_id}`} className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:border-blue-500/50 flex items-center space-x-1.5">
          <Eye className="w-4 h-4 text-blue-400" />
          <span>Track Application Timeline</span>
        </Link>
      </div>

      {/* TOP CARD: ELIGIBILITY ASSESSMENT & ML RISK SCORE */}
      <div className="fintech-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Assessment Result</span>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${riskBadgeColor}`}>
                Risk: {ml_result.risk_category}
              </span>
              <span className="text-xs text-blue-300 font-medium">
                {ml_result.model_assessment_label}
              </span>
            </div>
            <p className="text-xs text-slate-400">Model Assessment: <span className="text-white font-bold text-sm">{ml_result.probability_score}% Compatibility</span></p>
          </div>

          <div className="flex items-center space-x-6 bg-slate-900/80 px-6 py-4 rounded-xl border border-slate-800 text-center">
            <div>
              <span className="text-[11px] text-slate-400 block">Model Probability</span>
              <span className="text-3xl font-black text-blue-400">{ml_result.probability_score}%</span>
            </div>
            <div className="border-l border-slate-800 pl-6">
              <span className="text-[11px] text-slate-400 block">Assessment Label</span>
              <span className="text-sm font-bold text-emerald-400">Matches Published Criteria</span>
            </div>
          </div>
        </div>

        {/* FINANCIAL SUMMARY METRICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Estimated EMI</span>
            <span className="text-base font-bold text-emerald-400">{formatCurrency(loan_request_summary.estimated_emi)}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Debt-to-Income</span>
            <span className="text-base font-bold text-cyan-300">{formatPercent(derived_financials.total_dti_ratio)}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Existing Debt</span>
            <span className="text-base font-bold text-amber-300">{formatCurrency(derived_financials.existing_outstanding)}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Requested Loan</span>
            <span className="text-base font-bold text-white">{formatCurrency(loan_request_summary.requested_amount)}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Total Income</span>
            <span className="text-base font-bold text-white">{formatCurrency(derived_financials.total_monthly_income)}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Simulated Credit</span>
            <span className="text-base font-bold text-purple-300">{derived_financials.simulated_credit_score}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 flex items-center space-x-2">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span>This is an indicative model assessment and not a loan approval or guarantee.</span>
        </div>
      </div>

      {/* EXPLAINABLE AI SECTION */}
      <div className="fintech-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <Cpu className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Explainable AI — Factors Affecting Assessment</h2>
            <p className="text-xs text-slate-400">SHAP-derived positive and negative contribution factors from actual inputs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Positive Factors */}
          <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
            <h3 className="text-sm font-bold text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Positive Contributing Factors</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {ml_result.positive_factors.map((factor, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Negative Factors */}
          <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-3">
            <h3 className="text-sm font-bold text-amber-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Risk Factors & Constraints</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {ml_result.negative_factors.length > 0 ? (
                ml_result.negative_factors.map((factor, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{factor}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 italic">No major high-risk constraints detected.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* BANK MATCHING PRODUCTS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Loan Products Matching Your Profile</h2>
            <p className="text-xs text-slate-400">Evaluated against published bank eligibility criteria</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-300">
            {matched_products.length} Loan Products Evaluated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matched_products.map((prod) => (
            <div key={prod.product_id} className="fintech-card p-6 space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {prod.bank_logo ? (
                      <img src={prod.bank_logo} alt={prod.bank_name} className="w-10 h-10 rounded-lg object-cover border border-slate-700" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-blue-950 flex items-center justify-center text-blue-400 font-bold text-xs">
                        {prod.bank_name.substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">{prod.bank_name}</span>
                      <h3 className="text-base font-bold text-white">{prod.product_name}</h3>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold border ${prod.match_status === 'MATCHED' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : prod.match_status === 'PARTIALLY_MATCHED' ? 'bg-amber-950 text-amber-300 border-amber-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                    {prod.matched_criteria_count}/{prod.total_criteria_count} Criteria Matched
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Indicative Interest Rate</span>
                    <span className="font-semibold text-blue-300">{prod.interest_rate_range}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Estimated Product EMI</span>
                    <span className="font-semibold text-emerald-300">{formatCurrency(prod.estimated_emi)}</span>
                  </div>
                </div>

                {prod.failure_reasons.length > 0 && (
                  <div className="p-2.5 rounded bg-red-950/30 border border-red-900/30 text-[11px] text-red-300 space-y-1">
                    <span className="font-semibold block">Unmatched Criteria:</span>
                    {prod.failure_reasons.map((reason, rIdx) => (
                      <p key={rIdx}>• {reason}</p>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => setSelectedProduct(prod)}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                >
                  View Details
                </button>
                <a
                  href={prod.official_product_url || 'https://example.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 fintech-glow-button py-2 px-3 rounded-lg text-xs font-semibold text-white shadow-glow flex items-center justify-center space-x-1.5"
                >
                  <span>Apply on Lender Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DETAIL MODAL POPUP */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="fintech-card max-w-xl w-full p-6 space-y-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs text-blue-400 uppercase font-semibold">{selectedProduct.bank_name}</span>
              <h3 className="text-xl font-bold text-white">{selectedProduct.product_name}</h3>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Criteria Breakdown</h4>
              <div className="space-y-2 text-xs">
                {selectedProduct.failure_reasons.length === 0 ? (
                  <p className="text-emerald-400 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Matches all published eligibility criteria!
                  </p>
                ) : (
                  selectedProduct.failure_reasons.map((f, idx) => (
                    <p key={idx} className="text-amber-300 flex items-start">
                      <AlertTriangle className="w-4 h-4 mr-1.5 shrink-0 mt-0.5 text-amber-400" /> {f}
                    </p>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-slate-300"
              >
                Close
              </button>
              <a
                href={selectedProduct.official_product_url || 'https://example.com'}
                target="_blank"
                rel="noreferrer"
                className="fintech-glow-button px-5 py-2 rounded-lg text-xs font-semibold text-white flex items-center space-x-1"
              >
                <span>Apply on Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
