'use client';

/**
 * Feature hook for the officer disbursements dashboard.
 * Owns all state + orchestration; the page only renders.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCollectionSubscription } from '@/hooks/useCollectionSubscription';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  buildManualEditUpdate,
  validateManualFormForCompletion,
  type ApplicationRecord,
  type DisbursementRaw,
  type DisbursementStatus,
} from '@/models/Disbursement';
import { applicationService, disbursementService } from '@/services';
import {
  downloadDisbursementsCsv,
  exportDisbursementsPdf,
  sendDisbursementsEmail,
} from '@/lib/export/disbursementExport';
import {
  DEFAULT_DISBURSEMENT_FILTERS,
  filterAndSortDisbursements,
  paginate,
  type DisbursementFilters,
} from '@/utils/disbursementSelectors';

export type TFn = (key: string, vars?: Record<string, string | number>) => string;

const ITEMS_PER_PAGE = 10;

export interface ManualFormState {
  showManualForm: boolean;
  editingFirestoreId: string | null;
  isEditingManual: boolean;
  beneficiaryId: string;
  applicationId: string;
  reliefAmountText: string;
  status: DisbursementStatus;
  actType: string;
  transactionId: string;
  utrNumber: string;
  paymentMethod: string;
}

export const EMPTY_MANUAL_FORM: ManualFormState = {
  showManualForm: false,
  editingFirestoreId: null,
  isEditingManual: false,
  beneficiaryId: '',
  applicationId: '',
  reliefAmountText: '',
  status: 'pending',
  actType: 'relief',
  transactionId: '',
  utrNumber: '',
  paymentMethod: '',
};

export function useDisbursements(t: TFn) {
  // ---- Data -------------------------------------------------------------
  const subscribeAll = useMemo(() => disbursementService.subscribeAll.bind(disbursementService), []);
  const { items: allDisbursements } = useCollectionSubscription<DisbursementRaw>(subscribeAll);

  const [filters, setFilters] = useState<DisbursementFilters>(DEFAULT_DISBURSEMENT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredDisbursements = useMemo(
    () => filterAndSortDisbursements(allDisbursements, filters),
    [allDisbursements, filters],
  );
  const { paginated: paginatedDisbursements, totalPages } = useMemo(
    () => paginate(filteredDisbursements, currentPage, ITEMS_PER_PAGE),
    [filteredDisbursements, currentPage],
  );

  // ---- View state -------------------------------------------------------
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const isMobile = useMediaQuery('(max-width: 640px)');
  useEffect(() => {
    if (isMobile) setViewMode('cards');
  }, [isMobile]);

  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DisbursementRaw | null>(null);
  const [tableInstallmentSelections, setTableInstallmentSelections] = useState<Record<string, number | null>>({});
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);

  const setFilter = useCallback(<K extends keyof DisbursementFilters>(key: K, value: DisbursementFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ---- Auto-create disbursements for approved applications ---------------
  const subscribeApps = useMemo(
    () => applicationService.subscribeApprovedOrCompleted.bind(applicationService),
    [],
  );
  useCollectionSubscription<ApplicationRecord & { id: string }>(
    useCallback(
      (onData, onError) =>
        subscribeApps(async (apps) => {
          try {
            for (const app of apps) {
              const existing = await disbursementService.findByApplicationId(app.id);
              if (existing.length === 0) {
                await disbursementService.createFromApplication(app.id, app);
              }
            }
            onData([]);
          } catch (err) {
            console.error('Error creating disbursements for applications:', err);
            onError(err instanceof Error ? err : new Error(String(err)));
          }
        }, onError),
      [subscribeApps],
    ),
  );

  // ---- Manual form state -------------------------------------------------
  const [form, setFormState] = useState<ManualFormState>(EMPTY_MANUAL_FORM);
  const [availableApplications, setAvailableApplications] = useState<Array<ApplicationRecord & { id: string }>>([]);

  const setFormField = useCallback(
    <K extends keyof ManualFormState>(key: K, value: ManualFormState[K]) => {
      setFormState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Fetch applications whenever the beneficiary id changes (legacy behaviour).
  const rawBeneficiaryId = form.beneficiaryId;
  useEffect(() => {
    if (!rawBeneficiaryId.trim()) {
      setAvailableApplications([]);
      setFormState((prev) => ({ ...prev, applicationId: '' }));
      return;
    }
    let cancelled = false;
    const fetchApplications = async () => {
      try {
        const apps = await applicationService.listByBeneficiary(rawBeneficiaryId.trim());
        if (!cancelled) setAvailableApplications(apps);
      } catch (err) {
        console.error('Error fetching applications for beneficiary:', err);
        if (!cancelled) {
          setAvailableApplications([]);
          setFormState((prev) => ({ ...prev, applicationId: '' }));
        }
      }
    };
    fetchApplications();
    return () => {
      cancelled = true;
    };
  }, [rawBeneficiaryId]);

  const closeManualForm = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      showManualForm: false,
      editingFirestoreId: null,
      isEditingManual: false,
    }));
    setSelectedRecord(null);
  }, []);

  const resetFullForm = useCallback(() => {
    setFormState(EMPTY_MANUAL_FORM);
    setSelectedInstallment(null);
    setAvailableApplications([]);
    setSelectedRecord(null);
  }, []);

  /** Populates the manual form from a record (edit pencil in detail panel). */
  const startEditing = useCallback((record: DisbursementRaw) => {
    const docId = record.firestoreId || record.id || '';
    setFormState({
      showManualForm: true,
      editingFirestoreId: docId,
      isEditingManual: Boolean(record.firestoreId),
      beneficiaryId: record.beneficiaryId || '',
      applicationId: record.applicationId || '',
      reliefAmountText: record.reliefAmount != null ? String(record.reliefAmount) : '',
      status: ((record.status || 'pending').replace('-', '_') as DisbursementStatus),
      actType: record.actType || 'relief',
      transactionId: record.transactionId || '',
      utrNumber: record.utrNumber || '',
      paymentMethod: record.paymentMethod || '',
    });
    setSelectedRecord(null); // Close details (legacy behaviour)
  }, []);

  const submitManualForm = useCallback(async () => {
    if (!form.beneficiaryId.trim() || !form.applicationId.trim()) {
      alert(t('extracted.beneficiary_and_application_required'));
      return;
    }
    const amount = parseFloat(form.reliefAmountText);
    if (Number.isNaN(amount) || amount <= 0) {
      alert(t('extracted.valid_amount_required'));
      return;
    }
    if (
      form.status === 'completed' &&
      !validateManualFormForCompletion({
        beneficiaryId: form.beneficiaryId,
        applicationId: form.applicationId,
        reliefAmountText: form.reliefAmountText,
        actType: form.actType,
        transactionId: form.transactionId,
        paymentMethod: form.paymentMethod,
      })
    ) {
      alert(t('extracted.all_fields_required_for_completion') || 'All fields must be filled to mark as completed');
      return;
    }

    try {
      if (form.isEditingManual && form.editingFirestoreId) {
        const payload = buildManualEditUpdate({
          status: form.status,
          transactionId: form.transactionId,
          utrNumber: form.utrNumber,
          paymentMethod: form.paymentMethod,
          reliefAmount: amount,
        });
        await disbursementService.updateManual(form.editingFirestoreId, payload, {
          customId: form.editingFirestoreId,
          record: selectedRecord ?? {},
        });
      } else {
        const selectedApp = availableApplications.find((a) => a.id === form.applicationId);
        if (!selectedApp) {
          alert(t('extracted.application_not_found'));
          return;
        }
        await disbursementService.createManual({
          beneficiaryId: form.beneficiaryId.trim(),
          applicationId: form.applicationId,
          application: selectedApp,
          reliefAmount: amount,
          status: form.status,
          actType: form.actType,
          transactionId: form.transactionId,
          utrNumber: form.utrNumber,
          paymentMethod: form.paymentMethod,
        });
      }
      resetFullForm();
    } catch (err) {
      console.error('Error saving disbursement:', err);
      alert(
        form.isEditingManual
          ? t('extracted.error_updating_disbursement') || 'Error updating disbursement'
          : t('extracted.error_adding_disbursement'),
      );
    }
  }, [form, availableApplications, selectedRecord, resetFullForm, t]);

  // ---- Record actions ------------------------------------------------------
  const deleteRecord = useCallback(async (record: DisbursementRaw) => {
    try {
      await disbursementService.remove(record);
    } catch (error) {
      console.error('Error deleting disbursement:', error);
      alert('Failed to delete disbursement. Please try again.');
    }
  }, []);

  const clearInstallmentSelection = useCallback((key: string) => {
    setTableInstallmentSelections((prev) => ({ ...prev, [key]: null }));
  }, []);

  const runCardsDisbursement = useCallback(
    async (record: DisbursementRaw, installmentNumber: number | null) => {
      if (!installmentNumber) return;
      try {
        await disbursementService.disburseInstallmentCards(
          record.firestoreId || record.id || '',
          record,
          installmentNumber,
        );
        clearInstallmentSelection(record.id || '');
        alert(`Installment ${installmentNumber} disbursed successfully!`);
      } catch (error) {
        console.error('Error disbursing installment:', error);
        alert('Failed to disburse installment. Please try again.');
      }
    },
    [clearInstallmentSelection],
  );

  /** Legacy table path performs the guard itself and has no success alert. */
  const runTableDisbursement = useCallback(
    async (record: DisbursementRaw, installmentNumber: number | null) => {
      if (!(record.transactionId && record.utrNumber && record.paymentMethod)) {
        alert('Please edit this disbursement first to set Transaction ID, UTR Number, and Payment Method.');
        return;
      }
      if (!installmentNumber) return;
      try {
        await disbursementService.disburseInstallmentTable(
          record.firestoreId || record.id || '',
          record,
          installmentNumber,
        );
        clearInstallmentSelection(record.id || '');
      } catch (error) {
        console.error('Error updating disbursement:', error);
      }
    },
    [clearInstallmentSelection],
  );

  /** Progressive "Disburse Installment" inside the detail/manual form flow. */
  const disburseProgressiveFromForm = useCallback(async () => {
    if (!form.transactionId.trim() || !form.utrNumber.trim() || !form.paymentMethod) {
      alert(
        t('extracted.all_fields_required_for_progressive') ||
          'Please fill Transaction ID, UTR Number, and Payment Method to proceed with disbursement.',
      );
      return;
    }
    if (!selectedInstallment) {
      alert(t('extracted.select_installment_first') || 'Please select an installment to disburse.');
      return;
    }
    if (!form.editingFirestoreId || !selectedRecord) return;
    try {
      await disbursementService.disburseInstallmentForm(
        form.editingFirestoreId,
        selectedRecord,
        selectedInstallment,
        {
          transactionId: form.transactionId,
          utrNumber: form.utrNumber,
          paymentMethod: form.paymentMethod,
        },
      );
    } catch (error) {
      console.error('Error disbursing installment:', error);
      alert('Failed to disburse installment. Please try again.');
    }
  }, [form, selectedRecord, selectedInstallment, t]);

  /** Reset-progress button inside the manual form. */
  const resetProgress = useCallback(async () => {
    if (!form.editingFirestoreId || !selectedRecord) return;
    try {
      await disbursementService.resetProgress(form.editingFirestoreId, selectedRecord);
    } catch (error) {
      console.error('Error resetting progress:', error);
      alert('Failed to reset progress. Please try again.');
    }
  }, [form.editingFirestoreId, selectedRecord]);

  // ---- Exports / email -----------------------------------------------------
  const exportCsv = useCallback(
    (items: readonly DisbursementRaw[]) => {
      downloadDisbursementsCsv(items, t('extracted.sortOptions.initiatedDate') || 'Initiated Date');
      setShowExportModal(false);
    },
    [t],
  );

  const exportPdf = useCallback(async (items: readonly DisbursementRaw[]) => {
    await exportDisbursementsPdf(items);
    setShowExportModal(false);
  }, []);

  const sendEmail = useCallback(
    async (items: readonly DisbursementRaw[], format: 'csv' | 'pdf') => {
      if (!emailAddress.trim()) {
        alert('Please enter an email address');
        return;
      }
      setSendingEmail(true);
      try {
        await sendDisbursementsEmail(items, format, emailAddress, t('extracted.sortOptions.initiatedDate') || 'Initiated Date');
        alert('Email sent successfully!');
        setEmailAddress('');
        setShowExportModal(false);
      } catch (error) {
        console.error('Error sending email:', error);
        alert('Failed to send email. Please try again.');
      } finally {
        setSendingEmail(false);
      }
    },
    [emailAddress, t],
  );

  return {
    // data
    allDisbursements,
    filteredDisbursements,
    paginatedDisbursements,
    totalFiltered: filteredDisbursements.length,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    // filters
    filters,
    setFilter,
    filtersActive:
      filters.statusFilter !== 'all' ||
      filters.actTypeFilter !== 'all' ||
      filters.dateFilter !== 'all' ||
      filters.priorityFilter !== 'all' ||
      filters.sortBy !== 'initiatedDate' ||
      filters.sortOrder !== 'desc',
    // view
    viewMode,
    setViewMode,
    isMobile,
    showFilters,
    setShowFilters,
    // selection
    selectedRecord,
    setSelectedRecord,
    tableInstallmentSelections,
    setTableInstallmentSelections,
    selectedInstallment,
    setSelectedInstallment,
    // manual form
    form,
    setFormField,
    availableApplications,
    closeManualForm,
    resetFullForm,
    startEditing,
    submitManualForm,
    disburseProgressiveFromForm,
    resetProgress,
    // actions
    deleteRecord,
    disburseInstallmentCards: runCardsDisbursement,
    disburseInstallmentTable: runTableDisbursement,
    // exports
    showExportModal,
    setShowExportModal,
    emailAddress,
    setEmailAddress,
    sendingEmail,
    exportCsv,
    exportPdf,
    sendEmail,
  };
}

export type DisbursementsController = ReturnType<typeof useDisbursements>;
