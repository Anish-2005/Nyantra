"use client";
/**
 * List-view row for a single integration: logo, identity block and compact stat/action columns.
 */
import React from 'react';
import { RefreshCw, Wifi } from 'lucide-react';
import { GHOST_BTN, getStatusPillClass, type Integration, type TranslateFn } from '../helpers';
import PlatformLogo from './platform-logos';

export default function IntegrationListRow({
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
      className="theme-bg-card theme-border-glass border rounded-lg p-3.5 flex items-center gap-3 cursor-pointer hover:theme-bg-hover transition-colors"
      onClick={() => onSelect(integration)}
    >
      <div className="w-9 h-9 rounded-md overflow-hidden flex items-center justify-center shrink-0 theme-bg-glass">
        {integration.imageUrl ? (
          <img src={integration.imageUrl} alt={integration.name} className="w-full h-full object-cover" />
        ) : (
          <PlatformLogo provider={integration.provider} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
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
          onClick={(e) => { e.stopPropagation(); onTestConnection(integration.id); }}
          className={`${GHOST_BTN} h-9 sm:h-8 px-3`}
        >
          <Wifi className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onSyncNow(integration.id); }}
          className={`${GHOST_BTN} h-9 sm:h-8 px-3`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
