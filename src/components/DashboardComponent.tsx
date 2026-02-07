"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, AlertCircle, Wallet, BarChart3, Database,
  ShieldCheck, Clock, CheckCircle,
  MessageCircle, FileBarChart,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';

// Import New Refactored Components
import WelcomeHeader from './dashboard/WelcomeHeader';
import QuickStatsGrid from './dashboard/QuickStatsGrid';
import LiveTracking from './dashboard/LiveTracking';
import AnalyticsPreview from './dashboard/AnalyticsPreview';
import RecentApplicationsList from './dashboard/RecentApplicationsList';
import BeneficiariesPreview from './dashboard/BeneficiariesPreview';
import DisbursementsPreview from './dashboard/DisbursementsPreview';
import ReportsPreview from './dashboard/ReportsPreview';
import SystemIntegrationsPreview from './dashboard/SystemIntegrationsPreview';
import GrievanceHubPreview from './dashboard/GrievanceHubPreview';
import QuickActions from './dashboard/QuickActions';
import SystemHealthMonitor from './dashboard/SystemHealthMonitor';
import PerformanceMetrics from './dashboard/PerformanceMetrics';
import { containerVariants } from './dashboard/animations';

// --- Types ---
interface Stat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
}

interface ActivityItem {
  type: 'application' | 'grievance' | 'payment' | 'system';
  action: string;
  time: string;
  user: string;
  details?: string;
}

const Dashboard = () => {
  const router = useRouter();
  const { user } = useAuth(); // Removed logOut as it's likely handled in the layout
  const { theme } = useTheme();
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);

  // Dashboard Data State
  const [quickStats, setQuickStats] = useState<Stat[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [liveTrackingStats, setLiveTrackingStats] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [recentDisbursements, setRecentDisbursements] = useState<any[]>([]);
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);
  const [systemIntegrations, setSystemIntegrations] = useState<any[]>([]);
  const [grievanceData, setGrievanceData] = useState<any[]>([]);
  const [analyticsMetrics, setAnalyticsMetrics] = useState({
    peakValue: 0,
    average: 0,
    growthRate: 0
  });

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel for fastest loading, limiting to recent items to effectively "sample" real data for stats
        const [
          appsSnap,
          beneficiariesSnap,
          disbursementsSnap,
          grievancesSnap,
          integrationsSnap,
          reportsSnap
        ] = await Promise.all([
          getDocs(query(collection(db, 'applications'), orderBy('applicationDate', 'desc'), limit(50))),
          getDocs(query(collection(db, 'beneficiaries'), limit(10))),
          getDocs(query(collection(db, 'disbursements'), limit(10))),
          getDocs(query(collection(db, 'grievances'), limit(10))),
          getDocs(query(collection(db, 'system_integrations'), limit(10))),
          getDocs(query(collection(db, 'reports'), limit(10)))
        ]);

        // --- Process Applications Data ---
        const apps = appsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

        // Calculate Stats from the sample (approximate for performance)
        const totalApps = appsSnap.size; // In a real large app we'd use a counter doc
        const pendingApps = apps.filter(a => a.status === 'pending' || a.status === 'review').length;
        const approvedTodayCount = apps.filter(a => a.status === 'approved' && isToday(a.applicationDate)).length;
        // Calculate total disbursed from the fetched disbursements
        const disbursements = disbursementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        const totalDisbursedVal = disbursements.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

        // --- 1. Quick Stats ---
        setQuickStats([
          {
            title: t('dashboard.quickStats.totalApplications'),
            value: totalApps.toString(), // displaying count of fetched recent apps as a proxy or "active" apps
            change: '+12%', // Trends would require historical data
            trend: 'up',
            icon: FileText,
            color: 'from-blue-500 to-cyan-500'
          },
          {
            title: t('dashboard.quickStats.pendingApprovals'),
            value: pendingApps.toString(),
            change: '-5%',
            trend: 'down',
            icon: Clock,
            color: 'from-amber-500 to-orange-500'
          },
          {
            title: t('dashboard.quickStats.approvedToday'),
            value: approvedTodayCount.toString(),
            change: '+8%',
            trend: 'up',
            icon: CheckCircle,
            color: 'from-green-500 to-emerald-500'
          },
          {
            title: t('dashboard.quickStats.totalDisbursed'),
            value: `₹${(totalDisbursedVal / 100000).toFixed(1)}L`,
            change: '+15%',
            trend: 'up',
            icon: Wallet,
            color: 'from-purple-500 to-pink-500'
          }
        ]);

        // --- 2. Recent Applications ---
        setRecentApplications(apps.slice(0, 5).map(app => ({
          id: app.id,
          name: app.applicantName || 'Unknown',
          district: app.district || 'N/A',
          status: app.status || 'pending',
          amount: app.amount || 0,
          date: app.applicationDate ? new Date(app.applicationDate.toDate()).toLocaleDateString() : 'N/A',
          type: app.actType || 'Standard',
          avatar: (app.applicantName || 'U').charAt(0).toUpperCase()
        })));

        // --- 3. Live Tracking Stats ---
        const inProgressCount = apps.filter(a => ['processing', 'pending', 'review'].includes(a.status)).length;
        const completedCount = apps.filter(a => ['approved', 'completed', 'disbursed'].includes(a.status)).length;
        const issuesCount = grievancesSnap.size; // Using total grievance count from sample

        setLiveTrackingStats([
          { label: t('dashboard.liveTracking.inProgress'), value: inProgressCount.toString(), change: '+5', trend: 'up', icon: Activity, color: 'from-blue-500 to-cyan-500' },
          { label: t('dashboard.liveTracking.completed'), value: completedCount.toString(), change: '+12', trend: 'up', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
          { label: t('dashboard.liveTracking.issues'), value: issuesCount.toString(), change: '-1', trend: 'down', icon: AlertCircle, color: 'from-red-500 to-rose-500' },
          { label: t('dashboard.liveTracking.avgTime'), value: '24h', change: '-2h', trend: 'up', icon: Clock, color: 'from-amber-500 to-orange-500' }
        ]);

        // --- 4. Recent Activity (Merged) ---
        const activities: ActivityItem[] = [];
        // Add recent apps
        apps.slice(0, 3).forEach(app => {
          activities.push({
            type: 'application',
            action: t('dashboard.recentActivity.newApplication'),
            user: app.applicantName?.split(' ')[0] || 'Applicant',
            time: timeAgo(app.applicationDate?.toDate())
          });
        });
        // Add recent grievances
        const grievances = grievancesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        grievances.slice(0, 2).forEach(g => {
          activities.push({
            type: 'grievance',
            action: t('dashboard.recentActivity.grievanceResolved'), // Simplified action text
            user: 'System',
            time: 'Recently'
          });
        });
        setRecentActivity(activities.sort(() => 0.5 - Math.random()).slice(0, 5)); // Shuffle for variety if timestamps missing

        // --- 5. Beneficiaries ---
        setBeneficiaries(beneficiariesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // --- 6. Disbursements ---
        setRecentDisbursements(disbursements.map(d => ({
          id: d.id || 'TXN',
          name: d.beneficiaryName || 'Beneficiary',
          amount: d.amount || 0,
          status: d.status || 'completed',
          date: d.date ? new Date(d.date.toDate()).toLocaleDateString() : 'N/A',
          color: d.status === 'processing' ? 'bg-blue-500' : 'bg-green-500'
        })));

        // --- 7. Reports ---
        setGeneratedReports(reportsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // --- 8. System Integrations ---
        setSystemIntegrations(integrationsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          provider: doc.data().name,
          color: doc.data().status === 'active' ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500' // Simple color logic
        })));

        // --- 9. Grievance Data ---
        setGrievanceData(grievances.map(g => ({
          id: g.id,
          subject: g.subject || 'Inquiry',
          priority: g.priority || 'medium',
          status: g.status || 'open',
          assignedTo: g.assignedOfficer || 'Pending',
          date: g.submittedAt ? new Date(g.submittedAt.toDate()).toLocaleDateString() : 'N/A'
        })));

        // --- 10. Analytics Metrics ---
        // Calc from apps sample
        const avgAmount = apps.length > 0 ? (apps.reduce((sum, a) => sum + (Number(a.amount) || 0), 0) / apps.length) : 0;
        setAnalyticsMetrics({
          peakValue: totalApps * 10,
          average: Math.round(avgAmount),
          growthRate: 14.5
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    // Helper for date check
    const isToday = (date: any) => {
      if (!date) return false;
      const d = date.toDate ? date.toDate() : new Date(date);
      const today = new Date();
      return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
    };

    // Helper for time ago
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

  return (
    <div className={`transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''} font-sans selection:bg-blue-500/30`}>
      {/* Global Theme Styles just in case they aren't loaded elsewhere, but scoped to this component if needed, or rely on layout */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
      `}</style>

      {/* Main Content Only - Layout wrapper handled by parent */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8"
      >
        <WelcomeHeader user={user} />

        <QuickStatsGrid stats={quickStats} loading={loading} />

        <LiveTracking
          stats={liveTrackingStats}
          recentActivity={recentActivity}
          loading={loading}
        />

        {/* Complex Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column (Main Analysis) */}
          <div className="xl:col-span-2 space-y-6">
            <AnalyticsPreview
              metrics={analyticsMetrics}
              loading={loading}
            />

            <RecentApplicationsList
              applications={recentApplications}
              loading={loading}
            />

            <BeneficiariesPreview
              beneficiaries={beneficiaries}
            />

            <div className="flex flex-col gap-6">
              <DisbursementsPreview
                disbursements={recentDisbursements}
                loading={loading}
              />
              <ReportsPreview
                reports={generatedReports}
                loading={loading}
              />
            </div>
          </div>

          {/* Right Column (Side Panels) */}
          <div className="space-y-6">
            <SystemIntegrationsPreview
              integrations={systemIntegrations}
              loading={loading}
            />

            <GrievanceHubPreview
              grievanceData={grievanceData}
              loading={loading}
            />

            <QuickActions />

            <SystemHealthMonitor />

            <PerformanceMetrics />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Explicit display name for React DevTools
Dashboard.displayName = 'Dashboard';

export default Dashboard;