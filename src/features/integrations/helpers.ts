"use client";
import {
  Banknote, Cloud, CreditCard, Database, DollarSign, FileText, Fingerprint,
  Map as MapIcon, Scale, Shield, Users,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

// Log entry embedded in an integration document
export interface IntegrationLog {
  message: string;
  timestamp: string;
  status: string;
}

// Integration record synced from the Firestore 'integrations' collection
export interface Integration {
  id: string;
  name: string;
  provider: string;
  category: string;
  status: string;
  health: string;
  description: string;
  imageUrl: string;
  successRate: number;
  responseTime: string;
  endpoints: number;
  apiVersion: string;
  lastSync: string;
  nextSync: string;
  syncFrequency: string;
  apiKey: string;
  security: string;
  dataEncryption: string;
  documentation: string;
  compliance: string[];
  usage: { monthly: number; daily: number; errors: number };
  config: { authType: string; rateLimit: string; timeout: string };
  logs: IntegrationLog[];
  createdAt?: any;
  lastModified?: any;
}

export const INPUT_CLS =
  "w-full h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors";

export const GHOST_BTN =
  "inline-flex items-center justify-center gap-1.5 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors";

export const getStatusPillClass = (status: string) => {
  switch ((status || '').toLowerCase()) {
    case 'active': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'pending': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    default: return 'bg-red-500/10 text-red-600 dark:text-red-400';
  }
};

export const getHealthPillClass = (health: string) => {
  switch ((health || '').toLowerCase()) {
    case 'excellent': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'good': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'fair': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    default: return 'bg-red-500/10 text-red-600 dark:text-red-400';
  }
};

export const getHealthDotClass = (health: string) => {
  switch ((health || '').toLowerCase()) {
    case 'excellent': return 'bg-emerald-500';
    case 'good': return 'bg-blue-500';
    case 'fair': return 'bg-amber-500';
    default: return 'bg-red-500';
  }
};

const CATEGORY_ICONS = {
  'identity-verification': Fingerprint,
  'document-verification': FileText,
  'crime-records': Shield,
  'court-records': Scale,
  'banking-services': Banknote,
  'payment-services': CreditCard,
  'financial-verification': DollarSign,
  'social-welfare': Users,
  'state-integrations': MapIcon,
  'cloud-services': Cloud
} as const;

export const getCategoryIcon = (category: string) =>
  CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Database;

// Response time distribution shown in the integration detail drawer
export const RESPONSE_TIME_BUCKETS = [
  { range: '< 1s', percentage: 65, color: 'bg-emerald-500' },
  { range: '1-2s', percentage: 25, color: 'bg-blue-500' },
  { range: '2-3s', percentage: 7, color: 'bg-amber-500' },
  { range: '> 3s', percentage: 3, color: 'bg-red-500' }
];

// Hardened security posture summary rows
export const SECURITY_FEATURES = [
  { feature: 'TLS 1.3 Encryption', status: 'Enabled' },
  { feature: 'API Rate Limiting', status: 'Active' },
  { feature: 'IP Whitelisting', status: 'Configured' }
];

// Rolling usage trend summary rows
export const USAGE_TRENDS = [
  { period: 'Last 7 days', trend: '+12%', color: 'text-emerald-600 dark:text-emerald-400' },
  { period: 'Last 30 days', trend: '+8%', color: 'text-blue-600 dark:text-blue-400' },
  { period: 'Last 90 days', trend: '+15%', color: 'text-emerald-600 dark:text-emerald-400' }
];

// Trigger a client-side CSV download of the given integrations
export const exportIntegrationsData = (items: Integration[]) => {
  const headers = [
    'ID', 'Name', 'Provider', 'Category', 'Status', 'Health', 'Success Rate', 'Response Time', 'Endpoints', 'API Version', 'Last Sync', 'Next Sync', 'Documentation'
  ];

  const rows = items.map(i => [
    i.id,
    i.name,
    i.provider,
    i.category,
    i.status,
    i.health,
    i.successRate != null ? String(i.successRate) : '',
    i.responseTime || '',
    i.endpoints != null ? String(i.endpoints) : '',
    i.apiVersion || '',
    i.lastSync || '',
    i.nextSync || '',
    i.documentation || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `integrations_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate and download a landscape PDF report of the given integrations
export const exportIntegrationsPDF = (items: Integration[]) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
  const margin = 36;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 56, 'F');

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Integrations Report', margin, 36);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin, 28, { align: 'right' });
  doc.text(`Total: ${items.length}`, pageWidth - margin, 44, { align: 'right' });

  const head = [[ 'ID', 'Name', 'Provider', 'Category', 'Status', 'Health', 'Success Rate', 'Response Time' ]];

  const body: any[] = [];
  items.forEach(i => {
    body.push([
      i.id,
      i.name,
      i.provider,
      i.category,
      i.status,
      i.health,
      i.successRate != null ? String(i.successRate) + '%' : '',
      i.responseTime || ''
    ]);
  });

  autoTable(doc, {
    head,
    body,
    startY: 70,
    styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak', cellWidth: 'wrap' },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    margin: { left: margin, right: margin, top: 70 },
    tableWidth: 'auto',
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 180 },
      2: { cellWidth: 120 },
      3: { cellWidth: 100 },
      4: { cellWidth: 70 },
      5: { cellWidth: 70 },
      6: { cellWidth: 80 },
      7: { cellWidth: 80 }
    }
  });

  doc.save(`integrations_report_${new Date().toISOString().split('T')[0]}.pdf`);
};
