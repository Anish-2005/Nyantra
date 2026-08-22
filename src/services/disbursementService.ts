/**
 * Disbursement service — the single place this domain touches data sources.
 * Reads: direct Firestore via repository (read-heavy, non-sensitive).
 * Writes: server Route Handlers which re-validate role + business rules.
 */
import type { UnsubscribeFn } from '@/models/common';
import type {
  ApplicationRecord,
  DisbursementRaw,
  DisbursementUpdatePayload,
  ManualCreateInput,
} from '@/models/Disbursement';
import type { ApplicationQueryService, DisbursementServiceApi } from './interfaces';
import type { HttpMutations } from './http/apiClient';

export interface DisbursementServiceDeps {
  disbursements: {
    subscribe(onData: (items: DisbursementRaw[]) => void, onError: (e: Error) => void): UnsubscribeFn;
    findByField(field: string, value: unknown): Promise<DisbursementRaw[]>;
  };
  applications: ApplicationQueryService;
  http: Pick<HttpMutations, 'post' | 'patch' | 'delete'>;
}

/** Factory (dependency-injected) — tests pass mocks here. */
export function createDisbursementService(
  deps: DisbursementServiceDeps,
): DisbursementServiceApi {
  const patchDoc = (id: string, body: Record<string, unknown>) =>
    deps.http.patch(`/api/disbursements/${encodeURIComponent(id)}`, body);

  return {
    subscribeAll(onData, onError) {
      return deps.disbursements.subscribe(onData, onError);
    },

    async findByApplicationId(applicationId) {
      return deps.disbursements.findByField('applicationId', applicationId);
    },

    async createFromApplication(applicationId, application) {
      await deps.http.post('/api/disbursements', {
        kind: 'autoFromApplication',
        applicationId,
        application,
      });
    },

    async createManual(input: ManualCreateInput) {
      await deps.http.post('/api/disbursements', {
        kind: 'manual',
        beneficiaryId: input.beneficiaryId,
        applicationId: input.applicationId,
        application: input.application,
        reliefAmountText: String(input.reliefAmount),
        status: input.status,
        actType: input.actType,
        transactionId: input.transactionId,
        utrNumber: input.utrNumber,
        paymentMethod: input.paymentMethod,
      });
    },

    /** Edit-mode submit. Mirrors legacy write order incl. progressive side-write. */
    async updateManual(firestoreId, payload: DisbursementUpdatePayload, progressiveCompletion?) {
      await patchDoc(firestoreId, {
        op: 'manualUpdate',
        payload,
        progressiveCustomId:
          progressiveCompletion && payload['status'] === 'completed'
            ? progressiveCompletion.customId
            : undefined,
      });
    },

    async disburseInstallmentCards(firestoreId, record, installmentNumber) {
      await patchDoc(firestoreId, { op: 'installmentCards', installmentNumber });
    },

    async disburseInstallmentTable(firestoreId, record, installmentNumber) {
      // Legacy guard: payment references must already exist on the record.
      if (!(record.transactionId && record.utrNumber && record.paymentMethod)) {
        throw new Error('edit_required_for_table_disbursement');
      }
      await patchDoc(firestoreId, { op: 'installmentTable', installmentNumber });
    },

    async disburseInstallmentForm(firestoreId, record, installmentNumber, payment) {
      if (!payment.transactionId.trim() || !payment.utrNumber.trim() || !payment.paymentMethod) {
        throw new Error('all_fields_required_for_progressive');
      }
      if (!installmentNumber) throw new Error('installment_not_selected');
      await patchDoc(firestoreId, { op: 'installmentForm', installmentNumber, payment });
    },

    async resetProgress(firestoreId, _record) {
      await patchDoc(firestoreId, { op: 'resetProgress' });
    },

    async remove(record) {
      const docId = record.firestoreId || record.id || '';
      if (!docId) return;
      await deps.http.delete(`/api/disbursements/${encodeURIComponent(docId)}`);
    },
  };
}
