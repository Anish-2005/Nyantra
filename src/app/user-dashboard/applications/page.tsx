"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
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
  const [filter, setFilter] = useState<'all' | 'recent' | 'amount'>('all');
  const [selected, setSelected] = useState<Submission | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { t } = useLocale();

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
    if (window.confirm('Are you sure you want to clear all applications? This action cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      setItems([]);
      setSelected(null);
    }
  };

  const copyToClipboard = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = items.filter(i => {
    if (filter === 'recent') return new Date(i.createdAt) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    if (filter === 'amount') return (i.amountRequested ?? 0) > 0;
    return true;
  });

  const totalAmount = items.reduce((sum, item) => sum + (item.amountRequested ?? 0), 0);
  const recentCount = items.filter(item => 
    new Date(item.createdAt) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
  ).length;

  return (
    <div className="min-h-screen p-4 md:p-6 theme-bg-primary">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold theme-text-primary">
            My Applications
          </h1>
          <p className="theme-text-muted mt-2 text-sm md:text-base">
            Applications you submitted (stored locally in your browser).
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Applications List */}
          <div className="lg:col-span-2">
            <div className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6">
              {/* Header with Filters */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold theme-text-primary">{t('extracted.application_history')} </h2>
                  <p className="theme-text-muted mt-1 text-sm">
                    {filtered.length} of {items.length} application{items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-nowrap sm:flex-wrap theme-bg-glass border theme-border-glass rounded-full p-1 w-full sm:w-auto gap-1 overflow-x-auto sm:overflow-x-visible">
  {['all', 'recent', 'amount'].map(option => {
    const isActive = filter === option;
    const label =
      option === 'all' ? 'All Applications' :
      option === 'recent' ? 'Last 30 Days' : 'With Amount';

    return (
      <button
        key={option}
        onClick={() => setFilter(option as 'all' | 'recent' | 'amount')}
        aria-selected={isActive}
        role="tab"
        className={`
          flex-1 min-w-[8rem] sm:min-w-0 text-sm sm:text-sm font-medium rounded-full transition-colors duration-300
          px-3 sm:px-4 py-2 sm:py-2
          ${isActive 
            ? 'accent-gradient text-white shadow-md' 
            : 'bg-transparent theme-text-primary hover:theme-bg-glass'}
        `}
      >
        {label}
      </button>
    );
  })}
</div>

                  <button 
                    onClick={clearAll}
                    disabled={items.length === 0}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg border theme-border-glass theme-bg-glass theme-text-muted hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All
                  </button>
                </div>
              </div>

              {/* Applications List */}
              <div className="space-y-3">
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12 theme-bg-glass rounded-xl border theme-border-glass"
                    >
                      <div className="mx-auto w-16 h-16 theme-bg-primary rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="theme-text-muted mb-2">{t('extracted.no_applications_found')} </p>
                      <p className="text-sm theme-text-muted">
                        {items.length === 0 
                          ? "You haven't submitted any applications yet." 
                          : "No applications match your current filter."}
                      </p>
                    </motion.div>
                  ) : (
                    filtered.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelected(item)}
                        className={`p-4 rounded-xl border theme-border-glass cursor-pointer transition-all hover:scale-[1.02] ${
                          selected?.id === item.id 
                            ? 'accent-gradient text-white' 
                            : 'theme-bg-glass hover:theme-border-primary'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`font-semibold truncate ${
                                selected?.id === item.id ? 'text-white' : 'theme-text-primary'
                              }`}>
                                {item.name ?? (item.anonymous ? 'Anonymous' : 'Unnamed')}
                              </h3>
                              {item.anonymous && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  selected?.id === item.id 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  Anonymous
                                </span>
                              )}
                            </div>
                            <div className={`flex flex-wrap gap-4 text-sm ${
                              selected?.id === item.id ? 'text-white/90' : 'theme-text-muted'
                            }`}>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {item.firNumber}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                </svg>
                                {item.files?.length ?? 0} file{(item.files?.length ?? 0) !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          
                          <div className={`text-right ${
                            selected?.id === item.id ? 'text-white' : 'theme-text-primary'
                          }`}>
                            <div className="font-semibold text-lg">
                              {item.amountRequested ? `₹${item.amountRequested.toLocaleString()}` : '—'}
                            </div>
                            <div className={`text-sm ${
                              selected?.id === item.id ? 'text-white/80' : 'theme-text-muted'
                            }`}>
                              {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6">
              <h3 className="font-semibold theme-text-primary mb-4">{t('extracted.summary')} </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="theme-bg-glass rounded-xl p-4 border theme-border-glass text-center">
                  <div className="text-2xl font-bold theme-text-primary mb-1">{items.length}</div>
                  <div className="text-xs theme-text-muted">{t('extracted.total')} </div>
                </div>
                <div className="theme-bg-glass rounded-xl p-4 border theme-border-glass text-center">
                  <div className="text-2xl font-bold theme-text-primary mb-1">{recentCount}</div>
                  <div className="text-xs theme-text-muted">{t('extracted.last_30_days')} </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                  <div className="text-xs theme-text-muted mb-1">{t('extracted.total_amount_requested')} </div>
                  <div className="font-semibold theme-text-primary text-lg">
                    ₹{totalAmount.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                  <div className="text-xs theme-text-muted mb-1">{t('extracted.most_recent')} </div>
                  <div className="font-medium theme-text-primary text-sm mb-1 truncate">
                    {items[0]?.id ?? '—'}
                  </div>
                  <div className="text-xs theme-text-muted">
                    {items[0] ? new Date(items[0].createdAt).toLocaleDateString() : '--'}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Application Details */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold theme-text-primary">{t('extracted.application_details')} </h4>
                    <button
                      onClick={() => setSelected(null)}
                      className="p-1 rounded-lg theme-text-muted hover:theme-bg-glass transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b theme-border-glass">
                      <span className="text-sm theme-text-muted">{t('extracted.application_id')} </span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs theme-text-primary bg-theme-glass px-2 py-1 rounded">
                          {selected.id}
                        </code>
                        <button
                          onClick={() => copyToClipboard(selected.id)}
                          className="p-1 rounded theme-text-muted hover:theme-bg-glass transition-colors"
                          title={t('extracted.copy_id')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b theme-border-glass">
                      <span className="text-sm theme-text-muted">{t('extracted.fir_number')} </span>
                      <span className="text-sm font-medium theme-text-primary">{selected.firNumber}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b theme-border-glass">
                      <span className="text-sm theme-text-muted">{t('extracted.applicant_name')} </span>
                      <span className="text-sm font-medium theme-text-primary">
                        {selected.name ?? (selected.anonymous ? 'Anonymous' : 'Not provided')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b theme-border-glass">
                      <span className="text-sm theme-text-muted">{t('extracted.amount')} </span>
                      <span className="text-sm font-medium theme-text-primary">
                        {selected.amountRequested ? `₹${selected.amountRequested.toLocaleString()}` : 'Not specified'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b theme-border-glass">
                      <span className="text-sm theme-text-muted">{t('extracted.files')} </span>
                      <span className="text-sm font-medium theme-text-primary">
                        {selected.files?.length ?? 0}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm theme-text-muted">{t('extracted.submitted')} </span>
                      <span className="text-sm theme-text-primary">
                        {new Date(selected.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => copyToClipboard(selected.id)}
                      className="flex-1 accent-gradient text-white py-2.5 px-4 rounded-lg font-medium transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                      {copiedId === selected.id ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy ID
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Copy Success Notification */}
            <AnimatePresence>
              {copiedId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="fixed bottom-4 right-4 theme-bg-card theme-border-glass border rounded-lg p-4 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium theme-text-primary">{t('extracted.copied_to_clipboard')} </p>
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