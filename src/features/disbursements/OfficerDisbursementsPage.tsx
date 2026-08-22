'use client';

/**
 * Officer disbursements dashboard — thin composition layer.
 * All state/orchestration lives in useDisbursements; all UI lives in
 * components/disbursements. Behavior is a 1:1 port of the legacy monolith.
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { useDisbursements } from '@/hooks/useDisbursements';
import {
  computeStats,
} from '@/utils/disbursementSelectors';
import {
  DisbursementDetailsPanel,
  DisbursementsCardGrid,
  DisbursementsHeader,
  DisbursementsPageChrome,
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
          <div className="p-5 text-center theme-text-muted">
            {t('disbursements.no_records') || 'No disbursements found.'}
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
    <div className="relative ">
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-5">
        <DisbursementsPageChrome />

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

        <StatsGrid stats={stats} />

        <FinancialOverview stats={stats} items={ctl.allDisbursements} />

        <MonthlyTrendChart items={ctl.allDisbursements} />

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="theme-bg-card theme-border-glass border rounded-xl backdrop-blur-xl overflow-hidden"
        >
          {renderListView()}

          <PaginationBar
            currentPage={ctl.currentPage}
            setCurrentPage={ctl.setCurrentPage}
            totalPages={ctl.totalPages}
            totalFiltered={ctl.totalFiltered}
            itemsPerPage={ctl.itemsPerPage}
            isMobile={ctl.isMobile}
          />
        </motion.div>

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
    </div>
  );
}
