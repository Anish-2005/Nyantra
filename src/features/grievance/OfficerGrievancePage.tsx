"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Plus, Eye, Edit, Clock, Star, CheckCircle, AlertCircle, AlertOctagon,
  MessageCircle, PhoneCall, UserCheck, FileText, X, Banknote, FileSearch, UserX, Zap,
  Mail, MessageSquare, BarChart3, Shield, ArrowUpRight, ChevronDown, Mic, MicOff
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, getDoc, serverTimestamp, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '@/lib/firebase';
import ExportModal from '@/components/dashboard/ExportModal';

const inputCls = "w-full h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors";

const textareaCls = "w-full min-h-[80px] px-2.5 py-2 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-y";

const ghostBtn = "h-9 px-3 rounded-md border theme-border-glass theme-text-secondary font-medium hover:theme-bg-glass inline-flex items-center gap-1.5 text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

const primaryBtn = "h-9 px-3.5 rounded-md accent-gradient text-white font-semibold hover:opacity-90 inline-flex items-center gap-1.5 text-xs transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";

const iconBtn = "p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

const pillCls = "inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide";

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1">{children}</label>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">{children}</h3>
);

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="min-w-0">
    <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted truncate">{label}</dt>
    <dd className="text-[13px] font-medium theme-text-primary mt-0.5 truncate">{value ?? '\u2014'}</dd>
  </div>
);

const StatCell = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="theme-bg-card p-3.5">
    <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted truncate">{label}</p>
    <p className="text-xl font-semibold tracking-tight theme-text-primary mt-1 tabular-nums">{value}</p>
  </div>
);

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

  const SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  };

  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// Grievance type definition (minimal fields used in this page)
type Grievance = {
  id: string;
  beneficiaryId?: string;
  beneficiaryName: string;
  phone?: string;
  email?: string;
  district?: string;
  state?: string;
  actType?: string;
  applicationId?: string;
  category?: string;
  subCategory?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
  assignedDate?: string;
  createdDate?: string | null;
  lastUpdated?: string;
  resolutionDate?: string | null;
  expectedResolution?: string;
  description?: string;
  attachments?: number;
  communication?: any[];
  escalationLevel?: number;
  satisfactionRating?: number | null;
  followUpRequired?: boolean;
  relatedGrievances?: string[];
};

// Feedback type definition
type Feedback = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  rating: number; // 1-5 stars
  status: 'open' | 'in-review' | 'resolved';
  createdAt: any;
  updatedAt: any;
};

// Firestore-backed grievances: hook-like function to subscribe and set state
const useFirestoreGrievances = (setState: React.Dispatch<React.SetStateAction<Grievance[]>>) => {
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

interface NewGrievanceDrawerProps {
  initialData?: Grievance | null;
  onClose: () => void;
  onCreated?: (g: Grievance) => void;
}

const NewGrievanceDrawer = ({ initialData, onClose, onCreated }: NewGrievanceDrawerProps) => {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('disbursement-delay');
  const [subCategory, setSubCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'disbursement-delay', label: 'Disbursement Delay' },
    { value: 'document-issues', label: 'Document Issues' },
    { value: 'application-status', label: 'Application Status' },
    { value: 'officer-behavior', label: 'Officer Behavior' },
    { value: 'information-correction', label: 'Information Correction' },
    { value: 'technical-issues', label: 'Technical Issues' }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll + close on Escape while drawer is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleLookupBeneficiary = async (id: string) => {
    setBeneficiaryName('');
    if (!id) return;
    try {
      const snap = await getDoc(doc(db, 'beneficiaries', id));
      if (snap.exists()) {
        const data = snap.data() as any;
        setBeneficiaryName(data.name || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setError(null);
      } else {
        setError(t('extracted.beneficiary_not_found') || 'Beneficiary not found');
      }
    } catch (err) {
      console.error('Lookup beneficiary error', err);
      setError(t('extracted.lookup_failed') || 'Lookup failed');
    }
  };

  // Prefill when editing
  useEffect(() => {
    if (!initialData) return;
    setBeneficiaryId(initialData.beneficiaryId || '');
    setBeneficiaryName(initialData.beneficiaryName || '');
    setPhone(initialData.phone || '');
    setEmail(initialData.email || '');
    setCategory(initialData.category || 'disbursement-delay');
    setSubCategory(initialData.subCategory || '');
    setPriority((initialData.priority as any) || 'medium');
    setDescription(initialData.description || '');
  }, [initialData]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!beneficiaryId) return setError(t('extracted.enter_beneficiary_id') || 'Enter a beneficiary ID');
    setIsSubmitting(true);
    try {
      // validate beneficiary exists
      const snap = await getDoc(doc(db, 'beneficiaries', beneficiaryId));
      if (!snap.exists()) {
        setError(t('extracted.beneficiary_not_found') || 'Beneficiary not found');
        setIsSubmitting(false);
        return;
      }

      const base: any = {
        beneficiaryId,
        beneficiaryName: beneficiaryName || (snap.data() as any).name || '',
        phone: phone || (snap.data() as any).phone || null,
        email: email || (snap.data() as any).email || null,
        category,
        subCategory: subCategory || null,
        priority,
        description: description || null,
        status: initialData ? (initialData.status || 'open') : 'open',
        lastUpdated: serverTimestamp(),
        attachments: initialData ? (initialData.attachments || 0) : 0,
        communication: initialData ? (initialData.communication || []) : [],
        escalationLevel: initialData ? (initialData.escalationLevel || 0) : 0,
        followUpRequired: initialData ? (initialData.followUpRequired || false) : false
      };

      if (initialData && initialData.id) {
        // update existing grievance
        await updateDoc(doc(db, 'grievances', initialData.id), { ...base, lastUpdated: serverTimestamp() });
        const updated: Grievance = { ...initialData, ...base, lastUpdated: new Date().toISOString() } as Grievance;
        onCreated?.(updated);
        onClose();
      } else {
        // create with deterministic id: GRV-<timestamp>
        const newId = `GRV-${Date.now()}`;
        const payload = { ...base, createdDate: serverTimestamp() };
        await setDoc(doc(db, 'grievances', newId), payload);
        const created: Grievance = {
          id: newId,
          beneficiaryId: payload.beneficiaryId,
          beneficiaryName: payload.beneficiaryName,
          phone: payload.phone,
          email: payload.email,
          category: payload.category,
          subCategory: payload.subCategory,
          priority: payload.priority,
          description: payload.description,
          status: payload.status,
          attachments: payload.attachments || 0,
          communication: payload.communication || [],
          escalationLevel: payload.escalationLevel || 0,
          followUpRequired: payload.followUpRequired || false,
          createdDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };

        onCreated?.(created);
        onClose();
      }
    } catch (err) {
      console.error('Create grievance failed', err);
      setError(t('extracted.create_failed') || 'Failed to create grievance');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-[60]"
      />

      {/* Panel */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-y-0 right-0 w-full max-w-md z-[70] theme-drawer backdrop-blur-2xl border-l theme-border-glass flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass shrink-0">
          <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">
            {initialData ? (t('extracted.edit_case') || 'Edit Case') : (t('extracted.new_case') || 'New Case')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} id="new-grievance-form" className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <section>
            <Label>{t('extracted.beneficiary_id') || 'Beneficiary ID'} *</Label>
            <input
              placeholder={t('extracted.beneficiary_id') || 'Beneficiary ID'}
              value={beneficiaryId}
              onChange={(e) => setBeneficiaryId(e.target.value)}
              onBlur={() => handleLookupBeneficiary(beneficiaryId)}
              className={inputCls}
              required
            />
            {beneficiaryName && <p className="text-xs theme-text-muted mt-1.5">{beneficiaryName}</p>}
          </section>

          <section className="pt-4 border-t theme-border-glass">
            <SectionTitle>{t('extracted.contact')}</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('extracted.phone_number') || 'Phone Number'}</Label>
                <input type="tel" placeholder={t('extracted.phone_number') || 'Phone Number'} value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
              </div>
              <div>
                <Label>{t('extracted.email') || 'Email'}</Label>
                <input type="email" placeholder={t('extracted.email') || 'Email'} value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              </div>
            </div>
          </section>

          <section className="pt-4 border-t theme-border-glass">
            <SectionTitle>{t('extracted.category_1') || 'Classification'}</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('extracted.category_1') || 'Category'}</Label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <Label>{t('extracted.sub_category') || 'Sub-category'}</Label>
                <input placeholder={t('extracted.sub_category') || 'Sub-category'} value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={inputCls} />
              </div>
            </div>
          </section>

          <section className="pt-4 border-t theme-border-glass">
            <SectionTitle>{t('extracted.description') || 'Assessment'}</SectionTitle>
            <div className="space-y-3">
              <div>
                <Label>{t('extracted.priority') || 'Priority'}</Label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')} className={inputCls}>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <Label>{t('extracted.description') || 'Description'}</Label>
                <textarea placeholder={t('extracted.description') || 'Description'} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={textareaCls} />
              </div>
            </div>
          </section>

          {error && <div className="text-sm text-red-500">{error}</div>}
        </form>

        <div className="px-4 py-3 border-t theme-border-glass flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-9 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors"
          >
            {t('extracted.cancel')}
          </button>
          <button
            type="submit"
            form="new-grievance-form"
            disabled={isSubmitting}
            className="flex-1 h-9 accent-gradient text-white rounded-md inline-flex items-center justify-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (t('extracted.saving') || 'Saving...') : (initialData ? (t('extracted.save') || 'Save') : (t('extracted.create') || 'Create'))}
          </button>
        </div>
      </motion.aside>
    </>,
    document.body
  );
};

const GrievancePage = () => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter] = useState('all');
  const [categoryFilter] = useState('all');
  const [priorityFilter] = useState('all');
  const [actTypeFilter] = useState('all');
  const [assignedToFilter] = useState('all');
  const [sortBy] = useState('createdDate');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'list'>('dashboard');
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLElement>(null);

  // Feedback state
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackSortBy, setFeedbackSortBy] = useState<'rating' | 'createdAt'>('createdAt');
  const [feedbackSortOrder, setFeedbackSortOrder] = useState<'asc' | 'desc'>('desc');

  // subscribe to Firestore grievances collection
  useFirestoreGrievances(setGrievances);

  // Subscribe to Firestore feedback collection
  useEffect(() => {
    // Only subscribe if user is authenticated and has officer role
    if (!user || profile?.role !== 'officer') {
      return;
    }

    const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: Feedback[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          userId: data.userId,
          subject: data.subject,
          message: data.message,
          rating: data.rating,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      });
      setFeedbacks(items);
    }, (error) => {
      console.error('Error fetching feedback:', error);
    });
    return () => unsub();
  }, [user, profile]);

  // Filter and sort grievances (same logic as before)
  const filteredGrievances = useMemo(() => {
    let filtered = [...grievances];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(grievance =>
        (grievance.beneficiaryName || '').toLowerCase().includes(q) ||
        (grievance.id || '').toLowerCase().includes(q) ||
        (grievance.district || '').toLowerCase().includes(q) ||
        (grievance.applicationId || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter(g => g.status === statusFilter);
    if (categoryFilter !== 'all') filtered = filtered.filter(g => g.category === categoryFilter);
    if (priorityFilter !== 'all') filtered = filtered.filter(g => g.priority === priorityFilter);
    if (actTypeFilter !== 'all') filtered = filtered.filter(g => g.actType === actTypeFilter);
    if (assignedToFilter !== 'all') filtered = filtered.filter(g => g.assignedTo === assignedToFilter);

    // First sort by priority (urgent > high > medium > low), then by selected criteria
    filtered.sort((a, b) => {
      // Priority order: urgent > high > medium > low
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[(a.priority || 'low').toLowerCase() as keyof typeof priorityOrder] || 1;
      const bPriority = priorityOrder[(b.priority || 'low').toLowerCase() as keyof typeof priorityOrder] || 1;

      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }

      // If priorities are equal, sort by selected criteria
      const getVal = (obj: Record<string, unknown>, key: string) => {
        const val = obj[key as keyof typeof obj];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') {
          const ts = Date.parse(val);
          if (!Number.isNaN(ts)) return ts;
          return val.toLowerCase();
        }
        return val as unknown as number | string;
      };
      const aVal = getVal(a, sortBy);
      const bVal = getVal(b, sortBy);
      if (aVal === bVal) return 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortOrder === 'asc' ? (aStr > bStr ? 1 : -1) : (aStr < bStr ? 1 : -1);
    });
    return filtered;
  }, [grievances, searchQuery, statusFilter, categoryFilter, priorityFilter, actTypeFilter, assignedToFilter, sortBy, sortOrder]);

  // Sort feedbacks
  const sortedFeedbacks = useMemo(() => {
    const sorted = [...feedbacks];
    sorted.sort((a, b) => {
      if (feedbackSortBy === 'rating') {
        const aRating = a.rating;
        const bRating = b.rating;
        return feedbackSortOrder === 'asc' ? aRating - bRating : bRating - aRating;
      } else if (feedbackSortBy === 'createdAt') {
        const aDate = a.createdAt?.toDate?.()?.getTime() || 0;
        const bDate = b.createdAt?.toDate?.()?.getTime() || 0;
        return feedbackSortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      }
      return 0;
    });
    return sorted;
  }, [feedbacks, feedbackSortBy, feedbackSortOrder]);

  // Pagination
  const paginatedGrievances = filteredGrievances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = grievances.length;
    const resolved = grievances.filter(g => g.status === 'resolved' || g.status === 'closed').length;
    const inProgress = grievances.filter(g => g.status === 'in-progress').length;
    const escalated = grievances.filter(g => g.status === 'escalated').length;
    const avgResolutionTime = 5.2;
    const satisfiedCount = grievances.filter(g => g.satisfactionRating && g.satisfactionRating >= 4).length;
    const satisfactionRate = resolved > 0 ? Math.round((satisfiedCount / resolved) * 100) : 0;

    return {
      total,
      open: grievances.filter(g => g.status === 'open').length,
      inProgress,
      resolved,
      escalated,
      closed: grievances.filter(g => g.status === 'closed').length,
      pending: grievances.filter(g => g.status === 'pending').length,
      avgResolutionTime,
      satisfactionRate,
      highPriority: grievances.filter(g => g.priority === 'high').length
    };
  }, [grievances]);

  // Category distribution
  const categoryStats = useMemo(() => {
    return {
      'disbursement-delay': grievances.filter(g => g.category === 'disbursement-delay').length,
      'document-issues': grievances.filter(g => g.category === 'document-issues').length,
      'application-status': grievances.filter(g => g.category === 'application-status').length,
      'officer-behavior': grievances.filter(g => g.category === 'officer-behavior').length,
      'information-correction': grievances.filter(g => g.category === 'information-correction').length,
      'technical-issues': grievances.filter(g => g.category === 'technical-issues').length
    };
  }, [grievances]);

  // Voice recognition initialization
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsRecording(true);
      };

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(prev => prev + (prev ? ' ' : '') + transcript);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      recognitionInstance.onerror = (event: Event) => {
        console.error('Speech recognition error:', event);
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatRef.current && activeTab === 'communication') {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [selectedGrievance?.communication, pendingMessages, activeTab]);

  // Scroll inspector into view when a grievance is selected
  useEffect(() => {
    if (selectedGrievance && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedGrievance?.id]);

  const getStatusColor = (status?: string) => {
    const colors = {
      resolved: 'bg-green-500/10 text-green-600 dark:text-green-400',
      closed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      'in-progress': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      open: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      escalated: 'bg-red-500/10 text-red-600 dark:text-red-400'
    };
    const key = (status || '').toLowerCase() as keyof typeof colors;
    return colors[key] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  };

  const getPriorityColor = (priority?: string) => {
    const colors = {
      urgent: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      high: 'bg-red-500/10 text-red-600 dark:text-red-400',
      medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      low: 'bg-green-500/10 text-green-600 dark:text-green-400'
    };
    const key = (priority || '').toLowerCase() as keyof typeof colors;
    return colors[key] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'disbursement-delay': Banknote,
      'document-issues': FileText,
      'application-status': FileSearch,
      'officer-behavior': UserX,
      'information-correction': Edit,
      'technical-issues': Zap
    };
    return icons[category as keyof typeof icons] || AlertCircle;
  };

  const statuses = ['open', 'in-progress', 'pending', 'resolved', 'closed', 'escalated'];

  const updateGrievanceStatus = async (id: string, status: string) => {
    try {
      setStatusUpdating(id);
      await updateDoc(doc(db, 'grievances', id), { status, lastUpdated: serverTimestamp() });
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setStatusUpdating(null);
    }
  };

  const sendMessage = async () => {
    if (!selectedGrievance?.id) return;
    const text = newMessage.trim();
    if (!text) return;
    const pendingMessage = { user: 'Officer', text, createdAt: new Date().toISOString(), type: 'officer', pending: true };
    setPendingMessages(prev => [...prev, pendingMessage]);
    setNewMessage('');
    try {
      await updateDoc(doc(db, 'grievances', selectedGrievance.id), {
        communication: arrayUnion({ user: 'Officer', text, createdAt: new Date().toISOString(), type: 'officer' }),
        lastUpdated: serverTimestamp()
      });
      setPendingMessages(prev => prev.filter(msg => msg !== pendingMessage));
    } catch (err) {
      console.error('Failed to send message', err);
      setPendingMessages(prev => prev.filter(msg => msg !== pendingMessage));
    }
  };

  const startVoiceRecording = () => {
    if (recognition && !isRecording) {
      recognition.start();
    }
  };

  const stopVoiceRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
    }
  };

  const resolveCase = async () => {
    if (!selectedGrievance?.id) return;
    const id = selectedGrievance.id;
    try {
      await updateGrievanceStatus(id, 'closed');
      // Optimistically update selectedGrievance so UI reflects resolved state immediately
      setSelectedGrievance(prev => prev ? { ...prev, status: 'closed', lastUpdated: new Date().toISOString() } : prev);
    } catch (err) {
      console.error('Failed to resolve case', err);
    }
  };

  // Export utilities (CSV + PDF) for grievances
  const exportGrievancesData = (items: Grievance[]) => {
    const headers = [
      'Grievance ID',
      'Beneficiary Name',
      'Beneficiary ID',
      'Phone',
      'Email',
      'District',
      'State',
      'Category',
      'Sub-category',
      'Priority',
      'Status',
      'Assigned To',
      'Created Date',
      'Last Updated',
      'Attachments',
      'Messages Count'
    ];

    const rows = items.map(g => [
      g.id,
      g.beneficiaryName,
      g.beneficiaryId || '',
      g.phone || '',
      g.email || '',
      g.district || '',
      g.state || '',
      g.category || '',
      g.subCategory || '',
      g.priority || '',
      g.status || '',
      g.assignedTo || '',
      g.createdDate || '',
      g.lastUpdated || '',
      String(g.attachments ?? 0),
      String((g.communication || []).length)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${(field ?? '')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `grievances_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportGrievancesPDF = (items: Grievance[]) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
    const margin = 36;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 56, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Grievances Report', margin, 36);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}`, pageWidth - margin, 28, { align: 'right' });
    doc.text(`Total: ${items.length}`, pageWidth - margin, 44, { align: 'right' });

    const head = [[
      'Grievance ID', 'Beneficiary', 'District', 'Category', 'Priority', 'Status', 'Assigned', 'Messages'
    ]];

    const body: any[] = [];
    items.forEach(g => {
      const beneficiaryCell = `${g.beneficiaryName || ''}\n${g.phone || ''}`;
      body.push([
        g.id,
        beneficiaryCell,
        `${g.district || ''}${g.state ? ', ' + g.state : ''}`,
        g.category || '',
        g.priority || '',
        (g.status || '').toString().replace('-', ' '),
        g.assignedTo || '',
        String((g.communication || []).length)
      ]);
    });

    autoTable(doc, {
      head,
      body,
      startY: 70,
      styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak', cellWidth: 'wrap' },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 250, 251] },
      margin: { left: margin, right: margin, top: 70 },
      tableWidth: 'auto',
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 160 },
        2: { cellWidth: 100 },
        3: { cellWidth: 100 },
        4: { cellWidth: 60 },
        5: { cellWidth: 80 },
        6: { cellWidth: 100 },
        7: { cellWidth: 50 }
      }
    });

    doc.save(`grievances_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Email export function
  const sendGrievancesEmail = async (items: Grievance[], format: 'csv' | 'pdf') => {
    if (!emailAddress.trim()) {
      alert('Please enter a valid email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    setSendingEmail(true);
    try {
      let attachmentData: string | Buffer;
      let attachmentName: string;
      let attachmentType: string;

      if (format === 'csv') {
        const headers = ['Grievance ID', 'Beneficiary Name', 'Phone', 'Email', 'District', 'State', 'Act Type', 'Category', 'Sub Category', 'Priority', 'Status', 'Assigned To', 'Created Date', 'Last Updated', 'Messages Count'];
        const rows = items.map(g => [
          g.id,
          g.beneficiaryName || '',
          g.phone || '',
          g.email || '',
          g.district || '',
          g.state || '',
          g.actType || '',
          g.category || '',
          g.subCategory || '',
          g.priority || '',
          g.status || '',
          g.assignedTo || '',
          g.createdDate || '',
          g.lastUpdated || '',
          (g.communication || []).length.toString()
        ]);

        attachmentData = [headers, ...rows].map(r => r.map(f => `"${(f ?? '')}"`).join(',')).join('\n');
        attachmentName = `grievances_export_${new Date().toISOString().split('T')[0]}.csv`;
        attachmentType = 'text/csv';
      } else {
        // Generate PDF as base64
        const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
        const margin = 36;
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFillColor(30, 64, 175);
        doc.rect(0, 0, pageWidth, 56, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text('Grievances Report', margin, 36);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}`, pageWidth - margin, 28, { align: 'right' });
        doc.text(`Total: ${items.length}`, pageWidth - margin, 44, { align: 'right' });

        const head = [[
          'Grievance ID', 'Beneficiary', 'District', 'Category', 'Priority', 'Status', 'Assigned', 'Messages'
        ]];

        const body: any[] = [];
        items.forEach(g => {
          const beneficiaryCell = `${g.beneficiaryName || ''}\n${g.phone || ''}`;
          body.push([
            g.id,
            beneficiaryCell,
            `${g.district || ''}${g.state ? ', ' + g.state : ''}`,
            g.category || '',
            g.priority || '',
            (g.status || '').toString().replace('-', ' '),
            g.assignedTo || '',
            String((g.communication || []).length)
          ]);
        });

        autoTable(doc, {
          head,
          body,
          startY: 70,
          styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak', cellWidth: 'wrap' },
          headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [250, 250, 251] },
          margin: { left: margin, right: margin, top: 70 },
          tableWidth: 'auto',
          columnStyles: {
            0: { cellWidth: 90 },
            1: { cellWidth: 160 },
            2: { cellWidth: 100 },
            3: { cellWidth: 100 },
            4: { cellWidth: 60 },
            5: { cellWidth: 80 },
            6: { cellWidth: 100 },
            7: { cellWidth: 50 }
          }
        });

        attachmentData = doc.output('datauristring').split(',')[1];
        attachmentName = `grievances_report_${new Date().toISOString().split('T')[0]}.pdf`;
        attachmentType = 'application/pdf';
      }

      // Send email via API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailAddress.trim(),
          subject: `Nyantra Grievances Export - ${items.length} Grievances`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e40af;">Nyantra - Grievances Export</h2>
              <p>Dear User,</p>
              <p>Please find attached the grievances export containing ${items.length} grievances.</p>
              <p><strong>Report Details:</strong></p>
              <ul>
                <li>Total Grievances: ${items.length}</li>
                <li>Format: ${format.toUpperCase()}</li>
                <li>Generated: ${new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</li>
              </ul>
              <p>This report is generated by the Nyantra Grievance Management System.</p>
              <p>Best regards,<br>Nyantra Team</p>
            </div>
          `,
          attachments: [{
            filename: attachmentName,
            content: attachmentData,
            contentType: attachmentType,
            encoding: format === 'csv' ? 'utf8' : 'base64'
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      await response.json();
      alert(`Grievances report sent successfully to ${emailAddress}! Check your Gmail inbox.`);
      setEmailAddress('');
      setShowExportModal(false);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
            {t('extracted.grievance')} <span className="text-accent-gradient">{t('extracted.monitoring_center')}</span>
          </h1>
          <p className="text-xs theme-text-muted mt-0.5 truncate">
            {t('extracted.realtime_grievance_tracking_description')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setShowExportModal(true)} aria-label={t('extracted.export_data_1')} className={ghostBtn}>
            <Download className="w-3.5 h-3.5" />
            <span>{t('extracted.export_data')}</span>
          </button>
          <button onClick={() => setShowNewCaseModal(true)} className={primaryBtn}>
            <Plus className="w-3.5 h-3.5" />
            <span>{t('extracted.new_case')}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px theme-bg-glass theme-border-glass border rounded-xl overflow-hidden">
        <StatCell label={t('extracted.active_cases_label')} value={stats.open + stats.inProgress} />
        <StatCell label={t('extracted.avg_resolution_label')} value={`${stats.avgResolutionTime}d`} />
        <StatCell label={t('extracted.satisfaction_label')} value={`${stats.satisfactionRate}%`} />
        <StatCell label={t('extracted.escalated_label')} value={stats.escalated} />
      </div>

      {/* Toolbar + Cases */}
      <div className="theme-bg-card theme-border-glass border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b theme-border-glass flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 min-w-0">
            <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">{t('extracted.active_cases')}</h2>
            <span className="text-xs theme-text-muted tabular-nums">({filteredGrievances.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder={t('extracted.search_cases')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full sm:w-56 pl-8 pr-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
              />
            </div>
            <div className="flex items-center rounded-md border theme-border-glass p-0.5 shrink-0">
              {([
                { mode: 'dashboard', labelKey: 'extracted.dashboard_view' },
                { mode: 'list', labelKey: 'extracted.list_view' }
              ] as const).map(({ mode, labelKey }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`h-8 px-2.5 rounded text-xs font-medium transition-colors ${
                    viewMode === mode ? 'theme-bg-glass theme-text-primary' : 'theme-text-muted hover:theme-bg-hover'
                  }`}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {viewMode === 'dashboard' ? (
          <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {paginatedGrievances.map((grievance) => (
              <div
                key={grievance.id}
                onClick={() => setSelectedGrievance(grievance)}
                className="theme-bg-card theme-border-glass border rounded-lg p-3.5 cursor-pointer hover:theme-bg-hover transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full accent-gradient flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                      {grievance.beneficiaryName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold theme-text-primary truncate">{grievance.beneficiaryName}</p>
                      <p className="text-xs theme-text-muted truncate">{grievance.id}</p>
                    </div>
                  </div>
                  <span className={`${pillCls} ${getPriorityColor(grievance.priority)} shrink-0`}>
                    {grievance.priority ? grievance.priority.toUpperCase() : '-'}
                  </span>
                </div>

                <p className="text-[13px] theme-text-secondary line-clamp-2 mb-2.5">{grievance.description}</p>

                <div className="grid grid-cols-3 gap-x-4 gap-y-2 mb-2.5">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.files')}</p>
                    <p className="text-[13px] font-medium theme-text-primary mt-0.5 tabular-nums">{grievance.attachments}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.messages')}</p>
                    <p className="text-[13px] font-medium theme-text-primary mt-0.5 tabular-nums">{grievance.communication?.length ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.escalation')}</p>
                    <p className="text-[13px] font-medium theme-text-primary mt-0.5 tabular-nums">L{grievance.escalationLevel}</p>
                  </div>
                </div>

                <div className="pt-2.5 border-t theme-border-glass flex items-center gap-2">
                  <select
                    onClick={(e) => e.stopPropagation()}
                    value={grievance.status}
                    onChange={(e) => { e.stopPropagation(); updateGrievanceStatus(grievance.id, e.target.value); }}
                    className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border theme-border-glass cursor-pointer ${getStatusColor(grievance.status)}`}
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s.replace('-', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                  <div className="ml-auto flex items-center gap-0.5">
                    <button
                      className={iconBtn}
                      aria-label={`View ${grievance.id}`}
                      onClick={(e) => { e.stopPropagation(); setSelectedGrievance(grievance); }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className={iconBtn}
                      aria-label={`Edit ${grievance.id}`}
                      onClick={(e) => { e.stopPropagation(); setSelectedGrievance(grievance); setShowNewCaseModal(true); }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {paginatedGrievances.length === 0 && (
              <div className="md:col-span-2 py-10 text-center text-sm theme-text-muted">
                {t('extracted.no_activity')}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden p-3 grid grid-cols-1 gap-3">
              {paginatedGrievances.map((g) => (
                <div key={g.id} className="theme-bg-card theme-border-glass border rounded-lg p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold theme-text-primary truncate">{g.beneficiaryName}</p>
                      <p className="text-xs theme-text-muted truncate">{g.id} \u2022 {g.district}</p>
                    </div>
                    <span className={`${pillCls} ${getPriorityColor(g.priority)} shrink-0`}>
                      {g.priority ? g.priority.toUpperCase() : '-'}
                    </span>
                  </div>
                  <p className="text-[13px] theme-text-secondary line-clamp-2 mb-2.5">{g.description}</p>
                  <div className="pt-2.5 border-t theme-border-glass flex items-center gap-2">
                    <select
                      value={g.status}
                      onChange={(e) => updateGrievanceStatus(g.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border theme-border-glass cursor-pointer ${getStatusColor(g.status)}`}
                    >
                      {statuses.map(s => <option key={s} value={s}>{s.replace('-', ' ').toUpperCase()}</option>)}
                    </select>
                    <div className="ml-auto flex items-center gap-0.5">
                      <button className={iconBtn} onClick={() => setSelectedGrievance(g)} aria-label={`View ${g.id}`}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className={iconBtn} onClick={() => { setSelectedGrievance(g); setShowNewCaseModal(true); }} aria-label={`Edit ${g.id}`}>
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b theme-border-glass">
                  <tr className="whitespace-nowrap">
                    <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">ID</th>
                    <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t('extracted.beneficiary')}</th>
                    <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t('extracted.district')}</th>
                    <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t('extracted.priority')}</th>
                    <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t('extracted.status')}</th>
                    <th className="py-2 px-3 text-right text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t('extracted.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border-glass">
                  {paginatedGrievances.map((g) => (
                    <tr key={g.id} className="hover:theme-bg-hover transition-colors">
                      <td className="py-2.5 px-3 text-[13px] font-medium theme-text-primary whitespace-nowrap">{g.id}</td>
                      <td className="py-2.5 px-3 text-[13px] theme-text-primary">{g.beneficiaryName}</td>
                      <td className="py-2.5 px-3 text-[13px] theme-text-muted">{g.district}</td>
                      <td className="py-2.5 px-3">
                        <span className={`${pillCls} ${getPriorityColor(g.priority)}`}>{g.priority ? g.priority.toUpperCase() : '-'}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={g.status}
                          onChange={(e) => updateGrievanceStatus(g.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border theme-border-glass cursor-pointer ${getStatusColor(g.status)}`}
                        >
                          {statuses.map(s => <option key={s} value={s}>{s.replace('-', ' ').toUpperCase()}</option>)}
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-0.5">
                          <button className={iconBtn} onClick={() => setSelectedGrievance(g)} aria-label={`View ${g.id}`}>
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className={iconBtn} onClick={() => { setSelectedGrievance(g); setShowNewCaseModal(true); }} aria-label={`Edit ${g.id}`}>
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {paginatedGrievances.length === 0 && (
                <div className="py-10 text-center text-sm theme-text-muted">{t('extracted.no_activity')}</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Grievance Detail Inspector */}
      {selectedGrievance && (
        <section ref={detailRef} className="theme-bg-card theme-border-glass border rounded-lg overflow-hidden scroll-mt-20">
          <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">{selectedGrievance.id}</h2>
              <span className={`${pillCls} ${getPriorityColor(selectedGrievance.priority)} shrink-0`}>
                {selectedGrievance.priority ? selectedGrievance.priority.toUpperCase() : '-'}
              </span>
            </div>
            <button onClick={() => setSelectedGrievance(null)} className={`${iconBtn} shrink-0`} aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-4 border-b theme-border-glass flex overflow-x-auto">
            {[
              { id: 'overview', labelKey: 'extracted.tab_overview', icon: Eye },
              { id: 'communication', labelKey: 'extracted.tab_communication', icon: MessageCircle },
              { id: 'timeline', labelKey: 'extracted.tab_timeline', icon: Clock },
              { id: 'documents', labelKey: 'extracted.tab_documents', icon: FileText },
              { id: 'analytics', labelKey: 'extracted.tab_analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 -mb-px text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[var(--accent-primary)] theme-text-primary'
                    : 'border-transparent theme-text-muted hover:theme-text-primary'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {t((tab as any).labelKey)}
              </button>
            ))}
          </div>

          <div className="px-4 py-3.5">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
                  <DetailItem label={t('extracted.beneficiary')} value={selectedGrievance.beneficiaryName || '\u2014'} />
                  <DetailItem label="ID" value={selectedGrievance.beneficiaryId || '\u2014'} />
                  <DetailItem label={t('extracted.phone_number') || 'Phone'} value={selectedGrievance.phone || '-'} />
                  <DetailItem label={t('extracted.email') || 'Email'} value={selectedGrievance.email || '-'} />
                  <DetailItem label={t('extracted.district')} value={`${selectedGrievance.district || '-'}, ${selectedGrievance.state || '-'}`} />
                  <DetailItem label={t('extracted.act')} value={selectedGrievance.actType || '-'} />
                </dl>

                <div className="pt-4 border-t theme-border-glass">
                  <SectionTitle>{t('extracted.case_details')}</SectionTitle>
                  <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
                    <DetailItem label={t('extracted.category')} value={selectedGrievance.category || '-'} />
                    <DetailItem label={t('extracted.sub_category')} value={selectedGrievance.subCategory || '-'} />
                    <DetailItem label={t('extracted.priority')} value={selectedGrievance.priority ? selectedGrievance.priority.toUpperCase() : '-'} />
                    <DetailItem label={t('extracted.status')} value={selectedGrievance.status || '-'} />
                    <DetailItem label={t('extracted.assigned_to')} value={selectedGrievance.assignedTo || '-'} />
                    <DetailItem label={t('extracted.application_id')} value={selectedGrievance.applicationId || '\u2014'} />
                  </dl>
                </div>

                <div className="pt-4 border-t theme-border-glass">
                  <SectionTitle>{t('extracted.timestamps')}</SectionTitle>
                  <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
                    <DetailItem label={t('extracted.created')} value={selectedGrievance.createdDate ? new Date(selectedGrievance.createdDate).toLocaleString() : '\u2014'} />
                    <DetailItem label={t('extracted.last_updated')} value={selectedGrievance.lastUpdated ? new Date(selectedGrievance.lastUpdated).toLocaleString() : '\u2014'} />
                    <DetailItem label={t('extracted.expected_resolution')} value={selectedGrievance.expectedResolution ? new Date(selectedGrievance.expectedResolution).toLocaleString() : '\u2014'} />
                    <DetailItem label={t('extracted.resolution_date')} value={selectedGrievance.resolutionDate ? new Date(selectedGrievance.resolutionDate).toLocaleString() : '\u2014'} />
                  </dl>
                </div>

                <div className="pt-4 border-t theme-border-glass">
                  <SectionTitle>{t('extracted.attachments_communication')}</SectionTitle>
                  <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
                    <DetailItem label={t('extracted.attachments_label')} value={selectedGrievance.attachments ?? 0} />
                    <DetailItem label={t('extracted.messages_label')} value={selectedGrievance.communication?.length ?? 0} />
                  </dl>
                  {(selectedGrievance.communication?.length ?? 0) > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {(selectedGrievance.communication ?? []).slice(0, 3).map((c, i) => (
                        <div key={i} className="text-xs theme-text-muted">
                          <span className="font-medium theme-text-secondary">{c.user || (t('extracted.user') || 'User')}:</span> {String(c.text || c.message || c.body || '\u2014')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'communication' && (
              <div className="space-y-3">
                <div
                  ref={chatRef}
                  className="max-h-80 overflow-y-auto p-3 space-y-3 border theme-border-glass rounded-md theme-bg-glass scroll-smooth"
                >
                  {(selectedGrievance.communication ?? []).length === 0 && pendingMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-8 h-8 theme-text-muted mx-auto mb-2 opacity-50" />
                      <p className="text-sm theme-text-secondary">{t('extracted.no_messages') || 'No messages yet'}</p>
                      <p className="text-xs theme-text-muted mt-1">{t('extracted.start_conversation') || 'Start a conversation with the beneficiary'}</p>
                    </div>
                  ) : (
                    <>
                      {(selectedGrievance.communication ?? []).map((c, i) => {
                        const isOfficerMsg = c.type !== 'user';
                        return (
                          <div key={i} className={`max-w-[85%] sm:max-w-md rounded-lg border p-3 ${isOfficerMsg ? 'ml-auto bg-blue-500/10 border-blue-500/20' : 'mr-auto theme-bg-card theme-border-glass'}`}>
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                                {isOfficerMsg ? (t('extracted.officer') || 'Officer') : (c.user || (t('extracted.user') || 'User'))}
                              </span>
                              <span className="text-[10px] theme-text-muted">
                                {c.createdAt ? (new Date(c.createdAt?.toDate ? c.createdAt.toDate() : c.createdAt).toLocaleString()) : ''}
                              </span>
                            </div>
                            <p className="text-[13px] theme-text-primary break-words">{String(c.text || c.message || c.body || '')}</p>
                          </div>
                        );
                      })}
                      {pendingMessages.map((c, i) => (
                        <div key={`pending-${i}`} className="max-w-[85%] sm:max-w-md ml-auto rounded-lg border p-3 opacity-60 bg-blue-500/10 border-blue-500/20">
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.officer') || 'Officer'}</span>
                            <span className="text-[10px] theme-text-muted">{t('extracted.sending') || 'Sending...'}</span>
                          </div>
                          <p className="text-[13px] theme-text-primary break-words">{c.text}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={t('extracted.write_message') || 'Write a message...'}
                    className={`${inputCls} flex-1`}
                  />
                  {recognition && (
                    <button
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      className={`h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-md transition-colors ${
                        isRecording ? 'bg-red-500 text-white animate-pulse' : 'border theme-border-glass theme-text-secondary hover:theme-bg-glass'
                      }`}
                      aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
                      title={isRecording ? 'Stop recording' : 'Start voice recording'}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-md accent-gradient text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    aria-label={t('extracted.send_message') || 'Send message'}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
                  <DetailItem label={t('extracted.created')} value={selectedGrievance.createdDate ? new Date(selectedGrievance.createdDate).toLocaleString() : '\u2014'} />
                  <DetailItem label={t('extracted.last_updated')} value={selectedGrievance.lastUpdated ? new Date(selectedGrievance.lastUpdated).toLocaleString() : '\u2014'} />
                </dl>
                <div className="pt-4 border-t theme-border-glass">
                  <SectionTitle>{t('extracted.activity')}</SectionTitle>
                  {(selectedGrievance.communication ?? []).length === 0 ? (
                    <p className="text-sm theme-text-muted">{t('extracted.no_activity')}</p>
                  ) : (
                    <ul className="list-disc pl-5 space-y-2">
                      {(selectedGrievance.communication ?? []).map((c, i) => (
                        <li key={i} className="text-sm theme-text-muted flex items-start gap-2">
                          {(c.type === 'officer' || c.user === 'Officer') && <Shield className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />}
                          <span>
                            {(c.type === 'officer' || c.user === 'Officer') ? (t('extracted.officer') || 'Officer') : (c.user || (t('extracted.user') || 'User'))} \u2014 {String(c.text || c.message || c.body || '')}
                            <span className="text-xs block">{c.createdAt ? (new Date(c.createdAt?.toDate ? c.createdAt.toDate() : c.createdAt).toLocaleString()) : ''}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
                  <DetailItem label={t('extracted.attachments_label')} value={selectedGrievance.attachments ?? 0} />
                </dl>
                <p className="text-xs theme-text-muted">{t('extracted.upload_download_note')}</p>
                <div className="pt-4 border-t theme-border-glass">
                  <Label>{t('extracted.add_document_not_implemented')}</Label>
                  <input type="file" disabled className="block text-xs theme-text-muted" />
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px theme-bg-glass theme-border-glass border rounded-lg overflow-hidden">
                <div className="theme-bg-card p-3.5 text-center">
                  <p className="text-xl font-semibold tracking-tight theme-text-primary tabular-nums">{selectedGrievance.communication?.length ?? 0}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mt-1">{t('extracted.messages')}</p>
                </div>
                <div className="theme-bg-card p-3.5 text-center">
                  <p className="text-xl font-semibold tracking-tight theme-text-primary tabular-nums">{selectedGrievance.attachments ?? 0}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mt-1">{t('extracted.attachments_label')}</p>
                </div>
                <div className="theme-bg-card p-3.5 text-center">
                  <p className="text-xl font-semibold tracking-tight theme-text-primary tabular-nums">{(() => {
                    const created = selectedGrievance.createdDate ? new Date(selectedGrievance.createdDate).getTime() : Date.now();
                    const diff = Date.now() - created;
                    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
                  })()}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mt-1">{t('extracted.days_open')}</p>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t theme-border-glass flex flex-wrap items-center gap-2">
            <button
              onClick={() => resolveCase()}
              disabled={statusUpdating === selectedGrievance?.id || selectedGrievance?.status === 'closed'}
              className={`${ghostBtn} ${statusUpdating === selectedGrievance?.id ? 'opacity-60 cursor-wait' : ''}`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {selectedGrievance?.status === 'closed' ? (t('extracted.resolved') || 'Resolved') : (t('extracted.resolve_case') || 'Resolve')}
            </button>
            {selectedGrievance?.phone ? (
              <a href={`tel:${selectedGrievance.phone.trim()}`} target="_blank" rel="noreferrer" className={ghostBtn} aria-label={t('extracted.call_now')}>
                <PhoneCall className="w-3.5 h-3.5" />
                {t('extracted.call_now')}
              </a>
            ) : (
              <button disabled className={ghostBtn} aria-disabled>
                <PhoneCall className="w-3.5 h-3.5" />
                {t('extracted.call_now')}
              </button>
            )}
            {selectedGrievance?.email ? (
              <a href={`mailto:${selectedGrievance.email.trim()}`} target="_blank" rel="noreferrer" className={ghostBtn} aria-label={t('extracted.send_email')}>
                <Mail className="w-3.5 h-3.5" />
                {t('extracted.send_email')}
              </a>
            ) : (
              <button disabled className={ghostBtn} aria-disabled>
                <Mail className="w-3.5 h-3.5" />
                {t('extracted.send_email')}
              </button>
            )}
            <button className={`${primaryBtn} ml-auto`}>
              <AlertOctagon className="w-3.5 h-3.5" />
              {t('extracted.escalate_case')}
            </button>
          </div>
        </section>
      )}

      {/* Sidebar + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="theme-bg-card theme-border-glass border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b theme-border-glass flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-tight theme-text-primary">{t('extracted.quick_actions')}</h2>
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {[
                { key: 'escalate', icon: AlertOctagon, labelKey: 'extracted.escalate_urgent_cases', onClick: () => setShowExportModal(false), badge: stats.escalated },
                { key: 'assign', icon: UserCheck, labelKey: 'extracted.assign_officers', onClick: () => setSelectedGrievance(null) },
                { key: 'report', icon: FileText, labelKey: 'extracted.generate_report', onClick: () => setShowExportModal(true) },
                { key: 'analytics', icon: BarChart3, labelKey: 'extracted.view_analytics', onClick: () => setViewMode('list') }
              ].map((action) => (
                <button
                  key={action.key}
                  onClick={action.onClick}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md border theme-border-glass theme-bg-glass text-left hover:theme-bg-hover transition-colors group"
                >
                  <span className="w-7 h-7 rounded-md theme-bg-card theme-border-glass border inline-flex items-center justify-center shrink-0 group-hover:text-[var(--accent-primary)] transition-colors">
                    <action.icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[13px] font-medium theme-text-primary truncate">{t(action.labelKey)}</span>
                  {'badge' in action && typeof action.badge === 'number' && action.badge > 0 ? (
                    <span className="ml-auto pillCls text-[10px] bg-red-500/15 text-red-500 shrink-0 tabular-nums">{action.badge}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="theme-bg-card theme-border-glass border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b theme-border-glass">
              <h2 className="text-sm font-semibold tracking-tight theme-text-primary">{t('extracted.category_distribution')}</h2>
            </div>
            <ul className="p-3 space-y-2">
              {(Object.entries(categoryStats) as [string, number][]).map(([key, count]) => {
                const Icon = getCategoryIcon(key);
                const total = grievances.length || 1;
                return (
                  <li key={key} className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md theme-bg-glass inline-flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[13px] theme-text-secondary truncate capitalize">
                      {key.replace(/-/g, ' ')}
                    </span>
                    <div className="ml-auto flex items-center gap-2 min-w-[72px]">
                      <div className="h-1 w-full rounded-full theme-bg-glass overflow-hidden">
                        <div className="h-full accent-gradient rounded-full transition-all" style={{ width: `${Math.round((count / total) * 100)}%` }} />
                      </div>
                      <span className="text-xs font-medium theme-text-muted tabular-nums w-5 text-right">{count}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="lg:col-span-2 theme-bg-card theme-border-glass border rounded-lg overflow-hidden self-start">
          <div className="px-4 py-3 border-b theme-border-glass flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-tight theme-text-primary">{t('extracted.performance_overview')}</h2>
            <span className={`${pillCls} theme-bg-glass theme-text-muted`}>
              {t('extracted.sla_compliance')}: 94%
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px theme-bg-glass border-b theme-border-glass">
            <StatCell label={t('extracted.avg_first_response')} value="2.4h" />
            <StatCell label={t('extracted.resolution_rate')} value={stats.total > 0 ? `${Math.round(((stats.resolved + stats.closed) / stats.total) * 100)}%` : '0%'} />
            <StatCell label={t('extracted.open_over_7d')} value={grievances.filter(g => {
              if (!g.createdDate || g.status === 'closed' || g.status === 'resolved') return false;
              return Date.now() - new Date(g.createdDate).getTime() > 7 * 24 * 60 * 60 * 1000;
            }).length} />
            <StatCell label={t('extracted.high_priority_open')} value={stats.highPriority} />
          </div>

          <div className="p-3">
            <SectionTitle>{t('extracted.recent_activity')}</SectionTitle>
            <ul className="space-y-1.5">
              {[...grievances]
                .sort((a, b) => new Date(b.lastUpdated || b.createdDate || 0).getTime() - new Date(a.lastUpdated || a.createdDate || 0).getTime())
                .slice(0, 5)
                .map((g) => {
                  const Icon = getCategoryIcon(g.category || '');
                  return (
                    <li
                      key={g.id}
                      onClick={() => setSelectedGrievance(g)}
                      className="flex items-center gap-2.5 px-2 py-1.5 -mx-2 rounded-md cursor-pointer hover:theme-bg-hover transition-colors"
                    >
                      <span className="w-6 h-6 rounded-md theme-bg-glass inline-flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[13px] font-medium theme-text-primary truncate">{g.beneficiaryName}</span>
                      <ArrowUpRight className="w-3 h-3 theme-text-muted shrink-0 opacity-0 group-hover:opacity-100" />
                      <span className="ml-auto text-xs theme-text-muted whitespace-nowrap hidden sm:inline">
                        {new Date(g.lastUpdated || g.createdDate || Date.now()).toLocaleDateString()}
                      </span>
                      <span className={`${pillCls} ${getStatusColor(g.status)} shrink-0`}>
                        {(g.status || '-').replace('-', ' ').toUpperCase()}
                      </span>
                    </li>
                  );
                })}
              {grievances.length === 0 && (
                <li className="py-8 text-center text-sm theme-text-muted">{t('extracted.no_activity')}</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Beneficiary Feedback */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-baseline gap-2 min-w-0">
            <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">{t('extracted.beneficiary_feedback')}</h2>
            <span className="text-xs theme-text-muted tabular-nums">({sortedFeedbacks.length})</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted hidden sm:inline">{t('extracted.sort_by')}</span>
            <select
              value={feedbackSortBy}
              onChange={(e) => setFeedbackSortBy(e.target.value as 'rating' | 'createdAt')}
              className="h-8 px-2 rounded-md border theme-border-glass theme-bg-input theme-text-secondary text-xs focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
            >
              <option value="createdAt">{t('extracted.date')}</option>
              <option value="rating">{t('extracted.rating')}</option>
            </select>
            <button
              onClick={() => setFeedbackSortOrder(feedbackSortOrder === 'desc' ? 'asc' : 'desc')}
              className={`${iconBtn} w-8 h-8`}
              aria-label="Toggle sort order"
              title={feedbackSortOrder === 'desc' ? 'Descending' : 'Ascending'}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${feedbackSortOrder === 'asc' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px theme-bg-glass theme-border-glass border rounded-xl overflow-hidden">
          <StatCell label={t('extracted.total_responses')} value={sortedFeedbacks.length} />
          <StatCell label={t('extracted.average_rating')} value={sortedFeedbacks.length > 0 ? (sortedFeedbacks.reduce((s, f) => s + f.rating, 0) / sortedFeedbacks.length).toFixed(1) : '\u2014'} />
          <StatCell label={t('extracted.five_star_percentage')} value={sortedFeedbacks.length > 0 ? `${Math.round((sortedFeedbacks.filter(f => f.rating === 5).length / sortedFeedbacks.length) * 100)}%` : '0%'} />
          <StatCell label={t('extracted.needs_attention')} value={sortedFeedbacks.filter(f => f.rating <= 2).length} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            {sortedFeedbacks.slice(0, 6).map((f) => (
              <article key={f.id} className="theme-bg-card theme-border-glass border rounded-lg p-3.5 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full accent-gradient flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                      {(f.subject || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold theme-text-primary truncate">{f.subject || t('extracted.feedback')}</p>
                      <p className="text-xs theme-text-muted">
                        {f.createdAt?.toDate?.()
                          ? new Date(f.createdAt.toDate()).toLocaleDateString()
                          : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`${pillCls} shrink-0 ${f.status === 'resolved' ? 'bg-green-500/15 text-green-500' : f.status === 'in-review' ? 'bg-blue-500/15 text-blue-500' : 'theme-bg-glass theme-text-muted'}`}>
                    {(f.status || 'new').replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 mb-2" aria-label={`Rated ${f.rating} out of 5`}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i <= f.rating ? 'text-yellow-400 fill-current' : 'theme-text-muted'}`} />
                  ))}
                </div>

                <p className="text-[13px] theme-text-secondary line-clamp-3 mb-3 flex-1">{f.message}</p>

                <div className="pt-2.5 border-t theme-border-glass flex items-center gap-2">
                  <button className={`${ghostBtn} h-7 px-2 text-[11px]`} aria-label={t('extracted.view_details')}>
                    <Eye className="w-3 h-3" />
                    <span>{t('extracted.view')}</span>
                  </button>
                  <span className="ml-auto text-[11px] theme-text-muted">#{(f.id || '').slice(0, 6)}</span>
                </div>
              </article>
            ))}
            {sortedFeedbacks.length === 0 && (
              <div className="md:col-span-2 py-10 text-center text-sm theme-text-muted border theme-border-glass theme-bg-card rounded-lg">
                {t('extracted.no_feedback_yet') || 'No beneficiary feedback yet.'}
              </div>
            )}
          </div>

          {/* Rating distribution */}
          <div className="theme-bg-card theme-border-glass border rounded-lg overflow-hidden self-start">
            <div className="px-4 py-3 border-b theme-border-glass">
              <h2 className="text-sm font-semibold tracking-tight theme-text-primary">{t('extracted.rating_distribution')}</h2>
            </div>
            <ul className="p-3 space-y-2.5">
              {[5, 4, 3, 2, 1].map((r) => {
                const count = feedbacks.filter(f => f.rating === r).length;
                const pct = feedbacks.length > 0 ? Math.round((count / feedbacks.length) * 100) : 0;
                return (
                  <li key={r} className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1 text-xs font-medium theme-text-muted w-8 shrink-0 tabular-nums">
                      {r}<Star className="w-3 h-3 text-yellow-400 fill-current" />
                    </span>
                    <div className="h-1 w-full rounded-full theme-bg-glass overflow-hidden">
                      <div className="h-full accent-gradient rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium theme-text-muted tabular-nums w-9 text-right shrink-0">{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Modals */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        items={grievances}
        filteredItems={filteredGrievances}
        onExportCsv={exportGrievancesData}
        onExportPdf={exportGrievancesPDF}
        emailAddress={emailAddress}
        setEmailAddress={setEmailAddress}
        sendingEmail={sendingEmail}
        onSendEmail={sendGrievancesEmail}
        title={t('extracted.export_data_1')}
        subtitle={t('extracted.export_subtitle') || t('extracted.choose_export_options')}
        allTitle={t('extracted.all_cases')}
        filteredTitle={t('extracted.filtered_cases')}
      />

      <AnimatePresence>
        {showNewCaseModal && (
          <NewGrievanceDrawer
            initialData={selectedGrievance}
            onClose={() => { setShowNewCaseModal(false); setSelectedGrievance(null); }}
            onCreated={(g) => { setSelectedGrievance(g); setShowNewCaseModal(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GrievancePage;
