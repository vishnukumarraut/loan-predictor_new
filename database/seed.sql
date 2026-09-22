-- LoanCompare AI Seed Data (Real Indian Banks with Illustrative / Demo Criteria)

-- Indian Banks
INSERT INTO banks (id, name, logo_url, official_website, status, is_demo) VALUES
(1, 'State Bank of India (SBI)', 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=120&auto=format&fit=crop', 'https://sbi.co.in/', 'ACTIVE', TRUE),
(2, 'Punjab National Bank (PNB)', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=120&auto=format&fit=crop', 'https://www.pnbindia.in/', 'ACTIVE', TRUE),
(3, 'Canara Bank', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&auto=format&fit=crop', 'https://canarabank.com/', 'ACTIVE', TRUE),
(4, 'Kotak Mahindra Bank', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=120&auto=format&fit=crop', 'https://www.kotak.com/', 'ACTIVE', TRUE),
(5, 'HDFC Bank', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop', 'https://www.hdfcbank.com/', 'ACTIVE', TRUE);

-- Real Indian Bank Loan Products (Illustrative Criteria / Demo Data)
INSERT INTO loan_products (id, bank_id, product_name, loan_type, min_age, max_age, min_income, min_credit_score, max_dti, min_employment_tenure_months, min_loan_amount, max_loan_amount, min_tenure_months, max_tenure_months, official_product_url, is_demo) VALUES
(1, 1, 'SBI Personal Loan', 'Personal Loan', 21, 60, 25000.00, 700, 50.00, 12, 50000.00, 2000000.00, 12, 60, 'https://sbi.co.in/web/personal-banking/loans/personal-loans', TRUE),
(2, 1, 'SBI Regular Home Loan', 'Home Loan', 23, 65, 30000.00, 720, 55.00, 24, 500000.00, 10000000.00, 60, 360, 'https://homeloans.sbi/', TRUE),
(3, 2, 'PNB Personal Loan', 'Personal Loan', 21, 58, 20000.00, 680, 48.00, 6, 50000.00, 1500000.00, 12, 72, 'https://www.pnbindia.in/personal-loan.html', TRUE),
(4, 2, 'PNB Housing Loan', 'Home Loan', 21, 62, 25000.00, 700, 50.00, 12, 500000.00, 10000000.00, 12, 360, 'https://www.pnbindia.in/housing-loan.html', TRUE),
(5, 3, 'Canara Budget Personal Loan', 'Personal Loan', 18, 45, 22000.00, 680, 48.00, 12, 50000.00, 1000000.00, 12, 60, 'https://canarabank.com/personal-loan', TRUE),
(6, 3, 'Canara Housing Loan', 'Home Loan', 22, 55, 25000.00, 700, 50.00, 12, 500000.00, 10000000.00, 60, 360, 'https://canarabank.com/housing-loan', TRUE),
(7, 4, 'Kotak Personal Loan', 'Personal Loan', 21, 58, 30000.00, 720, 45.00, 12, 50000.00, 2500000.00, 12, 60, 'https://www.kotak.com/en/personal-banking/loans/personal-loan.html', TRUE),
(8, 4, 'Kotak Home Loan', 'Home Loan', 21, 65, 35000.00, 730, 50.00, 12, 1000000.00, 10000000.00, 60, 360, 'https://www.kotak.com/en/personal-banking/loans/home-loan.html', TRUE),
(9, 5, 'HDFC Bank Personal Loan', 'Personal Loan', 21, 60, 25000.00, 720, 45.00, 12, 50000.00, 4000000.00, 12, 60, 'https://www.hdfcbank.com/personal/borrow/popular-loans/personal-loan', TRUE),
(10, 5, 'HDFC Bank Home Loan', 'Home Loan', 21, 65, 30000.00, 730, 50.00, 12, 500000.00, 10000000.00, 60, 360, 'https://www.hdfcbank.com/personal/borrow/popular-loans/home-loan', TRUE);

-- Demo Criteria Rules
INSERT INTO loan_criteria (id, product_id, rule_name, criteria_key, operator, value, version) VALUES
(1, 1, 'Minimum Monthly Income', 'income', '>=', '25000', 1),
(2, 1, 'Minimum Credit Score', 'credit_score', '>=', '700', 1),
(3, 1, 'Maximum Debt-to-Income', 'dti', '<=', '50', 1),
(4, 1, 'Minimum Employment Tenure', 'employment_tenure', '>=', '12', 1),
(5, 1, 'Loan Amount Limit', 'loan_amount', '<=', '1500000', 1),
(6, 2, 'Minimum Monthly Income', 'income', '>=', '40000', 1),
(7, 2, 'Minimum Credit Score', 'credit_score', '>=', '720', 1),
(8, 2, 'Maximum Debt-to-Income', 'dti', '<=', '55', 1),
(9, 3, 'Minimum Monthly Income', 'income', '>=', '30000', 1),
(10, 3, 'Minimum Credit Score', 'credit_score', '>=', '680', 1);

-- Default Demo Admin User (Password: admin123, stored hashed)
-- We will insert/verify dynamically via python startup script as well
