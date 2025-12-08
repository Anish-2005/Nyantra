"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import BlockCard from "./BlockCard";
import { Link, ArrowRight, GitBranch } from "lucide-react";

export default function ChainView({ chain }: { chain: any[] }) {
  const { theme } = useTheme();

  if (!chain || chain.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="theme-bg-glass theme-border-glass border backdrop-blur-xl rounded-xl p-12 text-center"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
            <GitBranch className="w-12 h-12 theme-text-primary" />
          </div>
          <h3 className="text-xl font-semibold theme-text-primary">No Blocks Found</h3>
          <p className="theme-text-muted">The blockchain is empty. Add your first block to get started.</p>
        </div>
      </motion.div>
    );
  }

  const blocksPerRow = 3; // Adjust for better responsive design
  const rows: any[][] = [];
  for (let i = 0; i < chain.length; i += blocksPerRow) {
    rows.push(chain.slice(i, i + blocksPerRow));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20">
          <Link className="w-6 h-6 theme-text-primary" />
        </div>
        <h2 className="text-2xl font-bold theme-text-primary">Blockchain Network</h2>
        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-sm theme-text-primary">
          {chain.length} Blocks
        </span>
      </div>

      <div className="relative">
        {rows.map((row, rowIndex) => {
          const isReverse = rowIndex % 2 === 1;

          return (
            <motion.div
              key={rowIndex}
              initial={{ opacity: 0, x: isReverse ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIndex * 0.2 }}
              className={`flex ${isReverse ? "flex-row-reverse" : "flex-row"} gap-8 justify-center relative mb-16`}
            >
              {row.map((block, idx) => {
                const globalIndex = rowIndex * blocksPerRow + idx;
                const isLastBlock = globalIndex === chain.length - 1;
                const isRowEnd = idx === row.length - 1;

                return (
                  <motion.div
                    key={globalIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (rowIndex * blocksPerRow + idx) * 0.1 }}
                    className="relative flex items-center"
                  >
                    {/* Block with enhanced hover effects */}
                    <div className="group relative">
                      <BlockCard block={block} index={globalIndex} />

                      {/* Enhanced tooltip */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-80 p-4 theme-bg-glass theme-border-glass border backdrop-blur-xl rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
                      >
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <span className="font-semibold theme-text-primary">Block #{globalIndex}</span>
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
                            {globalIndex > 0 && (
                              <div className="flex justify-between pt-2 border-t theme-border-glass">
                                <span className="theme-text-muted">Prev Block:</span>
                                <span className="theme-text-primary">#{globalIndex - 1}</span>
                              </div>
                            )}
                            {globalIndex < chain.length - 1 && (
                              <div className="flex justify-between">
                                <span className="theme-text-muted">Next Block:</span>
                                <span className="theme-text-primary">#{globalIndex + 1}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent theme-border-glass"></div>
                      </motion.div>
                    </div>

                    {/* Enhanced connection arrows */}
                    {!isRowEnd && (
                      <motion.svg
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 1 + globalIndex * 0.1, duration: 0.5 }}
                        className="w-8 h-8 text-blue-400 ml-4 mr-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 1 + globalIndex * 0.1, duration: 0.5 }}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={isReverse ? "M24 12H0M0 12l6-6M0 12l6 6" : "M0 12H24M24 12l-6-6M24 12l-6 6"}
                        />
                      </motion.svg>
                    )}

                    {/* Vertical connection to next row */}
                    {isRowEnd && rowIndex < rows.length - 1 && (
                      <motion.svg
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 1.5 + rowIndex * 0.2, duration: 0.5 }}
                        className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-8 h-16 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 1.5 + rowIndex * 0.2, duration: 0.5 }}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={isReverse ? "M12 0v18l-6-6" : "M12 0v18l6-6"}
                        />
                      </motion.svg>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
