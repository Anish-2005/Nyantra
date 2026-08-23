'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import type {
  ApplicationRecord,
  DisbursementRaw,
  DisbursementStatus,
} from '@/models/Disbursement';
import type { ManualFormState } from '@/hooks/useDisbursements';
import { formatCurrency } from './shared';

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
  'w-full h-9 px-2.5 rounded-md theme-bg-input theme-border-glass border theme-text-primary placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

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

  const installmentPcts = selectedRecord?.installmentPercentages ?? [25, 50, 25];
  const selectInstallmentLabel = `${t('disbursements.select')} ${t('disbursements.installment_word')}`;

  return (
    <AnimatePresence>
      {form.showManualForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden mb-1">
            {/* Header */}
            <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass">
              <h2 className="text-sm font-semibold theme-text-primary truncate">
                {form.editingFirestoreId
                  ? t('extracted.edit_disbursement') || 'Edit Disbursement'
                  : t('extracted.add_manual_disbursement')}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
                aria-label={t('extracted.close_sidebar') || 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form grid */}
            <div className="px-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <Field label={`${t('extracted.beneficiary_id')} *`}>
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
                </Field>

                <Field label={`${t('extracted.application_id')} *`}>
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
                </Field>

                <Field label={`${t('extracted.relief_amount')} *`}>
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
                </Field>

                <Field label={t('extracted.status')}>
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
                </Field>

                <Field label={t('extracted.act_type')}>
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
                </Field>

                <Field label={t('extracted.transaction_id')}>
                  <input
                    type="text"
                    value={form.transactionId}
                    onChange={(e) => setFormField('transactionId', e.target.value)}
                    className={fieldClass}
                    placeholder={t('extracted.optional')}
                  />
                </Field>

                <Field label={t('extracted.utr_number')}>
                  <input
                    type="text"
                    value={form.utrNumber}
                    onChange={(e) => setFormField('utrNumber', e.target.value)}
                    className={fieldClass}
                    placeholder={t('extracted.optional')}
                  />
                </Field>

                <Field label={t('extracted.payment_method')}>
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
                </Field>
              </div>

              {/* Progressive Payment Progress Section */}
              {showProgressive && selectedRecord && (
                <div className="mt-4 pt-4 border-t theme-border-glass">
                  <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-3">
                    {t('extracted.progressive_payment_progress') || 'Progressive Payment Progress'}
                  </p>

                  <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 mb-3">
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                        {t('extracted.current_progress') || 'Current Progress'}
                      </dt>
                      <dd className="text-lg font-semibold tabular-nums theme-text-primary mt-0.5">
                        {(selectedRecord.disbursementProgress ?? 0).toFixed(2)}%
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                        {t('extracted.completed_installments') || 'Completed Installments'}
                      </dt>
                      <dd className="text-lg font-semibold tabular-nums theme-text-primary mt-0.5">
                        {selectedRecord.completedInstallments || 0} / {selectedRecord.totalInstallments || 3}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                        {t('extracted.next_installment')}
                      </dt>
                      <dd className="text-sm font-semibold tabular-nums theme-text-primary mt-1">
                        {selectedRecord.nextInstallmentAmount
                          ? formatCurrency(selectedRecord.nextInstallmentAmount)
                          : t('extracted.all_completed') || 'All Completed'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                        {t('extracted.total_disbursed')}
                      </dt>
                      <dd className="text-sm font-semibold tabular-nums theme-text-primary mt-1">
                        {formatCurrency(selectedRecord.disbursedAmount || 0)} /{' '}
                        {formatCurrency(selectedRecord.reliefAmount)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mb-4 h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full accent-gradient transition-all duration-300"
                      style={{ width: `${selectedRecord.disbursementProgress || 0}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-end gap-2.5">
                    <div className="min-w-0">
                      <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1.5">
                        {selectInstallmentLabel}
                      </label>
                      <select
                        value={selectedInstallment ?? ''}
                        onChange={(e) => setSelectedInstallment(e.target.value ? parseInt(e.target.value) : null)}
                        className={`h-9 px-2.5 rounded-md ${fieldClass}`}
                      >
                        <option value="">{selectInstallmentLabel}</option>
                        {[1, 2, 3].map((n) =>
                          n > (selectedRecord.completedInstallments || 0) ? (
                            <option key={n} value={n}>
                              {t('disbursements.installment_word')} {n}
                              {installmentPcts[n - 1] !== undefined ? ` (${installmentPcts[n - 1]}%)` : ''}
                            </option>
                          ) : null,
                        )}
                      </select>
                    </div>
                    <button
                      onClick={onDisburseProgressive}
                      disabled={
                        (selectedRecord.completedInstallments || 0) >= 3 ||
                        !selectedInstallment ||
                        !form.transactionId.trim() ||
                        !form.utrNumber.trim() ||
                        !form.paymentMethod
                      }
                      className="h-9 px-3.5 accent-gradient text-white rounded-md text-xs font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                    >
                      {selectedInstallment
                        ? `${t('disbursements.disburse')} ${t('disbursements.installment_word')} ${selectedInstallment}`
                        : selectInstallmentLabel}
                    </button>
                    <button
                      onClick={onResetProgress}
                      className="h-9 px-3 rounded-md border theme-border-glass text-xs font-semibold theme-text-secondary hover:theme-bg-glass hover:theme-text-primary transition-colors"
                    >
                      {t('extracted.reset_progress') || 'Reset Progress'}
                    </button>
                  </div>
                </div>
              )}

              {/* Footer buttons */}
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t theme-border-glass">
                <button
                  onClick={onClose}
                  className="h-9 px-3.5 rounded-md border theme-border-glass text-xs font-semibold theme-text-secondary hover:theme-bg-glass hover:theme-text-primary transition-colors"
                >
                  {t('extracted.cancel')}
                </button>
                <button
                  onClick={onSubmit}
                  className="h-9 px-3.5 accent-gradient text-white rounded-md text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  {form.editingFirestoreId
                    ? t('extracted.update_disbursement') || 'Update Disbursement'
                    : t('extracted.add_disbursement')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type { ManualFormState };
