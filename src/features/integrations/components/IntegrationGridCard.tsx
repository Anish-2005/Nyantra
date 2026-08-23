"use client";
/**
 * Grid-view tile for a single integration: logo, status pill, meta grid and action footer.
 */
import React from 'react';
import { RefreshCw, Wifi } from 'lucide-react';
import { GHOST_BTN, getStatusPillClass, getHealthPillClass, getHealthDotClass, type Integration, type TranslateFn } from '../helpers';
import PlatformLogo from './platform-logos';

export default function IntegrationGridCard({
  integration,
  onSelect,
  onTestConnection,
  onSyncNow,
  t,
}: {
  integration: Integration;
  onSelect: (integration: Integration) => void;
  onTestConnection: (id: string) => void;
  onSyncNow: (id: string) => void;
  t: TranslateFn;
}) {
  return (
    <div
      className="theme-bg-card theme-border-glass border rounded-lg p-3.5 cursor-pointer hover:theme-bg-hover transition-colors"
      onClick={() => onSelect(integration)}
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
              <PlatformLogo provider={integration.provider} />
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
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 min-w-0">
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
      <div className="mt-3 pt-3 border-t theme-border-glass flex items-center justify-between gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getHealthPillClass(integration.health)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${getHealthDotClass(integration.health)}`} />
          {integration.health}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTestConnection(integration.id);
            }}
            className={`${GHOST_BTN} h-9 sm:h-8 px-3`}
          >
            <Wifi className="w-3.5 h-3.5" />
            {t('extracted.test')}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSyncNow(integration.id);
            }}
            className={`${GHOST_BTN} h-9 sm:h-8 px-3`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t('extracted.sync')}
          </button>
        </div>
      </div>
    </div>
  );
}
