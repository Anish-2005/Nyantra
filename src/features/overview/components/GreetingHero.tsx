"use client";
import { Plus } from 'lucide-react';
import type { TranslateFn } from '../helpers';

/** Greeting hero: time-aware greeting, localized long date and primary CTA button. */
export default function GreetingHero({
  userName,
  locale,
  primaryHref,
  primaryLabel,
  onNavigate,
  t,
}: {
  userName: string;
  locale: string;
  primaryHref: string;
  primaryLabel: string;
  onNavigate: (href: string) => void;
  t: TranslateFn;
}) {
  // Greeting + localized long date (client-only render paths)
  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? 'extracted.good_morning' : hour < 17 ? 'extracted.good_afternoon' : 'extracted.good_evening';
  const firstName = (userName || '').split(' ')[0];
  const dateLabel = new Date().toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <section className="theme-bg-card theme-border-glass border rounded-xl relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-0.5 accent-gradient" aria-hidden="true" />
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full pointer-events-none opacity-[0.07]" style={{ background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)' }} aria-hidden="true" />
      <div className="relative p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
            {t(greetingKey)}, <span className="text-accent-gradient">{firstName || '…'}</span>
          </h1>
          <p className="text-xs theme-text-muted mt-0.5 capitalize">{dateLabel} · {t('extracted.track_applications')}</p>
        </div>
        <button
          onClick={() => onNavigate(primaryHref)}
          className="hidden sm:inline-flex h-9 px-3.5 accent-gradient text-white rounded-md text-xs font-semibold items-center gap-1.5 hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          {primaryLabel}
        </button>
      </div>
      <button
        onClick={() => onNavigate(primaryHref)}
        className="sm:hidden mx-5 mb-5 h-9 accent-gradient text-white rounded-md text-xs font-semibold inline-flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        {primaryLabel}
      </button>
    </section>
  );
}
