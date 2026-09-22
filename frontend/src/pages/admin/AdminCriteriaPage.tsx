import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export const AdminCriteriaPage: React.FC = () => {
  const [criteria, setCriteria] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCriteria();
  }, []);

  const fetchCriteria = async () => {
    try {
      const res = await api.get('/admin/criteria');
      setCriteria(res.data);
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
          <h1 className="text-2xl font-bold text-white">Visual Criteria Rule Builder</h1>
          <p className="text-xs text-slate-400">Configure & version underwriting evaluation criteria rules</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading criteria rules...</div>
      ) : (
        <div className="fintech-card p-6 space-y-6">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Active Criteria Rules</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criteria.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-blue-400">{c.rule_name}</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-[10px] text-purple-300 font-mono">
                    v{c.version}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 font-mono text-xs text-slate-200 flex items-center justify-between">
                  <span>{c.criteria_key}</span>
                  <span className="text-purple-400 font-bold">{c.operator}</span>
                  <span className="text-emerald-400 font-bold">{c.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
