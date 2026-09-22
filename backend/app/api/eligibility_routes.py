import json
import random
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.auth.security import get_current_user
from backend.app.models.domain import User, Application, UserProfile, FinancialProfile, ExistingLoan, LoanRequest, MLPrediction, MLExplanation, LoanProduct, EligibilityResult, ApplicationEvent
from backend.app.schemas.schemas import EligibilityAnalysisRequest, EligibilityAssessmentResponse
from backend.app.services.consent_service import ConsentService
from backend.app.services.credit_service import MockCreditDataService
from backend.app.ml.predictor import LoanRiskPredictor
from backend.app.ml.explainability import ExplainableAIService
from backend.app.rules.rule_engine import BankRuleEngine

router = APIRouter(prefix="/eligibility", tags=["Eligibility & Matching"])

def calculate_emi(principal: float, tenure_months: int, annual_rate: float = 10.5) -> float:
    if tenure_months <= 0 or principal <= 0:
        return 0.0
    r = (annual_rate / 100.0) / 12.0
    n = tenure_months
    emi = principal * r * ((1 + r)**n) / (((1 + r)**n) - 1)
    return round(emi, 2)

@router.post("/analyze", response_model=EligibilityAssessmentResponse)
def analyze_eligibility(req: EligibilityAnalysisRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Ensure required consent exists
    if not ConsentService.has_valid_consent(db, current_user.id):
        raise HTTPException(
            status_code=400,
            detail="Financial Data Consent is required before processing eligibility assessment."
        )

    prof_data = req.profile
    loan_req_data = req.loan_request

    # 2. Derive financial values
    total_monthly_income = prof_data.monthly_income + (prof_data.coapplicant_monthly_income if prof_data.has_coapplicant else 0.0)
    if total_monthly_income <= 0:
        raise HTTPException(status_code=400, detail="Total monthly income must be greater than zero.")

    existing_emi_total = sum(item.monthly_emi for item in prof_data.existing_loans)
    existing_outstanding_total = sum(item.outstanding_amount for item in prof_data.existing_loans)

    # Calculate estimated EMI for requested loan
    estimated_new_emi = calculate_emi(loan_req_data.requested_amount, loan_req_data.tenure_months, annual_rate=10.5)
    total_repayment = round(estimated_new_emi * loan_req_data.tenure_months, 2)
    approx_interest = round(total_repayment - loan_req_data.requested_amount, 2)

    total_combined_emi = existing_emi_total + estimated_new_emi
    dti_ratio = round((existing_emi_total / total_monthly_income) * 100, 2)
    new_emi_income_ratio = round((estimated_new_emi / total_monthly_income) * 100, 2)
    total_dti_ratio = round((total_combined_emi / total_monthly_income) * 100, 2)
    lti_ratio = round(loan_req_data.requested_amount / (total_monthly_income * 12), 2)

    credit_score_info = MockCreditDataService.get_simulated_credit_score(prof_data.credit_history, prof_data.credit_score_optional)
    credit_score = credit_score_info["credit_score"]

    credit_hist_num_map = {"Excellent": 1.0, "Good": 0.85, "Average": 0.6, "Poor": 0.2, "No Credit History": 0.5}
    credit_hist_score = credit_hist_num_map.get(prof_data.credit_history, 0.5)

    # 3. ML Risk Model Evaluation
    ml_feature_input = {
        "monthly_income": prof_data.monthly_income,
        "coapplicant_income": prof_data.coapplicant_monthly_income if prof_data.has_coapplicant else 0.0,
        "loan_amount": loan_req_data.requested_amount,
        "loan_term_months": loan_req_data.tenure_months,
        "existing_emi": existing_emi_total,
        "existing_outstanding": existing_outstanding_total,
        "credit_history_score": credit_hist_score,
        "credit_score": credit_score,
        "employment_tenure_months": prof_data.employment_tenure_months,
        "debt_to_income_ratio": dti_ratio,
        "loan_to_income_ratio": lti_ratio,
        "emi_to_income_ratio": new_emi_income_ratio
    }

    ml_prediction = LoanRiskPredictor.predict_risk(ml_feature_input)
    explainability = ExplainableAIService.generate_explanations(ml_feature_input, ml_prediction["scaled_features"])

    # 4. Bank Matching Evaluation
    products = db.query(LoanProduct).all()
    matched_products_result = []

    for prod in products:
        eval_res = BankRuleEngine.evaluate_product(prod, {
            "age": prof_data.age,
            "monthly_income": prof_data.monthly_income,
            "coapplicant_income": prof_data.coapplicant_monthly_income if prof_data.has_coapplicant else 0.0,
            "credit_score": credit_score,
            "dti_ratio": total_dti_ratio,
            "employment_tenure_months": prof_data.employment_tenure_months,
            "requested_amount": loan_req_data.requested_amount,
            "tenure_months": loan_req_data.tenure_months
        })

        # Calculate estimated EMI specifically for product
        prod_emi = calculate_emi(loan_req_data.requested_amount, loan_req_data.tenure_months)
        eval_res["estimated_emi"] = prod_emi
        matched_products_result.append(eval_res)

    # Sort matched products: MATCHED first, then PARTIALLY_MATCHED
    status_order = {"MATCHED": 0, "PARTIALLY_MATCHED": 1, "NOT_MATCHED": 2}
    matched_products_result.sort(key=lambda x: (status_order.get(x["match_status"], 3), -x["criteria_match_percentage"]))

    # 5. Persist Application Record
    app_id = f"LCA-2026-{random.randint(100000, 999999)}"
    
    app_record = Application(
        id=app_id,
        user_id=current_user.id,
        status="ELIGIBILITY_CHECKED",
        risk_category=ml_prediction["risk_category"],
        ml_score=ml_prediction["probability_score"]
    )
    db.add(app_record)

    # Save Profile
    user_prof = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not user_prof:
        user_prof = UserProfile(user_id=current_user.id)
        db.add(user_prof)
    user_prof.age = prof_data.age
    user_prof.employment_type = prof_data.employment_type
    user_prof.employment_tenure_months = prof_data.employment_tenure_months
    user_prof.monthly_income = prof_data.monthly_income
    user_prof.has_coapplicant = prof_data.has_coapplicant
    user_prof.coapplicant_monthly_income = prof_data.coapplicant_monthly_income if prof_data.has_coapplicant else 0.0
    user_prof.dependents = prof_data.dependents

    # Save Financial Profile
    fin_prof = FinancialProfile(
        application_id=app_id,
        total_monthly_income=total_monthly_income,
        existing_emi_total=existing_emi_total,
        credit_card_outstanding=prof_data.credit_card_outstanding,
        credit_history=prof_data.credit_history,
        credit_score_simulated=credit_score,
        dti_ratio=dti_ratio,
        lti_ratio=lti_ratio,
        emi_to_income_ratio=new_emi_income_ratio
    )
    db.add(fin_prof)

    # Save Existing Loans
    for el in prof_data.existing_loans:
        db.add(ExistingLoan(
            application_id=app_id,
            loan_type=el.loan_type,
            original_amount=el.original_amount,
            outstanding_amount=el.outstanding_amount,
            monthly_emi=el.monthly_emi,
            remaining_tenure_months=el.remaining_tenure_months
        ))

    # Save Loan Request
    db.add(LoanRequest(
        application_id=app_id,
        loan_type=loan_req_data.loan_type,
        requested_amount=loan_req_data.requested_amount,
        tenure_months=loan_req_data.tenure_months,
        purpose=loan_req_data.purpose,
        estimated_emi=estimated_new_emi,
        total_repayment=total_repayment,
        approx_interest=approx_interest
    ))

    # Save ML Prediction
    ml_pred_record = MLPrediction(
        application_id=app_id,
        risk_category=ml_prediction["risk_category"],
        probability_score=ml_prediction["probability_score"],
        confidence=ml_prediction["confidence"]
    )
    db.add(ml_pred_record)
    db.commit()
    db.refresh(ml_pred_record)

    # Save ML Explanations
    for exp_item in explainability["explanations"]:
        db.add(MLExplanation(
            prediction_id=ml_pred_record.id,
            feature_name=exp_item["feature_name"],
            feature_value=str(exp_item["feature_value"]),
            shap_value=exp_item["shap_value"],
            impact_type=exp_item["impact_type"],
            explanation_text=exp_item["explanation_text"]
        ))

    # Save Eligibility Results for matching products
    for m_res in matched_products_result:
        db.add(EligibilityResult(
            application_id=app_id,
            product_id=m_res["product_id"],
            match_status=m_res["match_status"],
            matched_criteria_count=m_res["matched_criteria_count"],
            total_criteria_count=m_res["total_criteria_count"],
            failure_reasons_json=json.dumps(m_res["failure_reasons"])
        ))

    # Log Events
    events = [
        ("APPLICATION_CREATED", f"Application {app_id} initialized."),
        ("MOBILE_VERIFIED", "Mobile OTP verification confirmed."),
        ("IDENTITY_VERIFIED", "PAN demo verification status verified."),
        ("CONSENT_RECORDED", "Financial data consent logged for user."),
        ("PROFILE_COMPLETED", "Financial profile and active loan obligations submitted."),
        ("ELIGIBILITY_CHECKED", f"ML Risk Model score: {ml_prediction['probability_score']}%, Risk: {ml_prediction['risk_category']}.")
    ]
    for ev_type, desc in events:
        db.add(ApplicationEvent(application_id=app_id, event_type=ev_type, description=desc, actor_type="USER"))

    db.commit()

    return {
        "application_id": app_id,
        "timestamp": datetime.utcnow(),
        "derived_financials": {
            "monthly_income": prof_data.monthly_income,
            "coapplicant_income": prof_data.coapplicant_monthly_income if prof_data.has_coapplicant else 0.0,
            "total_monthly_income": total_monthly_income,
            "existing_emi": existing_emi_total,
            "existing_outstanding": existing_outstanding_total,
            "credit_card_outstanding": prof_data.credit_card_outstanding,
            "estimated_new_emi": estimated_new_emi,
            "total_combined_emi": total_combined_emi,
            "dti_ratio": dti_ratio,
            "total_dti_ratio": total_dti_ratio,
            "new_emi_income_ratio": new_emi_income_ratio,
            "lti_ratio": lti_ratio,
            "simulated_credit_score": credit_score
        },
        "loan_request_summary": {
            "loan_type": loan_req_data.loan_type,
            "requested_amount": loan_req_data.requested_amount,
            "tenure_months": loan_req_data.tenure_months,
            "purpose": loan_req_data.purpose,
            "estimated_emi": estimated_new_emi,
            "total_repayment": total_repayment,
            "approx_interest": approx_interest
        },
        "ml_result": {
            "risk_category": ml_prediction["risk_category"],
            "probability_score": ml_prediction["probability_score"],
            "confidence": ml_prediction["confidence"],
            "model_assessment_label": ml_prediction["assessment_label"],
            "positive_factors": explainability["positive_factors"],
            "negative_factors": explainability["negative_factors"],
            "explanations": explainability["explanations"]
        },
        "matched_products": matched_products_result,
        "disclaimer": "Eligibility results are indicative and do not constitute loan approval or a guarantee of credit."
    }
