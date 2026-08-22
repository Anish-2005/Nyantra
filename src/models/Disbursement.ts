/**
 * Disbursement domain model.
 *
 * Pure TypeScript: no React, no Firebase imports. Shared by client hooks,
 * services and server route handlers so business rules exist in exactly one
 * place. All numeric derivations replicate the legacy page behaviour 1:1.
 */
import type { ApplicationLinked, Approvable, Auditable, Entity, Ownable } from './common';
import { toDateSafe, type TimestampLike } from '@/lib/format';

export const DISBURSEMENT_STATUSES = ['pending', 'in_progress', 'completed', 'failed', 'cancelled'] as const;
export type DisbursementStatus = (typeof DISBURSEMENT_STATUSES)[number];

export const DISBURSEMENT_ACT_TYPES = ['relief', 'PCR Act', 'PoA Act'] as const;
export type DisbursementActType = (typeof DISBURSEMENT_ACT_TYPES)[number];

export const PAYMENT_METHODS = ['bank_transfer', 'upi', 'cash', 'cheque'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Canonical rank used for status sorting: completed first … cancelled last. */
export const STATUS_SORT_RANK: Readonly<Record<string, number>> = {
  completed: 1,
  in_progress: 2,
  pending: 3,
  failed: 4,
  cancelled: 5,
};

export interface InstallmentProgress {
  completedInstallments?: number | null;
  totalInstallments?: number | null;
  currentInstallment?: number | null;
  installmentAmounts?: number[] | null;
  installmentPercentages?: number[] | null;
  disbursementProgress?: number | null;
  nextInstallmentAmount?: number | null;
  nextInstallmentPercentage?: number | null;
}

/** Raw Firestore document shape (all fields optional as stored data is loose). */
export interface DisbursementRaw extends InstallmentProgress {
  id?: string;
  beneficiaryId?: string | null;
  beneficiaryName?: string | null;
  aadhaarNumber?: string | null;
  phone?: string | null;
  district?: string | null;
  state?: string | null;
  caseNumber?: string | null;
  transactionId?: string | null;
  utrNumber?: string | null;
  paymentMethod?: string | null;
  reliefAmount?: number | null;
  transactionFee?: number | null;
  netAmount?: number | null;
  disbursedAmount?: number | null;
  status?: string | null;
  initiatedDate?: string | TimestampLike | null;
  completedDate?: string | TimestampLike | null;
  disbursementDate?: string | TimestampLike | null;
  actType?: string | null;
  priority?: string | null;
  retryCount?: number | null;
  failureReason?: string | null;
  initiatedBy?: string | null;
  verifiedBy?: string | null;
  applicationId?: string | null;
  ownerId?: string | null;
  isAuto?: boolean;
  isManual?: boolean;
  isProgressivePayment?: boolean;
  installment1Date?: string | null;
  installment2Date?: string | null;
  installment3Date?: string | null;
  installment1Amount?: number | null;
  installment2Amount?: number | null;
  installment3Amount?: number | null;
}

export type DisbursementRecord = DisbursementRaw & Entity;

/** Minimal application shape needed to derive a disbursement. */
export interface ApplicationRecord {
  applicantName?: string | null;
  name?: string | null;
  beneficiaryId?: string | null;
  district?: string | null;
  state?: string | null;
  amount?: number | null;
  disbursedAmount?: number | null;
  status?: string | null;
  disbursementStatus?: string | null;
  applicationDate?: string | TimestampLike | null;
  actType?: string | null;
  caseType?: string | null;
  transactionId?: string | null;
  utrNumber?: string | null;
  paymentMethod?: string | null;
  retryCount?: number | null;
  failureReason?: string | null;
  assignedOfficer?: string | null;
  verifiedBy?: string | null;
  ownerId?: string | null;
}

export function isPoaAct(actType?: string | null): boolean {
  return Boolean(actType && String(actType).toLowerCase().includes('poa'));
}

function generateDisbursementId(): string {
  return `DIS${Date.now()}${Math.floor(Math.random() * 100000)}`;
}

function initiatedDateFromApplication(app: ApplicationRecord): string {
  const parsed = app.applicationDate
    ? toDateSafe(app.applicationDate as string | TimestampLike)
    : null;
  return parsed ? parsed.toISOString() : new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Pure write-path computations (exact ports of legacy behaviour)
// ---------------------------------------------------------------------------

export interface DisbursementUpdatePayload {
  [field: string]: unknown;
}

/** "Cards" installment path: percentage-driven, caps at total, alerts on success. */
export function computeCardsInstallmentUpdate(
  d: Pick<DisbursementRaw, 'reliefAmount' | 'disbursedAmount' | 'completedInstallments' | 'totalInstallments' | 'installmentPercentages'>,
  installmentNumber: number,
): DisbursementUpdatePayload {
  const reliefAmount = Number(d.reliefAmount) || 0;
  const total = d.totalInstallments || 3;
  const percentages = d.installmentPercentages || [25, 50, 25];
  const pct = percentages[installmentNumber - 1] || 25;
  const installmentAmount = (reliefAmount * pct) / 100;

  const newCompleted = Math.min((d.completedInstallments || 0) + 1, total);
  const newProgress = Math.min((newCompleted / total) * 100, 100);
  const now = new Date().toISOString();

  return {
    completedInstallments: newCompleted,
    disbursementProgress: Math.round(newProgress),
    disbursedAmount: (d.disbursedAmount || 0) + installmentAmount,
    status: newCompleted >= total ? 'completed' : 'pending',
    lastUpdated: now,
    [`installment${installmentNumber}Date`]: now,
    [`installment${installmentNumber}Amount`]: installmentAmount,
  };
}

interface TableInstallmentInput {
  reliefAmount?: number | null;
  disbursedAmount?: number | null;
  completedInstallments?: number | null;
}

/** Fixed-schedule amount per installment index used by table/form paths. */
export function fixedInstallmentAmount(reliefAmount: number, installmentNumber: number): number {
  if (installmentNumber === 1) return Math.round(reliefAmount * 0.25);
  if (installmentNumber === 2) return Math.round(reliefAmount * 0.5);
  if (installmentNumber === 3) return Math.round(reliefAmount * 0.25);
  return 0;
}

/** "Table" installment path: unrounded progress, no success alert. */
export function computeTableInstallmentUpdate(
  d: TableInstallmentInput,
  installmentNumber: number,
): DisbursementUpdatePayload {
  const reliefAmount = Number(d.reliefAmount) || 0;
  const nextAmount = fixedInstallmentAmount(reliefAmount, installmentNumber);
  const newDisbursedAmount = (d.disbursedAmount || 0) + nextAmount;
  const newCompleted = Math.max(d.completedInstallments || 0, installmentNumber);
  const newProgress = reliefAmount > 0 ? (newDisbursedAmount / reliefAmount) * 100 : 0;

  const update: DisbursementUpdatePayload = {
    disbursedAmount: newDisbursedAmount,
    completedInstallments: newCompleted,
    disbursementProgress: newProgress,
    currentInstallment: newCompleted + 1,
    lastUpdated: new Date().toISOString(),
  };

  if (newCompleted < 3) {
    update.nextInstallmentAmount = newCompleted === 1
      ? Math.round(reliefAmount * 0.5)
      : Math.round(reliefAmount * 0.25);
    update.nextInstallmentPercentage = newCompleted === 1 ? 50 : 25;
  }
  if (newCompleted === 3) {
    update.status = 'completed';
    update.nextInstallmentAmount = null;
    update.nextInstallmentPercentage = null;
  }
  return update;
}

/** "Form" progressive disburse path: same math as table plus payment references. */
export function computeFormInstallmentUpdate(
  d: TableInstallmentInput,
  installmentNumber: number,
  payment: { transactionId: string; utrNumber: string; paymentMethod: string },
): DisbursementUpdatePayload {
  return {
    ...computeTableInstallmentUpdate(d, installmentNumber),
    transactionId: payment.transactionId,
    utrNumber: payment.utrNumber,
    paymentMethod: payment.paymentMethod,
  };
}

/** Reset-progress button inside the manual form. */
export function computeResetProgressUpdate(
  d: Pick<DisbursementRaw, 'reliefAmount' | 'installmentAmounts'>,
): DisbursementUpdatePayload {
  return {
    completedInstallments: 0,
    disbursementProgress: 0,
    currentInstallment: 1,
    nextInstallmentAmount:
      d.installmentAmounts?.[0] ?? Math.round((Number(d.reliefAmount) || 0) * 0.25),
    nextInstallmentPercentage: 25,
    lastUpdated: new Date().toISOString(),
  };
}

/** Legacy helper invoked on edit→completed; queries by custom `id` field. */
export function computeLegacyProgressiveCompletionUpdate(
  d: DisbursementRaw,
): DisbursementUpdatePayload {
  const currentCompleted = d.completedInstallments || 0;
  const total = d.totalInstallments || 3;
  const installmentAmounts = d.installmentAmounts || [];
  const installmentPercentages = d.installmentPercentages || [25, 75, 100];
  const newCompletedInstallments = Math.min(currentCompleted + 1, total);
  const newProgress = Math.min((newCompletedInstallments / total) * 100, 100);
  const nextIndex = newCompletedInstallments;

  return {
    completedInstallments: newCompletedInstallments,
    disbursementProgress: Math.round(newProgress),
    currentInstallment: Math.min(newCompletedInstallments + 1, total),
    nextInstallmentAmount: nextIndex < installmentAmounts.length ? installmentAmounts[nextIndex] : null,
    nextInstallmentPercentage: nextIndex < installmentPercentages.length ? installmentPercentages[nextIndex] : null,
    lastUpdated: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Document factories
// ---------------------------------------------------------------------------

/** Doc created automatically when an approved/completed application appears. */
export function buildAutoDisbursementFromApplication(
  appId: string,
  app: ApplicationRecord,
): Omit<DisbursementRecord, 'firestoreId'> {
  const base = {
    beneficiaryId: app.beneficiaryId || '',
    beneficiaryName: app.applicantName || app.name || '',
    district: app.district || '',
    state: app.state || '',
    transactionId: app.transactionId || null,
    utrNumber: app.utrNumber || null,
    paymentMethod: app.paymentMethod || null,
    retryCount: app.retryCount || 0,
    failureReason: app.failureReason || null,
    initiatedBy: app.assignedOfficer || null,
    verifiedBy: app.verifiedBy || null,
    applicationId: appId,
    ownerId: app.ownerId || '',
    isAuto: true,
    initiatedDate: initiatedDateFromApplication(app),
    actType: app.actType || app.caseType || 'relief',
  };

  if (isPoaAct(app.actType)) {
    const totalAmount = app.amount || 0;
    return {
      ...base,
      id: generateDisbursementId(),
      reliefAmount: totalAmount,
      transactionFee: 0,
      netAmount: totalAmount,
      disbursedAmount: 0, // Will be updated as installments are completed
      status: 'pending',
      isManual: undefined,
      isProgressivePayment: true,
      currentInstallment: 1,
      totalInstallments: 3,
      installmentAmounts: [Math.round(totalAmount * 0.25), Math.round(totalAmount * 0.75), totalAmount],
      installmentPercentages: [25, 75, 100],
      completedInstallments: 0,
      disbursementProgress: 0, // Percentage completed
      nextInstallmentAmount: Math.round(totalAmount * 0.25),
      nextInstallmentPercentage: 25,
    };
  }

  return {
    ...base,
    id: generateDisbursementId(),
    reliefAmount: app.amount || 0,
    transactionFee: 0,
    netAmount: app.amount || 0,
    disbursedAmount: app.disbursedAmount || 0,
    status: app.status === 'completed' ? 'completed' : (app.disbursementStatus || 'pending'),
    isManual: undefined,
    isProgressivePayment: false,
  };
}

export interface ManualCreateInput {
  beneficiaryId: string;
  applicationId: string;
  application: ApplicationRecord;
  reliefAmount: number;
  status: DisbursementStatus;
  actType: string;
  transactionId?: string;
  utrNumber?: string;
  paymentMethod?: string;
}

/** Doc created from the officer's manual form. */
export function buildManualDisbursement(
  input: ManualCreateInput,
): Omit<DisbursementRecord, 'firestoreId'> {
  const { application: app } = input;
  const base = {
    id: generateDisbursementId(),
    beneficiaryId: input.beneficiaryId,
    beneficiaryName: app.applicantName || app.name || '',
    district: app.district || '',
    state: app.state || '',
    transactionId: input.transactionId?.trim() || null,
    utrNumber: input.utrNumber?.trim() || null,
    paymentMethod: input.paymentMethod?.trim() || null,
    initiatedDate: new Date().toISOString(),
    actType: input.actType,
    retryCount: 0,
    failureReason: null,
    initiatedBy: 'manual',
    verifiedBy: null,
    applicationId: input.applicationId,
    ownerId: app.ownerId || '',
    isAuto: undefined,
    isManual: true,
  };
  const amount = input.reliefAmount;
  const completed = input.status === 'completed';

  if (isPoaAct(input.actType)) {
    return {
      ...base,
      reliefAmount: amount,
      transactionFee: 0,
      netAmount: amount,
      disbursedAmount: completed ? amount : 0,
      status: input.status,
      isProgressivePayment: true,
      currentInstallment: completed ? 3 : 1,
      totalInstallments: 3,
      installmentAmounts: [Math.round(amount * 0.25), Math.round(amount * 0.75), amount],
      installmentPercentages: [25, 75, 100],
      completedInstallments: completed ? 3 : 0,
      disbursementProgress: completed ? 100 : 0,
      nextInstallmentAmount: completed ? amount : Math.round(amount * 0.25),
      nextInstallmentPercentage: completed ? 100 : 25,
    };
  }

  return {
    ...base,
    reliefAmount: amount,
    transactionFee: 0,
    netAmount: amount,
    disbursedAmount: completed ? amount : 0,
    status: input.status,
    isProgressivePayment: false,
  };
}

/** Update payload produced by the manual form submit (edit mode). */
export function buildManualEditUpdate(input: {
  status: DisbursementStatus;
  transactionId?: string;
  utrNumber?: string;
  paymentMethod?: string;
  reliefAmount: number;
}): DisbursementUpdatePayload {
  const update: DisbursementUpdatePayload = {
    transactionId: input.transactionId?.trim() || null,
    utrNumber: input.utrNumber?.trim() || null,
    paymentMethod: input.paymentMethod?.trim() || null,
    status: input.status,
    lastUpdated: new Date().toISOString(),
  };
  if (input.status === 'completed') {
    update.disbursedAmount = input.reliefAmount;
    update.completedDate = new Date().toISOString();
  }
  return update;
}

// ---------------------------------------------------------------------------
// Validation shared by client and server
// ---------------------------------------------------------------------------

export type ManualFormValidationError =
  | 'beneficiary_and_application_required'
  | 'valid_amount_required';

export function validateManualForm(input: {
  beneficiaryId?: string;
  applicationId?: string;
  reliefAmountText?: string;
}): { ok: true } | { ok: false; error: ManualFormValidationError } {
  if (!input.beneficiaryId?.trim() || !input.applicationId?.trim()) {
    return { ok: false, error: 'beneficiary_and_application_required' };
  }
  const amount = parseFloat(String(input.reliefAmountText));
  if (Number.isNaN(amount) || amount <= 0) {
    return { ok: false, error: 'valid_amount_required' };
  }
  return { ok: true };
}

export function validateManualFormForCompletion(input: {
  beneficiaryId?: string;
  applicationId?: string;
  reliefAmountText?: string;
  actType?: string;
  transactionId?: string;
  paymentMethod?: string;
}): boolean {
  return Boolean(
    input.beneficiaryId?.trim() &&
    input.applicationId &&
    input.reliefAmountText?.trim() &&
    input.actType &&
    input.transactionId?.trim() &&
    input.paymentMethod,
  );
}

/** Server-side guard for installment disbursement requests. */
export function validateInstallmentRequest(
  record: DisbursementRaw,
  installmentNumber: number,
): { ok: true } | { ok: false; reason: string } {
  if (!Number.isInteger(installmentNumber) || installmentNumber < 1 || installmentNumber > 3) {
    return { ok: false, reason: 'invalid_installment_number' };
  }
  if ((Number(record.reliefAmount) || 0) <= 0) {
    return { ok: false, reason: 'invalid_relief_amount' };
  }
  const completed = record.completedInstallments || 0;
  const total = record.totalInstallments || 3;
  if (completed >= total) {
    return { ok: false, reason: 'all_installments_completed' };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Rich entity wrapper
// ---------------------------------------------------------------------------

export class Disbursement implements Entity, Auditable, Ownable, Approvable, ApplicationLinked {
  private constructor(private readonly raw: DisbursementRecord) {}

  static from(raw: DisbursementRecord): Disbursement {
    return new Disbursement(raw);
  }

  get record(): DisbursementRecord {
    return this.raw;
  }

  get firestoreId(): string {
    return this.raw.firestoreId;
  }

  /** Business id (`DIS…`), falls back to the document id. */
  get id(): string {
    return this.raw.id ?? this.raw.firestoreId;
  }

  get docRefId(): string {
    return this.raw.firestoreId || this.raw.id || '';
  }

  get beneficiaryName(): string {
    return this.raw.beneficiaryName ?? '';
  }

  get status(): DisbursementStatus {
    const s = (this.raw.status ?? '').replace('-', '_');
    return (DISBURSEMENT_STATUSES as readonly string[]).includes(s)
      ? (s as DisbursementStatus)
      : 'pending';
  }

  get reliefAmount(): number {
    return Number(this.raw.reliefAmount) || 0;
  }

  get disbursedAmount(): number {
    return Number(this.raw.disbursedAmount) || 0;
  }

  get actType(): string {
    return this.raw.actType ?? '';
  }

  get retryCount(): number {
    return this.raw.retryCount ?? 0;
  }

  get isProgressive(): boolean {
    return Boolean(this.raw.isProgressivePayment) || isPoaAct(this.raw.actType);
  }

  get completedInstallments(): number {
    return this.raw.completedInstallments ?? 0;
  }

  get totalInstallments(): number {
    return this.raw.totalInstallments ?? 3;
  }

  /** A pending disbursement may be approved once payment references are set. */
  isEligibleForApproval(): boolean {
    if (this.status !== 'pending') return false;
    if (this.reliefAmount <= 0) return false;
    if (this.isProgressive) return this.completedInstallments < this.totalInstallments;
    return true;
  }

  isFullyDisbursed(): boolean {
    if (!this.isProgressive) return this.status === 'completed';
    return this.completedInstallments >= this.totalInstallments;
  }

  statusSortRank(): number {
    return STATUS_SORT_RANK[this.status] ?? 99;
  }
}
