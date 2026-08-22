"use client";
import React, { useEffect, useState } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import LoadingState from '@/components/LoadingState';
import ConfirmDeleteModal from '@/components/dashboard/ConfirmDeleteModal';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MessageSquare, Pencil, Send, Star, Trash2 } from 'lucide-react';

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

const INPUT_CLASS = "w-full h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors";

export default function FeedbackPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
    try {
      await deleteDoc(doc(db, 'feedbacks', id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback. Please try again.');
    }
  };

  const getRatingStars = (value: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${star <= value ? 'fill-current text-amber-400' : 'theme-text-muted'}`}
        />
      ))}
      <span className="ml-1 text-[11px] theme-text-muted tabular-nums">{value}/5</span>
    </div>
  );

  const getStatusPillClass = (status: string) => {
    switch (status) {
      case 'open': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'in-review': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'resolved': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const averageRating = feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : '0.0';

  if (loading) {
    return <LoadingState message={t('loading_feedback') || "Loading feedback..."} />;
  }

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
          {t('extracted.feedback') || 'Feedback'} <span className="text-accent-gradient">{t('extracted.center')}</span>
        </h1>
        <p className="text-xs theme-text-muted mt-0.5 truncate">
          {t('extracted.share_your_thoughts') || 'Share your feedback and help us improve our services'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          {/* Feedback Form */}
          <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b theme-border-glass">
              <h2 className="text-sm font-semibold theme-text-primary">
                {isEditing ? (t('extracted.edit_feedback') || 'Edit Feedback') : (t('extracted.submit_new') || 'Submit New Feedback')}
              </h2>
            </div>

            <form onSubmit={submitFeedback} className="p-4 space-y-4">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium theme-text-muted mb-2">
                  {t('extracted.feedback_analytics.rating')} *
                </label>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-colors"
                      title={String(star)}
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${star <= rating ? 'fill-current text-amber-400 hover:text-amber-500' : 'theme-text-muted hover:text-amber-400'}`}
                      />
                    </button>
                  ))}
                  <span className="ml-1.5 text-xs theme-text-muted">
                    {rating} {t('extracted.feedback_analytics.outOf5Stars')}
                  </span>
                </div>
              </div>

              {/* Subject Input */}
              <div>
                <label className="block text-sm font-medium theme-text-muted mb-2">
                  {t('extracted.subject') || 'Subject'} *
                </label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder={t('extracted.brief_summary_of_your_feedback') || "Brief summary of your feedback"}
                  className={INPUT_CLASS}
                  required
                />
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-sm font-medium theme-text-muted mb-2">
                  {t('extracted.message_1') || 'Message'} *
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={t('extracted.please_provide_detailed_information') || 'Please provide detailed information about your feedback or grievance'}
                  rows={4}
                  className={`${INPUT_CLASS} min-h-[80px] py-2 h-auto resize-y`}
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t theme-border-glass">
                {isEditing ? (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="h-9 px-3.5 rounded-md border theme-border-glass theme-bg-glass theme-text-secondary text-xs font-semibold hover:theme-bg-hover transition-colors"
                  >
                    {t('extracted.cancel') || 'Cancel'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setSubject(''); setMessage(''); setRating(5); }}
                    className="h-9 px-3.5 rounded-md border theme-border-glass theme-bg-glass theme-text-secondary text-xs font-semibold hover:theme-bg-hover transition-colors"
                  >
                    {t('extracted.reset') || 'Reset'}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || !subject.trim() || !message.trim()}
                  className="h-9 px-3.5 rounded-md accent-gradient text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity inline-flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? (t('extracted.submitting') || 'Submitting...') : (t('extracted.submit_feedback') || 'Submit Feedback')}
                </button>
              </div>
            </form>
          </div>

          {/* Feedback List */}
          <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b theme-border-glass">
              <h3 className="text-sm font-semibold theme-text-primary">
                {t('extracted.feedback_analytics.yourFeedback')} <span className="theme-text-muted font-normal">({feedbacks.length})</span>
              </h3>
            </div>

            <div className="p-4 space-y-3">
              {feedbacks.length === 0 ? (
                <div className="text-center py-12 theme-bg-glass rounded-lg border theme-border-glass">
                  <div className="mx-auto w-14 h-14 rounded-full theme-bg-primary flex items-center justify-center mb-3">
                    <MessageSquare className="w-7 h-7 theme-text-muted" />
                  </div>
                  <p className="theme-text-muted mb-1">
                    {t('extracted.no_feedback_yet') || 'No feedback yet'}
                  </p>
                  <p className="text-xs theme-text-muted">
                    {t('extracted.share_your_thoughts') || 'Share your thoughts and help us improve'}
                  </p>
                </div>
              ) : (
                feedbacks.map((feedback) => (
                  <div key={feedback.id} className="theme-bg-card theme-border-glass border rounded-lg p-3.5">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm theme-text-primary truncate leading-tight">
                            {feedback.subject}
                          </h4>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0 ${getStatusPillClass(feedback.status)}`}>
                            {feedback.status.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          {getRatingStars(feedback.rating)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => editFeedback(feedback)}
                          className="p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:theme-text-primary transition-colors"
                          title={t('extracted.edit') || 'Edit'}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(feedback.id)}
                          className="p-1.5 rounded-md theme-text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
                          title={t('extracted.delete') || 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[13px] theme-text-secondary leading-relaxed">
                      {feedback.message}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2.5 border-t theme-border-glass">
                      <span className="text-[11px] theme-text-muted tabular-nums">
                        {t('extracted.created') || 'Created'}: {feedback.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                        {feedback.updatedAt && feedback.updatedAt.toDate?.().getTime() !== feedback.createdAt?.toDate?.().getTime() && (
                          <span className="ml-2">
                            • {t('extracted.updated') || 'Updated'}: {feedback.updatedAt.toDate?.().toLocaleDateString()}
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] theme-text-muted font-mono">
                        #{feedback.id.slice(-6)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 min-w-0">
          {/* Statistics */}
          <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b theme-border-glass">
              <h3 className="text-sm font-semibold theme-text-primary">
                {t('extracted.feedback_stats') || 'Feedback Statistics'}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-px theme-bg-glass">
              <div className="theme-bg-card p-3.5">
                <div className="text-[11px] uppercase tracking-wider theme-text-muted">
                  {t('extracted.feedback_analytics.totalFeedback')}
                </div>
                <p className="text-xl font-semibold tabular-nums theme-text-primary mt-1">
                  {feedbacks.length}
                </p>
              </div>
              <div className="theme-bg-card p-3.5">
                <div className="text-[11px] uppercase tracking-wider theme-text-muted">
                  {t('extracted.feedback_analytics.rating')}
                </div>
                <div className="flex items-center gap-1.5 text-xl font-semibold tabular-nums theme-text-primary mt-1">
                  <Star className="w-4 h-4 fill-current text-amber-400 shrink-0" />
                  {averageRating}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b theme-border-glass">
              <h3 className="text-sm font-semibold theme-text-primary">
                {t('extracted.tips_for_better_feedback') || 'Tips for Better Feedback'}
              </h3>
            </div>

            <div className="p-4 space-y-3">
              {[
                t('extracted.be_specific_about_issues') || 'Be specific about the issues you encountered',
                t('extracted.include_steps_to_reproduce') || 'Include steps to reproduce the problem',
                t('extracted.suggest_improvements') || 'Suggest improvements or solutions'
              ].map((tip, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full accent-gradient text-white flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold">{index + 1}</span>
                  </div>
                  <p className="text-[13px] theme-text-secondary leading-relaxed">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
