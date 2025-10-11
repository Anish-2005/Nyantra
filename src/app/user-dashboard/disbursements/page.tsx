"use client";
import React, { useEffect, useState } from 'react';

type Tx = { id: string; date: string; amount: number; status: 'pending' | 'processing' | 'paid' | 'failed'; note?: string };

function randomStatus() {
  const list: Tx['status'][] = ['pending','processing','paid','failed'];
  return list[Math.floor(Math.random()*list.length)];
}

export default function DisbursementsPage() {
  const [txs, setTxs] = useState<Tx[]>([]);

  useEffect(() => {
    // create mock history
    const now = Date.now();
    const mock: Tx[] = Array.from({length:8}).map((_,i) => ({ id: `TX-${now - i*86400000}`, date: new Date(now - i*86400000).toISOString(), amount: Math.round((Math.random()*30+10))*1000, status: randomStatus(), note: i%3===0 ? 'Auto DBT' : '' }));
    setTxs(mock);
  }, []);

  const total = txs.reduce((s,t) => s + t.amount, 0);

  return (
    <div className="min-h-screen">
      <div className="theme-bg-card theme-border-glass border rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold theme-text-primary">Payments & Disbursements</h2>
            <p className="theme-text-muted mt-1">Recent DBT transfer history.</p>
          </div>
          <div className="text-right">
            <div className="text-xs theme-text-muted">Total disbursed</div>
            <div className="font-semibold text-lg theme-text-primary">₹{total.toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-6 space-y-3 max-h-[60vh] overflow-auto">
          {txs.map(tx => (
            <div key={tx.id} className="p-3 rounded-lg theme-bg-glass border theme-border-glass flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="font-medium theme-text-primary">{tx.note || 'Relief Payment'}</div>
                <div className="text-xs theme-text-muted">{new Date(tx.date).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">₹{tx.amount.toLocaleString()}</div>
                <div className={`text-xs inline-flex items-center px-2 py-1 rounded-full mt-1 ${tx.status==='paid' ? 'text-green-700 bg-green-100' : tx.status==='processing' ? 'text-amber-700 bg-amber-100' : tx.status==='pending' ? 'text-blue-700 bg-blue-100' : 'text-red-700 bg-red-100'}`}>{tx.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
