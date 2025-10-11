"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import UserSidebar from '@/components/UserSidebar';
import { Home, FileText, MessageCircle, Users, Wallet, BarChart3, Database, DownloadCloud, Menu, Bell, User, ChevronDown, Settings, Sun, Moon, HelpCircle, ChevronRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from '@/components/NotificationDropdown';

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // User-focused navigation: only pages relevant to applicants are included
  const navigationItems = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'applications', label: 'My Applications', icon: FileText },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
    { id: 'disbursements', label: 'Payments', icon: Wallet },
    { id: 'grievance', label: 'Grievances', icon: MessageCircle },
    { id: 'feedback', label: 'Feedback', icon: HelpCircle }
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

  // Keep active tab in sync with current pathname
  useEffect(() => {
    if (!pathname) return;
    const seg = pathname.split('/').filter(Boolean); // remove empty
    if (seg[0] === 'user-dashboard') {
      setActiveTab(seg[1] || 'overview');
    }
  }, [pathname]);

  const handleSidebarChange = (id: string) => {
    setActiveTab(id);
    if (id === 'overview') router.push('/user-dashboard');
    else router.push(`/user-dashboard/${id}`);
    setSidebarOpen(false);
  };

  const displayName = user?.displayName ?? (user?.email ? user.email.split('@')[0] : 'Guest');

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
          onToggleCollapse={() => setSidebarCollapsed(s => !s)}
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

                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors" aria-label="Open sidebar">
                  <Menu className="w-5 h-5 theme-text-primary" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold theme-text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Applicant Portal</h1>
                    <p className="text-sm theme-text-muted">Applicant tools and status</p>
                  </div>
                  <div className="sm:hidden">
                    <h1 className="text-lg font-bold theme-text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Applicant</h1>
                  </div>
                </div>
              </div>

              {/* Right Section - Theme Toggle, Notifications & User Menu */}
              <div className="flex items-center gap-3">
                <motion.button onClick={toggleTheme} className="p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label="Toggle theme">
                  {theme === 'dark' ? <Sun className="w-5 h-5 theme-text-primary" /> : <Moon className="w-5 h-5 theme-text-primary" />}
                </motion.button>

                <div className="relative">
                  <motion.button onClick={() => setNotificationOpen(n => !n)} className="relative p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors group" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Bell className="w-5 h-5 theme-text-primary group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 theme-border-glass"></span>
                  </motion.button>

                  <AnimatePresence>
                    {notificationOpen && (
                      <NotificationDropdown isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} triggerRef={undefined} width={320}>
                        <div className="p-3 border-b theme-border-glass"><h3 className="font-semibold theme-text-primary">Notifications</h3></div>
                        <div className="max-h-96 overflow-y-auto">
                          {[1,2,3].map(i => (
                            <div key={i} className="p-3 border-b theme-border-glass last:border-b-0 hover:theme-bg-hover transition-colors">
                              <p className="text-sm theme-text-primary">Update regarding your application</p>
                              <p className="text-xs theme-text-muted mt-1">{i} hours ago</p>
                            </div>
                          ))}
                        </div>
                      </NotificationDropdown>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <motion.button onClick={() => setUserMenuOpen(u => !u)} className="flex items-center gap-2 p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"><User className="w-4 h-4 text-white" /></div>
                    <div className="hidden sm:block text-left"><p className="text-sm font-medium theme-text-primary">{displayName}</p><p className="text-xs theme-text-muted">Applicant</p></div>
                    <ChevronDown className={`w-4 h-4 theme-text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 top-full mt-2 w-48 rounded-lg theme-bg-card border theme-border-glass shadow-lg backdrop-blur-xl py-1 z-50" style={{ background: dropdownSolidBg }}>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm theme-text-primary hover:theme-bg-hover transition-colors"><User className="w-4 h-4"/>Profile</button>
                        <div className="border-t theme-border-glass my-1" />
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm theme-text-primary hover:theme-bg-hover transition-colors"><Settings className="w-4 h-4"/>Settings</button>
                        <div className="border-t theme-border-glass my-1" />
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm theme-text-primary hover:theme-bg-hover transition-colors"><HelpCircle className="w-4 h-4"/>Help & Support</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="border-t theme-border-glass px-4 lg:px-6 py-2">
              <div className="flex items-center gap-2 text-sm theme-text-muted">
                <span>Applicant Portal</span>
                <ChevronDown className="w-3 h-3 rotate-270" />
                <span className="theme-text-primary capitalize">{activeTab.replace('-', ' ')}</span>
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
