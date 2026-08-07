import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GADBeneficiary } from '../types';
import { BARANGAYS } from '../constants/barangayConfig';
import { 
  Plus, Save, Trash2, Search, X, 
  ChevronRight, AlertCircle, CheckCircle2,
  Filter, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SECTORS = ['Senior Citizen', 'PWD', 'Solo Parent', 'Indigenous People', 'OFW Family', 'Urban Poor'];
const CIVIL_STATUSES = ['Single', 'Married', 'Widowed', 'Separated', 'Common-law'];

const GadEntryModule: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<GADBeneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GADBeneficiary | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<GADBeneficiary>({
    full_name: '',
    sex: 'Female',
    barangay_id: '',
    civil_status: 'Single',
    sectoral_classification: [],
    birthdate: '',
    contact_info: ''
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gad_beneficiaries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setBeneficiaries(data);
    if (error) notify('error', error.message);
    setLoading(false);
  };

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      sex: 'Female',
      barangay_id: '',
      civil_status: 'Single',
      sectoral_classification: [],
      birthdate: '',
      contact_info: ''
    });
    setEditingItem(null);
  };

  const openModal = (item?: GADBeneficiary) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingItem?.id) {
        const { error } = await supabase
          .from('gad_beneficiaries')
          .update(formData)
          .eq('id', editingItem.id);
        if (error) throw error;
        notify('success', 'Profile updated successfully');
      } else {
        const { error } = await supabase
          .from('gad_beneficiaries')
          .insert([{ ...formData, unique_id: `TAL-${Date.now().toString().slice(-6)}` }]);
        if (error) throw error;
        notify('success', 'New beneficiary encoded');
      }
      setIsModalOpen(false);
      fetchBeneficiaries();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanent deletion? This action cannot be undone.")) return;
    try {
      const { error } = await supabase.from('gad_beneficiaries').delete().eq('id', id);
      if (error) throw error;
      notify('success', 'Record removed');
      fetchBeneficiaries();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const toggleSector = (sector: string) => {
    const current = formData.sectoral_classification || [];
    if (current.includes(sector)) {
      setFormData({ ...formData, sectoral_classification: current.filter(s => s !== sector) });
    } else {
      setFormData({ ...formData, sectoral_classification: [...current, sector] });
    }
  };

  const filteredData = beneficiaries.filter(b => 
    b.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.unique_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or ID..."
            className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 pl-12 pr-6 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => openModal()}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <Plus size={18} /> Encode New
          </button>
          <button className="p-4 bg-white border border-brand-border text-brand-muted rounded-2xl hover:text-brand-text hover:bg-gray-50 transition-all">
            <Filter size={18} />
          </button>
          <button className="p-4 bg-white border border-brand-border text-brand-muted rounded-2xl hover:text-brand-text hover:bg-gray-50 transition-all">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Main Table/Grid */}
      <div className="bg-white rounded-[2rem] border border-brand-border shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">ID/Beneficiary</th>
                <th className="px-8 py-6 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Sex</th>
                <th className="px-8 py-6 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Barangay</th>
                <th className="px-8 py-6 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Sectors</th>
                <th className="px-8 py-6 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-brand-muted font-bold text-sm tracking-widest">
                    NO RECORDS FOUND IN GAD DATABASE
                  </td>
                </tr>
              ) : filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-brand-primary/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-brand-primary font-mono mb-1">{item.unique_id}</span>
                      <span className="text-sm font-black text-brand-text uppercase tracking-tight">{item.full_name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.sex === 'Female' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                      {item.sex}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-brand-muted uppercase tracking-wider">
                    {BARANGAYS.find(b => b.slug === item.barangay_id)?.name || item.barangay_id}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1">
                      {item.sectoral_classification?.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[8px] font-black uppercase tracking-widest leading-none">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openModal(item)}
                        className="p-3 bg-white border border-brand-border text-brand-muted hover:text-brand-primary hover:border-brand-primary rounded-xl transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id!)}
                        className="p-3 bg-white border border-brand-border text-brand-muted hover:text-red-500 hover:border-red-500 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid/Card View */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="py-20 text-center text-brand-muted font-bold text-sm tracking-widest">
              NO RECORDS FOUND
            </div>
          ) : filteredData.map((item) => (
            <div key={`mobile-card-${item.id}`} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-brand-primary font-mono mb-1">{item.unique_id}</span>
                  <h3 className="text-sm font-black text-brand-text uppercase leading-tight">{item.full_name}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(item)} className="p-2 bg-gray-50 text-brand-muted rounded-lg"><ChevronRight size={14} /></button>
                  <button onClick={() => handleDelete(item.id!)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex gap-4">
                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${item.sex === 'Female' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                  {item.sex}
                </span>
                <span className="text-[8px] font-black text-brand-muted uppercase tracking-widest border-l border-gray-200 pl-4">
                  {BARANGAYS.find(b => b.slug === item.barangay_id)?.name || item.barangay_id}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.sectoral_classification?.map(s => (
                  <span key={`mobile-s-${s}`} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[8px] font-black uppercase tracking-widest leading-none">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Encoding Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-brand-text/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 100 }}
              className="relative w-full max-w-2xl bg-white rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 md:p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 shrink-0">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-brand-text tracking-tighter uppercase mb-1">
                    {editingItem ? 'Update Profile' : 'Encoding New'}
                  </h2>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 md:p-3 text-brand-muted hover:bg-white rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto pb-12">
                {/* Name & Sex */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2 md:space-y-3">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-2">Full Name *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. JUAN DELA CRUZ"
                      className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-2">Sex *</label>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      {['Male', 'Female'].map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFormData({ ...formData, sex: s as any })}
                          className={`py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${
                            formData.sex === s 
                              ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                              : 'bg-gray-50 text-brand-muted hover:bg-gray-100'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Birthdate & Barangay */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2 md:space-y-3">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-2">Birthdate</label>
                    <input 
                      type="date" 
                      className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none"
                      value={formData.birthdate}
                      onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-2">Barangay *</label>
                    <div className="relative">
                      <select 
                        required
                        className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none pr-10"
                        value={formData.barangay_id}
                        onChange={(e) => setFormData({ ...formData, barangay_id: e.target.value })}
                      >
                        <option value="">Select Barangay</option>
                        {BARANGAYS.map(b => (
                          <option key={b.slug} value={b.slug}>{b.name}</option>
                        ))}
                      </select>
                      <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-brand-muted" />
                    </div>
                  </div>
                </div>

                {/* Civil Status */}
                <div className="space-y-2 md:space-y-3">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-2">Civil Status</label>
                  <div className="flex flex-wrap gap-2">
                    {CIVIL_STATUSES.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, civil_status: s as any })}
                        className={`px-4 py-2.5 rounded-xl font-bold text-[8px] md:text-[10px] uppercase tracking-widest transition-all ${
                          formData.civil_status === s 
                            ? 'bg-brand-text text-white shadow-lg' 
                            : 'bg-gray-50 text-brand-muted hover:bg-gray-100 border border-transparent'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sectoral Classification */}
                <div className="space-y-2 md:space-y-3">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-2">Sectoral Classification (Multiple)</label>
                  <div className="flex flex-wrap gap-2">
                    {SECTORS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSector(s)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-[8px] md:text-[10px] uppercase tracking-widest transition-all ${
                          formData.sectoral_classification?.includes(s)
                            ? 'bg-brand-accent text-white shadow-lg' 
                            : 'bg-gray-50 text-brand-muted hover:bg-gray-100 border border-transparent'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 md:pt-8 bg-white border-t border-gray-50 sticky bottom-0 -mx-6 md:-mx-10 px-6 md:px-10 pb-2">
                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full py-5 md:py-6 bg-brand-primary text-white rounded-2xl md:rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-primary/95 transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <Save size={20} />
                    {editingItem ? 'Confirm Profile Update' : 'Initialize Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 text-white font-bold tracking-tight ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GadEntryModule;
