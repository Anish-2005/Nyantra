"use client";
import React, { useState, useMemo, useEffect, createElement } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { AnimatePresence } from 'framer-motion';
import {
  Search, Download, Plus,
  RefreshCw,
  Database,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { collection, doc, onSnapshot, updateDoc, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PageHeader, StatBand, EmptyState } from '@/components/dashboard/ui';
import { GHOST_BTN, getCategoryIcon, type Integration } from './helpers';
import IntegrationDrawer from './components/IntegrationDrawer';
import ExportModal from './components/ExportModal';
import IntegrationGridCard from './components/IntegrationGridCard';
import IntegrationListRow from './components/IntegrationListRow';
import { Label, inputCls } from './components/primitives';

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
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  // Firestore-backed integrations state
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedIntegration, setEditedIntegration] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Subscribe to Firestore 'integrations' collection
  useEffect(() => {
    const q = query(collection(db, 'integrations'), orderBy('name'));
    const unsub = onSnapshot(q, (snap) => {
      const items: Integration[] = snap.docs.map(d => {
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

  const emptyHint =
    filteredIntegrations.length === 0 && integrations.length > 0
      ? "No integrations match your current filters. Try adjusting your search or filter criteria."
      : "Get started by adding your first integration to monitor and manage your API connections.";

  const emptyState = (
    <EmptyState
      icon={Database}
      title="No integrations found"
      hint={emptyHint}
      actionLabel="Add First Integration"
      actionIcon={Plus}
      onAction={beginAddIntegration}
    />
  );

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <PageHeader
        title={t('extracted.integration')}
        highlight={t('extracted.monitoring_center')}
        subtitle={t('extracted.realtime_integration_tracking_description')}
      >
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
      </PageHeader>

      {/* Stats hairline band */}
      <StatBand
        cells={[
          { label: t('extracted.active'), value: stats.active, dot: 'bg-emerald-500' },
          { label: t('extracted.endpoints'), value: stats.totalEndpoints, dot: 'bg-blue-500' },
          { label: t('extracted.success_rate'), value: `${stats.avgSuccessRate}%`, dot: 'bg-violet-500' },
          { label: t('extracted.response'), value: '< 2s', dot: 'bg-amber-500' }
        ]}
      />

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
              className={`${GHOST_BTN} w-full h-8 px-3`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('extracted.clear_filters')}
            </button>
          </div>

          {/* Category Overview */}
          <div className="theme-bg-card theme-border-glass border rounded-lg p-3.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-1">{t('categories')}</h3>
            <div>
              {Object.entries(categoryStats).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between py-2 border-b theme-border-glass last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {createElement(getCategoryIcon(category), { className: 'w-3.5 h-3.5 theme-text-muted shrink-0' })}
                    <span className="text-xs theme-text-primary truncate min-w-0">
                      {t(`extracted.${category.replace(/-/g, '_')}`)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold tabular-nums theme-text-muted shrink-0 ml-2">
                    {count}
                  </span>
                </div>
              ))}
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
                <div className="col-span-full">{emptyState}</div>
              ) : (
                paginatedIntegrations.map((integration) => (
                  <IntegrationGridCard
                    key={integration.id}
                    integration={integration}
                    onSelect={setSelectedIntegration}
                    onTestConnection={handleTestConnection}
                    onSyncNow={handleSyncNow}
                    t={t}
                  />
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
                emptyState
              ) : (
                paginatedIntegrations.map((integration) => (
                  <IntegrationListRow
                    key={integration.id}
                    integration={integration}
                    onSelect={setSelectedIntegration}
                    onTestConnection={handleTestConnection}
                    onSyncNow={handleSyncNow}
                    t={t}
                  />
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
                className="w-9 h-9 sm:w-8 sm:h-8 inline-flex items-center justify-center rounded-md theme-text-secondary disabled:opacity-40 hover:theme-bg-glass hover:theme-text-primary transition-colors"
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
                    className={`min-w-9 sm:min-w-8 h-9 sm:h-8 px-2 rounded-md text-xs font-semibold tabular-nums transition-colors ${
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
                className="w-9 h-9 sm:w-8 sm:h-8 inline-flex items-center justify-center rounded-md theme-text-secondary disabled:opacity-40 hover:theme-bg-glass hover:theme-text-primary transition-colors"
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
            t={t}
          />
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <ExportModal
            allItems={integrations}
            filteredItems={filteredIntegrations}
            onClose={() => setShowExportModal(false)}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntegrationsPage;
