/**
 * Shared Route Handler plumbing: authenticate the caller, resolve their role,
 * and produce JSON errors consistently.
 */
import { NextResponse } from 'next/server';
import { bearerFromHeader, verifyIdToken, type VerifiedUser } from './auth';
import { getDocument } from './firestoreRest';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export function projectId(): string {
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
}

export function jsonError(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.code }, { status: err.status });
  }
  const message = err instanceof Error ? err.message : 'internal_error';
  console.error('[api]', message);
  return NextResponse.json({ error: 'internal_error' }, { status: 500 });
}

/** Verifies the Authorization header and returns the caller identity. */
export async function authenticate(req: Request): Promise<{ user: VerifiedUser; idToken: string }> {
  const token = bearerFromHeader(req.headers.get('authorization'));
  if (!token) throw new HttpError(401, 'missing_token');
  const pid = projectId();
  if (!pid) throw new HttpError(500, 'server_not_configured', 'Missing project id');
  try {
    const user = await verifyIdToken(token, pid);
    return { user, idToken: token };
  } catch {
    throw new HttpError(401, 'invalid_token');
  }
}

/** Loads the caller's profile role from Firestore (self-read via their token). */
export async function loadRole(idToken: string, uid: string): Promise<string | null> {
  const profile = await getDocument(projectId(), idToken, 'users', uid);
  const role = profile?.['role'];
  return typeof role === 'string' ? role : null;
}

/** Officer gate for sensitive disbursement mutations. */
export async function requireOfficer(idToken: string, uid: string): Promise<void> {
  const role = await loadRole(idToken, uid);
  if (role !== 'officer') throw new HttpError(403, 'officer_role_required');
}
