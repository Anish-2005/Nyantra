"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
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

export default function Sidebar({
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

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setOpen]);

  // Show logo only after mount to prevent SSR mismatch
  // Use same logo selection logic as root navbar
  const logoSrc = theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png';

  return (
    <>
      {/* -------------------- MOBILE SIDEBAR -------------------- */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: open ? "0%" : "-100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="fixed z-50 top-0 left-0 h-full w-[min(92vw,16rem)] max-w-[16rem] theme-bg-nav backdrop-blur-xl border-r theme-border-glass shadow-xl lg:hidden flex flex-col overflow-hidden pointer-events-auto"
      >
        {/* Header */}
        <div className="p-4 border-b theme-border-glass flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center relative">
              <Image src={logoSrc} alt="Nyantra" fill className="object-contain" />
            </div>
            <div>
              <div
                className={`text-lg font-bold ${
                  theme === "dark" ? "text-white" : "theme-text-primary"
                }`}
              >
                Nyantra
              </div>
              <div className="text-xs theme-text-muted">DBT Dashboard</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 rounded-md theme-border-glass border theme-bg-glass"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="w-4 h-4 theme-text-primary" />
          </button>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 p-3 overflow-auto min-w-0"
          role="navigation"
          aria-label="Dashboard navigation"
        >
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(item.id);
                    setOpen(false); // Close sidebar after selecting
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all min-w-0 ${
                    activeId === item.id
                      ? "accent-gradient text-white shadow-lg"
                      : "theme-text-primary hover:theme-bg-glass theme-border-glass border border-transparent hover:border"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium truncate">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {/* Footer - Logout */}
        <div className="p-3 border-t theme-border-glass">
          <button
            type="button"
            onClick={async () => {
              try {
                await signOutUser();
                router.push('/login');
              } catch {
                // ignore - AuthContext should surface errors elsewhere
              }
            }}
            className="w-full flex items-center justify-center space-x-3 p-2 rounded-lg text-sm text-red-600 border border-red-500 hover:border-red-600 hover:theme-bg-glass"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7"/></svg>
            <span className="truncate text-center flex-1">SIGN OUT</span>
          </button>
        </div>
      </motion.div>

      {/* -------------------- MOBILE OVERLAY (FIXED) -------------------- */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 lg:hidden pointer-events-none"
        >
          <div
            className="absolute inset-0 bg-black/40 pointer-events-auto"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        </motion.div>
      )}

      {/* -------------------- DESKTOP SIDEBAR -------------------- */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`hidden lg:flex lg:flex-col fixed top-0 left-0 h-full transition-all duration-300 theme-bg-nav backdrop-blur-xl border-r theme-border-glass shadow-md z-30 min-w-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b theme-border-glass flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center relative">
                  <Image src={logoSrc} alt="Nyantra" width={30} height={30} className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <div
                    className={`text-lg font-bold ${
                      theme === "dark" ? "text-white" : "theme-text-primary"
                    }`}
                  >
                    Nyantra
                  </div>
                  <div className="text-xs theme-text-muted">DBT Dashboard</div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center relative">
              <Image src={logoSrc} alt="Nyantra" width={24} height={24} className="w-6 h-6 object-contain" />
            </div>
          )}
          
          {/* Collapse Toggle - Only show when not collapsed */}
          {!collapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1 rounded-md theme-border-glass border theme-bg-glass hover:theme-bg-hover transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-3 h-3 theme-text-primary" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-auto min-w-0">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onChange(item.id)}
                  className={`w-full flex items-center rounded-lg transition-all min-w-0 ${
                    collapsed ? 'justify-center p-3' : 'space-x-3 p-3'
                  } ${
                    activeId === item.id
                      ? "accent-gradient text-white shadow-lg"
                      : "theme-text-primary hover:theme-bg-glass theme-border-glass border border-transparent hover:border"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Expand Button - Only show when collapsed */}
        {collapsed && onToggleCollapse && (
          <div className="p-3 border-t theme-border-glass">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center p-2 rounded-lg theme-bg-glass border theme-border-glass hover:theme-bg-hover transition-colors"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4 theme-text-primary" />
            </button>
          </div>
        )}

        {/* Footer - Logout */}
        <div className={`p-3 border-t theme-border-glass ${collapsed ? 'flex justify-center' : ''}`}>
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
            className={`flex items-center justify-center space-x-3 p-2 rounded-lg text-sm text-red-600 border border-red-500 hover:border-red-600 hover:theme-bg-glass ${
              collapsed ? 'w-10 h-10' : 'w-full'
            }`}
            title={collapsed ? "Sign Out" : undefined}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7"/>
            </svg>
            {!collapsed && (
              <span className="truncate text-center flex-1">SIGN OUT</span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}