"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { collection, query, onSnapshot, doc, setDoc, updateDoc, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLocale } from '@/context/LocaleContext';
import LoadingState from '@/components/LoadingState';
import {
  Plus, X, Search, Eye, Clock, Zap, CheckCircle2, AlertTriangle,
  Mic, MicOff, Send, Shield, MessageCircle, Loader2, FileText, MessageSquare
} from 'lucide-react';

// Grievance type definition matching the admin page
type Grievance = {
  id: string;
  beneficiaryId?: string;
  userId?: string;
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

// Hook to get user-specific grievances from Firestore
const useUserGrievances = (setState: React.Dispatch<React.SetStateAction<Grievance[]>>, beneficiaries: any[], userId: string) => {
  useEffect(() => {
    if (!userId || beneficiaries.length === 0) {
      setState([]);
      return;
    }

    // Get all beneficiary IDs
    const beneficiaryIds = beneficiaries.map(b => b.id);

    // Query for grievances by userId OR by beneficiaryIds
    const userQuery = query(
      collection(db, 'grievances'),
      where('userId', '==', userId)
    );

    const unsubscribers: (() => void)[] = [];
    const allGrievances: Grievance[] = [];

    // Query for grievances created by this user (new format)
    const unsub1 = onSnapshot(userQuery, (snapshot) => {
      const userGrievances: Grievance[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        const toIso = (v: any) => v && typeof v.toDate === 'function' ? v.toDate().toISOString() : (v ? String(v) : null);
        const created = toIso(data?.createdDate);
        const lastUpdated = toIso(data?.lastUpdated);
        const resolutionDate = toIso(data?.resolutionDate);
        const expectedResolution = toIso(data?.expectedResolution);

        return {
          id: d.id,
          beneficiaryName: data.beneficiaryName || data.name || '—',
          beneficiaryId: data.beneficiaryId,
          userId: data.userId,
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

      // Update combined list
      allGrievances.splice(0, allGrievances.length, ...userGrievances);

      // Sort by createdDate descending
      allGrievances.sort((a, b) => {
        const da = a.createdDate || '';
        const db = b.createdDate || '';
        if (da === db) return 0;
        return da < db ? 1 : -1;
      });

      setState([...allGrievances]);
    });

    unsubscribers.push(unsub1);

    // Also query for grievances by beneficiary IDs (legacy support)
    beneficiaryIds.forEach((beneficiaryId) => {
      const beneficiaryQuery = query(
        collection(db, 'grievances'),
        where('beneficiaryId', '==', beneficiaryId)
      );

      const unsub = onSnapshot(beneficiaryQuery, (snapshot) => {
        const beneficiaryGrievances: Grievance[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          // Skip if this grievance already exists in userGrievances (avoid duplicates)
          if (allGrievances.some(g => g.id === d.id)) return;

          const toIso = (v: any) => v && typeof v.toDate === 'function' ? v.toDate().toISOString() : (v ? String(v) : null);
          const created = toIso(data?.createdDate);
          const lastUpdated = toIso(data?.lastUpdated);
          const resolutionDate = toIso(data?.resolutionDate);
          const expectedResolution = toIso(data?.expectedResolution);

          return {
            id: d.id,
            beneficiaryName: data.beneficiaryName || data.name || '—',
            beneficiaryId: data.beneficiaryId,
            userId: data.userId,
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
        }).filter(Boolean) as Grievance[]; // Filter out undefined results

        // Add new grievances to combined list
        beneficiaryGrievances.forEach(grievance => {
          if (!allGrievances.some(g => g.id === grievance.id)) {
            allGrievances.push(grievance);
          }
        });

        // Sort by createdDate descending
        allGrievances.sort((a, b) => {
          const da = a.createdDate || '';
          const db = b.createdDate || '';
          if (da === db) return 0;
          return da < db ? 1 : -1;
        });

        setState([...allGrievances]);
      });

      unsubscribers.push(unsub);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [setState, beneficiaries, userId]);
};

// Shared form control styles (drawer)
const grievanceInputCls = "w-full h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors";
const grievanceTextareaCls = "w-full min-h-[80px] py-2 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-y";

const DrawerLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1">{children}</label>
);

// New Grievance Form — right portal drawer (mirrors NewApplicationDrawer pattern)
const NewGrievanceDrawer = ({
  onCancel,
  onSubmit,
  isSubmitting,
  beneficiaries,
  selectedBeneficiary,
  onSelectBeneficiary,
  beneficiaryName,
  onNameChange,
  beneficiaryPhone,
  onPhoneChange,
  beneficiaryEmail,
  onEmailChange,
  beneficiaryDisplayId,
  category,
  onCategoryChange,
  subCategory,
  onSubCategoryChange,
  description,
  onDescriptionChange
}: {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  beneficiaries: any[];
  selectedBeneficiary: any | null;
  onSelectBeneficiary: (beneficiary: any | null) => void;
  beneficiaryName: string;
  onNameChange: (v: string) => void;
  beneficiaryPhone: string;
  onPhoneChange: (v: string) => void;
  beneficiaryEmail: string;
  onEmailChange: (v: string) => void;
  beneficiaryDisplayId: string;
  category: string;
  onCategoryChange: (v: string) => void;
  subCategory: string;
  onSubCategoryChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
}) => {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll + close on Escape while drawer is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onCancel]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCancel}
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
        {/* Header */}
        <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass shrink-0">
          <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">
            {t('extracted.file_new_grievance')}
          </h2>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} id="new-grievance-form" className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Beneficiary Selection */}
          {beneficiaries.length > 1 && (
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
                Beneficiary
              </h3>
              <select
                value={selectedBeneficiary?.id || ''}
                onChange={(e) => {
                  const beneficiary = beneficiaries.find(b => b.id === e.target.value);
                  onSelectBeneficiary(beneficiary || null);
                  if (!beneficiary) {
                    // Clear editable fields when no beneficiary is selected
                    onNameChange('');
                    onPhoneChange('');
                    onEmailChange('');
                  }
                }}
                className={grievanceInputCls}
              >
                <option value="">{t('extracted.select_a_beneficiary')}</option>
                {beneficiaries.map((beneficiary) => (
                  <option key={beneficiary.id} value={beneficiary.id}>
                    {beneficiary.name} - {beneficiary.id}
                  </option>
                ))}
              </select>
            </section>
          )}

          {/* Beneficiary Information */}
          <section className={beneficiaries.length > 1 ? 'pt-4 border-t theme-border-glass' : ''}>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
              {t('extracted.beneficiary_name')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <DrawerLabel>{t('extracted.beneficiary_name')}</DrawerLabel>
                <input
                  value={beneficiaryName}
                  onChange={(e) => onNameChange(e.target.value)}
                  readOnly={!!selectedBeneficiary?.name}
                  placeholder={t('extracted.enterBeneficiaryName')}
                  className={grievanceInputCls}
                />
              </div>
              <div>
                <DrawerLabel>{t('extracted.phone')}</DrawerLabel>
                <input
                  value={beneficiaryPhone}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  readOnly={!!selectedBeneficiary?.phone}
                  placeholder={t('extracted.enterPhoneNumber')}
                  className={grievanceInputCls}
                />
              </div>
              <div>
                <DrawerLabel>{t('extracted.email')}</DrawerLabel>
                <input
                  value={beneficiaryEmail}
                  onChange={(e) => onEmailChange(e.target.value)}
                  readOnly={!!selectedBeneficiary?.email}
                  placeholder={t('extracted.enter_your_email')}
                  type="email"
                  className={grievanceInputCls}
                />
              </div>
              <div className="col-span-2">
                <DrawerLabel>{t('extracted.beneficiary_id')}</DrawerLabel>
                <input value={beneficiaryDisplayId} readOnly className={grievanceInputCls} />
              </div>
            </div>
          </section>

          {/* Grievance Details */}
          <section className="pt-4 border-t theme-border-glass">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
              {t('extracted.grievance_details')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <DrawerLabel>{t('extracted.category')}</DrawerLabel>
                <select
                  value={category}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className={grievanceInputCls}
                >
                  <option value="disbursement-delay">{t('extracted.disbursement_delay')}</option>
                  <option value="document-issues">{t('extracted.document_issues')}</option>
                  <option value="application-status">{t('extracted.application_status')}</option>
                  <option value="officer-behavior">{t('extracted.officer_behavior')}</option>
                  <option value="information-correction">{t('extracted.information_correction')}</option>
                  <option value="technical-issues">{t('extracted.technical_issues')}</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <DrawerLabel>{t('extracted.sub_category')}</DrawerLabel>
                <input
                  value={subCategory}
                  onChange={(e) => onSubCategoryChange(e.target.value)}
                  placeholder={t('extracted.optional_sub_category')}
                  className={grievanceInputCls}
                />
              </div>
              <div className="col-span-2">
                <DrawerLabel>{t('extracted.description')} *</DrawerLabel>
                <textarea
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  placeholder={t('extracted.please_provide_detailed_information_about_your_grievance')}
                  rows={4}
                  className={grievanceTextareaCls}
                  required
                />
              </div>
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="px-4 py-3 border-t theme-border-glass flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-9 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors"
          >
            {t('extracted.cancel')}
          </button>
          <button
            type="submit"
            form="new-grievance-form"
            disabled={!description.trim() || isSubmitting}
            className="flex-1 h-9 accent-gradient text-white rounded-md inline-flex items-center justify-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            {isSubmitting ? t('extracted.submitting') : t('extracted.submit_grievance')}
          </button>
        </div>
      </motion.aside>
    </>,
    document.body
  );
};

export default function GrievancePage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [description, setDescription] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [category, setCategory] = useState('disbursement-delay');
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed' | 'escalated'>('all');
  const [selectedGrv, setSelectedGrv] = useState<Grievance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewGrievanceForm, setShowNewGrievanceForm] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [beneficiaryEmail, setBeneficiaryEmail] = useState('');
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();
  const { user, loading } = useAuth();

  // In a real app, you'd get this from auth context
  const currentUser = selectedBeneficiary ? {
    id: selectedBeneficiary.id,
    name: selectedBeneficiary.name || beneficiaryName,
    phone: selectedBeneficiary.phone || beneficiaryPhone,
    email: selectedBeneficiary.email || beneficiaryEmail,
    district: selectedBeneficiary.district || '',
    state: selectedBeneficiary.state || ''
  } : {
    id: '',
    name: beneficiaryName,
    phone: beneficiaryPhone,
    email: beneficiaryEmail,
    district: '',
    state: ''
  };

  // Load user grievances from Firestore
  useUserGrievances(setGrievances, beneficiaries, user?.uid || '');

  // Fetch user's beneficiaries
  useEffect(() => {
    if (!user) {
      setBeneficiaries([]);
      setSelectedBeneficiary(null);
      return;
    }

    const q = query(collection(db, 'beneficiaries'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ...data
        });
      });
      setBeneficiaries(items);
      // Auto-select the first beneficiary if available
      if (items.length > 0 && !selectedBeneficiary) {
        setSelectedBeneficiary(items[0]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Initialize editable fields when beneficiary is selected
  useEffect(() => {
    if (selectedBeneficiary) {
      setBeneficiaryName(selectedBeneficiary.name || '');
      setBeneficiaryPhone(selectedBeneficiary.phone || '');
      setBeneficiaryEmail(selectedBeneficiary.email || '');
    }
  }, [selectedBeneficiary]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [selectedGrv?.communication, pendingMessages]);

  // Clear pending messages after Firestore sync
  useEffect(() => {
    if (pendingMessages.length > 0 && selectedGrv?.communication) {
      const timer = setTimeout(() => {
        setPendingMessages([]);
      }, 2000); // Clear after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [pendingMessages.length, selectedGrv?.communication]);

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

  const submitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !user) return;

    setIsSubmitting(true);

    try {
      const grievanceId = `GRV-${Date.now()}`;
      const grievanceData = {
        beneficiaryId: selectedBeneficiary?.id || '',
        userId: user?.uid || '',
        beneficiaryName: currentUser.name,
        phone: currentUser.phone || null,
        email: currentUser.email || null,
        district: currentUser.district,
        state: currentUser.state,
        category,
        subCategory: subCategory || null,
        priority: 'medium', // Default priority for user-submitted grievances
        description: description.trim(),
        status: 'open',
        attachments: 0,
        communication: [],
        escalationLevel: 0,
        followUpRequired: false,
        relatedGrievances: [],
        createdDate: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      await setDoc(doc(db, 'grievances', grievanceId), grievanceData);

      // Reset form + close drawer
      setDescription('');
      setSubCategory('');
      setCategory('disbursement-delay');
      setShowNewGrievanceForm(false);

    } catch (error) {
      console.error('Error submitting grievance:', error);
      alert(t('extracted.failed_to_submit_grievance'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCommunication = async (grievanceId: string, message: string) => {
    if (!currentUser) return;
    try {
      const grievanceRef = doc(db, 'grievances', grievanceId);
      await updateDoc(grievanceRef, {
        communication: [...(selectedGrv?.communication || []), {
          user: currentUser.name,
          text: message,
          createdAt: new Date().toISOString(),
          type: 'user'
        }],
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding communication:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedGrv?.id || !newMessage.trim()) return;
    const messageText = newMessage.trim();

    // Add to pending messages immediately
    const pendingMessage = {
      id: `pending-${Date.now()}-${Math.random()}`,
      user: currentUser.name,
      text: messageText,
      createdAt: new Date().toISOString(),
      type: 'user',
      pending: true
    };

    setPendingMessages(prev => [...prev, pendingMessage]);
    setNewMessage('');

    try {
      await addCommunication(selectedGrv.id, messageText);
      // Mark as sent (optional - Firestore will update anyway)
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove from pending messages on error
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

  const filteredList = grievances.filter(g => {
    if (filter !== 'all' && g.status !== filter) return false;
    if (searchTerm && !g.category?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !g.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status?: string) => {
    const colors = {
      'open': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      'in-progress': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      'pending': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      'resolved': 'bg-green-500/10 text-green-600 dark:text-green-400',
      'closed': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      'escalated': 'bg-red-500/10 text-red-600 dark:text-red-400'
    };
    const key = (status || '').toLowerCase() as keyof typeof colors;
    return colors[key] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  };

  const getStatusIcon = (status?: string) => {
    const icons = {
      'open': Clock,
      'pending': Clock,
      'in-progress': Zap,
      'resolved': CheckCircle2,
      'closed': CheckCircle2,
      'escalated': AlertTriangle
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  const getStatusLabel = (status?: string) =>
    status === 'open' ? t('extracted.open') :
    status === 'in-progress' ? t('extracted.in_progress') :
    status === 'resolved' ? t('extracted.resolved') :
    status === 'closed' ? t('extracted.closed') :
    status || t('extracted.open');

  const openCount = grievances.filter(l => l.status === 'open').length;
  const inProgressCount = grievances.filter(l => l.status === 'in-progress').length;
  const resolvedCount = grievances.filter(l => l.status === 'resolved' || l.status === 'closed').length;

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
            {t('extracted.grievance_portal')} <span className="text-accent-gradient">{t('extracted.dashboard')}</span>
          </h1>
          <p className="text-xs theme-text-muted mt-0.5 truncate">
            {t('extracted.file_and_track_grievances')}
          </p>
        </div>

        <button
          onClick={() => setShowNewGrievanceForm(true)}
          disabled={beneficiaries.length === 0}
          className="h-9 px-3.5 rounded-md accent-gradient text-white text-xs font-semibold hover:opacity-90 inline-flex items-center gap-1.5 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('extracted.file_new_grievance')}
        </button>
      </div>

      {loading || (user && beneficiaries.length === 0) ? (
        <LoadingState message={t('extracted.loading_grievances')} />
      ) : !currentUser ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center max-w-md">
            <FileText className="w-10 h-10 mx-auto theme-text-muted mb-4" />
            <h2 className="text-base font-semibold theme-text-primary mb-2">
              {beneficiaries.length === 0 ? 'No Beneficiaries Found' : 'Please select a beneficiary'}
            </h2>
            <p className="text-sm theme-text-muted mb-4">
              {beneficiaries.length === 0
                ? 'You need to have at least one beneficiary record to create grievances. Please visit the beneficiaries page to add one.'
                : 'Please select a beneficiary from the dropdown above.'
              }
            </p>
            {beneficiaries.length === 0 && (
              <a
                href="/dashboard/beneficiaries"
                className="inline-flex items-center h-9 px-3.5 rounded-md accent-gradient text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Go to Beneficiaries
              </a>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Stats hairline band */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
            {[
              { label: t('extracted.total'), value: grievances.length, icon: MessageSquare, dot: '' },
              { label: t('extracted.open_1'), value: openCount, icon: Clock, dot: 'bg-amber-500' },
              { label: t('extracted.in_progress'), value: inProgressCount, icon: Zap, dot: 'bg-blue-500' },
              { label: t('extracted.resolved'), value: resolvedCount, icon: CheckCircle2, dot: 'bg-emerald-500' },
            ].map(({ label, value, icon: Icon, dot }) => (
              <div key={label} className="theme-bg-card p-3.5 relative overflow-hidden group">
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ml-auto ${dot || 'accent-gradient'}`} />
                </div>
                <p className="text-xl font-semibold tabular-nums theme-text-primary mt-1">{value}</p>
                <div className="absolute inset-x-0 bottom-0 h-0.5 accent-gradient scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </div>
            ))}
          </div>

          {/* Grievances List */}
          <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b theme-border-glass">
              <h3 className="text-sm font-semibold theme-text-primary">
                {t('extracted.your_grievances')} <span className="theme-text-muted font-normal">({filteredList.length})</span>
              </h3>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted" />
                  <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder={t('extracted.search_grievances')}
                    className="w-full sm:w-52 h-9 pl-8 pr-3 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed' | 'escalated')}
                  className="h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                >
                  <option value="all">{t('extracted.all_status')}</option>
                  <option value="open">{t('extracted.open')}</option>
                  <option value="in-progress">{t('extracted.in_progress')}</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">{t('extracted.resolved')}</option>
                  <option value="closed">{t('extracted.closed')}</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>
            </div>

            <div className="p-2.5 space-y-2">
              <AnimatePresence>
                {filteredList.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 theme-bg-glass rounded-xl border theme-border-glass"
                  >
                    <div className="mx-auto w-16 h-16 theme-bg-primary rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 theme-text-muted" />
                    </div>
                    <p className="theme-text-muted mb-2">
                      {grievances.length === 0 ? t('extracted.no_grievances_filed_yet') : t('extracted.no_matching_grievances_found')}
                    </p>
                    <p className="text-sm theme-text-muted">
                      {grievances.length === 0
                        ? t('extracted.file_your_first_grievance')
                        : t('extracted.try_adjusting_search_or_filter')}
                    </p>
                  </motion.div>
                ) : (
                  filteredList.map((grievance) => (
                    <div
                      key={grievance.id}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-colors relative overflow-hidden ${
                        selectedGrv?.id === grievance.id
                          ? 'border-[var(--accent-primary)] theme-bg-glass'
                          : 'theme-border-glass hover:theme-bg-hover'
                      }`}
                      onClick={() => setSelectedGrv(grievance)}
                    >
                      {grievance.status === 'escalated' && (
                        <span className="absolute left-0 inset-y-0 w-0.5 bg-red-500/80" />
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold theme-text-primary truncate leading-tight">
                              {grievance.category || 'General Grievance'}
                            </h4>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0 ${getStatusColor(grievance.status)}`}>
                              {(() => {
                                const Icon = getStatusIcon(grievance.status);
                                return <Icon className="w-3 h-3" />;
                              })()}
                              {getStatusLabel(grievance.status)}
                            </span>
                          </div>

                          <p className="text-xs theme-text-muted truncate mt-0.5">
                            {grievance.id}
                            {' • '}{t('extracted.filed')}: {grievance.createdDate ? new Date(grievance.createdDate).toLocaleString() : 'Recent'}
                            {grievance.assignedTo && ` • ${t('extracted.assigned_to')}: ${grievance.assignedTo}`}
                          </p>

                          <p className="text-xs theme-text-muted line-clamp-2 mt-1.5">
                            {grievance.description}
                          </p>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedGrv(grievance); }}
                          className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
                          title={t('extracted.view_details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Selected Grievance Inspector (details + communication thread) */}
          <AnimatePresence>
            {selectedGrv && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden"
              >
                {/* Inspector header bar */}
                <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass">
                  <div className="min-w-0 flex items-center gap-2.5">
                    <h2 className="text-sm font-semibold theme-text-primary truncate">
                      {selectedGrv.category || 'General Grievance'}
                    </h2>
                    <span className="text-xs theme-text-muted truncate hidden sm:inline">·</span>
                    <span className="font-mono text-xs theme-text-muted truncate hidden sm:inline">{selectedGrv.id}</span>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(selectedGrv.status)}`}>
                      {(() => {
                        const Icon = getStatusIcon(selectedGrv.status);
                        return <Icon className="w-3 h-3" />;
                      })()}
                      {getStatusLabel(selectedGrv.status)}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedGrv(null)}
                    className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Inspector body */}
                <div className="px-4 py-3.5 space-y-4">
                  <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                    <div className="min-w-0">
                      <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.category_1')}</dt>
                      <dd className="text-[13px] font-medium theme-text-primary mt-0.5 capitalize truncate">{selectedGrv.category || 'General'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.assigned_to')}</dt>
                      <dd className="text-[13px] font-medium theme-text-primary mt-0.5 truncate">{selectedGrv.assignedTo || '—'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.filed')}</dt>
                      <dd className="text-[13px] font-medium theme-text-primary mt-0.5 truncate tabular-nums">
                        {selectedGrv.createdDate ? new Date(selectedGrv.createdDate).toLocaleString() : 'Recent'}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.last_updated')}</dt>
                      <dd className="text-[13px] font-medium theme-text-primary mt-0.5 truncate tabular-nums">
                        {selectedGrv.lastUpdated ? new Date(selectedGrv.lastUpdated).toLocaleString() : '—'}
                      </dd>
                    </div>
                    <div className="min-w-0 col-span-2 md:col-span-1">
                      <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.grievance_id')}</dt>
                      <dd className="mt-0.5">
                        <span className="font-mono text-xs theme-text-primary theme-bg-glass px-2 py-1 rounded inline-block max-w-full truncate">
                          {selectedGrv.id}
                        </span>
                      </dd>
                    </div>
                    <div className="min-w-0 col-span-2 md:col-span-3">
                      <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.description_1')}</dt>
                      <dd className="text-[13px] theme-text-primary mt-0.5 leading-relaxed">{selectedGrv.description}</dd>
                    </div>
                  </dl>

                  {/* Communication thread */}
                  <div className="pt-4 border-t theme-border-glass">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle className="w-3.5 h-3.5 theme-text-muted" />
                      <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">
                        {t('extracted.communication')}
                      </h3>
                    </div>

                    {/* Chat Messages Container */}
                    <div
                      ref={chatRef}
                      className="h-64 overflow-y-auto px-3 py-3 space-y-2.5 rounded-md border theme-border-glass"
                    >
                      {(!selectedGrv.communication || selectedGrv.communication.length === 0) ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center theme-text-muted">
                            <Shield className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">{t('extracted.no_messages')}</p>
                            <p className="text-xs mt-1">{t('extracted.start_conversation')}</p>
                          </div>
                        </div>
                      ) : (
                        [...(selectedGrv.communication || []), ...pendingMessages].map((comm, index) => {
                          const isOfficer = comm.type === 'officer' || comm.user === 'Officer' || comm.user === 'Admin' || comm.user === 'You';
                          return (
                            <div key={index} className={`flex ${isOfficer ? 'justify-start' : 'justify-end'}`}>
                              <div className={`max-w-[75%] flex flex-col ${isOfficer ? 'items-start' : 'items-end'}`}>
                                <div
                                  className={`${isOfficer
                                    ? 'mr-auto rounded-lg theme-bg-glass theme-text-primary'
                                    : 'ml-auto rounded-lg accent-gradient text-white'} text-[13px] px-3 py-2 leading-relaxed ${comm.pending ? 'opacity-70' : ''}`}
                                >
                                  {comm.text}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] theme-text-muted mt-0.5">
                                  {isOfficer && <Shield className="w-2.5 h-2.5" />}
                                  <span>{isOfficer ? (t('extracted.officer') || 'Officer') : comm.user}</span>
                                  <span>·</span>
                                  <span>{comm.createdAt ? new Date(comm.createdAt).toLocaleString() : ''}</span>
                                  {comm.pending && (
                                    <span className="text-amber-500 font-medium">Sending...</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="mt-3 pt-3 border-t theme-border-glass flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={t('extracted.write_message')}
                          className="w-full h-9 pl-3 pr-10 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        {recognition && (
                          <button
                            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                            className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${
                              isRecording
                                ? 'bg-red-500/10 text-red-500 animate-pulse'
                                : 'theme-text-muted hover:theme-bg-glass hover:theme-text-primary'
                            }`}
                            aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
                            title={isRecording ? 'Stop recording' : 'Start voice recording'}
                          >
                            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="h-9 px-3 rounded-md accent-gradient text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {t('extracted.send')}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* New Grievance Drawer */}
      <AnimatePresence>
        {showNewGrievanceForm && (
          <NewGrievanceDrawer
            onCancel={() => setShowNewGrievanceForm(false)}
            onSubmit={submitGrievance}
            isSubmitting={isSubmitting}
            beneficiaries={beneficiaries}
            selectedBeneficiary={selectedBeneficiary}
            onSelectBeneficiary={setSelectedBeneficiary}
            beneficiaryName={beneficiaryName}
            onNameChange={setBeneficiaryName}
            beneficiaryPhone={beneficiaryPhone}
            onPhoneChange={setBeneficiaryPhone}
            beneficiaryEmail={beneficiaryEmail}
            onEmailChange={setBeneficiaryEmail}
            beneficiaryDisplayId={currentUser?.id || ''}
            category={category}
            onCategoryChange={setCategory}
            subCategory={subCategory}
            onSubCategoryChange={setSubCategory}
            description={description}
            onDescriptionChange={setDescription}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
