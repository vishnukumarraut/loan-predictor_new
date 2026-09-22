from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.models.domain import Consent

class ConsentService:
    @staticmethod
    def record_consent(db: Session, user_id: int, purpose: str, consent_version: str = "v1.0", ip_address: str = "127.0.0.1") -> Consent:
        consent = Consent(
            user_id=user_id,
            consent_given=True,
            purpose=purpose,
            consent_version=consent_version,
            ip_address=ip_address,
            created_at=datetime.utcnow()
        )
        db.add(consent)
        db.commit()
        db.refresh(consent)
        return consent

    @staticmethod
    def has_valid_consent(db: Session, user_id: int) -> bool:
        consent = db.query(Consent).filter(
            Consent.user_id == user_id,
            Consent.consent_given == True
        ).first()
        return consent is not None
