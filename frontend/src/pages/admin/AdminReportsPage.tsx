import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export const AdminReportsPage: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExportExcel = async () => {
    setDownloading(true);
    setSuccess(false);

    try {
      const response = await api.get('/admin/reports/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'loan_applications.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess(true);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white">Excel Report Exporter</h1>
        <p className="text-xs text-slate-400">Generate multi-sheet openpyxl Excel audit workbooks</p>
      </div>

      <div className="fintech-card p-8 space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-glow">
          <FileSpreadsheet className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">loan_applications.xlsx Master Workbook</h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Includes multi-sheet exports for Applications, Applicants, Financial Profile, Existing Loans, ML Predictions, Bank Criteria Matches, and Consent Audit Logs.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-[11px] text-slate-300">
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">✓ Applications Sheet</div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">✓ Applicants Sheet</div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">✓ Financial Profiles</div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">✓ Existing Loans</div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">✓ ML Results</div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">✓ Bank Matches</div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">✓ Consent Logs</div>
          <div className="p-2.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">✓ PAN/Mobile Masked</div>
        </div>

        {success && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-center space-x-2 max-w-md mx-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Excel report generated and downloaded successfully!</span>
          </div>
        )}

        <button
          onClick={handleExportExcel}
          disabled={downloading}
          className="fintech-glow-button px-8 py-3.5 rounded-xl text-sm font-bold text-white shadow-glow inline-flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Generating Excel Workbook...' : 'Download loan_applications.xlsx'}</span>
        </button>
      </div>
    </div>
  );
};
