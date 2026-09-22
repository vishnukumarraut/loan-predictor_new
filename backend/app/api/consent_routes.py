from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.auth.security import get_current_user
from backend.app.models.domain import User, Consent
from backend.app.schemas.schemas import ConsentRequest, ConsentResponse
from backend.app.services.consent_service import ConsentService

router = APIRouter(prefix="/consents", tags=["Consents"])

@router.post("", response_model=ConsentResponse)
def record_consent(req: ConsentRequest, request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    consent = ConsentService.record_consent(
        db=db,
        user_id=current_user.id,
        purpose=req.purpose,
        consent_version=req.consent_version,
        ip_address=client_ip
    )
    return {
        "id": consent.id,
        "user_id": consent.user_id,
        "consent_given": consent.consent_given,
        "purpose": consent.purpose,
        "consent_version": consent.consent_version,
        "timestamp": consent.created_at
    }

@router.get("/status")
def check_consent_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    has_consent = ConsentService.has_valid_consent(db, current_user.id)
    return {"has_consent": has_consent}
