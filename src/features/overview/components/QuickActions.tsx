"use client";
import { createElement } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { TranslateFn } from '../helpers';

/** Quick-action tiles grid card. */
export default function QuickActions({
  actions,
  onNavigate,
  t,
}: {
  actions: { label: string; icon: LucideIcon; href: string; primary: boolean }[];
  onNavigate: (href: string) => void;
  t: TranslateFn;
}) {
  return (
    <div className="theme-bg-card border theme-border-glass rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b theme-border-glass">
        <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.quick_actions')}</h3>
      </div>
      <div className="p-2 grid grid-cols-2 gap-1.5">
        {actions.map(({ label, icon: Icon, href, primary }) => (
          <button
            key={label}
            onClick={() => onNavigate(href)}
            className={`group flex flex-col items-center justify-center gap-2 h-24 rounded-lg border p-2 text-center transition-colors ${
              primary
                ? 'accent-gradient border-transparent text-white hover:opacity-90'
                : 'theme-border-glass hover:theme-bg-hover hover:border-transparent'
            }`}
          >
            <span className={`w-9 h-9 shrink-0 rounded-lg grid place-items-center ${primary ? 'bg-white/20' : 'theme-bg-glass'}`}>
              {createElement(Icon, { className: `w-4 h-4 ${primary ? 'text-white' : 'theme-text-secondary group-hover:text-[var(--accent-primary)]'} transition-colors` })}
            </span>
            <span className={`text-[11px] font-medium leading-tight ${primary ? 'text-white' : 'theme-text-primary'}`}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
