"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import BackgroundAnimation from "@/components/BackgroundAnimation";
import ChainView from "./ChainView";
import AddBlockForm from "./AddBlockForm";
import { RefreshCw, Database, Shield, Activity } from "lucide-react";

export default function BlockchainDashboard() {
  const { theme } = useTheme();
  const { user, profile, loading } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [chain, setChain] = useState([]);
  const [message, setMessage] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);

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

      <div className="relative z-10 p-6 space-y-8">
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
          </div>
          <p className="text-lg theme-text-muted max-w-2xl mx-auto">
            {t('blockchain.description')}
          </p>
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
  );
}
