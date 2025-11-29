"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import { collection, query, orderBy, onSnapshot, doc, setDoc, updateDoc, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Grievance type definition matching the admin page
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
  subject?: string; // For user grievances
};

// Hook to get user-specific grievances from Firestore
const useUserGrievances = (userId: string, setState: React.Dispatch<React.SetStateAction<Grievance[]>>) => {
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'grievances'), 
      where('beneficiaryId', '==', userId),
      orderBy('createdDate', 'desc')
    );
    
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
          beneficiaryName: data.beneficiaryName || data.name || '—',
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
          subject: data.subject || data.description?.substring(0, 50) + '...' || 'No subject',
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
  }, [userId, setState]);
};

export default function GrievancePage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('general');
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved' | 'closed'>('all');
  const [selectedGrv, setSelectedGrv] = useState<Grievance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLocale();
  const { theme } = useTheme();

  // In a real app, you'd get this from auth context
  const [currentUser] = useState({
    id: 'user-123', // This should come from your auth system
    name: 'John Doe',
    phone: '+1234567890',
    email: 'user@example.com',
    district: 'Sample District',
    state: 'Sample State'
  });

  // Load user grievances from Firestore
  useUserGrievances(currentUser.id, setGrievances);

  const submitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const grievanceId = `GRV-${Date.now()}`;
      const grievanceData = {
        id: grievanceId,
        beneficiaryId: currentUser.id,
        beneficiaryName: currentUser.name,
        phone: currentUser.phone,
        email: currentUser.email,
        district: currentUser.district,
        state: currentUser.state,
        category: category,
        subCategory: '', // User can specify if needed
        priority: priority,
        status: 'open',
        subject: subject.trim(),
        description: description.trim(),
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
      setSubject('');
      setDescription('');
      setPriority('medium');
      setCategory('general');
      
    } catch (error) {
      console.error('Error submitting grievance:', error);
      alert(t('extracted.submission_failed') || 'Failed to submit grievance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCommunication = async (grievanceId: string, message: string) => {
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

  const filteredList = grievances.filter(g => {
    if (filter !== 'all' && g.status !== filter) return false;
    if (searchTerm && !g.subject?.toLowerCase().includes(searchTerm.toLowerCase()) && 
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      {t('extracted.category')}
                    </label>
                    <div className="inline-flex items-center flex-nowrap sm:flex-wrap theme-bg-glass border theme-border-glass rounded-full p-1 gap-2 overflow-x-auto sm:overflow-x-visible w-full sm:bg-transparent sm:border-0 sm:rounded-none sm:p-0 sm:gap-3 sm:justify-start">
                      {['general', 'application', 'payment', 'technical', 'other'].map(option => {
                        const isActive = category === option;
                        const label =
                          option === 'general' ? t('extracted.general') :
                          option === 'application' ? t('extracted.application') :
                          option === 'payment' ? t('extracted.payment') :
                          option === 'technical' ? t('extracted.technical') :
                          t('extracted.other');

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setCategory(option)}
                            className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium rounded-full transition-all duration-200 px-3 sm:px-4 py-2 sm:py-1.5 min-w-[7.5rem] sm:min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                              isActive 
                                ? 'accent-gradient text-white shadow-md sm:shadow-none sm:ring-1 sm:ring-white/10 sm:scale-105' 
                                : 'bg-transparent theme-text-primary hover:theme-bg-glass sm:bg-transparent sm:border sm:border-gray-200 dark:sm:border-gray-700 sm:hover:border-gray-300 dark:sm:hover:border-gray-600'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      {t('extracted.priority')}
                    </label>
                    <div className="inline-flex items-center flex-nowrap sm:flex-wrap theme-bg-glass border theme-border-glass rounded-full p-1 gap-2 overflow-x-auto sm:overflow-x-visible w-full sm:bg-transparent sm:border-0 sm:rounded-none sm:p-0 sm:gap-3 sm:justify-start">
                      {['low', 'medium', 'high'].map(option => {
                        const isActive = priority === option;
                        const label =
                          option === 'low' ? t('extracted.low') :
                          option === 'medium' ? t('extracted.medium') :
                          t('extracted.high');

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setPriority(option as 'low' | 'medium' | 'high')}
                            className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium rounded-full transition-all duration-200 px-3 sm:px-4 py-2 sm:py-1.5 min-w-[7.5rem] sm:min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                              isActive 
                                ? 'accent-gradient text-white shadow-md sm:shadow-none sm:ring-1 sm:ring-white/10 sm:scale-105' 
                                : 'bg-transparent theme-text-primary hover:theme-bg-glass sm:bg-transparent sm:border sm:border-gray-200 dark:sm:border-gray-700 sm:hover:border-gray-300 dark:sm:hover:border-gray-600'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium theme-text-muted block mb-2">
                    {t('extracted.subject')} *
                  </label>
                  <input 
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder={t('extracted.brief_description_of_your_grievance')}
                    className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium theme-text-muted block mb-2">
                    {t('extracted.description')} *
                  </label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder={t('extracted.please_provide_detailed_information_about_your_grievance')}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={!subject.trim() || !description.trim() || isSubmitting}
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
                    <div className="inline-flex items-center flex-nowrap sm:flex-wrap theme-bg-glass border theme-border-glass rounded-full p-1 gap-2 overflow-x-auto sm:overflow-x-visible w-full sm:w-auto sm:bg-transparent sm:border-0 sm:rounded-none sm:p-0 sm:gap-3 sm:justify-end">
                      {['all', 'open', 'in-progress', 'resolved', 'closed'].map(option => {
                        const isActive = filter === option;
                        const label =
                          option === 'all' ? t('extracted.all_status') :
                          option === 'open' ? t('extracted.open') :
                          option === 'in-progress' ? t('extracted.in_progress') :
                          option === 'resolved' ? t('extracted.resolved') :
                          t('extracted.closed');

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setFilter(option as any)}
                            className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium rounded-full transition-all duration-200 px-3 sm:px-4 py-2 sm:py-1.5 min-w-[7.5rem] sm:min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                              isActive 
                                ? 'accent-gradient text-white shadow-md sm:shadow-none sm:ring-1 sm:ring-white/10 sm:scale-105' 
                                : 'bg-transparent theme-text-primary hover:theme-bg-glass sm:bg-transparent sm:border sm:border-gray-200 dark:sm:border-gray-700 sm:hover:border-gray-300 dark:sm:hover:border-gray-600'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
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
                                  {grievance.subject}
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
                      <div className="text-sm theme-text-muted mb-1">{t('extracted.subject_1')}</div>
                      <div className="font-medium theme-text-primary">{selectedGrv.subject}</div>
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

                    {/* Communication Section */}
                    {selectedGrv.communication && selectedGrv.communication.length > 0 && (
                      <div className="pt-2 border-t theme-border-glass">
                        <div className="text-sm font-medium theme-text-muted mb-2">{t('extracted.communication')}</div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {selectedGrv.communication.map((comm, index) => (
                            <div key={index} className="text-xs theme-bg-glass p-2 rounded">
                              <div className="font-medium theme-text-primary">{comm.user}</div>
                              <div className="theme-text-muted">{comm.text}</div>
                              <div className="text-xs theme-text-muted mt-1">
                                {comm.createdAt ? new Date(comm.createdAt).toLocaleString() : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}