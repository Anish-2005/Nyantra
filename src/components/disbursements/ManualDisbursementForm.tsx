'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import type {
  ApplicationRecord,
  DisbursementRaw,
  DisbursementStatus,
} from '@/models/Disbursement';
import type { ManualFormState } from '@/hooks/useDisbursements';
import { formatCurrency, lightSurface } from './shared';

interface Props {
  form: ManualFormState;
  setFormField: <K extends keyof ManualFormState>(key: K, value: ManualFormState[K]) => void;
  availableApplications: Array<ApplicationRecord & { id: string }>;
  selectedRecord: DisbursementRaw | null;
  selectedInstallment: number | null;
  setSelectedInstallment: (v: number | null) => void;
  onClose: () => void;
  onSubmit: () => void;
  onDisburseProgressive: () => void;
  onResetProgress: () => void;
}

const fieldClass =
  'w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary disabled:opacity-50 disabled:cursor-not-allowed';

export function ManualDisbursementForm({
  form,
  setFormField,
  availableApplications,
  selectedRecord,
  selectedInstallment,
  setSelectedInstallment,
  onClose,
  onSubmit,
  onDisburseProgressive,
  onResetProgress,
}: Props) {
  const { t } = useLocale();

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'completed') {
      const isValidForCompletion =
        form.beneficiaryId.trim() &&
        form.applicationId &&
        form.reliefAmountText.trim() &&
        form.actType &&
        form.transactionId.trim() &&
        form.paymentMethod;

      if (!isValidForCompletion) {
        alert(
          t('extracted.all_fields_required_for_completion') ||
            'All fields must be filled to mark as completed',
        );
        return;
      }
    }
    setFormField('status', newStatus as DisbursementStatus);
  };

  const handleApplicationSelect = (selectedId: string) => {
    setFormField('applicationId', selectedId);
    if (selectedId) {
      const selectedApp = availableApplications.find((app) => app.id === selectedId);
      if (selectedApp) {
        setFormField('reliefAmountText', selectedApp.amount ? String(selectedApp.amount) : '');
        setFormField('actType', selectedApp.actType || selectedApp.caseType || 'relief');
        setFormField('status', 'pending');
      }
    } else {
      setFormField('reliefAmountText', '');
      setFormField('actType', 'relief');
      setFormField('status', 'pending');
    }
  };

  const showProgressive =
    Boolean(form.editingFirestoreId) &&
    Boolean(selectedRecord) &&
    Boolean(selectedRecord?.isProgressivePayment || selectedRecord?.actType?.toLowerCase().includes('poa'));

  return (
    <AnimatePresence>
      {form.showManualForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl mb-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold theme-text-primary">
                {form.editingFirestoreId
                  ? t('extracted.edit_disbursement') || 'Edit Disbursement'
                  : t('extracted.add_manual_disbursement')}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg theme-bg-glass theme-border-glass border hover:shadow-md transition-shadow"
              >
                <X className="w-5 h-5 theme-text-primary" />
              </button>
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  {t('extracted.beneficiary_id')} *
                </label>
                <input
                  type="text"
                  value={form.beneficiaryId}
                  onChange={(e) => setFormField('beneficiaryId', e.target.value)}
                  onBlur={(e) => {
                    const id = e.target.value.trim();
                    if (id) {
                      setFormField('beneficiaryId', id);
                    } else {
                      // The hook clears available applications + application id.
                      setFormField('beneficiaryId', '');
                    }
                  }}
                  disabled={!!form.editingFirestoreId}
                  className={fieldClass}
                  placeholder={t('extracted.enter_beneficiary_id')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  {t('extracted.application_id')} *
                </label>
                <select
                  value={form.applicationId}
                  onChange={(e) => handleApplicationSelect(e.target.value)}
                  disabled={availableApplications.length === 0 || !!form.editingFirestoreId}
                  className={fieldClass}
                >
                  <option value="">
                    {availableApplications.length === 0
                      ? t('extracted.no_applications_found')
                      : t('extracted.select_application')}
                  </option>
                  {availableApplications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.id} - {app.actType || app.caseType} - {formatCurrency(app.amount)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  {t('extracted.relief_amount')} *
                </label>
                <input
                  type="number"
                  value={form.reliefAmountText}
                  onChange={(e) => setFormField('reliefAmountText', e.target.value)}
                  disabled={!!form.editingFirestoreId}
                  className={fieldClass}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">{t('extracted.status')}</label>
                <select
                  value={form.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={fieldClass}
                >
                  <option value="pending">{t('extracted.pending')}</option>
                  <option value="in_progress">{t('extracted.in_progress')}</option>
                  <option value="completed">{t('extracted.completed')}</option>
                  <option value="failed">{t('extracted.failed')}</option>
                  <option value="cancelled">{t('extracted.cancelled')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">{t('extracted.act_type')}</label>
                <select
                  value={form.actType}
                  onChange={(e) => setFormField('actType', e.target.value)}
                  disabled={!!form.editingFirestoreId}
                  className={fieldClass}
                >
                  <option value="relief">{t('extracted.relief')}</option>
                  <option value="PCR Act">{t('extracted.pcr_act')}</option>
                  <option value="PoA Act">{t('extracted.poa_act')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  {t('extracted.transaction_id')}
                </label>
                <input
                  type="text"
                  value={form.transactionId}
                  onChange={(e) => setFormField('transactionId', e.target.value)}
                  className={fieldClass}
                  placeholder={t('extracted.optional')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  {t('extracted.utr_number')}
                </label>
                <input
                  type="text"
                  value={form.utrNumber}
                  onChange={(e) => setFormField('utrNumber', e.target.value)}
                  className={fieldClass}
                  placeholder={t('extracted.optional')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  {t('extracted.payment_method')}
                </label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setFormField('paymentMethod', e.target.value)}
                  className={fieldClass}
                >
                  <option value="">{t('extracted.select_payment_method')}</option>
                  <option value="bank_transfer">{t('extracted.bank_transfer')}</option>
                  <option value="upi">{t('extracted.upi')}</option>
                  <option value="cash">{t('extracted.cash')}</option>
                  <option value="cheque">{t('extracted.cheque')}</option>
                </select>
              </div>
            </div>

            {/* Progressive Payment Progress Section */}
            {showProgressive && selectedRecord && (
              <div className="mt-6 p-4 rounded-lg theme-bg-glass theme-border-glass border">
                <h3 className="text-lg font-semibold theme-text-primary mb-4">
                  {t('extracted.progressive_payment_progress') || 'Progressive Payment Progress'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm theme-text-muted mb-1">
                      {t('extracted.current_progress') || 'Current Progress'}
                    </div>
                    <div className="text-2xl font-bold theme-text-primary">
                      {selectedRecord.disbursementProgress?.toFixed(2)}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm theme-text-muted mb-1">
                      {t('extracted.completed_installments') || 'Completed Installments'}
                    </div>
                    <div className="text-2xl font-bold theme-text-primary">
                      {selectedRecord.completedInstallments || 0} / {selectedRecord.totalInstallments || 3}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm theme-text-muted mb-1">
                      {t('extracted.next_installment') || 'Next Installment'}
                    </div>
                    <div className="text-lg font-semibold theme-text-primary">
                      {selectedRecord.nextInstallmentAmount
                        ? formatCurrency(selectedRecord.nextInstallmentAmount)
                        : t('extracted.all_completed') || 'All Completed'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm theme-text-muted mb-1">Disbursed Amount</div>
                    <div className="text-lg font-semibold theme-text-primary">
                      {formatCurrency(selectedRecord.disbursedAmount || 0)} /{' '}
                      {formatCurrency(selectedRecord.reliefAmount)}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${selectedRecord.disbursementProgress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    Select Installment to Disburse
                  </label>
                  <select
                    value={selectedInstallment ?? ''}
                    onChange={(e) => setSelectedInstallment(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  >
                    <option value="">Select Installment</option>
                    <option value="1">Installment 1 (25%)</option>
                    <option value="2">Installment 2 (50%)</option>
                    <option value="3">Installment 3 (25%)</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onDisburseProgressive}
                    disabled={
                      (selectedRecord.completedInstallments || 0) >= 3 ||
                      !selectedInstallment ||
                      !form.transactionId.trim() ||
                      !form.utrNumber.trim() ||
                      !form.paymentMethod
                    }
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    {selectedInstallment ? `Disburse Installment ${selectedInstallment}` : 'Select Installment'}
                  </button>

                  <button
                    onClick={onResetProgress}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    {t('extracted.reset_progress') || 'Reset Progress'}
                  </button>
                </div>
              </div>
            )}

            {/* Footer buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary hover:shadow-md transition-shadow"
              >
                {t('extracted.cancel')}
              </button>
              <button
                onClick={onSubmit}
                className="px-4 py-2 rounded-lg accent-gradient text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                {form.editingFirestoreId
                  ? t('extracted.update_disbursement') || 'Update Disbursement'
                  : t('extracted.add_disbursement')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type { ManualFormState };
export { lightSurface };
