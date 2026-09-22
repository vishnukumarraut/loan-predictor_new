from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    mobile_number = Column(String(15), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="USER") # USER, ADMIN
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    pan_verification = relationship("PANVerification", back_populates="user", uselist=False)
    consents = relationship("Consent", back_populates="user")
    applications = relationship("Application", back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    age = Column(Integer, nullable=False)
    employment_type = Column(String(50), nullable=False)
    employment_tenure_months = Column(Integer, nullable=False)
    monthly_income = Column(Float, nullable=False)
    has_coapplicant = Column(Boolean, default=False)
    coapplicant_monthly_income = Column(Float, default=0.0)
    dependents = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class OTPSession(Base):
    __tablename__ = "otp_sessions"

    id = Column(Integer, primary_key=True, index=True)
    mobile_number = Column(String(15), index=True, nullable=False)
    otp_code = Column(String(10), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_verified = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class PANVerification(Base):
    __tablename__ = "pan_verifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    pan_number = Column(String(10), nullable=False)
    verification_status = Column(String(30), default="Not Verified")
    verified_name = Column(String(100), nullable=True)
    is_mock = Column(Boolean, default=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="pan_verification")


class Consent(Base):
    __tablename__ = "consents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    consent_given = Column(Boolean, default=True, nullable=False)
    purpose = Column(String(255), nullable=False)
    consent_version = Column(String(20), default="v1.0")
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="consents")


class Application(Base):
    __tablename__ = "applications"

    id = Column(String(30), primary_key=True, index=True) # LCA-2026-000001
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(30), default="DRAFT", index=True) # DRAFT, SUBMITTED, VERIFICATION_PENDING, ELIGIBILITY_CHECKED, MANUAL_REVIEW, COMPLETED
    risk_category = Column(String(20), nullable=True)
    ml_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="applications")
    financial_profile = relationship("FinancialProfile", back_populates="application", uselist=False)
    existing_loans = relationship("ExistingLoan", back_populates="application")
    loan_request = relationship("LoanRequest", back_populates="application", uselist=False)
    ml_predictions = relationship("MLPrediction", back_populates="application")
    eligibility_results = relationship("EligibilityResult", back_populates="application")
    events = relationship("ApplicationEvent", back_populates="application")


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String(30), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    total_monthly_income = Column(Float, nullable=False)
    existing_emi_total = Column(Float, default=0.0)
    credit_card_outstanding = Column(Float, default=0.0)
    credit_history = Column(String(30), nullable=False)
    credit_score_simulated = Column(Integer, nullable=True)
    dti_ratio = Column(Float, nullable=False)
    lti_ratio = Column(Float, nullable=False)
    emi_to_income_ratio = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="financial_profile")


class ExistingLoan(Base):
    __tablename__ = "existing_loans"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String(30), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    loan_type = Column(String(50), nullable=False)
    original_amount = Column(Float, nullable=False)
    outstanding_amount = Column(Float, nullable=False)
    monthly_emi = Column(Float, nullable=False)
    remaining_tenure_months = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="existing_loans")


class LoanRequest(Base):
    __tablename__ = "loan_requests"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String(30), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    loan_type = Column(String(50), nullable=False)
    requested_amount = Column(Float, nullable=False)
    tenure_months = Column(Integer, nullable=False)
    purpose = Column(String(255), nullable=True)
    estimated_emi = Column(Float, nullable=False)
    total_repayment = Column(Float, nullable=False)
    approx_interest = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="loan_request")


class MLPrediction(Base):
    __tablename__ = "ml_predictions"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String(30), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    risk_category = Column(String(20), nullable=False)
    probability_score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    model_version = Column(String(20), default="v1.0.0")
    prediction_timestamp = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="ml_predictions")
    explanations = relationship("MLExplanation", back_populates="prediction")


class MLExplanation(Base):
    __tablename__ = "ml_explanations"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("ml_predictions.id", ondelete="CASCADE"), nullable=False)
    feature_name = Column(String(100), nullable=False)
    feature_value = Column(String(100), nullable=True)
    shap_value = Column(Float, nullable=False)
    impact_type = Column(String(20), nullable=False) # POSITIVE, NEGATIVE
    explanation_text = Column(Text, nullable=False)

    prediction = relationship("MLPrediction", back_populates="explanations")


class Bank(Base):
    __tablename__ = "banks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    logo_url = Column(Text, nullable=True)
    official_website = Column(String(255), nullable=True)
    status = Column(String(20), default="ACTIVE")
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    products = relationship("LoanProduct", back_populates="bank")


class LoanProduct(Base):
    __tablename__ = "loan_products"

    id = Column(Integer, primary_key=True, index=True)
    bank_id = Column(Integer, ForeignKey("banks.id", ondelete="CASCADE"), nullable=False)
    product_name = Column(String(150), nullable=False)
    loan_type = Column(String(50), nullable=False)
    min_age = Column(Integer, default=21)
    max_age = Column(Integer, default=60)
    min_income = Column(Float, nullable=False)
    min_credit_score = Column(Integer, default=650)
    max_dti = Column(Float, default=50.0)
    min_employment_tenure_months = Column(Integer, default=12)
    min_loan_amount = Column(Float, nullable=False)
    max_loan_amount = Column(Float, nullable=False)
    min_tenure_months = Column(Integer, default=12)
    max_tenure_months = Column(Integer, default=84)
    official_product_url = Column(String(255), nullable=True)
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bank = relationship("Bank", back_populates="products")
    criteria = relationship("LoanCriteria", back_populates="product")
    results = relationship("EligibilityResult", back_populates="product")


class LoanCriteria(Base):
    __tablename__ = "loan_criteria"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("loan_products.id", ondelete="CASCADE"), nullable=False)
    rule_name = Column(String(100), nullable=False)
    criteria_key = Column(String(50), nullable=False)
    operator = Column(String(10), nullable=False)
    value = Column(String(255), nullable=False)
    version = Column(Integer, default=1)
    effective_from = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("LoanProduct", back_populates="criteria")


class EligibilityResult(Base):
    __tablename__ = "eligibility_results"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String(30), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("loan_products.id", ondelete="CASCADE"), nullable=False)
    match_status = Column(String(30), nullable=False) # MATCHED, PARTIALLY_MATCHED, NOT_MATCHED, INSUFFICIENT_DATA
    matched_criteria_count = Column(Integer, nullable=False)
    total_criteria_count = Column(Integer, nullable=False)
    failure_reasons_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="eligibility_results")
    product = relationship("LoanProduct", back_populates="results")


class ApplicationEvent(Base):
    __tablename__ = "application_events"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String(30), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    actor_type = Column(String(20), default="USER")
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="events")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, nullable=True)
    actor_role = Column(String(20), default="ADMIN")
    action = Column(String(100), nullable=False)
    target_resource = Column(String(100), nullable=True)
    details_json = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
