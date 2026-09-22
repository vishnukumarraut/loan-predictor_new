class MockCreditDataService:
    """
    Mock Credit Score Provider.
    Explicitly indicates that credit score is simulated.
    Does NOT claim real access to CIBIL, Experian, or Equifax.
    """
    
    CREDIT_HISTORY_MAP = {
        "Excellent": 780,
        "Good": 720,
        "Average": 660,
        "Poor": 580,
        "No Credit History": 620
    }
    
    @classmethod
    def get_simulated_credit_score(cls, credit_history_category: str, user_provided_score: int = None) -> dict:
        if user_provided_score and 300 <= user_provided_score <= 900:
            score = user_provided_score
        else:
            score = cls.CREDIT_HISTORY_MAP.get(credit_history_category, 680)
            
        return {
            "credit_score": score,
            "category": credit_history_category,
            "is_simulated": True,
            "provider_disclaimer": "Demo Mode — Credit score is simulated."
        }
