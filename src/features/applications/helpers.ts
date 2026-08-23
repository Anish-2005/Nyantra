"use client";
import { Clock, Eye, Check, X, AlertCircle } from 'lucide-react';

// Application data type
export interface Application {
  id: string;
  ownerId: string;
  applicantName: string;
  aadhaar: string;
  phone: string;
  district: string;
  state: string;
  actType: string;
  beneficiaryId: string;
  incidentDate: string;
  firReport?: string;
  medicalReport?: string;
  policeStation?: string;
  caseNumber?: string;
  applicationDate: string;
  status: string;
  amount: number;
  priority: string;
  assignedOfficer: string;
  documents: number;
  lastUpdate: string;
  // common beneficiary fields
  fatherName?: string;
  email?: string;
  address?: string;
  registrationDate?: any;
  category?: string;
  age?: number | null;
  gender?: string;
  maritalStatus?: string;
  bankAccount?: string;
  ifsc?: string;
  // PoA specific fields
  offenceCategory?: string;
  offenceType?: string;
}

export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

/** Status → journey stage index (rejected = -1) */
export const stageIndex = (status: string) => {
  switch (status) {
    case 'approved': return 2;
    case 'in-review':
    case 'documents-required': return 1;
    case 'rejected': return -1;
    default: return 0;
  }
};

export const formatCurrency = (n?: number) => {
  if (n == null) return '\u20b90';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
};

export const formatDate = (date: any) => {
  if (!date) return '\u2014';
  try {
    if (typeof date?.toDate === 'function') {
      return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date.toDate());
    }
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return String(date);
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  } catch { return String(date); }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'pending': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'in-review': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'rejected': return 'bg-red-500/10 text-red-600 dark:text-red-400';
    case 'documents-required': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};

const STATUS_ICONS = {
  'pending': Clock,
  'in-review': Eye,
  'approved': Check,
  'rejected': X,
  'documents-required': AlertCircle
} as const;

export const getStatusIcon = (status: string) =>
  STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock;

export const getTranslatedStatus = (t: TranslateFn, status: string) => {
  const safe = status ?? '';
  return t(`applications.status.${safe.replace('-', '_')}`) || safe.replace('-', ' ');
};

export const getTranslatedPriority = (t: TranslateFn, priority: string) =>
  t(`applications.priority.${(priority || '').toLowerCase()}`) || priority;
