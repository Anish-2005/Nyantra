"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import BackgroundAnimation from "@/components/BackgroundAnimation";
import ChainView from "./ChainView";
import AddBlockForm from "./AddBlockForm";
import { RefreshCw, Database, Shield, Activity, Lock, Key, Check } from "lucide-react";

export default function BlockchainDashboard() {
  const { theme } = useTheme();
  const { user, profile, loading } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [chain, setChain] = useState([]);
  const [message, setMessage] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);

  // Access control states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Generate weekly access key based on current week
  const generateWeeklyKey = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    
    // Create a deterministic key based on year and week
    const baseString = `${now.getFullYear()}W${weekNumber}NYANTRA`;
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert hash to alphanumeric string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const positiveHash = Math.abs(hash);
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(positiveHash % chars.length);
      hash = Math.floor(positiveHash / chars.length);
    }
    
    return result;
  };

  // Validate access key
  const validateAccessKey = (inputKey: string) => {
    const currentKey = process.env.NEXT_PUBLIC_BLOCKCHAIN_ACCESS_KEY || generateWeeklyKey();
    return inputKey.toUpperCase() === currentKey;
  };

  // Handle key submission
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

  // Handle manual lock
  const handleManualLock = () => {
    setIsUnlocked(false);
    setShowKeyModal(true);
    localStorage.removeItem('blockchain_unlocked');
    localStorage.removeItem('blockchain_unlock_time');
  };

  // Check if access is still valid (within 7 days)
  useEffect(() => {
    const unlocked = localStorage.getItem('blockchain_unlocked');
    const unlockTime = localStorage.getItem('blockchain_unlock_time');
    
    if (unlocked === 'true' && unlockTime) {
      const timeDiff = Date.now() - parseInt(unlockTime);
      const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      
      if (timeDiff < sevenDays) {
        setIsUnlocked(true);
      } else {
        // Access expired, clear localStorage
        localStorage.removeItem('blockchain_unlocked');
        localStorage.removeItem('blockchain_unlock_time');
        setShowKeyModal(true);
      }
    } else {
      setShowKeyModal(true);
    }
  }, []);

  // Redirect if user is not officer
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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 theme-text-primary mx-auto mb-4"></div>
          <p className="theme-text-primary">{t('blockchain.loading')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundAnimation />

      {/* Access Key Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md mx-4"
            >
              <div className="theme-bg-card theme-border-glass border rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold theme-text-primary mb-2">
                    Access Restricted
                  </h2>
                  <p className="text-sm theme-text-muted">
                    This page requires a weekly access key to view sensitive blockchain data.
                  </p>
                </div>

                <form onSubmit={handleKeySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      Enter Access Key
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
                      <input
                        type="text"
                        value={accessKey}
                        onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                        placeholder="Enter 8-character key"
                        className="w-full pl-10 pr-4 py-3 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-center font-mono text-lg tracking-wider"
                        maxLength={8}
                        required
                      />
                    </div>
                  </div>

                  {keyError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm"
                    >
                      {keyError}
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 rounded-lg accent-gradient text-white font-medium flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Unlock Access
                  </motion.button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-xs theme-text-muted">
                    Key refreshes weekly for security. Contact administrator if you need access.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Blurred when locked */}
      <div className={`relative z-10 transition-all duration-500 ${!isUnlocked ? 'blur-sm pointer-events-none select-none' : ''}`}>
        <div className="p-6 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 rounded-full theme-bg-glass theme-border-glass border backdrop-blur-xl">
              <Database className="w-8 h-8 theme-text-primary" />
            </div>
            <h1 className="text-4xl font-bold animate-gradient-slow">
              {t('blockchain.title')}
            </h1>
            {/* Manual Lock Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleManualLock}
              className="p-3 rounded-full theme-bg-glass theme-border-glass border backdrop-blur-xl hover:bg-red-500/20 transition-colors group"
              title="Lock Page"
            >
              <Lock className="w-6 h-6 theme-text-primary group-hover:text-red-400 transition-colors" />
            </motion.button>
          </div>
          <p className="text-lg theme-text-muted max-w-2xl mx-auto">
            {t('blockchain.description')}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm theme-text-muted">
            <Shield className="w-4 h-4" />
            <span>Access expires in 7 days • </span>
            <button
              onClick={handleManualLock}
              className="text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
            >
              Lock Now
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="theme-bg-glass theme-border-glass border backdrop-blur-xl rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm theme-text-muted">{t('blockchain.totalBlocks')}</p>
                <p className="text-2xl font-bold theme-text-primary">{chain.length}</p>
              </div>
            </div>
          </div>

          <div className="theme-bg-glass theme-border-glass border backdrop-blur-xl rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm theme-text-muted">{t('blockchain.networkStatus')}</p>
                <p className="text-lg font-semibold text-green-400">{t('blockchain.active')}</p>
              </div>
            </div>
          </div>

          <div className="theme-bg-glass theme-border-glass border backdrop-blur-xl rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Database className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm theme-text-muted">{t('blockchain.lastUpdated')}</p>
                <p className="text-sm theme-text-primary">
                  {chain.length > 0 ? new Date(chain[chain.length - 1]?.date).toLocaleString() : t('blockchain.never')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchChain}
            disabled={fetchLoading}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl theme-bg-glass theme-border-glass border backdrop-blur-xl theme-text-primary hover:theme-bg-glass/80 transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${fetchLoading ? 'animate-spin' : ''}`} />
            <span>{fetchLoading ? t('blockchain.refreshing') : t('blockchain.refreshChain')}</span>
          </motion.button>
        </motion.div>

        {/* Status Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl backdrop-blur-xl border ${
              message.includes('success') || message.includes('Success')
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : 'bg-red-500/20 border-red-500/30 text-red-400'
            }`}
          >
            {message}
          </motion.div>
        )}

        {/* Add Block Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <AddBlockForm onSuccess={fetchChain} />
        </motion.div>

        {/* Chain View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <ChainView chain={chain} />
        </motion.div>
        </div>
      </div>
    </div>
  );
}
