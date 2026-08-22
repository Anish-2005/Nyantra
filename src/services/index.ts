'use client';

/**
 * Composition root for the default service implementations.
 * Swappable in tests via createDisbursementService / createApplicationService.
 */
import { auth } from '@/lib/firebase/client';
import type {
  ApplicationRecord,
  DisbursementRaw,
} from '@/models/Disbursement';
import type { TokenProvider } from './http/apiClient';
import { createHttpMutations } from './http/apiClient';
import { createDisbursementService } from './disbursementService';
import type { DisbursementServiceApi } from './interfaces';
import { createApplicationService } from './applicationService';
import { FirestoreRepository } from './core/FirestoreRepository';

/** Default token source: the signed-in Firebase user. */
export const firebaseTokenProvider: TokenProvider = {
  async getIdToken() {
    const user = auth.currentUser;
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  },
};

const disbursementsRepo = new FirestoreRepository<DisbursementRaw>('disbursements');
const applicationsRepo = new FirestoreRepository<ApplicationRecord>('applications');

export const applicationService = createApplicationService(applicationsRepo);

const http = createHttpMutations(firebaseTokenProvider);

export const disbursementService: DisbursementServiceApi = createDisbursementService({
  disbursements: disbursementsRepo,
  applications: applicationService,
  http,
});
