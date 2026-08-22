"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

interface AddBlockFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

const inputCls = "w-full h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors";

const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1">{children}</label>
);

export default function AddBlockForm({ onCancel, onSuccess }: AddBlockFormProps) {
  const { t } = useLocale();
  const [form, setForm] = useState({
    beneficiary_id: "",
    utp_number: "",
    transaction_id: "",
    amount: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onCancel]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/blockchain", {
        method: "POST",
        body: JSON.stringify({
          transactions: [
            {
              beneficiary_id: form.beneficiary_id,
              utp_number: form.utp_number,
              transaction_id: form.transaction_id,
              amount: Number(form.amount)
            }
          ]
        })
      });

      const data = await res.json();

      if (data.status === "success") {
        setMessage(t('blockchain.blockAddedSuccessfully'));
        setForm({
          beneficiary_id: "",
          utp_number: "",
          transaction_id: "",
          amount: ""
        });
        onSuccess?.();
      } else {
        setMessage("Error: " + data.message);
      }
    } catch {
      setMessage(t('blockchain.requestFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCancel}
        className="fixed inset-0 bg-black/50 z-[60]"
      />

      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-y-0 right-0 w-full max-w-md z-[70] theme-drawer backdrop-blur-2xl border-l theme-border-glass flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass shrink-0">
          <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">
            {t('blockchain.addNewBlock')}
          </h2>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} id="add-block-form" className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
              Transaction Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>{t('blockchain.beneficiaryId')} *</Label>
                <input
                  type="text"
                  required
                  value={form.beneficiary_id}
                  onChange={(e) => setForm({ ...form, beneficiary_id: e.target.value })}
                  className={inputCls}
                  placeholder={t('blockchain.enterBeneficiaryId')}
                />
              </div>
              <div>
                <Label>{t('blockchain.utpNumber')} *</Label>
                <input
                  type="text"
                  required
                  value={form.utp_number}
                  onChange={(e) => setForm({ ...form, utp_number: e.target.value })}
                  className={inputCls}
                  placeholder={t('blockchain.enterUtpNumber')}
                />
              </div>
              <div>
                <Label>{t('blockchain.transactionId')} *</Label>
                <input
                  type="text"
                  required
                  value={form.transaction_id}
                  onChange={(e) => setForm({ ...form, transaction_id: e.target.value })}
                  className={inputCls}
                  placeholder={t('blockchain.enterTransactionId')}
                />
              </div>
              <div className="col-span-2">
                <Label>{t('blockchain.amount')} *</Label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className={`${inputCls} tabular-nums`}
                  placeholder={t('blockchain.enterAmount')}
                />
              </div>
            </div>
          </section>

          {message && (
            <div className={`rounded-md border px-3 py-2 text-xs ${
              message.includes('success') || message.includes('Success')
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-red-500/30 bg-red-500/10 text-red-500'
            }`}>
              {message}
            </div>
          )}
        </form>

        <div className="px-4 py-3 border-t theme-border-glass flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-9 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors"
          >
            {t('extracted.cancel')}
          </button>
          <button
            type="submit"
            form="add-block-form"
            disabled={loading}
            className="flex-1 h-9 accent-gradient text-white rounded-md inline-flex items-center justify-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {loading ? t('blockchain.addingBlock') : t('blockchain.addBlock')}
          </button>
        </div>
      </motion.aside>
    </>,
    document.body
  );
}
