import json
from typing import List, Dict, Any
from backend.app.models.domain import LoanProduct, LoanCriteria

class BankRuleEngine:
    """
    Configurable Rule Matching Engine.
    Evaluates published bank product criteria against applicant profile and loan request.
    Never claims a bank rejected or approved a loan — strictly assesses published criteria.
    """

    @classmethod
    def evaluate_product(cls, product: LoanProduct, applicant_data: Dict[str, Any]) -> Dict[str, Any]:
        age = applicant_data.get("age", 30)
        monthly_income = applicant_data.get("monthly_income", 0.0)
        coapplicant_income = applicant_data.get("coapplicant_income", 0.0)
        total_income = monthly_income + coapplicant_income
        
        credit_score = applicant_data.get("credit_score", 700)
        dti_ratio = applicant_data.get("dti_ratio", 30.0)
        employment_tenure = applicant_data.get("employment_tenure_months", 12)
        loan_amount = applicant_data.get("requested_amount", 100000.0)
        loan_tenure = applicant_data.get("tenure_months", 36)
        
        criteria_checks = []
        failures = []

        # 1. Income check
        income_passed = total_income >= product.min_income
        criteria_checks.append({
            "name": "Minimum Monthly Income",
            "passed": income_passed,
            "actual": f"₹{total_income:,.0f}",
            "required": f">= ₹{product.min_income:,.0f}"
        })
        if not income_passed:
            failures.append(f"Total monthly income (₹{total_income:,.0f}) is below configured minimum requirement of ₹{product.min_income:,.0f}")

        # 2. Credit score check
        credit_passed = credit_score >= product.min_credit_score
        criteria_checks.append({
            "name": "Minimum Credit Score",
            "passed": credit_passed,
            "actual": str(credit_score),
            "required": f">= {product.min_credit_score}"
        })
        if not credit_passed:
            failures.append(f"Credit score ({credit_score}) is below product minimum of {product.min_credit_score}")

        # 3. Debt-to-Income (DTI) ratio check
        dti_passed = dti_ratio <= product.max_dti
        criteria_checks.append({
            "name": "Maximum DTI Ratio",
            "passed": dti_passed,
            "actual": f"{dti_ratio:.1f}%",
            "required": f"<= {product.max_dti:.1f}%"
        })
        if not dti_passed:
            failures.append(f"Debt-to-Income ratio ({dti_ratio:.1f}%) exceeds maximum limit of {product.max_dti:.1f}%")

        # 4. Employment tenure check
        tenure_passed = employment_tenure >= product.min_employment_tenure_months
        criteria_checks.append({
            "name": "Employment Tenure",
            "passed": tenure_passed,
            "actual": f"{employment_tenure} months",
            "required": f">= {product.min_employment_tenure_months} months"
        })
        if not tenure_passed:
            failures.append(f"Employment tenure ({employment_tenure} months) is below required {product.min_employment_tenure_months} months")

        # 5. Loan Amount check
        amount_passed = product.min_loan_amount <= loan_amount <= product.max_loan_amount
        criteria_checks.append({
            "name": "Loan Amount Range",
            "passed": amount_passed,
            "actual": f"₹{loan_amount:,.0f}",
            "required": f"₹{product.min_loan_amount:,.0f} - ₹{product.max_loan_amount:,.0f}"
        })
        if not amount_passed:
            failures.append(f"Requested loan amount (₹{loan_amount:,.0f}) is outside allowed range (₹{product.min_loan_amount:,.0f} - ₹{product.max_loan_amount:,.0f})")

        # 6. Age check
        age_passed = product.min_age <= age <= product.max_age
        criteria_checks.append({
            "name": "Applicant Age Limit",
            "passed": age_passed,
            "actual": f"{age} years",
            "required": f"{product.min_age} - {product.max_age} years"
        })
        if not age_passed:
            failures.append(f"Applicant age ({age}) falls outside age limit ({product.min_age}-{product.max_age} years)")

        total_criteria = len(criteria_checks)
        matched_criteria = sum(1 for c in criteria_checks if c["passed"])
        match_percentage = round((matched_criteria / total_criteria) * 100, 1)

        if matched_criteria == total_criteria:
            status = "MATCHED"
        elif match_percentage >= 65.0:
            status = "PARTIALLY_MATCHED"
        else:
            status = "NOT_MATCHED"

        # Interest rate approximation based on product loan_type
        interest_rate_map = {
            "Personal Loan": "10.5% - 16.0%",
            "Home Loan": "8.4% - 9.5%",
            "Vehicle Loan": "8.8% - 11.2%",
            "Education Loan": "9.0% - 12.5%",
            "Business Loan": "12.0% - 18.0%"
        }

        return {
            "product_id": product.id,
            "bank_id": product.bank_id,
            "bank_name": product.bank.name if product.bank else "Demo Lender",
            "bank_logo": product.bank.logo_url if product.bank else None,
            "product_name": product.product_name,
            "loan_type": product.loan_type,
            "match_status": status,
            "matched_criteria_count": matched_criteria,
            "total_criteria_count": total_criteria,
            "criteria_match_percentage": match_percentage,
            "failure_reasons": failures,
            "criteria_checks": criteria_checks,
            "official_product_url": product.official_product_url,
            "interest_rate_range": interest_rate_map.get(product.loan_type, "10.0% - 15.0%")
        }
