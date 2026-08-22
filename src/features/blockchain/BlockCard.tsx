"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { ChevronDown, Copy, Eye, EyeOff, CheckCircle, Lock } from "lucide-react";

const Pair = ({ label, value, valueClass = "" }: { label: string; value: React.ReactNode; valueClass?: string }) => (
  <div className="min-w-0">
    <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{label}</dt>
    <dd className={`text-[13px] font-medium theme-text-primary mt-0.5 ${valueClass || "truncate"}`}>{value}</dd>
  </div>
);

export default function BlockCard({ block, index }: { block: any; index: number }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [showFullHash, setShowFullHash] = useState(false);

  const isGenesis = index === 0;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const iconBtnCls = "p-1 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0";

  return (
    <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 border-b theme-border-glass flex items-center justify-between gap-3 text-left hover:theme-bg-hover transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs font-semibold theme-text-primary shrink-0">Block #{index}</span>
          {isGenesis && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md theme-bg-glass theme-text-secondary border theme-border-glass shrink-0">
              Genesis
            </span>
          )}
          <span className="font-mono text-xs theme-text-muted truncate hidden sm:inline">
            {block.cur_hash ? `${block.cur_hash.substring(0, 16)}...` : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs theme-text-muted tabular-nums hidden md:inline">{block.date}</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 theme-text-muted" />
          </motion.span>
        </div>
      </button>

      {/* Body */}
      <div className="px-4 py-3">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
          <Pair label={t('blockchain.beneficiary')} value={block.beneficiary_id} />
          <Pair label={t('blockchain.amount')} value={`₹${block.amount?.toLocaleString()}`} />
          <Pair label={t('blockchain.utpNumber')} value={block.utp_number} valueClass="font-mono truncate" />
          <Pair label={t('blockchain.transactionId')} value={block.transaction_id} valueClass="font-mono truncate" />
        </dl>

        <div className="mt-3 pt-3 border-t theme-border-glass flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('blockchain.transactionHash')}</p>
            <p className="text-xs font-mono theme-text-primary mt-0.5 break-all">
              {showFullHash ? block.cur_hash : `${block.cur_hash?.substring(0, 24)}...`}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setShowFullHash(!showFullHash)}
              className={iconBtnCls}
              aria-label="Toggle full hash"
            >
              {showFullHash ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => copyToClipboard(block.cur_hash)}
              className={iconBtnCls}
              aria-label="Copy hash"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t theme-border-glass flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider theme-text-muted">
            <Lock className="w-3 h-3" />
            {t('blockchain.securityStatus')}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t('blockchain.verified')}
          </div>
        </div>

        {/* Expandable Details */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-3">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  <Pair label={t('blockchain.nonce')} value={block.nonce} />
                  <Pair label={t('blockchain.merkleRoot')} value={block.merkle_root} valueClass="font-mono break-all" />
                  <Pair label={t('blockchain.previousHash')} value={block.prev_hash || 'N/A'} valueClass="font-mono break-all" />
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('blockchain.blockStatus')}</dt>
                    <dd className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {t('blockchain.confirmed')}
                    </dd>
                  </div>
                </dl>

                <div className="flex items-center justify-center gap-1.5 pt-3 border-t theme-border-glass text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {t('blockchain.blockValidated')}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
