/**
 * Server boundary for sensitive disbursement mutations (status changes,
 * installment disbursement, progress reset, deletion).
 * Every operation re-verifies the caller's token + officer role and
 * re-validates business rules against the CURRENT server-side record.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  computeCardsInstallmentUpdate,
  computeFormInstallmentUpdate,
  computeLegacyProgressiveCompletionUpdate,
  computeResetProgressUpdate,
  computeTableInstallmentUpdate,
  DISBURSEMENT_STATUSES,
  type DisbursementRaw,
} from '@/models/Disbursement';
import {
  authenticate,
  HttpError,
  jsonError,
  loadRole,
  projectId,
  requireOfficer,
} from '@/lib/server/requestContext';
import {
  deleteDocument,
  getDocument,
  patchDocumentFields,
  queryCollectionByField,
} from '@/lib/server/firestoreRest';

interface OpBody {
  op: string;
  [key: string]: unknown;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

/** Replicates the legacy updateProgressivePaymentProgress side-effect. */
async function applyProgressiveCompletionSideWrite(
  idToken: string,
  customId: string,
  newStatus: string,
): Promise<void> {
  const matches = await queryCollectionByField(
    projectId(),
    idToken,
    'disbursements',
    'id',
    customId,
  );
  const record = matches[0] as unknown as DisbursementRaw | undefined;
  if (!record || !record.isProgressivePayment || newStatus !== 'completed') return;
  const update = computeLegacyProgressiveCompletionUpdate(record);
  await patchDocumentFields(
    projectId(),
    idToken,
    'disbursements',
    matches[0].firestoreId,
    update,
  );
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { user, idToken } = await authenticate(req);
    await requireOfficer(idToken, user.uid);
    const { id } = await ctx.params;
    const pid = projectId();

    const body = (await req.json()) as OpBody;
    if (!body || typeof body.op !== 'string') throw new HttpError(400, 'invalid_body');

    switch (body.op) {
      case 'manualUpdate': {
        const payload = asRecord(body.payload);
        if (!payload) throw new HttpError(400, 'invalid_payload');
        const status = payload['status'];
        if (typeof status !== 'string' || !(DISBURSEMENT_STATUSES as readonly string[]).includes(status)) {
          throw new HttpError(422, 'invalid_status');
        }
        // Legacy order: progressive side-write first, then the main update.
        if (status === 'completed' && typeof body.progressiveCustomId === 'string') {
          await applyProgressiveCompletionSideWrite(idToken, body.progressiveCustomId, status);
        }
        const ok = await patchDocumentFields(pid, idToken, 'disbursements', id, payload);
        if (!ok) throw new HttpError(502, 'firestore_write_failed');
        return NextResponse.json({ ok: true });
      }

      case 'installmentCards':
      case 'installmentTable':
      case 'installmentForm': {
        const current = await getDocument(pid, idToken, 'disbursements', id);
        if (!current) throw new HttpError(404, 'disbursement_not_found');
        const installmentNumber = Number(body.installmentNumber);
        if (!Number.isInteger(installmentNumber)) throw new HttpError(422, 'invalid_installment_number');

        const reliefAmount = Number(current['reliefAmount']) || 0;
        const completedInstallments = Number(current['completedInstallments']) || 0;
        const total = Number(current['totalInstallments']) || 3;
        if (reliefAmount <= 0) throw new HttpError(422, 'invalid_relief_amount');
        if (completedInstallments >= total) throw new HttpError(409, 'all_installments_completed');
        if (installmentNumber < 1 || installmentNumber > 3) throw new HttpError(422, 'invalid_installment_number');

        let update;
        if (body.op === 'installmentCards') {
          update = computeCardsInstallmentUpdate({ ...current, totalInstallments: total }, installmentNumber);
        } else if (body.op === 'installmentTable') {
          // Table path historically required payment references to exist already.
          if (!(current['transactionId'] && current['utrNumber'] && current['paymentMethod'])) {
            throw new HttpError(422, 'edit_required_for_table_disbursement');
          }
          update = computeTableInstallmentUpdate(
            { ...current, totalInstallments: total },
            installmentNumber,
          );
        } else {
          const payment = asRecord(body.payment);
          const transactionId = String(payment?.['transactionId'] ?? '').trim();
          const utrNumber = String(payment?.['utrNumber'] ?? '').trim();
          const paymentMethod = String(payment?.['paymentMethod'] ?? '');
          if (!transactionId || !utrNumber || !paymentMethod) {
            throw new HttpError(422, 'all_fields_required_for_progressive');
          }
          update = computeFormInstallmentUpdate(
            { ...current, totalInstallments: total },
            installmentNumber,
            { transactionId, utrNumber, paymentMethod },
          );
        }

        const ok = await patchDocumentFields(pid, idToken, 'disbursements', id, update);
        if (!ok) throw new HttpError(502, 'firestore_write_failed');
        return NextResponse.json({ ok: true, update });
      }

      case 'resetProgress': {
        const current = await getDocument(pid, idToken, 'disbursements', id);
        if (!current) throw new HttpError(404, 'disbursement_not_found');
        const update = computeResetProgressUpdate(current);
        const ok = await patchDocumentFields(pid, idToken, 'disbursements', id, update);
        if (!ok) throw new HttpError(502, 'firestore_write_failed');
        return NextResponse.json({ ok: true, update });
      }

      default:
        throw new HttpError(400, 'unknown_operation');
    }
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { user, idToken } = await authenticate(req);
    await requireOfficer(idToken, user.uid);
    const { id } = await ctx.params;

    const ok = await deleteDocument(projectId(), idToken, 'disbursements', id);
    if (!ok) throw new HttpError(502, 'firestore_write_failed');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
