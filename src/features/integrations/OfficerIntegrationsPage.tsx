"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  Search, Download, Plus, X,
  RefreshCw,
  Shield, Scale,
  Banknote, Fingerprint, CreditCard,
  Users, Map as MapIcon,
  Database, Cloud,
  ExternalLink,
  FileText, DollarSign,
  Wifi, Edit,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { collection, doc, onSnapshot, updateDoc, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Shared minimal primitives (cloned from NewApplicationDrawer conventions)
const inputCls = "w-full h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors";

const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1">{children}</label>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">{children}</h3>
);

const DefPair = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="min-w-0">
        <dt className="text-[11px] uppercase tracking-wider theme-text-muted">{label}</dt>
        <dd className="text-[13px] font-medium theme-text-primary mt-0.5 truncate">{children}</dd>
    </div>
);

const StatCell = ({ label, value, dot, hint }: { label: string; value: React.ReactNode; dot?: string; hint?: string }) => (
    <div className="theme-bg-card p-3.5 min-w-0">
        <div className="flex items-center gap-1.5">
            {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />}
            <span className="text-[11px] uppercase tracking-wider theme-text-muted truncate">{label}</span>
        </div>
        <p className="text-xl font-semibold tabular-nums theme-text-primary mt-1 truncate">{value}</p>
        {hint && <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">{hint}</p>}
    </div>
);

const getStatusPillClass = (status: string) => {
    switch ((status || '').toLowerCase()) {
        case 'active': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
        case 'pending': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
        default: return 'bg-red-500/10 text-red-600 dark:text-red-400';
    }
};

const getHealthPillClass = (health: string) => {
    switch ((health || '').toLowerCase()) {
        case 'excellent': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
        case 'good': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
        case 'fair': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
        default: return 'bg-red-500/10 text-red-600 dark:text-red-400';
    }
};

const getHealthDotClass = (health: string) => {
    switch ((health || '').toLowerCase()) {
        case 'excellent': return 'bg-emerald-500';
        case 'good': return 'bg-blue-500';
        case 'fair': return 'bg-amber-500';
        default: return 'bg-red-500';
    }
};

// Real government platform logos (using SVG components)
const PlatformLogos = {
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

interface IntegrationDrawerProps {
  integration: any;
  draft: any;
  isEditing: boolean;
  isAdding: boolean;
  onDraftChange: React.Dispatch<React.SetStateAction<any>>;
  onClose: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onAdd: () => void;
  onTestConnection: (id: string) => void;
  onSyncNow: (id: string) => void;
  onStartEdit: () => void;
  getPlatformLogo: (provider: string) => React.ReactNode;
}

const ghostBtn = "inline-flex items-center justify-center gap-1.5 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors";

const IntegrationDrawer = ({
  integration,
  draft,
  isEditing,
  isAdding,
  onDraftChange,
  onClose,
  onCancelEdit,
  onSave,
  onAdd,
  onTestConnection,
  onSyncNow,
  onStartEdit,
  getPlatformLogo
}: IntegrationDrawerProps) => {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll + close on Escape while drawer is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!mounted) return null;

  const setField = (field: string, value: string) =>
    onDraftChange((prev: any) => ({ ...prev, [field]: value }));

  const setConfigField = (field: string, value: string) =>
    onDraftChange((prev: any) => ({ ...prev, config: { ...(prev.config || {}), [field]: value } }));

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-[60]"
      />

      {/* Panel */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-y-0 right-0 w-full max-w-md z-[70] theme-drawer backdrop-blur-2xl border-l theme-border-glass flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {!isAdding && !isEditing && integration && (
              <span className="w-6 h-6 rounded overflow-hidden flex items-center justify-center shrink-0">
                {getPlatformLogo(integration.provider)}
              </span>
            )}
            <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">
              {isAdding ? t('extracted.new_integration') : isEditing ? t('extracted.edit_config') : integration?.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {isAdding || isEditing ? (
            <>
              {/* Overview form */}
              <section>
                <SectionTitle>{t('extracted.integration_overview')}</SectionTitle>
                <div className="space-y-3">
                  <div>
                    <Label>Name</Label>
                    <input
                      value={draft.name}
                      onChange={(e) => setField('name', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <Label>Provider</Label>
                    <input
                      value={draft.provider}
                      onChange={(e) => setField('provider', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select
                      value={draft.category}
                      onChange={(e) => setField('category', e.target.value)}
                      className={inputCls}
                    >
                      <option value="identity-verification">Identity Verification</option>
                      <option value="document-verification">Document Verification</option>
                      <option value="payment-services">Payment Services</option>
                      <option value="banking-services">Banking Services</option>
                      <option value="crime-records">Crime Records</option>
                      <option value="court-records">Court Records</option>
                      <option value="financial-verification">Financial Verification</option>
                      <option value="social-welfare">Social Welfare</option>
                      <option value="state-integrations">State Integrations</option>
                      <option value="cloud-services">Cloud Services</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Status</Label>
                      <select
                        value={draft.status}
                        onChange={(e) => setField('status', e.target.value)}
                        className={inputCls}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    <div>
                      <Label>Health</Label>
                      <select
                        value={draft.health}
                        onChange={(e) => setField('health', e.target.value)}
                        className={inputCls}
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Image URL</Label>
                    <input
                      value={draft.imageUrl || ''}
                      onChange={(e) => setField('imageUrl', e.target.value)}
                      className={inputCls}
                      placeholder="https://example.com/image.png"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <textarea
                      value={draft.description}
                      onChange={(e) => setField('description', e.target.value)}
                      className={`${inputCls} h-auto py-2`}
                      rows={4}
                    />
                  </div>
                </div>
              </section>

              {/* API Configuration form */}
              <section className="pt-4 border-t theme-border-glass">
                <SectionTitle>{t('extracted.api_configuration_1')}</SectionTitle>
                <div className="space-y-3">
                  <div>
                    <Label>Auth Type</Label>
                    <input
                      value={draft.config?.authType || ''}
                      onChange={(e) => setConfigField('authType', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <Label>Rate Limit</Label>
                    <input
                      value={draft.config?.rateLimit || ''}
                      onChange={(e) => setConfigField('rateLimit', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <Label>Timeout</Label>
                    <input
                      value={draft.config?.timeout || ''}
                      onChange={(e) => setConfigField('timeout', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Overview */}
              <section>
                <SectionTitle>{t('extracted.integration_overview')}</SectionTitle>
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusPillClass(integration.status)}`}>
                    {String(integration.status).toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getHealthPillClass(integration.health)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getHealthDotClass(integration.health)}`} />
                    {String(integration.health).toUpperCase()}
                  </span>
                </div>
                <p className="text-xs theme-text-muted leading-relaxed mb-3">{integration.description}</p>
                {integration.documentation && (
                  <a
                    href={integration.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${ghostBtn} h-8 px-3`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {t('extracted.view_api_documentation')}
                  </a>
                )}
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
                  <DefPair label={t('extracted.provider_1') || 'Provider'}>{integration.provider}</DefPair>
                  <DefPair label="ID"><span className="font-mono text-xs">{integration.id}</span></DefPair>
                  <DefPair label={t('extracted.category_1')}>
                    {String(integration.category).split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </DefPair>
                  <DefPair label={t('extracted.frequency')}><span className="capitalize">{integration.syncFrequency}</span></DefPair>
                  <DefPair label={t('extracted.last_sync')}><span className="font-mono text-xs">{integration.lastSync || '—'}</span></DefPair>
                  <DefPair label={t('extracted.next_sync')}><span className="font-mono text-xs">{integration.nextSync || '—'}</span></DefPair>
                </dl>
              </section>

              {/* Metrics */}
              <section className="pt-4 border-t theme-border-glass">
                <SectionTitle>{t('extracted.performance')}</SectionTitle>
                <div className="grid grid-cols-2 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
                  <StatCell label={t('extracted.success_rate')} value={`${integration.successRate}%`} dot="bg-emerald-500" />
                  <StatCell label={t('extracted.response')} value={integration.responseTime} dot="bg-blue-500" />
                  <StatCell label={t('extracted.endpoints')} value={integration.endpoints} dot="bg-violet-500" />
                  <StatCell label={t('extracted.api_version')} value={integration.apiVersion} dot="bg-amber-500" />
                </div>
              </section>

              {/* Usage statistics */}
              <section className="pt-4 border-t theme-border-glass">
                <SectionTitle>{t('extracted.usage_statistics_1')}</SectionTitle>
                <div className="grid grid-cols-3 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
                  <StatCell label={t('extracted.monthly_requests')} value={(integration.usage?.monthly ?? 0).toLocaleString()} />
                  <StatCell label={t('extracted.daily_average')} value={(integration.usage?.daily ?? 0).toLocaleString()} />
                  <StatCell label={t('extracted.error_count')} value={integration.usage?.errors ?? 0} />
                </div>
              </section>

              {/* API Configuration */}
              <section className="pt-4 border-t theme-border-glass">
                <SectionTitle>{t('extracted.api_configuration_1')}</SectionTitle>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <DefPair label={t('extracted.authentication_type')}>{integration.config?.authType || '—'}</DefPair>
                  <DefPair label={t('extracted.rate_limit')}>{integration.config?.rateLimit || '—'}</DefPair>
                  <DefPair label={t('extracted.timeout')}>{integration.config?.timeout || '—'}</DefPair>
                  <DefPair label={t('extracted.api_version')}>{integration.apiVersion}</DefPair>
                </dl>
              </section>

              {/* API Credentials */}
              <section className="pt-4 border-t theme-border-glass">
                <SectionTitle>{t('extracted.api_credentials')}</SectionTitle>
                <div className="flex items-center gap-2">
                  <code className="flex-1 min-w-0 px-2.5 py-2 rounded-md border theme-border-glass theme-bg-input text-xs font-mono theme-text-primary break-all">
                    {integration.apiKey || '—'}
                  </code>
                  <button
                    aria-label="Rotate key"
                    className="h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-md border theme-border-glass theme-text-secondary hover:theme-bg-glass transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>

              {/* Security & Compliance */}
              <section className="pt-4 border-t theme-border-glass">
                <SectionTitle>{t('extracted.security_compliance')}</SectionTitle>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 mb-3">
                  <DefPair label={t('extracted.certification')}>{integration.security || '—'}</DefPair>
                  <DefPair label={t('extracted.encryption')}>{integration.dataEncryption || '—'}</DefPair>
                </dl>
                <div className="flex flex-wrap gap-1.5">
                  {(integration.compliance ?? []).map((comp: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {comp}
                    </span>
                  ))}
                </div>
              </section>

              {/* Response Time Distribution */}
              <section className="pt-4 border-t theme-border-glass">
                <SectionTitle>{t('extracted.response_time_distribution_1')}</SectionTitle>
                <div className="space-y-2.5">
                  {[
                    { range: '< 1s', percentage: 65, color: 'bg-emerald-500' },
                    { range: '1-2s', percentage: 25, color: 'bg-blue-500' },
                    { range: '2-3s', percentage: 7, color: 'bg-amber-500' },
                    { range: '> 3s', percentage: 3, color: 'bg-red-500' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-12 text-[11px] theme-text-muted tabular-nums shrink-0">{item.range}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                      </div>
                      <span className="w-9 text-right text-[11px] font-semibold tabular-nums theme-text-primary shrink-0">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Security Features */}
              <section className="pt-4 border-t theme-border-glass">
                <SectionTitle>{t('extracted.security_features_1')}</SectionTitle>
                <div>
                  {[
                    { feature: 'TLS 1.3 Encryption', status: 'Enabled' },
                    { feature: 'API Rate Limiting', status: 'Active' },
                    { feature: 'IP Whitelisting', status: 'Configured' }
                  ].map((item, idx) => (
                    <div key={idx} className="py-2 border-b theme-border-glass last:border-0 flex items-center justify-between">
                      <span className="text-xs theme-text-primary">{item.feature}</span>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{item.status}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Logs */}
              <section className="pt-4 border-t theme-border-glass">
                <SectionTitle>{t('extracted.recent_activity_logs')}</SectionTitle>
                <div>
                  {(integration.logs ?? []).map(
                    (
                      log: { message: string; timestamp: string; status: string },
                      idx: number
                    ) => (
                      <div key={idx} className="py-2 border-b theme-border-glass last:border-0 flex items-start gap-2.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                            log.status === 'success'
                              ? 'bg-emerald-500'
                              : log.status === 'error'
                              ? 'bg-red-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <p className="flex-1 min-w-0 text-xs font-mono theme-text-primary break-words">{log.message}</p>
                        <span className="text-[11px] theme-text-muted tabular-nums shrink-0">{log.timestamp}</span>
                        <span
                          className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                            log.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : log.status === 'error'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                    )
                  )}
                  {(integration.logs ?? []).length === 0 && (
                    <p className="text-xs theme-text-muted py-2">{t('extracted.all_activities')}</p>
                  )}
                </div>
              </section>

              {/* Analytics */}
              <section className="pt-4 border-t theme-border-glass">
                <SectionTitle>{t('extracted.analytics')}</SectionTitle>
                <div className="grid grid-cols-2 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
                  <StatCell label="Total API Calls" value="2.4M" />
                  <StatCell label="Avg Daily Usage" value="8.2K" />
                  <StatCell label="Peak Concurrent" value="142" />
                  <StatCell label="Data Processed" value="4.7GB" />
                </div>
                <div className="mt-3">
                  <p className="text-[11px] uppercase tracking-wider theme-text-muted mb-1">{t('extracted.usage_trends_30d')}</p>
                  <div>
                    {[
                      { period: 'Last 7 days', trend: '+12%', color: 'text-emerald-600 dark:text-emerald-400' },
                      { period: 'Last 30 days', trend: '+8%', color: 'text-blue-600 dark:text-blue-400' },
                      { period: 'Last 90 days', trend: '+15%', color: 'text-emerald-600 dark:text-emerald-400' }
                    ].map((trend, idx) => (
                      <div key={idx} className="py-2 border-b theme-border-glass last:border-0 flex items-center justify-between">
                        <span className="text-xs theme-text-muted">{trend.period}</span>
                        <span className={`text-xs font-semibold tabular-nums ${trend.color}`}>{trend.trend}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.performance_score')}</span>
                  <span className="text-lg font-semibold tabular-nums theme-text-primary">94%</span>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t theme-border-glass flex items-center gap-2 shrink-0">
          {isAdding ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 h-9 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors"
              >
                {t('extracted.cancel')}
              </button>
              <button
                onClick={onAdd}
                className="flex-1 h-9 accent-gradient text-white rounded-md inline-flex items-center justify-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Integration
              </button>
            </>
          ) : isEditing ? (
            <>
              <button
                onClick={onCancelEdit}
                className="flex-1 h-9 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors"
              >
                {t('extracted.cancel')}
              </button>
              <button
                onClick={onSave}
                className="flex-1 h-9 accent-gradient text-white rounded-md inline-flex items-center justify-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onTestConnection(integration.id)}
                className={`${ghostBtn} flex-1 h-9`}
              >
                <Wifi className="w-3.5 h-3.5" />
                {t('extracted.test')}
              </button>
              <button
                onClick={() => onSyncNow(integration.id)}
                className={`${ghostBtn} flex-1 h-9`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('extracted.sync')}
              </button>
              <button
                onClick={onStartEdit}
                className={`${ghostBtn} flex-1 h-9`}
              >
                <Edit className="w-3.5 h-3.5" />
                {t('extracted.edit')}
              </button>
            </>
          )}
        </div>
      </motion.aside>
    </>,
    document.body
  );
};

const IntegrationsPage = () => {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [sortBy] = useState('name');
  const [sortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedIntegration, setSelectedIntegration] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  // Firestore-backed integrations state
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedIntegration, setEditedIntegration] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Subscribe to Firestore 'integrations' collection
  useEffect(() => {
    const q = query(collection(db, 'integrations'), orderBy('name'));
    const unsub = onSnapshot(q, (snap) => {
      const items: any[] = snap.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: data.name || 'Unnamed Integration',
          provider: data.provider || 'Unknown Provider',
          category: data.category || 'identity-verification',
          status: data.status || 'active',
          health: data.health || 'good',
          description: data.description || 'No description available',
          imageUrl: data.imageUrl || '',
          successRate: data.successRate || 100,
          responseTime: data.responseTime || '1s',
          endpoints: data.endpoints || 1,
          apiVersion: data.apiVersion || '1.0',
          lastSync: data.lastSync || '',
          nextSync: data.nextSync || '',
          syncFrequency: data.syncFrequency || 'hourly',
          apiKey: data.apiKey || '',
          security: data.security || '',
          dataEncryption: data.dataEncryption || '',
          documentation: data.documentation || '',
          compliance: data.compliance || [],
          usage: data.usage || { monthly: 0, daily: 0, errors: 0 },
          config: data.config || { authType: '', rateLimit: '', timeout: '' },
          logs: data.logs || [],
          createdAt: data.createdAt,
          lastModified: data.lastModified
        };
      });
      setIntegrations(items);
      setLoadingIntegrations(false);
    }, (err) => {
      console.error('Integrations snapshot error', err);
      setLoadingIntegrations(false);
    });

    return () => unsub();
  }, []);

  const saveIntegration = async (id: string, updates: any) => {
    try {
      const updateData: any = { lastModified: serverTimestamp() };
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined && key !== 'id' && key !== 'createdAt') {
          updateData[key] = updates[key];
        }
      });
      await updateDoc(doc(db, 'integrations', id), updateData);
    } catch (e) {
      console.error('Failed to save integration', e);
      throw e;
    }
  };

  const addIntegration = async (integration: any) => {
    try {
      await addDoc(collection(db, 'integrations'), { ...integration, createdAt: serverTimestamp() });
    } catch (e) {
      console.error('Failed to add integration', e);
      throw e;
    }
  };

  // Export helpers (CSV + PDF) for integrations
  const exportIntegrationsData = (items: any[]) => {
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

  const exportIntegrationsPDF = (items: any[]) => {
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

  // Filter and sort integrations (use live Firestore data)
  const dataSource = integrations;

  const filteredIntegrations = useMemo(() => {
    let filtered = [...dataSource];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((integration) =>
        integration.name.toLowerCase().includes(q) ||
        integration.provider.toLowerCase().includes(q) ||
        integration.category.toLowerCase().includes(q) ||
        String(integration.id).toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((integration) => integration.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((integration) => integration.category === categoryFilter);
    }

    if (healthFilter !== 'all') {
      filtered = filtered.filter((integration) => integration.health === healthFilter);
    }

    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];

      // simple fallback to avoid weird comparisons
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [
    dataSource,
    searchQuery,
    statusFilter,
    categoryFilter,
    healthFilter,
    sortBy,
    sortOrder,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredIntegrations.length / itemsPerPage);
  const paginatedIntegrations = filteredIntegrations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = dataSource.length;
    const active = dataSource.filter((i) => i.status === 'active').length;
    const totalEndpoints = dataSource.reduce(
      (sum: number, i: any) => sum + (i.endpoints || 0),
      0
    );
    const avgSuccessRate =
      dataSource.reduce(
        (sum: number, i: any) => sum + (Number(i.successRate) || 0),
        0
      ) / Math.max(1, total);

    return {
      active,
      totalEndpoints,
      avgSuccessRate: Math.round(avgSuccessRate * 10) / 10,
    };
  }, [dataSource]);

  // Category distribution
  const categoryStats = useMemo(() => {
    const categories = {
      'identity-verification': dataSource.filter(i => i.category === 'identity-verification').length,
      'document-verification': dataSource.filter(i => i.category === 'document-verification').length,
      'crime-records': dataSource.filter(i => i.category === 'crime-records').length,
      'court-records': dataSource.filter(i => i.category === 'court-records').length,
      'banking-services': dataSource.filter(i => i.category === 'banking-services').length,
      'payment-services': dataSource.filter(i => i.category === 'payment-services').length,
      'financial-verification': dataSource.filter(i => i.category === 'financial-verification').length,
      'social-welfare': dataSource.filter(i => i.category === 'social-welfare').length,
      'state-integrations': dataSource.filter(i => i.category === 'state-integrations').length,
      'cloud-services': dataSource.filter(i => i.category === 'cloud-services').length
    };
    return categories;
  }, [dataSource]);

  const getCategoryIcon = (category: string) => {
    const icons = {
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
    };
    return icons[category as keyof typeof icons] || Database;
  };

  const getPlatformLogo = (provider: string) => {
    const LogoComponent = PlatformLogos[provider as keyof typeof PlatformLogos];
    return LogoComponent ? <LogoComponent className="w-5 h-5" /> : <Database className="w-5 h-5 theme-text-muted" />;
  };

  const handleTestConnection = (integrationId: string) => {
    console.log(`Testing connection for integration: ${integrationId}`);
  };

  const handleSyncNow = (integrationId: string) => {
    console.log(`Manual sync triggered for integration: ${integrationId}`);
  };

  const beginAddIntegration = () => {
    setEditedIntegration({ name: '', provider: '', category: 'identity-verification', status: 'active', health: 'good', lastSync: '', nextSync: '', syncFrequency: 'hourly', successRate: 100, responseTime: '1s', apiVersion: '1.0', endpoints: 1, description: '', documentation: '', apiKey: '', security: '', dataEncryption: '', compliance: [], usage: { monthly: 0, daily: 0, errors: 0 }, config: { authType: '', rateLimit: '', timeout: '' }, logs: [], imageUrl: '' });
    setIsAdding(true);
  };

  const closeDetail = () => {
    setSelectedIntegration(null);
    setIsAdding(false);
    setIsEditing(false);
    setEditedIntegration(null);
  };

  const startEditSelected = () => {
    if (selectedIntegration) {
      setEditedIntegration({ ...selectedIntegration });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedIntegration) return;
    try {
      await saveIntegration(editedIntegration.id, editedIntegration);
      setIsEditing(false);
      setEditedIntegration(null);
      setSelectedIntegration(editedIntegration);
    } catch (e) {
      console.error('Save failed', e);
    }
  };

  const handleAddNew = async () => {
    if (!editedIntegration) return;
    try {
      await addIntegration(editedIntegration);
      setIsAdding(false);
      setEditedIntegration(null);
      setSelectedIntegration(null);
    } catch (e) {
      console.error('Add failed', e);
    }
  };

  const statBand = [
    { labelKey: 'extracted.active', value: stats.active, dot: 'bg-emerald-500' },
    { labelKey: 'extracted.endpoints', value: stats.totalEndpoints, dot: 'bg-blue-500' },
    { labelKey: 'extracted.success_rate', value: `${stats.avgSuccessRate}%`, dot: 'bg-violet-500' },
    { labelKey: 'extracted.response', value: '< 2s', dot: 'bg-amber-500' }
  ];

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
            {t('extracted.integration')} <span className="text-accent-gradient">{t('extracted.monitoring_center')}</span>
          </h1>
          <p className="text-xs theme-text-muted mt-0.5 truncate">
            {t('extracted.realtime_integration_tracking_description')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`h-9 px-3 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'accent-gradient text-white'
                  : 'border theme-border-glass theme-text-secondary hover:theme-bg-glass'
              }`}
            >
              {t('extracted.grid')}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`h-9 px-3 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'accent-gradient text-white'
                  : 'border theme-border-glass theme-text-secondary hover:theme-bg-glass'
              }`}
            >
              {t('extracted.list')}
            </button>
          </div>
          <button
            aria-label={t('extracted.export_report_1')}
            onClick={() => setShowExportModal(true)}
            className="h-9 px-3 rounded-md border theme-border-glass inline-flex items-center gap-1.5 text-xs font-semibold theme-text-secondary hover:theme-bg-glass hover:theme-text-primary transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('extracted.export_data')}</span>
          </button>
          <button
            onClick={beginAddIntegration}
            className="h-9 px-3.5 accent-gradient text-white rounded-md inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('extracted.new_integration')}</span>
          </button>
        </div>
      </div>

      {/* Stats hairline band */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
        {statBand.map((stat) => (
          <div key={stat.labelKey} className="theme-bg-card p-3.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${stat.dot}`} />
              <span className="text-[11px] uppercase tracking-wider theme-text-muted truncate">{t(stat.labelKey)}</span>
            </div>
            <p className="text-xl font-semibold tabular-nums theme-text-primary mt-1 truncate">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search Box */}
          <div className="theme-bg-card theme-border-glass border rounded-lg p-3.5 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">{t('extracted.search_filter')}</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder={t('extracted.search_integrations')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputCls} pl-8`}
              />
            </div>

            {/* Quick Filters */}
            <div className="space-y-3">
              <div>
                <Label>{t('extracted.status')}</Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={inputCls}
                >
                  <option value="all">{t('extracted.all_status')}</option>
                  <option value="active">{t('extracted.active')}</option>
                  <option value="inactive">{t('extracted.inactive')}</option>
                </select>
              </div>

              <div>
                <Label>{t('extracted.category_1')}</Label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={inputCls}
                >
                  <option value="all">{t('extracted.all_categories')}</option>
                  <option value="identity-verification">{t('extracted.identity_verification')}</option>
                  <option value="document-verification">{t('extracted.document_verification')}</option>
                  <option value="payment-services">{t('extracted.payment_services')}</option>
                  <option value="banking-services">{t('extracted.banking_services')}</option>
                </select>
              </div>

              <div>
                <Label>{t('extracted.health')}</Label>
                <select
                  value={healthFilter}
                  onChange={(e) => setHealthFilter(e.target.value)}
                  className={inputCls}
                >
                  <option value="all">{t('extracted.all_health')}</option>
                  <option value="excellent">{t('extracted.excellent')}</option>
                  <option value="good">{t('extracted.good')}</option>
                  <option value="fair">{t('extracted.fair')}</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCategoryFilter('all');
                setHealthFilter('all');
                setCurrentPage(1);
              }}
              className={`${ghostBtn} w-full h-8 px-3`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('extracted.clear_filters')}
            </button>
          </div>

          {/* Category Overview */}
          <div className="theme-bg-card theme-border-glass border rounded-lg p-3.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-1">{t('categories')}</h3>
            <div>
              {Object.entries(categoryStats).map(([category, count]) => {
                const Icon = getCategoryIcon(category);
                return (
                  <div key={category} className="flex items-center justify-between py-2 border-b theme-border-glass last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-3.5 h-3.5 theme-text-muted shrink-0" />
                      <span className="text-xs theme-text-primary truncate">
                        {t(`extracted.${category.replace(/-/g, '_')}`)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold tabular-nums theme-text-muted shrink-0 ml-2">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Integrations Column */}
        <div className="lg:col-span-3 space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {loadingIntegrations ? (
                Array.from({ length: 6 }, (_, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg theme-bg-card theme-border-glass border animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-md theme-bg-glass" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-1/2 rounded theme-bg-glass" />
                        <div className="h-2.5 w-1/3 rounded theme-bg-glass" />
                      </div>
                    </div>
                    <div className="h-2.5 w-full rounded theme-bg-glass mb-1.5" />
                    <div className="h-2.5 w-2/3 rounded theme-bg-glass" />
                  </div>
                ))
              ) : paginatedIntegrations.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-14 h-14 rounded-full theme-bg-glass border theme-border-glass flex items-center justify-center mb-4">
                    <Database className="w-6 h-6 theme-text-muted" />
                  </div>
                  <h3 className="text-sm font-semibold theme-text-primary mb-1">No integrations found</h3>
                  <p className="text-xs theme-text-muted text-center mb-5 max-w-md">
                    {filteredIntegrations.length === 0 && integrations.length > 0
                      ? "No integrations match your current filters. Try adjusting your search or filter criteria."
                      : "Get started by adding your first integration to monitor and manage your API connections."}
                  </p>
                  <button
                    onClick={beginAddIntegration}
                    className="h-9 px-3.5 accent-gradient text-white rounded-md inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Integration</span>
                  </button>
                </div>
              ) : (
                paginatedIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="theme-bg-card theme-border-glass border rounded-lg p-3.5 cursor-pointer hover:theme-bg-hover transition-colors"
                    onClick={() => setSelectedIntegration(integration)}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-md overflow-hidden flex items-center justify-center shrink-0 theme-bg-glass">
                          {integration.imageUrl ? (
                            <img
                              src={integration.imageUrl}
                              alt={integration.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                                if (sib) sib.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full items-center justify-center ${integration.imageUrl ? 'hidden' : 'flex'}`}>
                            {getPlatformLogo(integration.provider)}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold theme-text-primary truncate">{integration.name}</h3>
                          <p className="text-xs theme-text-muted truncate">{integration.provider}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusPillClass(integration.status)}`}>
                        {String(integration.status).toUpperCase()}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs theme-text-muted mt-2 line-clamp-2">
                      {integration.description}
                    </p>

                    {/* Meta rows */}
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <dt className="text-[11px] uppercase tracking-wider theme-text-muted truncate">{t('extracted.success_rate')}</dt>
                        <dd className="text-xs font-medium theme-text-primary tabular-nums">{integration.successRate}%</dd>
                      </div>
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <dt className="text-[11px] uppercase tracking-wider theme-text-muted truncate">{t('extracted.response')}</dt>
                        <dd className="text-xs font-medium theme-text-primary tabular-nums">{integration.responseTime}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <dt className="text-[11px] uppercase tracking-wider theme-text-muted truncate">{t('extracted.endpoints')}</dt>
                        <dd className="text-xs font-medium theme-text-primary tabular-nums">{integration.endpoints}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <dt className="text-[11px] uppercase tracking-wider theme-text-muted truncate">{t('extracted.api_version')}</dt>
                        <dd className="text-xs font-medium theme-text-primary tabular-nums">{integration.apiVersion}</dd>
                      </div>
                    </dl>

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t theme-border-glass flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getHealthPillClass(integration.health)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getHealthDotClass(integration.health)}`} />
                        {integration.health}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestConnection(integration.id);
                          }}
                          className={`${ghostBtn} h-8 px-3`}
                        >
                          <Wifi className="w-3.5 h-3.5" />
                          {t('extracted.test')}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSyncNow(integration.id);
                          }}
                          className={`${ghostBtn} h-8 px-3`}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          {t('extracted.sync')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // List view
            <div className="space-y-3">
              {loadingIntegrations ? (
                Array.from({ length: 6 }, (_, idx) => (
                  <div key={idx} className="h-16 rounded-lg theme-bg-card theme-border-glass border animate-pulse" />
                ))
              ) : paginatedIntegrations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-14 h-14 rounded-full theme-bg-glass border theme-border-glass flex items-center justify-center mb-4">
                    <Database className="w-6 h-6 theme-text-muted" />
                  </div>
                  <h3 className="text-sm font-semibold theme-text-primary mb-1">No integrations found</h3>
                  <p className="text-xs theme-text-muted text-center mb-5 max-w-md">
                    {filteredIntegrations.length === 0 && integrations.length > 0
                      ? "No integrations match your current filters. Try adjusting your search or filter criteria."
                      : "Get started by adding your first integration to monitor and manage your API connections."}
                  </p>
                  <button
                    onClick={beginAddIntegration}
                    className="h-9 px-3.5 accent-gradient text-white rounded-md inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Integration</span>
                  </button>
                </div>
              ) : (
                paginatedIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="theme-bg-card theme-border-glass border rounded-lg p-3.5 flex items-center gap-3 cursor-pointer hover:theme-bg-hover transition-colors"
                    onClick={() => setSelectedIntegration(integration)}
                  >
                    <div className="w-9 h-9 rounded-md overflow-hidden flex items-center justify-center shrink-0 theme-bg-glass">
                      {integration.imageUrl ? (
                        <img src={integration.imageUrl} alt={integration.name} className="w-full h-full object-cover" />
                      ) : (
                        getPlatformLogo(integration.provider)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold theme-text-primary truncate">{integration.name}</h3>
                        <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusPillClass(integration.status)}`}>
                          {String(integration.status).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs theme-text-muted truncate">
                        {integration.provider} · <span className="font-mono">{integration.id}</span>
                      </p>
                      <p className="text-xs theme-text-secondary truncate mt-0.5">{integration.description}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums theme-text-primary">{integration.successRate}%</p>
                        <p className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.success')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums theme-text-primary">{integration.responseTime}</p>
                        <p className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.response')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTestConnection(integration.id); }}
                        className={`${ghostBtn} h-8 px-3`}
                      >
                        <Wifi className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSyncNow(integration.id); }}
                        className={`${ghostBtn} h-8 px-3`}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t theme-border-glass flex-wrap gap-3">
            <p className="text-xs theme-text-muted">
              {t('extracted.showing')}{" "}
              {(currentPage - 1) * itemsPerPage + 1} {t('extracted.to')}{" "}
              {Math.min(currentPage * itemsPerPage, filteredIntegrations.length)}{" "}
              {t('extracted.of')} {filteredIntegrations.length} {t('extracted.integrations')}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="w-8 h-8 inline-flex items-center justify-center rounded-md theme-text-secondary disabled:opacity-40 hover:theme-bg-glass hover:theme-text-primary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + Math.max(1, currentPage - 2);
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-8 h-8 px-2 rounded-md text-xs font-semibold tabular-nums transition-colors ${
                      currentPage === pageNum
                        ? "theme-bg-glass text-accent-gradient"
                        : "theme-text-muted hover:theme-bg-glass hover:theme-text-primary"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="w-8 h-8 inline-flex items-center justify-center rounded-md theme-text-secondary disabled:opacity-40 hover:theme-bg-glass hover:theme-text-primary transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Detail / Add / Configure Drawer */}
      <AnimatePresence>
        {(selectedIntegration || isAdding) && (
          <IntegrationDrawer
            integration={selectedIntegration}
            draft={editedIntegration}
            isEditing={isEditing}
            isAdding={isAdding}
            onDraftChange={setEditedIntegration}
            onClose={closeDetail}
            onCancelEdit={() => {
              setIsEditing(false);
              setEditedIntegration(null);
            }}
            onSave={handleSaveEdit}
            onAdd={handleAddNew}
            onTestConnection={handleTestConnection}
            onSyncNow={handleSyncNow}
            onStartEdit={startEditSelected}
            getPlatformLogo={getPlatformLogo}
          />
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowExportModal(false)} />
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="relative w-full max-w-lg rounded-xl theme-drawer backdrop-blur-2xl border theme-border-glass shadow-2xl p-4 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold theme-text-primary">
                    {t('extracted.export_report') || 'Export Data'}
                  </h3>
                  <p className="text-xs theme-text-muted mt-0.5">{t('extracted.export') || 'Export integrations as CSV or a printable PDF report.'}</p>
                </div>
                <button onClick={() => setShowExportModal(false)} aria-label="Close export modal" className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Export All */}
              <div className="rounded-lg border theme-border-glass p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.exportAll') || 'Export All'}</h4>
                    <p className="text-xs theme-text-muted mt-0.5">{t('extracted.exportAllDescription') || 'Download the full integrations dataset in the chosen format.'}</p>
                    <p className="text-xs theme-text-muted mt-2 tabular-nums">{integrations.length} {t('extracted.integrations')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button onClick={() => { exportIntegrationsData(integrations); setShowExportModal(false); }} className={`${ghostBtn} h-8 px-3`}>CSV</button>
                    <button onClick={() => { exportIntegrationsPDF(integrations); setShowExportModal(false); }} className="h-8 px-3 rounded-md accent-gradient text-white text-xs font-semibold hover:opacity-90 transition-opacity">PDF</button>
                  </div>
                </div>
              </div>

              {/* Export Filtered */}
              <div className="rounded-lg border theme-border-glass p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.exportFiltered') || 'Export Filtered'}</h4>
                    <p className="text-xs theme-text-muted mt-0.5">{t('extracted.exportFilteredDescription') || 'Download only the results matching your current filters.'}</p>
                    <p className="text-xs theme-text-muted mt-2 tabular-nums">{filteredIntegrations.length} {t('extracted.integrations')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button disabled={filteredIntegrations.length === 0} onClick={() => { exportIntegrationsData(filteredIntegrations); setShowExportModal(false); }} className={`${ghostBtn} h-8 px-3 disabled:opacity-50 disabled:cursor-not-allowed`}>CSV</button>
                    <button disabled={filteredIntegrations.length === 0} onClick={() => { exportIntegrationsPDF(filteredIntegrations); setShowExportModal(false); }} className="h-8 px-3 rounded-md accent-gradient text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">PDF</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntegrationsPage;
