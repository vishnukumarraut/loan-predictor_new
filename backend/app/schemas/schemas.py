from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# --- Auth & OTP ---
class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    mobile_number: str = Field(..., min_length=10, max_length=15)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    login_id: str # Mobile or Email
    password: str

class SendOTPRequest(BaseModel):
    mobile_number: str

class SendOTPResponse(BaseModel):
    success: bool
    message: str
    mobile_number: str
    otp_demo_display: Optional[str] = None # Returned only in mock mode for easy dev testing
    expires_in_seconds: int = 120

class VerifyOTPRequest(BaseModel):
    mobile_number: str
    otp_code: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    full_name: str
    email: str
    mobile_number: str
    role: str

# --- Verification & Consent ---
class PANVerifyRequest(BaseModel):
    pan_number: str

class PANVerifyResponse(BaseModel):
    success: bool
    pan_number: str
    verification_status: str
    verified_name: Optional[str] = None
    is_mock: bool = True
    message: str

class ConsentRequest(BaseModel):
    consent_given: bool = True
    purpose: str = "Loan eligibility assessment and bank product matching"
    consent_version: str = "v1.0"

class ConsentResponse(BaseModel):
    id: int
    user_id: int
    consent_given: bool
    purpose: str
    consent_version: str
    timestamp: datetime

# --- Financial Profile & Loan Entry ---
class ExistingLoanItem(BaseModel):
    loan_type: str # Personal, Home, Vehicle, Education, Business, Other
    original_amount: float = Field(..., gt=0)
    outstanding_amount: float = Field(..., ge=0)
    monthly_emi: float = Field(..., ge=0)
    remaining_tenure_months: int = Field(..., gt=0)

class FinancialProfileCreate(BaseModel):
    age: int = Field(..., ge=18, le=80)
    employment_type: str # Salaried, Self Employed, Business, Other
    employment_tenure_months: int = Field(..., ge=0)
    monthly_income: float = Field(..., gt=0)
    has_coapplicant: bool = False
    coapplicant_monthly_income: float = 0.0
    dependents: int = Field(0, ge=0)
    existing_loans: List[ExistingLoanItem] = []
    credit_card_outstanding: float = 0.0
    credit_history: str # Excellent, Good, Average, Poor, No Credit History
    credit_score_optional: Optional[int] = None

class LoanRequestCreate(BaseModel):
    loan_type: str # Personal Loan, Home Loan, Vehicle Loan, Education Loan, Business Loan
    requested_amount: float = Field(..., gt=0)
    tenure_months: int = Field(..., gt=0)
    purpose: Optional[str] = None

# --- Complete Eligibility Assessment Request ---
class EligibilityAnalysisRequest(BaseModel):
    profile: FinancialProfileCreate
    loan_request: LoanRequestCreate

# --- ML & Explainability Response ---
class MLExplanationItem(BaseModel):
    feature_name: str
    feature_value: str
    shap_value: float
    impact_type: str # POSITIVE, NEGATIVE
    explanation_text: str

class MLPredictionResult(BaseModel):
    risk_category: str # LOW, MEDIUM, HIGH
    probability_score: float # 0 - 100%
    confidence: float
    model_assessment_label: str # e.g. "Low Risk - Strong Financial Profile"
    positive_factors: List[str]
    negative_factors: List[str]
    explanations: List[MLExplanationItem]

# --- Bank & Loan Product Rule Match Response ---
class MatchedProductItem(BaseModel):
    product_id: int
    bank_id: int
    bank_name: str
    bank_logo: Optional[str] = None
    product_name: str
    loan_type: str
    match_status: str # MATCHED, PARTIALLY_MATCHED, NOT_MATCHED
    matched_criteria_count: int
    total_criteria_count: int
    criteria_match_percentage: float
    failure_reasons: List[str]
    official_product_url: Optional[str] = None
    estimated_emi: float
    interest_rate_range: str

class EligibilityAssessmentResponse(BaseModel):
    application_id: str
    timestamp: datetime
    derived_financials: Dict[str, Any]
    loan_request_summary: Dict[str, Any]
    ml_result: MLPredictionResult
    matched_products: List[MatchedProductItem]
    disclaimer: str = "Eligibility results are indicative and do not constitute loan approval or a guarantee of credit."

# --- Application Tracking ---
class ApplicationSummary(BaseModel):
    id: str
    user_id: int
    user_name: str
    user_mobile: str
    loan_type: str
    requested_amount: float
    risk_category: Optional[str]
    status: str
    created_at: datetime
    matched_products_count: int

# --- Admin Management Schemas ---
class BankCreateUpdate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    official_website: Optional[str] = None
    status: str = "ACTIVE"
    is_demo: bool = True

class LoanProductCreateUpdate(BaseModel):
    bank_id: int
    product_name: str
    loan_type: str
    min_age: int = 21
    max_age: int = 60
    min_income: float
    min_credit_score: int = 650
    max_dti: float = 50.0
    min_employment_tenure_months: int = 12
    min_loan_amount: float
    max_loan_amount: float
    min_tenure_months: int = 12
    max_tenure_months: int = 84
    official_product_url: Optional[str] = None
    is_demo: bool = True

class LoanCriteriaCreateUpdate(BaseModel):
    product_id: int
    rule_name: str
    criteria_key: str # income, credit_score, dti, age, employment_tenure, loan_amount, loan_tenure
    operator: str # >=, <=, ==, IN
    value: str
