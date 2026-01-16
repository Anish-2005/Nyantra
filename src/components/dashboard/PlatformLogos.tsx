import React from 'react';
import { Database } from 'lucide-react';

// Platform logos reused from the Integrations page so the dashboard can show the same provider SVGs.
export const PlatformLogos: { [key: string]: (props: React.SVGProps<SVGSVGElement>) => JSX.Element } = {
  UIDAI: (props) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <circle cx="50" cy="50" r="45" fill="#FF9933" />
      <circle cx="50" cy="50" r="35" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="25" fill="#138808" />
      <path d="M50 25 L50 75 M35 50 L65 50" stroke="#000080" strokeWidth="3" />
    </svg>
  ),
  MeitY: (props) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <rect x="20" y="20" width="60" height="60" rx="10" fill="#1E40AF" />
      <path d="M40 35 L60 50 L40 65 Z" fill="#FFFFFF" />
    </svg>
  ),
  MHA: (props) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <rect x="25" y="25" width="50" height="50" fill="#DC2626" />
      <path d="M45 40 L55 50 L45 60 Z M55 40 L45 50 L55 60 Z" fill="#FFFFFF" />
    </svg>
  ),
  NSDL: (props) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <rect x="20" y="20" width="60" height="60" rx="5" fill="#059669" />
      <text x="50" y="55" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="bold">NSDL</text>
    </svg>
  ),
  NPCI: (props) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <circle cx="50" cy="50" r="40" fill="#2563EB" />
      <path d="M35 40 L65 40 L50 70 Z" fill="#FFFFFF" />
    </svg>
  ),
  CBDT: (props) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <rect x="25" y="25" width="50" height="50" fill="#D97706" />
      <path d="M40 40 L60 40 L60 60 L40 60 Z" fill="#FFFFFF" />
      <path d="M45 45 L55 45 L55 55 L45 55 Z" fill="#D97706" />
    </svg>
  ),
  'Ministry of Rural Development': (props) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="#16A34A" />
      <circle cx="50" cy="50" r="15" fill="#FFFFFF" />
    </svg>
  ),
  'Various State Governments': (props) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <path d="M35 35 L65 35 L65 65 L35 65 Z" fill="#9333EA" />
      <circle cx="40" cy="40" r="5" fill="#FFFFFF" />
      <circle cx="60" cy="40" r="5" fill="#FFFFFF" />
      <circle cx="50" cy="60" r="5" fill="#FFFFFF" />
    </svg>
  )
};

// Provide display names for the inline platform logo components to satisfy react/display-name
Object.entries(PlatformLogos).forEach(([k, v]) => {
  try { (v as any).displayName = `${k}Logo`; } catch { /* safe */ }
});

// Define the wrapper component with proper display name
export const PlatformLogoWrapper = ({ provider, ...props }: { provider: string } & React.SVGProps<SVGSVGElement>) => {
  const Logo = PlatformLogos[provider as keyof typeof PlatformLogos];
  if (Logo) return <Logo {...props} />;
  return <Database {...props} />;
};

PlatformLogoWrapper.displayName = 'PlatformLogoWrapper';

export const getPlatformLogo = (provider: string) => {
  const Comp = (props: React.SVGProps<SVGSVGElement>) => <PlatformLogoWrapper provider={provider} {...props} />;
  try { (Comp as any).displayName = `${provider.replace(/\s+/g, '')}_Logo`; } catch {}
  return Comp;
};