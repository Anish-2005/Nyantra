"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, LogOut } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useLocale } from "../context/LocaleContext";
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

type NavItem = {
  id: string;
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  notificationCount?: number;
};

type Props = {
  items: NavItem[];
  activeId: string;
  onChange: (id: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  collapsed: boolean;
};

export default function UserSidebar({
  items,
  activeId,
  onChange,
  open,
  setOpen,
  collapsed = false,
}: Props) {
  const { theme } = useTheme();
  const { signOutUser } = useAuth();
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setOpen]);

  const logoSrc = theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png';

  return (
    <>
      {/* -------------------- MOBILE SIDEBAR -------------------- */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed z-50 top-0 left-0 h-full w-[85vw] max-w-[20rem] theme-bg-nav backdrop-blur-2xl border-r theme-border-glass shadow-2xl lg:hidden flex flex-col overflow-hidden"
            >
              {/* Mobile Header */}
              <div className="p-6 border-b theme-border-glass flex items-center justify-between bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border theme-border-glass">
                    <Image src={logoSrc} alt="Nyantra" width={32} height={32} className="object-contain" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                      {t('extracted.nyantra')}
                    </h2>
                    <p className="text-xs theme-text-muted font-medium tracking-wide uppercase">{t('extracted.applicant_portal')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl theme-bg-glass hover:bg-red-500/10 hover:text-red-500 transition-colors border theme-border-glass"
                >
                  <ChevronLeft className="w-5 h-5 theme-text-muted" />
                </button>
              </div>

              {/* Mobile Nav */}
              <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {items.map((item) => {
                  const isActive = activeId === item.id;
                  const Icon = item.icon || (() => <span className="w-6 h-6" />);

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        onChange(item.id);
                        setOpen(false);
                      }}
                      className={`group relative w-full flex items-center p-4 rounded-xl transition-all duration-300 ${isActive
                        ? 'accent-gradient text-white shadow-lg shadow-blue-500/20'
                        : 'hover:theme-bg-glass hover:theme-text-primary theme-text-secondary'
                        }`}
                    >
                      <Icon className={`w-6 h-6 flex-shrink-0 mr-4 ${isActive ? 'text-white' : 'theme-text-muted group-hover:theme-text-primary'}`} />
                      <span className="font-semibold text-base">{item.label}</span>

                      {item.notificationCount && item.notificationCount > 0 && (
                        <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white dark:ring-black">
                          {item.notificationCount > 9 ? '9+' : item.notificationCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Footer */}
              <div className="p-6 border-t theme-border-glass space-y-6 bg-gradient-to-t from-black/5 to-transparent">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 bg-white/5 rounded-xl p-1">
                    <ThemeToggle compact className="w-full justify-center" />
                  </div>
                  <div className="flex-1 bg-white/5 rounded-xl p-1">
                    <LanguageToggle compact className="w-full justify-center" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await signOutUser();
                      router.push('/login');
                    } catch { }
                  }}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 group font-semibold shadow-sm hover:shadow-red-500/20"
                >
                  <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span>{t('extracted.sign_out')}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* -------------------- DESKTOP SIDEBAR -------------------- */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full theme-bg-nav backdrop-blur-2xl border-r theme-border-glass shadow-2xl z-30 transition-all duration-300 ease-in-out overflow-x-hidden ${collapsed ? 'w-[80px]' : 'w-[280px]'
          }`}
      >
        {/* Desktop Header */}
        <div className={`flex items-center border-b theme-border-glass transition-all duration-300 ${collapsed ? 'h-20 justify-center px-1' : 'h-24 justify-start px-6'}`}>
          <div className={`flex items-center transition-all duration-300 ${collapsed ? 'justify-center w-auto' : 'gap-4 w-full'}`}>
            <div className={`rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center border theme-border-glass flex-shrink-0 shadow-sm relative overflow-hidden group transition-all duration-300 ${collapsed ? 'w-10 h-10' : 'w-12 h-12'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image src={logoSrc} alt="Nyantra" width={collapsed ? 24 : 32} height={collapsed ? 24 : 32} className="object-contain relative z-10" />
            </div>

            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col min-w-0 flex-1"
              >
                <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent truncate pt-1">
                  {t('extracted.nyantra')}
                </span>
                <span className="text-xs theme-text-muted font-medium tracking-wider uppercase truncate">
                  {t('extracted.applicant_portal')}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-1 custom-scrollbar">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const Icon = item.icon || (() => <span className="w-6 h-6" />);

            return (
              <div key={item.id} className="relative group/tooltip">
                <button
                  type="button"
                  onClick={() => onChange(item.id)}
                  className={`relative flex items-center transition-all duration-200 group overflow-hidden ${collapsed
                    ? 'justify-center py-3 px-0 rounded-2xl h-12 w-12'
                    : 'w-full py-3.5 px-4 rounded-xl space-x-3 mb-1'
                    } ${isActive
                      ? 'bg-transparent'
                      : 'hover:theme-bg-glass'
                    }`}
                  title={collapsed ? item.label : undefined}
                >
                  {/* Active Background Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabSidebarUser"
                      className={`absolute inset-0 accent-gradient -z-10 shadow-lg shadow-blue-500/20 ${collapsed ? 'rounded-2xl' : 'rounded-xl'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}

                  <div className={`relative z-10 flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    <Icon className={`w-6 h-6 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-white' : 'theme-text-secondary group-hover:theme-text-primary'}`} />

                    {/* Collapsed Warning Dot */}
                    {collapsed && item.notificationCount && item.notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 ring-2 ring-white dark:ring-black animate-pulse" />
                    )}
                  </div>

                  {!collapsed && (
                    <>
                      <span className={`font-semibold text-base truncate flex-1 text-left transition-colors duration-200 ${isActive ? 'text-white' : 'theme-text-secondary group-hover:theme-text-primary'}`}>
                        {item.label}
                      </span>

                      {item.notificationCount && item.notificationCount > 0 && (
                        <span className="flex h-5 min-w-[1.25rem] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                          {item.notificationCount > 99 ? '99+' : item.notificationCount}
                        </span>
                      )}
                    </>
                  )}
                </button>

                {/* Fancy Tooltip for Collapsed State */}
                {collapsed && (
                  <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg theme-bg-card border theme-border-glass shadow-xl opacity-0 translate-x-2 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-x-0 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap backdrop-blur-md">
                    <span className="text-sm font-semibold theme-text-primary">{item.label}</span>
                    {item.notificationCount && item.notificationCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {item.notificationCount}
                      </span>
                    )}
                    {/* Triangle pointer */}
                    <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-y-[6px] border-y-transparent border-r-[6px] border-r-[var(--card-border)]" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Desktop Footer */}
        <div className={`${collapsed ? 'p-2' : 'p-4'} border-t theme-border-glass bg-gradient-to-t from-black/5 to-transparent`}>
          <div className={`flex flex-col gap-4 ${collapsed ? 'items-center overflow-x-visible' : ''}`}>

            <motion.div
              layout
              className={`flex items-center theme-bg-glass rounded-xl p-1 border theme-border-glass ${collapsed ? 'flex-col gap-2' : 'gap-1'}`}
            >
              <div className={collapsed ? '' : 'flex-1'}>
                <ThemeToggle compact className="w-full justify-center hover:bg-transparent" />
              </div>
              {!collapsed && <div className="w-[1px] h-5 bg-gray-200 dark:bg-gray-700" />}
              {collapsed && <div className="h-[1px] w-5 bg-gray-200 dark:bg-gray-700" />}
              <div className={collapsed ? '' : 'flex-1'}>
                <LanguageToggle compact vertical={collapsed} className="w-full justify-center hover:bg-transparent" />
              </div>
            </motion.div>

            <button
              type="button"
              onClick={async () => {
                try {
                  await signOutUser();
                  router.push('/login');
                } catch { }
              }}
              className={`group flex items-center justify-center gap-3 p-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm transition-all duration-300 relative overflow-hidden ${collapsed ? 'w-12 h-12' : 'w-full'}`}
              title={collapsed ? t('extracted.sign_out') : undefined}
            >
              <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform z-10 relative" />
              {!collapsed && <span className="font-semibold z-10 relative">{t('extracted.sign_out')}</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
