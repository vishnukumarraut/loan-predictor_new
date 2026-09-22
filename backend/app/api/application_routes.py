from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.auth.security import get_current_user
from backend.app.models.domain import User, Application, FinancialProfile, LoanRequest, ApplicationEvent, EligibilityResult

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("", response_model=List[dict])
def get_user_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    apps = db.query(Application).filter(Application.user_id == current_user.id).order_by(Application.created_at.desc()).all()
    result = []
    for app in apps:
        lreq = app.loan_request
        fin = app.financial_profile
        match_count = db.query(EligibilityResult).filter(
            EligibilityResult.application_id == app.id,
            EligibilityResult.match_status == "MATCHED"
        ).count()
        result.append({
            "id": app.id,
            "user_id": app.user_id,
            "user_name": current_user.full_name,
            "user_mobile": current_user.mobile_number,
            "loan_type": lreq.loan_type if lreq else "Personal Loan",
            "requested_amount": lreq.requested_amount if lreq else 0.0,
            "risk_category": app.risk_category or "MEDIUM",
            "ml_score": app.ml_score or 75.0,
            "status": app.status,
            "created_at": app.created_at,
            "matched_products_count": match_count
        })
    return result

@router.get("/{app_id}")
def get_application_detail(app_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if app.user_id != current_user.id and current_user.role.upper() != "ADMIN":
        raise HTTPException(status_code=403, detail="Access forbidden")

    lreq = app.loan_request
    fin = app.financial_profile
    ex_loans = app.existing_loans
    events = db.query(ApplicationEvent).filter(ApplicationEvent.application_id == app_id).order_by(ApplicationEvent.created_at.asc()).all()
    results = db.query(EligibilityResult).filter(EligibilityResult.application_id == app_id).all()

    matched_list = []
    for r in results:
        prod = r.product
        matched_list.append({
            "product_id": r.product_id,
            "bank_name": prod.bank.name if prod and prod.bank else "Demo Bank",
            "product_name": prod.product_name if prod else "Demo Product",
            "loan_type": prod.loan_type if prod else "Loan",
            "match_status": r.match_status,
            "matched_criteria_count": r.matched_criteria_count,
            "total_criteria_count": r.total_criteria_count,
            "official_product_url": prod.official_product_url if prod else None
        })

    return {
        "id": app.id,
        "status": app.status,
        "risk_category": app.risk_category,
        "ml_score": app.ml_score,
        "created_at": app.created_at,
        "user_info": {
            "full_name": app.user.full_name,
            "email": app.user.email,
            "mobile_number": app.user.mobile_number
        },
        "financial_profile": {
            "total_monthly_income": fin.total_monthly_income if fin else 0.0,
            "existing_emi_total": fin.existing_emi_total if fin else 0.0,
            "credit_card_outstanding": fin.credit_card_outstanding if fin else 0.0,
            "credit_history": fin.credit_history if fin else "Good",
            "credit_score_simulated": fin.credit_score_simulated if fin else 700,
            "dti_ratio": fin.dti_ratio if fin else 0.0,
            "lti_ratio": fin.lti_ratio if fin else 0.0,
            "emi_to_income_ratio": fin.emi_to_income_ratio if fin else 0.0
        },
        "loan_request": {
            "loan_type": lreq.loan_type if lreq else "Personal Loan",
            "requested_amount": lreq.requested_amount if lreq else 0.0,
            "tenure_months": lreq.tenure_months if lreq else 36,
            "purpose": lreq.purpose if lreq else None,
            "estimated_emi": lreq.estimated_emi if lreq else 0.0,
            "total_repayment": lreq.total_repayment if lreq else 0.0,
            "approx_interest": lreq.approx_interest if lreq else 0.0
        },
        "existing_loans": [
            {
                "loan_type": el.loan_type,
                "original_amount": el.original_amount,
                "outstanding_amount": el.outstanding_amount,
                "monthly_emi": el.monthly_emi,
                "remaining_tenure_months": el.remaining_tenure_months
            } for el in ex_loans
        ],
        "matched_products": matched_list,
        "timeline_events": [
            {
                "event_type": ev.event_type,
                "description": ev.description,
                "created_at": ev.created_at
            } for ev in events
        ]
    }
