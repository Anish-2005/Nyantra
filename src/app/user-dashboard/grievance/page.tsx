"use client";
import React, { useEffect, useState } from 'react';

type Grv = { id: string; subject: string; description: string; status: 'open'|'in-progress'|'resolved'; priority: 'low'|'medium'|'high'; date: string };
const STORAGE_KEY = 'nyantra_user_grievances_v1';

export default function GrievancePage() {
  const [list, setList] = useState<Grv[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Grv['priority']>('medium');

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); setList(raw ? JSON.parse(raw) : []); } catch { setList([]); }
  }, []);

  const submit = () => {
    if (!subject.trim() || !description.trim()) return;
    const g: Grv = { id: `GRV-${Date.now()}`, subject: subject.trim(), description: description.trim(), status: 'open', priority, date: new Date().toISOString() };
    const next = [g, ...list];
    setList(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSubject(''); setDescription(''); setPriority('medium');
  };

  const setStatus = (id: string, status: Grv['status']) => {
    const next = list.map(l => l.id===id ? {...l, status} : l);
    setList(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <div className="min-h-screen">
      <div className="theme-bg-card theme-border-glass border rounded-2xl p-4 sm:p-6">
        <h2 className="text-2xl font-semibold theme-text-primary">Grievances</h2>
        <p className="theme-text-muted mt-1">File and track grievances related to your application and payments.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="p-3 sm:p-4 theme-bg-glass rounded-lg border theme-border-glass">
              <label className="text-sm theme-text-muted">Subject</label>
              <input value={subject} onChange={e=>setSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border theme-border-glass theme-bg-card mt-1" />
              <label className="text-sm theme-text-muted mt-3 block">Description</label>
              <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg border theme-border-glass theme-bg-card mt-1" rows={4} />
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3">
                <select value={priority} onChange={e=>setPriority(e.target.value as any)} className="px-3 py-2 rounded-lg border theme-border-glass theme-bg-glass w-full sm:w-auto">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button onClick={submit} className="px-4 py-2 rounded-lg accent-gradient text-white w-full sm:w-auto">Submit Grievance</button>
              </div>
            </div>

            <div className="mt-4 space-y-2 max-h-[55vh] overflow-auto">
              {list.length===0 && <div className="theme-bg-glass p-3 rounded-lg theme-text-muted">No grievances filed yet.</div>}
              {list.map(g => (
                <div key={g.id} className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium theme-text-primary">{g.subject}</div>
                      <div className="text-xs theme-text-muted">{new Date(g.date).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded-full ${g.status==='open' ? 'text-amber-700 bg-amber-100' : g.status==='in-progress' ? 'text-blue-700 bg-blue-100' : 'text-green-700 bg-green-100'}`}>{g.status}</div>
                      <div className="text-xs theme-text-muted mt-1">{g.priority}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm theme-text-muted">{g.description}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {g.status !== 'resolved' && <button onClick={()=>setStatus(g.id,'in-progress')} className="px-3 py-1 rounded-lg border theme-border-glass text-sm">Mark in-progress</button>}
                    {g.status !== 'resolved' && <button onClick={()=>setStatus(g.id,'resolved')} className="px-3 py-1 rounded-lg border theme-border-glass text-green-600 text-sm">Resolve</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="theme-bg-card theme-border-glass border rounded-2xl p-3 sm:p-4">
              <h4 className="font-semibold theme-text-primary">Summary</h4>
              <div className="mt-2 text-sm theme-text-muted">Total grievances: <span className="font-medium">{list.length}</span></div>
              <div className="mt-3 space-y-2">
                <div className="p-3 rounded theme-bg-glass border theme-border-glass">Open: {list.filter(l=>l.status==='open').length}</div>
                <div className="p-3 rounded theme-bg-glass border theme-border-glass">In progress: {list.filter(l=>l.status==='in-progress').length}</div>
                <div className="p-3 rounded theme-bg-glass border theme-border-glass">Resolved: {list.filter(l=>l.status==='resolved').length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
