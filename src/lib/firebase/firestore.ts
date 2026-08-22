// Thin, typed wrappers around the Firestore SDK.
// Nothing above this layer may import 'firebase/firestore' directly —
// services depend on these helpers (or the repository built on them).
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy as fbOrderBy,
  limit as fbLimit,
  type QueryConstraint,
  type Unsubscribe,
  type DocumentData,
  type FieldPath,
} from 'firebase/firestore';
import { db } from './client';

/** A domain record augmented with the Firestore document id. */
export type WithFirestoreId<T> = T & { firestoreId: string };

export type { Unsubscribe, QueryConstraint };

export function whereEqual(field: string | FieldPath, value: unknown): QueryConstraint {
  return where(field, '==', value);
}

export function whereIn(field: string, values: readonly unknown[]): QueryConstraint {
  return where(field, 'in', values as unknown[]);
}

export function orderAscending(field: string): QueryConstraint {
  return fbOrderBy(field, 'asc');
}

export function limitTo(count: number): QueryConstraint {
  return fbLimit(count);
}

function buildQuery(collectionName: string, constraints: readonly QueryConstraint[]) {
  const ref = collection(db, collectionName);
  return constraints.length > 0 ? query(ref, ...constraints) : ref;
}

function mapDocs<T>(docs: { id: string; data(): DocumentData }[]): WithFirestoreId<T>[] {
  return docs.map((d) => ({ ...(d.data() as T), firestoreId: d.id }));
}

export async function fetchDocuments<T>(
  collectionName: string,
  constraints: readonly QueryConstraint[] = [],
): Promise<WithFirestoreId<T>[]> {
  const snap = await getDocs(buildQuery(collectionName, constraints));
  return mapDocs<T>(snap.docs);
}

export async function fetchDocumentById<T>(
  collectionName: string,
  id: string,
): Promise<WithFirestoreId<T> | null> {
  const snap = await getDoc(doc(db, collectionName, id));
  if (!snap.exists()) return null;
  return { ...(snap.data() as T), firestoreId: snap.id };
}

export function subscribeToCollection<T>(
  collectionName: string,
  constraints: readonly QueryConstraint[],
  onData: (items: WithFirestoreId<T>[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    buildQuery(collectionName, constraints),
    (snap) => {
      try {
        onData(mapDocs<T>(snap.docs));
      } catch (err) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    (err) => onError(err),
  );
}

export async function findDocumentsByField<T>(
  collectionName: string,
  field: string,
  value: unknown,
): Promise<WithFirestoreId<T>[]> {
  return fetchDocuments<T>(collectionName, [whereEqual(field, value)]);
}

export async function addDocument<T extends object>(
  collectionName: string,
  data: T,
): Promise<string> {
  const ref = await addDoc(collection(db, collectionName), data);
  return ref.id;
}

export async function updateDocumentFields(
  collectionName: string,
  documentId: string,
  partial: Record<string, unknown>,
): Promise<void> {
  await updateDoc(doc(db, collectionName, documentId), partial);
}

export async function deleteDocumentById(
  collectionName: string,
  documentId: string,
): Promise<void> {
  await deleteDoc(doc(db, collectionName, documentId));
}
