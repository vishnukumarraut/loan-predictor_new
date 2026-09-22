from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.auth.security import get_current_user
from backend.app.models.domain import User
from backend.app.schemas.schemas import PANVerifyRequest, PANVerifyResponse
from backend.app.services.pan_service import MockPANVerificationService

router = APIRouter(prefix="/verification", tags=["Verification"])

@router.post("/pan", response_model=PANVerifyResponse)
def verify_pan(request: PANVerifyRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = MockPANVerificationService.verify_pan(db, current_user.id, request.pan_number)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result
