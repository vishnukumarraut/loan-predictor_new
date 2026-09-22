/**
 * LoanPredict AI — Google Apps Script for Google Sheets Integration
 * 
 * Instructions:
 * 1. Open your Google Sheet (https://docs.google.com/spreadsheets/create)
 * 2. Click Extensions -> Apps Script
 * 3. Replace all existing script code with this code
 * 4. Click Deploy -> New deployment
 * 5. Select type: Web App
 * 6. Execute as: Me
 * 7. Who has access: Anyone
 * 8. Click Deploy and copy the Web App URL into LoanPredict AI settings!
 */

const SHEET_NAME = "Applications";

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Add Headers if new sheet
    sheet.appendRow([
      "Timestamp",
      "Application ID",
      "Name",
      "Phone Number",
      "PAN (Masked)",
      "Loan Type",
      "Preferred Bank",
      "Income",
      "Loan Amount",
      "Loan Term",
      "Credit History",
      "Prediction",
      "Risk",
      "EMI",
      "DTI"
    ]);
    sheet.getRange(1, 1, 1, 15).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// POST endpoint: Insert a new loan application record
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();
    
    // Mask PAN for security if present (e.g. ABCDE1234F -> ABCDE****F)
    let pan = data.pan || "N/A";
    if (pan.length === 10) {
      pan = pan.substring(0, 5) + "****" + pan.substring(9);
    }

    const row = [
      data.timestamp || new Date().toISOString(),
      data.application_id || "LPA-" + Math.floor(100000 + Math.random() * 900000),
      data.name || "Anonymous Applicant",
      data.phone || "N/A",
      pan,
      data.loan_type || "Personal Loan",
      data.preferred_bank || data.bank_name || "State Bank of India (SBI)",
      data.income || 0,
      data.loan_amount || 0,
      data.loan_term || 0,
      data.credit_history || "Good",
      data.prediction || "Eligible",
      data.risk || "Low",
      data.emi || 0,
      data.dti || 0
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Application logged successfully to Google Sheet.",
      application_id: row[1]
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// GET endpoint: Fetch application summary statistics & bank-wise breakdown
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        total: 0,
        eligible: 0,
        rejected: 0,
        eligibility_rate: 0,
        bank_wise: {},
        loan_types: {},
        applications: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const headers = data[0];
    const rows = data.slice(1);

    let total = rows.length;
    let eligible = 0;
    let rejected = 0;
    const bankWise = {};
    const loanTypes = {};
    const recentApps = [];

    rows.forEach(r => {
      const pred = String(r[11]).toLowerCase();
      const isEligible = pred.includes("eligible") || pred.includes("approved") || pred === "yes" || pred === "true";
      
      if (isEligible) {
        eligible++;
      } else {
        rejected++;
      }

      const lType = r[5] || "Personal Loan";
      loanTypes[lType] = (loanTypes[lType] || 0) + 1;

      const bank = r[6] || "Other Lenders";
      if (!bankWise[bank]) {
        bankWise[bank] = { eligible: 0, rejected: 0, total: 0 };
      }
      bankWise[bank].total++;
      if (isEligible) bankWise[bank].eligible++;
      else bankWise[bank].rejected++;

      // Add to recent applications list (PAN masked)
      if (recentApps.length < 50) {
        recentApps.push({
          timestamp: r[0],
          id: r[1],
          name: r[2],
          phone: r[3],
          pan: r[4],
          loan_type: r[5],
          preferred_bank: r[6],
          income: r[7],
          amount: r[8],
          term: r[9],
          credit: r[10],
          prediction: isEligible ? "Eligible" : "Rejected",
          risk: r[12],
          emi: r[13],
          dti: r[14]
        });
      }
    });

    const eligibilityRate = total > 0 ? Math.round((eligible / total) * 100) : 0;

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      total: total,
      eligible: eligible,
      rejected: rejected,
      eligibility_rate: eligibilityRate,
      bank_wise: bankWise,
      loan_types: loanTypes,
      applications: recentApps
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
