"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import LoadingState from '@/components/LoadingState';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Submission = {
  id: string;
  applicantName?: string;
  anonymous?: boolean;
  phone?: string;
  aadhaar?: string;
  firNumber?: string;
  policeStation?: string;
  courtCaseId?: string;
  amountRequested?: number;
  bankAccount?: string;
  ifsc?: string;
  status?: string;
  applicationDate?: any;
  actType?: string;
};

const STORAGE_KEY = 'nyantra_user_applications_v1';

export default function UserDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLocale();

  // Redirect logic kept minimal: only redirect unauthenticated users to login
  useEffect(() => {
    if (loading) return;
    if (!user) router.push('/login');
  }, [user, loading, router]);

  const [recent, setRecent] = useState<Submission[]>([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalAmountRequested: 0,
  });

  useEffect(() => {
    if (!user) return;

    // Fetch user's applications from Firebase (same logic as applications page)
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(applicationsQuery, (snapshot) => {
      const applications: Submission[] = [];
      let totalAmount = 0;
      let pendingCount = 0;
      let approvedCount = 0;

      // Get all applications and sort client-side by applicationDate desc
      const allDocs = snapshot.docs;
      allDocs.sort((a, b) => {
        const dateA = a.data().applicationDate?.toDate?.()?.getTime() || 0;
        const dateB = b.data().applicationDate?.toDate?.()?.getTime() || 0;
        return dateB - dateA; // newer first
      });

      // Get recent applications (limit to 6 for display)
      const recentDocs = allDocs.slice(0, 6);

      recentDocs.forEach((doc) => {
        const data = doc.data();
        const app: Submission = {
          id: doc.id,
          applicantName: data.applicantName,
          anonymous: data.anonymous,
          phone: data.contactNumber || data.phone,
          aadhaar: data.aadhaar,
          firNumber: data.caseNumber,
          policeStation: data.policeStation,
          courtCaseId: data.courtCaseId,
          amountRequested: data.amount,
          bankAccount: data.bankAccount,
          ifsc: data.ifsc || data.bankIfsc,
          status: data.status,
          applicationDate: data.applicationDate,
          actType: data.actType,
        };
        applications.push(app);
      });

      // Calculate stats from all applications
      allDocs.forEach((doc) => {
        const data = doc.data();
        if (data.amount) totalAmount += data.amount;
        if (data.status === 'pending') pendingCount++;
        if (data.status === 'approved') approvedCount++;
      });

      setRecent(applications);
      setStats({
        totalApplications: allDocs.length,
        pendingApplications: pendingCount,
        approvedApplications: approvedCount,
        totalAmountRequested: totalAmount,
      });
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <LoadingState message={t('extracted.loading_dashboard') || "Loading your dashboard..."} />;
  }

  return (
    <div className="min-h-screen theme-bg-primary relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
          {/* Hero Welcome Section */}
         <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="mb-8 md:mb-12"
>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 dark:from-blue-500 dark:via-purple-600 dark:to-pink-500 p-8 md:p-12 text-white shadow-2xl">
    {/* Background pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-4 right-4 w-32 h-32 border-2 border-amber-200 rounded-full"></div>
      <div className="absolute bottom-4 left-4 w-24 h-24 bg-amber-200 rounded-lg rotate-45"></div>
    </div>

    <div className="relative z-10">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-medium text-white dark:text-white">{t('extracted.welcome_back') || 'Welcome Back'}</span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-white dark:text-white"
      >
        {t('extracted.your_dashboard') || 'Your Dashboard'}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-lg md:text-xl text-white/90 dark:text-white/90 leading-relaxed max-w-2xl"
      >
        {t('extracted.track_applications') || 'Track your applications and monitor their progress in real-time.'}
      </motion.p>
    </div>
  </div>
</motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8 md:mb-12"
          >
            <h2 className="text-2xl font-bold theme-text-primary mb-6">
              {t('extracted.your_impact') || 'Your Impact'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Applications */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="theme-bg-card theme-border-glass rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold theme-text-primary mb-2">
                  {stats.totalApplications}
                </div>
                <div className="text-sm theme-text-muted">
                  {t('extracted.total_applications') || 'Total Applications'}
                </div>
              </motion.div>

              {/* Pending Applications */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 }}
                className="theme-bg-card theme-border-glass rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold theme-text-primary mb-2">
                  {stats.pendingApplications}
                </div>
                <div className="text-sm theme-text-muted">
                  {t('extracted.pending_applications') || 'Pending Applications'}
                </div>
              </motion.div>

              {/* Approved Applications */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 }}
                className="theme-bg-card theme-border-glass rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold theme-text-primary mb-2">
                  {stats.approvedApplications}
                </div>
                <div className="text-sm theme-text-muted">
                  {t('extracted.approved_applications') || 'Approved Applications'}
                </div>
              </motion.div>

              {/* Total Amount Requested */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="theme-bg-card theme-border-glass rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold theme-text-primary mb-2">
                  ₹{stats.totalAmountRequested.toLocaleString()}
                </div>
                <div className="text-sm theme-text-muted">
                  {t('extracted.total_requested') || 'Total Requested'}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Actions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mb-8 md:mb-12"
          >
            <h2 className="text-2xl font-bold theme-text-primary mb-6">
              {t('extracted.quick_actions') || 'Quick Actions'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* New Application */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 }}
                className="theme-bg-card theme-border-glass rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => router.push('/user-dashboard?tab=form')}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold theme-text-primary mb-2">
                    {t('extracted.new_application') || 'New Application'}
                  </h3>
                  <p className="text-sm theme-text-muted">
                    {t('extracted.submit_new_application') || 'Submit a new relief application'}
                  </p>
                </div>
              </motion.div>

              {/* Check Status */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6 }}
                className="theme-bg-card theme-border-glass rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => router.push('/user-dashboard?tab=recent')}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="font-semibold theme-text-primary mb-2">
                    {t('extracted.check_status') || 'Check Status'}
                  </h3>
                  <p className="text-sm theme-text-muted">
                    {t('extracted.view_application_status') || 'View your application status'}
                  </p>
                </div>
              </motion.div>

              {/* File Grievance */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.7 }}
                className="theme-bg-card theme-border-glass rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => router.push('/grievance')}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-xl mb-4 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold theme-text-primary mb-2">
                    {t('extracted.file_grievance') || 'File Grievance'}
                  </h3>
                  <p className="text-sm theme-text-muted">
                    {t('extracted.report_issues') || 'Report issues or file complaints'}
                  </p>
                </div>
              </motion.div>

              {/* View Beneficiaries */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.8 }}
                className="theme-bg-card theme-border-glass rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => router.push('/beneficiaries')}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                    <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold theme-text-primary mb-2">
                    {t('extracted.view_beneficiaries') || 'View Beneficiaries'}
                  </h3>
                  <p className="text-sm theme-text-muted">
                    {t('extracted.see_beneficiary_list') || 'See the list of beneficiaries'}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Recent Activity Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0 }}
          >
            <div className="theme-bg-card theme-border-glass rounded-2xl border overflow-hidden shadow-xl">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold theme-text-primary">
                      {t('extracted.recent_activity') || 'Recent Activity'}
                    </h3>
                    <p className="text-sm theme-text-muted">
                      {t('extracted.your_latest_submissions') || 'Your latest application submissions'}
                    </p>
                  </div>
                </div>

                {recent.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 theme-bg-glass rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="theme-text-muted mb-2">
                      {t('extracted.no_submissions_yet') || 'No submissions yet'}
                    </p>
                    <p className="text-sm theme-text-muted mb-4">
                      {t('extracted.your_applications_will_appear_here') || 'Your applications will appear here once submitted'}
                    </p>
                    <button
                      onClick={() => router.push('/user-dashboard?tab=form')}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
                    >
                      {t('extracted.create_your_first_application') || 'Create your first application'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recent.map((submission, index) => (
                      <motion.div
                        key={submission.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2.1 + index * 0.1 }}
                        className="flex items-center gap-4 p-4 theme-bg-glass rounded-xl border theme-border-glass hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            submission.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30' :
                            submission.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30' :
                            submission.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                            'bg-gray-100 dark:bg-gray-900/30'
                          }`}>
                            <svg className={`w-5 h-5 ${
                              submission.status === 'approved' ? 'text-green-600 dark:text-green-400' :
                              submission.status === 'rejected' ? 'text-red-600 dark:text-red-400' :
                              submission.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-gray-600 dark:text-gray-400'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {submission.status === 'approved' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : submission.status === 'rejected' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              ) : submission.status === 'pending' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              )}
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium theme-text-primary truncate">
                              {submission.applicantName ?? (submission.anonymous ? (t('extracted.anonymous') || 'Anonymous') : '—')}
                            </p>
                            {submission.anonymous && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                {t('extracted.anonymous') || 'Anonymous'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm theme-text-muted">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {submission.firNumber || '—'}
                            </span>
                            {submission.amountRequested && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                ₹{submission.amountRequested.toLocaleString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {submission.applicationDate ? new Date(submission.applicationDate.toDate ? submission.applicationDate.toDate() : submission.applicationDate).toLocaleDateString() : '—'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-xs font-mono theme-text-muted theme-bg-card px-2 py-1 rounded border theme-border-glass">
                            {submission.id}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}