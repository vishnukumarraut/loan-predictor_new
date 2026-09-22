import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, CreditCard, DollarSign, Calculator, ArrowRight, ArrowLeft, Plus, Trash2, AlertCircle, Sparkles, Lock, Info } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { calculateEMI } from '../utils/emiCalculator';

export const LoanEligibilityPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Identity & Consent State
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  const [panStatus, setPanStatus] = useState('Not Verified');
  const [panVerifiedName, setPanVerifiedName] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);

  // Step 2: Personal Profile State
  const [age, setAge] = useState(30);
  const [employmentType, setEmploymentType] = useState('Salaried');
  const [employmentTenure, setEmploymentTenure] = useState(24);
  const [monthlyIncome, setMonthlyIncome] = useState(80000);
  const [hasCoapplicant, setHasCoapplicant] = useState(false);
  const [coapplicantIncome, setCoapplicantIncome] = useState(0);
  const [dependents, setDependents] = useState(1);

  // Step 3: Existing Financial Obligations State
  const [hasExistingLoans, setHasExistingLoans] = useState(true);
  const [existingLoans, setExistingLoans] = useState([
    { loan_type: 'Personal Loan', original_amount: 500000, outstanding_amount: 307000, monthly_emi: 14000, remaining_tenure_months: 24 }
  ]);
  const [creditCardOutstanding, setCreditCardOutstanding] = useState(15000);
  const [creditHistory, setCreditHistory] = useState('Good');
  const [creditScoreOptional, setCreditScoreOptional] = useState<number | ''>(720);

  // Step 4: Loan Requirement State
  const [loanType, setLoanType] = useState('Personal Loan');
  const [requestedAmount, setRequestedAmount] = useState(300000);
  const [tenureMonths, setTenureMonths] = useState(36);
  const [purpose, setPurpose] = useState('Home Renovation & Emergency Expense');

  // Computed Values
  const totalIncome = monthlyIncome + (hasCoapplicant ? coapplicantIncome : 0);
  const totalExistingEMI = hasExistingLoans ? existingLoans.reduce((sum, item) => sum + (Number(item.monthly_emi) || 0), 0) : 0;
  const totalExistingOutstanding = hasExistingLoans ? existingLoans.reduce((sum, item) => sum + (Number(item.outstanding_amount) || 0), 0) : 0;

  const emiCalc = calculateEMI(requestedAmount, tenureMonths, 10.5);
  const totalCombinedEMI = totalExistingEMI + emiCalc.monthlyEMI;
  const dtiRatio = totalIncome > 0 ? (totalExistingEMI / totalIncome) * 100 : 0;
  const newEmiIncomeRatio = totalIncome > 0 ? (emiCalc.monthlyEMI / totalIncome) * 100 : 0;
  const totalDtiRatio = totalIncome > 0 ? (totalCombinedEMI / totalIncome) * 100 : 0;
  const ltiRatio = totalIncome > 0 ? requestedAmount / (totalIncome * 12) : 0;

  // PAN Mock Verification
  const handleVerifyPAN = async () => {
    setError('');
    try {
      const res = await api.post('/verification/pan', { pan_number: panNumber });
      setPanStatus(res.data.verification_status);
      setPanVerifiedName(res.data.verified_name || 'Demo User');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'PAN Verification failed.');
      setPanStatus('Failed');
    }
  };

  // Add / Remove Existing Loans
  const addLoanRow = () => {
    setExistingLoans([...existingLoans, { loan_type: 'Personal Loan', original_amount: 100000, outstanding_amount: 50000, monthly_emi: 3000, remaining_tenure_months: 18 }]);
  };

  const removeLoanRow = (idx: number) => {
    setExistingLoans(existingLoans.filter((_, i) => i !== idx));
  };

  const updateLoanRow = (idx: number, field: string, val: any) => {
    const updated = [...existingLoans];
    updated[idx] = { ...updated[idx], [field]: val };
    setExistingLoans(updated);
  };

  // Step Navigation Validation
  const nextStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!consentGiven) {
        setError('Required financial data consent must be granted before proceeding.');
        return;
      }
      if (panStatus !== 'Verified') {
        // Auto verify in demo mode if user didn't click verify
        handleVerifyPAN();
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Submission
  const handleSubmitAssessment = async () => {
    setLoading(true);
    setError('');

    try {
      // First ensure consent is recorded
      await api.post('/consents', {
        consent_given: true,
        purpose: 'Loan eligibility assessment and bank product matching',
        consent_version: 'v1.0'
      });

      const payload = {
        profile: {
          age: Number(age),
          employment_type: employmentType,
          employment_tenure_months: Number(employmentTenure),
          monthly_income: Number(monthlyIncome),
          has_coapplicant: hasCoapplicant,
          coapplicant_monthly_income: hasCoapplicant ? Number(coapplicantIncome) : 0,
          dependents: Number(dependents),
          existing_loans: hasExistingLoans ? existingLoans.map(l => ({
            loan_type: l.loan_type,
            original_amount: Number(l.original_amount),
            outstanding_amount: Number(l.outstanding_amount),
            monthly_emi: Number(l.monthly_emi),
            remaining_tenure_months: Number(l.remaining_tenure_months)
          })) : [],
          credit_card_outstanding: Number(creditCardOutstanding),
          credit_history: creditHistory,
          credit_score_optional: creditScoreOptional ? Number(creditScoreOptional) : undefined
        },
        loan_request: {
          loan_type: loanType,
          requested_amount: Number(requestedAmount),
          tenure_months: Number(tenureMonths),
          purpose: purpose
        }
      };

      const res = await api.post('/eligibility/analyze', payload);
      // Navigate to results page with response state
      navigate('/results', { state: { result: res.data } });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Eligibility assessment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* HEADER & STEP PROGRESS BAR */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Loan Eligibility Assessment</h1>
        <p className="text-xs text-slate-400">Complete 5 quick steps to analyze your risk profile & find matching loan products</p>
      </div>

      {/* Progress Bar */}
      <div className="fintech-card p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
          <span>Step {currentStep} of 5</span>
          <span className="text-blue-400 font-mono">{currentStep * 20}% Completed</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${currentStep * 20}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-5 text-[11px] text-center text-slate-400 mt-3 font-medium">
          <span className={currentStep >= 1 ? 'text-blue-400 font-semibold' : ''}>1. Identity</span>
          <span className={currentStep >= 2 ? 'text-blue-400 font-semibold' : ''}>2. Profile</span>
          <span className={currentStep >= 3 ? 'text-blue-400 font-semibold' : ''}>3. Obligations</span>
          <span className={currentStep >= 4 ? 'text-blue-400 font-semibold' : ''}>4. Loan Request</span>
          <span className={currentStep >= 5 ? 'text-blue-400 font-semibold' : ''}>5. Analysis</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: IDENTITY & CONSENT */}
      {currentStep === 1 && (
        <div className="fintech-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <UserCheck className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Step 1 — Identity & Financial Data Consent</h2>
              <p className="text-xs text-slate-400">Sandbox verification & compliance consent architecture</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">PAN Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={10}
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="flex-1 glass-input px-4 py-2.5 rounded-lg text-sm font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={handleVerifyPAN}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
                >
                  Verify PAN
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">PAN Verification Status:</span>
                <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${panStatus === 'Verified' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300'}`}>
                  {panStatus} {panVerifiedName ? `(${panVerifiedName})` : ''}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-blue-300 block">MockPANVerificationService Notice:</span>
              <p>PAN verification is executed via dev sandbox mock service. Does NOT access real government NSDL database.</p>
            </div>

            {/* Consent Checkbox Section */}
            <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>Financial Data Retrieval Consent</span>
              </h4>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  "I authorize the application to retrieve and use financial information from authorized data providers for the purpose of assessing my loan eligibility."
                </span>
              </label>
              <div className="text-[10px] text-slate-400 border-t border-blue-900/40 pt-2 flex justify-between">
                <span>Version: v1.0</span>
                <span>Purpose: Loan Eligibility Assessment & Product Matching</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PERSONAL PROFILE */}
      {currentStep === 2 && (
        <div className="fintech-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <DollarSign className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Step 2 — Personal & Income Profile</h2>
              <p className="text-xs text-slate-400">Financial profile attributes for risk assessment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Age (Years)</label>
              <input
                type="number"
                min={18}
                max={80}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full glass-input px-4 py-2.5 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full glass-input px-4 py-2.5 rounded-lg text-sm bg-slate-900"
              >
                <option value="Salaried">Salaried</option>
                <option value="Self Employed">Self Employed</option>
                <option value="Business">Business Owner</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Employment / Business Tenure (Months)</label>
              <input
                type="number"
                min={0}
                value={employmentTenure}
                onChange={(e) => setEmploymentTenure(Number(e.target.value))}
                className="w-full glass-input px-4 py-2.5 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Gross Income (₹)</label>
              <input
                type="number"
                min={1000}
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full glass-input px-4 py-2.5 rounded-lg text-sm"
              />
            </div>

            <div className="sm:col-span-2 p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300">Add Co-applicant Income?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHasCoapplicant(false)}
                  className={`px-3 py-1 rounded text-xs font-semibold ${!hasCoapplicant ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setHasCoapplicant(true)}
                  className={`px-3 py-1 rounded text-xs font-semibold ${hasCoapplicant ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Yes
                </button>
              </div>
            </div>

            {hasCoapplicant && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Co-applicant Monthly Income (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={coapplicantIncome}
                  onChange={(e) => setCoapplicantIncome(Number(e.target.value))}
                  className="w-full glass-input px-4 py-2.5 rounded-lg text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Number of Dependents</label>
              <input
                type="number"
                min={0}
                value={dependents}
                onChange={(e) => setDependents(Number(e.target.value))}
                className="w-full glass-input px-4 py-2.5 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center space-x-2">
            <Info className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Academic Integrity: Protected features (gender, caste, religion, marital status) are excluded from ML decisioning.</span>
          </div>
        </div>
      )}

      {/* STEP 3: EXISTING FINANCIAL OBLIGATIONS */}
      {currentStep === 3 && (
        <div className="fintech-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <CreditCard className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Step 3 — Existing Financial Obligations</h2>
              <p className="text-xs text-slate-400">Active loans, total outstanding, and credit history</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-200 font-semibold">Do you currently have any active loans?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHasExistingLoans(false)}
                  className={`px-3 py-1 rounded text-xs font-semibold ${!hasExistingLoans ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setHasExistingLoans(true)}
                  className={`px-3 py-1 rounded text-xs font-semibold ${hasExistingLoans ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Yes
                </button>
              </div>
            </div>

            {hasExistingLoans && (
              <div className="space-y-4">
                {existingLoans.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400">Active Loan #{idx + 1}</span>
                      {existingLoans.length > 1 && (
                        <button type="button" onClick={() => removeLoanRow(idx)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Loan Type</label>
                        <select
                          value={item.loan_type}
                          onChange={(e) => updateLoanRow(idx, 'loan_type', e.target.value)}
                          className="w-full glass-input px-3 py-1.5 rounded text-xs bg-slate-950"
                        >
                          <option value="Personal Loan">Personal Loan</option>
                          <option value="Home Loan">Home Loan</option>
                          <option value="Vehicle Loan">Vehicle Loan</option>
                          <option value="Education Loan">Education Loan</option>
                          <option value="Business Loan">Business Loan</option>
                          <option value="Other">Other Loan</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Outstanding Amount (₹)</label>
                        <input
                          type="number"
                          value={item.outstanding_amount}
                          onChange={(e) => updateLoanRow(idx, 'outstanding_amount', Number(e.target.value))}
                          className="w-full glass-input px-3 py-1.5 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Monthly EMI (₹)</label>
                        <input
                          type="number"
                          value={item.monthly_emi}
                          onChange={(e) => updateLoanRow(idx, 'monthly_emi', Number(e.target.value))}
                          className="w-full glass-input px-3 py-1.5 rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addLoanRow}
                  className="w-full py-2.5 rounded-lg border border-dashed border-blue-500/40 text-blue-400 hover:bg-blue-950/30 text-xs font-semibold flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Another Loan</span>
                </button>
              </div>
            )}

            {/* Auto Calculations Banner */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-blue-950/30 border border-blue-900/40 text-center">
              <div>
                <span className="text-[11px] text-slate-400 block">Total Existing Outstanding</span>
                <span className="text-lg font-bold text-white">{formatCurrency(totalExistingOutstanding)}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Total Existing Monthly EMI</span>
                <span className="text-lg font-bold text-purple-300">{formatCurrency(totalExistingEMI)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Credit Card Outstanding (₹)</label>
                <input
                  type="number"
                  value={creditCardOutstanding}
                  onChange={(e) => setCreditCardOutstanding(Number(e.target.value))}
                  className="w-full glass-input px-4 py-2.5 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Credit History</label>
                <select
                  value={creditHistory}
                  onChange={(e) => setCreditHistory(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-lg text-sm bg-slate-900"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                  <option value="No Credit History">No Credit History</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Credit Score (Optional)</label>
                <input
                  type="number"
                  min={300}
                  max={900}
                  value={creditScoreOptional}
                  onChange={(e) => setCreditScoreOptional(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 750"
                  className="w-full glass-input px-4 py-2.5 rounded-lg text-sm font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/30 text-[11px] text-blue-300 flex items-center justify-between">
              <span>Demo Mode — Credit score is simulated if not authorized by bureau.</span>
              <span className="font-semibold text-purple-300">Simulated Score: ~720</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: LOAN REQUIREMENT */}
      {currentStep === 4 && (
        <div className="fintech-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <Calculator className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Step 4 — Requested Loan Details</h2>
              <p className="text-xs text-slate-400">Target loan product requirements & dynamic EMI estimation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Loan Category</label>
              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
                className="w-full glass-input px-4 py-2.5 rounded-lg text-sm bg-slate-900"
              >
                <option value="Personal Loan">Personal Loan</option>
                <option value="Home Loan">Home Loan</option>
                <option value="Vehicle Loan">Vehicle Loan</option>
                <option value="Education Loan">Education Loan</option>
                <option value="Business Loan">Business Loan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Requested Loan Amount (₹)</label>
              <input
                type="number"
                step={10000}
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(Number(e.target.value))}
                className="w-full glass-input px-4 py-2.5 rounded-lg text-sm font-bold text-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Loan Tenure (Months)</label>
              <select
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                className="w-full glass-input px-4 py-2.5 rounded-lg text-sm bg-slate-900 font-mono"
              >
                <option value={12}>12 Months (1 Year)</option>
                <option value={24}>24 Months (2 Years)</option>
                <option value={36}>36 Months (3 Years)</option>
                <option value={48}>48 Months (4 Years)</option>
                <option value={60}>60 Months (5 Years)</option>
                <option value={120}>120 Months (10 Years - Home/Edu)</option>
                <option value={240}>240 Months (20 Years - Home)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Purpose of Loan</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Renovation, Education, Debt Consolidation"
                className="w-full glass-input px-4 py-2.5 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Dynamic EMI Formula Calculation Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-blue-950 border border-blue-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-300">Estimated EMI Calculation (Formula: P × r × (1+r)ⁿ / ((1+r)ⁿ - 1))</span>
              <span className="text-[10px] text-slate-400">Rate: ~10.5% p.a. (Indicative)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-xs text-slate-400 block">Estimated New Monthly EMI</span>
                <span className="text-2xl font-black text-emerald-400">{formatCurrency(emiCalc.monthlyEMI)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Total Repayment Amount</span>
                <span className="text-lg font-bold text-white">{formatCurrency(emiCalc.totalRepayment)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Approximate Interest</span>
                <span className="text-lg font-bold text-purple-300">{formatCurrency(emiCalc.totalInterest)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: FINANCIAL ANALYSIS SUMMARY */}
      {currentStep === 5 && (
        <div className="fintech-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Step 5 — Financial Ratios & Feature Summary</h2>
              <p className="text-xs text-slate-400">Review derived features before ML model assessment</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Total Monthly Income</span>
              <span className="text-base font-bold text-white">{formatCurrency(totalIncome)}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Existing Loan EMI</span>
              <span className="text-base font-bold text-amber-300">{formatCurrency(totalExistingEMI)}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Proposed New EMI</span>
              <span className="text-base font-bold text-emerald-400">{formatCurrency(emiCalc.monthlyEMI)}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Total EMI / Income Ratio</span>
              <span className={`text-base font-bold ${totalDtiRatio > 50 ? 'text-red-400' : 'text-cyan-400'}`}>{formatPercent(totalDtiRatio)}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Derived Ratios Visual Gauge</h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Existing Debt-to-Income (DTI) Ratio</span>
                <span className="font-mono text-slate-200">{formatPercent(dtiRatio)}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${Math.min(dtiRatio, 100)}%` }}></div>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Proposed New EMI / Income Share</span>
                <span className="font-mono text-emerald-400 font-bold">{formatPercent(newEmiIncomeRatio)}</span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Loan-to-Annual-Income Multiplier (LTI)</span>
                <span className="font-mono text-purple-300 font-bold">{ltiRatio.toFixed(2)}x Annual Income</span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Total Combined DTI (Including New EMI)</span>
                <span className="font-mono text-cyan-300 font-bold">{formatPercent(totalDtiRatio)}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className={`h-2 rounded-full ${totalDtiRatio > 50 ? 'bg-red-500' : 'bg-cyan-400'}`} style={{ width: `${Math.min(totalDtiRatio, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-between pt-4">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-800 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
        ) : <div></div>}

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={nextStep}
            className="fintech-glow-button px-8 py-3 rounded-xl text-sm font-semibold text-white shadow-glow flex items-center space-x-2"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitAssessment}
            disabled={loading}
            className="fintech-glow-button px-8 py-3.5 rounded-xl text-base font-bold text-white shadow-glow flex items-center space-x-2"
          >
            {loading ? <span>Analyzing Profile with ML Model...</span> : (
              <>
                <Sparkles className="w-5 h-5 text-purple-300" />
                <span>Analyze Profile & Match Products</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
