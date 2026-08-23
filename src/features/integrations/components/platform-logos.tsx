"use client";
/**
 * Provider-branded SVG logo resolver with a generic database glyph fallback.
 */
import React, { createElement } from 'react';
import { Database } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

// Real government platform logos (using SVG components)
const PlatformLogos: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  UIDAI: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <circle cx="50" cy="50" r="45" fill="#FF9933" />
      <circle cx="50" cy="50" r="35" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="25" fill="#138808" />
      <path d="M50 25 L50 75 M35 50 L65 50" stroke="#000080" strokeWidth="3" />
    </svg>
  ),
  MeitY: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <rect x="20" y="20" width="60" height="60" rx="10" fill="#1E40AF" />
      <path d="M40 35 L60 50 L40 65 Z" fill="#FFFFFF" />
    </svg>
  ),
  MHA: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <rect x="25" y="25" width="50" height="50" fill="#DC2626" />
      <path d="M45 40 L55 50 L45 60 Z M55 40 L45 50 L55 60 Z" fill="#FFFFFF" />
    </svg>
  ),
  'eCommittee, SC': (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <path d="M50 20 L80 40 L80 80 L20 80 L20 40 Z" fill="#7C3AED" />
      <circle cx="50" cy="50" r="15" fill="#FFFFFF" />
      <path d="M50 40 L50 60 M40 50 L60 50" stroke="#7C3AED" strokeWidth="3" />
    </svg>
  ),
  NSDL: (props: React.SVGProps<SVGSVGElement>) => {
    const { t } = useLocale();
    return (
      <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
        <rect x="20" y="20" width="60" height="60" rx="5" fill="#059669" />
        <text x="50" y="55" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="bold">{t('extracted.nsdl')} </text>
      </svg>
    );
  },
  NPCI: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <circle cx="50" cy="50" r="40" fill="#2563EB" />
      <path d="M35 40 L65 40 L50 70 Z" fill="#FFFFFF" />
    </svg>
  ),
  CBDT: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <rect x="25" y="25" width="50" height="50" fill="#D97706" />
      <path d="M40 40 L60 40 L60 60 L40 60 Z" fill="#FFFFFF" />
      <path d="M45 45 L55 45 L55 55 L45 55 Z" fill="#D97706" />
    </svg>
  ),
  'Ministry of Rural Development': (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="#16A34A" />
      <circle cx="50" cy="50" r="15" fill="#FFFFFF" />
      <path d="M45 45 L55 45 L55 55 L45 55 Z" fill="#16A34A" />
    </svg>
  ),
  'Various State Governments': (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <path d="M35 35 L65 35 L65 65 L35 65 Z" fill="#9333EA" />
      <circle cx="40" cy="40" r="5" fill="#FFFFFF" />
      <circle cx="60" cy="40" r="5" fill="#FFFFFF" />
      <circle cx="50" cy="60" r="5" fill="#FFFFFF" />
    </svg>
  )
};

/** Renders the matching platform logo for a provider name. */
export default function PlatformLogo({ provider }: { provider: string }) {
  const LogoComponent = PlatformLogos[provider];
  return LogoComponent
    ? createElement(LogoComponent, { className: 'w-5 h-5' })
    : createElement(Database, { className: 'w-5 h-5 theme-text-muted' });
}
