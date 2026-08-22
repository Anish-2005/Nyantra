/**
 * Application read service — only queries needed by feature flows live here.
 * Applications remain client-read; sensitive application writes are handled
 * inside their own feature boundary (see applications refactor).
 */
import type { UnsubscribeFn } from '@/models/common';
import { whereIn, type QueryConstraint } from '@/lib/firebase/firestore';
import type {
  ApplicationRecord,
} from '@/models/Disbursement';
import type { ApplicationQueryService } from './interfaces';

export interface ApplicationRepoPort {
  findByField(field: string, value: unknown): Promise<Array<ApplicationRecord & { firestoreId: string }>>;
  subscribe(
    onData: (items: Array<ApplicationRecord & { firestoreId: string }>) => void,
    onError: (e: Error) => void,
    constraints?: QueryConstraint[],
  ): UnsubscribeFn;
}

/** Maps repository docs ({firestoreId}) to legacy shape ({id}). */
function toLegacyId<T extends { firestoreId: string }>(doc: T): T & { id: string } {
  return { ...doc, id: doc.firestoreId };
}

export function createApplicationService(repo: ApplicationRepoPort): ApplicationQueryService {
  return {
    async listByBeneficiary(beneficiaryId) {
      const trimmed = beneficiaryId.trim();
      if (!trimmed) return [];
      const items = await repo.findByField('beneficiaryId', trimmed);
      return items.map(toLegacyId);
    },

    subscribeApprovedOrCompleted(onData, onError) {
      return repo.subscribe(
        (items) => onData(items.map(toLegacyId)),
        onError,
        [whereIn('status', ['approved', 'completed'])],
      );
    },
  };
}

/** Re-exported for repository composition roots. */
export type { QueryConstraint };
