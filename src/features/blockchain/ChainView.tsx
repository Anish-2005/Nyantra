"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import BlockCard from "./BlockCard";
import { GitBranch } from "lucide-react";

export default function ChainView({ chain }: { chain: any[] }) {
  const { t } = useLocale();

  if (!chain || chain.length === 0) {
    return (
      <div className="theme-bg-card theme-border-glass border rounded-xl p-12 text-center shadow-sm">
        <GitBranch className="w-6 h-6 theme-text-muted mx-auto mb-3" />
        <h3 className="text-sm font-semibold theme-text-primary">{t('blockchain.noBlocksFound')}</h3>
        <p className="text-xs theme-text-muted mt-1">{t('blockchain.emptyDescription')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight theme-text-primary">{t('blockchain.networkTitle')}</h2>
        <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
          {chain.length} Blocks
        </span>
      </div>

      <div className="flex flex-col">
        {chain.map((block, index) => (
          <div key={index}>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.2 }}
            >
              <BlockCard block={block} index={index} />
            </motion.div>
            {index < chain.length - 1 && (
              <div className="w-px h-4 theme-bg-glass mx-auto" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
