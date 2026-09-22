from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.domain import User
from backend.app.schemas.schemas import UserRegister, UserLogin, SendOTPRequest, SendOTPResponse, VerifyOTPRequest, TokenResponse
from backend.app.auth.security import hash_password, verify_password, create_access_token, get_current_user
from backend.app.services.otp_service import MockOTPService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if mobile or email exists
    if db.query(User).filter(User.mobile_number == user_in.mobile_number).first():
        raise HTTPException(status_code=400, detail="Mobile number is already registered.")
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email address is already registered.")

    user = User(
        full_name=user_in.full_name,
        mobile_number=user_in.mobile_number,
        email=user_in.email.lower(),
        password_hash=hash_password(user_in.password),
        role="USER"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "mobile_number": user.mobile_number,
        "role": user.role
    }

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    login_str = login_in.login_id.strip().lower()
    user = db.query(User).filter(
        (User.email == login_str) | (User.mobile_number == login_str)
    ).first()

    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid login credentials.")

    token = create_access_token({"sub": user.id, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "mobile_number": user.mobile_number,
        "role": user.role
    }

@router.post("/send-otp", response_model=SendOTPResponse)
def send_otp(otp_in: SendOTPRequest, db: Session = Depends(get_db)):
    return MockOTPService.send_otp(db, otp_in.mobile_number)

@router.post("/verify-otp")
def verify_otp(verify_in: VerifyOTPRequest, db: Session = Depends(get_db)):
    verified = MockOTPService.verify_otp(db, verify_in.mobile_number, verify_in.otp_code)
    if not verified:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code.")
    return {"success": True, "message": "Mobile number verified successfully."}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "mobile_number": current_user.mobile_number,
        "role": current_user.role,
        "created_at": current_user.created_at
    }
