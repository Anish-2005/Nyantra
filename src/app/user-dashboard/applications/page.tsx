"use client";
import React, { useEffect, useState } from 'react';

type Submission = {
  id: string;
  name?: string;
  anonymous?: boolean;
  firNumber: string;
  amountRequested?: number;
  createdAt: string;
  files?: string[];
};

const STORAGE_KEY = 'nyantra_user_applications_v1';

export default function ApplicationsPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<'all' | 'recent' | 'amount' >('all');
  const [selected, setSelected] = useState<Submission | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: Submission[] = raw ? JSON.parse(raw) : [];
      setItems(parsed.slice().reverse());
    } catch {
      setItems([]);
    }
  }, []);

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
    setSelected(null);
  };

  const filtered = items.filter(i => {
    if (filter === 'recent') return new Date(i.createdAt) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    if (filter === 'amount') return (i.amountRequested ?? 0) > 0;
    return true;
  });

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="theme-bg-card theme-border-glass border rounded-2xl p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold theme-text-primary">My Applications</h2>
                <p className="theme-text-muted mt-1">Applications you submitted (stored locally).</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <select value={filter} onChange={e => setFilter(e.target.value as any)} className="w-full sm:w-auto px-3 py-2 rounded-lg border theme-border-glass theme-bg-glass text-sm">
                  <option value="all">All</option>
                  <option value="recent">Last 30 days</option>
                  <option value="amount">Has Amount</option>
                </select>
                <button onClick={clearAll} className="w-full sm:w-auto px-3 py-2 rounded-lg border theme-border-glass theme-bg-glass text-sm text-red-600">Clear</button>
              </div>
            </div>

            <div className="mt-6">
              {filtered.length === 0 && <div className="theme-bg-glass p-4 rounded-lg theme-text-muted">No applications found. Submit one from the Applicant Portal.</div>}
              <div className="space-y-3 max-h-[50vh] md:max-h-[60vh] overflow-auto">
                {filtered.map(item => (
                  <div key={item.id} onClick={() => setSelected(item)} className="px-4 py-3 sm:px-4 sm:py-3 rounded-lg theme-bg-glass border theme-border-glass hover:theme-border-glass cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="font-medium theme-text-primary">{item.name ?? (item.anonymous ? 'Anonymous' : '—')}</div>
                      <div className="text-xs theme-text-muted">FIR: {item.firNumber} • {item.files?.length ? `${item.files.length} files` : 'No files'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold theme-text-primary">{item.amountRequested ? `₹${item.amountRequested}` : '—'}</div>
                      <div className="text-xs theme-text-muted">{new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="theme-bg-card theme-border-glass border rounded-2xl p-3 sm:p-6 overflow-auto">
            <h3 className="font-semibold theme-text-primary">Summary</h3>
            <p className="theme-text-muted text-sm mt-2">You have <span className="font-bold">{items.length}</span> saved application(s).</p>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                <div className="text-xs theme-text-muted">Most recent</div>
                <div className="font-medium theme-text-primary">{items[0]?.id ?? '—'}</div>
                <div className="text-xs theme-text-muted">{items[0] ? new Date(items[0].createdAt).toLocaleString() : '--'}</div>
              </div>

              <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                <div className="text-xs theme-text-muted">Total amount requested</div>
                <div className="font-medium theme-text-primary">₹{items.reduce((s, i) => s + (i.amountRequested ?? 0), 0)}</div>
              </div>
            </div>
          </div>

          {selected && (
            <div className="mt-4 theme-bg-card theme-border-glass border rounded-2xl p-3 sm:p-4 overflow-auto">
              <h4 className="font-semibold theme-text-primary">Application details</h4>
              <div className="mt-2 text-sm theme-text-muted">ID: <span className="font-mono">{selected.id}</span></div>
              <div className="mt-2 text-sm theme-text-muted">FIR: {selected.firNumber}</div>
              <div className="mt-2 text-sm theme-text-muted">Submitted: {new Date(selected.createdAt).toLocaleString()}</div>
              <div className="mt-2 text-sm theme-text-muted">Files: {selected.files?.length ?? 0}</div>
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <button onClick={() => navigator.clipboard.writeText(selected.id)} className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base rounded-lg accent-gradient text-white">Copy ID</button>
                <button onClick={() => setSelected(null)} className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base rounded-lg border theme-border-glass theme-bg-glass">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
