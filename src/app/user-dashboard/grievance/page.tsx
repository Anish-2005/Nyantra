"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { collection, query, orderBy, onSnapshot, doc, setDoc, updateDoc, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import LoadingState from '@/components/LoadingState';
import { Shield, MessageCircle } from 'lucide-react';
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

export default function GrievancePage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('disbursement-delay');
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed' | 'escalated'>('all');
  const [selectedGrv, setSelectedGrv] = useState<Grievance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [beneficiaryEmail, setBeneficiaryEmail] = useState('');
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  const { t } = useLocale();
  const { theme } = useTheme();
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
        priority,
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
      
      // Reset form
      setDescription('');
      setSubCategory('');
      setPriority('medium');
      setCategory('disbursement-delay');
      
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

  const filteredList = grievances.filter(g => {
    if (filter !== 'all' && g.status !== filter) return false;
    if (searchTerm && !g.category?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !g.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status?: string) => {
    const colors = {
      'resolved': theme === 'dark' ? 'text-green-300 bg-green-900/30' : 'text-green-700 bg-green-100',
      'closed': theme === 'dark' ? 'text-emerald-300 bg-emerald-900/30' : 'text-emerald-700 bg-emerald-100',
      'in-progress': theme === 'dark' ? 'text-blue-300 bg-blue-900/30' : 'text-blue-700 bg-blue-100',
      'open': theme === 'dark' ? 'text-amber-300 bg-amber-900/30' : 'text-amber-700 bg-amber-100',
      'pending': theme === 'dark' ? 'text-yellow-300 bg-yellow-900/30' : 'text-yellow-700 bg-yellow-100',
      'escalated': theme === 'dark' ? 'text-red-300 bg-red-900/30' : 'text-red-700 bg-red-100'
    };
    const key = (status || '').toLowerCase() as keyof typeof colors;
    return colors[key] || 'text-gray-300 bg-gray-800';
  };

  const getPriorityColor = (priority?: string) => {
    const colors = {
      'high': theme === 'dark' ? 'text-red-300 bg-red-900/30' : 'text-red-700 bg-red-100',
      'medium': theme === 'dark' ? 'text-amber-300 bg-amber-900/30' : 'text-amber-700 bg-amber-100',
      'low': theme === 'dark' ? 'text-green-300 bg-green-900/30' : 'text-green-700 bg-green-100'
    };
    const key = (priority || '').toLowerCase() as keyof typeof colors;
    return colors[key] || 'text-gray-300 bg-gray-800';
  };

  const getStatusIcon = (status?: string) => {
    const icons = {
      'open': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'in-progress': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      'resolved': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'closed': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
    return icons[status as keyof typeof icons] || icons.open;
  };

  const openCount = grievances.filter(l => l.status === 'open').length;
  const inProgressCount = grievances.filter(l => l.status === 'in-progress').length;
  const resolvedCount = grievances.filter(l => l.status === 'resolved' || l.status === 'closed').length;

  return (
    <div className="min-h-screen p-4 md:p-6 theme-bg-primary">
      {/* Custom styles for dropdown options in dark mode */}
      <style jsx global>{`
        /* Dropdown styling for dark mode compatibility */
        select {
          background-color: var(--glass-bg) !important;
          color: var(--text-primary) !important;
          border-color: var(--glass-border) !important;
        }
        
        select option {
          background-color: var(--card-bg) !important;
          color: var(--text-primary) !important;
          padding: 8px 12px !important;
        }
        
        /* Ensure dropdown options are visible in both themes */
        [data-theme="dark"] select option {
          background-color: rgba(15, 23, 42, 0.95) !important;
          color: #f1f5f9 !important;
        }
        
        [data-theme="light"] select option {
          background-color: rgba(255, 255, 255, 0.95) !important;
          color: #0f172a !important;
        }
        
        /* Style the dropdown arrow */
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          padding-right: 40px !important;
        }
      `}</style>
      
      {loading || (user && beneficiaries.length === 0) ? (
        <LoadingState message={t('extracted.loading_grievances')} />
      ) : !currentUser ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold theme-text-primary mb-4">
              {beneficiaries.length === 0 ? 'No Beneficiaries Found' : 'Please select a beneficiary'}
            </h2>
            <p className="theme-text-muted mb-4">
              {beneficiaries.length === 0 
                ? 'You need to have at least one beneficiary record to create grievances. Please visit the beneficiaries page to add one.'
                : 'Please select a beneficiary from the dropdown above.'
              }
            </p>
            {beneficiaries.length === 0 && (
              <a 
                href="/user-dashboard/beneficiaries"
                className="accent-gradient text-white px-6 py-2 rounded-lg inline-block"
              >
                Go to Beneficiaries
              </a>
            )}
          </div>
        </div>
      ) : (
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold theme-text-primary">
            {t('extracted.grievance_portal')}
          </h1>
          <p className="theme-text-muted mt-2 text-sm md:text-base">
            {t('extracted.file_and_track_grievances')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Grievance Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
            >
              <h2 className="text-xl font-semibold theme-text-primary mb-4">{t('extracted.file_new_grievance')}</h2>
              
              <form onSubmit={submitGrievance} className="space-y-4">
                {/* Beneficiary Selection */}
                {beneficiaries.length > 1 && (
                  <div>
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      Select Beneficiary
                    </label>
                    <select
                      value={selectedBeneficiary?.id || ''}
                      onChange={(e) => {
                        const beneficiary = beneficiaries.find(b => b.id === e.target.value);
                        setSelectedBeneficiary(beneficiary || null);
                        if (!beneficiary) {
                          // Clear editable fields when no beneficiary is selected
                          setBeneficiaryName('');
                          setBeneficiaryPhone('');
                          setBeneficiaryEmail('');
                        }
                      }}
                      className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">{t('extracted.select_a_beneficiary')}</option>
                      {beneficiaries.map((beneficiary) => (
                        <option key={beneficiary.id} value={beneficiary.id}>
                          {beneficiary.name} - {beneficiary.id}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Beneficiary Information (read-only) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      {t('extracted.beneficiary_name')}
                    </label>
                    <input 
                      value={beneficiaryName}
                      onChange={(e) => setBeneficiaryName(e.target.value)}
                      readOnly={!!selectedBeneficiary?.name}
                      placeholder={t('enterBeneficiaryName')}
                      className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      {t('extracted.phone')}
                    </label>
                    <input 
                      value={beneficiaryPhone}
                      onChange={(e) => setBeneficiaryPhone(e.target.value)}
                      readOnly={!!selectedBeneficiary?.phone}
                      placeholder={t('extracted.enterPhoneNumber')}
                      className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      {t('extracted.email')}
                    </label>
                    <input 
                      value={beneficiaryEmail}
                      onChange={(e) => setBeneficiaryEmail(e.target.value)}
                      readOnly={!!selectedBeneficiary?.email}
                      placeholder={t('extracted.enter_your_email')}
                      type="email"
                      className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      {t('extracted.beneficiary_id')}
                    </label>
                    <input 
                      value={currentUser?.id || ''}
                      readOnly
                      className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Grievance Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      {t('extracted.category')}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="disbursement-delay">{t('extracted.disbursement_delay')}</option>
                      <option value="document-issues">{t('extracted.document_issues')}</option>
                      <option value="application-status">{t('extracted.application_status')}</option>
                      <option value="officer-behavior">{t('extracted.officer_behavior')}</option>
                      <option value="information-correction">{t('extracted.information_correction')}</option>
                      <option value="technical-issues">{t('extracted.technical_issues')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      {t('extracted.sub_category')}
                    </label>
                    <input 
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      placeholder={t('extracted.optional_sub_category')}
                      className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      {t('extracted.priority')}
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                      className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="low">{t('extracted.low')}</option>
                      <option value="medium">{t('extracted.medium')}</option>
                      <option value="high">{t('extracted.high')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium theme-text-muted block mb-2">
                    {t('extracted.description')} *
                  </label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('extracted.please_provide_detailed_information_about_your_grievance')}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={!description.trim() || isSubmitting}
                  className="w-full accent-gradient text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('extracted.submitting')}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      {t('extracted.submit_grievance')}
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Grievances List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold theme-text-primary">
                  {t('extracted.your_grievances')} ({filteredList.length})
                </h3>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                  <div className="relative flex-1 sm:flex-none sm:w-64">
                    <input
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder={t('extracted.search_grievances')}
                      className="w-full px-4 py-2 pl-10 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <svg className="absolute left-3 top-2.5 w-4 h-4 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as 'all' | 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed' | 'escalated')}
                      className="px-4 py-2 rounded-lg border theme-border-glass theme-bg-input theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {filteredList.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12 theme-bg-glass rounded-xl border theme-border-glass"
                    >
                      <div className="mx-auto w-16 h-16 theme-bg-primary rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
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
                    filteredList.map((grievance, index) => (
                      <motion.div
                        key={grievance.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border theme-border-glass cursor-pointer transition-all hover:scale-[1.02] ${
                          selectedGrv?.id === grievance.id 
                            ? 'accent-gradient text-white' 
                            : 'theme-bg-glass hover:theme-border-primary'
                        }`}
                        onClick={() => setSelectedGrv(grievance)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-semibold mb-1 ${
                                  selectedGrv?.id === grievance.id ? 'text-white' : 'theme-text-primary'
                                }`}>
                                  {grievance.category || 'General Grievance'}
                                </h4>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(grievance.status)}`}>
                                    {getStatusIcon(grievance.status)}
                                    {grievance.status === 'open' ? t('extracted.open') :
                                     grievance.status === 'in-progress' ? t('extracted.in_progress') :
                                     grievance.status === 'resolved' ? t('extracted.resolved') :
                                     grievance.status === 'closed' ? t('extracted.closed') :
                                     grievance.status || t('extracted.open')}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(grievance.priority)}`}>
                                    {grievance.priority === 'low' ? t('extracted.low_priority') :
                                     grievance.priority === 'medium' ? t('extracted.medium_priority') :
                                     t('extracted.high_priority')}
                                  </span>
                                  {grievance.category && (
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      selectedGrv?.id === grievance.id 
                                        ? 'bg-white/20 text-white' 
                                        : 'theme-bg-card theme-text-muted'
                                    }`}>
                                      {grievance.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <p className={`text-sm line-clamp-2 ${
                              selectedGrv?.id === grievance.id ? 'text-white/90' : 'theme-text-muted'
                            }`}>
                              {grievance.description}
                            </p>
                            
                            <div className={`text-xs mt-2 ${
                              selectedGrv?.id === grievance.id ? 'text-white/80' : 'theme-text-muted'
                            }`}>
                              {t('extracted.filed')}: {grievance.createdDate ? new Date(grievance.createdDate).toLocaleString() : 'Recent'}
                              {grievance.assignedTo && ` • ${t('extracted.assigned_to')}: ${grievance.assignedTo}`}
                            </div>
                          </div>
                          
                          <div className="flex sm:flex-col gap-2 sm:gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedGrv(grievance); }}
                              className="p-2 rounded-lg theme-bg-card theme-text-muted hover:theme-border-primary transition-all hover:scale-110"
                              title={t('extracted.view_details')}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
            >
              <h3 className="font-semibold theme-text-primary mb-4">{t('extracted.grievance_summary')}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="theme-bg-glass rounded-xl p-4 border theme-border-glass text-center">
                  <div className="text-2xl font-bold theme-text-primary mb-1">{grievances.length}</div>
                  <div className="text-xs theme-text-muted">{t('extracted.total')}</div>
                </div>
                <div className="theme-bg-glass rounded-xl p-4 border theme-border-glass text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">{openCount}</div>
                  <div className="text-xs theme-text-muted">{t('extracted.urgent')}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm theme-text-muted">{t('extracted.open_1')}</span>
                    <span className="text-sm font-semibold theme-text-primary">{openCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-amber-500 dark:bg-amber-400 h-2 rounded-full" 
                      style={{ width: `${grievances.length ? (openCount / grievances.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm theme-text-muted">{t('extracted.in_progress')}</span>
                    <span className="text-sm font-semibold theme-text-primary">{inProgressCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full" 
                      style={{ width: `${grievances.length ? (inProgressCount / grievances.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm theme-text-muted">{t('extracted.resolved')}</span>
                    <span className="text-sm font-semibold theme-text-primary">{resolvedCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 dark:bg-green-400 h-2 rounded-full" 
                      style={{ width: `${grievances.length ? (resolvedCount / grievances.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Selected Grievance Details */}
            <AnimatePresence>
              {selectedGrv && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold theme-text-primary">{t('extracted.grievance_details')}</h4>
                    <button
                      onClick={() => setSelectedGrv(null)}
                      className="p-1 rounded-lg theme-text-muted hover:theme-bg-glass transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm theme-text-muted mb-1">Category</div>
                      <div className="font-medium theme-text-primary">{selectedGrv.category || 'General'}</div>
                    </div>

                    <div>
                      <div className="text-sm theme-text-muted mb-1">{t('extracted.description_1')}</div>
                      <div className="theme-text-primary text-sm leading-relaxed">
                        {selectedGrv.description}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.status')}</div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedGrv.status)}`}>
                          {getStatusIcon(selectedGrv.status)}
                          {selectedGrv.status === 'open' ? t('extracted.open') :
                           selectedGrv.status === 'in-progress' ? t('extracted.in_progress') :
                           selectedGrv.status === 'resolved' ? t('extracted.resolved') :
                           selectedGrv.status === 'closed' ? t('extracted.closed') :
                           selectedGrv.status || t('extracted.open')}
                        </span>
                      </div>
                      
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.priority')}</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedGrv.priority)}`}>
                          {selectedGrv.priority === 'low' ? t('extracted.low') :
                           selectedGrv.priority === 'medium' ? t('extracted.medium') :
                           t('extracted.high')}
                        </span>
                      </div>
                    </div>

                    {selectedGrv.category && (
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.category_1')}</div>
                        <div className="font-medium theme-text-primary capitalize">
                          {selectedGrv.category}
                        </div>
                      </div>
                    )}

                    {selectedGrv.assignedTo && (
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.assigned_to')}</div>
                        <div className="font-medium theme-text-primary">
                          {selectedGrv.assignedTo}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t theme-border-glass">
                      <div className="text-sm theme-text-muted mb-1">{t('extracted.grievance_id')}</div>
                      <div className="font-mono text-xs theme-text-primary theme-bg-glass px-2 py-1 rounded">
                        {selectedGrv.id}
                      </div>
                      <div className="text-xs theme-text-muted mt-2">
                        {t('extracted.filed')}: {selectedGrv.createdDate ? new Date(selectedGrv.createdDate).toLocaleString() : 'Recent'}
                      </div>
                      {selectedGrv.lastUpdated && (
                        <div className="text-xs theme-text-muted">
                          {t('extracted.last_updated')}: {new Date(selectedGrv.lastUpdated).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Dedicated Chat Section */}
                    <div className="pt-4 border-t theme-border-glass">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.communication')}</h4>
                      </div>

                      {/* Chat Messages Container */}
                      <div
                        ref={chatRef}
                        className="h-64 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-white/5 to-white/10 rounded-lg border theme-border-glass backdrop-blur-sm"
                      >
                        {(!selectedGrv.communication || selectedGrv.communication.length === 0) ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center theme-text-muted">
                              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-blue-400" />
                              </div>
                              <p className="text-sm">{t('extracted.no_messages')}</p>
                              <p className="text-xs mt-1">{t('extracted.start_conversation')}</p>
                            </div>
                          </div>
                        ) : (
                          [...(selectedGrv.communication || []), ...pendingMessages].map((comm, index) => {
                            const isOfficer = comm.type === 'officer' || comm.user === 'Officer' || comm.user === 'Admin' || comm.user === 'You';
                            console.log('Message:', comm, 'isOfficer:', isOfficer);
                            return (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex ${isOfficer ? 'justify-start' : 'justify-end'}`}
                              >
                                <div className={`max-w-[80%] ${isOfficer ? 'order-1' : 'order-2'}`}>
                                  <div className={`flex items-center gap-2 mb-1 ${isOfficer ? 'justify-start' : 'justify-end'}`}>
                                    {isOfficer && <Shield className="w-3 h-3 text-blue-500" />}
                                    <span className="text-xs font-medium theme-text-muted">
                                      {isOfficer ? (t('extracted.officer') || 'Officer') : comm.user}
                                    </span>
                                  </div>
                                  <div
                                    className={`p-3 rounded-2xl shadow-sm ${
                                      isOfficer
                                        ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-tl-sm'
                                        : 'bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-tr-sm'
                                    } ${comm.pending ? 'opacity-70' : ''}`}
                                  >
                                    <p className="text-sm theme-text-primary leading-relaxed">{comm.text}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-xs theme-text-muted opacity-70">
                                        {comm.createdAt ? new Date(comm.createdAt).toLocaleString() : ''}
                                      </p>
                                      {comm.pending && (
                                        <span className="text-xs text-yellow-500 font-medium">Sending...</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </div>

                      {/* Message Input */}
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={t('extracted.write_message')}
                          className="flex-1 px-4 py-3 text-sm rounded-xl theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                        >
                          {t('extracted.send')}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}