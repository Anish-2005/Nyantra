"use client";
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart3, Database, DownloadCloud, FileText, Home, MessageCircle, Users, Wallet, Link } from 'lucide-react';

// Lazy load components for better performance
const BackgroundAnimation = lazy(() => import('@/components/BackgroundAnimation').then(module => ({ default: module.default })));
const DashboardBackground = lazy(() => import('./DashboardBackground').then(module => ({ default: module.DashboardBackground })));
const DashboardHeader = lazy(() => import('./DashboardHeader').then(module => ({ default: module.DashboardHeader })));
const DashboardMainContent = lazy(() => import('./DashboardMainContent').then(module => ({ default: module.DashboardMainContent })));
const DashboardThemeStyles = lazy(() => import('./DashboardThemeStyles').then(module => ({ default: module.DashboardThemeStyles })));
const Sidebar = lazy(() => import('@/components/Sidebar').then(module => ({ default: module.default })));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useLocale();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isProgrammaticNavigation, setIsProgrammaticNavigation] = useState(false);

  const navigationItems = [
    { id: 'overview', label: t('extracted.dashboard'), icon: Home },
    { id: 'applications', label: t('extracted.applications'), icon: FileText },
    { id: 'beneficiaries', label: t('extracted.beneficiaries'), icon: Users },
    { id: 'disbursements', label: t('extracted.disbursements'), icon: Wallet },
    { id: 'analytics', label: t('extracted.analytics_reports'), icon: BarChart3 },
    { id: 'grievance', label: (t('extracted.grievance_hub') || t('extracted.grievance')), icon: MessageCircle },
    { id: 'integrations', label: t('nav.integrations'), icon: Database },
    { id: 'reports', label: (t('extracted.recent_reports') || 'Reports'), icon: DownloadCloud },
    { id: 'blockchain', label: t('blockchain.blockchainNav'), icon: Link }
  ];

  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, profile } = useAuth();

  // Compute a friendly display name from Firebase user
  const displayName = user?.displayName ?? (user?.email ? user.email.split('@')[0] : 'Guest');

  useEffect(() => {
    // If auth finished loading and there is no user, redirect to login
    if (!loading && !user) router.push('/login');
    // If user is loaded but profile is loaded and doesn't have officer role, redirect appropriately
    if (!loading && user && profile !== undefined && profile?.role !== 'officer') {
      if (profile?.role === 'user') {
        router.push('/user-dashboard');
      } else {
        router.push('/choose-role');
      }
    }
  }, [user, loading, profile, router]);

  // Update active tab based on pathname changes (but not during programmatic navigation)
  useEffect(() => {
    if (!isProgrammaticNavigation) {
      if (pathname === '/dashboard') {
        setActiveTab('overview');
      } else if (pathname.startsWith('/dashboard/')) {
        const pathSegment = pathname.split('/dashboard/')[1]?.split('/')[0];
        if (pathSegment && navigationItems.some(item => item.id === pathSegment)) {
          setActiveTab(pathSegment);
        }
      }
    }
  }, [pathname, navigationItems, isProgrammaticNavigation]);

  const handleSidebarChange = (id: string) => {
    setIsProgrammaticNavigation(true);
    setActiveTab(id);
    if (id === 'overview') router.push('/dashboard');
    else router.push(`/dashboard/${id}`);
    setSidebarOpen(false);
    // Reset the flag after navigation completes
    setTimeout(() => setIsProgrammaticNavigation(false), 100);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <DashboardThemeStyles>
        <div data-theme="dark" className="relative min-h-screen overflow-hidden transition-all duration-300" style={{ background: 'var(--bg-gradient)' }}>
          {/* Three.js Background Animation */}
          <Suspense fallback={null}>
            <BackgroundAnimation />
          </Suspense>

          {/* Enhanced Gradient Orbs */}
          <Suspense fallback={null}>
            <DashboardBackground />
          </Suspense>

          <div className="flex min-h-screen relative z-10">
            {/* Sidebar */}
            <Suspense fallback={null}>
              <Sidebar
                items={navigationItems}
                activeId={activeTab}
                onChange={handleSidebarChange}
                open={sidebarOpen}
                setOpen={setSidebarOpen}
                collapsed={sidebarCollapsed}
              />
            </Suspense>

            {/* Main Content */}
            <div className={`flex flex-col flex-1 transition-all duration-300 ${
              sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
            }`}>
              {/* Enhanced Header */}
              <Suspense fallback={null}>
                <DashboardHeader
                  sidebarCollapsed={sidebarCollapsed}
                  toggleSidebarCollapse={toggleSidebarCollapse}
                  setSidebarOpen={setSidebarOpen}
                  displayName={displayName}
                  userMenuOpen={userMenuOpen}
                  setUserMenuOpen={setUserMenuOpen}
                  notificationOpen={notificationOpen}
                  setNotificationOpen={setNotificationOpen}
                  activeTab={activeTab}
                  navigationItems={navigationItems}
                  t={t}
                />
              </Suspense>

              {/* Page Content */}
              <Suspense fallback={<LoadingFallback />}>
                <DashboardMainContent sidebarCollapsed={sidebarCollapsed}>
                  {children}
                </DashboardMainContent>
              </Suspense>
            </div>
          </div>

          {/* Close dropdowns when clicking outside */}
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
      </DashboardThemeStyles>
    </Suspense>
  );
}