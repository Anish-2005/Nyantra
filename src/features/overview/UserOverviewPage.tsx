"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import LoadingState from '@/components/LoadingState';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  FileText, Clock, CheckCircle2, Banknote,
  Plus, ClipboardList, ShieldAlert, Users, ArrowRight, ArrowUpRight
} from 'lucide-react';

type Submission = {
  id: string;
  applicantName?: string;
  anonymous?: boolean;
  firNumber?: string;
  amountRequested?: number;
  status?: string;
  applicationDate?: any;
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'in-review': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  disbursed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const StatusBadge = ({ status }: { status?: string }) => (
  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[status || ''] || 'bg-gray-500/10 text-gray-500'}`}>
    {status || '—'}
  </span>
);

export default function UserDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    if (loading) return;
    if (!user) router.push('/login');
  }, [user, loading, router]);

  const [userName, setUserName] = useState('');
  const [recent, setRecent] = useState<Submission[]>([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalAmountRequested: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      const d = snap.data() as Record<string, unknown> | undefined;
      setUserName(
        ((d?.fullName || d?.name || d?.displayName) as string | undefined) ||
        user.displayName ||
        user.email?.split('@')[0] ||
        'Applicant'
      );
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const applicationsQuery = query(
      collection(db, 'applications'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(applicationsQuery, (snapshot) => {
      const applications: Submission[] = [];
      let totalAmount = 0;
      let pendingCount = 0;
      let approvedCount = 0;

      const allDocs = snapshot.docs;
      allDocs.sort((a, b) => {
        const dateA = a.data().applicationDate?.toDate?.()?.getTime() || 0;
        const dateB = b.data().applicationDate?.toDate?.()?.getTime() || 0;
        return dateB - dateA;
      });

      allDocs.slice(0, 6).forEach((doc) => {
        const data = doc.data();
        applications.push({
          id: doc.id,
          applicantName: data.applicantName,
          anonymous: data.anonymous,
          firNumber: data.caseNumber,
          amountRequested: data.amount,
          status: data.status,
          applicationDate: data.applicationDate,
        });
      });

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
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <LoadingState message={t('extracted.loading_dashboard') || "Loading your dashboard..."} />;
  }

  const statCells = [
    { label: t('extracted.total_applications'), value: stats.totalApplications.toString(), icon: FileText },
    { label: t('extracted.pending_applications'), value: stats.pendingApplications.toString(), icon: Clock },
    { label: t('extracted.approved_applications'), value: stats.approvedApplications.toString(), icon: CheckCircle2 },
    { label: t('extracted.total_requested'), value: `₹${stats.totalAmountRequested.toLocaleString()}`, icon: Banknote },
  ];

  const QUICK_ACTIONS = [
    { label: t('extracted.new_application'), sub: t('extracted.submit_new_application') || 'Submit a new relief application', icon: Plus, href: '/dashboard/applications' },
    { label: t('extracted.check_status'), sub: t('extracted.view_application_status') || 'View your application status', icon: ClipboardList, href: '/dashboard/applications' },
    { label: t('extracted.file_grievance'), sub: t('extracted.report_issues') || 'Report issues or file complaints', icon: ShieldAlert, href: '/dashboard/grievance' },
    { label: t('extracted.view_beneficiaries'), sub: t('extracted.see_beneficiary_list') || 'View my beneficiary', icon: Users, href: '/dashboard/beneficiaries' },
  ];

  const approvalRate = stats.totalApplications > 0
    ? Math.round((stats.approvedApplications / stats.totalApplications) * 100)
    : 0;
  const ringStyle = {
    background: `conic-gradient(var(--accent-primary) 0%, var(--accent-secondary) ${approvalRate}%, var(--glass-bg) ${approvalRate}%, var(--glass-bg) 100%)`,
  };

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
            {t('extracted.welcome_back')} {userName || '…'}
          </h1>
          <p className="text-xs theme-text-muted mt-0.5">{t('extracted.track_applications')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          {/* Stat band */}
          <div className="grid grid-cols-2 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
            {statCells.map(({ label, value, icon: Icon }, i) => (
              <div key={label} className={`theme-bg-card p-4 relative overflow-hidden group ${i === statCells.length - 1 && stats.totalApplications === 0 ? 'col-span-2 lg:col-span-1' : ''}`}>
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate">{label}</span>
                </div>
                <p className="text-2xl font-semibold tracking-tight theme-text-primary mt-1.5 tabular-nums">{value}</p>
                <div className="absolute inset-x-0 bottom-0 h-0.5 accent-gradient scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </div>
            ))}
          </div>

          {/* Approval progress */}
          <div className="theme-bg-card border theme-border-glass rounded-xl p-4 flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0 rounded-full grid place-items-center" style={ringStyle} role="img" aria-label={`${approvalRate}% approval rate`}>
              <div className="absolute inset-[5px] rounded-full theme-bg-card" style={{ background: 'var(--card-bg)' }} />
              <span className="relative text-sm font-semibold tracking-tight theme-text-primary tabular-nums">{approvalRate}%</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold theme-text-primary">Approval rate</p>
              <p className="text-xs theme-text-muted mt-0.5 leading-relaxed">
                {stats.approvedApplications} of {stats.totalApplications} applications approved
                {stats.pendingApplications > 0 && ` · ${stats.pendingApplications} in progress`}
              </p>
            </div>
          </div>

          {/* Recent activity */}
          <div className="theme-bg-card border theme-border-glass rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b theme-border-glass">
              <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.recent_activity')}</h3>
              <button onClick={() => router.push('/dashboard/applications')} className="text-xs font-medium text-accent-gradient hover:opacity-80 transition-opacity">
                {t('extracted.view_all')}
              </button>
            </div>

            {dataLoading ? (
              <div className="divide-y theme-border-glass">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg theme-bg-glass animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-36 rounded theme-bg-glass animate-pulse" />
                      <div className="h-2.5 w-24 rounded theme-bg-glass animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <FileText className="w-8 h-8 mx-auto theme-text-muted" />
                <p className="mt-3 text-sm font-medium theme-text-primary">{t('extracted.no_submissions_yet')}</p>
                <p className="mt-1 text-xs theme-text-muted">{t('extracted.your_applications_will_appear_here')}</p>
                <button
                  onClick={() => router.push('/dashboard/applications')}
                  className="mt-3 text-xs font-medium text-accent-gradient hover:opacity-80 transition-opacity"
                >
                  {t('extracted.create_your_first_application')} →
                </button>
              </div>
            ) : (
              <div className="divide-y theme-border-glass">
                {recent.map((submission) => (
                  <button
                    key={submission.id}
                    onClick={() => router.push('/dashboard/applications')}
                    className="group w-full flex items-center gap-3 px-4 py-2.5 text-left hover:theme-bg-hover transition-colors"
                  >
                    <div className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ${STATUS_STYLES[submission.status || ''] || 'bg-gray-500/10'}`}>
                      {submission.status === 'approved' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : submission.status === 'rejected' ? (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium theme-text-primary truncate leading-tight">
                        {submission.applicantName ?? (submission.anonymous ? t('extracted.anonymous') : '—')}
                      </p>
                      <p className="text-xs theme-text-muted truncate leading-tight mt-0.5">
                        FIR {submission.firNumber || '—'} · {submission.applicationDate ? new Date(submission.applicationDate.toDate ? submission.applicationDate.toDate() : submission.applicationDate).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <div className="hidden sm:block text-sm font-medium theme-text-primary tabular-nums">
                      ₹{Number(submission.amountRequested || 0).toLocaleString()}
                    </div>
                    <StatusBadge status={submission.status} />
                    <ArrowRight className="w-3.5 h-3.5 theme-text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="min-w-0">
          <div className="theme-bg-card border theme-border-glass rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b theme-border-glass">
              <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.quick_actions')}</h3>
            </div>
            <div className="p-2 grid grid-cols-1 gap-1.5">
              {QUICK_ACTIONS.map(({ label, sub, icon: Icon, href }) => (
                <button
                  key={label}
                  onClick={() => router.push(href)}
                  className="group flex items-start gap-2.5 p-2.5 rounded-lg border theme-border-glass text-left hover:theme-bg-hover hover:border-transparent transition-colors"
                >
                  <div className="w-7 h-7 shrink-0 rounded-md theme-bg-glass flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 theme-text-secondary group-hover:text-[var(--accent-primary)] transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium theme-text-primary truncate leading-tight">{label}</p>
                    <p className="text-[11px] theme-text-muted truncate leading-tight mt-0.5">{sub}</p>
                  </div>
                  <ArrowUpRight className="w-3 h-3 mt-1 theme-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
