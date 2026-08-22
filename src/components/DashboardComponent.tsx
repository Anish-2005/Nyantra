"use client";
import React, { useState, useEffect } from 'react';
import {
  FileText, AlertCircle, BarChart3,
  Clock, CheckCircle, Banknote, ShieldAlert, ArrowUpRight, ArrowDownRight,
  ArrowRight, Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, orderBy, limit, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';

interface Stat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

interface ActivityItem {
  type: 'application' | 'grievance' | 'payment' | 'system';
  action: string;
  time: string;
  user: string;
}

const SPARKS = [
  [35, 50, 42, 62, 55, 78, 100],
  [70, 58, 66, 48, 56, 40, 34],
  [30, 44, 38, 58, 66, 84, 100],
  [52, 60, 74, 66, 82, 90, 100],
];

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  review: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'in-review': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  disbursed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[status] || 'bg-gray-500/10 text-gray-500'}`}>
    {status}
  </span>
);

const Sparkline = ({ index }: { index: number }) => (
  <div className="flex items-end gap-[3px] h-6 mt-3" aria-hidden>
    {SPARKS[index % SPARKS.length].map((h, i) => (
      <span
        key={i}
        className="w-1 rounded-full accent-gradient"
        style={{ height: `${h}%`, opacity: 0.25 + (i / SPARKS[index % SPARKS.length].length) * 0.75 }}
      />
    ))}
  </div>
);

const Dashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);

  const [quickStats, setQuickStats] = useState<Stat[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [funnel, setFunnel] = useState({ pending: 0, review: 0, completed: 0 });
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      const d = snap.data() as Record<string, unknown> | undefined;
      setUserName(
        ((d?.fullName || d?.name || d?.displayName) as string | undefined) ||
        user.displayName ||
        user.email?.split('@')[0] ||
        'Admin'
      );
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [appsSnap, disbursementsSnap, grievancesSnap] = await Promise.all([
          getDocs(query(collection(db, 'applications'), orderBy('applicationDate', 'desc'), limit(50))),
          getDocs(query(collection(db, 'disbursements'), limit(10))),
          getDocs(query(collection(db, 'grievances'), limit(10)))
        ]);

        const apps = appsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

        const totalApps = appsSnap.size;
        const pendingApps = apps.filter(a => a.status === 'pending' || a.status === 'review').length;
        const approvedTodayCount = apps.filter(a => a.status === 'approved' && isToday(a.applicationDate)).length;
        const disbursements = disbursementsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        const totalDisbursedVal = disbursements.reduce((sum, x) => sum + (Number(x.amount) || 0), 0);

        setQuickStats([
          { title: t('dashboard.quickStats.totalApplications'), value: totalApps.toString(), change: '+12%', trend: 'up' },
          { title: t('dashboard.quickStats.pendingApprovals'), value: pendingApps.toString(), change: '-5%', trend: 'down' },
          { title: t('dashboard.quickStats.approvedToday'), value: approvedTodayCount.toString(), change: '+8%', trend: 'up' },
          { title: t('dashboard.quickStats.totalDisbursed'), value: `₹${(totalDisbursedVal / 100000).toFixed(1)}L`, change: '+15%', trend: 'up' }
        ]);

        setRecentApplications(apps.slice(0, 6).map(app => ({
          id: app.id,
          name: app.applicantName || 'Unknown',
          district: app.district || 'N/A',
          status: app.status || 'pending',
          amount: app.amount || 0,
          date: app.applicationDate ? new Date(app.applicationDate.toDate()).toLocaleDateString() : 'N/A',
          type: app.actType || 'Standard',
          avatar: (app.applicantName || 'U').charAt(0).toUpperCase()
        })));

        const inProgressCount = apps.filter(a => ['processing', 'in-review', 'review'].includes(a.status)).length;
        const completedCount = apps.filter(a => ['approved', 'completed', 'disbursed'].includes(a.status)).length;
        setFunnel({
          pending: apps.filter(a => a.status === 'pending').length,
          review: inProgressCount,
          completed: completedCount
        });

        const activities: ActivityItem[] = [];
        apps.slice(0, 3).forEach(app => {
          activities.push({
            type: 'application',
            action: t('dashboard.recentActivity.newApplication'),
            user: app.applicantName?.split(' ')[0] || 'Applicant',
            time: timeAgo(app.applicationDate?.toDate())
          });
        });
        grievancesSnap.docs.slice(0, 2).forEach(() => {
          activities.push({
            type: 'grievance',
            action: t('dashboard.recentActivity.grievanceResolved'),
            user: 'System',
            time: 'Recently'
          });
        });
        setRecentActivity(activities.slice(0, 5));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    const isToday = (date: any) => {
      if (!date) return false;
      const d = date.toDate ? date.toDate() : new Date(date);
      const today = new Date();
      return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
    };

    const timeAgo = (date: Date) => {
      if (!date) return 'Just now';
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, t]);

  const QUICK_LINKS = [
    { label: 'Applications', icon: FileText, href: '/dashboard/applications' },
    { label: 'Disbursements', icon: Banknote, href: '/dashboard/disbursements' },
    { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    { label: 'Grievance Hub', icon: ShieldAlert, href: '/dashboard/grievance' },
  ];

  const funnelTotal = funnel.pending + funnel.review + funnel.completed;
  const pct = (n: number) => (funnelTotal > 0 ? (n / funnelTotal) * 100 : 0);

  const SectionCard = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
    <div className="theme-bg-card border theme-border-glass rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b theme-border-glass">
        <h3 className="text-sm font-semibold theme-text-primary">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
            {t('extracted.welcome_back')} {userName || '…'}
          </h1>
          <p className="text-xs theme-text-muted mt-0.5">{t('extracted.direct_benefit_transfer_management')}</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-full theme-bg-glass border theme-border-glass text-[11px] font-medium theme-text-secondary shrink-0">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </div>

      {/* KPI band */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
        {(loading ? Array.from({ length: 4 }) : quickStats).map((stat: any, i: number) => (
          <div key={i} className="theme-bg-card p-4 relative overflow-hidden group">
            {!loading && stat && <Sparkline index={i} />}
            {loading || !stat ? (
              <>
                <div className="h-2.5 w-24 rounded theme-bg-glass animate-pulse" />
                <div className="h-7 w-20 mt-2.5 rounded theme-bg-glass animate-pulse" />
              </>
            ) : (
              <>
                <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted truncate">{stat.title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-semibold tracking-tight theme-text-primary">{stat.value}</span>
                  <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${stat.trend === 'up' ? 'text-emerald-500' : stat.trend === 'down' ? 'text-red-500' : 'theme-text-muted'}`}>
                    {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </span>
                </div>
              </>
            )}
            <div className="absolute inset-x-0 bottom-0 h-0.5 accent-gradient scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </div>
        ))}
      </div>

      {/* Approval funnel */}
      <div className="theme-bg-card border theme-border-glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold theme-text-primary">Approval Pipeline</h3>
          <button onClick={() => router.push('/dashboard/analytics')} className="inline-flex items-center gap-1 text-xs font-medium text-accent-gradient hover:opacity-80 transition-opacity">
            Analytics <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {loading ? (
          <div className="h-2 w-full rounded-full theme-bg-glass animate-pulse" />
        ) : (
          <>
            <div className="flex h-2 w-full rounded-full overflow-hidden theme-bg-glass" role="img" aria-label="Approval pipeline distribution">
              <div className="bg-amber-500 transition-all duration-700" style={{ width: `${pct(funnel.pending)}%` }} />
              <div className="bg-blue-500 transition-all duration-700" style={{ width: `${pct(funnel.review)}%` }} />
              <div className="accent-gradient transition-all duration-700" style={{ width: `${pct(funnel.completed)}%` }} />
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3">
              {[
                { label: 'Pending', value: funnel.pending, dot: 'bg-amber-500' },
                { label: 'In Review', value: funnel.review, dot: 'bg-blue-500' },
                { label: 'Completed', value: funnel.completed, dot: '' },
              ].map(({ label, value, dot }) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-xs theme-text-secondary">
                  <span className={`w-1.5 h-1.5 rounded-full ${dot || 'accent-gradient'}`} />
                  {label}
                  <span className="font-semibold theme-text-primary tabular-nums">{value}</span>
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <SectionCard
            title={t('extracted.applications')}
            action={
              <button onClick={() => router.push('/dashboard/applications')} className="text-xs font-medium text-accent-gradient hover:opacity-80 transition-opacity">
                {t('extracted.view_all')}
              </button>
            }
          >
            <div className="divide-y theme-border-glass">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full theme-bg-glass animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-32 rounded theme-bg-glass animate-pulse" />
                        <div className="h-2.5 w-20 rounded theme-bg-glass animate-pulse" />
                      </div>
                    </div>
                  ))
                : recentApplications.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => router.push('/dashboard/applications')}
                      className="group w-full flex items-center gap-3 px-4 py-2.5 text-left hover:theme-bg-hover transition-colors"
                    >
                      <div className="w-7 h-7 shrink-0 rounded-full accent-gradient flex items-center justify-center text-white text-[11px] font-semibold">
                        {app.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium theme-text-primary truncate leading-tight">{app.name}</p>
                        <p className="text-xs theme-text-muted truncate leading-tight mt-0.5">{app.district} · {app.type} · {app.date}</p>
                      </div>
                      <div className="hidden sm:block text-sm font-medium theme-text-primary tabular-nums">
                        ₹{Number(app.amount || 0).toLocaleString()}
                      </div>
                      <StatusBadge status={app.status} />
                      <ArrowRight className="w-3.5 h-3.5 theme-text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </button>
                  ))}
            </div>
          </SectionCard>

          <SectionCard title={t('extracted.recent_activity')}>
            <div className="px-4 py-3">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full theme-bg-glass shrink-0" />
                      <div className="h-3 flex-1 max-w-[260px] rounded theme-bg-glass animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[3px] top-2 bottom-2 w-px theme-bg-glass" aria-hidden />
                  <div className="space-y-3.5">
                    {recentActivity.map((a, i) => (
                      <div key={i} className="relative flex items-center gap-3 pl-5">
                        <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full ring-4 ring-[var(--card-bg)] ${a.type === 'grievance' ? 'bg-red-500' : 'accent-gradient'}`} />
                        <p className="flex-1 min-w-0 text-sm theme-text-secondary truncate">
                          <span className="font-medium theme-text-primary">{a.user}</span> · {a.action}
                        </p>
                        <span className="text-xs theme-text-muted shrink-0 tabular-nums">{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-4 min-w-0">
          <SectionCard title={t('extracted.quick_actions')}>
            <div className="p-2 grid grid-cols-2 gap-1.5">
              {QUICK_LINKS.map(({ label, icon: Icon, href }) => (
                <button
                  key={href}
                  onClick={() => router.push(href)}
                  className="group flex flex-col gap-2.5 p-3 rounded-lg border theme-border-glass text-left hover:theme-bg-hover hover:border-transparent transition-colors"
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon className="w-4 h-4 theme-text-muted group-hover:text-[var(--accent-primary)] transition-colors" />
                    <ArrowUpRight className="w-3 h-3 theme-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs font-medium theme-text-primary leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Pipeline Snapshot">
            <div className="divide-y theme-border-glass">
              {(loading ? Array.from({ length: 4 }) : [
                { label: t('dashboard.liveTracking.inProgress'), value: funnel.review + funnel.pending, icon: Activity },
                { label: t('dashboard.liveTracking.completed'), value: funnel.completed, icon: CheckCircle },
                { label: t('dashboard.liveTracking.issues'), value: recentActivity.filter(a => a.type === 'grievance').length, icon: AlertCircle },
                { label: t('dashboard.liveTracking.avgTime'), value: '24h', icon: Clock },
              ]).map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-2.5 px-4 py-2.5">
                  {loading || !s ? (
                    <div className="h-3 w-28 rounded theme-bg-glass animate-pulse" />
                  ) : (
                    <>
                      <s.icon className="w-3.5 h-3.5 theme-text-muted shrink-0" />
                      <span className="flex-1 text-xs theme-text-secondary truncate">{s.label}</span>
                      <span className="text-sm font-semibold theme-text-primary tabular-nums">{s.value}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

Dashboard.displayName = 'Dashboard';

export default Dashboard;
