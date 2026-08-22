"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import ChainView from "./ChainView";
import AddBlockForm from "./AddBlockForm";
import { RefreshCw, Lock, Key, Check, Plus } from "lucide-react";
import { Block } from "@/app/api/blockchain/block";

export default function BlockchainDashboard() {
  const { profile, loading } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [chain, setChain] = useState<Block[]>([]);
  const [message, setMessage] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);

  // Access control states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Generate weekly access key based on current week
  const generateWeeklyKey = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);

    const baseString = `${now.getFullYear()}W${weekNumber}NYANTRA`;
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const positiveHash = Math.abs(hash);
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(positiveHash % chars.length);
      hash = Math.floor(positiveHash / chars.length);
    }

    return result;
  };

  const validateAccessKey = (inputKey: string) => {
    const currentKey = process.env.NEXT_PUBLIC_BLOCKCHAIN_ACCESS_KEY || generateWeeklyKey();
    return inputKey.toUpperCase() === currentKey;
  };

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError("");

    if (validateAccessKey(accessKey)) {
      setIsUnlocked(true);
      setShowKeyModal(false);
      setAccessKey("");
      localStorage.setItem('blockchain_unlocked', 'true');
      localStorage.setItem('blockchain_unlock_time', Date.now().toString());
    } else {
      setKeyError("Invalid access key. Please try again.");
    }
  };

  const handleManualLock = () => {
    setIsUnlocked(false);
    setShowKeyModal(true);
    localStorage.removeItem('blockchain_unlocked');
    localStorage.removeItem('blockchain_unlock_time');
  };

  useEffect(() => {
    const unlocked = localStorage.getItem('blockchain_unlocked');
    const unlockTime = localStorage.getItem('blockchain_unlock_time');

    if (unlocked === 'true' && unlockTime) {
      const timeDiff = Date.now() - parseInt(unlockTime);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      if (timeDiff < sevenDays) {
        setIsUnlocked(true);
      } else {
        localStorage.removeItem('blockchain_unlocked');
        localStorage.removeItem('blockchain_unlock_time');
        setShowKeyModal(true);
      }
    } else {
      setShowKeyModal(true);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!profile || profile.role !== "officer") {
        router.replace("/unauthorized");
      }
    }
  }, [loading, profile]);

  const fetchChain = async () => {
    try {
      setFetchLoading(true);
      const res = await fetch("/api/blockchain");
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
      const data = await res.json();

      if (data.chain && Array.isArray(data.chain)) {
        setChain(data.chain);
        setMessage(data.message || t('blockchain.loadedSuccessfully'));
      } else {
        setMessage(t('blockchain.invalidDataFormat'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('blockchain.fetchError');
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setFetchLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="space-y-4 max-w-[1400px]">
        <div className="theme-bg-card theme-border-glass border rounded-xl p-8 flex items-center justify-center gap-3 shadow-sm">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm theme-text-secondary">{t('blockchain.loading')}</p>
        </div>
      </div>
    );
  }

  const isSuccessMessage = message.includes('success') || message.includes('Success');

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Access Key Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="theme-bg-card theme-border-glass border rounded-xl p-5 shadow-sm w-full max-w-md"
            >
              <div className="text-center mb-5">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="text-base font-semibold tracking-tight theme-text-primary mb-1">
                  Access Restricted
                </h2>
                <p className="text-xs theme-text-muted">
                  This page requires a weekly access key to view sensitive blockchain data.
                </p>
              </div>

              <form onSubmit={handleKeySubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1">
                    Enter Access Key
                  </label>
                  <div className="relative">
                    <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
                    <input
                      type="text"
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                      placeholder="Enter 8-character key"
                      className="w-full h-9 pl-8 pr-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm text-center font-mono tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                      maxLength={8}
                      required
                    />
                  </div>
                </div>

                {keyError && (
                  <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">
                    {keyError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-9 accent-gradient text-white rounded-md inline-flex items-center justify-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <Check className="w-3.5 h-3.5" />
                  Unlock Access
                </button>
              </form>

              <p className="mt-4 text-center text-[11px] theme-text-muted">
                Key refreshes weekly for security. Contact administrator if you need access.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`space-y-4 transition-all duration-300 ${!isUnlocked ? 'blur-sm pointer-events-none select-none' : ''}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
              Blockchain <span className="text-accent-gradient">Ledger</span>
            </h1>
            <p className="text-xs theme-text-muted mt-0.5 truncate">
              {t('blockchain.description')}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchChain}
              disabled={fetchLoading}
              className="h-9 px-3.5 rounded-md border theme-border-glass inline-flex items-center gap-1.5 text-xs font-medium theme-text-secondary hover:theme-bg-glass hover:theme-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetchLoading ? 'animate-spin' : ''}`} />
              <span>{fetchLoading ? t('blockchain.refreshing') : t('blockchain.refreshChain')}</span>
            </button>
            <button
              onClick={handleManualLock}
              title="Lock Page"
              className="h-9 px-3.5 rounded-md border theme-border-glass inline-flex items-center gap-1.5 text-xs font-medium theme-text-secondary hover:theme-bg-glass hover:theme-text-primary transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
            <button
              onClick={() => setShowAddBlock(true)}
              className="h-9 px-3.5 accent-gradient text-white rounded-md inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('blockchain.addNewBlock')}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
          <div className="theme-bg-card p-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('blockchain.totalBlocks')}</p>
            <p className="text-xl font-semibold tracking-tight theme-text-primary mt-1 tabular-nums">{chain.length}</p>
          </div>
          <div className="theme-bg-card p-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('blockchain.networkStatus')}</p>
            <p className="text-xl font-semibold tracking-tight theme-text-primary mt-1">{t('blockchain.active')}</p>
          </div>
          <div className="theme-bg-card p-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">Latest Block</p>
            <p className="text-xl font-semibold tracking-tight theme-text-primary mt-1 tabular-nums">
              {chain.length > 0 ? `#${chain.length - 1}` : '—'}
            </p>
          </div>
          <div className="theme-bg-card p-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('blockchain.lastUpdated')}</p>
            <p className="text-sm font-semibold tracking-tight theme-text-primary mt-1.5 tabular-nums truncate">
              {chain.length > 0 ? new Date(chain[chain.length - 1]?.date).toLocaleString() : t('blockchain.never')}
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {message && (
          <div className={`rounded-lg border px-3 py-2 text-xs ${
            isSuccessMessage
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-red-500/30 bg-red-500/10 text-red-500'
          }`}>
            {message}
          </div>
        )}

        {/* Chain View */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <ChainView chain={chain} />
        </motion.div>
      </div>

      {/* Add Block Drawer */}
      <AnimatePresence>
        {showAddBlock && (
          <AddBlockForm
            onCancel={() => setShowAddBlock(false)}
            onSuccess={fetchChain}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
