'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

const fadeRise = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  amount?: number;
}

export function Reveal({ children, delay = 0, className, amount = 0.25 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: fadeRise.hidden,
        visible: { ...fadeRise.visible, transition: { duration: 0.5, ease: EASE, delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  stagger = 0.06,
  amount = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: fadeRise.hidden,
        visible: { ...fadeRise.visible, transition: { duration: 0.45, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

interface SectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  divided?: boolean;
}

export function Section({ id, children, className = '', divided }: SectionProps) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-16 ${divided ? 'border-t theme-border-glass' : ''} ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  eyebrow: string;
  eyebrowIcon?: LucideIcon;
  title: string;
  highlight?: string;
  highlightBreak?: boolean;
  lede?: string;
  align?: 'center' | 'left';
}

export function SectionHeader({
  eyebrow,
  eyebrowIcon: Icon,
  title,
  highlight,
  highlightBreak,
  lede,
  align = 'center',
}: SectionHeaderProps) {
  const centered = align === 'center';
  return (
    <Reveal className={`${centered ? 'text-center mx-auto' : 'text-left'} max-w-2xl mb-10 md:mb-12`}>
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] theme-bg-glass theme-border-glass border theme-text-secondary">
        {Icon && <Icon className="w-3 h-3 text-accent-gradient" />}
        {eyebrow}
      </span>
      <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight theme-text-primary leading-tight">
        {title}
        {highlight && (
          <>
            {' '}
            <span className={highlightBreak ? 'block' : 'inline'}>{highlight}</span>
          </>
        )}
        {!highlight && <span className="text-accent-gradient">.</span>}
      </h2>
      {lede && (
        <p
          className={`mt-3 text-sm sm:text-base theme-text-secondary leading-relaxed ${
            centered ? 'mx-auto max-w-xl' : 'max-w-xl'
          }`}
        >
          {lede}
        </p>
      )}
    </Reveal>
  );
}

export function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`theme-bg-card theme-border-card border backdrop-blur-xl rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.15)] ${className}`}
    >
      {children}
    </div>
  );
}

type Tone = 'accent' | 'blue' | 'indigo' | 'green' | 'teal' | 'amber' | 'purple' | 'pink';

const TONE_GRADIENTS: Record<Tone, string> = {
  accent: 'from-[var(--accent-primary)] to-[var(--accent-secondary)]',
  blue: 'from-blue-500 to-indigo-500',
  indigo: 'from-indigo-500 to-violet-500',
  green: 'from-emerald-500 to-teal-500',
  teal: 'from-teal-400 to-cyan-500',
  amber: 'from-amber-400 to-orange-500',
  purple: 'from-violet-500 to-purple-500',
  pink: 'from-pink-500 to-rose-500',
};

interface IconChipProps {
  icon: LucideIcon;
  tone?: Tone;
  size?: 'sm' | 'md';
  shape?: 'rounded' | 'pill';
}

export function IconChip({ icon: Icon, tone = 'accent', size = 'sm', shape = 'rounded' }: IconChipProps) {
  const dims =
    size === 'sm'
      ? shape === 'pill'
        ? 'w-8 h-8 rounded-full'
        : 'w-8 h-8 rounded-lg'
      : shape === 'pill'
        ? 'w-10 h-10 rounded-full'
        : 'w-10 h-10 rounded-lg';
  const iconDims = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className={`${dims} shrink-0 bg-gradient-to-br ${TONE_GRADIENTS[tone]} flex items-center justify-center shadow-sm`}>
      <Icon className={`${iconDims} text-white`} />
    </div>
  );
}
