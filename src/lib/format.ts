/** Pure formatting helpers shared across features. No React or Firebase imports. */

export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Deterministic date formatting (en-GB) to avoid SSR/client hydration mismatches. */
export function formatDateGB(value?: string | null): string {
  if (!value) return '\u2014';
  try {
    const d = new Date(value);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return value;
  }
}

export function initialsOf(name: string | null | undefined): string {
  if (!name) return '';
  return name.split(' ').map((n) => n[0]).join('');
}

/**
 * Normalises a status-like value ('in-progress' / 'in_progress') into the
 * canonical snake_case form used by translations.
 */
export function statusToTranslationKey(status?: string | null): string {
  if (!status) return '';
  return status.split(/[-_]/).map((s, i) => (i === 0 ? s : s[0].toUpperCase() + s.slice(1))).join('');
}

/** Converts Firestore TimestampLike | ISO string into a Date, or null. */
export interface TimestampLike {
  toDate: () => Date;
}

export function toDateSafe(
  value: string | TimestampLike | Date | null | undefined,
): Date | null {
  if (!value) return null;
  try {
    if (typeof value === 'string') {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === 'object' && typeof (value as TimestampLike).toDate === 'function') {
      return (value as TimestampLike).toDate();
    }
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const d = new Date(value as unknown as string);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}
