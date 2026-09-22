from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.auth.security import get_current_user
from backend.app.models.domain import User, UserProfile, Consent, PANVerification

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prof = current_user.profile
    pan = current_user.pan_verification
    consents = db.query(Consent).filter(Consent.user_id == current_user.id).order_by(Consent.created_at.desc()).all()
    
    return {
        "user_id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "mobile_number": current_user.mobile_number,
        "role": current_user.role,
        "pan_verification": {
            "pan_number": pan.pan_number if pan else "Not Verified",
            "verification_status": pan.verification_status if pan else "Not Verified",
            "verified_name": pan.verified_name if pan else None,
            "is_mock": pan.is_mock if pan else True
        } if pan else None,
        "profile": {
            "age": prof.age if prof else 30,
            "employment_type": prof.employment_type if prof else "Salaried",
            "employment_tenure_months": prof.employment_tenure_months if prof else 24,
            "monthly_income": prof.monthly_income if prof else 50000.0,
            "has_coapplicant": prof.has_coapplicant if prof else False,
            "coapplicant_monthly_income": prof.coapplicant_monthly_income if prof else 0.0,
            "dependents": prof.dependents if prof else 0
        } if prof else None,
        "consents": [
            {
                "id": c.id,
                "purpose": c.purpose,
                "consent_version": c.consent_version,
                "timestamp": c.created_at
            } for c in consents
        ]
    }
