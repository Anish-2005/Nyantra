"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

type Submission = {
  id: string;
  name?: string;
  anonymous?: boolean;
  phone?: string;
  aadhaar?: string;
  firNumber: string;
  policeStation?: string;
  courtCaseId?: string;
  amountRequested?: number;
  bankAccount?: string;
  ifsc?: string;
  files?: string[]; // names only (client-only)
  createdAt: string;
};

const STORAGE_KEY = 'nyantra_user_applications_v1';

export default function UserDashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // Redirect logic kept minimal: only redirect unauthenticated users to login
  useEffect(() => {
    if (loading) return;
    if (!user) router.push('/login');
  }, [user, loading, router]);

  // Form state
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [firNumber, setFirNumber] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [courtCaseId, setCourtCaseId] = useState('');
  const [amountRequested, setAmountRequested] = useState<number | ''>('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Submission | null>(null);
  const [recent, setRecent] = useState<Submission[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: Submission[] = raw ? JSON.parse(raw) : [];
      setRecent(parsed.slice().reverse().slice(0, 6));
    } catch {
      setRecent([]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    const arr = Array.from(list).slice(0, 5); // limit to 5 files
    setFiles(arr);
  };

  const validate = () => {
    setError(null);
    if (!anonymous && !name.trim()) return 'Name is required unless you choose anonymous mode.';
    if (!firNumber.trim()) return 'FIR / Case number is required.';
    if (aadhaar && !/^\d{12}$/.test(aadhaar)) return 'Aadhaar must be 12 digits (or leave blank).';
    if (bankAccount && !/^\d{6,24}$/.test(bankAccount)) return 'Bank account looks invalid.';
    if (ifsc && !/^[A-Za-z]{4}\d{7}$/.test(ifsc)) return 'IFSC looks invalid (format: 4 letters + 7 digits).';
    if (amountRequested !== '' && Number(amountRequested) <= 0) return 'Requested amount must be greater than zero.';
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Client-only mock submit: create an object and store in localStorage
      const id = `APP-${Date.now()}`;
      const createdAt = new Date().toISOString();
      const payload: Submission = {
        id,
        name: anonymous ? undefined : name.trim() || undefined,
        anonymous,
        phone: phone.trim() || undefined,
        aadhaar: aadhaar.trim() || undefined,
        firNumber: firNumber.trim(),
        policeStation: policeStation.trim() || undefined,
        courtCaseId: courtCaseId.trim() || undefined,
        amountRequested: amountRequested === '' ? undefined : Number(amountRequested),
        bankAccount: bankAccount.trim() || undefined,
        ifsc: ifsc.trim() || undefined,
        files: files.map(f => f.name),
        createdAt,
      };

      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 800));

      const raw = localStorage.getItem(STORAGE_KEY);
      const arr: Submission[] = raw ? JSON.parse(raw) : [];
      arr.push(payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

      setSuccess(payload);
      setRecent([payload, ...recent].slice(0, 6));

      // clear non-essential fields but keep name for convenience
      setFirNumber('');
      setPoliceStation('');
      setCourtCaseId('');
      setAmountRequested('');
      setBankAccount('');
      setIfsc('');
      setFiles([]);
    } catch (err) {
      setError('Failed to save application locally.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="theme-bg-card theme-border-glass border rounded-2xl p-6">
          <h1 className="text-2xl font-bold theme-text-primary">Applicant Portal</h1>
          <p className="theme-text-muted mt-1">Use this form to submit your application for relief. This is a client-only mock for now — submissions are stored locally in your browser.</p>

          <form className="mt-6 grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="text-sm theme-text-muted block mb-1">Full name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border theme-border-glass theme-bg-glass" placeholder="Applicant name" disabled={anonymous} />
              </div>
              <label className="inline-flex items-center space-x-2">
                <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
                <span className="text-sm theme-text-muted">Submit Anonymously</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm theme-text-muted block mb-1">Phone (optional)</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 rounded-lg border theme-border-glass theme-bg-glass" placeholder="Mobile number" />
              </div>
              <div>
                <label className="text-sm theme-text-muted block mb-1">Aadhaar (optional)</label>
                <input value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, ''))} maxLength={12} className="w-full px-3 py-2 rounded-lg border theme-border-glass theme-bg-glass" placeholder="12-digit Aadhaar" />
              </div>
            </div>

            <div>
              <label className="text-sm theme-text-muted block mb-1">FIR / Case number</label>
              <input required value={firNumber} onChange={e => setFirNumber(e.target.value)} className="w-full px-3 py-2 rounded-lg border theme-border-glass theme-bg-glass" placeholder="FIR or case number" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm theme-text-muted block mb-1">Police Station</label>
                <input value={policeStation} onChange={e => setPoliceStation(e.target.value)} className="w-full px-3 py-2 rounded-lg border theme-border-glass theme-bg-glass" placeholder="Police station" />
              </div>
              <div>
                <label className="text-sm theme-text-muted block mb-1">eCourts Case ID (optional)</label>
                <input value={courtCaseId} onChange={e => setCourtCaseId(e.target.value)} className="w-full px-3 py-2 rounded-lg border theme-border-glass theme-bg-glass" placeholder="Case ID" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm theme-text-muted block mb-1">Amount requested (₹)</label>
                <input type="number" min={0} value={amountRequested as any} onChange={e => setAmountRequested(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border theme-border-glass theme-bg-glass" placeholder="Amount in INR" />
              </div>
              <div>
                <label className="text-sm theme-text-muted block mb-1">Bank account (optional)</label>
                <input value={bankAccount} onChange={e => setBankAccount(e.target.value.replace(/\D/g, ''))} className="w-full px-3 py-2 rounded-lg border theme-border-glass theme-bg-glass" placeholder="Account number" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm theme-text-muted block mb-1">IFSC (optional)</label>
                <input value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} className="w-full px-3 py-2 rounded-lg border theme-border-glass theme-bg-glass" placeholder="AAAA0000000" maxLength={11} />
              </div>
              <div>
                <label className="text-sm theme-text-muted block mb-1">Supporting documents (max 5)</label>
                <input type="file" multiple onChange={handleFileChange} className="w-full text-sm" accept="image/*,.pdf" />
                {files.length > 0 && (
                  <div className="mt-2 text-xs theme-text-muted">
                    {files.map((f, i) => (
                      <div key={i} className="py-0.5">{f.name} <span className="text-gray-400">({Math.round(f.size/1024)} KB)</span></div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && <div className="text-sm text-red-500">{error}</div>}

            <div className="flex items-center justify-between gap-4">
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg accent-gradient text-white font-semibold shadow-lg">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
              <button type="button" onClick={() => { setName(''); setAnonymous(false); setPhone(''); setAadhaar(''); setFirNumber(''); setPoliceStation(''); setCourtCaseId(''); setAmountRequested(''); setBankAccount(''); setIfsc(''); setFiles([]); setError(null); }} className="px-4 py-2 rounded-lg border theme-border-glass theme-bg-glass">
                Reset
              </button>
            </div>
          </form>

          {/* Success panel */}
          {success && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-lg theme-bg-glass border theme-border-glass">
              <h3 className="font-semibold theme-text-primary">Application submitted</h3>
              <p className="theme-text-muted text-sm">Your application has been saved locally. Application ID: <span className="font-mono">{success.id}</span></p>
              <p className="text-xs theme-text-muted">Submitted: {new Date(success.createdAt).toLocaleString()}</p>
            </motion.div>
          )}

          {/* Recent submissions */}
          <div className="mt-6">
            <h3 className="font-semibold theme-text-primary">Recent submissions (local)</h3>
            {recent.length === 0 && <p className="theme-text-muted text-sm mt-2">No local submissions yet.</p>}
            <div className="space-y-2 mt-3">
              {recent.map(r => (
                <div key={r.id} className="p-3 rounded-lg theme-bg-glass border theme-border-glass flex items-center justify-between">
                  <div>
                    <div className="font-medium theme-text-primary">{r.name ?? (r.anonymous ? 'Anonymous' : '—')}</div>
                    <div className="text-xs theme-text-muted">{r.firNumber} • {r.amountRequested ? `₹${r.amountRequested}` : '—'}</div>
                  </div>
                  <div className="text-xs theme-text-muted text-right">
                    <div>{new Date(r.createdAt).toLocaleDateString()}</div>
                    <div className="font-mono text-xs">{r.id}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
