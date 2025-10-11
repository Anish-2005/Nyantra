"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Tx = { 
  id: string; 
  date: string; 
  amount: number; 
  status: 'pending' | 'processing' | 'paid' | 'failed'; 
  note?: string;
  beneficiary?: string;
  method?: 'bank_transfer' | 'upi' | 'cash';
};

function randomStatus(): Tx['status'] {
  const list: Tx['status'][] = ['pending', 'processing', 'paid', 'failed'];
  return list[Math.floor(Math.random() * list.length)];
}

function randomMethod(): Tx['method'] {
  const list: Tx['method'][] = ['bank_transfer', 'upi', 'cash'];
  return list[Math.floor(Math.random() * list.length)];
}

function randomBeneficiary(): string {
  const names = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Singh', 'Vikram Joshi', 'Anjali Gupta'];
  return names[Math.floor(Math.random() * names.length)];
}

export default function DisbursementsPage() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'paid' | 'failed'>('all');
  const [selectedTx, setSelectedTx] = useState<Tx | null>(null);
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month' | 'quarter'>('all');

  useEffect(() => {
    // Create mock history with more realistic data
    const now = Date.now();
    const mock: Tx[] = Array.from({ length: 12 }).map((_, i) => ({ 
      id: `TX-${now - i * 86400000}`, 
      date: new Date(now - i * 86400000).toISOString(), 
      amount: Math.round((Math.random() * 30 + 10)) * 1000, 
      status: randomStatus(), 
      note: i % 3 === 0 ? 'Relief Assistance' : i % 4 === 0 ? 'Medical Support' : 'Financial Aid',
      beneficiary: randomBeneficiary(),
      method: randomMethod()
    }));
    setTxs(mock);
  }, []);

  const filteredTxs = txs.filter(tx => {
    if (filter !== 'all' && tx.status !== filter) return false;
    
    const txDate = new Date(tx.date);
    const now = new Date();
    
    switch (timeRange) {
      case 'week':
        return txDate > new Date(now.getTime() - 7 * 86400000);
      case 'month':
        return txDate > new Date(now.getTime() - 30 * 86400000);
      case 'quarter':
        return txDate > new Date(now.getTime() - 90 * 86400000);
      default:
        return true;
    }
  });

  const total = filteredTxs.reduce((s, t) => s + t.amount, 0);
  const paidAmount = filteredTxs.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const pendingAmount = filteredTxs.filter(t => t.status === 'pending' || t.status === 'processing').reduce((s, t) => s + t.amount, 0);

  const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return `
        bg-yellow-100 text-yellow-800 border border-yellow-200 
        dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30
      `;
    case 'processing':
      return `
        bg-blue-100 text-blue-800 border border-blue-200 
        dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30
      `;
    case 'paid':
      return `
        bg-green-100 text-green-800 border border-green-200 
        dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30
      `;
    case 'failed':
      return `
        bg-red-100 text-red-800 border border-red-200 
        dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30
      `;
    default:
      return `
        bg-gray-100 text-gray-800 border border-gray-200 
        dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30
      `;
  }
};


  const getMethodIcon = (method?: Tx['method']) => {
    const icons: Partial<Record<NonNullable<Tx['method']>, JSX.Element>> = {
      bank_transfer: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      upi: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      cash: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    };
    // return corresponding icon or a default placeholder if method is undefined
    if (method && icons[method]) return icons[method];
    return (
      <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
      </svg>
    );
  };

  const getMethodText = (method?: Tx['method']) => {
    const texts: Record<NonNullable<Tx['method']>, string> = {
      bank_transfer: 'Bank Transfer',
      upi: 'UPI Payment',
      cash: 'Cash Disbursement'
    };
    return method ? texts[method as NonNullable<Tx['method']>] : 'Unknown';
  };

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
            Payments & Disbursements
          </h1>
          <p className="theme-text-muted mt-2 text-sm md:text-base">
            Track your relief payment history and disbursement status
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual diff for status badges */}
          <div className="lg:col-span-3">
          </div>
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6">
              {/* Header with Filters */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold theme-text-primary">Transaction History</h2>
                  <p className="theme-text-muted mt-1 text-sm">
                    {filteredTxs.length} transaction{filteredTxs.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
  {/* Time Range Toggle */}
  <div className="inline-flex items-center flex-nowrap sm:flex-wrap theme-bg-glass border theme-border-glass rounded-full p-1 gap-2 overflow-x-auto sm:overflow-x-visible sm:bg-transparent sm:border-0 sm:rounded-none sm:p-0 sm:gap-3 sm:items-center">
    {(['all', 'week', 'month', 'quarter'] as const).map(option => {
      const isActive = timeRange === option;
      const label =
        option === 'all' ? 'All Time' :
        option === 'week' ? 'Last 7 Days' :
        option === 'month' ? 'Last 30 Days' :
        'Last 90 Days';

      return (
        <button
          key={option}
          onClick={() => setTimeRange(option)}
          role="tab"
          aria-selected={isActive}
          className={`
            inline-flex items-center justify-center whitespace-nowrap text-sm font-medium rounded-full transition-colors duration-200
            px-3 sm:px-4 py-2 sm:py-1.5
            ${isActive 
              ? 'accent-gradient text-white shadow-md' 
              : 'bg-transparent theme-text-primary hover:theme-bg-glass sm:border sm:border-transparent sm:hover:border-gray-200 dark:sm:hover:border-gray-700'}
          `}
        >
          {label}
        </button>
      );
    })}
  </div>

  {/* Status Filter Toggle */}
  <div className="inline-flex items-center flex-nowrap sm:flex-wrap theme-bg-glass border theme-border-glass rounded-full p-1 gap-2 overflow-x-auto sm:overflow-x-visible sm:bg-transparent sm:border-0 sm:rounded-none sm:p-0 sm:gap-3 sm:items-center">
    {(['all', 'pending', 'processing', 'paid', 'failed'] as const).map(option => {
      const isActive = filter === option;
      const label =
        option === 'all' ? 'All Status' :
        option.charAt(0).toUpperCase() + option.slice(1);

      return (
        <button
          key={option}
          onClick={() => setFilter(option)}
          role="tab"
          aria-selected={isActive}
          className={`
            inline-flex items-center justify-center whitespace-nowrap text-sm font-medium rounded-full transition-colors duration-200
            px-3 sm:px-4 py-2 sm:py-1.5
            ${isActive 
              ? 'accent-gradient text-white shadow-md' 
              : 'bg-transparent theme-text-primary hover:theme-bg-glass sm:border sm:border-transparent sm:hover:border-gray-200 dark:sm:hover:border-gray-700'}
          `}
        >
          {label}
        </button>
      );
    })}
  </div>
</div>

              </div>

              {/* Transactions List */}
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredTxs.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12 theme-bg-glass rounded-xl border theme-border-glass"
                    >
                      <div className="mx-auto w-16 h-16 theme-bg-primary rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <p className="theme-text-muted mb-2">No transactions found</p>
                      <p className="text-sm theme-text-muted">
                        {txs.length === 0 
                          ? "No disbursement history available" 
                          : "No transactions match your current filters"}
                      </p>
                    </motion.div>
                  ) : (
                    filteredTxs.map((tx, index) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedTx(tx)}
                        className={`p-4 rounded-xl border theme-border-glass cursor-pointer transition-all hover:scale-[1.02] ${
                          selectedTx?.id === tx.id 
                            ? 'accent-gradient text-white' 
                            : 'theme-bg-glass hover:theme-border-primary'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`font-semibold ${
                                selectedTx?.id === tx.id ? 'text-white' : 'theme-text-primary'
                              }`}>
                                {tx.note}
                              </h3>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                                {tx.status}
                              </span>
                            </div>
                            
                            <div className={`flex flex-wrap gap-4 text-sm ${
                              selectedTx?.id === tx.id ? 'text-white/90' : 'theme-text-muted'
                            }`}>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {tx.beneficiary}
                              </span>
                              
                              <span className="flex items-center gap-1">
                                {getMethodIcon(tx.method)}
                                {getMethodText(tx.method)}
                              </span>
                              
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(tx.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className={`text-right ${
                            selectedTx?.id === tx.id ? 'text-white' : 'theme-text-primary'
                          }`}>
                            <div className="font-semibold text-lg">
                              ₹{tx.amount.toLocaleString()}
                            </div>
                            <div className={`text-sm ${
                              selectedTx?.id === tx.id ? 'text-white/80' : 'theme-text-muted'
                            }`}>
                              {new Date(tx.date).toLocaleTimeString()}
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
            {/* Summary Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
            >
              <h3 className="font-semibold theme-text-primary mb-4">Financial Summary</h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl theme-bg-glass border theme-border-glass">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm theme-text-muted">Total Disbursed</span>
                    <svg className="w-5 h-5 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="font-bold text-2xl theme-text-primary">
                    ₹{total.toLocaleString()}
                  </div>
                  <div className="text-xs theme-text-muted mt-1">
                    Across {filteredTxs.length} transactions
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass text-center">
                    <div className="text-green-600 text-lg font-bold">₹{paidAmount.toLocaleString()}</div>
                    <div className="text-xs theme-text-muted">Paid</div>
                  </div>
                  
                  <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass text-center">
                    <div className="text-amber-600 text-lg font-bold">₹{pendingAmount.toLocaleString()}</div>
                    <div className="text-xs theme-text-muted">Pending</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                  <div className="text-xs theme-text-muted mb-1">Successful Transactions</div>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold theme-text-primary">
                      {filteredTxs.filter(t => t.status === 'paid').length}
                    </div>
                    <div className="text-xs theme-text-muted">
                      of {filteredTxs.length}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Selected Transaction Details */}
            <AnimatePresence>
              {selectedTx && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold theme-text-primary">Transaction Details</h4>
                    <button
                      onClick={() => setSelectedTx(null)}
                      className="p-1 rounded-lg theme-text-muted hover:theme-bg-glass transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm theme-text-muted mb-1">Description</div>
                      <div className="font-medium theme-text-primary">{selectedTx.note}</div>
                    </div>

                    <div>
                      <div className="text-sm theme-text-muted mb-1">Beneficiary</div>
                      <div className="font-medium theme-text-primary">{selectedTx.beneficiary}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm theme-text-muted mb-1">Amount</div>
                        <div className="font-bold text-lg theme-text-primary">
                          ₹{selectedTx.amount.toLocaleString()}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm theme-text-muted mb-1">Status</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTx.status)}`}>
                          {selectedTx.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm theme-text-muted mb-1">Payment Method</div>
                        <div className="flex items-center gap-2 text-sm theme-text-primary">
                          {getMethodIcon(selectedTx.method)}
                          {getMethodText(selectedTx.method)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm theme-text-muted mb-1">Transaction ID</div>
                        <div className="font-mono text-xs theme-text-primary">
                          {selectedTx.id}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t theme-border-glass">
                      <div className="text-sm theme-text-muted mb-1">Date & Time</div>
                      <div className="theme-text-primary text-sm">
                        {new Date(selectedTx.date).toLocaleString()}
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