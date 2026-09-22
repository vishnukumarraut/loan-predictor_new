from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.domain import LoanProduct, Bank

router = APIRouter(prefix="/loan-products", tags=["Loan Products"])

@router.get("", response_model=List[dict])
def list_loan_products(loan_type: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(LoanProduct)
    if loan_type:
        query = query.filter(LoanProduct.loan_type == loan_type)
    products = query.order_by(LoanProduct.id.asc()).all()
    
    result = []
    for p in products:
        result.append({
            "id": p.id,
            "bank_id": p.bank_id,
            "bank_name": p.bank.name if p.bank else "Demo Bank",
            "bank_logo": p.bank.logo_url if p.bank else None,
            "product_name": p.product_name,
            "loan_type": p.loan_type,
            "min_age": p.min_age,
            "max_age": p.max_age,
            "min_income": p.min_income,
            "min_credit_score": p.min_credit_score,
            "max_dti": p.max_dti,
            "min_employment_tenure_months": p.min_employment_tenure_months,
            "min_loan_amount": p.min_loan_amount,
            "max_loan_amount": p.max_loan_amount,
            "min_tenure_months": p.min_tenure_months,
            "max_tenure_months": p.max_tenure_months,
            "official_product_url": p.official_product_url,
            "is_demo": p.is_demo
        })
    return result

@router.get("/{product_id}")
def get_loan_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(LoanProduct).filter(LoanProduct.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Loan product not found")
        
    return {
        "id": product.id,
        "bank_id": product.bank_id,
        "bank_name": product.bank.name if product.bank else "Demo Bank",
        "bank_logo": product.bank.logo_url if product.bank else None,
        "product_name": product.product_name,
        "loan_type": product.loan_type,
        "min_age": product.min_age,
        "max_age": product.max_age,
        "min_income": product.min_income,
        "min_credit_score": product.min_credit_score,
        "max_dti": product.max_dti,
        "min_employment_tenure_months": product.min_employment_tenure_months,
        "min_loan_amount": product.min_loan_amount,
        "max_loan_amount": product.max_loan_amount,
        "min_tenure_months": product.min_tenure_months,
        "max_tenure_months": product.max_tenure_months,
        "official_product_url": product.official_product_url,
        "is_demo": product.is_demo,
        "criteria": [
            {
                "id": c.id,
                "rule_name": c.rule_name,
                "criteria_key": c.criteria_key,
                "operator": c.operator,
                "value": c.value
            } for c in product.criteria
        ]
    }
