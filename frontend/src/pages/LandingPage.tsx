import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Building2, LineChart, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-950/80 border border-blue-500/30 text-xs font-semibold text-blue-300 shadow-glow">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Powered by Gradient Boosting ML & Configurable Rule Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Check Your <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Loan Eligibility</span> & Find Matching Loan Products
          </h1>

          <p className="max-w-3xl mx-auto text-lg text-slate-300 leading-relaxed">
            Understand your financial profile, assess your eligibility with explainable AI, and discover loan products whose published criteria match your profile.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/loan-eligibility"
              className="w-full sm:w-auto fintech-glow-button px-8 py-4 rounded-xl text-base font-semibold text-white shadow-glow flex items-center justify-center space-x-2 group"
            >
              <span>Check Eligibility Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-slate-200 bg-slate-900/80 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 transition-all flex items-center justify-center"
            >
              How It Works
            </a>
          </div>

          <div className="pt-4 flex items-center justify-center space-x-6 text-xs text-slate-400">
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" /> No hard credit check</span>
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" /> Consent-driven architecture</span>
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" /> SHAP explainability</span>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Intelligent Fintech Capabilities</h2>
          <p className="text-slate-400 text-sm mt-2">Built with modern compliance, ML explainability, and lender criteria matching.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="fintech-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Secure Verification</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Mobile OTP authentication, sandbox PAN verification architecture, and explicit financial data consent logging.
            </p>
          </div>

          <div className="fintech-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">AI Risk Assessment</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Gradient Boosting ML model predicts risk levels and delivers SHAP feature-level explanations for complete transparency.
            </p>
          </div>

          <div className="fintech-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Loan Product Matching</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Configurable Bank Rule Engine evaluates your financial ratios against published eligibility criteria of top lenders.
            </p>
          </div>

          <div className="fintech-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Application Tracking</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time audit log timeline tracking your application status from draft through eligibility check and completion.
            </p>
          </div>
        </div>
      </section>

      {/* 5-STEP PROCESS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="fintech-card p-8 sm:p-12 relative overflow-hidden">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Step-by-Step Guidance</span>
            <h2 className="text-3xl font-bold text-white mt-1">How LoanCompare AI Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
            {[
              { num: "01", title: "Verify Mobile", desc: "Authenticate with 6-digit OTP in sandbox development mode." },
              { num: "02", title: "Complete Profile", desc: "Enter financial information and active loan obligations." },
              { num: "03", title: "Provide Consent", desc: "Grant consent for financial data retrieval & analysis." },
              { num: "04", title: "AI Analysis", desc: "ML model evaluates debt ratios, income, and risk factors." },
              { num: "05", title: "Compare Matching", desc: "Review bank products matching published eligibility criteria." }
            ].map((step, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3 relative group hover:border-blue-500/50 transition-colors">
                <span className="text-2xl font-black text-blue-500/40 group-hover:text-blue-400 transition-colors">{step.num}</span>
                <h4 className="text-base font-semibold text-white">{step.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DISCLAIMER BOX */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-center space-y-2">
          <h4 className="text-sm font-semibold text-amber-300 uppercase tracking-wider">Academic & Indicative Disclaimer</h4>
          <p className="text-xs text-amber-200/80 max-w-3xl mx-auto leading-relaxed">
            "Eligibility results are indicative model assessments and do not constitute loan approval or a guarantee of credit. LoanCompare AI does not access private financial credit bureaus or government databases in demo mode. All bank product data is derived from published demo criteria."
          </p>
        </div>
      </section>
    </div>
  );
};
