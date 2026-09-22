import re
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.models.domain import PANVerification

class MockPANVerificationService:
    """
    Mock PAN Verification Service.
    Validates PAN format ABCDE1234F.
    Does NOT claim real government or NSDL access.
    Clearly marks verification as Mock/Demo.
    """
    
    PAN_REGEX = r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
    
    @classmethod
    def verify_pan(cls, db: Session, user_id: int, pan_number: str) -> dict:
        pan_clean = pan_number.strip().upper()
        
        if not re.match(cls.PAN_REGEX, pan_clean):
            return {
                "success": False,
                "pan_number": pan_clean,
                "verification_status": "Failed",
                "verified_name": None,
                "is_mock": True,
                "message": "Invalid PAN format. PAN must be 10 characters (e.g. ABCDE1234F)."
            }
            
        # Demo simulation: simulate verified status for valid format
        existing = db.query(PANVerification).filter(PANVerification.user_id == user_id).first()
        if not existing:
            existing = PANVerification(
                user_id=user_id,
                pan_number=pan_clean,
                verification_status="Verified",
                verified_name="Demo User (Simulated)",
                is_mock=True,
                verified_at=datetime.utcnow()
            )
            db.add(existing)
        else:
            existing.pan_number = pan_clean
            existing.verification_status = "Verified"
            existing.verified_name = "Demo User (Simulated)"
            existing.verified_at = datetime.utcnow()
            
        db.commit()
        db.refresh(existing)
        
        return {
            "success": True,
            "pan_number": pan_clean,
            "verification_status": "Verified",
            "verified_name": "Demo User (Simulated)",
            "is_mock": True,
            "message": "PAN verified successfully (Demo Mode)."
        }
