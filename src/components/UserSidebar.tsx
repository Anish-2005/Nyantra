"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import LanguageToggle from './LanguageToggle';

type NavItem = {
  id: string;
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type Props = {
  items: NavItem[];
  activeId: string;
  onChange: (id: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export default function UserSidebar({
  items,
  activeId,
  onChange,
  open,
  setOpen,
  collapsed = false,
  onToggleCollapse,
}: Props) {
  const { theme } = useTheme();
  const { signOutUser } = useAuth();
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setOpen]);

  const logoSrc = theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png';

  return (
    <>
      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: open ? '0%' : '-100%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className="fixed z-50 top-0 left-0 h-full w-[min(92vw,16rem)] max-w-[16rem] theme-bg-nav backdrop-blur-xl border-r theme-border-glass shadow-xl lg:hidden flex flex-col overflow-hidden pointer-events-auto"
      >
        <div className="p-4 border-b theme-border-glass flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center relative">
              <Image src={logoSrc} alt={t('extracted.nyantra')} fill className="object-contain" />
            </div>
            <div>
        <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'theme-text-primary'}`}>
          {t('extracted.applicant')}
        </div>
        <div className="text-xs theme-text-muted">{t('extracted.your_portal')}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 rounded-md theme-border-glass border theme-bg-glass"
            aria-label={t('extracted.close_sidebar')}
          >
            <ChevronLeft className="w-4 h-4 theme-text-primary" />
          </button>
        </div>

        <nav className="flex-1 p-3 overflow-auto min-w-0" role="navigation" aria-label={t('extracted.user_navigation')}>
          <ul className="space-y-2">
            {items.map(item => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all min-w-0 ${
                    activeId === item.id
                      ? 'accent-gradient text-white shadow-lg'
                      : 'theme-text-primary hover:theme-bg-glass theme-border-glass border border-transparent hover:border'
                  }`}
                >
                  {item.icon ? <item.icon className="w-5 h-5 flex-shrink-0" /> : <span className="w-5 h-5" />}
                  <span className="font-medium truncate">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer: Language + Logout (Mobile) */}
        <div className="p-4 border-t theme-border-glass flex flex-col gap-3">
          <div className="flex justify-center">
            <LanguageToggle compact vertical />
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                await signOutUser();
                router.push('/login');
              } catch {
                // ignore
              }
            }}
            className="w-full flex items-center justify-center space-x-3 p-2 rounded-lg text-sm text-red-600 border border-red-500 hover:border-red-600 hover:theme-bg-glass transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            <span className="truncate text-center flex-1">{t('extracted.sign_out')}</span>
          </button>
        </div>
      </motion.div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`hidden lg:flex lg:flex-col fixed top-0 left-0 h-full theme-bg-nav backdrop-blur-xl border-r theme-border-glass shadow-md z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`p-4 border-b theme-border-glass flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center relative">
                <Image src={logoSrc} alt={t('extracted.nyantra')} width={30} height={30} className="object-contain" />
              </div>
                <div>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'theme-text-primary'}`}>
                    {t('extracted.applicant')}
                </div>
                <div className="text-xs theme-text-muted">{t('extracted.portal')}</div>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center relative">
              <Image src={logoSrc} alt={t('extracted.nyantra')} width={24} height={24} className="object-contain" />
            </div>
          )}

          {!collapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1 rounded-md theme-border-glass border theme-bg-glass hover:theme-bg-hover transition-colors"
              aria-label={t('extracted.collapse_sidebar')}
            >
              <ChevronLeft className="w-3 h-3 theme-text-primary" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-3 overflow-auto min-w-0">
          <ul className="space-y-2">
            {items.map(item => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onChange(item.id)}
                  className={`w-full flex items-center rounded-lg transition-all min-w-0 ${
                    collapsed ? 'justify-center p-3' : 'space-x-3 p-3'
                  } ${
                    activeId === item.id
                      ? 'accent-gradient text-white shadow-lg'
                      : 'theme-text-primary hover:theme-bg-glass theme-border-glass border border-transparent hover:border'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  {item.icon ? <item.icon className="w-5 h-5 flex-shrink-0" /> : <span className="w-5 h-5" />}
                  {!collapsed && <span className="font-medium truncate">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer: Language + Logout (Desktop) */}
        <div
          className={`p-4 border-t theme-border-glass flex flex-col items-center gap-3 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex justify-center w-full">
            {/* Ensure visible even when collapsed - use compact + vertical so it stacks nicely */}
            <LanguageToggle compact vertical />
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                await signOutUser();
                router.push('/login');
              } catch {
                // ignore
              }
            }}
            className={`flex items-center justify-center space-x-3 p-2 rounded-lg text-sm text-red-600 border border-red-500 hover:border-red-600 hover:theme-bg-glass transition ${
              collapsed ? 'w-10 h-10' : 'w-full'
            }`}
            title={collapsed ? t('extracted.sign_out') : undefined}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            {!collapsed && <span className="truncate text-center flex-1">{t('extracted.sign_out')}</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
