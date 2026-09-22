export interface User {
  id: number;
  full_name: string;
  email: string;
  mobile_number: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface ExistingLoanItem {
  id?: number;
  loan_type: string;
  original_amount: number;
  outstanding_amount: number;
  monthly_emi: number;
  remaining_tenure_months: number;
}

export interface FinancialProfileInput {
  age: number;
  employment_type: string;
  employment_tenure_months: number;
  monthly_income: number;
  has_coapplicant: boolean;
  coapplicant_monthly_income: number;
  dependents: number;
  existing_loans: ExistingLoanItem[];
  credit_card_outstanding: number;
  credit_history: string;
  credit_score_optional?: number;
}

export interface LoanRequestInput {
  loan_type: string;
  requested_amount: number;
  tenure_months: number;
  purpose?: string;
}

export interface MLExplanationItem {
  feature_name: string;
  feature_value: string;
  shap_value: number;
  impact_type: 'POSITIVE' | 'NEGATIVE';
  explanation_text: string;
}

export interface MLPredictionResult {
  risk_category: 'LOW' | 'MEDIUM' | 'HIGH';
  probability_score: number;
  confidence: number;
  model_assessment_label: string;
  positive_factors: string[];
  negative_factors: string[];
  explanations: MLExplanationItem[];
}

export interface MatchedProductItem {
  product_id: number;
  bank_id: number;
  bank_name: string;
  bank_logo?: string;
  product_name: string;
  loan_type: string;
  match_status: 'MATCHED' | 'PARTIALLY_MATCHED' | 'NOT_MATCHED';
  matched_criteria_count: number;
  total_criteria_count: number;
  criteria_match_percentage: number;
  failure_reasons: string[];
  official_product_url?: string;
  estimated_emi: number;
  interest_rate_range: string;
}

export interface AssessmentResponse {
  application_id: string;
  timestamp: string;
  derived_financials: {
    monthly_income: number;
    coapplicant_income: number;
    total_monthly_income: number;
    existing_emi: number;
    existing_outstanding: number;
    credit_card_outstanding: number;
    estimated_new_emi: number;
    total_combined_emi: number;
    dti_ratio: number;
    total_dti_ratio: number;
    new_emi_income_ratio: number;
    lti_ratio: number;
    simulated_credit_score: number;
  };
  loan_request_summary: {
    loan_type: string;
    requested_amount: number;
    tenure_months: number;
    purpose?: string;
    estimated_emi: number;
    total_repayment: number;
    approx_interest: number;
  };
  ml_result: MLPredictionResult;
  matched_products: MatchedProductItem[];
  disclaimer: string;
}

export interface ApplicationItem {
  id: string;
  user_id: number;
  user_name: string;
  user_mobile: string;
  loan_type: string;
  requested_amount: number;
  risk_category?: string;
  ml_score?: number;
  status: string;
  created_at: string;
  matched_products_count: number;
}
