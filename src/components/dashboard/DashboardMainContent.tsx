"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface DashboardMainContentProps {
  children: React.ReactNode;
  sidebarCollapsed: boolean;
}

export const DashboardMainContent = ({
  children,
  sidebarCollapsed
}: DashboardMainContentProps) => {
  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 sm:p-6 lg:p-8 relative z-10"
    >
      {children || (
        <div className="text-center py-20 text-lg theme-text-muted">
          Select a section from the sidebar.
        </div>
      )}
    </motion.main>
  );
};