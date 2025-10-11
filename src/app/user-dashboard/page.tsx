"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { user, loading } = useAuth();
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
  const [activeTab, setActiveTab] = useState<'form' | 'recent'>('form');

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
      setActiveTab('recent');

      // clear non-essential fields but keep name for convenience
      setFirNumber('');
      setPoliceStation('');
      setCourtCaseId('');
      setAmountRequested('');
      setBankAccount('');
      setIfsc('');
      setFiles([]);
    } catch{
      setError('Failed to save application locally.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setAnonymous(false);
    setPhone('');
    setAadhaar('');
    setFirNumber('');
    setPoliceStation('');
    setCourtCaseId('');
    setAmountRequested('');
    setBankAccount('');
    setIfsc('');
    setFiles([]);
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 theme-bg-primary">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold theme-text-primary">
            Applicant Portal
          </h1>
          <p className="theme-text-muted mt-2 text-sm md:text-base">
            Submit your application for relief. This is a client-only mock — submissions are stored locally in your browser.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 theme-bg-card theme-border-glass rounded-xl p-1 border">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'form'
                ? 'accent-gradient text-white shadow-sm'
                : 'theme-text-muted hover:theme-text-primary theme-bg-glass'
            }`}
          >
            New Application
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'recent'
                ? 'accent-gradient text-white shadow-sm'
                : 'theme-text-muted hover:theme-text-primary theme-bg-glass'
            }`}
          >
            Recent ({recent.length})
          </button>
        </div>

        <div className="theme-bg-card theme-border-glass rounded-2xl border overflow-hidden">
          {/* Form Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-4 md:p-6"
              >
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold theme-text-primary border-b theme-border-glass pb-2">
                      Personal Information
                    </h3>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 theme-bg-glass rounded-lg">
                      <div className="flex-1">
                        <label className="text-sm font-medium theme-text-muted block mb-2">
                          Full name
                        </label>
                        <input 
                          value={name} 
                          onChange={e => setName(e.target.value)} 
                          className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                          placeholder="Applicant name" 
                          disabled={anonymous} 
                        />
                      </div>
                      <label className="inline-flex items-center space-x-3 p-2">
                        <div className="relative inline-block w-10 h-5">
                          <input 
                            type="checkbox" 
                            checked={anonymous} 
                            onChange={e => setAnonymous(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`block w-10 h-5 rounded-full transition-colors ${
                            anonymous ? 'bg-blue-500' : 'theme-bg-glass border theme-border-glass'
                          }`}></div>
                          <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                            anonymous ? 'transform translate-x-5' : ''
                          }`}></div>
                        </div>
                        <span className="text-sm font-medium theme-text-muted">
                          Submit Anonymously
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium theme-text-muted block mb-2">
                          Phone (optional)
                        </label>
                        <input 
                          value={phone} 
                          onChange={e => setPhone(e.target.value)} 
                          className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                          placeholder="Mobile number" 
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium theme-text-muted block mb-2">
                          Aadhaar (optional)
                        </label>
                        <input 
                          value={aadhaar} 
                          onChange={e => setAadhaar(e.target.value.replace(/\D/g, ''))} 
                          maxLength={12} 
                          className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                          placeholder="12-digit Aadhaar" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Case Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold theme-text-primary border-b theme-border-glass pb-2">
                      Case Information
                    </h3>
                    
                    <div>
                      <label className="text-sm font-medium theme-text-muted block mb-2">
                        FIR / Case number *
                      </label>
                      <input 
                        required 
                        value={firNumber} 
                        onChange={e => setFirNumber(e.target.value)} 
                        className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        placeholder="FIR or case number" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium theme-text-muted block mb-2">
                          Police Station
                        </label>
                        <input 
                          value={policeStation} 
                          onChange={e => setPoliceStation(e.target.value)} 
                          className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                          placeholder="Police station" 
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium theme-text-muted block mb-2">
                          eCourts Case ID (optional)
                        </label>
                        <input 
                          value={courtCaseId} 
                          onChange={e => setCourtCaseId(e.target.value)} 
                          className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                          placeholder="Case ID" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold theme-text-primary border-b theme-border-glass pb-2">
                      Financial Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium theme-text-muted block mb-2">
                          Amount requested (₹)
                        </label>
                        <input 
                          type="number" 
                          min={0} 
                          value={amountRequested as string | number} 
                          onChange={e => setAmountRequested(e.target.value === '' ? '' : Number(e.target.value))} 
                          className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                          placeholder="Amount in INR" 
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium theme-text-muted block mb-2">
                          Bank account (optional)
                        </label>
                        <input 
                          value={bankAccount} 
                          onChange={e => setBankAccount(e.target.value.replace(/\D/g, ''))} 
                          className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                          placeholder="Account number" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium theme-text-muted block mb-2">
                          IFSC (optional)
                        </label>
                        <input 
                          value={ifsc} 
                          onChange={e => setIfsc(e.target.value.toUpperCase())} 
                          className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                          placeholder="AAAA0000000" 
                          maxLength={11} 
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium theme-text-muted block mb-2">
                          Supporting documents (max 5)
                        </label>
                        <div className="border-2 border-dashed theme-border-glass rounded-lg p-4 transition-colors hover:border-blue-400">
                          <input 
                            type="file" 
                            multiple 
                            onChange={handleFileChange} 
                            className="w-full text-sm theme-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors" 
                            accept="image/*,.pdf" 
                          />
                        </div>
                        {files.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {files.map((f, i) => (
                              <div key={i} className="flex items-center justify-between text-sm theme-bg-glass rounded-lg px-3 py-2">
                                <span className="theme-text-primary truncate flex-1">{f.name}</span>
                                <span className="theme-text-muted text-xs ml-2">
                                  ({Math.round(f.size/1024)} KB)
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="flex-1 accent-gradient hover:opacity-90 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                    <button 
                      type="button" 
                      onClick={resetForm}
                      className="px-6 py-3 border theme-border-glass theme-text-muted hover:theme-bg-glass font-medium rounded-lg transition-colors"
                    >
                      Reset Form
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Recent Submissions Tab */}
            {activeTab === 'recent' && (
              <motion.div
                key="recent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-4 md:p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold theme-text-primary">
                    Recent Submissions
                  </h3>
                  <span className="text-sm theme-text-muted">
                    {recent.length} application{recent.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {recent.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 theme-bg-glass rounded-full flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="theme-text-muted mb-2">No submissions yet</p>
                    <p className="text-sm theme-text-muted mb-4">
                      Your applications will appear here once submitted
                    </p>
                    <button
                      onClick={() => setActiveTab('form')}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Create your first application
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recent.map((r, index) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="theme-bg-glass rounded-xl p-4 border theme-border-glass hover:theme-border-primary transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold theme-text-primary truncate">
                                {r.name ?? (r.anonymous ? 'Anonymous' : '—')}
                              </h4>
                              {r.anonymous && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Anonymous
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm theme-text-muted">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {r.firNumber}
                              </span>
                              {r.amountRequested && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                  </svg>
                                  ₹{r.amountRequested.toLocaleString()}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(r.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-mono theme-text-muted theme-bg-card px-2 py-1 rounded border theme-border-glass">
                              {r.id}
                            </div>
                            <div className="text-xs theme-text-muted mt-1">
                              {new Date(r.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Success Notification */}
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed bottom-4 right-4 theme-bg-card theme-border-glass border rounded-lg p-4 shadow-lg max-w-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold theme-text-primary">Application Submitted</h4>
                  <p className="text-sm theme-text-muted">ID: {success.id}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}