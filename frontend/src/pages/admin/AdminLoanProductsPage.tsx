import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export const AdminLoanProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/loan-products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Loan Product Management</h1>
          <p className="text-xs text-slate-400">Configure min/max income, credit score, DTI, and loan amount limits</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading loan products...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p) => (
            <div key={p.id} className="fintech-card p-6 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] text-blue-400 uppercase font-semibold">{p.bank_name}</span>
                  <h3 className="text-base font-bold text-white">{p.product_name}</h3>
                  <span className="text-[11px] text-purple-300 font-mono">{p.loan_type}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-[10px] text-blue-300 font-bold uppercase">
                  DEMO PRODUCT
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-400 block text-[10px]">Min Monthly Income:</span><span className="font-semibold text-white">{formatCurrency(p.min_income)}</span></div>
                <div><span className="text-slate-400 block text-[10px]">Min Credit Score:</span><span className="font-semibold text-purple-300">{p.min_credit_score}</span></div>
                <div><span className="text-slate-400 block text-[10px]">Max DTI Ratio:</span><span className="font-semibold text-cyan-300">{p.max_dti}%</span></div>
                <div><span className="text-slate-400 block text-[10px]">Min Employment Tenure:</span><span className="font-semibold text-slate-200">{p.min_employment_tenure_months} Mos</span></div>
                <div><span className="text-slate-400 block text-[10px]">Loan Amount Range:</span><span className="font-semibold text-emerald-400">{formatCurrency(p.min_loan_amount)} - {formatCurrency(p.max_loan_amount)}</span></div>
                <div><span className="text-slate-400 block text-[10px]">Tenure Range:</span><span className="font-semibold text-slate-200">{p.min_tenure_months} - {p.max_tenure_months} Mos</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
