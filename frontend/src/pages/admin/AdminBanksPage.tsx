import React, { useEffect, useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import api from '../../services/api';

export const AdminBanksPage: React.FC = () => {
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState<any>(null);

  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [officialWebsite, setOfficialWebsite] = useState('');

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const res = await api.get('/admin/banks');
      setBanks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBank) {
        await api.put(`/admin/banks/${editingBank.id}`, {
          name, logo_url: logoUrl, official_website: officialWebsite, status: 'ACTIVE', is_demo: true
        });
      } else {
        await api.post('/admin/banks', {
          name, logo_url: logoUrl, official_website: officialWebsite, status: 'ACTIVE', is_demo: true
        });
      }
      setShowModal(false);
      fetchBanks();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (b: any) => {
    setEditingBank(b);
    setName(b.name);
    setLogoUrl(b.logo_url || '');
    setOfficialWebsite(b.official_website || '');
    setShowModal(true);
  };

  const openNew = () => {
    setEditingBank(null);
    setName('');
    setLogoUrl('');
    setOfficialWebsite('');
    setShowModal(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Partner Lenders & Banks</h1>
          <p className="text-xs text-slate-400">Configure demo partner institutions & logos</p>
        </div>

        <button onClick={openNew} className="fintech-glow-button px-4 py-2 rounded-lg text-xs font-semibold text-white flex items-center space-x-1.5">
          <Plus className="w-4 h-4" />
          <span>Add New Bank</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading bank registry...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {banks.map((b) => (
            <div key={b.id} className="fintech-card p-6 space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  {b.logo_url ? (
                    <img src={b.logo_url} alt={b.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-950 flex items-center justify-center text-blue-400 font-bold">
                      {b.name.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-white">{b.name}</h3>
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">ACTIVE DEMO LENDER</span>
                  </div>
                </div>

                {b.official_website && (
                  <p className="text-xs text-slate-400 truncate">Website: {b.official_website}</p>
                )}
              </div>

              <button onClick={() => openEdit(b)} className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center justify-center space-x-1">
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Bank Details</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="fintech-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">{editingBank ? 'Edit Bank' : 'Add New Bank'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full glass-input px-3 py-2 rounded text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Logo URL</label>
                <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="w-full glass-input px-3 py-2 rounded text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Website</label>
                <input type="text" value={officialWebsite} onChange={(e) => setOfficialWebsite(e.target.value)} className="w-full glass-input px-3 py-2 rounded text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded bg-slate-900 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="fintech-glow-button px-5 py-2 rounded text-xs text-white">Save Bank</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
