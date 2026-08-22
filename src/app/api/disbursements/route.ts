/**
 * Server boundary for disbursement creation.
 * Re-validates identity (Firebase ID token), role (officer for manual
 * creates) and business rules before the write reaches Firestore.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  buildAutoDisbursementFromApplication,
  buildManualDisbursement,
  validateManualForm,
  validateManualFormForCompletion,
  type ApplicationRecord,
  type DisbursementStatus,
} from '@/models/Disbursement';
import { authenticate, HttpError, jsonError, projectId, requireOfficer } from '@/lib/server/requestContext';
import { createDocument } from '@/lib/server/firestoreRest';

interface AutoBody {
  kind: 'autoFromApplication';
  applicationId: string;
  application: ApplicationRecord;
}

interface ManualBody {
  kind: 'manual';
  beneficiaryId: string;
  applicationId: string;
  application: ApplicationRecord;
  reliefAmountText: string;
  status: DisbursementStatus;
  actType: string;
  transactionId?: string;
  utrNumber?: string;
  paymentMethod?: string;
}

type CreateBody = AutoBody | ManualBody;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function POST(req: NextRequest) {
  try {
    const { user, idToken } = await authenticate(req);
    const body = (await req.json()) as unknown;

    if (!isRecord(body) || typeof body['kind'] !== 'string') {
      throw new HttpError(400, 'invalid_body');
    }

    if (body['kind'] === 'autoFromApplication') {
      const b = body as unknown as AutoBody;
      if (!b.applicationId || !isRecord(b.application)) throw new HttpError(400, 'invalid_body');
      const doc = buildAutoDisbursementFromApplication(b.applicationId, b.application);
      const ok = await createDocument(projectId(), idToken, 'disbursements', doc);
      if (!ok) throw new HttpError(502, 'firestore_write_failed');
      return NextResponse.json({ ok: true });
    }

    if (body['kind'] === 'manual') {
      const b = body as unknown as ManualBody;
      // Role gate: manual financial records may only be created by officers.
      await requireOfficer(idToken, user.uid);

      const validation = validateManualForm({
        beneficiaryId: b.beneficiaryId,
        applicationId: b.applicationId,
        reliefAmountText: b.reliefAmountText,
      });
      if (!validation.ok) throw new HttpError(422, validation.error);

      const amount = parseFloat(String(b.reliefAmountText));
      if (b.status === 'completed' &&
          !validateManualFormForCompletion({
            beneficiaryId: b.beneficiaryId,
            applicationId: b.applicationId,
            reliefAmountText: b.reliefAmountText,
            actType: b.actType,
            transactionId: b.transactionId,
            paymentMethod: b.paymentMethod,
          })) {
        throw new HttpError(422, 'all_fields_required_for_completion');
      }
      if (!b.applicationId || !isRecord(b.application)) throw new HttpError(422, 'application_not_found');

      const doc = buildManualDisbursement({
        beneficiaryId: String(b.beneficiaryId).trim(),
        applicationId: b.applicationId,
        application: b.application,
        reliefAmount: amount,
        status: b.status,
        actType: b.actType || 'relief',
        transactionId: b.transactionId,
        utrNumber: b.utrNumber,
        paymentMethod: b.paymentMethod,
      });
      const ok = await createDocument(projectId(), idToken, 'disbursements', doc);
      if (!ok) throw new HttpError(502, 'firestore_write_failed');
      return NextResponse.json({ ok: true });
    }

    throw new HttpError(400, 'unknown_kind');
  } catch (err) {
    return jsonError(err);
  }
}
