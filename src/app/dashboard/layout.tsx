"use client";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { BarChart3, Database, DownloadCloud, FileText, Home, Menu, MessageCircle, Users, Wallet, Bell, User, ChevronDown, Settings, LogOut, Sun, Moon, HelpCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { theme, toggleTheme } = useTheme();
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
    
    const handleSidebarChange = (id: string) => {
        setActiveTab(id);
        if (id === 'overview') router.push('/dashboard');
        else router.push(`/dashboard/${id}`);
        setSidebarOpen(false);
    };

    return (
        <div className={`flex min-h-screen theme-bg-body ${theme === "dark" ? "text-white" : "text-black"}`}>
            {/* Sidebar */}
            <Sidebar
                items={navigationItems}
                activeId={activeTab}
                onChange={handleSidebarChange}
                open={sidebarOpen}
                setOpen={setSidebarOpen}
            />

            {/* Main Content */}
            <div className="flex flex-col flex-1 relative z-0 lg:ml-64">
                {/* Enhanced Header */}
                <header className="sticky top-0 z-40 backdrop-blur-xl theme-bg-glass border-b theme-border-glass shadow-sm">
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
                                            className="absolute right-0 top-full mt-2 w-80 rounded-lg theme-bg-glass border theme-border-glass shadow-lg backdrop-blur-xl py-2 z-50"
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
                                            className="absolute right-0 top-full mt-2 w-48 rounded-lg theme-bg-glass border theme-border-glass shadow-lg backdrop-blur-xl py-1 z-50"
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
                    className="p-4 sm:p-6 lg:p-8"
                >
                    {children || (
                        <div className="text-center py-20 text-lg theme-text-muted">
                            Select a section from the sidebar.
                        </div>
                    )}
                </motion.main>
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