"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";
import BlockCard from "./BlockCard";
import { Link, ArrowRight, GitBranch } from "lucide-react";

export default function ChainView({ chain }: { chain: any[] }) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const [openBlocks, setOpenBlocks] = useState<Set<number>>(new Set());

  const handleBlockOpenChange = (index: number, isOpen: boolean) => {
    setOpenBlocks(prev => {
      const newSet = new Set(prev);
      if (isOpen) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  };

  if (!chain || chain.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="theme-bg-glass theme-border-glass border backdrop-blur-xl rounded-xl p-12 text-center"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
            <GitBranch className="w-10 h-10 theme-text-primary" />
          </div>
          <h3 className="text-base font-semibold theme-text-primary">{t('blockchain.noBlocksFound')}</h3>
          <p className="theme-text-muted">{t('blockchain.emptyDescription')}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20">
          <Link className="w-6 h-6 theme-text-primary" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight theme-text-primary">{t('blockchain.networkTitle')}</h2>
        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-sm theme-text-primary">
          {chain.length} Blocks
        </span>
      </div>

      <div className="relative flex flex-col items-start space-y-5">
        {chain.map((block, index) => {
          const isLastBlock = index === chain.length - 1;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex flex-col items-center"
            >
              {/* Block with enhanced hover effects */}
              <div className="group relative">
                <BlockCard
                  block={block}
                  index={index}
                  onOpenChange={(isOpen: boolean) => handleBlockOpenChange(index, isOpen)}
                />

                {/* Enhanced tooltip - only show when block is not expanded */}
                {!openBlocks.has(index) && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 w-80 p-4 theme-bg-glass theme-border-glass border backdrop-blur-xl rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="font-semibold theme-text-primary">Block #{index}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div className="flex justify-between">
                        <span className="theme-text-muted">Hash:</span>
                        <span className="theme-text-primary font-mono text-xs">{block.cur_hash?.substring(0, 16)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="theme-text-muted">Prev Hash:</span>
                        <span className="theme-text-primary font-mono text-xs">{block.prev_hash?.substring(0, 16)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="theme-text-muted">Merkle Root:</span>
                        <span className="theme-text-primary font-mono text-xs">{block.merkle_root?.substring(0, 16)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="theme-text-muted">Date:</span>
                        <span className="theme-text-primary">{block.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="theme-text-muted">UTP:</span>
                        <span className="theme-text-primary font-mono text-xs">{block.utp_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="theme-text-muted">TXN ID:</span>
                        <span className="theme-text-primary font-mono text-xs">{block.transaction_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="theme-text-muted">Beneficiary:</span>
                        <span className="theme-text-primary">{block.beneficiary_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="theme-text-muted">Amount:</span>
                        <span className="text-green-400 font-semibold">₹{block.amount?.toLocaleString()}</span>
                      </div>
                      {index > 0 && (
                        <div className="flex justify-between pt-2 border-t theme-border-glass">
                          <span className="theme-text-muted">Prev Block:</span>
                          <span className="theme-text-primary">#{index - 1}</span>
                        </div>
                      )}
                      {index < chain.length - 1 && (
                        <div className="flex justify-between">
                          <span className="theme-text-muted">Next Block:</span>
                          <span className="theme-text-primary">#{index + 1}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent theme-border-glass"></div>
                </div>
                )}
              </div>

              {/* Vertical connection arrow to next block */}
              {!isLastBlock && (
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                  className="w-8 h-8 text-blue-400 mt-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 0v18l6-6"
                  />
                </motion.svg>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
