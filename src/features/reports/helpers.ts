"use client";
import React from 'react';
import { Database, FileText, BarChart3, Activity } from 'lucide-react';

// Report type definition
export type Report = {
  id: string;
  name: string;
  type: string;
  category: string;
  frequency: string;
  status: 'completed' | 'processing' | 'scheduled' | 'failed';
  fileSize: string | null;
  fileFormat: string;
  generatedDate: string | null;
  generatedBy: string | null;
  schedule: any;
  lastRun: string | null;
  nextRun: string | null;
  recordCount: number | null;
  description: string;
  parameters: any;
  downloadCount: number;
  isScheduled: boolean;
  recipients: string[];
  columns: string[];
  createdAt?: string;
  updatedAt?: string;
};

export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  financial: Database,
  compliance: FileText,
  performance: BarChart3,
  statistical: Activity,
  analytical: BarChart3,
  technical: Database
};

// Category → left spine color (card library metaphor)
export const SPINE_BG: Record<string, string> = {
  financial: 'bg-blue-500/70',
  compliance: 'bg-purple-500/70',
  performance: 'bg-emerald-500/70',
  analytical: 'bg-indigo-500/70',
  statistical: 'bg-amber-500/70',
  technical: 'bg-cyan-500/70',
};

// Format → composition-bar segment color
export const FORMAT_COLORS: Record<string, string> = {
  pdf: 'bg-red-500',
  csv: 'bg-teal-500',
  excel: 'bg-green-500',
  xlsx: 'bg-green-500',
};

export const getTypePillClass = (type: string) => {
  switch ((type || '').toLowerCase()) {
    case 'financial': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'compliance': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    case 'performance': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'analytical': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
    case 'statistical': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'technical': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};

export const getFormatPillClass = (format: string) => {
  switch ((format || '').toLowerCase()) {
    case 'pdf': return 'bg-red-500/10 text-red-600 dark:text-red-400';
    case 'csv': return 'bg-teal-500/10 text-teal-600 dark:text-teal-400';
    case 'excel':
    case 'xlsx': return 'bg-green-500/10 text-green-600 dark:text-green-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};

export const getStatusPillClass = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'processing': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'scheduled': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'failed': return 'bg-red-500/10 text-red-600 dark:text-red-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};

export const formatDate = (s?: string | null) => {
  if (!s) return '--';
  try {
    const d = new Date(s);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return '--';
  }
};

export const formatDateTime = (s?: string | null) => {
  if (!s) return '--';
  try {
    const d = new Date(s);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return '--';
  }
};

export const formatFileSize = (size: string | null) => {
  return size || '--';
};
