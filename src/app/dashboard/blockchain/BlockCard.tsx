"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { ChevronDown, Hash, Clock, User, DollarSign, Shield } from "lucide-react";

export default function BlockCard({ block, index }: any) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="theme-bg-glass theme-border-glass border backdrop-blur-xl rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20">
            <Shield className="w-5 h-5 theme-text-primary" />
          </div>
          <div>
            <h3 className="font-bold theme-text-primary">Block #{index}</h3>
            <p className="text-xs theme-text-muted">Genesis Block</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 theme-text-primary" />
        </motion.div>
      </div>

      {/* Key Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-blue-400" />
          <span className="text-sm theme-text-primary truncate">{block.beneficiary_id}</span>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-green-400" />
          <span className="text-sm font-semibold text-green-400">₹{block.amount?.toLocaleString()}</span>
        </div>
      </div>

      {/* UTP & Transaction */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div>
          <p className="theme-text-muted text-xs">UTP:</p>
          <p className="theme-text-primary font-mono text-xs truncate">{block.utp_number}</p>
        </div>
        <div>
          <p className="theme-text-muted text-xs">TXN ID:</p>
          <p className="theme-text-primary font-mono text-xs truncate">{block.transaction_id}</p>
        </div>
      </div>

      {/* Hash Preview */}
      <div className="flex items-center space-x-2 mb-4">
        <Hash className="w-4 h-4 text-purple-400" />
        <span className="text-xs theme-text-muted font-mono">
          {block.cur_hash?.substring(0, 12)}...
        </span>
      </div>

      {/* Date */}
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 text-orange-400" />
        <span className="text-xs theme-text-muted">
          {block.date}
        </span>
      </div>

      {/* Expanded Details */}
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="pt-4 border-t theme-border-glass mt-4 space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs theme-text-muted">Transaction ID:</span>
              <span className="text-xs theme-text-primary font-mono">{block.transaction_id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs theme-text-muted">UTP Number:</span>
              <span className="text-xs theme-text-primary">{block.utp_number}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs theme-text-muted">Nonce:</span>
              <span className="text-xs theme-text-primary">{block.nonce}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs theme-text-muted">Merkle Root:</span>
              <span className="text-xs theme-text-primary font-mono text-xs">
                {block.merkle_root?.substring(0, 16)}...
              </span>
            </div>
          </div>

          {/* Security Indicator */}
          <div className="flex items-center justify-center space-x-2 pt-2 border-t theme-border-glass">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">Verified & Secure</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
