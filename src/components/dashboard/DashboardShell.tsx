"use client";
import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import {
  BarChart3, Database, DownloadCloud, FileText, Home, Menu, MessageCircle,
  Users, Wallet, Bell, User, ChevronDown, Settings, HelpCircle, ChevronRight,
  Link as LinkIcon, LogOut, Repeat, Sun, Moon
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import { DashboardViewProvider, useDashboardView, DashboardView } from "@/context/DashboardViewContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import BackgroundAnimation from "@/components/BackgroundAnimation";
import NotificationDropdown from "@/components/NotificationDropdown";
import { collection, query, where, onSnapshot, limit, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const OFFICER_NAV = [
  'overview', 'applications', 'beneficiaries', 'disbursements',
  'analytics', 'grievance', 'integrations', 'reports', 'blockchain',
] as const;

const USER_NAV = [
  'overview', 'applications', 'beneficiaries', 'disbursements',
  'reports', 'grievance', 'feedback',
] as const;

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardViewProvider>
      <DashboardShellInner>{children}</DashboardShellInner>
    </DashboardViewProvider>
  );
}

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const dropdownSolidBg = theme === 'dark' ? 'rgba(15, 23, 42, 0.99)' : 'rgba(255, 255, 255, 0.99)';
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, profile, signOutUser } = useAuth();
  const { view, setView, canSwitch } = useDashboardView();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isProgrammaticNavigation, setIsProgrammaticNavigation] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [disbursementAlertCount, setDisbursementAlertCount] = useState(0);

  const isUserView = view === 'user';
  const displayName = user?.displayName ?? (user?.email ? user.email.split('@')[0] : 'Guest');
  const userInitials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const roleLabel = isUserView ? ((userProfile?.role as string) || 'Applicant') : t('extracted.administrator');

  const navigationItems = useMemo(() => {
    if (!isUserView) {
      return [
        { id: 'overview', label: t('extracted.dashboard'), icon: Home },
        { id: 'applications', label: t('extracted.applications'), icon: FileText },
        { id: 'beneficiaries', label: t('extracted.beneficiaries'), icon: Users },
        { id: 'disbursements', label: t('extracted.disbursements'), icon: Wallet },
        { id: 'analytics', label: t('extracted.analytics_reports'), icon: BarChart3 },
        { id: 'grievance', label: t('extracted.grievance_hub') || t('extracted.grievance'), icon: MessageCircle },
        { id: 'integrations', label: t('nav.integrations'), icon: Database },
        { id: 'reports', label: t('extracted.recent_reports') || 'Reports', icon: DownloadCloud },
        { id: 'blockchain', label: t('blockchain.blockchainNav'), icon: LinkIcon },
      ];
    }
    return [
      { id: 'overview', label: t('extracted.dashboard'), icon: Home },
      { id: 'applications', label: t('extracted.my_applications'), icon: FileText },
      { id: 'beneficiaries', label: t('extracted.beneficiaries'), icon: Users },
      { id: 'disbursements', label: t('extracted.payments'), icon: Wallet, notificationCount: disbursementAlertCount },
      { id: 'reports', label: t('extracted.reports'), icon: FileText },
      { id: 'grievance', label: t('extracted.grievances'), icon: MessageCircle },
      { id: 'feedback', label: t('extracted.feedback'), icon: HelpCircle },
    ];
  }, [isUserView, disbursementAlertCount, t]);

  const allowedSegments = useMemo(
    () => (isUserView ? USER_NAV : OFFICER_NAV) as readonly string[],
    [isUserView]
  );

  // Auth guard + role/view alignment
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (profile === null) {
      router.push('/choose-role');
    }
  }, [user, loading, profile, router]);

  useEffect(() => {
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in e ? e.matches : window.matchMedia('(min-width: 1024px)').matches;
      if (!matches) setSidebarOpen(false);
    };
    const mq = window.matchMedia('(min-width: 1024px)');
    handler(mq);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  useEffect(() => {
    if (!isProgrammaticNavigation && pathname) {
      const seg = pathname.split('/').filter(Boolean);
      if (seg[0] === 'dashboard') {
        setActiveTab(seg[1] || 'overview');
      }
    }
  }, [pathname, isProgrammaticNavigation]);

  // Live notifications only while acting in the applicant view
  useEffect(() => {
    if (!isUserView || !user?.uid) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      limit(20)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date(),
        read: d.data().read || false,
      }));
      notificationsData.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter((n: any) => !n.read).length);
    });

    return () => unsubscribe();
  }, [isUserView, user?.uid]);

  useEffect(() => {
    if (!isUserView || !user?.uid) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) setUserProfile(snapshot.data());
    });

    return () => unsubscribe();
  }, [isUserView, user?.uid]);

  useEffect(() => {
    if (!isUserView || !user?.uid) return;

    const updateDisbursementAlerts = () => {
      try {
        const storedAlerts = localStorage.getItem(`disbursement_alerts_${user.uid}`);
        if (storedAlerts) {
          const alerts = JSON.parse(storedAlerts);
          setDisbursementAlertCount(alerts.length || 0);
        } else {
          setDisbursementAlertCount(0);
        }
      } catch (error) {
        console.error('Error reading disbursement alerts:', error);
        setDisbursementAlertCount(0);
      }
    };

    updateDisbursementAlerts();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('disbursement_alerts_')) updateDisbursementAlerts();
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(updateDisbursementAlerts, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isUserView, user?.uid]);

  const currentSegment = pathname?.split('/').filter(Boolean)[1] || 'overview';

  const handleSwitchView = (next: DashboardView) => {
    if (next === view) return;
    setView(next);
    const nextAllowed = next === 'user' ? USER_NAV : OFFICER_NAV;
    if (!nextAllowed.includes(currentSegment as any)) {
      router.push('/dashboard');
    }
  };

  const handleSidebarChange = (id: string) => {
    setIsProgrammaticNavigation(true);
    setActiveTab(id);
    if (id === 'overview') router.push('/dashboard');
    else router.push(`/dashboard/${id}`);
    setSidebarOpen(false);
    setTimeout(() => setIsProgrammaticNavigation(false), 100);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true, readAt: Timestamp.now() });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    try {
      await Promise.all(
        unread.map((notification) =>
          updateDoc(doc(db, 'notifications', notification.id), { read: true, readAt: Timestamp.now() })
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application_approved': return '✅';
      case 'application_rejected': return '❌';
      case 'application_submitted': return '📝';
      case 'payment_received': return '💰';
      case 'document_required': return '📄';
      case 'status_update': return '🔄';
      default: return '🔔';
    }
  };

  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const breadcrumbLabel =
    activeTab === 'overview' ? t('extracted.dashboard')
      : activeTab === 'analytics' ? t('extracted.analytics_reports')
        : activeTab === 'applications' ? (isUserView ? t('extracted.my_applications') : t('extracted.applications'))
          : activeTab === 'beneficiaries' ? t('extracted.beneficiaries')
            : activeTab === 'disbursements' ? (isUserView ? t('extracted.payments') : t('extracted.disbursements'))
              : activeTab === 'grievance' ? (t('extracted.grievance_hub') || t('extracted.grievance'))
                : activeTab === 'integrations' ? t('nav.integrations')
                  : activeTab === 'reports' ? (t('extracted.recent_reports') || 'Reports')
                    : activeTab === 'feedback' ? t('extracted.feedback')
                      : activeTab === 'blockchain' ? t('blockchain.blockchainNav')
                        : activeTab.replace('-', ' ');

  return (
    <div data-theme={theme} className="relative min-h-screen overflow-hidden transition-all duration-300" style={{ background: 'var(--bg-gradient)' }}>
      <style jsx global>{`
                [data-theme="dark"] {
                    --bg-gradient: radial-gradient(1200px 600px at 10% 10%, rgba(30, 64, 175, 0.08), transparent 8%),
                                   radial-gradient(900px 500px at 90% 90%, rgba(245, 158, 11, 0.06), transparent 8%),
                                   linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%);
                    --card-bg: rgba(15, 23, 42, 0.7);
                    --card-border: rgba(255, 255, 255, 0.08);
                    --nav-bg: rgba(15, 23, 42, 0.95);
                    --text-primary: #f1f5f9;
                    --text-secondary: #94a3b8;
                    --text-muted: #64748b;
                    --accent-primary: #06b6d4;
                    --accent-secondary: #8b5cf6;
                    --glass-bg: rgba(15, 23, 42, 0.6);
                    --glass-border: rgba(255, 255, 255, 0.1);
                    --bg-hover: rgba(255, 255, 255, 0.05);
                    --bg-body: var(--bg-gradient);
                }

                [data-theme="light"] {
                    --bg-gradient: radial-gradient(1200px 600px at 10% 10%, rgba(59, 130, 246, 0.08), transparent 8%),
                                   radial-gradient(900px 500px at 90% 90%, rgba(245, 158, 11, 0.06), transparent 8%),
                                   linear-gradient(180deg, #f8fafc 0%, #f0f9ff 100%);
                    --card-bg: rgba(255, 255, 255, 0.8);
                    --card-border: rgba(0, 0, 0, 0.06);
                    --nav-bg: rgba(255, 255, 255, 0.95);
                    --text-primary: #0f172a;
                    --text-secondary: #475569;
                    --text-muted: #64748b;
                    --accent-primary: #fb7185;
                    --accent-secondary: #fb923c;
                    --glass-bg: rgba(255, 255, 255, 0.6);
                    --glass-border: rgba(0, 0, 0, 0.08);
                    --bg-hover: rgba(0, 0, 0, 0.03);
                    --bg-body: var(--bg-gradient);
                }

                .theme-text-primary { color: var(--text-primary) !important; }
                .theme-text-secondary { color: var(--text-secondary) !important; }
                .theme-text-muted { color: var(--text-muted) !important; }
                .theme-bg-card { background: var(--card-bg) !important; }
                .theme-border-card { border-color: var(--card-border) !important; }
                .theme-bg-glass { background: var(--glass-bg) !important; }
                .theme-border-glass { border-color: var(--glass-border) !important; }
                .theme-bg-nav { background: var(--nav-bg) !important; }
                .theme-bg-hover { background: var(--bg-hover) !important; }
                .theme-bg-body { background: var(--bg-body) !important; }

                .accent-gradient {
                    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
                }

                .text-accent-gradient {
                    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            `}</style>

      <BackgroundAnimation />

      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div
          className={`absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl accent-gradient ${theme === 'dark' ? 'opacity-15' : 'opacity-20'}`}
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl accent-gradient ${theme === 'dark' ? 'opacity-15' : 'opacity-20'}`}
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="flex min-h-screen relative z-10">
        <Sidebar
          items={navigationItems}
          activeId={activeTab}
          onChange={handleSidebarChange}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          collapsed={sidebarCollapsed}
          subtitle={isUserView ? t('extracted.applicant_portal') : t('extracted.dbt_dashboard')}
        />

        <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'}`}>
          <header className={`sticky top-0 z-40 backdrop-blur-xl theme-bg-nav border-b theme-border-glass shadow-sm transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'h-20' : 'h-24'}`}>
            <div className="flex items-center justify-between px-4 h-full lg:px-6">
              <div className="flex items-center gap-4 flex-1">
                <motion.button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:flex p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <ChevronRight className={`w-5 h-5 theme-text-primary transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
                </motion.button>

                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors"
                  aria-label={t('extracted.open_sidebar')}
                >
                  <Menu className="w-5 h-5 theme-text-primary" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold theme-text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {t('extracted.nyantra_dashboard')}
                    </h1>
                    <p className="text-sm theme-text-muted">
                      {isUserView ? t('extracted.applicant_portal') : t('extracted.direct_benefit_transfer_management')}
                    </p>
                  </div>
                  <div className="sm:hidden">
                    <h1 className="text-lg font-bold theme-text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {t('extracted.nyantra')}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Officer view switcher */}
                {canSwitch && (
                  <div className="relative hidden md:flex items-center rounded-lg theme-bg-glass border theme-border-glass p-0.5" role="group" aria-label="Switch dashboard view">
                    <button
                      onClick={() => handleSwitchView('officer')}
                      disabled={view === 'officer'}
                      aria-pressed={view === 'officer'}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${view === 'officer'
                        ? 'accent-gradient text-white shadow-sm'
                        : 'theme-text-secondary hover:theme-text-primary'}`}
                    >
                      Officer
                    </button>
                    <button
                      onClick={() => handleSwitchView('user')}
                      disabled={view === 'user'}
                      aria-pressed={view === 'user'}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${view === 'user'
                        ? 'accent-gradient text-white shadow-sm'
                        : 'theme-text-secondary hover:theme-text-primary'}`}
                    >
                      Applicant
                    </button>
                  </div>
                )}

                {/* Mobile switcher */}
                {canSwitch && (
                  <button
                    onClick={() => handleSwitchView(isUserView ? 'officer' : 'user')}
                    className="md:hidden p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors"
                    aria-label="Switch dashboard view"
                  >
                    <Repeat className="w-5 h-5 theme-text-primary" />
                  </button>
                )}

                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="hidden sm:flex p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 theme-text-primary" />
                  ) : (
                    <Moon className="w-5 h-5 theme-text-primary" />
                  )}
                </button>

                {/* Notifications */}
                <div className="relative">
                  <motion.button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={t('extracted.notifications_1')}
                  >
                    <Bell className="w-5 h-5 theme-text-primary group-hover:scale-110 transition-transform" />
                    {isUserView && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 theme-border-glass flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                      </span>
                    )}
                    {!isUserView && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 theme-border-glass"></span>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {notificationOpen && (
                      isUserView ? (
                        <NotificationDropdown isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} triggerRef={undefined} width={320}>
                          <div className="p-4 border-b theme-border-glass">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold theme-text-primary">{t('extracted.notifications_1')}</h3>
                              {unreadCount > 0 && (
                                <button onClick={markAllNotificationsAsRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                  Mark all read
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-6 text-center">
                                <div className="text-4xl mb-2">🔔</div>
                                <p className="text-sm theme-text-muted">No notifications yet</p>
                              </div>
                            ) : (
                              notifications.map((notification) => (
                                <motion.div
                                  key={notification.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className={`p-4 border-b theme-border-glass last:border-b-0 hover:theme-bg-hover transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                  onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="text-lg flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm theme-text-primary font-medium leading-tight">
                                        {notification.title || notification.message}
                                      </p>
                                      {notification.message && notification.title && (
                                        <p className="text-sm theme-text-muted mt-1 leading-tight">{notification.message}</p>
                                      )}
                                      <p className="text-xs theme-text-muted mt-2">{formatNotificationTime(notification.createdAt)}</p>
                                    </div>
                                    {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>}
                                  </div>
                                </motion.div>
                              ))
                            )}
                          </div>
                          {notifications.length > 0 && (
                            <div className="p-3 border-t theme-border-glass text-center">
                              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all notifications</button>
                            </div>
                          )}
                        </NotificationDropdown>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-80 rounded-lg theme-bg-card border theme-border-glass shadow-lg backdrop-blur-xl py-2 z-50"
                          style={{ background: dropdownSolidBg }}
                        >
                          <div className="p-3 border-b theme-border-glass">
                            <h3 className="font-semibold theme-text-primary">{t('extracted.notifications_1')}</h3>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {[1, 2, 3].map((item) => (
                              <div key={item} className="p-3 border-b theme-border-glass last:border-b-0 hover:theme-bg-hover transition-colors">
                                <p className="text-sm theme-text-primary">{t('extracted.new_application_requires_review')}</p>
                                <p className="text-xs theme-text-muted mt-1">{t('extracted.2_hours_ago')}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <motion.button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-2 h-9 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-[10px]">
                      {userInitials}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-medium theme-text-primary truncate max-w-24 leading-tight">{displayName}</p>
                      <p className="text-[11px] theme-text-muted leading-tight">{roleLabel}</p>
                    </div>
                    <ChevronDown className={`w-3 h-3 theme-text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-64 rounded-lg theme-bg-card border theme-border-glass shadow-lg backdrop-blur-xl py-2 z-50"
                        style={{ background: dropdownSolidBg }}
                      >
                        <div className="px-4 py-3 border-b theme-border-glass">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {userInitials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium theme-text-primary truncate">{displayName}</p>
                              <p className="text-sm theme-text-muted truncate">{user?.email}</p>
                              <p className="text-xs theme-text-muted capitalize">{profile?.role || roleLabel}</p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => { setUserMenuOpen(false); router.push('/dashboard/profile'); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm theme-text-primary hover:theme-bg-hover transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>{t('extracted.profile')}</span>
                        </button>

                        <button
                          onClick={() => { setUserMenuOpen(false); router.push('/dashboard/settings'); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm theme-text-primary hover:theme-bg-hover transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>{t('extracted.settings')}</span>
                        </button>

                        <div className="border-t theme-border-glass my-1" />

                        <button
                          onClick={() => { setUserMenuOpen(false); router.push('/dashboard/help'); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm theme-text-primary hover:theme-bg-hover transition-colors"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>{t('extracted.help_support')}</span>
                        </button>

                        {isUserView && notifications.length > 0 && (
                          <>
                            <div className="border-t theme-border-glass my-1" />
                            <div className="px-4 py-2">
                              <div className="grid grid-cols-2 gap-2 text-center">
                                <div>
                                  <p className="text-lg font-bold theme-text-primary">{notifications.filter((n) => !n.read).length}</p>
                                  <p className="text-xs theme-text-muted">Unread</p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold theme-text-primary">{notifications.length}</p>
                                  <p className="text-xs theme-text-muted">Total</p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="border-t theme-border-glass my-1" />

                        <button
                          onClick={async () => {
                            setUserMenuOpen(false);
                            try {
                              await signOutUser();
                              router.push('/login');
                            } catch (error) {
                              console.error('Logout error:', error);
                              window.location.href = '/login';
                            }
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('extracted.sign_out')}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="border-t theme-border-glass px-4 lg:px-6 py-2">
              <div className="flex items-center gap-2 text-sm theme-text-muted">
                <span>{isUserView ? t('extracted.applicant_portal') : t('extracted.dashboard')}</span>
                <ChevronDown className="w-3 h-3 rotate-270" />
                <span className="theme-text-primary capitalize">{breadcrumbLabel}</span>
              </div>
            </div>
          </header>

          <motion.main
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-4 sm:p-6 lg:p-8 relative z-10"
          >
            {children}
          </motion.main>
        </div>
      </div>

      {(userMenuOpen || notificationOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setUserMenuOpen(false);
            setNotificationOpen(false);
          }}
        />
      )}
    </div>
  );
}
