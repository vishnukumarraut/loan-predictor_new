/**
 * LoanPredict AI — main.js
 * Global JS: dark/light toggle, nav, counters, reveal, toast, history, analytics
 */

// ── State & Variables ──────────────────────────────────────────
const THEME_KEY = "lp_theme";
let cachedAnalyticsData = null;

// ── Theme management ───────────────────────────────────────────
function updateChartsTheme(isDark) {
  if (!cachedAnalyticsData || !document.getElementById("chartDonut") || typeof Plotly === "undefined") return;

  const fontColor = isDark ? "#e2e8f0" : "#0f172a";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const layout_patch = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { color: fontColor, family: "Inter, sans-serif" }
  };

  const cfg = { responsive: true, displayModeBar: false };

  try {
    if (cachedAnalyticsData.charts && cachedAnalyticsData.charts.donut) {
      const donutLayout = { ...cachedAnalyticsData.charts.donut.layout, ...layout_patch };
      Plotly.react("chartDonut", cachedAnalyticsData.charts.donut.data, donutLayout, cfg);
    }

    if (cachedAnalyticsData.charts && cachedAnalyticsData.charts.income) {
      const incomeLayout = {
        ...cachedAnalyticsData.charts.income.layout,
        ...layout_patch,
        xaxis: { ...cachedAnalyticsData.charts.income.layout.xaxis, gridcolor: gridColor, color: fontColor },
        yaxis: { ...cachedAnalyticsData.charts.income.layout.yaxis, gridcolor: gridColor, color: fontColor }
      };
      Plotly.react("chartIncome", cachedAnalyticsData.charts.income.data, incomeLayout, cfg);
    }

    if (cachedAnalyticsData.charts && cachedAnalyticsData.charts.credit) {
      const creditLayout = {
        ...cachedAnalyticsData.charts.credit.layout,
        ...layout_patch,
        xaxis: { ...cachedAnalyticsData.charts.credit.layout.xaxis, gridcolor: gridColor, color: fontColor },
        yaxis: { ...cachedAnalyticsData.charts.credit.layout.yaxis, gridcolor: gridColor, color: fontColor }
      };
      Plotly.react("chartCredit", cachedAnalyticsData.charts.credit.data, creditLayout, cfg);
    }

    if (cachedAnalyticsData.charts && cachedAnalyticsData.charts.area) {
      const areaLayout = {
        ...cachedAnalyticsData.charts.area.layout,
        ...layout_patch,
        xaxis: { ...cachedAnalyticsData.charts.area.layout.xaxis, gridcolor: gridColor, color: fontColor },
        yaxis: { ...cachedAnalyticsData.charts.area.layout.yaxis, gridcolor: gridColor, color: fontColor }
      };
      Plotly.react("chartArea", cachedAnalyticsData.charts.area.data, areaLayout, cfg);
    }
  } catch (err) {
    console.error("Plotly theme update error:", err);
  }
}
window.updateChartsTheme = updateChartsTheme;

function applyTheme(isDark) {
  const themeBtn = document.getElementById("themeToggle");
  if (isDark) {
    document.body.classList.remove("light-mode");
    if (themeBtn) themeBtn.textContent = "☀️";
    localStorage.setItem(THEME_KEY, "dark");
  } else {
    document.body.classList.add("light-mode");
    if (themeBtn) themeBtn.textContent = "🌙";
    localStorage.setItem(THEME_KEY, "light");
  }

  updateChartsTheme(isDark);

  // Update slider fill track percentages
  document.querySelectorAll("input[type='range']").forEach(range => {
    const min = parseFloat(range.min) || 0;
    const max = parseFloat(range.max) || 100;
    const val = parseFloat(range.value) || 0;
    const pct = ((val - min) / (max - min)) * 100;
    range.style.setProperty("--pct", pct + "%");
  });
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const isDark = saved !== "light"; // default to dark
  applyTheme(isDark);

  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const currentlyLight = document.body.classList.contains("light-mode");
      applyTheme(currentlyLight); // if currently light, switch to dark (true); if currently dark, switch to light (false)
    });
  }
}

// ── Mobile Nav ─────────────────────────────────────────────────
function initMobileNav() {
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", () => {
      mobileNav.classList.toggle("open");
    });
    document.addEventListener("click", e => {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove("open");
      }
    });
  }
}

// ── Animated counters ──────────────────────────────────────────
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  if (isNaN(target)) return;
  const suffix = el.dataset.suffix || "";
  const prefix = el.dataset.prefix || "";
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
  const duration = 1500;
  const step = 20;
  let current = 0;
  const increment = target / (duration / step);
  const timer = setInterval(() => {
    current = Math.min(current + increment, target);
    el.textContent = prefix + current.toFixed(decimals) + suffix;
    if (current >= target) clearInterval(timer);
  }, step);
}

function initCounters() {
  const elements = document.querySelectorAll("[data-target]");
  if (!elements.length) return;

  if ("IntersectionObserver" in window) {
    const counterObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    elements.forEach(el => counterObs.observe(el));
  } else {
    elements.forEach(el => animateCounter(el));
  }
}

// ── Scroll Reveal ──────────────────────────────────────────────
function initScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  if ("IntersectionObserver" in window) {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => revealObs.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("visible"));
  }
}

// ── Toast notifications ────────────────────────────────────────
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container") || (() => {
    const d = document.createElement("div");
    d.id = "toast-container";
    document.body.appendChild(d);
    return d;
  })();
  const icons = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = "0"; toast.style.transform = "translateX(30px)"; }, 3500);
  setTimeout(() => toast.remove(), 3800);
}
window.showToast = showToast;

// ── Prediction Form & Sliders ──────────────────────────────────
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

function initPredictForm() {
  const predictForm = document.getElementById("predictForm");
  if (!predictForm) return;

  // Range sliders live update
  predictForm.querySelectorAll("input[type='range']").forEach(range => {
    const valEl = document.getElementById(range.id + "_val");
    const update = () => {
      const min = parseFloat(range.min) || 0;
      const max = parseFloat(range.max) || 100;
      const val = parseFloat(range.value) || 0;
      const pct = ((val - min) / (max - min)) * 100;
      range.style.setProperty("--pct", pct + "%");
      if (valEl) {
        const prefix = range.dataset.prefix || "";
        const suffix = range.dataset.suffix || "";
        valEl.textContent = prefix + Number(val).toLocaleString('en-IN') + suffix;
      }
    };
    range.addEventListener("input", update);
    update();
  });

  // PAN uppercase auto-format
  const panInput = document.getElementById("pan_number");
  if (panInput) {
    panInput.addEventListener("input", e => {
      e.target.value = e.target.value.toUpperCase();
    });
  }

  // Google Sheets integration setup
  const savedSheetUrl = localStorage.getItem("lp_google_sheet_url") || "";
  const sheetUrlInput = document.getElementById("googleSheetUrl");
  const saveSheetBtn = document.getElementById("saveSheetUrlBtn");
  const syncSheetBtn = document.getElementById("syncSheetDataBtn");
  const sheetBadge = document.getElementById("sheetsStatusBadge");

  if (sheetUrlInput && savedSheetUrl) {
    sheetUrlInput.value = savedSheetUrl;
    if (sheetBadge) {
      sheetBadge.textContent = "Status: Connected Endpoint";
      sheetBadge.className = "badge badge-green";
    }
  }

  if (saveSheetBtn) {
    saveSheetBtn.addEventListener("click", () => {
      const url = sheetUrlInput ? sheetUrlInput.value.trim() : "";
      if (url) {
        localStorage.setItem("lp_google_sheet_url", url);
        if (sheetBadge) {
          sheetBadge.textContent = "Status: Connected Endpoint";
          sheetBadge.className = "badge badge-green";
        }
        showToast("Google Sheet Web App endpoint saved!", "success");
      } else {
        localStorage.removeItem("lp_google_sheet_url");
        if (sheetBadge) {
          sheetBadge.textContent = "Status: Disconnected / Ready";
          sheetBadge.className = "badge badge-purple";
        }
        showToast("Google Sheet endpoint cleared.", "info");
      }
    });
  }

  if (syncSheetBtn) {
    syncSheetBtn.addEventListener("click", async () => {
      const url = localStorage.getItem("lp_google_sheet_url");
      if (!url) {
        showToast("Please save your Google Apps Script Web App URL first.", "warning");
        return;
      }
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (json && json.success) {
          showToast(`Synced ${json.total} records from Google Sheet!`, "success");
          if (json.bank_wise) {
            renderAnalysisCharts({
              is_demo_data: false,
              total_applications: json.total,
              eligible_applications: json.eligible,
              rejected_applications: json.rejected,
              eligible_percentage: json.eligibility_rate,
              rejected_percentage: 100 - json.eligibility_rate,
              bank_wise: json.bank_wise
            });
          }
        }
      } catch (err) {
        showToast("Failed to fetch Google Sheet data. Check CORS or URL.", "error");
      }
    });
  }

  // Submit
  predictForm.addEventListener("submit", async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(predictForm));

    // Validate PAN
    if (data.pan_number && !PAN_REGEX.test(data.pan_number.trim().toUpperCase())) {
      showToast("Invalid PAN format! Example valid format: ABCDE1234F", "error");
      return;
    }

    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("active");

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (overlay) overlay.classList.remove("active");

      if (json.success) {
        renderResult(json.result, json.analysis);
        const resSec = document.getElementById("resultSection");
        if (resSec) resSec.scrollIntoView({ behavior: "smooth" });

        // Post to Google Sheet if Web App URL configured
        const sheetEndpoint = localStorage.getItem("lp_google_sheet_url");
        if (sheetEndpoint) {
          sendToGoogleSheet(sheetEndpoint, data, json.result);
        }
      } else {
        showToast("Prediction failed: " + (json.error || "Unknown error"), "error");
      }
    } catch (err) {
      if (overlay) overlay.classList.remove("active");
      showToast("Network error. Please try again.", "error");
    }
  });

  // Reset
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      predictForm.reset();
      predictForm.querySelectorAll("input[type='range']").forEach(r => r.dispatchEvent(new Event("input")));
      const rs = document.getElementById("resultSection");
      if (rs) rs.style.display = "none";
      showToast("Form reset.", "info");
    });
  }
}

// ── Send Application to Google Sheets Endpoint ─────────────────
async function sendToGoogleSheet(endpointUrl, formData, result) {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      application_id: result.application_id || "LPA-" + Math.floor(Math.random() * 900000),
      name: formData.applicant_name || "Applicant",
      phone: formData.phone_number || "N/A",
      pan: formData.pan_number || "N/A",
      loan_type: formData.loan_type || "Personal Loan",
      preferred_bank: formData.preferred_bank || formData.bank_name || "State Bank of India (SBI)",
      bank_name: formData.preferred_bank || (result.matched_products && result.matched_products.length > 0 ? result.matched_products[0].bank_name : "State Bank of India (SBI)"),
      income: formData.applicant_income || 0,
      loan_amount: formData.loan_amount || 0,
      loan_term: formData.loan_term || 0,
      credit_history: formData.credit_history || "Yes",
      prediction: result.approved ? "Eligible" : "Rejected",
      risk: result.risk_level || "Low",
      emi: result.estimated_emi || 0,
      dti: result.dti || 0
    };

    await fetch(endpointUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    showToast("Application logged to Google Sheet!", "info");
  } catch (err) {
    console.error("Google Sheet POST error:", err);
  }
}

// ── Render Full Result, Indian Bank Cards & Visualizations ────
function renderResult(r, analysisData) {
  const section = document.getElementById("resultSection");
  if (!section) return;

  const riskClass = { Low: "risk-low", Medium: "risk-medium", High: "risk-high" }[r.risk_level] || "";
  const gradColor = r.approved
    ? "linear-gradient(90deg, #34d399, #22d3ee)"
    : "linear-gradient(90deg, #f87171, #a855f7)";

  const matchedProds = r.matched_products || [];
  window._currentMatchedProducts = matchedProds;
  window._lastResult = r;

  section.innerHTML = `
    <!-- 1. APPLICANT RESULT -->
    <div class="result-wrapper glass-card mb-5" style="overflow:hidden">
      <div class="result-header ${r.approved ? 'approved' : 'rejected'}">
        <div class="result-icon-ring ${r.approved ? 'approved' : 'rejected'}">
          ${r.approved ? '✅' : '❌'}
        </div>
        <div class="result-status ${r.approved ? 'approved' : 'rejected'}">
          ${r.approved ? 'Loan Profile Eligible!' : 'Profile Criteria Not Met'}
        </div>
        <div class="result-sub">Application ID: ${r.application_id || 'LPA-2026'} &bull; ${r.timestamp}</div>
      </div>

      <div style="padding:1.75rem">
        <!-- Applicant Info Pill Bar -->
        <div class="d-flex align-center justify-between flex-wrap gap-2 mb-3 p-3 rounded-lg" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);font-size:0.875rem">
          <div>👤 <strong>Applicant:</strong> ${r.applicant_name || 'Valued Applicant'}</div>
          <div>🔒 <strong>PAN (Masked):</strong> <span class="badge badge-purple">${r.masked_pan || 'ABCDE****F'}</span></div>
          <div>🏷️ <strong>Loan Type:</strong> <span class="badge badge-blue">${r.loan_type || 'Personal Loan'}</span></div>
          <div>🏛️ <strong>Preferred Bank:</strong> <span class="badge badge-purple">${r.preferred_bank || 'State Bank of India (SBI)'}</span></div>
          <div>💼 <strong>Est. EMI:</strong> <span style="color:var(--cyan);font-weight:700">₹${(r.estimated_emi || 0).toLocaleString('en-IN')}/mo</span></div>
        </div>

        <!-- probability bar -->
        <div class="d-flex align-center justify-between mb-1">
          <span style="font-size:.85rem;color:var(--text-secondary)">AI Match Probability</span>
          <span class="range-val">${r.probability}%</span>
        </div>
        <div class="prob-bar-wrap mb-3">
          <div class="prob-bar-fill" style="width:0%;background:${gradColor}" id="probBar"></div>
        </div>

        <div class="result-metrics mb-3">
          <div class="metric-item">
            <div class="metric-value" style="background:${gradColor};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
              ${r.probability}%
            </div>
            <div class="metric-label">Approval Probability</div>
          </div>
          <div class="metric-item">
            <div class="metric-value ${riskClass}">${r.risk_level}</div>
            <div class="metric-label">Risk Tier</div>
          </div>
          <div class="metric-item">
            <div class="metric-value" style="color:var(--blue)">${r.confidence}%</div>
            <div class="metric-label">Model Confidence</div>
          </div>
        </div>

        <div class="recommendation-box mb-3">
          <strong>💡 Actionable Recommendation:</strong> ${r.recommendation}
        </div>

        <div class="d-flex gap-2 flex-wrap">
          <button class="btn-primary" onclick="downloadReport()">⬇️ Download PDF Report</button>
          <button class="btn-secondary" onclick="document.getElementById('predictForm').scrollIntoView({behavior:'smooth'})">
            🔄 Modify Application
          </button>
        </div>
      </div>
    </div>

    <!-- 2. LOAN PRODUCTS MATCHING YOUR PROFILE -->
    <div class="mb-5">
      <div class="d-flex align-center justify-between flex-wrap gap-2 mb-3">
        <div>
          <h2 style="font-size:1.4rem;color:#fff">Loan Products Matching Your Profile</h2>
          <p style="color:var(--text-secondary);font-size:0.85rem">Evaluated against illustrative criteria for real Indian Banks</p>
        </div>
        <span class="badge badge-blue" style="font-size:0.8rem">${matchedProds.length} Lenders Evaluated</span>
      </div>

      <!-- Filter tabs -->
      <div class="d-flex gap-2 mb-4">
        <button class="btn-secondary active-tab" id="filterAllBtn" onclick="filterBankCards('all', this)" style="padding:0.4rem 1rem;font-size:0.8rem">All Evaluated (${matchedProds.length})</button>
        <button class="btn-secondary" id="filterTypeBtn" onclick="filterBankCards('type', this)" style="padding:0.4rem 1rem;font-size:0.8rem">${r.loan_type || 'Personal Loan'} Products</button>
        <button class="btn-secondary" id="filterMatchedBtn" onclick="filterBankCards('matched', this)" style="padding:0.4rem 1rem;font-size:0.8rem">Matched Only</button>
      </div>

      <div class="grid-cards" id="bankProductsGrid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:1.25rem">
        ${renderBankCardsHTML(matchedProds)}
      </div>
    </div>

    <!-- 3. LOAN APPLICATION ANALYSIS & DATA VISUALIZATION -->
    <div class="glass-card mb-5" style="padding:2rem">
      <div class="d-flex align-center justify-between flex-wrap gap-2 mb-3">
        <div>
          <h2 style="font-size:1.3rem;color:#fff">Loan Application Analysis</h2>
          <p style="color:var(--text-secondary);font-size:0.85rem">
            Overall system metrics for Eligible vs. Rejected Applications
            ${analysisData && analysisData.is_demo_data ? '<span class="badge badge-yellow" style="margin-left:0.5rem">Illustrative Demo Data</span>' : '<span class="badge badge-green" style="margin-left:0.5rem">Live Application Data</span>'}
          </p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:1.5rem;align-items:center">
        <!-- Donut Chart -->
        <div id="analysisDonutChart" style="height:280px;width:100%"></div>

        <!-- Metric Cards -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="p-3 rounded-lg text-center" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25)">
            <div style="font-size:0.75rem;color:#a7f3d0;text-transform:uppercase;font-weight:700">Eligible Applications</div>
            <div style="font-size:2rem;font-weight:800;color:#34d399" id="eligibleCountVal">
              ${analysisData ? analysisData.eligible_applications : 72}
            </div>
            <div style="font-size:0.8rem;color:var(--text-secondary)" id="eligiblePctVal">
              ${analysisData ? analysisData.eligible_percentage : 72}% of Total
            </div>
          </div>

          <div class="p-3 rounded-lg text-center" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25)">
            <div style="font-size:0.75rem;color:#fca5a5;text-transform:uppercase;font-weight:700">Rejected Applications</div>
            <div style="font-size:2rem;font-weight:800;color:#f87171" id="rejectedCountVal">
              ${analysisData ? analysisData.rejected_applications : 28}
            </div>
            <div style="font-size:0.8rem;color:var(--text-secondary)" id="rejectedPctVal">
              ${analysisData ? analysisData.rejected_percentage : 28}% of Total
            </div>
          </div>

          <div class="p-3 rounded-lg text-center" style="grid-column:span 2;background:rgba(79,142,247,0.08);border:1px solid rgba(79,142,247,0.25)">
            <div style="font-size:0.75rem;color:#93c5fd;text-transform:uppercase;font-weight:700">Total Applications Evaluated</div>
            <div style="font-size:2.2rem;font-weight:800;color:#60a5fa" id="totalCountVal">
              ${analysisData ? analysisData.total_applications : 100}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. BANK-WISE LOAN APPLICATION VISUALIZATION -->
    <div class="glass-card mb-5" style="padding:2rem">
      <div class="mb-3">
        <h2 style="font-size:1.3rem;color:#fff">Bank-wise Loan Applications</h2>
        <p style="color:var(--text-secondary);font-size:0.85rem">Comparative breakdown of matched and rejected applications across Indian Banks</p>
      </div>
      <div id="bankWiseBarChart" style="height:350px;width:100%"></div>
    </div>
  `;

  section.style.display = "block";

  // Animate probability bar
  requestAnimationFrame(() => {
    setTimeout(() => {
      const bar = document.getElementById("probBar");
      if (bar) bar.style.width = r.probability + "%";
    }, 120);
  });

  // Render Charts
  renderAnalysisCharts(analysisData);

  // Store for PDF download
  window._lastResult = r;
  loadHistory();
}

// ── Bank Cards HTML Generator ──────────────────────────────────
function renderBankCardsHTML(products) {
  if (!products || products.length === 0) {
    return `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:2rem">No matching bank products found.</div>`;
  }

  return products.map(p => {
    const isMatched = p.match_status === "MATCHED";
    const isPartial = p.match_status === "PARTIALLY_MATCHED";

    const badgeClass = isMatched
      ? "badge-green"
      : isPartial
      ? "badge-yellow"
      : "badge-red";

    const badgeLabel = `${p.matched_criteria_count}/${p.total_criteria_count} Criteria Matched`;
    const initials = p.bank_name.replace(/[^A-Z]/g, '').substring(0, 3) || "BNK";

    return `
      <div class="glass-card p-4 d-flex flex-col justify-between bank-card-item" data-type="${p.loan_type}" data-status="${p.match_status}" style="border:1px solid rgba(255,255,255,0.08);position:relative">
        <div>
          <div class="d-flex align-center justify-between mb-2">
            <div class="d-flex align-center gap-2">
              <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;color:#fff;box-shadow:0 2px 8px rgba(59,130,246,0.3)">
                ${initials}
              </div>
              <div>
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;font-weight:600">${p.bank_name}</div>
                <h4 style="font-size:0.95rem;color:#fff;font-weight:700;margin:0">${p.product_name}</h4>
              </div>
            </div>
          </div>

          <div class="d-flex align-center justify-between mb-3">
            <span class="badge badge-blue" style="font-size:0.7rem">${p.loan_type}</span>
            <span class="badge ${badgeClass}" style="font-size:0.7rem">${badgeLabel}</span>
          </div>

          <div class="p-2.5 rounded mb-3" style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.05);font-size:0.8rem;display:grid;grid-template-columns:1fr 1fr;gap:0.5rem">
            <div>
              <div style="color:var(--text-muted);font-size:0.7rem">Indicative Rate</div>
              <div style="color:#60a5fa;font-weight:700">${p.interest_rate_range}</div>
            </div>
            <div>
              <div style="color:var(--text-muted);font-size:0.7rem">Estimated EMI</div>
              <div style="color:#34d399;font-weight:700">₹${(p.estimated_emi || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>

          ${p.unmatched_criteria && p.unmatched_criteria.length > 0 ? `
            <div class="p-2 rounded mb-3" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);font-size:0.75rem;color:#fca5a5">
              <strong>Unmatched Criteria:</strong>
              <ul style="margin:0.25rem 0 0 1rem;padding:0">
                ${p.unmatched_criteria.map(u => `<li>${u}</li>`).join('')}
              </ul>
            </div>
          ` : `
            <div class="p-2 rounded mb-3" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);font-size:0.75rem;color:#6ee7b7">
              ✅ Profile matches all published lender criteria!
            </div>
          `}
        </div>

        <div class="d-flex gap-2 pt-2" style="border-t:1px solid rgba(255,255,255,0.08)">
          <button class="btn-secondary" style="flex:1;padding:0.4rem 0.6rem;font-size:0.75rem" onclick="openProductModal('${p.product_name}')">
            View Details
          </button>
          <a href="${p.official_url}" target="_blank" rel="noreferrer" class="btn-primary" style="flex:1;padding:0.4rem 0.6rem;font-size:0.75rem;text-align:center;text-decoration:none">
            Apply on Bank ↗
          </a>
        </div>
      </div>
    `;
  }).join('');
}

// ── Filter Bank Cards Function ─────────────────────────────────
function filterBankCards(filterType, btnEl) {
  document.querySelectorAll(".active-tab").forEach(b => b.classList.remove("active-tab"));
  if (btnEl) btnEl.classList.add("active-tab");

  const cards = document.querySelectorAll(".bank-card-item");
  const currentLType = (window._lastResult && window._lastResult.loan_type) || "Personal Loan";

  cards.forEach(card => {
    const lType = card.dataset.type;
    const status = card.dataset.status;

    if (filterType === "all") {
      card.style.display = "flex";
    } else if (filterType === "type") {
      card.style.display = (lType === currentLType) ? "flex" : "none";
    } else if (filterType === "matched") {
      card.style.display = (status === "MATCHED") ? "flex" : "none";
    }
  });
}
window.filterBankCards = filterBankCards;

// ── Modal popup for Bank Details ──────────────────────────────
function openProductModal(productName) {
  const prods = window._currentMatchedProducts || [];
  const prod = prods.find(p => p.product_name === productName);
  if (!prod) return;

  const container = document.getElementById("productModalContainer");
  if (!container) return;

  container.innerHTML = `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(6px);z-index:999;display:flex;align-items:center;justify-content:center;padding:1rem" onclick="if(event.target===this)closeProductModal()">
      <div class="glass-card" style="max-width:550px;width:100%;padding:2rem;position:relative;background:#0f172a;border:1px solid rgba(255,255,255,0.15)">
        <button onclick="closeProductModal()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;color:#94a3b8;font-size:1.5rem;cursor:pointer">&times;</button>
        
        <div style="font-size:0.8rem;color:var(--blue);text-transform:uppercase;font-weight:700">${prod.bank_name}</div>
        <h3 style="font-size:1.4rem;color:#fff;margin:0.25rem 0 1rem 0">${prod.product_name}</h3>

        <div class="p-3 rounded mb-3" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;font-size:0.85rem">
          <div><span style="color:var(--text-muted)">Loan Type:</span> <strong style="color:#fff">${prod.loan_type}</strong></div>
          <div><span style="color:var(--text-muted)">Indicative Rate:</span> <strong style="color:#60a5fa">${prod.interest_rate_range}</strong></div>
          <div><span style="color:var(--text-muted)">Estimated EMI:</span> <strong style="color:#34d399">₹${(prod.estimated_emi || 0).toLocaleString('en-IN')}/mo</strong></div>
          <div><span style="color:var(--text-muted)">Criteria Match:</span> <strong style="color:#a7f3d0">${prod.matched_criteria_count}/${prod.total_criteria_count}</strong></div>
        </div>

        <h4 style="font-size:0.9rem;color:#e2e8f0;margin-bottom:0.5rem">Criteria Evaluation Breakdown</h4>
        ${prod.unmatched_criteria && prod.unmatched_criteria.length > 0 ? `
          <div class="p-3 rounded mb-4" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#fca5a5;font-size:0.85rem">
            <strong>Unmatched Criteria Reasons:</strong>
            <ul style="margin:0.5rem 0 0 1.25rem;padding:0">
              ${prod.unmatched_criteria.map(u => `<li>${u}</li>`).join('')}
            </ul>
          </div>
        ` : `
          <div class="p-3 rounded mb-4" style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);color:#6ee7b7;font-size:0.85rem">
            ✅ Profile satisfies all income, credit score, debt-to-income, and ML risk constraints!
          </div>
        `}

        <div class="p-2 rounded mb-4" style="background:rgba(255,255,255,0.02);font-size:0.75rem;color:var(--text-muted)">
          ℹ️ <em>Illustrative Bank Criteria (Demo Data)</em> &mdash; Final approval rests with lender verification.
        </div>

        <div class="d-flex justify-end gap-2">
          <button class="btn-secondary" onclick="closeProductModal()">Close</button>
          <a href="${prod.official_url}" target="_blank" rel="noreferrer" class="btn-primary" style="text-decoration:none">
            Visit Official Lender Website ↗
          </a>
        </div>
      </div>
    </div>
  `;
}
window.openProductModal = openProductModal;

function closeProductModal() {
  const container = document.getElementById("productModalContainer");
  if (container) container.innerHTML = "";
}
window.closeProductModal = closeProductModal;

// ── Render Plotly Analysis Charts ──────────────────────────────
function renderAnalysisCharts(data) {
  if (typeof Plotly === "undefined") return;

  const fontColor = "#e2e8f0";
  const layoutBase = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { color: fontColor, family: "Inter, sans-serif" },
    margin: { t: 30, b: 30, l: 30, r: 30 }
  };

  // 1. Donut Chart: Eligible vs Rejected
  const donutContainer = document.getElementById("analysisDonutChart");
  if (donutContainer) {
    const elCount = data ? data.eligible_applications : 72;
    const rejCount = data ? data.rejected_applications : 28;

    const donutData = [{
      labels: ["Eligible Applications", "Rejected Applications"],
      values: [elCount, rejCount],
      type: "pie",
      hole: 0.6,
      marker: { colors: ["#10b981", "#ef4444"] },
      textinfo: "percent+label",
      textposition: "inside",
      insidetextfont: { color: "#ffffff", size: 12 }
    }];

    const donutLayout = {
      ...layoutBase,
      showlegend: false,
      annotations: [{
        font: { size: 16, color: "#ffffff", weight: "bold" },
        showarrow: false,
        text: `<b>${elCount + rejCount}</b><br><span style="font-size:11px;color:#94a3b8">Total Apps</span>`,
        x: 0.5, y: 0.5
      }]
    };

    Plotly.react("analysisDonutChart", donutData, donutLayout, { responsive: true, displayModeBar: false });
  }

  // 2. Bank-wise Applications Stacked Bar Chart
  const barContainer = document.getElementById("bankWiseBarChart");
  if (barContainer) {
    const bankWise = (data && data.bank_wise) ? data.bank_wise : {
      "State Bank of India (SBI)": { eligible: 18, rejected: 4 },
      "Punjab National Bank (PNB)": { eligible: 12, rejected: 5 },
      "Bank of Baroda": { eligible: 10, rejected: 3 },
      "Canara Bank": { eligible: 9, rejected: 4 },
      "Kotak Mahindra Bank": { eligible: 8, rejected: 4 },
      "HDFC Bank": { eligible: 15, rejected: 8 },
      "ICICI Bank": { eligible: 14, rejected: 6 },
      "Axis Bank": { eligible: 11, rejected: 5 }
    };

    const banks = Object.keys(bankWise);
    const eligibleVals = banks.map(b => bankWise[b].eligible || 0);
    const rejectedVals = banks.map(b => bankWise[b].rejected || 0);

    const barData = [
      {
        x: banks,
        y: eligibleVals,
        name: "Eligible",
        type: "bar",
        marker: { color: "#10b981" }
      },
      {
        x: banks,
        y: rejectedVals,
        name: "Rejected",
        type: "bar",
        marker: { color: "#ef4444" }
      }
    ];

    const barLayout = {
      ...layoutBase,
      barmode: "stack",
      xaxis: { gridcolor: "rgba(255,255,255,0.08)", color: fontColor, tickangle: -20 },
      yaxis: { gridcolor: "rgba(255,255,255,0.08)", color: fontColor, title: "Applications" },
      legend: { orientation: "h", y: 1.15, x: 0 }
    };

    Plotly.react("bankWiseBarChart", barData, barLayout, { responsive: true, displayModeBar: false });
  }
}

// ── Prediction history table ───────────────────────────────────
async function loadHistory() {
  const tbody = document.getElementById("historyBody");
  if (!tbody) return;

  try {
    const res = await fetch("/api/history");
    const json = await res.json();

    if (!json.success || !json.history) return;

    if (json.history.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center;color:var(--text-muted);padding:1.5rem">
            No predictions recorded in this session yet.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = json.history.map(h => `
      <tr>
        <td><strong>${h.application_id || '#' + h.id}</strong></td>
        <td>${h.applicant_name || 'Applicant'}</td>
        <td><span class="badge badge-purple">${h.masked_pan || h.pan_number || 'ABCDE****F'}</span></td>
        <td>${h.loan_type || 'Personal Loan'}</td>
        <td>₹${Number(h.applicant_income || 0).toLocaleString('en-IN')}</td>
        <td>₹${Number(h.loan_amount || 0).toLocaleString('en-IN')}</td>
        <td>
          <span class="badge ${h.approved ? 'badge-green' : 'badge-red'}">
            ${h.approved ? 'Eligible' : 'Rejected'}
          </span>
        </td>
        <td>${h.probability}%</td>
        <td>
          <span class="badge ${
            h.risk_level === 'Low'
              ? 'badge-green'
              : h.risk_level === 'Medium'
              ? 'badge-yellow'
              : 'badge-red'
          }">
            ${h.risk_level}
          </span>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("History Error:", err);
  }
}
window.loadHistory = loadHistory;

// ── Download report (PDF via browser print) ────────────────────
function downloadReport() {
  const r = window._lastResult;
  if (!r) return;
  const win = window.open("", "_blank");
  win.document.write(`
    <html><head><title>LoanPredict AI — Eligibility & Matching Report</title>
    <style>
      body{font-family:sans-serif;padding:40px;color:#111;max-width:750px;margin:0 auto}
      h1{color:#3b82f6}
      .badge{display:inline-block;padding:4px 12px;border-radius:999px;font-weight:700;font-size:1.1rem}
      .approved{background:#dcfce7;color:#16a34a}
      .rejected{background:#fee2e2;color:#dc2626}
      table{width:100%;border-collapse:collapse;margin:16px 0}
      td,th{padding:8px 12px;border:1px solid #e5e7eb;font-size:.9rem}
      th{background:#f9fafb;font-weight:600}
    </style></head><body>
    <h1>🏦 LoanPredict AI — Eligibility &amp; Matching Report</h1>
    <p><strong>Application ID:</strong> ${r.application_id || 'LPA-2026'} &bull; Generated: ${r.timestamp}</p>
    <p><strong>Applicant:</strong> ${r.applicant_name || 'Valued Applicant'} &bull; <strong>PAN (Masked):</strong> ${r.masked_pan || 'ABCDE****F'}</p>
    <h2>Eligibility Status: <span class="badge ${r.approved?'approved':'rejected'}">${r.approved?'✅ PROFILE ELIGIBLE':'❌ PROFILE CRITERIA NOT MET'}</span></h2>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Loan Type Requested</td><td>${r.loan_type || 'Personal Loan'}</td></tr>
      <tr><td>Match Probability</td><td>${r.probability}%</td></tr>
      <tr><td>Risk Tier</td><td>${r.risk_level}</td></tr>
      <tr><td>Model Confidence Score</td><td>${r.confidence}%</td></tr>
      <tr><td>Estimated Monthly EMI</td><td>₹${(r.estimated_emi || 0).toLocaleString('en-IN')}</td></tr>
    </table>
    <h3>Recommendation</h3>
    <p>${r.recommendation}</p>
    <hr><p style="color:#888;font-size:.8rem">LoanPredict AI &mdash; Illustrative Bank Criteria (Demo Data). For demonstration purposes only.</p>
    </body></html>`);
  win.document.close();
  win.print();
}
window.downloadReport = downloadReport;

// ── Analytics dashboard ────────────────────────────────────────
async function loadAnalytics() {
  if (!document.getElementById("chartDonut")) return;
  try {
    const res = await fetch("/api/analytics");
    const json = await res.json();
    if (!json.success) return;

    cachedAnalyticsData = json;
    const isDark = !document.body.classList.contains("light-mode");
    updateChartsTheme(isDark);

    const k = json.kpis;
    if (k) {
      const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
          el.dataset.target = val;
          animateCounter(el);
        }
      };
      set("kpiTotal",    k.total);
      set("kpiApproved", k.approved);
      set("kpiRate",     k.approval_rate);
      set("kpiIncome",   k.avg_income);
      set("kpiLoan",     k.avg_loan);
    }
  } catch(e) {
    console.error("Analytics load error:", e);
  }
}

// ── Bank Details Modal for Partner Banks Section ───────────────
function showBankModal(bankName) {
  const container = document.getElementById("productModalContainer");
  if (!container) return;

  const bankRates = {
    "State Bank of India (SBI)": { rate: "8.50% - 13.50% p.a.", personal: "10.50% p.a.", home: "8.50% p.a.", url: "https://sbi.co.in/" },
    "Punjab National Bank (PNB)": { rate: "8.40% - 14.00% p.a.", personal: "10.40% p.a.", home: "8.40% p.a.", url: "https://www.pnbindia.in/" },
    "Bank of Baroda": { rate: "8.50% - 14.25% p.a.", personal: "10.85% p.a.", home: "8.50% p.a.", url: "https://www.bankofbaroda.in/" },
    "Canara Bank": { rate: "8.40% - 13.90% p.a.", personal: "10.95% p.a.", home: "8.40% p.a.", url: "https://canarabank.com/" },
    "Union Bank of India": { rate: "8.50% - 13.75% p.a.", personal: "10.35% p.a.", home: "8.50% p.a.", url: "https://www.unionbankofindia.co.in/" },
    "Bank of India": { rate: "8.45% - 13.25% p.a.", personal: "10.35% p.a.", home: "8.45% p.a.", url: "https://bankofindia.co.in/" },
    "Indian Bank": { rate: "8.50% - 13.50% p.a.", personal: "10.25% p.a.", home: "8.50% p.a.", url: "https://www.indianbank.in/" },
    "Central Bank of India": { rate: "8.50% - 13.50% p.a.", personal: "10.40% p.a.", home: "8.50% p.a.", url: "https://www.centralbankofindia.co.in/" },
    "UCO Bank": { rate: "8.60% - 13.80% p.a.", personal: "10.50% p.a.", home: "8.60% p.a.", url: "https://www.ucobank.com/" },
    "Bank of Maharashtra": { rate: "8.40% - 13.25% p.a.", personal: "10.25% p.a.", home: "8.40% p.a.", url: "https://bankofmaharashtra.in/" },
    "Kotak Mahindra Bank": { rate: "10.99% - 16.00% p.a.", personal: "10.99% p.a.", home: "8.75% p.a.", url: "https://www.kotak.com/" },
    "HDFC Bank": { rate: "8.70% - 15.00% p.a.", personal: "10.50% p.a.", home: "8.70% p.a.", url: "https://www.hdfcbank.com/" },
    "ICICI Bank": { rate: "8.75% - 15.50% p.a.", personal: "10.80% p.a.", home: "8.75% p.a.", url: "https://www.icicibank.com/" },
    "Axis Bank": { rate: "8.75% - 14.75% p.a.", personal: "10.75% p.a.", home: "8.75% p.a.", url: "https://www.axisbank.com/" },
    "IDFC FIRST Bank": { rate: "10.49% - 15.25% p.a.", personal: "10.49% p.a.", home: "8.85% p.a.", url: "https://www.idfcfirstbank.com/" },
    "IndusInd Bank": { rate: "10.50% - 18.00% p.a.", personal: "10.50% p.a.", home: "8.90% p.a.", url: "https://www.indusind.com/" }
  };

  const info = bankRates[bankName] || { rate: "8.50% - 14.00% p.a.", personal: "10.50% p.a.", home: "8.50% p.a.", url: "#" };

  container.innerHTML = `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(6px);z-index:999;display:flex;align-items:center;justify-content:center;padding:1rem" onclick="if(event.target===this)closeProductModal()">
      <div class="glass-card" style="max-width:520px;width:100%;padding:2rem;position:relative;background:#0f172a;border:1px solid rgba(255,255,255,0.15)">
        <button onclick="closeProductModal()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;color:#94a3b8;font-size:1.5rem;cursor:pointer">&times;</button>
        
        <div style="font-size:0.8rem;color:var(--cyan);text-transform:uppercase;font-weight:700">🏛️ Indian Banking Partner</div>
        <h3 style="font-size:1.35rem;color:#fff;margin:0.25rem 0 1rem 0">${bankName}</h3>

        <div class="p-3 rounded mb-3" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;font-size:0.85rem">
          <div><span style="color:var(--text-muted)">Indicative Rates:</span> <strong style="color:#60a5fa">${info.rate}</strong></div>
          <div><span style="color:var(--text-muted)">Personal Loan:</span> <strong style="color:#34d399">From ${info.personal}</strong></div>
          <div><span style="color:var(--text-muted)">Home Loan:</span> <strong style="color:#a7f3d0">From ${info.home}</strong></div>
          <div><span style="color:var(--text-muted)">Status:</span> <strong style="color:#60a5fa">Active Lender</strong></div>
        </div>

        <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:1.25rem">
          ${bankName} offers multiple retail credit products including Personal Loans, Home Loans, Vehicle Loans, and Business Loans with flexible repayment tenures up to 30 years.
        </p>

        <div class="p-2 rounded mb-4" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);font-size:0.75rem;color:var(--text-muted)">
          ℹ️ <em>Bank information and eligibility criteria shown on this project may be illustrative. Please verify current terms directly with the respective bank.</em>
        </div>

        <div class="d-flex justify-end gap-2">
          <button class="btn-secondary" onclick="closeProductModal()">Close</button>
          <a href="${info.url}" target="_blank" rel="noreferrer" class="btn-primary" style="text-decoration:none">
            Visit Bank Portal ↗
          </a>
        </div>
      </div>
    </div>
  `;
}
window.showBankModal = showBankModal;

// ── Initialize everything when DOM is ready ────────────────────
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initMobileNav();
    initScrollReveal();
    initCounters();
    initPredictForm();
    loadHistory();
    loadAnalytics();
  });
} else {
  initTheme();
  initMobileNav();
  initScrollReveal();
  initCounters();
  initPredictForm();
  loadHistory();
  loadAnalytics();
}

