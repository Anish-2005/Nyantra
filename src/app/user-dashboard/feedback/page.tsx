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
        rating,
        status: 'open' as const,
        createdAt: new Date(),
        updatedAt: new Date()
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
      setRating(5);
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
    setRating(feedback.rating);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setSelectedFeedback(null);
    setSubject('');
    setMessage('');
    setRating(5);
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

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm font-medium" style={{ color: currentColors.textPrimary }}>
          {rating}/ 5
        </span>
      </div>
    );
  };

  const averageRating = feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : '0.0';

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
              {t('extracted.feedback') || 'Feedback'}
            </h1>
            <p className="text-sm md:text-base" style={{ color: currentColors.textMuted }}>
              {t('extracted.share_your_thoughts') || 'Share your feedback and help us improve our services'}
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
                  {/* Star Rating */}
                  <div>
                    <label className="text-sm font-medium block mb-3" style={{ color: currentColors.textMuted }}>
                      {t('extracted.feedback_analytics.rating')} *
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="transition-all hover:scale-110"
                        >
                          <svg
                            className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                      <span className="ml-2 text-sm" style={{ color: currentColors.textMuted }}>
                        {rating} {t('extracted.feedback_analytics.outOf5Stars')}
                      </span>
                    </div>
                  </div>

                  {/* Subject Input */}
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: currentColors.textMuted }}>
                      {t('extracted.subject') || 'Subject'} *
                    </label>
                    <input
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder={t('extracted.brief_summary_of_your_feedback') || "Brief summary of your feedback"}
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
                      {isSubmitting ? (t('extracted.submitting') || 'Submitting...') : (t('extracted.submit_feedback') || 'Submit Feedback')}
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
                        onClick={() => { setSubject(''); setMessage(''); setRating(5); }}
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
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold" style={{ color: currentColors.textPrimary }}>
                      {t('extracted.feedback_analytics.yourFeedback')} ({feedbacks.length})
                    </h3>
                  </div>

                  {/* Feedback Items */}
                  <div className="space-y-4">
                    {feedbacks.length === 0 ? (
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
                      feedbacks.map((feedback, index) => (
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
                              {getRatingStars(feedback.rating)}
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
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme === 'light' ? '#dbeafe' : 'rgba(30, 58, 138, 0.3)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme === 'light' ? '#1e40af' : '#60a5fa' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="font-medium" style={{ color: currentColors.textPrimary }}>{t('extracted.feedback_analytics.totalFeedback')}</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: theme === 'light' ? '#1e40af' : '#60a5fa' }}>{feedbacks.length}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: currentColors.glassBg }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme === 'light' ? '#fbbf24' : '#f59e0b' }}>
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span className="font-medium" style={{ color: currentColors.textPrimary }}>{t('extracted.feedback_analytics.averageRating', { rating: averageRating })}</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: theme === 'light' ? '#d97706' : '#fbbf24' }}>{averageRating} ⭐</span>
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