"use client";
import { Clock, AlertCircle, BadgeCheck, Banknote, X, Shield } from 'lucide-react';

// Display helper: tolerate missing enum-ish fields coming from Firestore
export const humanize = (v?: string | null) => (v ?? '').replace(/-/g, ' ');

export type TranslateFnLike = (key: string, vars?: Record<string, string | number>) => string;

export type Beneficiary = {
  id: string;
  ownerId: string;
  name: string;
  fatherName: string;
  aadhaarNumber: string;
  phone: string;
  email: string;
  district: string;
  state: string;
  address: string;
  registrationDate: any;
  priority: string;
  assignedOfficer: string;
  category: string;
  age: number | null;
  gender: string;
  maritalStatus: string;
  bankAccount: string;
  ifsc: string;
  status: string;
  verificationStatus: string;
  documents: number;
  lastUpdate: any;
  createdAt: any;
  scStCertificate: string;
};

export const formatDate = (date: any) => {
  if (!date) return '\u2014';
  try {
    if (typeof date?.toDate === 'function') {
      const d = date.toDate();
      return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
    }
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return String(date);
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  } catch { return String(date); }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'verified': return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'disbursed': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'pending-verification': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'rejected': return 'bg-red-500/10 text-red-600 dark:text-red-400';
    case 'documents-required': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};

export const getVerificationColor = (status: string) => {
  switch (status) {
    case 'verified': return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'pending': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'rejected': return 'bg-red-500/10 text-red-600 dark:text-red-400';
    case 'documents-required': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};

const STATUS_ICONS = {
  'pending-verification': Clock,
  'verified': BadgeCheck,
  'disbursed': Banknote,
  'rejected': X,
  'documents-required': AlertCircle
} as const;

export const getStatusIcon = (status: string) =>
  STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock;

const VERIFICATION_ICONS = {
  'verified': Shield,
  'pending': Clock,
  'rejected': X,
  'documents-required': AlertCircle
} as const;

export const getVerificationIcon = (status: string) =>
  VERIFICATION_ICONS[status as keyof typeof VERIFICATION_ICONS] || Clock;

// ---------------------------------------------------------------------------
// Officer-side additions (OfficerBeneficiariesPage + its subcomponents)
// ---------------------------------------------------------------------------

export const OFFICER_INPUT_CLS = "w-full h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:border-[var(--accent-primary)] transition-colors";

export const OFFICER_INLINE_INPUT_CLS = "h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:border-[var(--accent-primary)] transition-colors";

export const getOfficerPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500/10 text-red-600 dark:text-red-400';
    case 'medium': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'low': return 'bg-green-500/10 text-green-600 dark:text-green-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};

export const getOfficerCategoryColor = (category: string) => {
  switch (category) {
    case 'SC': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'ST': return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'OBC': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};

// Key-map constant + dynamic t(variable) lookup — never pass a string literal key to t here.
const ACT_TYPE_TEXT_KEYS = {
  pcr: 'extracted.pcr_act',
  poa: 'extracted.poa_act'
} as const;

export const formatOfficerActType = (t: TranslateFnLike, val?: string | null): string => {
  if (!val) return '\u2014';
  const v = String(val).toLowerCase();
  if (v.includes('pcr')) return t(ACT_TYPE_TEXT_KEYS.pcr) || 'PCR Act';
  if (v.includes('poa')) return t(ACT_TYPE_TEXT_KEYS.poa) || 'PoA Act';
  return val;
};

export const formatOfficerCurrency = (n?: number | null): string => {
  if (n == null || Number.isNaN(n)) return '\u20B90';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n as number);
};

const OFFICER_EXPORT_KEYS = {
  registrationDate: 'beneficiary.sortOptions.registrationDate'
} as const;

export const getOfficerBeneficiaryCsvHeaders = (t: TranslateFnLike): string[] => [
  'Beneficiary ID', 'Name', 'Aadhaar', 'Phone', 'Email', 'District', 'State', 'SC/ST Certificate',
  t(OFFICER_EXPORT_KEYS.registrationDate) || 'Registration Date',
  'Status', 'Verification', 'Disbursed (INR)', 'Priority', 'Assigned Officer', 'Documents', 'Last Update', 'Age', 'Gender', 'Marital Status', 'Bank Account', 'IFSC'
];

export const buildOfficerBeneficiaryCsv = (items: any[], t: TranslateFnLike): string => {
  const headers = getOfficerBeneficiaryCsvHeaders(t);
  const rows = items.map((b: any) => {
    const reg = b.registrationDate && typeof b.registrationDate.toDate === 'function'
      ? b.registrationDate.toDate().toISOString()
      : (b.registrationDate || '');
    return [
      b.id,
      b.name,
      b.aadhaarNumber,
      b.phone,
      b.email || '',
      b.district,
      b.state,
      b.scStCertificate || '',
      reg,
      b.status || '',
      b.verificationStatus || '',
      (b.disbursedAmount != null ? String(b.disbursedAmount) : '0'),
      b.priority || '',
      b.assignedOfficer || '',
      String(b.documents || 0),
      b.lastUpdate || '',
      b.age || '',
      b.gender || '',
      b.maritalStatus || '',
      b.bankAccount || '',
      b.ifsc || ''
    ];
  });

  return [headers, ...rows].map((r: any[]) => r.map((f: any) => `"${(f ?? '')}"`).join(',')).join('\n');
};
