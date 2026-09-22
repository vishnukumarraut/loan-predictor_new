import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LoanCompare AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Mock modes
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    MOCK_OTP_MODE: bool = True
    PAN_PROVIDER: str = os.getenv("PAN_PROVIDER", "mock")
    CREDIT_PROVIDER: str = os.getenv("CREDIT_PROVIDER", "mock")
    OTP_PROVIDER: str = os.getenv("OTP_PROVIDER", "mock")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "loancompare_ai_super_secret_jwt_key_2026_secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database
    # Default to SQLite zero-setup dev file if MySQL URL is not provided
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./loancompare.db")
    
    # Export directory
    EXPORTS_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "exports")

    class Config:
        case_sensitive = True

settings = Settings()
os.makedirs(settings.EXPORTS_DIR, exist_ok=True)
