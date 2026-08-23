'use client';

/**
 * Officer disbursements dashboard — thin composition layer.
 * All state/orchestration lives in useDisbursements; all UI lives in
 * components/disbursements.
 */
import { useMemo } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { useDisbursements } from '@/hooks/useDisbursements';
import { computeStats } from '@/utils/disbursementSelectors';
import {
  DisbursementDetailsPanel,
  DisbursementsCardGrid,
  DisbursementsHeader,
  DisbursementsTable,
  ExportModal,
  FiltersToolbar,
  FinancialOverview,
  InstallmentControls,
  ManualDisbursementForm,
  MobileDisbursementsList,
  MonthlyTrendChart,
  PaginationBar,
  StatsGrid,
} from '@/components/disbursements';
import type { DisbursementRaw } from '@/models/Disbursement';

export default function DisbursementsPage() {
  const { t } = useLocale();
  const ctl = useDisbursements(t);

  const stats = useMemo(() => computeStats(ctl.allDisbursements), [ctl.allDisbursements]);

  const renderInstallmentCell = (record: DisbursementRaw) => (
    <InstallmentControls
      record={record}
      selection={ctl.tableInstallmentSelections[record.id ?? ''] ?? null}
      onSelect={(recordId, value) =>
        ctl.setTableInstallmentSelections((prev) => ({ ...prev, [recordId]: value }))
      }
      onDisburseTablePath={ctl.disburseInstallmentTable}
    />
  );

  const renderListView = () => {
    if (ctl.viewMode === 'table') {
      if (ctl.isMobile) {
        return (
          <MobileDisbursementsList
            items={ctl.paginatedDisbursements}
            onView={ctl.setSelectedRecord}
            onDelete={ctl.deleteRecord}
          />
        );
      }
      if (ctl.filteredDisbursements.length === 0) {
        return (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium theme-text-primary">
              {t('disbursements.no_records')}
            </p>
          </div>
        );
      }
      return (
        <DisbursementsTable
          items={ctl.paginatedDisbursements}
          onView={ctl.setSelectedRecord}
          onDelete={ctl.deleteRecord}
          renderInstallmentCell={renderInstallmentCell}
        />
      );
    }
    return (
      <DisbursementsCardGrid
        items={ctl.paginatedDisbursements}
        onView={ctl.setSelectedRecord}
        onDelete={ctl.deleteRecord}
        renderInstallmentControls={renderInstallmentCell}
      />
    );
  };

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <DisbursementsHeader
        filteredCount={ctl.filteredDisbursements.length}
        onExport={() => ctl.setShowExportModal(true)}
        onNew={() => ctl.setFormField('showManualForm', true)}
      />

      <ManualDisbursementForm
        form={ctl.form}
        setFormField={ctl.setFormField}
        availableApplications={ctl.availableApplications}
        selectedRecord={ctl.selectedRecord}
        selectedInstallment={ctl.selectedInstallment}
        setSelectedInstallment={ctl.setSelectedInstallment}
        onClose={ctl.closeManualForm}
        onSubmit={ctl.submitManualForm}
        onDisburseProgressive={ctl.disburseProgressiveFromForm}
        onResetProgress={ctl.resetProgress}
      />

      {/* KPI band */}
      <StatsGrid stats={stats} />

      {/* Trend + Financial overview */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <MonthlyTrendChart items={ctl.allDisbursements} className="lg:col-span-3" />
        <FinancialOverview stats={stats} items={ctl.allDisbursements} className="lg:col-span-2" />
      </div>

      {/* Filters */}
      <FiltersToolbar
        filters={ctl.filters}
        setFilter={ctl.setFilter}
        filtersActive={ctl.filtersActive}
        viewMode={ctl.viewMode}
        setViewMode={ctl.setViewMode}
        showFilters={ctl.showFilters}
        setShowFilters={ctl.setShowFilters}
      />

      {/* Disbursements List */}
      <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
        {renderListView()}

        <PaginationBar
          currentPage={ctl.currentPage}
          setCurrentPage={ctl.setCurrentPage}
          totalPages={ctl.totalPages}
          totalFiltered={ctl.totalFiltered}
          itemsPerPage={ctl.itemsPerPage}
          isMobile={ctl.isMobile}
        />
      </div>

      {ctl.selectedRecord && (
        <DisbursementDetailsPanel
          record={ctl.selectedRecord}
          onClose={() => ctl.setSelectedRecord(null)}
          onEdit={ctl.startEditing}
        />
      )}

      <ExportModal
        open={ctl.showExportModal}
        allCount={ctl.allDisbursements.length}
        filteredCount={ctl.filteredDisbursements.length}
        emailAddress={ctl.emailAddress}
        setEmailAddress={ctl.setEmailAddress}
        sendingEmail={ctl.sendingEmail}
        onClose={() => ctl.setShowExportModal(false)}
        onExportCsvAll={() => ctl.exportCsv(ctl.allDisbursements)}
        onExportPdfAll={() => ctl.exportPdf(ctl.allDisbursements)}
        onExportCsvFiltered={() => ctl.exportCsv(ctl.filteredDisbursements)}
        onExportPdfFiltered={() => ctl.exportPdf(ctl.filteredDisbursements)}
        onSendEmail={(scope, format) =>
          ctl.sendEmail(scope === 'all' ? ctl.allDisbursements : ctl.filteredDisbursements, format)
        }
      />
    </div>
  );
}
