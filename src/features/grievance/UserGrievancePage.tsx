"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { collection, query, onSnapshot, doc, setDoc, updateDoc, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLocale } from '@/context/LocaleContext';
import LoadingState from '@/components/LoadingState';
import { PageHeader, StatBand } from '@/components/dashboard/ui';
import NewGrievanceDrawer from './components/NewGrievanceDrawer';
import GrievanceCard from './components/GrievanceCard';
import GrievanceInspector from './components/GrievanceInspector';
import { useUserGrievances } from './helpers';
import type { Grievance } from './helpers';
import {
  Plus, Search, Clock, Zap, CheckCircle2, MessageSquare, FileText
} from 'lucide-react';

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

  const openCount = grievances.filter(l => l.status === 'open').length;
  const inProgressCount = grievances.filter(l => l.status === 'in-progress').length;
  const resolvedCount = grievances.filter(l => l.status === 'resolved' || l.status === 'closed').length;

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header Section */}
      <PageHeader
        title={t('extracted.grievance_portal')}
        highlight={t('extracted.dashboard')}
        subtitle={t('extracted.file_and_track_grievances')}
      >
        <button
          onClick={() => setShowNewGrievanceForm(true)}
          disabled={beneficiaries.length === 0}
          className="h-9 px-3.5 rounded-md accent-gradient text-white text-xs font-semibold hover:opacity-90 inline-flex items-center gap-1.5 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('extracted.file_new_grievance')}
        </button>
      </PageHeader>

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
          <StatBand
            cells={[
              { label: t('extracted.total'), value: grievances.length, icon: MessageSquare, dot: '' },
              { label: t('extracted.open_1'), value: openCount, icon: Clock, dot: 'bg-amber-500' },
              { label: t('extracted.in_progress'), value: inProgressCount, icon: Zap, dot: 'bg-blue-500' },
              { label: t('extracted.resolved'), value: resolvedCount, icon: CheckCircle2, dot: 'bg-emerald-500' },
            ]}
          />

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
                      <GrievanceCard
                        key={grievance.id}
                        grievance={grievance}
                        selected={selectedGrv?.id === grievance.id}
                        onSelect={setSelectedGrv}
                        t={t}
                      />
                    ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Selected Grievance Inspector (details + communication thread) */}
          <AnimatePresence>
            {selectedGrv && (
              <GrievanceInspector
                grievance={selectedGrv}
                onClose={() => setSelectedGrv(null)}
                chatRef={chatRef}
                pendingMessages={pendingMessages}
                newMessage={newMessage}
                onMessageChange={setNewMessage}
                onSend={sendMessage}
                recognition={recognition}
                isRecording={isRecording}
                onStartRecording={startVoiceRecording}
                onStopRecording={stopVoiceRecording}
                t={t}
              />
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
