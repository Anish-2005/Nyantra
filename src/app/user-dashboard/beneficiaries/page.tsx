"use client";
import React, { useEffect, useState } from 'react';

type Beneficiary = { id: string; name: string; relation?: string; dob?: string; notes?: string };
const STORAGE_KEY = 'nyantra_user_beneficiaries_v1';

export default function BeneficiariesPage() {
  const [list, setList] = useState<Beneficiary[]>([]);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [selected, setSelected] = useState<Beneficiary | null>(null);

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); setList(raw ? JSON.parse(raw) : []); } catch { setList([]); }
  }, []);

  const add = () => {
    if (!name.trim()) return;
    const b = { id: `BEN-${Date.now()}`, name: name.trim(), relation: relation.trim() };
    const next = [b, ...list];
    setList(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setName(''); setRelation('');
  };

  const remove = (id: string) => {
    const next = list.filter(l => l.id !== id);
    setList(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="min-h-screen">
      <div className="theme-bg-card theme-border-glass border rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold theme-text-primary">Beneficiaries</h2>
            <p className="theme-text-muted mt-1">Add and manage beneficiary details linked to your applications.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full sm:w-auto px-3 py-2 rounded-lg border theme-border-glass theme-bg-glass" />
            <input value={relation} onChange={e => setRelation(e.target.value)} placeholder="Relation" className="w-full sm:w-auto px-3 py-2 rounded-lg border theme-border-glass theme-bg-glass" />
            <button onClick={add} className="px-3 py-2 rounded-lg accent-gradient text-white">Add</button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="space-y-2 max-h-[55vh] overflow-auto">
              {list.length === 0 && <div className="theme-bg-glass p-4 rounded-lg theme-text-muted">No beneficiaries yet. Add one using the form above.</div>}
              {list.map(b => (
                <div key={b.id} className="p-3 rounded-lg theme-bg-glass border theme-border-glass flex items-center justify-between">
                  <div onClick={() => setSelected(b)} className="cursor-pointer">
                    <div className="font-medium theme-text-primary">{b.name}</div>
                    <div className="text-xs theme-text-muted">{b.relation ?? '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => remove(b.id)} className="text-sm text-red-600 px-2 py-1 rounded">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="theme-bg-card theme-border-glass border rounded-2xl p-3 sm:p-4">
              <h4 className="font-semibold theme-text-primary">Details</h4>
              {selected ? (
                <div className="mt-2 text-sm">
                  <div className="font-medium">{selected.name}</div>
                  <div className="text-xs theme-text-muted">Relation: {selected.relation ?? '—'}</div>
                  <div className="text-xs theme-text-muted mt-2">ID: <span className="font-mono">{selected.id}</span></div>
                </div>
              ) : (
                <div className="theme-text-muted text-sm mt-2">Select a beneficiary to see details.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
