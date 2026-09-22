import os
import pickle
import numpy as np
import pandas as pd
from typing import Dict, Any
from backend.app.ml.model_trainer import train_and_save_model, FEATURE_NAMES, MODEL_PATH, SCALER_PATH

class LoanRiskPredictor:
    _model = None
    _scaler = None

    @classmethod
    def _load_or_train(cls):
        if cls._model is None or cls._scaler is None:
            if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
                with open(MODEL_PATH, "rb") as f:
                    cls._model = pickle.load(f)
                with open(SCALER_PATH, "rb") as f:
                    cls._scaler = pickle.load(f)
            else:
                cls._model, cls._scaler = train_and_save_model()

    @classmethod
    def predict_risk(cls, feature_dict: Dict[str, Any]) -> Dict[str, Any]:
        cls._load_or_train()
        
        # Build feature vector
        row = [feature_dict.get(col, 0.0) for col in FEATURE_NAMES]
        df_row = pd.DataFrame([row], columns=FEATURE_NAMES)
        scaled_row = cls._scaler.transform(df_row)
        
        # Predict probability of low risk (approval eligibility score)
        prob_low_risk = float(cls._model.predict_proba(scaled_row)[0][1])
        model_score_pct = round(prob_low_risk * 100, 1)
        
        # Risk classification
        if prob_low_risk >= 0.72:
            risk_category = "LOW"
            assessment_label = "Strong Profile — High Compatibility with Lenders"
        elif prob_low_risk >= 0.45:
            risk_category = "MEDIUM"
            assessment_label = "Moderate Risk — Matches Selected Standard Criteria"
        else:
            risk_category = "HIGH"
            assessment_label = "Elevated Risk — High Debt Burden or Low Credit Score"
            
        confidence = round(abs(prob_low_risk - 0.5) * 200, 1) # 0 to 100 confidence
        
        return {
            "risk_category": risk_category,
            "probability_score": model_score_pct,
            "confidence": confidence,
            "assessment_label": assessment_label,
            "scaled_features": scaled_row[0],
            "raw_features": feature_dict
        }
