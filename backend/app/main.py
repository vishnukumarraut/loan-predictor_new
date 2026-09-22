from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.models.domain import Bank, LoanProduct, LoanCriteria, User
from backend.app.auth.security import hash_password
from backend.app.api import (
    auth_routes,
    verification_routes,
    consent_routes,
    application_routes,
    eligibility_routes,
    loan_product_routes,
    profile_routes,
    admin_routes
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="LoanCompare AI — Production-Style Fintech Eligibility Assessment & Bank Matching API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router, prefix=settings.API_V1_STR)
app.include_router(verification_routes.router, prefix=settings.API_V1_STR)
app.include_router(consent_routes.router, prefix=settings.API_V1_STR)
app.include_router(application_routes.router, prefix=settings.API_V1_STR)
app.include_router(eligibility_routes.router, prefix=settings.API_V1_STR)
app.include_router(loan_product_routes.router, prefix=settings.API_V1_STR)
app.include_router(profile_routes.router, prefix=settings.API_V1_STR)
app.include_router(admin_routes.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    # 1. Initialize DB tables
    Base.metadata.create_all(bind=engine)
    
    # 2. Seed initial demo banks and products if empty
    db = SessionLocal()
    try:
        # Check admin user
        admin = db.query(User).filter(User.email == "admin@loancompare.ai").first()
        if not admin:
            admin = User(
                full_name="System Administrator",
                mobile_number="9999999999",
                email="admin@loancompare.ai",
                password_hash=hash_password("admin123"),
                role="ADMIN"
            )
            db.add(admin)
            db.commit()

        if db.query(Bank).count() == 0:
            print("[STARTUP] Seeding initial Indian Banks and Loan Products...")
            b1 = Bank(name="State Bank of India (SBI)", logo_url="https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=120&auto=format&fit=crop", official_website="https://sbi.co.in/", is_demo=True)
            b2 = Bank(name="Punjab National Bank (PNB)", logo_url="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=120&auto=format&fit=crop", official_website="https://www.pnbindia.in/", is_demo=True)
            b3 = Bank(name="Canara Bank", logo_url="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&auto=format&fit=crop", official_website="https://canarabank.com/", is_demo=True)
            b4 = Bank(name="Kotak Mahindra Bank", logo_url="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=120&auto=format&fit=crop", official_website="https://www.kotak.com/", is_demo=True)
            b5 = Bank(name="HDFC Bank", logo_url="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop", official_website="https://www.hdfcbank.com/", is_demo=True)
            
            db.add_all([b1, b2, b3, b4, b5])
            db.commit()

            products = [
                LoanProduct(bank_id=b1.id, product_name="SBI Personal Loan", loan_type="Personal Loan", min_age=21, max_age=60, min_income=25000, min_credit_score=700, max_dti=50, min_employment_tenure_months=12, min_loan_amount=50000, max_loan_amount=2000000, min_tenure_months=12, max_tenure_months=60, official_product_url="https://sbi.co.in/web/personal-banking/loans/personal-loans", is_demo=True),
                LoanProduct(bank_id=b1.id, product_name="SBI Regular Home Loan", loan_type="Home Loan", min_age=23, max_age=65, min_income=30000, min_credit_score=720, max_dti=55, min_employment_tenure_months=24, min_loan_amount=500000, max_loan_amount=10000000, min_tenure_months=60, max_tenure_months=360, official_product_url="https://homeloans.sbi/", is_demo=True),
                LoanProduct(bank_id=b2.id, product_name="PNB Personal Loan", loan_type="Personal Loan", min_age=21, max_age=58, min_income=20000, min_credit_score=680, max_dti=48, min_employment_tenure_months=6, min_loan_amount=50000, max_loan_amount=1500000, min_tenure_months=12, max_tenure_months=72, official_product_url="https://www.pnbindia.in/personal-loan.html", is_demo=True),
                LoanProduct(bank_id=b2.id, product_name="PNB Housing Loan", loan_type="Home Loan", min_age=21, max_age=62, min_income=25000, min_credit_score=700, max_dti=50, min_employment_tenure_months=12, min_loan_amount=500000, max_loan_amount=10000000, min_tenure_months=12, max_tenure_months=360, official_product_url="https://www.pnbindia.in/housing-loan.html", is_demo=True),
                LoanProduct(bank_id=b3.id, product_name="Canara Budget Personal Loan", loan_type="Personal Loan", min_age=18, max_age=45, min_income=22000, min_credit_score=680, max_dti=48, min_employment_tenure_months=12, min_loan_amount=50000, max_loan_amount=1000000, min_tenure_months=12, max_tenure_months=60, official_product_url="https://canarabank.com/personal-loan", is_demo=True),
                LoanProduct(bank_id=b3.id, product_name="Canara Housing Loan", loan_type="Home Loan", min_age=22, max_age=55, min_income=25000, min_credit_score=700, max_dti=50, min_employment_tenure_months=12, min_loan_amount=500000, max_loan_amount=10000000, min_tenure_months=60, max_tenure_months=360, official_product_url="https://canarabank.com/housing-loan", is_demo=True),
                LoanProduct(bank_id=b4.id, product_name="Kotak Personal Loan", loan_type="Personal Loan", min_age=21, max_age=58, min_income=30000, min_credit_score=720, max_dti=45, min_employment_tenure_months=12, min_loan_amount=50000, max_loan_amount=2500000, min_tenure_months=12, max_tenure_months=60, official_product_url="https://www.kotak.com/en/personal-banking/loans/personal-loan.html", is_demo=True),
                LoanProduct(bank_id=b4.id, product_name="Kotak Home Loan", loan_type="Home Loan", min_age=21, max_age=65, min_income=35000, min_credit_score=730, max_dti=50, min_employment_tenure_months=12, min_loan_amount=1000000, max_loan_amount=10000000, min_tenure_months=60, max_tenure_months=360, official_product_url="https://www.kotak.com/en/personal-banking/loans/home-loan.html", is_demo=True),
                LoanProduct(bank_id=b5.id, product_name="HDFC Bank Personal Loan", loan_type="Personal Loan", min_age=21, max_age=60, min_income=25000, min_credit_score=720, max_dti=45, min_employment_tenure_months=12, min_loan_amount=50000, max_loan_amount=4000000, min_tenure_months=12, max_tenure_months=60, official_product_url="https://www.hdfcbank.com/personal/borrow/popular-loans/personal-loan", is_demo=True),
                LoanProduct(bank_id=b5.id, product_name="HDFC Bank Home Loan", loan_type="Home Loan", min_age=21, max_age=65, min_income=30000, min_credit_score=730, max_dti=50, min_employment_tenure_months=12, min_loan_amount=500000, max_loan_amount=10000000, min_tenure_months=60, max_tenure_months=360, official_product_url="https://www.hdfcbank.com/personal/borrow/popular-loans/home-loan", is_demo=True)
            ]
            db.add_all(products)
            db.commit()

            print("[STARTUP] Demo Banks and Loan Products seeded successfully.")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "mock_otp_mode": settings.MOCK_OTP_MODE
    }
