import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.models.domain import OTPSession

class MockOTPService:
    """
    Mock Mobile OTP Provider for Development & Demo.
    In MOCK_OTP_MODE=True:
    - Generates 6-digit OTP
    - Displays/logs OTP clearly for testing
    - Validates countdown expiration (2 minutes)
    """
    
    @staticmethod
    def send_otp(db: Session, mobile_number: str) -> dict:
        # Generate 6-digit OTP
        otp_code = f"{random.randint(100000, 999999)}"
        expires_at = datetime.utcnow() + timedelta(minutes=2)
        
        # Clean old unverified OTP sessions for this mobile
        db.query(OTPSession).filter(
            OTPSession.mobile_number == mobile_number,
            OTPSession.is_verified == False
        ).delete()
        
        session = OTPSession(
            mobile_number=mobile_number,
            otp_code=otp_code,
            expires_at=expires_at,
            is_verified=False,
            attempts=0
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        
        print(f"\n[DEV MOCK OTP SERVICE] Generated OTP for +91-{mobile_number}: {otp_code} (Valid for 120s)\n")
        
        return {
            "success": True,
            "message": "OTP sent successfully to mobile number.",
            "mobile_number": mobile_number,
            "otp_demo_display": otp_code if settings.MOCK_OTP_MODE else None,
            "expires_in_seconds": 120
        }

    @staticmethod
    def verify_otp(db: Session, mobile_number: str, otp_code: str) -> bool:
        session = db.query(OTPSession).filter(
            OTPSession.mobile_number == mobile_number,
            OTPSession.is_verified == False
        ).order_by(OTPSession.created_at.desc()).first()
        
        if not session:
            return False
            
        if datetime.utcnow() > session.expires_at:
            return False
            
        if session.otp_code == otp_code.strip():
            session.is_verified = True
            db.commit()
            return True
            
        session.attempts += 1
        db.commit()
        return False
