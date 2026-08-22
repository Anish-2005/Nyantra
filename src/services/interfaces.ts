/**
 * Service interfaces (Dependency Inversion boundary).
 * Hooks depend on these, never on Firebase or fetch directly.
 */
import type { UnsubscribeFn } from '@/models/common';
import type {
  ApplicationRecord,
  DisbursementRaw,
  DisbursementStatus,
  DisbursementUpdatePayload,
  ManualCreateInput,
} from '@/models/Disbursement';

export type { UnsubscribeFn };

/** Read-side of the disbursement domain (direct Firestore reads are allowed). */
export interface DisbursementReader {
  subscribeAll(onData: (items: DisbursementRaw[]) => void, onError: (e: Error) => void): UnsubscribeFn;
  findByApplicationId(applicationId: string): Promise<DisbursementRaw[]>;
}

/** Write-side — routed through the server boundary for re-validation. */
export interface DisbursementWriter {
  createFromApplication(applicationId: string, application: ApplicationRecord): Promise<void>;
  createManual(input: ManualCreateInput): Promise<void>;
  updateManual(
    firestoreId: string,
    payload: DisbursementUpdatePayload,
    progressiveCompletion?: { customId: string; record: DisbursementRaw } | null,
  ): Promise<void>;
  disburseInstallmentCards(firestoreId: string, record: DisbursementRaw, installmentNumber: number): Promise<void>;
  disburseInstallmentTable(firestoreId: string, record: DisbursementRaw, installmentNumber: number): Promise<void>;
  disburseInstallmentForm(firestoreId: string, record: DisbursementRaw, installmentNumber: number,
    payment: { transactionId: string; utrNumber: string; paymentMethod: string }): Promise<void>;
  resetProgress(firestoreId: string, record: DisbursementRaw): Promise<void>;
  remove(record: { firestoreId?: string; id?: string }): Promise<void>;
}

export interface DisbursementServiceApi extends DisbursementReader, DisbursementWriter {}

/** Read-only access to applications (queries used by disbursement flows). */
export interface ApplicationQueryService {
  listByBeneficiary(beneficiaryId: string): Promise<(ApplicationRecord & { id: string })[]>;
  subscribeApprovedOrCompleted(onData: (items: Array<ApplicationRecord & { id: string }>) => void, onError: (e: Error) => void): UnsubscribeFn;
}
