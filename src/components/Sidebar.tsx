"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Image from "next/image";
type NavItem = { id: string; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> };

type Props = {
    items: NavItem[];
    activeId: string;
    onChange: (id: string) => void;
    open: boolean;
    setOpen: (v: boolean) => void;
};

export default function Sidebar({ items, activeId, onChange, open, setOpen }: Props) {
    const { theme } = useTheme();

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [setOpen]);

    return (
        <>
            {/* -------------------- MOBILE SIDEBAR -------------------- */}
            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: open ? "0%" : "-100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="fixed z-50 top-0 left-0 h-full w-64 theme-bg-nav backdrop-blur-xl border-r theme-border-glass shadow-xl lg:hidden flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-4 border-b theme-border-glass flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center">
                            {/* Theme-aware logo image */}
                            <div className="w-6 h-6 relative">
                                <Image
                                    src={theme === "dark" ? "/Logo-Dark.png" : "/Logo-Light.png"}
                                    alt="Nyantara"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        <div>
                            <div className={`text-lg font-bold ${theme === "dark" ? "text-white" : "theme-text-primary"}`}>Nyantara</div>

                            <div className="text-xs theme-text-muted">DBT Dashboard</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-2 rounded-md theme-border-glass border theme-bg-glass"
                    >
                        <ChevronLeft className="w-4 h-4 theme-text-primary" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 overflow-auto">
                    <ul className="space-y-2">
                        {items.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => {
                                        onChange(item.id);
                                        setOpen(false); // Close sidebar on mobile after selection
                                    }}
                                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${activeId === item.id
                                            ? "accent-gradient text-white shadow-lg"
                                            : "theme-text-primary hover:theme-bg-glass theme-border-glass border border-transparent hover:border"
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </motion.div>

            {/* Overlay for mobile */}
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* -------------------- DESKTOP SIDEBAR -------------------- */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="hidden lg:flex lg:flex-col fixed top-0 left-0 h-full w-64 theme-bg-nav backdrop-blur-xl border-r theme-border-glass shadow-md z-30"
            >
                {/* Header */}
                <div className="p-4 border-b theme-border-glass flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center">
                            {/* Theme-aware logo image */}
                            <Image
                                src={theme === "dark" ? "/Logo-Dark.png" : "/Logo-Light.png"}
                                alt="Nyantara"
                                width={24}
                                height={24}
                                className="w-6 h-6 object-contain"
                            />
                        </div>
                        <div>
                            <div className={`text-lg font-bold ${theme === "dark" ? "text-white" : "theme-text-primary"}`}>Nyantara</div>
                            <div className="text-xs theme-text-muted">DBT Dashboard</div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 overflow-auto">
                    <ul className="space-y-2">
                        {items.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => onChange(item.id)}
                                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${activeId === item.id
                                            ? "accent-gradient text-white shadow-lg"
                                            : "theme-text-primary hover:theme-bg-glass theme-border-glass border border-transparent hover:border"
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </motion.aside>
        </>
    );
}