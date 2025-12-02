"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import LoadingState from '@/components/LoadingState';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

export default function FeedbackPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const { theme } = useTheme();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [filter, setFilter] = useState<'all' | 'open' | 'in-review' | 'resolved'>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Theme colors
  const colors = {
    light: {
      background: '#ffffff',
      foreground: '#000000',
      textPrimary: '#000000',
      textMuted: '#6b7280',
      cardBg: 'rgba(255, 255, 255, 0.9)',
      cardBorder: 'rgba(0, 0, 0, 0.1)',
      glassBg: 'rgba(255, 255, 255, 0.1)',
      glassBorder: 'rgba(255, 255, 255, 0.2)',
      glassHover: 'rgba(255, 255, 255, 0.2)',
    },
    dark: {
      background: '#0a0a0a',
      foreground: '#ffffff',
      textPrimary: '#ffffff',
      textMuted: '#9ca3af',
      cardBg: 'rgba(15, 23, 42, 0.8)',
      cardBorder: 'rgba(255, 255, 255, 0.1)',
      glassBg: 'rgba(255, 255, 255, 0.1)',
      glassBorder: 'rgba(255, 255, 255, 0.2)',
      glassHover: 'rgba(255, 255, 255, 0.2)',
    }
  };

  const currentColors = colors[theme];

  useEffect(() => {
    if (!user) return;

    const feedbackQuery = query(
      collection(db, 'feedbacks'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(feedbackQuery, (snapshot) => {
      const feedbackList: Feedback[] = [];
      snapshot.forEach((doc) => {
        feedbackList.push({ id: doc.id, ...doc.data() } as Feedback);
      });
      // Sort by createdAt descending on the client side
      feedbackList.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
        const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
        return bTime - aTime;
      });
      setFeedbacks(feedbackList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const feedbackData = {
        userId: user.uid,
        subject: subject.trim(),
        message: message.trim(),
        type,
        status: 'open' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: type === 'grievance' ? priority : undefined
      };

      if (isEditing && selectedFeedback) {
        await updateDoc(doc(db, 'feedbacks', selectedFeedback.id), {
          ...feedbackData,
          updatedAt: new Date()
        });
        setSelectedFeedback(null);
        setIsEditing(false);
      } else {
        await addDoc(collection(db, 'feedbacks'), feedbackData);
      }

      setSubject('');
      setMessage('');
      setType('feedback');
      setPriority('medium');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setSubject(feedback.subject);
    setMessage(feedback.message);
    setType(feedback.type);
    setPriority(feedback.priority || 'medium');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setSelectedFeedback(null);
    setSubject('');
    setMessage('');
    setType('feedback');
    setPriority('medium');
    setIsEditing(false);
  };

  const deleteFeedback = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    try {
      await deleteDoc(doc(db, 'feedbacks', id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback. Please try again.');
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filter !== 'all' && f.status !== filter) return false;
    if (typeFilter !== 'all' && f.type !== typeFilter) return false;
    if (searchTerm && !f.subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !f.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: Feedback['status']) => {
    const colorMap = {
      'open': theme === 'light' ? '#fef3c7' : 'rgba(113, 63, 18, 0.3)',
      'in-review': theme === 'light' ? '#dbeafe' : 'rgba(30, 58, 138, 0.3)',
      'resolved': theme === 'light' ? '#dcfce7' : 'rgba(20, 83, 45, 0.3)'
    };
    return colorMap[status];
  };

  const getStatusTextColor = (status: Feedback['status']) => {
    const colorMap = {
      'open': theme === 'light' ? '#92400e' : '#fbbf24',
      'in-review': theme === 'light' ? '#1e40af' : '#60a5fa',
      'resolved': theme === 'light' ? '#166534' : '#4ade80'
    };
    return colorMap[status];
  };

  const getTypeColor = (type: Feedback['type']) => {
    const colorMap = {
      'feedback': theme === 'light' ? '#faf5ff' : 'rgba(88, 28, 135, 0.3)',
      'grievance': theme === 'light' ? '#fff7ed' : 'rgba(120, 53, 15, 0.3)'
    };
    return colorMap[type];
  };

  const getTypeTextColor = (type: Feedback['type']) => {
    const colorMap = {
      'feedback': theme === 'light' ? '#6b21a8' : '#c084fc',
      'grievance': theme === 'light' ? '#9a3412' : '#fb923c'
    };
    return colorMap[type];
  };

  const getPriorityColor = (priority?: Feedback['priority']) => {
    const colorMap = {
      'low': theme === 'light' ? '#dcfce7' : 'rgba(20, 83, 45, 0.3)',
      'medium': theme === 'light' ? '#fef3c7' : 'rgba(113, 63, 18, 0.3)',
      'high': theme === 'light' ? '#fef2f2' : 'rgba(127, 29, 29, 0.3)'
    };
    return priority ? colorMap[priority] : '';
  };

  const getPriorityTextColor = (priority?: Feedback['priority']) => {
    const colorMap = {
      'low': theme === 'light' ? '#166534' : '#4ade80',
      'medium': theme === 'light' ? '#92400e' : '#fbbf24',
      'high': theme === 'light' ? '#991b1b' : '#f87171'
    };
    return priority ? colorMap[priority] : '';
  };

  const getStatusIcon = (status: Feedback['status']) => {
    const icons = {
      'open': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'in-review': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      'resolved': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
    return icons[status];
  };

  const openCount = feedbacks.filter(f => f.status === 'open').length;
  const inReviewCount = feedbacks.filter(f => f.status === 'in-review').length;
  const resolvedCount = feedbacks.filter(f => f.status === 'resolved').length;
  const grievanceCount = feedbacks.filter(f => f.type === 'grievance').length;

  if (loading) {
    return <LoadingState message={t('loading_feedback') || "Loading feedback..."} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ color: currentColors.foreground }}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: theme === 'light' ? '#3b82f6' : '#1e40af' }}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: theme === 'light' ? '#8b5cf6' : '#7c3aed' }}></div>
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: currentColors.textPrimary }}>
              {t('extracted.feedback') || 'Feedback & Grievances'}
            </h1>
            <p className="text-sm md:text-base" style={{ color: currentColors.textMuted }}>
              {t('extracted.submit_feedback_or_report_grievances') || 'Share your feedback or report grievances to help us improve'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Feedback Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border p-4 md:p-6 shadow-xl"
                style={{ backgroundColor: currentColors.cardBg, borderColor: currentColors.cardBorder }}
              >
                <h2 className="text-xl font-semibold mb-4" style={{ color: currentColors.textPrimary }}>
                  {isEditing ? (t('extracted.edit_feedback') || 'Edit Feedback') : (t('extracted.submit_new') || 'Submit New Feedback')}
                </h2>

                <form onSubmit={submitFeedback} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Type Selector */}
                    <div>
                      <label className="text-sm font-medium block mb-2" style={{ color: currentColors.textMuted }}>
                        {t('extracted.type_1') || 'Type'} *
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {['feedback', 'grievance'].map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setType(option as 'feedback' | 'grievance')}
                            className="px-4 py-2 rounded-full font-medium transition-all border"
                            style={{
                              backgroundColor: type === option ? (theme === 'light' ? '#3b82f6' : '#1e40af') : currentColors.glassBg,
                              borderColor: type === option ? 'transparent' : currentColors.glassBorder,
                              color: type === option ? '#ffffff' : currentColors.textPrimary
                            }}
                          >
                            {option === 'feedback' ? (t('extracted.general_feedback') || 'General Feedback') : (t('extracted.grievance_1') || 'Grievance')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Priority Selector - only for grievance */}
                    {type === 'grievance' && (
                      <div>
                        <label className="text-sm font-medium block mb-2" style={{ color: currentColors.textMuted }}>
                          {t('extracted.priority_1') || 'Priority'}
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {['low', 'medium', 'high'].map(option => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setPriority(option as Feedback['priority'])}
                              className="px-4 py-2 rounded-full font-medium transition-all border"
                              style={{
                                backgroundColor: priority === option ? (theme === 'light' ? '#dc2626' : '#991b1b') : currentColors.glassBg,
                                borderColor: priority === option ? 'transparent' : currentColors.glassBorder,
                                color: priority === option ? '#ffffff' : currentColors.textPrimary
                              }}
                            >
                              {t(`extracted.${option}`) || option.charAt(0).toUpperCase() + option.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subject Input */}
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: currentColors.textMuted }}>
                      {t('extracted.subject') || 'Subject'} *
                    </label>
                    <input
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder={t('extracted.brief_summary_of_your_feedback_or_grievance') || 'Brief summary of your feedback or grievance'}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      style={{
                        backgroundColor: currentColors.glassBg,
                        borderColor: currentColors.glassBorder,
                        color: currentColors.textPrimary
                      }}
                      required
                    />
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: currentColors.textMuted }}>
                      {t('extracted.message_1') || 'Message'} *
                    </label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder={t('extracted.please_provide_detailed_information') || 'Please provide detailed information about your feedback or grievance'}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical"
                      style={{
                        backgroundColor: currentColors.glassBg,
                        borderColor: currentColors.glassBorder,
                        color: currentColors.textPrimary
                      }}
                      required
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !subject.trim() || !message.trim()}
                      className="flex-1 font-semibold py-3 px-6 rounded-lg shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                      style={{
                        background: theme === 'light' ? 'linear-gradient(135deg, #f97316, #ea580c, #dc2626)' : 'linear-gradient(135deg, #1e40af, #3b82f6, #8b5cf6)',
                        color: '#ffffff'
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      {isSubmitting ? (t('extracted.submitting') || 'Submitting...') : (type === 'grievance' ? (t('extracted.submit_grievance') || 'Submit Grievance') : (t('extracted.submit_feedback') || 'Submit Feedback'))}
                    </button>

                    {isEditing ? (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-6 py-3 border font-medium rounded-lg transition-colors"
                        style={{
                          borderColor: currentColors.glassBorder,
                          color: currentColors.textMuted,
                          backgroundColor: currentColors.glassBg
                        }}
                      >
                        {t('extracted.cancel') || 'Cancel'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setSubject(''); setMessage(''); setType('feedback'); setPriority('medium'); }}
                        className="px-6 py-3 border font-medium rounded-lg transition-colors"
                        style={{
                          borderColor: currentColors.glassBorder,
                          color: currentColors.textMuted,
                          backgroundColor: currentColors.glassBg
                        }}
                      >
                        {t('extracted.reset') || 'Reset'}
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>

              {/* Feedback List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border overflow-hidden shadow-xl"
                style={{ backgroundColor: currentColors.cardBg, borderColor: currentColors.cardBorder }}
              >
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold" style={{ color: currentColors.textPrimary }}>
                      {t('extracted.your_feedback') || 'Your Feedback'} ({filteredFeedbacks.length})
                    </h3>

                    {/* Search */}
                    <div className="relative">
                      <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: currentColors.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder={t('extracted.search_feedback') || 'Search feedback...'}
                        className="pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        style={{
                          backgroundColor: currentColors.glassBg,
                          borderColor: currentColors.glassBorder,
                          color: currentColors.textPrimary
                        }}
                      />
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${filter === 'all' ? 'shadow-md' : ''}`}
                        style={{
                          backgroundColor: filter === 'all' ? (theme === 'light' ? '#3b82f6' : '#1e40af') : currentColors.glassBg,
                          border: `1px solid ${currentColors.glassBorder}`,
                          color: filter === 'all' ? '#ffffff' : currentColors.textPrimary
                        }}
                      >
                        {t('extracted.all') || 'All'} ({feedbacks.length})
                      </button>
                      <button
                        onClick={() => setFilter('open')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${filter === 'open' ? 'shadow-md' : ''}`}
                        style={{
                          backgroundColor: filter === 'open' ? getStatusColor('open') : currentColors.glassBg,
                          border: `1px solid ${currentColors.glassBorder}`,
                          color: filter === 'open' ? getStatusTextColor('open') : currentColors.textPrimary
                        }}
                      >
                        {t('extracted.open') || 'Open'} ({openCount})
                      </button>
                      <button
                        onClick={() => setFilter('in-review')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${filter === 'in-review' ? 'shadow-md' : ''}`}
                        style={{
                          backgroundColor: filter === 'in-review' ? getStatusColor('in-review') : currentColors.glassBg,
                          border: `1px solid ${currentColors.glassBorder}`,
                          color: filter === 'in-review' ? getStatusTextColor('in-review') : currentColors.textPrimary
                        }}
                      >
                        {t('extracted.in_review') || 'In Review'} ({inReviewCount})
                      </button>
                      <button
                        onClick={() => setFilter('resolved')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${filter === 'resolved' ? 'shadow-md' : ''}`}
                        style={{
                          backgroundColor: filter === 'resolved' ? getStatusColor('resolved') : currentColors.glassBg,
                          border: `1px solid ${currentColors.glassBorder}`,
                          color: filter === 'resolved' ? getStatusTextColor('resolved') : currentColors.textPrimary
                        }}
                      >
                        {t('extracted.resolved') || 'Resolved'} ({resolvedCount})
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setTypeFilter('all')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${typeFilter === 'all' ? 'shadow-md' : ''}`}
                        style={{
                          backgroundColor: typeFilter === 'all' ? (theme === 'light' ? '#6b7280' : '#374151') : currentColors.glassBg,
                          border: `1px solid ${currentColors.glassBorder}`,
                          color: typeFilter === 'all' ? '#ffffff' : currentColors.textPrimary
                        }}
                      >
                        {t('extracted.all_types') || 'All Types'}
                      </button>
                      <button
                        onClick={() => setTypeFilter('feedback')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${typeFilter === 'feedback' ? 'shadow-md' : ''}`}
                        style={{
                          backgroundColor: typeFilter === 'feedback' ? getTypeColor('feedback') : currentColors.glassBg,
                          border: `1px solid ${currentColors.glassBorder}`,
                          color: typeFilter === 'feedback' ? getTypeTextColor('feedback') : currentColors.textPrimary
                        }}
                      >
                        {t('extracted.feedback') || 'Feedback'} ({feedbacks.filter(f => f.type === 'feedback').length})
                      </button>
                      <button
                        onClick={() => setTypeFilter('grievance')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${typeFilter === 'grievance' ? 'shadow-md' : ''}`}
                        style={{
                          backgroundColor: typeFilter === 'grievance' ? getTypeColor('grievance') : currentColors.glassBg,
                          border: `1px solid ${currentColors.glassBorder}`,
                          color: typeFilter === 'grievance' ? getTypeTextColor('grievance') : currentColors.textPrimary
                        }}
                      >
                        {t('extracted.grievances') || 'Grievances'} ({grievanceCount})
                      </button>
                    </div>
                  </div>

                  {/* Feedback Items */}
                  <div className="space-y-4">
                    {filteredFeedbacks.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: currentColors.glassBg, border: `1px solid ${currentColors.glassBorder}` }}>
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: currentColors.textMuted }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="mb-2" style={{ color: currentColors.textMuted }}>
                          {t('extracted.no_feedback_yet') || 'No feedback yet'}
                        </p>
                        <p className="text-sm mb-4" style={{ color: currentColors.textMuted }}>
                          {t('extracted.share_your_thoughts') || 'Share your thoughts and help us improve'}
                        </p>
                      </div>
                    ) : (
                      filteredFeedbacks.map((feedback, index) => (
                        <motion.div
                          key={feedback.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="rounded-xl border p-4 hover:shadow-md transition-all duration-200"
                          style={{ backgroundColor: currentColors.glassBg, borderColor: currentColors.glassBorder }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: getTypeColor(feedback.type), color: getTypeTextColor(feedback.type) }}>
                                {feedback.type === 'feedback' ? (t('extracted.feedback') || 'Feedback') : (t('extracted.grievance') || 'Grievance')}
                              </span>
                              {feedback.priority && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: getPriorityColor(feedback.priority), color: getPriorityTextColor(feedback.priority) }}>
                                  {t(`extracted.${feedback.priority}`) || feedback.priority.charAt(0).toUpperCase() + feedback.priority.slice(1)}
                                </span>
                              )}
                              <span className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1" style={{ backgroundColor: getStatusColor(feedback.status), color: getStatusTextColor(feedback.status) }}>
                                {getStatusIcon(feedback.status)}
                                {t(`extracted.${feedback.status.replace('-', '_')}`) || feedback.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => editFeedback(feedback)}
                                className="p-1 rounded hover:bg-opacity-20 transition-colors"
                                style={{ color: currentColors.textMuted }}
                                title={t('extracted.edit') || 'Edit'}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteFeedback(feedback.id)}
                                className="p-1 rounded hover:bg-opacity-20 transition-colors"
                                style={{ color: currentColors.textMuted }}
                                title={t('extracted.delete') || 'Delete'}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <h4 className="font-semibold mb-2" style={{ color: currentColors.textPrimary }}>
                            {feedback.subject}
                          </h4>

                          <p className="text-sm mb-3" style={{ color: currentColors.textMuted }}>
                            {feedback.message}
                          </p>

                          <div className="flex items-center justify-between text-xs" style={{ color: currentColors.textMuted }}>
                            <span>
                              {t('extracted.created') || 'Created'}: {feedback.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                              {feedback.updatedAt && feedback.updatedAt.toDate?.().getTime() !== feedback.createdAt?.toDate?.().getTime() && (
                                <span className="ml-2">
                                  • {t('extracted.updated') || 'Updated'}: {feedback.updatedAt.toDate?.().toLocaleDateString()}
                                </span>
                              )}
                            </span>
                            <span className="font-mono" style={{ color: currentColors.textMuted }}>
                              #{feedback.id.slice(-6)}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border p-4 md:p-6 shadow-xl"
                style={{ backgroundColor: currentColors.cardBg, borderColor: currentColors.cardBorder }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: currentColors.textPrimary }}>
                  {t('extracted.feedback_stats') || 'Feedback Statistics'}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: currentColors.glassBg }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: getStatusColor('open') }}>
                        {getStatusIcon('open')}
                      </div>
                      <span className="font-medium" style={{ color: currentColors.textPrimary }}>{t('extracted.open') || 'Open'}</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: getStatusTextColor('open') }}>{openCount}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: currentColors.glassBg }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: getStatusColor('in-review') }}>
                        {getStatusIcon('in-review')}
                      </div>
                      <span className="font-medium" style={{ color: currentColors.textPrimary }}>{t('extracted.in_review') || 'In Review'}</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: getStatusTextColor('in-review') }}>{inReviewCount}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: currentColors.glassBg }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: getStatusColor('resolved') }}>
                        {getStatusIcon('resolved')}
                      </div>
                      <span className="font-medium" style={{ color: currentColors.textPrimary }}>{t('extracted.resolved') || 'Resolved'}</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: getStatusTextColor('resolved') }}>{resolvedCount}</span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Tips */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border p-4 md:p-6 shadow-xl"
                style={{ backgroundColor: currentColors.cardBg, borderColor: currentColors.cardBorder }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: currentColors.textPrimary }}>
                  {t('extracted.tips_for_better_feedback') || 'Tips for Better Feedback'}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: theme === 'light' ? '#dcfce7' : 'rgba(20, 83, 45, 0.3)' }}>
                      <span className="text-xs font-bold" style={{ color: theme === 'light' ? '#166534' : '#4ade80' }}>1</span>
                    </div>
                    <p className="text-sm" style={{ color: currentColors.textMuted }}>
                      {t('extracted.be_specific_about_issues') || 'Be specific about the issues you encountered'}
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: theme === 'light' ? '#dbeafe' : 'rgba(30, 58, 138, 0.3)' }}>
                      <span className="text-xs font-bold" style={{ color: theme === 'light' ? '#1e40af' : '#60a5fa' }}>2</span>
                    </div>
                    <p className="text-sm" style={{ color: currentColors.textMuted }}>
                      {t('extracted.include_steps_to_reproduce') || 'Include steps to reproduce the problem'}
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: theme === 'light' ? '#faf5ff' : 'rgba(88, 28, 135, 0.3)' }}>
                      <span className="text-xs font-bold" style={{ color: theme === 'light' ? '#6b21a8' : '#c084fc' }}>3</span>
                    </div>
                    <p className="text-sm" style={{ color: currentColors.textMuted }}>
                      {t('extracted.suggest_improvements') || 'Suggest improvements or solutions'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}