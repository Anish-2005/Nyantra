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
  Plus, ClipboardList, ShieldAlert, Users, ArrowRight, AlertCircle
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
  processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'in-review': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'documents-required': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  disbursed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const STATUS_DOTS: Record<string, string> = {
  pending: 'bg-amber-500',
  processing: 'bg-blue-500',
  'in-review': 'bg-blue-500',
  'documents-required': 'bg-purple-500',
  approved: 'bg-emerald-500',
  completed: 'bg-emerald-500',
  disbursed: 'bg-emerald-500',
  rejected: 'bg-red-500',
};

const StatusBadge = ({ status }: { status?: string }) => (
  <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[status || ''] || 'bg-gray-500/10 text-gray-500'}`}>
    {status || '—'}
  </span>
);

export default function UserDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t, locale } = useLocale();

  useEffect(() => {
    if (loading) return;
    if (!user) router.push('/login');
  }, [user, loading, router]);

  const [userName, setUserName] = useState('');
  const [recent, setRecent] = useState<Submission[]>([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingCount: 0,
    inReviewCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    docsRequiredCount: 0,
    totalAmountRequested: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [hasBeneficiary, setHasBeneficiary] = useState<boolean | null>(null);

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

    const unsubscribe = onSnapshot(query(collection(db, 'applications'), where('ownerId', '==', user.uid)), (snapshot) => {
      const applications: Submission[] = [];
      let totalAmount = 0;
      let pending = 0;
      let inReview = 0;
      let approved = 0;
      let rejected = 0;
      let docsRequired = 0;

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
        switch (data.status) {
          case 'pending':
          case 'processing': pending++; break;
          case 'in-review': inReview++; break;
          case 'documents-required': docsRequired++; break;
          case 'approved':
          case 'completed':
          case 'disbursed': approved++; break;
          case 'rejected': rejected++; break;
        }
      });

      setRecent(applications);
      setStats({
        totalApplications: allDocs.length,
        pendingCount: pending,
        inReviewCount: inReview,
        approvedCount: approved,
        rejectedCount: rejected,
        docsRequiredCount: docsRequired,
        totalAmountRequested: totalAmount,
      });
      setDataLoading(false);
    });

    const unsubscribeBeneficiary = onSnapshot(
      query(collection(db, 'beneficiaries'), where('ownerId', '==', user.uid)),
      (snapshot) => setHasBeneficiary(!snapshot.empty),
      () => setHasBeneficiary(false)
    );

    return () => {
      unsubscribe();
      unsubscribeBeneficiary();
    };
  }, [user]);

  if (loading) {
    return <LoadingState message={t('extracted.loading_dashboard') || "Loading your dashboard..."} />;
  }

  // Greeting + localized long date (client-only render paths)
  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? 'extracted.good_morning' : hour < 17 ? 'extracted.good_afternoon' : 'extracted.good_evening';
  const firstName = (userName || '').split(' ')[0];
  const dateLabel = new Date().toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  const attentionCount = stats.pendingCount + stats.docsRequiredCount;
  const primaryHref = hasBeneficiary === false ? '/dashboard/beneficiaries' : '/dashboard/applications';
  const primaryLabel = hasBeneficiary === false ? t('extracted.set_up_profile') : t('extracted.new_application');

  const statCells = [
    { label: t('extracted.total_applications'), value: stats.totalApplications.toString(), icon: FileText },
    { label: t('extracted.pending_applications'), value: (stats.pendingCount + stats.docsRequiredCount).toString(), icon: Clock },
    { label: t('extracted.approved_applications'), value: stats.approvedCount.toString(), icon: CheckCircle2 },
    { label: t('extracted.total_requested'), value: `₹${stats.totalAmountRequested.toLocaleString()}`, icon: Banknote },
  ];

  const QUICK_ACTIONS = [
    { label: t('extracted.new_application'), icon: Plus, href: primaryHref, primary: true },
    { label: t('extracted.check_status'), icon: ClipboardList, href: '/dashboard/applications', primary: false },
    { label: t('extracted.file_grievance'), icon: ShieldAlert, href: '/dashboard/grievance', primary: false },
    { label: t('extracted.view_beneficiaries'), icon: Users, href: '/dashboard/beneficiaries', primary: false },
  ];

  const approvalRate = stats.totalApplications > 0
    ? Math.round((stats.approvedCount / stats.totalApplications) * 100)
    : 0;
  const ringStyle = {
    background: `conic-gradient(var(--accent-primary) 0%, var(--accent-secondary) ${approvalRate}%, var(--glass-bg) ${approvalRate}%, var(--glass-bg) 100%)`,
  };

  const pipelineChips = [
    { label: t('extracted.pending_applications'), count: stats.pendingCount, dot: 'bg-amber-500' },
    { label: 'In review', count: stats.inReviewCount, dot: 'bg-blue-500' },
    { label: t('extracted.approved_applications'), count: stats.approvedCount, dot: 'bg-emerald-500' },
    { label: 'Rejected', count: stats.rejectedCount, dot: 'bg-red-500' },
  ];

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Greeting hero */}
      <section className="theme-bg-card theme-border-glass border rounded-xl relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-0.5 accent-gradient" aria-hidden="true" />
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full pointer-events-none opacity-[0.07]" style={{ background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)' }} aria-hidden="true" />
        <div className="relative p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
              {t(greetingKey)}, <span className="text-accent-gradient">{firstName || '…'}</span>
            </h1>
            <p className="text-xs theme-text-muted mt-0.5 capitalize">{dateLabel} · {t('extracted.track_applications')}</p>
          </div>
          <button
            onClick={() => router.push(primaryHref)}
            className="hidden sm:inline-flex h-9 px-3.5 accent-gradient text-white rounded-md text-xs font-semibold items-center gap-1.5 hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            {primaryLabel}
          </button>
        </div>
        <button
          onClick={() => router.push(primaryHref)}
          className="sm:hidden mx-5 mb-5 h-9 accent-gradient text-white rounded-md text-xs font-semibold inline-flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          {primaryLabel}
        </button>
      </section>

      {/* Attention strip */}
      {hasBeneficiary === false ? (
        <button
          onClick={() => router.push('/dashboard/beneficiaries')}
          className="w-full theme-bg-card border border-amber-500/40 bg-amber-500/5 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-left hover:border-amber-500/60 transition-colors group"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="flex-1 min-w-0 text-xs font-medium theme-text-primary truncate">{t('extracted.create_beneficiary_first')}</span>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0 inline-flex items-center gap-1">
            {t('extracted.set_up_profile')}
            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </span>
        </button>
      ) : attentionCount > 0 && hasBeneficiary === true ? (
        <button
          onClick={() => router.push('/dashboard/applications')}
          className="w-full theme-bg-card border border-blue-500/40 bg-blue-500/5 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-left hover:border-blue-500/60 transition-colors group"
        >
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="flex-1 min-w-0 text-xs font-medium theme-text-primary truncate">{t('extracted.awaiting_action', { count: attentionCount })}</span>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0 inline-flex items-center gap-1">
            {t('extracted.review_now')}
            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </span>
        </button>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          {/* Stat band */}
          <div className="grid grid-cols-2 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
            {statCells.map(({ label, value, icon: Icon }, i) => (
              <div key={label} className={`theme-bg-card p-4 relative overflow-hidden group ${i === statCells.length - 1 && stats.totalApplications === 0 ? 'col-span-2 lg:col-span-1' : ''}`}>
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                  <span className="w-6 h-6 rounded-md theme-bg-glass grid place-items-center shrink-0">
                    <Icon className="w-3 h-3" />
                  </span>
                  <span className="truncate">{label}</span>
                </div>
                <p className="text-2xl font-semibold tracking-tight theme-text-primary mt-2 tabular-nums">{value}</p>
                <div className="absolute inset-x-0 bottom-0 h-0.5 accent-gradient scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </div>
            ))}
          </div>

          {/* Pipeline */}
          <div className="theme-bg-card border theme-border-glass rounded-xl p-4 flex items-center gap-4 flex-wrap sm:flex-nowrap">
            <div className="relative w-20 h-20 shrink-0 rounded-full grid place-items-center" style={ringStyle} role="img" aria-label={`${approvalRate}%`}>
              <div className="absolute inset-[5px] rounded-full" style={{ background: 'var(--card-bg)' }} />
              <span className="relative text-base font-semibold tracking-tight theme-text-primary tabular-nums">{approvalRate}%</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold theme-text-primary">{t('extracted.approval_rate')}</p>
              <p className="text-xs theme-text-muted mt-0.5 leading-relaxed">
                {t('extracted.approved_of_total', { approved: stats.approvedCount, total: stats.totalApplications })}
                {stats.pendingCount > 0 && ` · ${t('extracted.in_progress_count', { count: stats.pendingCount })}`}
              </p>
              <div className="flex items-center gap-3 flex-wrap mt-2.5">
                {pipelineChips.map(({ label, count, dot }) => (
                  <span key={label} className={`inline-flex items-center gap-1.5 text-[11px] tabular-nums ${count > 0 ? 'theme-text-primary font-medium' : 'theme-text-muted opacity-60'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                    {label} · {count}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent activity — timeline */}
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
                    <div className="w-2.5 h-2.5 rounded-full theme-bg-glass animate-pulse" />
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
              <div className="relative">
                <div className="absolute left-[19px] top-3 bottom-3 w-px theme-border-glass" style={{ background: 'var(--border-color, var(--glass-bg))' }} aria-hidden="true" />
                {recent.map((submission) => (
                  <button
                    key={submission.id}
                    onClick={() => router.push('/dashboard/applications')}
                    className="group relative w-full flex items-center gap-3 px-4 py-2.5 text-left hover:theme-bg-hover transition-colors"
                  >
                    <span className={`relative z-10 w-2.5 h-2.5 shrink-0 rounded-full ring-4 ${STATUS_DOTS[submission.status || ''] || 'bg-gray-400'}`} style={{ '--tw-ring-color': 'var(--card-bg)' } as React.CSSProperties} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium theme-text-primary truncate leading-tight">
                        {submission.applicantName ?? (submission.anonymous ? t('extracted.anonymous') : '—')}
                      </p>
                      <p className="text-xs theme-text-muted truncate leading-tight mt-0.5">
                        FIR <span className="font-mono">{submission.firNumber || '—'}</span> · {submission.applicationDate ? new Date(submission.applicationDate.toDate ? submission.applicationDate.toDate() : submission.applicationDate).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-GB') : '—'}
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
            <div className="p-2 grid grid-cols-2 gap-1.5">
              {QUICK_ACTIONS.map(({ label, icon: Icon, href, primary }) => (
                <button
                  key={label}
                  onClick={() => router.push(href)}
                  className={`group flex flex-col items-center justify-center gap-2 h-24 rounded-lg border p-2 text-center transition-colors ${
                    primary
                      ? 'accent-gradient border-transparent text-white hover:opacity-90'
                      : 'theme-border-glass hover:theme-bg-hover hover:border-transparent'
                  }`}
                >
                  <span className={`w-9 h-9 shrink-0 rounded-lg grid place-items-center ${primary ? 'bg-white/20' : 'theme-bg-glass'}`}>
                    <Icon className={`w-4 h-4 ${primary ? 'text-white' : 'theme-text-secondary group-hover:text-[var(--accent-primary)]'} transition-colors`} />
                  </span>
                  <span className={`text-[11px] font-medium leading-tight ${primary ? 'text-white' : 'theme-text-primary'}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
