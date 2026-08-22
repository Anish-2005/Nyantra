/**
 * Generic Firestore repository (DRY base for all feature services).
 * Composes the thin wrappers in lib/firebase/firestore; knows nothing about
 * individual domains. Feature services extend or compose this class.
 */
import type { Repository, UnsubscribeFn } from '@/models/common';
import {
  addDocument,
  deleteDocumentById,
  fetchDocuments,
  findDocumentsByField,
  subscribeToCollection,
  updateDocumentFields,
  WithFirestoreId,
  type QueryConstraint,
} from '@/lib/firebase/firestore';

export class FirestoreRepository<T extends object> implements Repository<WithFirestoreId<T>> {
  constructor(protected readonly collectionName: string) {}

  async fetchAll(constraints: readonly QueryConstraint[] = []): Promise<WithFirestoreId<T>[]> {
    return fetchDocuments<T>(this.collectionName, constraints);
  }

  async findByField(field: string, value: unknown): Promise<WithFirestoreId<T>[]> {
    return findDocumentsByField<T>(this.collectionName, field, value);
  }

  subscribe(
    onData: (items: WithFirestoreId<T>[]) => void,
    onError: (error: Error) => void,
    constraints: readonly QueryConstraint[] = [],
  ): UnsubscribeFn {
    return subscribeToCollection<T>(this.collectionName, constraints, onData, onError);
  }

  add(data: Omit<WithFirestoreId<T>, 'firestoreId'>): Promise<string> {
    return addDocument(this.collectionName, data);
  }

  update(firestoreId: string, partial: Partial<WithFirestoreId<T>>): Promise<void> {
    return updateDocumentFields(this.collectionName, firestoreId, partial as Record<string, unknown>);
  }

  remove(firestoreId: string): Promise<void> {
    return deleteDocumentById(this.collectionName, firestoreId);
  }
}
