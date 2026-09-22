import React from 'react';

export const AdminMLModelPage: React.FC = () => {
  const featureImportances = [
    { name: "Debt-to-Income (DTI) Ratio", weight: 28.5, impact: "HIGH" },
    { name: "Credit Score & Bureau History", weight: 24.2, impact: "HIGH" },
    { name: "Monthly Total Income", weight: 18.0, impact: "HIGH" },
    { name: "Proposed EMI / Income Share", weight: 12.4, impact: "MEDIUM" },
    { name: "Employment Stability Tenure", weight: 9.1, impact: "MEDIUM" },
    { name: "Loan-to-Annual-Income Multiplier", weight: 7.8, impact: "LOW" },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">ML Model Architecture & Feature Importance</h1>
          <p className="text-xs text-slate-400">Gradient Boosting classifier parameters & SHAP feature metrics</p>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-xs font-bold text-emerald-300">
          Model Version: v1.0.0 (Gradient Boosting)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="fintech-card p-6 space-y-3">
          <span className="text-xs text-slate-400 block">Classifier Algorithm</span>
          <span className="text-xl font-bold text-white">GradientBoostingClassifier</span>
          <p className="text-xs text-slate-400">180 Estimators | Max Depth 4 | Learning Rate 0.08</p>
        </div>

        <div className="fintech-card p-6 space-y-3">
          <span className="text-xs text-slate-400 block">Test Accuracy</span>
          <span className="text-3xl font-black text-emerald-400">92.4%</span>
          <p className="text-xs text-slate-400">Evaluated on stratified test partition</p>
        </div>

        <div className="fintech-card p-6 space-y-3">
          <span className="text-xs text-slate-400 block">Explainability Engine</span>
          <span className="text-xl font-bold text-purple-300">SHAP Tree Explainer</span>
          <p className="text-xs text-slate-400">Derives exact positive and negative factors</p>
        </div>
      </div>

      <div className="fintech-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Model Feature Importance Breakdown</h3>

        <div className="space-y-4">
          {featureImportances.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">{item.name}</span>
                <span className="text-blue-400 font-mono">{item.weight}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: `${item.weight * 3}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
