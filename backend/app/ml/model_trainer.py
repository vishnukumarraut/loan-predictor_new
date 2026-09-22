import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

MODEL_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(MODEL_DIR, "loan_gb_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")

# Standard financial feature columns used for ML risk prediction
FEATURE_NAMES = [
    "monthly_income",
    "coapplicant_income",
    "loan_amount",
    "loan_term_months",
    "existing_emi",
    "existing_outstanding",
    "credit_history_score", # 0 to 1
    "credit_score", # 300 to 900
    "employment_tenure_months",
    "debt_to_income_ratio", # DTI %
    "loan_to_income_ratio", # LTI
    "emi_to_income_ratio" # New EMI / Income %
]

def generate_synthetic_dataset(num_samples: int = 1500) -> pd.DataFrame:
    np.random.seed(42)
    
    monthly_income = np.random.uniform(20000, 250000, num_samples)
    coapplicant_income = np.random.choice([0, 15000, 30000, 60000], size=num_samples, p=[0.6, 0.2, 0.15, 0.05])
    total_income = monthly_income + coapplicant_income
    
    loan_amount = np.random.uniform(50000, 3000000, num_samples)
    loan_term_months = np.random.choice([12, 24, 36, 48, 60, 120, 240, 360], size=num_samples)
    
    existing_emi = np.random.uniform(0, monthly_income * 0.4, num_samples)
    existing_outstanding = existing_emi * np.random.uniform(6, 48, num_samples)
    
    credit_history_score = np.random.choice([1.0, 0.8, 0.5, 0.0], size=num_samples, p=[0.6, 0.25, 0.1, 0.05])
    credit_score = (credit_history_score * 300) + np.random.uniform(500, 600, num_samples)
    credit_score = np.clip(credit_score, 300, 900)
    
    employment_tenure_months = np.random.randint(3, 240, num_samples)
    
    dti_ratio = (existing_emi / total_income) * 100
    lti_ratio = loan_amount / (total_income * 12)
    
    # Rough EMI calculation
    r = 0.12 / 12
    n = loan_term_months
    estimated_emi = loan_amount * r * ((1 + r)**n) / (((1 + r)**n) - 1)
    emi_to_income_ratio = (estimated_emi / total_income) * 100
    
    # Generate realistic target probability (Low risk = 1, High risk = 0)
    z = (
        0.00002 * total_income +
        1.8 * credit_history_score +
        0.004 * (credit_score - 600) +
        0.008 * employment_tenure_months -
        0.04 * dti_ratio -
        0.5 * lti_ratio -
        0.03 * emi_to_income_ratio -
        0.0000005 * loan_amount
    )
    prob = 1 / (1 + np.exp(-z))
    target = (prob > 0.45).astype(int)
    
    df = pd.DataFrame({
        "monthly_income": monthly_income,
        "coapplicant_income": coapplicant_income,
        "loan_amount": loan_amount,
        "loan_term_months": loan_term_months,
        "existing_emi": existing_emi,
        "existing_outstanding": existing_outstanding,
        "credit_history_score": credit_history_score,
        "credit_score": credit_score,
        "employment_tenure_months": employment_tenure_months,
        "debt_to_income_ratio": dti_ratio,
        "loan_to_income_ratio": lti_ratio,
        "emi_to_income_ratio": emi_to_income_ratio,
        "target": target
    })
    return df

def train_and_save_model():
    df = generate_synthetic_dataset()
    X = df[FEATURE_NAMES]
    y = df["target"]
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    model = GradientBoostingClassifier(
        n_estimators=180,
        max_depth=4,
        learning_rate=0.08,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    acc = model.score(X_test, y_test)
    print(f"[ML TRAINER] Gradient Boosting Model Test Accuracy: {acc*100:.2f}%")
    
    # Save model and scaler
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(SCALER_PATH, "wb") as f:
        pickle.dump(scaler, f)
        
    print(f"[ML TRAINER] Saved model to {MODEL_PATH} and scaler to {SCALER_PATH}")
    return model, scaler

if __name__ == "__main__":
    train_and_save_model()
