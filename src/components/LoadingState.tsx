"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingState({
  message = "Loading...",
  size = 'md',
  fullScreen = true,
  className = ""
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const containerClasses = fullScreen
    ? "min-h-screen flex items-center justify-center theme-bg-primary"
    : "flex items-center justify-center p-8";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`${containerClasses} ${className}`}
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`animate-spin rounded-full border-b-2 border-blue-500 mx-auto mb-4 ${sizeClasses[size]}`}
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="theme-text-muted"
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  );
}