"use client";
/**
 * Slide-over drawer for viewing, editing or adding an integration, rendered via portal.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  X,
  RefreshCw,
  ExternalLink,
  Wifi, Edit,
  Plus,
} from 'lucide-react';
import { GHOST_BTN, RESPONSE_TIME_BUCKETS, SECURITY_FEATURES, USAGE_TRENDS, getStatusPillClass, getHealthPillClass, getHealthDotClass, type TranslateFn } from '../helpers';
import PlatformLogo from './platform-logos';
import { Label, SectionTitle, DefPair, StatCell, inputCls } from './primitives';

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
  t: TranslateFn;
}

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
  t
}: IntegrationDrawerProps) => {
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
        className="fixed inset-y-0 right-0 w-full max-w-[min(28rem,calc(100vw-1.5rem))] z-[70] theme-drawer backdrop-blur-2xl border-l theme-border-glass flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {!isAdding && !isEditing && integration && (
              <span className="w-6 h-6 rounded overflow-hidden flex items-center justify-center shrink-0">
                <PlatformLogo provider={integration.provider} />
              </span>
            )}
            <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">
              {isAdding ? t('extracted.new_integration') : isEditing ? t('extracted.edit_config') : integration?.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className={`${GHOST_BTN} h-8 px-3`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {t('extracted.view_api_documentation')}
                  </a>
                )}
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mt-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
                  <StatCell label={t('extracted.monthly_requests')} value={(integration.usage?.monthly ?? 0).toLocaleString()} />
                  <StatCell label={t('extracted.daily_average')} value={(integration.usage?.daily ?? 0).toLocaleString()} />
                  <StatCell label={t('extracted.error_count')} value={integration.usage?.errors ?? 0} />
                </div>
              </section>

              {/* API Configuration */}
              <section className="pt-4 border-t theme-border-glass">
                <SectionTitle>{t('extracted.api_configuration_1')}</SectionTitle>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
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
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mb-3">
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
                  {RESPONSE_TIME_BUCKETS.map((item, idx) => (
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
                  {SECURITY_FEATURES.map((item, idx) => (
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
                    {USAGE_TRENDS.map((trend, idx) => (
                      <div key={idx} className="py-2 border-b theme-border-glass last:border-0 flex items-center justify-between">
                        <span className="text-xs theme-text-muted truncate min-w-0">{trend.period}</span>
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
                className={`${GHOST_BTN} flex-1 h-9`}
              >
                <Wifi className="w-3.5 h-3.5" />
                {t('extracted.test')}
              </button>
              <button
                onClick={() => onSyncNow(integration.id)}
                className={`${GHOST_BTN} flex-1 h-9`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('extracted.sync')}
              </button>
              <button
                onClick={onStartEdit}
                className={`${GHOST_BTN} flex-1 h-9`}
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

export default IntegrationDrawer;
