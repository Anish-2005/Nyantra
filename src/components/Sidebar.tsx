"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type NavItem = { id: string; label: string; icon: any };

type Props = {
  items: NavItem[];
  activeId: string;
  onChange: (id: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

export default function Sidebar({ items, activeId, onChange, open, setOpen }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setOpen]);

  return (
    <div style={{ ['--sidebar-width' as any]: open ? '16rem' : '0' }}>
      {/* Overlay for mobile (covers only to the right of the sidebar using the shared CSS variable) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        // overlay only covers the area to the right of the sidebar so it doesn't block sidebar buttons
        className={`fixed top-0 bottom-0 right-0 lg:hidden ${open ? 'pointer-events-auto z-40' : 'pointer-events-none'}`}
        style={{
          left: open ? 'var(--sidebar-width)' : '100%',
          background: open ? 'rgba(0,0,0,0.4)' : 'transparent'
        }}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <motion.aside
        // slide using percent so it's robust across screen sizes
        initial={{ x: '-100%' }}
        animate={{ x: open ? '0%' : '-100%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        // Keep the sidebar fixed on desktop so it doesn't scroll with content.
        className={`fixed z-50 top-0 left-0 h-full theme-bg-nav backdrop-blur-xl border-r theme-border-glass flex flex-col ${open ? 'w-64' : 'w-0'} lg:w-80 overflow-hidden`}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="p-4 border-b theme-border-glass flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${open ? '' : 'justify-center w-full'}`}>
            <div className={`${open ? 'w-10 h-10' : 'w-8 h-8'} bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center`}> 
              {/* Logo placeholder */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 8H9L12 2Z" fill="white" />
              </svg>
            </div>
            {open && <div>
              <div className="text-lg font-bold text-accent-gradient">Nyantara</div>
              <div className="text-xs theme-text-muted">DBT Dashboard</div>
            </div>}
          </div>

          <button
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md theme-bg-glass theme-border-glass border"
          >
            {open ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-3 overflow-auto">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onChange(item.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${activeId === item.id ? 'accent-gradient text-white shadow-lg' : 'theme-text-secondary hover:theme-bg-glass'}`}
                >
                  <item.icon className="w-5 h-5" />
                  {open && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t theme-border-glass">
          <div className={`flex items-center ${open ? 'space-x-3' : 'justify-center'}`}>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white`}>U</div>
            {open && <div className="min-w-0">
              <div className="text-sm font-medium theme-text-primary truncate">District Officer</div>
              <div className="text-xs theme-text-muted truncate">Patna Division</div>
            </div>}
          </div>
        </div>
      </motion.aside>

      

      {/* Floating opener for desktop when sidebar is collapsed */}
      {!open && (
        <button
          aria-label="Open sidebar"
          onClick={() => setOpen(true)}
          // place at extreme left and protrude half off-screen
          className="hidden lg:flex items-center justify-center fixed top-4 left-0 z-50 w-8 h-8 rounded-r-md theme-bg-glass theme-border-glass border shadow-sm"
          style={{ transform: 'translateX(-50%)' }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
    </>
  );
}
