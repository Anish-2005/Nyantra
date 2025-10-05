"use client";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { BarChart3, Database, DownloadCloud, FileText, Home, Menu, MessageCircle, Users, Wallet, Bell, User, ChevronDown, Settings, LogOut, Sun, Moon, HelpCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { theme, toggleTheme } = useTheme();
    // Slightly stronger dropdown backgrounds for better contrast
    const dropdownSolidBg = theme === 'dark' ? 'rgba(15, 23, 42, 0.99)' : 'rgba(255, 255, 255, 0.99)';
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    
    const navigationItems = [
        { id: 'overview', label: 'Dashboard', icon: Home },
        { id: 'applications', label: 'Applications', icon: FileText },
        { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
        { id: 'disbursements', label: 'Disbursements', icon: Wallet },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'grievance', label: 'Grievance', icon: MessageCircle },
        { id: 'integrations', label: 'Integrations', icon: Database },
        { id: 'reports', label: 'Reports', icon: DownloadCloud }
    ];
    
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        // If auth finished loading and there is no user, redirect to login
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);
    
    const handleSidebarChange = (id: string) => {
        setActiveTab(id);
        if (id === 'overview') router.push('/dashboard');
        else router.push(`/dashboard/${id}`);
        setSidebarOpen(false);
    };

    return (
        <div data-theme={theme} className="relative min-h-screen overflow-hidden transition-colors duration-300" style={{ background: 'var(--bg-gradient)' }}>
            {/* Enhanced Theme Variables */}
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
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className={`absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl accent-gradient ${theme === 'dark' ? 'opacity-15' : 'opacity-20'}`}
                    animate={{
                        x: [0, -100, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            <div className="flex min-h-screen relative z-10">
                {/* Sidebar */}
                <Sidebar
                    items={navigationItems}
                    activeId={activeTab}
                    onChange={handleSidebarChange}
                    open={sidebarOpen}
                    setOpen={setSidebarOpen}
                />

                {/* Main Content */}
                <div className="flex flex-col flex-1 lg:ml-64">
                    {/* Enhanced Header */}
                    <header className="sticky top-0 z-40 backdrop-blur-xl theme-bg-nav border-b theme-border-glass shadow-sm">
                        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
                            {/* Left Section - Mobile Menu & Branding */}
                            <div className="flex items-center gap-4 flex-1">
                                {/* Mobile menu toggle */}
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors"
                                    aria-label="Open sidebar"
                                >
                                    <Menu className="w-5 h-5 theme-text-primary" />
                                </button>

                                {/* Nyantara Dashboard Branding */}
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:block">
                                        <h1 className="text-xl font-bold theme-text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            Nyantara Dashboard
                                        </h1>
                                        <p className="text-sm theme-text-muted">
                                            Direct Benefit Transfer Management
                                        </p>
                                    </div>
                                    <div className="sm:hidden">
                                        <h1 className="text-lg font-bold theme-text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            Nyantara
                                        </h1>
                                    </div>
                                </div>
                            </div>

                            {/* Right Section - Theme Toggle, Notifications & User Menu */}
                            <div className="flex items-center gap-3">
                                {/* Theme Toggle */}
                                <motion.button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="Toggle theme"
                                >
                                    {theme === 'dark' ? (
                                        <Sun className="w-5 h-5 theme-text-primary" />
                                    ) : (
                                        <Moon className="w-5 h-5 theme-text-primary" />
                                    )}
                                </motion.button>

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
                                    <AnimatePresence>
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
                                                    <h3 className="font-semibold theme-text-primary">Notifications</h3>
                                                </div>
                                                <div className="max-h-96 overflow-y-auto">
                                                    {[1, 2, 3].map((item) => (
                                                        <div key={item} className="p-3 border-b theme-border-glass last:border-b-0 hover:theme-bg-hover transition-colors">
                                                            <p className="text-sm theme-text-primary">New application requires review</p>
                                                            <p className="text-xs theme-text-muted mt-1">2 hours ago</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* User Menu */}
                                <div className="relative">
                                    <motion.button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="hidden sm:block text-left">
                                            <p className="text-sm font-medium theme-text-primary">John Doe</p>
                                            <p className="text-xs theme-text-muted">Administrator</p>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 theme-text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                    </motion.button>

                                    {/* User Dropdown Menu */}
                                    <AnimatePresence>
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
                                                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm theme-text-primary hover:theme-bg-hover transition-colors">
                                                    <Settings className="w-4 h-4" />
                                                    Settings
                                                </button>
                                                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm theme-text-primary hover:theme-bg-hover transition-colors">
                                                    <HelpCircle className="w-4 h-4" />
                                                    Help & Support
                                                </button>
                                                <div className="border-t theme-border-glass my-1"></div>
                                                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:theme-bg-hover transition-colors">
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Breadcrumb Section */}
                        <div className="border-t theme-border-glass px-4 lg:px-6 py-2">
                            <div className="flex items-center gap-2 text-sm theme-text-muted">
                                <span>Dashboard</span>
                                <ChevronDown className="w-3 h-3 rotate-270" />
                                <span className="theme-text-primary capitalize">{activeTab.replace('-', ' ')}</span>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <motion.main
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="p-4 sm:p-6 lg:p-8 relative z-10"
                    >
                        {children || (
                            <div className="text-center py-20 text-lg theme-text-muted">
                                Select a section from the sidebar.
                            </div>
                        )}
                    </motion.main>
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
    );
}