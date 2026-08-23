"use client";
import React, { useEffect } from 'react';
import {
  AlertCircle, Banknote, Edit, FileSearch, FileText, UserX, Zap
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Grievance } from './helpers';

export type { Grievance };

// Officer-side feedback record (beneficiary feedback panel)
export type Feedback = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  rating: number; // 1-5 stars
  status: 'open' | 'in-review' | 'resolved';
  createdAt: any;
  updatedAt: any;
};

// Web Speech API type declarations
declare global {
  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
    readonly resultIndex: number;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  }

  var SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  };

  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// Shared form control class strings
export const inputCls = "w-full h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors";

export const textareaCls = "w-full min-h-[80px] px-2.5 py-2 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-y";

export const ghostBtn = "h-9 px-3 rounded-md border theme-border-glass theme-text-secondary font-medium hover:theme-bg-glass inline-flex items-center gap-1.5 text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

export const primaryBtn = "h-9 px-3.5 rounded-md accent-gradient text-white font-semibold hover:opacity-90 inline-flex items-center gap-1.5 text-xs transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";

export const iconBtn = "p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

export const pillCls = "inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide";

// Module-scope micro atoms shared by the officer drawer + inspector
// (plain createElement keeps this file JSX-free)
export const Label = ({ children }: { children: React.ReactNode }) =>
  React.createElement('label', { className: 'block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1' }, children);

export const SectionTitle = ({ children }: { children: React.ReactNode }) =>
  React.createElement('h3', { className: 'text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5' }, children);

export const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) =>
  React.createElement(
    'div',
    { className: 'min-w-0' },
    React.createElement('dt', { className: 'text-[11px] font-medium uppercase tracking-wider theme-text-muted truncate' }, label),
    React.createElement('dd', { className: 'text-[13px] font-medium theme-text-primary mt-0.5 truncate' }, value ?? '\u2014')
  );

export const OFFICER_STATUSES = ['open', 'in-progress', 'pending', 'resolved', 'closed', 'escalated'];

const OFFICER_STATUS_COLORS: Record<string, string> = {
  resolved: 'bg-green-500/10 text-green-600 dark:text-green-400',
  closed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'in-progress': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  open: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  escalated: 'bg-red-500/10 text-red-600 dark:text-red-400'
};

export const getOfficerStatusColor = (status?: string) => {
  const key = (status || '').toLowerCase() as keyof typeof OFFICER_STATUS_COLORS;
  return OFFICER_STATUS_COLORS[key] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
};

const OFFICER_PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  high: 'bg-red-500/10 text-red-600 dark:text-red-400',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  low: 'bg-green-500/10 text-green-600 dark:text-green-400'
};

export const getOfficerPriorityColor = (priority?: string) => {
  const key = (priority || '').toLowerCase() as keyof typeof OFFICER_PRIORITY_COLORS;
  return OFFICER_PRIORITY_COLORS[key] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
};

// Module-scope icon map for dynamic category icon selection
// (react-hooks/static-components: resolve via map + React.createElement at call sites)
const OFFICER_CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'disbursement-delay': Banknote,
  'document-issues': FileText,
  'application-status': FileSearch,
  'officer-behavior': UserX,
  'information-correction': Edit,
  'technical-issues': Zap
};

export const getOfficerCategoryIcon = (category: string): React.ComponentType<{ className?: string }> =>
  OFFICER_CATEGORY_ICONS[category] || AlertCircle;

// Firestore-backed grievances: hook-like function to subscribe and set state
export const useFirestoreGrievances = (setState: React.Dispatch<React.SetStateAction<Grievance[]>>) => {
  useEffect(() => {
    const q = query(collection(db, 'grievances'), orderBy('createdDate', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: Grievance[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        const toIso = (v: any) => v && typeof v.toDate === 'function' ? v.toDate().toISOString() : (v ? String(v) : null);
        const created = toIso(data?.createdDate);
        const lastUpdated = toIso(data?.lastUpdated);
        const resolutionDate = toIso(data?.resolutionDate);
        const expectedResolution = toIso(data?.expectedResolution);
        return {
          id: d.id,
          beneficiaryName: data.beneficiaryName || data.name || '\u2014',
          beneficiaryId: data.beneficiaryId,
          phone: data.phone,
          email: data.email,
          district: data.district,
          state: data.state,
          actType: data.actType,
          applicationId: data.applicationId,
          category: data.category,
          subCategory: data.subCategory,
          priority: data.priority,
          status: data.status,
          assignedTo: data.assignedTo,
          assignedDate: data.assignedDate,
          createdDate: created,
          lastUpdated: lastUpdated,
          resolutionDate: resolutionDate,
          expectedResolution: expectedResolution,
          description: data.description,
          attachments: data.attachments || 0,
          communication: data.communication || [],
          escalationLevel: data.escalationLevel || 0,
          satisfactionRating: data.satisfactionRating ?? null,
          followUpRequired: data.followUpRequired || false,
          relatedGrievances: data.relatedGrievances || []
        };
      });
      setState(items);
    });
    return () => unsub();
  }, [setState]);
};
