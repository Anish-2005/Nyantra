/**
 * Narrow, purpose-specific capability interfaces (Interface Segregation).
 * Domain models implement only the capabilities they actually have.
 */

export type Role = 'officer' | 'user';

export interface Entity {
  /** Firestore document id (distinct from domain/business id fields). */
  readonly firestoreId: string;
}

export interface Ownable {
  ownerId?: string | null;
}

export interface Auditable {
  createdAt?: string | null;
  lastUpdated?: string | null;
}

/** Something that can pass through an approval gate. */
export interface Approvable {
  status: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

/** Something linked back to a beneficiary application. */
export interface ApplicationLinked {
  applicationId?: string | null;
  beneficiaryId?: string | null;
}

export interface Retryable {
  retryCount: number;
  failureReason?: string | null;
}

export type UnsubscribeFn = () => void;

/** Generic read-side port used by services (Dependency Inversion). */
export interface CollectionReader<T> {
  fetchAll(): Promise<T[]>;
  findByField(field: string, value: unknown): Promise<T[]>;
  subscribe(onData: (items: T[]) => void, onError: (error: Error) => void): UnsubscribeFn;
}

/** Generic write-side port. Sensitive domains swap this for the HTTP transport. */
export interface CollectionWriter<T> {
  add(data: Omit<T, 'firestoreId'>): Promise<string>;
  update(firestoreId: string, partial: Partial<T>): Promise<void>;
  remove(firestoreId: string): Promise<void>;
}

export interface Repository<T> extends CollectionReader<T>, CollectionWriter<T> {}
