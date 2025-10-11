"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

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

export default function UserSidebar({ items, activeId, onChange, open, setOpen, collapsed = false, onToggleCollapse }: Props) {
  const { theme } = useTheme();

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
      {/* Mobile */}
      <motion.div initial={{ x: '-100%' }} animate={{ x: open ? '0%' : '-100%' }} transition={{ type: 'spring', stiffness: 260, damping: 30 }} className="fixed z-50 top-0 left-0 h-full w-[min(92vw,16rem)] max-w-[16rem] theme-bg-nav backdrop-blur-xl border-r theme-border-glass shadow-xl lg:hidden flex flex-col overflow-hidden pointer-events-auto">
        <div className="p-4 border-b theme-border-glass flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center relative">
              <Image src={logoSrc} alt="Nyantra" fill className="object-contain" />
            </div>
            <div>
              <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'theme-text-primary'}`}>Applicant</div>
              <div className="text-xs theme-text-muted">Your portal</div>
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-md theme-border-glass border theme-bg-glass" aria-label="Close sidebar">
            <ChevronLeft className="w-4 h-4 theme-text-primary" />
          </button>
        </div>

        <nav className="flex-1 p-3 overflow-auto min-w-0" role="navigation" aria-label="User navigation">
          <ul className="space-y-2">
            {items.map(item => (
              <li key={item.id}>
                <button type="button" onClick={() => { onChange(item.id); setOpen(false); }} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all min-w-0 ${activeId === item.id ? 'accent-gradient text-white shadow-lg' : 'theme-text-primary hover:theme-bg-glass theme-border-glass border border-transparent hover:border'}`}>
                  {item.icon ? <item.icon className="w-5 h-5 flex-shrink-0" /> : <span className="w-5 h-5" />}
                  <span className="font-medium truncate">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 border-t theme-border-glass">
          <button type="button" className="w-full flex items-center justify-center space-x-3 p-2 rounded-lg text-sm text-red-600 border border-red-500 hover:border-red-600 hover:theme-bg-glass">Sign Out</button>
        </div>
      </motion.div>

      {/* Desktop */}
      <motion.aside initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`hidden lg:flex lg:flex-col fixed top-0 left-0 h-full theme-bg-nav backdrop-blur-xl border-r theme-border-glass shadow-md z-30 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className={`p-4 border-b theme-border-glass flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center relative">
                <Image src={logoSrc} alt="Nyantra" width={30} height={30} className="w-6 h-6 object-contain" />
              </div>
              <div>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'theme-text-primary'}`}>Applicant</div>
                <div className="text-xs theme-text-muted">Portal</div>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center relative">
              <Image src={logoSrc} alt="Nyantra" width={24} height={24} className="w-6 h-6 object-contain" />
            </div>
          )}

          {!collapsed && onToggleCollapse && (
            <button type="button" onClick={onToggleCollapse} className="p-1 rounded-md theme-border-glass border theme-bg-glass hover:theme-bg-hover transition-colors" aria-label="Collapse sidebar">
              <ChevronLeft className="w-3 h-3 theme-text-primary" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-3 overflow-auto min-w-0">
          <ul className="space-y-2">
            {items.map(item => (
              <li key={item.id}>
                <button type="button" onClick={() => onChange(item.id)} className={`w-full flex items-center rounded-lg transition-all min-w-0 ${collapsed ? 'justify-center p-3' : 'space-x-3 p-3'} ${activeId === item.id ? 'accent-gradient text-white shadow-lg' : 'theme-text-primary hover:theme-bg-glass theme-border-glass border border-transparent hover:border'}`} title={collapsed ? item.label : undefined}>
                  {item.icon ? <item.icon className="w-5 h-5 flex-shrink-0" /> : <span className="w-5 h-5" />}
                  {!collapsed && <span className="font-medium truncate">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {collapsed && onToggleCollapse && (
          <div className="p-3 border-t theme-border-glass">
            <button type="button" onClick={onToggleCollapse} className="w-full flex items-center justify-center p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors" aria-label="Expand sidebar">
              <ChevronRight className="w-4 h-4 theme-text-primary" />
            </button>
          </div>
        )}

        <div className={`p-3 border-t theme-border-glass ${collapsed ? 'flex justify-center' : ''}`}>
          <button type="button" className={`flex items-center justify-center space-x-3 p-2 rounded-lg text-sm text-red-600 border border-red-500 hover:border-red-600 hover:theme-bg-glass ${collapsed ? 'w-10 h-10' : 'w-full'}`} title={collapsed ? 'Sign Out' : undefined}>Sign Out</button>
        </div>
      </motion.aside>
    </>
  );
}
