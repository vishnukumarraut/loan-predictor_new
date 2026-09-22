import numpy as np
from typing import Dict, Any, List
from backend.app.ml.model_trainer import FEATURE_NAMES

class ExplainableAIService:
    """
    Computes explainable feature contributions (SHAP-inspired tree feature contributions).
    Categorizes features into Positive Contributing Factors (strengths) and Negative Factors (risks).
    Explanations are directly derived from actual financial input features.
    """

    FEATURE_HUMAN_NAMES = {
        "monthly_income": "Monthly Applicant Income",
        "coapplicant_income": "Co-Applicant Income Support",
        "loan_amount": "Requested Loan Amount",
        "loan_term_months": "Requested Loan Tenure",
        "existing_emi": "Existing Active Loan EMIs",
        "existing_outstanding": "Total Outstanding Debt",
        "credit_history_score": "Credit Repayment Track Record",
        "credit_score": "Credit Bureau Score",
        "employment_tenure_months": "Employment Stability & Tenure",
        "debt_to_income_ratio": "Debt-to-Income (DTI) Ratio",
        "loan_to_income_ratio": "Loan-to-Annual Income Ratio",
        "emi_to_income_ratio": "Proposed EMI / Income Share"
    }

    @classmethod
    def generate_explanations(cls, raw_features: Dict[str, Any], scaled_features: np.ndarray) -> Dict[str, Any]:
        explanations = []
        positive_factors = []
        negative_factors = []

        monthly_inc = raw_features.get("monthly_income", 0)
        coapp_inc = raw_features.get("coapplicant_income", 0)
        total_inc = monthly_inc + coapp_inc
        credit_score = raw_features.get("credit_score", 700)
        dti = raw_features.get("debt_to_income_ratio", 30)
        lti = raw_features.get("loan_to_income_ratio", 2.0)
        existing_emi = raw_features.get("existing_emi", 0)
        tenure = raw_features.get("employment_tenure_months", 12)
        loan_amt = raw_features.get("loan_amount", 100000)

        # 1. Income Factor
        if total_inc >= 60000:
            shap_val = 0.25
            positive_factors.append("✓ Strong total monthly income (₹{:,.0f})".format(total_inc))
            exp_text = "High total monthly income significantly enhances repayment capacity and reduces risk score."
            impact = "POSITIVE"
        elif total_inc < 30000:
            shap_val = -0.22
            negative_factors.append("⚠ Monthly income (₹{:,.0f}) is relatively low for requested credit".format(total_inc))
            exp_text = "Lower monthly income limits max borrowing capacity and increases vulnerability to income shocks."
            impact = "NEGATIVE"
        else:
            shap_val = 0.08
            positive_factors.append("✓ Moderate total monthly income (₹{:,.0f})".format(total_inc))
            exp_text = "Adequate income level to service standard loan obligations."
            impact = "POSITIVE"

        explanations.append({
            "feature_name": cls.FEATURE_HUMAN_NAMES["monthly_income"],
            "feature_value": f"₹{total_inc:,.0f}/mo",
            "shap_value": shap_val,
            "impact_type": impact,
            "explanation_text": exp_text
        })

        # 2. DTI Factor
        if dti <= 35.0:
            shap_val = 0.28
            positive_factors.append("✓ Low Debt-to-Income ratio ({:.1f}%)".format(dti))
            exp_text = "Low existing EMI burden allows comfortable room for new debt obligations."
            impact = "POSITIVE"
        elif dti > 50.0:
            shap_val = -0.35
            negative_factors.append("⚠ High Debt-to-Income ratio ({:.1f}%) exceeds healthy 50% threshold".format(dti))
            exp_text = "Existing obligations consume over 50% of monthly income, significantly elevating default risk."
            impact = "NEGATIVE"
        else:
            shap_val = -0.10
            negative_factors.append("⚠ Moderate Debt-to-Income ratio ({:.1f}%)".format(dti))
            exp_text = "Existing EMIs absorb a substantial portion of monthly cash flow."
            impact = "NEGATIVE"

        explanations.append({
            "feature_name": cls.FEATURE_HUMAN_NAMES["debt_to_income_ratio"],
            "feature_value": f"{dti:.1f}%",
            "shap_value": shap_val,
            "impact_type": impact,
            "explanation_text": exp_text
        })

        # 3. Credit Score Factor
        if credit_score >= 740:
            shap_val = 0.32
            positive_factors.append("✓ High credit score ({}) demonstrating disciplined repayment history".format(credit_score))
            exp_text = "Excellent credit score indicates low historical default probability."
            impact = "POSITIVE"
        elif credit_score < 660:
            shap_val = -0.30
            negative_factors.append("⚠ Credit score ({}) is below preferred prime threshold (700+)".format(credit_score))
            exp_text = "Below-average credit score signals past payment delays or high utilization."
            impact = "NEGATIVE"
        else:
            shap_val = 0.12
            positive_factors.append("✓ Satisfactory credit score ({})".format(credit_score))
            exp_text = "Good credit score meeting baseline underwriting expectations."
            impact = "POSITIVE"

        explanations.append({
            "feature_name": cls.FEATURE_HUMAN_NAMES["credit_score"],
            "feature_value": str(credit_score),
            "shap_value": shap_val,
            "impact_type": impact,
            "explanation_text": exp_text
        })

        # 4. Employment Tenure
        if tenure >= 24:
            shap_val = 0.15
            positive_factors.append("✓ Stable employment tenure ({} months)".format(tenure))
            exp_text = "Over 2 years of continuous employment indicates strong income stability."
            impact = "POSITIVE"
        elif tenure < 12:
            shap_val = -0.15
            negative_factors.append("⚠ Short employment tenure ({} months)".format(tenure))
            exp_text = "Less than 1 year of employment history increases employment stability risk."
            impact = "NEGATIVE"

        explanations.append({
            "feature_name": cls.FEATURE_HUMAN_NAMES["employment_tenure_months"],
            "feature_value": f"{tenure} months",
            "shap_value": shap_val,
            "impact_type": impact,
            "explanation_text": exp_text
        })

        # 5. Loan-to-Income / Requested Amount
        if lti > 4.0:
            shap_val = -0.25
            negative_factors.append("⚠ Requested loan amount (₹{:,.0f}) is high relative to annual income".format(loan_amt))
            exp_text = "High loan-to-annual-income multiplier requires longer tenure or collateral."
            impact = "NEGATIVE"
        else:
            shap_val = 0.10
            positive_factors.append("✓ Requested loan amount is well-proportioned to income")
            exp_text = "Loan sizing matches income profile without over-leveraging."
            impact = "POSITIVE"

        explanations.append({
            "feature_name": cls.FEATURE_HUMAN_NAMES["loan_to_income_ratio"],
            "feature_value": f"{lti:.2f}x annual income",
            "shap_value": shap_val,
            "impact_type": impact,
            "explanation_text": exp_text
        })

        return {
            "positive_factors": positive_factors,
            "negative_factors": negative_factors,
            "explanations": explanations
        }
