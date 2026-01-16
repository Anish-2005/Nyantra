"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Menu, Bell, User, ChevronDown, Settings, HelpCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';

interface DashboardHeaderProps {
  sidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  setSidebarOpen: (open: boolean) => void;
  displayName: string;
  userMenuOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;
  notificationOpen: boolean;
  setNotificationOpen: (open: boolean) => void;
  activeTab: string;
  navigationItems: Array<{ id: string; label: string }>;
  t: (key: string) => string;
}

export const DashboardHeader = ({
  sidebarCollapsed,
  toggleSidebarCollapse,
  setSidebarOpen,
  displayName,
  userMenuOpen,
  setUserMenuOpen,
  notificationOpen,
  setNotificationOpen,
  activeTab,
  navigationItems,
  t
}: DashboardHeaderProps) => {
  const { theme } = useTheme();
  const dropdownSolidBg = theme === 'dark' ? 'rgba(15, 23, 42, 0.99)' : 'rgba(255, 255, 255, 0.99)';

  const getActiveTabLabel = (tabId: string) => {
    return navigationItems.find(item => item.id === tabId)?.label ||
           tabId.replace('-', ' ');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl theme-bg-nav border-b theme-border-glass shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left Section - Mobile Menu & Branding */}
        <div className="flex items-center gap-4 flex-1">
          {/* Desktop sidebar toggle */}
          <motion.button
            onClick={toggleSidebarCollapse}
            className="hidden lg:flex p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight className={`w-5 h-5 theme-text-primary transition-transform ${
              sidebarCollapsed ? '' : 'rotate-180'
            }`} />
          </motion.button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors"
            aria-label={t('extracted.open_sidebar')}
          >
            <Menu className="w-5 h-5 theme-text-primary" />
          </button>

          {/* Nyantra Dashboard Branding */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold theme-text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('extracted.nyantra_dashboard')}
              </h1>
              <p className="text-sm theme-text-muted">
                {t('extracted.direct_benefit_transfer_management')}
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold theme-text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('extracted.nyantra')}
              </h1>
            </div>
          </div>
        </div>

        {/* Right Section - Theme Toggle, Notifications & User Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <motion.button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5 theme-text-primary group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 theme-border-glass"></span>
            </motion.button>

            {/* Notification Dropdown */}
            {notificationOpen && (
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
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 h-[41px] px-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium theme-text-primary leading-tight">{displayName}</p>
                <p className="text-xs theme-text-muted leading-tight">{t('extracted.administrator')}</p>
              </div>
              <ChevronDown className={`w-4 h-4 theme-text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-48 rounded-lg theme-bg-card border theme-border-glass shadow-lg backdrop-blur-xl py-1 z-50"
                style={{ background: dropdownSolidBg }}
              >
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm theme-text-primary hover:theme-bg-hover transition-colors">
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <div className="border-t theme-border-glass my-1"></div>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm theme-text-primary hover:theme-bg-hover transition-colors">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <div className="border-t theme-border-glass my-1"></div>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm theme-text-primary hover:theme-bg-hover transition-colors">
                  <HelpCircle className="w-4 h-4" />
                  Help & Support
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb Section */}
      <div className="border-t theme-border-glass px-4 lg:px-6 py-2">
        <div className="flex items-center gap-2 text-sm theme-text-muted">
          <span>{t('extracted.dashboard')}</span>
          <ChevronDown className="w-3 h-3 rotate-270" />
          <span className="theme-text-primary capitalize">{getActiveTabLabel(activeTab)}</span>
        </div>
      </div>
    </header>
  );
};