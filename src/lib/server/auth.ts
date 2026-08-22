/**
 * Server-side Firebase ID token verification without firebase-admin
 * credentials. Verifies RS256 signatures against Google's public JWKs and
 * checks issuer/audience exactly as admin SDK would.
 *
 * Swappable: once a service account is provisioned, replace with
 * `admin.auth().verifyIdToken()` behind the same exported function signature.
 */
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

const FIREBASE_JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const FIREBASE_ISSUER_BASE = 'https://securetoken.google.com/';

let remoteJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function jwks(): ReturnType<typeof createRemoteJWKSet> {
  if (!remoteJwks) remoteJwks = createRemoteJWKSet(new URL(FIREBASE_JWKS_URL));
  return remoteJwks;
}

export interface VerifiedUser {
  uid: string;
  email?: string;
}

export async function verifyIdToken(token: string, projectId: string): Promise<VerifiedUser> {
  const { payload } = await jwtVerify(token, jwks(), {
    issuer: `${FIREBASE_ISSUER_BASE}${projectId}`,
    audience: projectId,
  });
  return claimsToUser(payload);
}

export function claimsToUser(payload: JWTPayload): VerifiedUser {
  const uid = payload.user_id ?? payload.sub;
  if (!uid || typeof uid !== 'string') throw new Error('Token missing subject');
  return { uid, email: typeof payload.email === 'string' ? payload.email : undefined };
}

/** Extracts `Bearer <token>` from an Authorization header value. */
export function bearerFromHeader(header: string | null): string | null {
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1] : null;
}
