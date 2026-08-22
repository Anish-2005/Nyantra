"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";
import {
  ChevronDown,
  Hash,
  Clock,
  User,
  DollarSign,
  Shield,
  CheckCircle,
  Lock,
  Zap,
  ArrowUpRight,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";

export default function BlockCard({ block, index, onOpenChange }: any) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [showFullHash, setShowFullHash] = useState(false);

  const isGenesis = index === 0;
  const isRecent = index > 0 && index < 3;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        scale: 1.03,
        y: -4,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className="relative group"
    >
      {/* Glow effect for recent blocks */}
      {isRecent && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
      )}

      <div
      className="relative theme-bg-glass theme-border-glass border backdrop-blur-xl rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-sm hover:shadow-blue-500/10"
      onClick={() => {
        const newOpen = !open;
        setOpen(newOpen);
        onOpenChange?.(newOpen);
      }}
      >
        {/* Header with gradient background */}
        <div className={`relative px-3 py-2.5 ${
          isGenesis
            ? 'bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10'
            : isRecent
            ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10'
            : 'bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Block icon with dynamic styling */}
              <div className={`relative p-2 rounded-lg ${
                isGenesis
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-500/25'
                  : isRecent
                  ? 'bg-gradient-to-br from-blue-400 to-purple-500 shadow-sm shadow-blue-500/25'
                  : 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-sm shadow-green-500/25'
              }`}>
                {isGenesis ? (
                  <Zap className="w-4 h-4 text-white" />
                ) : (
                  <Shield className="w-4 h-4 text-white" />
                )}
                {isRecent && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold theme-text-primary">
                    Block #{index}
                  </h3>
                  {isGenesis && (
                    <span className="px-1.5 py-0.5 text-xs font-medium bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-amber-700 rounded-full border border-amber-400/30">
                      Genesis
                    </span>
                  )}
                  {isRecent && (
                    <span className="px-1.5 py-0.5 text-xs font-medium bg-gradient-to-r from-blue-400/20 to-purple-500/20 text-blue-700 rounded-full border border-blue-400/30">
                      Recent
                    </span>
                  )}
                </div>
                <p className="text-xs theme-text-muted flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {block.date}
                </p>
              </div>
            </div>

            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <ChevronDown className="w-4 h-4 theme-text-primary" />
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-3">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:border-blue-400/40 transition-all"
            >
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-md bg-blue-500/20">
                  <User className="w-3 h-3 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-400 uppercase tracking-wide">{t('blockchain.beneficiary')}</p>
                  <p className="text-xs font-semibold theme-text-primary truncate">{block.beneficiary_id}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 hover:border-green-400/40 transition-all"
            >
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-md bg-green-500/20">
                  <DollarSign className="w-3 h-3 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-400 uppercase tracking-wide">{t('blockchain.amount')}</p>
                  <p className="text-sm font-bold text-green-400">₹{block.amount?.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-md bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/10">
              <div className="flex items-center space-x-2">
                <Hash className="w-3 h-3 text-purple-400" />
                <span className="text-xs font-medium theme-text-primary">{t('blockchain.transactionHash')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs theme-text-muted font-mono">
                  {showFullHash ? block.cur_hash : `${block.cur_hash?.substring(0, 12)}...`}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullHash(!showFullHash);
                  }}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                >
                  {showFullHash ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(block.cur_hash);
                  }}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-md bg-gradient-to-r from-orange-500/5 to-red-500/5 border border-orange-500/10">
                <p className="text-xs font-medium text-orange-400 uppercase tracking-wide mb-1">{t('blockchain.utpNumber')}</p>
                <p className="text-xs font-mono theme-text-primary">{block.utp_number}</p>
              </div>
              <div className="p-2 rounded-md bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/10">
                <p className="text-xs font-medium text-cyan-400 uppercase tracking-wide mb-1">{t('blockchain.transactionId')}</p>
                <p className="text-xs font-mono theme-text-primary truncate">{block.transaction_id}</p>
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div className="flex items-center justify-between p-2 rounded-md bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/10">
            <div className="flex items-center space-x-1">
              <Lock className="w-3 h-3 text-green-400" />
              <span className="text-xs font-medium theme-text-primary">{t('blockchain.securityStatus')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-green-400 font-semibold">{t('blockchain.verified')}</span>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t theme-border-glass"
            >
              <div className="p-4 space-y-3">
                <h4 className="text-sm font-semibold theme-text-primary flex items-center">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  {t('blockchain.detailedInformation')}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="p-2 rounded-md bg-gradient-to-r from-slate-500/5 to-gray-500/5 border border-slate-500/10">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{t('blockchain.nonce')}</p>
                      <p className="text-xs font-semibold theme-text-primary">{block.nonce}</p>
                    </div>

                    <div className="p-2 rounded-md bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10">
                      <p className="text-xs font-medium text-indigo-400 uppercase tracking-wide mb-1">{t('blockchain.merkleRoot')}</p>
                      <p className="text-xs font-mono theme-text-primary break-all">{block.merkle_root}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2 rounded-md bg-gradient-to-r from-rose-500/5 to-pink-500/5 border border-rose-500/10">
                      <p className="text-xs font-medium text-rose-400 uppercase tracking-wide mb-1">{t('blockchain.previousHash')}</p>
                      <p className="text-xs font-mono theme-text-primary break-all">{block.prev_hash || 'N/A'}</p>
                    </div>

                    <div className="p-2 rounded-md bg-gradient-to-r from-teal-500/5 to-cyan-500/5 border border-teal-500/10">
                      <p className="text-xs font-medium text-teal-400 uppercase tracking-wide mb-1">{t('blockchain.blockStatus')}</p>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-xs font-semibold text-green-400">{t('blockchain.confirmed')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Block validation indicator */}
                <div className="flex items-center justify-center space-x-1 p-3 rounded-md bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </motion.div>
                  <span className="text-xs font-semibold text-green-400">{t('blockchain.blockValidated')}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
