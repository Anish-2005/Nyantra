"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import LoadingState from '@/components/LoadingState';
import { StatBand } from '@/components/dashboard/ui';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  FileText, Clock, CheckCircle2, Banknote,
  Plus, ClipboardList, ShieldAlert, Users, ArrowRight, AlertCircle
} from 'lucide-react';
import type { Submission } from './helpers';
import GreetingHero from './components/GreetingHero';
import PipelineCard from './components/PipelineCard';
import ActivityTimeline from './components/ActivityTimeline';
import QuickActions from './components/QuickActions';

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

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Greeting hero */}
      <GreetingHero
        userName={userName}
        locale={locale}
        primaryHref={primaryHref}
        primaryLabel={primaryLabel}
        onNavigate={(href) => router.push(href)}
        t={t}
      />

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
          <StatBand cells={statCells} />

          {/* Pipeline */}
          <PipelineCard stats={stats} t={t} />

          {/* Recent activity — timeline */}
          <ActivityTimeline
            recent={recent}
            dataLoading={dataLoading}
            locale={locale}
            onNavigate={(href) => router.push(href)}
            t={t}
          />
        </div>

        {/* Right column */}
        <div className="min-w-0">
          <QuickActions
            actions={QUICK_ACTIONS}
            onNavigate={(href) => router.push(href)}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
