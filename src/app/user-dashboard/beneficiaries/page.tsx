"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Beneficiary = { 
  id: string; 
  name: string; 
  relation?: string; 
  dob?: string; 
  notes?: string;
  createdAt: string;
};

const STORAGE_KEY = 'nyantra_user_beneficiaries_v1';

export default function BeneficiariesPage() {
  const [list, setList] = useState<Beneficiary[]>([]);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [dob, setDob] = useState('');
  const [notes, setNotes] = useState('');
  const [selected, setSelected] = useState<Beneficiary | null>(null);
  const [editing, setEditing] = useState<Beneficiary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    try { 
      const raw = localStorage.getItem(STORAGE_KEY); 
      setList(raw ? JSON.parse(raw) : []); 
    } catch { 
      setList([]); 
    }
  }, []);

  const addBeneficiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const beneficiary: Beneficiary = { 
      id: `BEN-${Date.now()}`, 
      name: name.trim(), 
      relation: relation.trim() || undefined,
      dob: dob || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString()
    };
    
    const next = [beneficiary, ...list];
    setList(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setName(''); 
    setRelation('');
    setDob('');
    setNotes('');
  };

  const updateBeneficiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.name.trim()) return;

    const updated: Beneficiary = {
      ...editing,
      name: editing.name.trim(),
      relation: editing.relation?.trim() || undefined,
      notes: editing.notes?.trim() || undefined
    };

    const next = list.map(b => b.id === updated.id ? updated : b);
    setList(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSelected(updated);
    setEditing(null);
  };

  const removeBeneficiary = (id: string) => {
    if (!window.confirm('Are you sure you want to remove this beneficiary?')) return;
    
    const next = list.filter(l => l.id !== id);
    setList(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (selected?.id === id) setSelected(null);
    if (editing?.id === id) setEditing(null);
  };

  const filteredList = list.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.relation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-6 theme-bg-primary">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold theme-text-primary">
            Beneficiaries
          </h1>
          <p className="theme-text-muted mt-2 text-sm md:text-base">
            Add and manage beneficiary details linked to your applications.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Form & List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Beneficiary Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
            >
              <h2 className="text-xl font-semibold theme-text-primary mb-4">
                {editing ? 'Edit Beneficiary' : 'Add New Beneficiary'}
              </h2>
              
              <form onSubmit={editing ? updateBeneficiary : addBeneficiary} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      Full Name *
                    </label>
                    <input 
                      value={editing ? editing.name : name}
                      onChange={e => editing 
                        ? setEditing({...editing, name: e.target.value})
                        : setName(e.target.value)
                      }
                      placeholder="Enter full name"
                      className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      Relation
                    </label>
                    <input 
                      value={editing ? editing.relation || '' : relation}
                      onChange={e => editing
                        ? setEditing({...editing, relation: e.target.value})
                        : setRelation(e.target.value)
                      }
                      placeholder="e.g., Spouse, Child, Parent"
                      className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      Date of Birth
                    </label>
                    <input 
                      type="date"
                      value={editing ? editing.dob || '' : dob}
                      onChange={e => editing
                        ? setEditing({...editing, dob: e.target.value})
                        : setDob(e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div className="md:col-span-1">
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      Notes
                    </label>
                    <input 
                      value={editing ? editing.notes || '' : notes}
                      onChange={e => editing
                        ? setEditing({...editing, notes: e.target.value})
                        : setNotes(e.target.value)
                      }
                      placeholder="Additional information"
                      className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    type="submit"
                    className="flex-1 accent-gradient text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {editing ? 'Update Beneficiary' : 'Add Beneficiary'}
                  </button>
                  
                  {editing && (
                    <button 
                      type="button"
                      onClick={() => setEditing(null)}
                      className="px-6 py-3 border theme-border-glass theme-text-muted hover:theme-bg-glass font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </motion.div>

            {/* Beneficiaries List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold theme-text-primary">
                  Your Beneficiaries ({filteredList.length})
                </h3>
                
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search beneficiaries..."
                    className="w-full px-4 py-2 pl-10 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <svg className="absolute left-3 top-2.5 w-4 h-4 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {filteredList.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12 theme-bg-glass rounded-xl border theme-border-glass"
                    >
                      <div className="mx-auto w-16 h-16 theme-bg-primary rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="theme-text-muted mb-2">
                        {list.length === 0 ? 'No beneficiaries yet' : 'No matching beneficiaries found'}
                      </p>
                      <p className="text-sm theme-text-muted">
                        {list.length === 0 
                          ? "Add your first beneficiary using the form above." 
                          : "Try adjusting your search terms."}
                      </p>
                    </motion.div>
                  ) : (
                    filteredList.map((beneficiary, index) => (
                      <motion.div
                        key={beneficiary.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border theme-border-glass cursor-pointer transition-all hover:scale-[1.02] ${
                          selected?.id === beneficiary.id 
                            ? 'accent-gradient text-white' 
                            : 'theme-bg-glass hover:theme-border-primary'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div 
                            className="flex-1 min-w-0"
                            onClick={() => setSelected(beneficiary)}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className={`font-semibold truncate ${
                                selected?.id === beneficiary.id ? 'text-white' : 'theme-text-primary'
                              }`}>
                                {beneficiary.name}
                              </h4>
                              {beneficiary.relation && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  selected?.id === beneficiary.id 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {beneficiary.relation}
                                </span>
                              )}
                            </div>
                            
                            <div className={`flex flex-wrap gap-4 text-sm ${
                              selected?.id === beneficiary.id ? 'text-white/90' : 'theme-text-muted'
                            }`}>
                              {beneficiary.dob && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {new Date(beneficiary.dob).toLocaleDateString()}
                                </span>
                              )}
                              
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(beneficiary.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            {beneficiary.notes && (
                              <p className={`text-sm mt-2 line-clamp-2 ${
                                selected?.id === beneficiary.id ? 'text-white/80' : 'theme-text-muted'
                              }`}>
                                {beneficiary.notes}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditing(beneficiary)}
                              className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                selected?.id === beneficiary.id 
                                  ? 'bg-white/20 text-white hover:bg-white/30' 
                                  : 'theme-bg-glass theme-text-muted hover:theme-border-primary'
                              }`}
                              title="Edit beneficiary"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={() => removeBeneficiary(beneficiary.id)}
                              className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                selected?.id === beneficiary.id 
                                  ? 'bg-white/20 text-white hover:bg-red-400' 
                                  : 'theme-bg-glass theme-text-muted hover:text-red-600'
                              }`}
                              title="Remove beneficiary"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Details Panel */}
          <div className="space-y-6">
            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
            >
              <h3 className="font-semibold theme-text-primary mb-4">Summary</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="theme-bg-glass rounded-xl p-4 border theme-border-glass text-center">
                  <div className="text-2xl font-bold theme-text-primary mb-1">{list.length}</div>
                  <div className="text-xs theme-text-muted">Total</div>
                </div>
                <div className="theme-bg-glass rounded-xl p-4 border theme-border-glass text-center">
                  <div className="text-2xl font-bold theme-text-primary mb-1">
                    {new Set(list.map(b => b.relation)).size}
                  </div>
                  <div className="text-xs theme-text-muted">Relations</div>
                </div>
              </div>

              <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                <div className="text-xs theme-text-muted mb-1">Most Recent</div>
                <div className="font-medium theme-text-primary text-sm truncate">
                  {list[0]?.name || '—'}
                </div>
                <div className="text-xs theme-text-muted">
                  {list[0] ? new Date(list[0].createdAt).toLocaleDateString() : '--'}
                </div>
              </div>
            </motion.div>

            {/* Selected Beneficiary Details */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold theme-text-primary">Beneficiary Details</h4>
                    <button
                      onClick={() => setSelected(null)}
                      className="p-1 rounded-lg theme-text-muted hover:theme-bg-glass transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm theme-text-muted mb-1">Full Name</div>
                      <div className="font-medium theme-text-primary">{selected.name}</div>
                    </div>

                    {selected.relation && (
                      <div>
                        <div className="text-sm theme-text-muted mb-1">Relation</div>
                        <div className="font-medium theme-text-primary">{selected.relation}</div>
                      </div>
                    )}

                    {selected.dob && (
                      <div>
                        <div className="text-sm theme-text-muted mb-1">Date of Birth</div>
                        <div className="font-medium theme-text-primary">
                          {new Date(selected.dob).toLocaleDateString()}
                        </div>
                      </div>
                    )}

                    {selected.notes && (
                      <div>
                        <div className="text-sm theme-text-muted mb-1">Notes</div>
                        <div className="theme-text-primary text-sm leading-relaxed">
                          {selected.notes}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t theme-border-glass">
                      <div className="text-sm theme-text-muted mb-1">Beneficiary ID</div>
                      <div className="font-mono text-xs theme-text-primary bg-theme-glass px-2 py-1 rounded">
                        {selected.id}
                      </div>
                      <div className="text-xs theme-text-muted mt-2">
                        Added: {new Date(selected.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}