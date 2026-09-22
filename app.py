"""
LoanPredict AI - Flask Backend
A modern AI-powered loan approval prediction system.
"""

from flask import Flask, render_template, request, jsonify, send_file
import pickle, numpy as np, pandas as pd, json, io, os
from datetime import datetime
import plotly, plotly.graph_objs as go
import plotly.express as px
import os

app = Flask(__name__)
app.secret_key = "loanpredict_ai_secret_2024"

# ── Load ML model ─────────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

# ── In-memory prediction history (resets on restart) ─────────────────────────
prediction_history = []

# ── Label maps ───────────────────────────────────────────────────────────────
GENDER_MAP       = {"Male": 1, "Female": 0}
MARRIED_MAP      = {"Yes": 1, "No": 0}
EDUCATION_MAP    = {"Graduate": 1, "Not Graduate": 0}
SELF_EMP_MAP     = {"Yes": 1, "No": 0}
PROPERTY_MAP     = {"Urban": 2, "Semiurban": 1, "Rural": 0}
CREDIT_MAP       = {"Yes": 1, "No": 0}


FEATURE_COLS = [
    "Gender", "Married", "Dependents", "Education", "Self_Employed",
    "ApplicantIncome", "CoapplicantIncome", "LoanAmount",
    "Loan_Amount_Term", "Credit_History", "Property_Area",
]

def encode_features(data: dict) -> pd.DataFrame:
    loan_amt = float(data["loan_amount"])
    if loan_amt > 1000:
        loan_amt = loan_amt / 1000.0

    row = {
        "Gender":          GENDER_MAP.get(data["gender"], 1),
        "Married":         MARRIED_MAP.get(data["married"], 0),
        "Dependents":      int(data["dependents"]),
        "Education":       EDUCATION_MAP.get(data["education"], 1),
        "Self_Employed":   SELF_EMP_MAP.get(data["self_employed"], 0),
        "ApplicantIncome": float(data["applicant_income"]),
        "CoapplicantIncome": float(data["coapplicant_income"]),
        "LoanAmount":      loan_amt,
        "Loan_Amount_Term": float(data["loan_term"]),
        "Credit_History":  CREDIT_MAP.get(data["credit_history"], 1),
        "Property_Area":   PROPERTY_MAP.get(data["property_area"], 2),
    }
    return pd.DataFrame([row], columns=FEATURE_COLS)


def risk_level(prob: float) -> str:
    if prob >= 0.75:
        return "Low"
    elif prob >= 0.50:
        return "Medium"
    return "High"


def recommendation(approved: bool, prob: float, data: dict) -> str:
    if approved:
        msgs = []
        if float(data.get("credit_history_score", 1)) < 1:
            msgs.append("Maintain a strong credit history to secure better rates.")
        if float(data.get("loan_amount", 0)) > 300:
            msgs.append("Consider reducing the loan amount to lower your EMI burden.")
        msgs.append("Congratulations! Your application profile is strong. Proceed with documentation.")
        return " ".join(msgs[-2:])
    else:
        tips = []
        if data.get("credit_history") == "No":
            tips.append("Improve your credit score — it's the strongest approval factor.")
        if float(data.get("applicant_income", 0)) < 3000:
            tips.append("A higher income or co-applicant income significantly boosts approval odds.")
        if float(data.get("loan_amount", 0)) > 200:
            tips.append("Reducing the requested loan amount may improve your eligibility.")
        tips.append("Consider reapplying after 3–6 months with improved financials.")
        return " ".join(tips[:2])


# ══════════════════════════════════════════════════════════════════════════════
#  ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict")
def predict_page():
    return render_template("predict.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/about")
def about():
    return render_template("about.html")


import re

# ── PAN Validation & Masking ──────────────────────────────────────────────────
PAN_REGEX = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")

def validate_pan(pan: str) -> bool:
    if not pan:
        return False
    return bool(PAN_REGEX.match(pan.strip().upper()))

def mask_pan(pan: str) -> str:
    if not pan:
        return "N/A"
    clean = pan.strip().upper()
    if len(clean) == 10:
        return clean[:5] + "****" + clean[9:]
    return "****"

# ── Real Indian Bank Products & Matching Engine ────────────────────────────────
INDIAN_BANK_PRODUCTS = [
    {
        "bank_name": "State Bank of India (SBI)",
        "product_name": "SBI Personal Loan",
        "loan_type": "Personal Loan",
        "rate_range": "10.50% - 13.50% p.a.",
        "annual_rate": 11.5,
        "min_income": 25000,
        "min_credit": "Yes",
        "min_amount": 50000,
        "max_amount": 2000000,
        "url": "https://sbi.co.in/web/personal-banking/loans/personal-loans",
    },
    {
        "bank_name": "State Bank of India (SBI)",
        "product_name": "SBI Regular Home Loan",
        "loan_type": "Home Loan",
        "rate_range": "8.50% - 9.65% p.a.",
        "annual_rate": 8.75,
        "min_income": 30000,
        "min_credit": "Yes",
        "min_amount": 500000,
        "max_amount": 10000000,
        "url": "https://homeloans.sbi/",
    },
    {
        "bank_name": "State Bank of India (SBI)",
        "product_name": "SBI Car Loan",
        "loan_type": "Vehicle Loan",
        "rate_range": "8.85% - 9.70% p.a.",
        "annual_rate": 9.1,
        "min_income": 25000,
        "min_credit": "Yes",
        "min_amount": 100000,
        "max_amount": 3000000,
        "url": "https://sbi.co.in/web/personal-banking/loans/auto-loans",
    },
    {
        "bank_name": "Punjab National Bank (PNB)",
        "product_name": "PNB Personal Loan",
        "loan_type": "Personal Loan",
        "rate_range": "10.40% - 14.00% p.a.",
        "annual_rate": 11.2,
        "min_income": 20000,
        "min_credit": "Yes",
        "min_amount": 50000,
        "max_amount": 1500000,
        "url": "https://www.pnbindia.in/personal-loan.html",
    },
    {
        "bank_name": "Punjab National Bank (PNB)",
        "product_name": "PNB Housing Loan",
        "loan_type": "Home Loan",
        "rate_range": "8.40% - 9.80% p.a.",
        "annual_rate": 8.6,
        "min_income": 25000,
        "min_credit": "Yes",
        "min_amount": 500000,
        "max_amount": 10000000,
        "url": "https://www.pnbindia.in/housing-loan.html",
    },
    {
        "bank_name": "Bank of Baroda",
        "product_name": "Baroda Personal Loan",
        "loan_type": "Personal Loan",
        "rate_range": "10.85% - 14.25% p.a.",
        "annual_rate": 11.4,
        "min_income": 25000,
        "min_credit": "Yes",
        "min_amount": 50000,
        "max_amount": 2000000,
        "url": "https://www.bankofbaroda.in/personal-banking/loans/personal-loan",
    },
    {
        "bank_name": "Canara Bank",
        "product_name": "Canara Budget Personal Loan",
        "loan_type": "Personal Loan",
        "rate_range": "10.95% - 13.90% p.a.",
        "annual_rate": 11.5,
        "min_income": 22000,
        "min_credit": "Yes",
        "min_amount": 50000,
        "max_amount": 1000000,
        "url": "https://canarabank.com/personal-loan",
    },
    {
        "bank_name": "Union Bank of India",
        "product_name": "Union Personal Loan",
        "loan_type": "Personal Loan",
        "rate_range": "10.35% - 13.75% p.a.",
        "annual_rate": 11.0,
        "min_income": 20000,
        "min_credit": "Yes",
        "min_amount": 50000,
        "max_amount": 1500000,
        "url": "https://www.unionbankofindia.co.in/english/personal-loan.aspx",
    },
    {
        "bank_name": "Kotak Mahindra Bank",
        "product_name": "Kotak Personal Loan",
        "loan_type": "Personal Loan",
        "rate_range": "10.99% - 16.00% p.a.",
        "annual_rate": 12.0,
        "min_income": 30000,
        "min_credit": "Yes",
        "min_amount": 50000,
        "max_amount": 2500000,
        "url": "https://www.kotak.com/en/personal-banking/loans/personal-loan.html",
    },
    {
        "bank_name": "HDFC Bank",
        "product_name": "HDFC Bank Personal Loan",
        "loan_type": "Personal Loan",
        "rate_range": "10.50% - 15.00% p.a.",
        "annual_rate": 11.25,
        "min_income": 25000,
        "min_credit": "Yes",
        "min_amount": 50000,
        "max_amount": 4000000,
        "url": "https://www.hdfcbank.com/personal/borrow/popular-loans/personal-loan",
    },
    {
        "bank_name": "ICICI Bank",
        "product_name": "ICICI Bank Personal Loan",
        "loan_type": "Personal Loan",
        "rate_range": "10.80% - 15.50% p.a.",
        "annual_rate": 11.5,
        "min_income": 30000,
        "min_credit": "Yes",
        "min_amount": 50000,
        "max_amount": 5000000,
        "url": "https://www.icicibank.com/personal-banking/loans/personal-loan",
    },
    {
        "bank_name": "Axis Bank",
        "product_name": "Axis Bank Personal Loan",
        "loan_type": "Personal Loan",
        "rate_range": "10.75% - 14.75% p.a.",
        "annual_rate": 11.4,
        "min_income": 25000,
        "min_credit": "Yes",
        "min_amount": 50000,
        "max_amount": 4000000,
        "url": "https://www.axisbank.com/retail/loans/personal-loan",
    },
    {
        "bank_name": "IDFC FIRST Bank",
        "product_name": "IDFC FIRST Personal Loan",
        "loan_type": "Personal Loan",
        "rate_range": "10.49% - 15.25% p.a.",
        "annual_rate": 11.0,
        "min_income": 25000,
        "min_credit": "Yes",
        "min_amount": 50000,
        "max_amount": 10000000,
        "url": "https://www.idfcfirstbank.com/personal-banking/loans/personal-loan",
    },
    {
        "bank_name": "IndusInd Bank",
        "product_name": "IndusInd Business Loan",
        "loan_type": "Business Loan",
        "rate_range": "12.50% - 18.00% p.a.",
        "annual_rate": 13.5,
        "min_income": 50000,
        "min_credit": "Yes",
        "min_amount": 200000,
        "max_amount": 5000000,
        "url": "https://www.indusind.com/in/en/personal/loans/business-loans.html",
    },
    {
        "bank_name": "Bank of India",
        "product_name": "BOI Star Personal Loan",
        "loan_type": "Personal Loan",
        "rate_range": "10.35% - 13.25% p.a.",
        "annual_rate": 11.0,
        "min_income": 20000,
        "min_credit": "Yes",
        "min_amount": 50000,
        "max_amount": 1000000,
        "url": "https://bankofindia.co.in/PersonalLoan",
    },
    {
        "bank_name": "Indian Bank",
        "product_name": "IB Personal Loan",
        "loan_type": "Personal Loan",
        "rate_range": "10.25% - 13.50% p.a.",
        "annual_rate": 10.9,
        "min_income": 20000,
        "min_credit": "Yes",
        "min_amount": 50000,
        "max_amount": 1000000,
        "url": "https://www.indianbank.in/departments/personal-loan/",
    },
    {
        "bank_name": "Central Bank of India",
        "product_name": "Central Personal Loan",
        "loan_type": "Personal Loan",
        "rate_range": "10.40% - 13.50% p.a.",
        "annual_rate": 11.0,
        "min_income": 20000,
        "min_credit": "Yes",
        "min_amount": 50000,
        "max_amount": 1000000,
        "url": "https://www.centralbankofindia.co.in/en/personal-loan",
    },
    {
        "bank_name": "UCO Bank",
        "product_name": "UCO Cash Personal Loan",
        "loan_type": "Personal Loan",
        "rate_range": "10.50% - 13.80% p.a.",
        "annual_rate": 11.1,
        "min_income": 20000,
        "min_credit": "Yes",
        "min_amount": 50000,
        "max_amount": 1000000,
        "url": "https://www.ucobank.com/english/personal-loan.aspx",
    },
    {
        "bank_name": "Bank of Maharashtra",
        "product_name": "Maha Personal Loan",
        "loan_type": "Personal Loan",
        "rate_range": "10.25% - 13.25% p.a.",
        "annual_rate": 10.85,
        "min_income": 20000,
        "min_credit": "Yes",
        "min_amount": 50000,
        "max_amount": 1000000,
        "url": "https://bankofmaharashtra.in/personal-loans",
    },
]

def calculate_emi_val(principal: float, tenure_months: int, annual_rate: float) -> float:
    if tenure_months <= 0 or principal <= 0:
        return 0.0
    r = (annual_rate / 100.0) / 12.0
    n = tenure_months
    emi = principal * r * ((1 + r)**n) / (((1 + r)**n) - 1)
    return round(emi, 2)

def evaluate_bank_matches(data: dict, approved: bool) -> list:
    total_income = float(data.get("applicant_income", 0)) + float(data.get("coapplicant_income", 0))
    requested_amount = float(data.get("loan_amount", 0))
    loan_term = int(data.get("loan_term", 36))
    credit_hist = data.get("credit_history", "Yes")
    selected_loan_type = data.get("loan_type", "Personal Loan")

    matched_products = []

    for prod in INDIAN_BANK_PRODUCTS:
        total_criteria = 4
        matched_cnt = 0
        unmatched_reasons = []

        if total_income >= prod["min_income"]:
            matched_cnt += 1
        else:
            unmatched_reasons.append(f"Min income required ₹{prod['min_income']:,} (You: ₹{int(total_income):,})")

        if credit_hist == prod["min_credit"]:
            matched_cnt += 1
        else:
            unmatched_reasons.append("Requires Good credit history rating")

        if prod["min_amount"] <= requested_amount <= prod["max_amount"]:
            matched_cnt += 1
        else:
            unmatched_reasons.append(f"Amount outside limit (₹{prod['min_amount']:,} - ₹{prod['max_amount']:,})")

        if approved:
            matched_cnt += 1
        else:
            unmatched_reasons.append("ML risk assessment exceeds lender threshold")

        is_type_matched = (selected_loan_type == prod["loan_type"])

        emi = calculate_emi_val(requested_amount, loan_term, prod["annual_rate"])
        match_status = "MATCHED" if matched_cnt == total_criteria else ("PARTIALLY_MATCHED" if matched_cnt >= 2 else "NOT_MATCHED")

        matched_products.append({
            "bank_name": prod["bank_name"],
            "product_name": prod["product_name"],
            "loan_type": prod["loan_type"],
            "interest_rate_range": prod["rate_range"],
            "estimated_emi": emi,
            "matched_criteria_count": matched_cnt,
            "total_criteria_count": total_criteria,
            "unmatched_criteria": unmatched_reasons,
            "match_status": match_status,
            "is_type_matched": is_type_matched,
            "official_url": prod["url"]
        })

    matched_products.sort(key=lambda x: (0 if x["is_type_matched"] else 1, 0 if x["match_status"] == "MATCHED" else (1 if x["match_status"] == "PARTIALLY_MATCHED" else 2)))
    return matched_products

def compute_application_analysis():
    total = len(prediction_history)
    if total == 0:
        return {
            "is_demo_data": True,
            "total_applications": 100,
            "eligible_applications": 72,
            "rejected_applications": 28,
            "eligible_percentage": 72.0,
            "rejected_percentage": 28.0,
            "bank_wise": {
                "State Bank of India (SBI)": {"eligible": 18, "rejected": 4},
                "Punjab National Bank (PNB)": {"eligible": 12, "rejected": 5},
                "Bank of Baroda": {"eligible": 10, "rejected": 3},
                "Canara Bank": {"eligible": 9, "rejected": 4},
                "Kotak Mahindra Bank": {"eligible": 8, "rejected": 4},
                "HDFC Bank": {"eligible": 15, "rejected": 8},
            }
        }
    
    eligible = sum(1 for p in prediction_history if p.get("approved"))
    rejected = total - eligible
    el_pct = round((eligible / total) * 100, 1)
    rej_pct = round((rejected / total) * 100, 1)

    bank_stats = {}
    for p in prediction_history:
        prods = p.get("matched_products", [])
        is_app_approved = p.get("approved", False)
        for prod in prods:
            b_name = prod["bank_name"]
            if b_name not in bank_stats:
                bank_stats[b_name] = {"eligible": 0, "rejected": 0}
            if prod["match_status"] == "MATCHED" and is_app_approved:
                bank_stats[b_name]["eligible"] += 1
            else:
                bank_stats[b_name]["rejected"] += 1

    return {
        "is_demo_data": False,
        "total_applications": total,
        "eligible_applications": eligible,
        "rejected_applications": rejected,
        "eligible_percentage": el_pct,
        "rejected_percentage": rej_pct,
        "bank_wise": bank_stats
    }


# ── REST: prediction ──────────────────────────────────────────────────────────
@app.route("/api/predict", methods=["POST"])
def api_predict():
    try:
        data = request.get_json()

        pan_raw = data.get("pan_number", "").strip().upper()
        if pan_raw and not validate_pan(pan_raw):
            return jsonify({
                "success": False,
                "error": "Invalid PAN format. Valid format example: ABCDE1234F"
            }), 400

        masked_pan = mask_pan(pan_raw) if pan_raw else "N/A"

        X = encode_features(data)
        prob = float(model.predict_proba(X)[0][1])
        approved = prob >= 0.5

        matched_prods = evaluate_bank_matches(data, approved)

        req_amt = float(data.get("loan_amount", 1500000))
        req_term = int(data.get("loan_term", 360))
        estimated_emi = calculate_emi_val(req_amt, req_term, 10.5)

        tot_inc = float(data.get("applicant_income", 0)) + float(data.get("coapplicant_income", 0))
        dti = round((estimated_emi / tot_inc * 100), 1) if tot_inc > 0 else 0

        app_id = f"LPA-2026-{len(prediction_history) + 101}"

        result = {
            "application_id": app_id,
            "approved": approved,
            "probability": round(prob * 100, 1),
            "risk_level": risk_level(prob),
            "confidence": round(min(prob, 1 - prob) * 2 * 100, 1) if prob < 0.5
                          else round((prob - 0.5) * 2 * 100, 1),
            "recommendation": recommendation(approved, prob, data),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "applicant_name": data.get("applicant_name", "Valued Applicant"),
            "masked_pan": masked_pan,
            "loan_type": data.get("loan_type", "Personal Loan"),
            "preferred_bank": data.get("preferred_bank", "State Bank of India (SBI)"),
            "estimated_emi": estimated_emi,
            "dti": dti,
            "matched_products": matched_prods,
        }

        entry = {
            **data,
            **result,
            "id": len(prediction_history) + 1,
            "pan_number": masked_pan
        }
        prediction_history.append(entry)

        analysis = compute_application_analysis()

        return jsonify({
            "success": True,
            "result": result,
            "analysis": analysis
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400



# ── REST: analytics charts ────────────────────────────────────────────────────
@app.route("/api/analytics")
def api_analytics():
    try:
        df = pd.read_csv("data/loan_data.csv")

        # 1. Approval distribution donut
        counts = df["Loan_Status"].value_counts()
        donut = go.Figure(go.Pie(
            labels=["Approved", "Rejected"],
            values=[int(counts.get(1, 0)), int(counts.get(0, 0))],
            hole=0.55,
            marker_colors=["#4f8ef7", "#a855f7"],
            textfont_size=14,
        ))
        donut.update_layout(
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font_color="#e2e8f0",
            margin=dict(t=20, b=20, l=20, r=20),
            showlegend=True,
            legend=dict(orientation="h", yanchor="bottom", y=-0.15),
        )

        # 2. Income histogram
        income_fig = go.Figure()
        income_fig.add_trace(go.Histogram(
            x=df[df["Loan_Status"] == 1]["ApplicantIncome"],
            name="Approved", marker_color="#4f8ef7", opacity=0.75, nbinsx=30))
        income_fig.add_trace(go.Histogram(
            x=df[df["Loan_Status"] == 0]["ApplicantIncome"],
            name="Rejected", marker_color="#a855f7", opacity=0.75, nbinsx=30))
        income_fig.update_layout(
            barmode="overlay",
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font_color="#e2e8f0",
            xaxis=dict(gridcolor="rgba(255,255,255,0.08)", title="Applicant Income (₹)"),
            yaxis=dict(gridcolor="rgba(255,255,255,0.08)", title="Count"),
            margin=dict(t=20, b=40, l=40, r=20),
            legend=dict(orientation="h", yanchor="bottom", y=-0.25),
        )

        # 3. Credit history bar
        ch = df.groupby(["Credit_History", "Loan_Status"]).size().unstack(fill_value=0)
        credit_fig = go.Figure()
        credit_fig.add_trace(go.Bar(
            x=["No Credit History", "Good Credit History"],
            y=[int(ch.loc[0, 1]) if 0 in ch.index else 0,
               int(ch.loc[1, 1]) if 1 in ch.index else 0],
            name="Approved", marker_color="#4f8ef7"))
        credit_fig.add_trace(go.Bar(
            x=["No Credit History", "Good Credit History"],
            y=[int(ch.loc[0, 0]) if 0 in ch.index else 0,
               int(ch.loc[1, 0]) if 1 in ch.index else 0],
            name="Rejected", marker_color="#a855f7"))
        credit_fig.update_layout(
            barmode="group",
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font_color="#e2e8f0",
            xaxis=dict(gridcolor="rgba(255,255,255,0.08)"),
            yaxis=dict(gridcolor="rgba(255,255,255,0.08)", title="Count"),
            margin=dict(t=20, b=40, l=40, r=20),
            legend=dict(orientation="h", yanchor="bottom", y=-0.3),
        )

        # 4. Property area bar
        pa_map = {0: "Rural", 1: "Semiurban", 2: "Urban"}
        df["Property_Label"] = df["Property_Area"].map(pa_map)
        pa = df.groupby(["Property_Label", "Loan_Status"]).size().unstack(fill_value=0)
        area_fig = go.Figure()
        area_fig.add_trace(go.Bar(
            x=pa.index.tolist(),
            y=pa[1].tolist() if 1 in pa.columns else [0]*len(pa),
            name="Approved", marker_color="#22d3ee"))
        area_fig.add_trace(go.Bar(
            x=pa.index.tolist(),
            y=pa[0].tolist() if 0 in pa.columns else [0]*len(pa),
            name="Rejected", marker_color="#f472b6"))
        area_fig.update_layout(
            barmode="group",
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font_color="#e2e8f0",
            xaxis=dict(gridcolor="rgba(255,255,255,0.08)"),
            yaxis=dict(gridcolor="rgba(255,255,255,0.08)", title="Count"),
            margin=dict(t=20, b=40, l=40, r=20),
            legend=dict(orientation="h", yanchor="bottom", y=-0.3),
        )

        total = len(df)
        approved_count = int(df["Loan_Status"].sum())
        approval_rate  = round(approved_count / total * 100, 1)
        avg_income     = int(df["ApplicantIncome"].mean())
        avg_loan       = int(df["LoanAmount"].mean())

        return jsonify({
            "success": True,
            "charts": {
                "donut":  json.loads(plotly.io.to_json(donut)),
                "income": json.loads(plotly.io.to_json(income_fig)),
                "credit": json.loads(plotly.io.to_json(credit_fig)),
                "area":   json.loads(plotly.io.to_json(area_fig)),
            },
            "kpis": {
                "total": total,
                "approved": approved_count,
                "approval_rate": approval_rate,
                "avg_income": avg_income,
                "avg_loan": avg_loan,
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ── REST: prediction history ──────────────────────────────────────────────────
@app.route("/api/history")
def api_history():
    recent = prediction_history[-20:][::-1]
    return jsonify({"success": True, "history": recent})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
