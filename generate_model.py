"""
Model Training Script for LoanPredict AI
Trains a GradientBoostingClassifier on the loan dataset and saves model.pkl
"""

import os
import pickle
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

def train_and_save_model():
    data_path = os.path.join(os.path.dirname(__file__), "data", "loan_data.csv")
    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")

    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")

    df = pd.read_csv(data_path)
    print(f"Loaded dataset with {len(df)} records and {len(df.columns)} columns.")

    feature_cols = [
        "Gender", "Married", "Dependents", "Education", "Self_Employed",
        "ApplicantIncome", "CoapplicantIncome", "LoanAmount",
        "Loan_Amount_Term", "Credit_History", "Property_Area"
    ]
    target_col = "Loan_Status"

    X = df[feature_cols]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = GradientBoostingClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.08,
        random_state=42
    )

    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Model Test Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    # Refit on full dataset for final model
    clf.fit(X, y)

    with open(model_path, "wb") as f:
        pickle.dump(clf, f)

    print(f"Trained model saved to {model_path}")

if __name__ == "__main__":
    train_and_save_model()
