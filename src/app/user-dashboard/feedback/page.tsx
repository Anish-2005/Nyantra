"use client";
import React, { useEffect, useState } from 'react';

type Feedback = {
  id: string;
  subject: string;
  message: string;
  type: 'grievance' | 'feedback';
  status: 'open' | 'in-review' | 'resolved';
  createdAt: string;
};

const STORAGE_KEY = 'nyantra_user_feedback_v1';

export default function FeedbackPage() {
  const [list, setList] = useState<Feedback[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<Feedback['type']>('feedback');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setList(raw ? JSON.parse(raw).slice().reverse() : []);
    } catch {
      setList([]);
    }
  }, []);

  const persist = (items: Feedback[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice().reverse()));
    setList(items.slice().reverse());
  };

  const submit = () => {
    if (!subject.trim() || !message.trim()) return alert('Please provide subject and message');
    const fb: Feedback = { id: `FB-${Date.now()}`, subject: subject.trim(), message: message.trim(), type, status: 'open', createdAt: new Date().toISOString() };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const prev: Feedback[] = raw ? JSON.parse(raw) : [];
      const next = [fb, ...prev];
      persist(next);
      setSubject(''); setMessage(''); setType('feedback');
    } catch (e) {
      console.error(e);
    }
  };

  const setStatus = (id: string, status: Feedback['status']) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const prev: Feedback[] = raw ? JSON.parse(raw) : [];
      const next = prev.map(p => p.id === id ? { ...p, status } : p);
      persist(next);
    } catch { }
  };

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="theme-bg-card theme-border-glass border rounded-2xl p-4 sm:p-6">
            <h2 className="text-2xl font-semibold theme-text-primary">Grievance Redressal & Feedback</h2>
            <p className="theme-text-muted mt-1">Submit a grievance or general feedback. This demo stores items locally for preview.</p>

            <div className="mt-4 p-3 sm:p-4 theme-bg-glass rounded-lg border theme-border-glass">
              <div className="flex flex-col sm:flex-row gap-2">
                <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject" className="flex-1 px-3 py-2 rounded-lg border theme-border-glass theme-bg-card" />
                <select value={type} onChange={e=>setType(e.target.value as any)} className="w-full sm:w-48 px-3 py-2 rounded-lg border theme-border-glass theme-bg-glass">
                  <option value="feedback">Feedback</option>
                  <option value="grievance">Grievance</option>
                </select>
              </div>
              <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Describe your feedback or grievance" rows={4} className="w-full mt-3 px-3 py-2 rounded-lg border theme-border-glass theme-bg-card" />
              <div className="mt-3 flex gap-2">
                <button onClick={submit} className="px-4 py-2 rounded-lg accent-gradient text-white">Submit</button>
                <button onClick={() => { setSubject(''); setMessage(''); setType('feedback'); }} className="px-4 py-2 rounded-lg border theme-border-glass theme-bg-glass">Reset</button>
              </div>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-auto space-y-3">
              {list.length === 0 && <div className="theme-bg-glass p-3 rounded-lg theme-text-muted">No feedback yet.</div>}
              {list.map(f => (
                <div key={f.id} className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium theme-text-primary">{f.subject} <span className="text-xs theme-text-muted">• {f.type}</span></div>
                      <div className="text-xs theme-text-muted">{new Date(f.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded-full ${f.status === 'open' ? 'text-amber-700 bg-amber-100' : f.status === 'in-review' ? 'text-blue-700 bg-blue-100' : 'text-green-700 bg-green-100'}`}>{f.status}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm theme-text-muted">{f.message}</div>
                  <div className="mt-2 flex gap-2">
                    {f.status !== 'in-review' && <button onClick={() => setStatus(f.id,'in-review')} className="px-3 py-1 rounded-lg border theme-border-glass">Mark in-review</button>}
                    {f.status !== 'resolved' && <button onClick={() => setStatus(f.id,'resolved')} className="px-3 py-1 rounded-lg border theme-border-glass text-green-600">Resolve</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="theme-bg-card theme-border-glass border rounded-2xl p-3 sm:p-4">
            <h3 className="font-semibold theme-text-primary">Stats</h3>
            <p className="theme-text-muted mt-2 text-sm">Total items: <span className="font-medium">{list.length}</span></p>
            <div className="mt-3 space-y-2">
              <div className="p-3 rounded theme-bg-glass border theme-border-glass">Open: {list.filter(l => l.status === 'open').length}</div>
              <div className="p-3 rounded theme-bg-glass border theme-border-glass">In review: {list.filter(l => l.status === 'in-review').length}</div>
              <div className="p-3 rounded theme-bg-glass border theme-border-glass">Resolved: {list.filter(l => l.status === 'resolved').length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
