-- LoanCompare AI Database DDL Schema (MySQL / SQLite Compatible)

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    age INT NOT NULL,
    employment_type VARCHAR(50) NOT NULL,
    employment_tenure_months INT NOT NULL,
    monthly_income DECIMAL(12, 2) NOT NULL,
    has_coapplicant BOOLEAN DEFAULT FALSE,
    coapplicant_monthly_income DECIMAL(12, 2) DEFAULT 0.00,
    dependents INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mobile_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pan_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    pan_number VARCHAR(10) NOT NULL,
    verification_status VARCHAR(30) DEFAULT 'Not Verified',
    verified_name VARCHAR(100),
    is_mock BOOLEAN DEFAULT TRUE,
    verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    consent_given BOOLEAN NOT NULL DEFAULT TRUE,
    purpose VARCHAR(255) NOT NULL,
    consent_version VARCHAR(20) DEFAULT 'v1.0',
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(30) PRIMARY KEY,
    user_id INT NOT NULL,
    status VARCHAR(30) DEFAULT 'DRAFT',
    risk_category VARCHAR(20),
    ml_score DECIMAL(5, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id VARCHAR(30) NOT NULL,
    total_monthly_income DECIMAL(12, 2) NOT NULL,
    existing_emi_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    credit_card_outstanding DECIMAL(12, 2) DEFAULT 0.00,
    credit_history VARCHAR(30) NOT NULL,
    credit_score_simulated INT,
    dti_ratio DECIMAL(5, 2) NOT NULL,
    lti_ratio DECIMAL(5, 2) NOT NULL,
    emi_to_income_ratio DECIMAL(5, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS existing_loans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id VARCHAR(30) NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    original_amount DECIMAL(12, 2) NOT NULL,
    outstanding_amount DECIMAL(12, 2) NOT NULL,
    monthly_emi DECIMAL(12, 2) NOT NULL,
    remaining_tenure_months INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loan_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id VARCHAR(30) NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    requested_amount DECIMAL(12, 2) NOT NULL,
    tenure_months INT NOT NULL,
    purpose VARCHAR(255),
    estimated_emi DECIMAL(12, 2) NOT NULL,
    total_repayment DECIMAL(12, 2) NOT NULL,
    approx_interest DECIMAL(12, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ml_predictions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id VARCHAR(30) NOT NULL,
    risk_category VARCHAR(20) NOT NULL,
    probability_score DECIMAL(5, 2) NOT NULL,
    confidence DECIMAL(5, 2) NOT NULL,
    model_version VARCHAR(20) DEFAULT 'v1.0.0',
    prediction_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ml_explanations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prediction_id INT NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    feature_value VARCHAR(100),
    shap_value DECIMAL(8, 4) NOT NULL,
    impact_type VARCHAR(20) NOT NULL,
    explanation_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS banks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    logo_url TEXT,
    official_website VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    is_demo BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loan_products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bank_id INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    min_age INT DEFAULT 21,
    max_age INT DEFAULT 60,
    min_income DECIMAL(12, 2) NOT NULL,
    min_credit_score INT DEFAULT 650,
    max_dti DECIMAL(5, 2) DEFAULT 50.00,
    min_employment_tenure_months INT DEFAULT 12,
    min_loan_amount DECIMAL(12, 2) NOT NULL,
    max_loan_amount DECIMAL(12, 2) NOT NULL,
    min_tenure_months INT DEFAULT 12,
    max_tenure_months INT DEFAULT 84,
    official_product_url VARCHAR(255),
    is_demo BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loan_criteria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    criteria_key VARCHAR(50) NOT NULL,
    operator VARCHAR(10) NOT NULL,
    value VARCHAR(255) NOT NULL,
    version INT DEFAULT 1,
    effective_from DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eligibility_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id VARCHAR(30) NOT NULL,
    product_id INT NOT NULL,
    match_status VARCHAR(30) NOT NULL,
    matched_criteria_count INT NOT NULL,
    total_criteria_count INT NOT NULL,
    failure_reasons_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS application_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id VARCHAR(30) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    actor_type VARCHAR(20) DEFAULT 'USER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    actor_id INT,
    actor_role VARCHAR(20) DEFAULT 'ADMIN',
    action VARCHAR(100) NOT NULL,
    target_resource VARCHAR(100),
    details_json TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
