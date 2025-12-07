"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import UserSidebar from '@/components/UserSidebar';
import { Home, FileText, MessageCircle, Users, Wallet, Menu, Bell, User, ChevronDown, Settings, HelpCircle, ChevronRight, LogOut } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import type * as THREE from 'three';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundAnimation from '@/components/BackgroundAnimation';
import NotificationDropdown from '@/components/NotificationDropdown';
import { collection, query, where, onSnapshot, orderBy, limit, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { signOutUser } = useAuth();
  const { t } = useLocale();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isProgrammaticNavigation, setIsProgrammaticNavigation] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);

  // User-focused navigation: only pages relevant to applicants are included
  const navigationItems = [
    { id: 'overview', label: t('extracted.dashboard'), icon: Home },
    { id: 'applications', label: t('extracted.my_applications'), icon: FileText },
    { id: 'beneficiaries', label: t('extracted.beneficiaries'), icon: Users },
    { id: 'disbursements', label: t('extracted.payments'), icon: Wallet },
    { id: 'reports', label: t('extracted.reports'), icon: FileText },
    { id: 'grievance', label: t('extracted.grievances'), icon: MessageCircle },
    { id: 'feedback', label: t('extracted.feedback'), icon: HelpCircle }
  ];

  const router = useRouter();
  const pathname = usePathname();

  // Slightly stronger dropdown backgrounds for better contrast
  const dropdownSolidBg = theme === 'dark' ? 'rgba(15, 23, 42, 0.99)' : 'rgba(255, 255, 255, 0.99)';

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in e ? e.matches : mq.matches;
      if (!matches) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handler(mq);
  if ('addEventListener' in mq) mq.addEventListener('change', handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
  else (mq as unknown as { addListener?: (h: (e: MediaQueryListEvent) => void) => void }).addListener?.(handler as (e: MediaQueryListEvent) => void);
    return () => {
  if ('removeEventListener' in mq) mq.removeEventListener('change', handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
  else (mq as unknown as { removeListener?: (h: (e: MediaQueryListEvent) => void) => void }).removeListener?.(handler as (e: MediaQueryListEvent) => void);
    };
  }, []);

  // Update active tab based on pathname changes (but not during programmatic navigation)
  useEffect(() => {
    if (!isProgrammaticNavigation && pathname) {
      const seg = pathname.split('/').filter(Boolean); // remove empty
      if (seg[0] === 'user-dashboard') {
        setActiveTab(seg[1] || 'overview');
      }
    }
  }, [pathname, isProgrammaticNavigation]);

  // Fetch notifications for the user
  useEffect(() => {
    if (!user?.uid) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      limit(20)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        read: doc.data().read || false
      }));

      // Sort client-side to avoid composite index requirement
      notificationsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Fetch user profile data
  useEffect(() => {
    if (!user?.uid) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserProfile(doc.data());
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleSidebarChange = (id: string) => {
    setIsProgrammaticNavigation(true);
    setActiveTab(id);
    if (id === 'overview') router.push('/user-dashboard');
    else router.push(`/user-dashboard/${id}`);
    setSidebarOpen(false);
    // Reset the flag after navigation completes
    setTimeout(() => setIsProgrammaticNavigation(false), 100);
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    const promises = unreadNotifications.map(notification =>
      updateDoc(doc(db, 'notifications', notification.id), {
        read: true,
        readAt: Timestamp.now()
      })
    );

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get notification icon based on type
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

  // Format notification time
  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const displayName = user?.displayName ?? (user?.email ? user.email.split('@')[0] : 'Guest');
  const userInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div data-theme={theme} className="relative min-h-screen overflow-hidden transition-all duration-300" style={{ background: 'var(--bg-gradient)' }}>
      {/* Theme variables and helpers copied from main dashboard to match exactly */}
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

      {/* Three.js Canvas Background (same effect as /dashboard) */}
      <BackgroundAnimation />

      {/* Three.js initialization (client-only, theme-aware) */}
      <script suppressHydrationWarning>{`/* placeholder for client-only three init */`}</script>

      {/* Enhanced Gradient Orbs */}
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
        <UserSidebar
          items={navigationItems}
          activeId={activeTab}
          onChange={handleSidebarChange}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          collapsed={sidebarCollapsed}
        />

        <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          {/* Enhanced Header (copied from /dashboard for visual parity) */}
          <header className="sticky top-0 z-40 backdrop-blur-xl theme-bg-nav border-b theme-border-glass shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 lg:px-6">
              <div className="flex items-center gap-4 flex-1">
                <motion.button
                  onClick={() => setSidebarCollapsed(s => !s)}
                  className="hidden lg:flex p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <ChevronRight className={`w-5 h-5 theme-text-primary transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
                </motion.button>

                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors" aria-label={t('extracted.open_sidebar')}>
                  <Menu className="w-5 h-5 theme-text-primary" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold theme-text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('extracted.nyantra')} </h1>
                    <p className="text-sm theme-text-muted">{t('extracted.applicant_portal')} </p>
                  </div>
                  <div className="sm:hidden">
                    <h1 className="text-lg font-bold theme-text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('extracted.nyantra')} </h1>
                  </div>
                </div>
              </div>

              {/* Right Section - Theme Toggle, Notifications & User Menu */}
              <div className="flex items-center gap-3">
               

                <div className="relative">
                  <motion.button
                    onClick={() => setNotificationOpen(n => !n)}
                    className="relative p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell className="w-5 h-5 theme-text-primary group-hover:scale-110 transition-transform" />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 theme-border-glass flex items-center justify-center"
                      >
                        <span className="text-xs font-bold text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      </motion.span>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {notificationOpen && (
                      <NotificationDropdown isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} triggerRef={undefined} width={320}>
                        <div className="p-4 border-b theme-border-glass">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold theme-text-primary">{t('extracted.notifications_1')}</h3>
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllNotificationsAsRead}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
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
                            notifications.map(notification => (
                              <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-4 border-b theme-border-glass last:border-b-0 hover:theme-bg-hover transition-colors cursor-pointer ${
                                  !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                }`}
                                onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="text-lg flex-shrink-0">
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm theme-text-primary font-medium leading-tight">
                                      {notification.title || notification.message}
                                    </p>
                                    {notification.message && notification.title && (
                                      <p className="text-sm theme-text-muted mt-1 leading-tight">
                                        {notification.message}
                                      </p>
                                    )}
                                    <p className="text-xs theme-text-muted mt-2">
                                      {formatNotificationTime(notification.createdAt)}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                  )}
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="p-3 border-t theme-border-glass text-center">
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                              View all notifications
                            </button>
                          </div>
                        )}
                      </NotificationDropdown>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <motion.button
                    onClick={() => setUserMenuOpen(u => !u)}
                    className="flex items-center gap-2 px-2 py-2 h-9 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                      {userInitials}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-medium theme-text-primary truncate max-w-24">{displayName}</p>
                      <p className="text-xs theme-text-muted capitalize">{userProfile?.role || 'Applicant'}</p>
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
                        {/* User Info Section */}
                        <div className="px-4 py-3 border-b theme-border-glass">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {userInitials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium theme-text-primary truncate">{displayName}</p>
                              <p className="text-sm theme-text-muted">{user?.email}</p>
                              <p className="text-xs theme-text-muted capitalize">{userProfile?.role || 'Applicant'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            router.push('/user-dashboard/profile');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm theme-text-primary hover:theme-bg-hover transition-colors"
                        >
                          <User className="w-4 h-4"/>
                          <span>{t('extracted.profile')}</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            router.push('/user-dashboard/settings');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm theme-text-primary hover:theme-bg-hover transition-colors"
                        >
                          <Settings className="w-4 h-4"/>
                          <span>{t('extracted.settings')}</span>
                        </button>

                        <div className="border-t theme-border-glass my-1" />

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            router.push('/user-dashboard/help');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm theme-text-primary hover:theme-bg-hover transition-colors"
                        >
                          <HelpCircle className="w-4 h-4"/>
                          <span>{t('extracted.help_support')}</span>
                        </button>

                        <div className="border-t theme-border-glass my-1" />

                        {/* Quick Stats */}
                        <div className="px-4 py-2">
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div>
                              <p className="text-lg font-bold theme-text-primary">{notifications.filter(n => !n.read).length}</p>
                              <p className="text-xs theme-text-muted">Unread</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold theme-text-primary">{notifications.length}</p>
                              <p className="text-xs theme-text-muted">Total</p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t theme-border-glass my-1" />

                        <button
                          onClick={async () => {
                            console.log('Sign out button clicked');
                            setUserMenuOpen(false);
                            try {
                              console.log('Calling signOutUser...');
                              await signOutUser();
                              console.log('signOutUser completed, navigating to login...');
                              // Try router.push first, fallback to window.location
                              try {
                                router.push('/login');
                              } catch (navError) {
                                console.log('router.push failed, using window.location');
                                window.location.href = '/login';
                              }
                            } catch (error) {
                              console.error('Logout error:', error);
                              // Fallback navigation
                              try {
                                router.push('/login');
                              } catch (navError) {
                                window.location.href = '/login';
                              }
                            }
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4"/>
                          <span>{t('extracted.sign_out')}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="border-t theme-border-glass px-4 lg:px-6 py-2">
              <div className="flex items-center gap-2 text-sm theme-text-muted">
                <span>{t('extracted.applicant_portal')} </span>
                <ChevronDown className="w-3 h-3 rotate-270" />
                <span className="theme-text-primary capitalize">{(
                  activeTab === 'overview' ? t('extracted.dashboard') :
                  activeTab === 'applications' ? t('extracted.my_applications') :
                  activeTab === 'beneficiaries' ? t('extracted.beneficiaries') :
                  activeTab === 'disbursements' ? t('extracted.payments') :
                  activeTab === 'grievance' ? t('extracted.grievances') :
                  activeTab === 'feedback' ? t('extracted.feedback') :
                  activeTab.replace('-', ' ')
                )}</span>
              </div>
            </div>
          </header>

          <motion.main initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-4 sm:p-6 lg:p-8 relative z-10">
            {children}
          </motion.main>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(userMenuOpen || notificationOpen) && (<div className="fixed inset-0 z-30" onClick={() => { setUserMenuOpen(false); setNotificationOpen(false); }} />)}
    </div>
  );
}
