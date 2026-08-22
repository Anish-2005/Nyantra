"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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
  onToggleCollapse?: () => void;
  subtitle?: string;
};

export default function Sidebar({
  items,
  activeId,
  onChange,
  open,
  setOpen,
  collapsed = false,
  onToggleCollapse,
  subtitle,
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
  const subtitleText = subtitle ?? t('extracted.dbt_dashboard');

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/login');
    } catch { }
  };

  const Badge = ({ count }: { count?: number }) =>
    count && count > 0 ? (
      <span className="ml-auto inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
        {count > 99 ? '99+' : count}
      </span>
    ) : null;

  return (
    <>
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
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed z-50 top-0 left-0 h-full w-[260px] max-w-[80vw] theme-bg-nav backdrop-blur-2xl border-r theme-border-glass lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between pl-5 pr-3 h-14 border-b theme-border-glass">
                <div className="flex items-center gap-2.5">
                  <Image src={logoSrc} alt={t('extracted.nyantra')} width={30} height={30} className="object-contain" />
                  <div>
                    <p className="text-base font-semibold tracking-tight theme-text-primary leading-tight">{t('extracted.nyantra')}</p>
                    <p className="text-[10px] theme-text-muted font-medium tracking-[0.12em] uppercase leading-tight">{subtitleText}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors"
                  aria-label={t('extracted.open_sidebar')}
                >
                  <X className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
                {items.map((item) => {
                  const isActive = activeId === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        onChange(item.id);
                        setOpen(false);
                      }}
                      className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'theme-bg-glass theme-text-primary'
                          : 'theme-text-secondary hover:theme-bg-glass hover:theme-text-primary'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full accent-gradient" />
                      )}
                      {Icon && <Icon className="w-4 h-4 shrink-0" />}
                      <span className="truncate">{item.label}</span>
                      <Badge count={item.notificationCount} />
                    </button>
                  );
                })}
              </nav>

              <div className="p-3 border-t theme-border-glass space-y-2">
                <div className="flex items-center">
                  <ThemeToggle compact />
                  <LanguageToggle compact className="ml-auto" />
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-red-500/90 text-sm font-medium hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('extracted.sign_out')}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full theme-bg-nav backdrop-blur-2xl border-r theme-border-glass z-30 transition-all duration-300 ease-in-out overflow-x-hidden ${
          collapsed ? 'w-[64px]' : 'w-[240px]'
        }`}
      >
        <div className={`flex items-center border-b theme-border-glass h-14 shrink-0 ${collapsed ? 'justify-center' : 'px-5'}`}>
          <Image src={logoSrc} alt={t('extracted.nyantra')} width={30} height={30} className="object-contain shrink-0" />
          {!collapsed && (
            <div className="ml-2.5 min-w-0">
              <p className="text-base font-semibold tracking-tight theme-text-primary truncate leading-tight">{t('extracted.nyantra')}</p>
              <p className="text-[10px] theme-text-muted font-medium tracking-[0.12em] uppercase truncate leading-tight">{subtitleText}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2.5 space-y-0.5 custom-scrollbar">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const Icon = item.icon;

            return (
              <div key={item.id} className="relative group/tooltip">
                <button
                  type="button"
                  onClick={() => onChange(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`relative w-full flex items-center rounded-lg text-[13px] font-medium transition-colors duration-150 ${
                    collapsed ? 'justify-center h-9' : 'gap-2.5 px-2.5 py-2'
                  } ${
                    isActive
                      ? 'theme-bg-glass theme-text-primary'
                      : 'theme-text-secondary hover:theme-bg-glass hover:theme-text-primary'
                  }`}
                >
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full accent-gradient" />
                  )}
                  {isActive && collapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full accent-gradient" />
                  )}
                  {Icon && <Icon className="w-4 h-4 shrink-0" />}
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      <Badge count={item.notificationCount} />
                    </>
                  )}
                  {collapsed && item.notificationCount && item.notificationCount > 0 && (
                    <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-2 ring-[var(--nav-bg)]" />
                  )}
                </button>

                {collapsed && (
                  <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-md theme-bg-card border theme-border-glass shadow-lg opacity-0 translate-x-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-x-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap backdrop-blur-md flex items-center gap-1.5">
                    <span className="text-xs font-medium theme-text-primary">{item.label}</span>
                    {item.notificationCount && item.notificationCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[9px] font-bold text-white">
                        {item.notificationCount > 99 ? '99+' : item.notificationCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className={`p-2 border-t theme-border-glass shrink-0 space-y-1 ${collapsed ? 'flex flex-col items-center' : ''}`}>
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={`w-full flex items-center justify-center rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors ${
                collapsed ? 'w-9 h-8 mx-auto' : 'gap-2 px-3 py-1.5'
              }`}
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4" />
                  <span className="text-xs font-medium">Collapse sidebar</span>
                </>
              )}
            </button>
          )}

          <div className={`w-full ${collapsed ? 'flex flex-col items-center gap-0.5' : 'flex items-center gap-0.5'}`}>
            <ThemeToggle compact className="shrink-0" />
            <LanguageToggle compact vertical={collapsed} className={collapsed ? '' : 'ml-auto'} />
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            title={collapsed ? t('extracted.sign_out') : undefined}
            className={`group flex items-center justify-center gap-2 rounded-md text-red-500/90 text-[13px] font-medium transition-colors hover:bg-red-500/10 hover:text-red-500 ${
              collapsed ? 'w-9 h-9' : 'w-full px-3 py-2'
            }`}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>{t('extracted.sign_out')}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
