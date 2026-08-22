/**
 * Server-side Firestore access via the REST API using the *caller's* verified
 * ID token. Security rules remain the final authority; this layer adds
 * server-side role/business-rule validation before any write is attempted.
 *
 * Swappable for firebase-admin writes by implementing the same functions with
 * the Admin SDK once a service account is configured.
 */

const REST_BASE = 'https://firestore.googleapis.com/v1/projects';

interface RestValue {
  [type: string]: unknown;
}
interface RestFields {
  [field: string]: RestValue;
}
interface RestDocument {
  name: string;
  fields?: RestFields;
}

function toRestValue(value: unknown): RestValue {
  if (value === null || value === undefined) return { nullValue: null };
  switch (typeof value) {
    case 'string':
      return { stringValue: value };
    case 'boolean':
      return { booleanValue: value };
    case 'number':
      return Number.isInteger(value)
        ? { integerValue: String(value) }
        : { doubleValue: value };
    default:
      if (Array.isArray(value)) {
        return { arrayValue: { values: value.map(toRestValue) } };
      }
      if (value instanceof Date) {
        return { timestampValue: value.toISOString() };
      }
      // Nested plain objects
      return {
        mapValue: {
          fields: Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, toRestValue(v)]),
          ),
        },
      };
  }
}

function fromRestValue(value: RestValue): unknown {
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) {
    const arr = (value.arrayValue as { values?: RestValue[] }).values;
    return (arr ?? []).map(fromRestValue);
  }
  if ('mapValue' in value) {
    const fields = (value.mapValue as { fields?: RestFields }).fields;
    return fields ? fieldsToPlain(fields) : {};
  }
  return null;
}

export function fieldsToPlain(fields: RestFields): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, fromRestValue(v)]));
}

async function call(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  idToken: string,
  body?: unknown,
): Promise<Response> {
  return fetch(`${REST_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** Fetch a single document (typed loosely — server treats data defensively). */
export async function getDocument(
  projectId: string,
  idToken: string,
  collectionName: string,
  documentId: string,
): Promise<Record<string, unknown> | null> {
  const res = await call(
    'GET',
    `/${projectId}/databases/(default)/documents/${collectionName}/${documentId}`,
    idToken,
  );
  if (!res.ok) return null;
  const doc = (await res.json()) as RestDocument;
  return doc.fields ? fieldsToPlain(doc.fields) : {};
}

/**
 * Runs a structured query restricted to one collection with a single
 * field == value filter. Returns plain records plus their document ids.
 */
export async function queryCollectionByField(
  projectId: string,
  idToken: string,
  collectionName: string,
  field: string,
  value: unknown,
): Promise<Array<Record<string, unknown> & { firestoreId: string }>> {
  const path = `/${projectId}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: collectionName }],
      where: {
        fieldFilter: {
          field: { fieldPath: field },
          op: 'EQUAL',
          value: toRestValue(value),
        },
      },
    },
  };
  const res = await call('POST', path, idToken, body);
  if (!res.ok) return [];
  const entries = (await res.json()) as Array<{ document?: RestDocument }>;
  return entries
    .filter((e) => e.document)
    .map((e) => ({
      ...(e.document?.fields ? fieldsToPlain(e.document.fields) : {}),
      firestoreId: e.document!.name.split('/').pop()!,
    }));
}

/** Creates a document with an auto-generated id. */
export async function createDocument(
  projectId: string,
  idToken: string,
  collectionName: string,
  fields: Record<string, unknown>,
): Promise<boolean> {
  const res = await call('POST', `/${projectId}/databases/(default)/documents/${collectionName}`, idToken, {
    fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, toRestValue(v)])),
  });
  return res.ok;
}

/** Updates selected fields of a document (merge semantics). */
export async function patchDocumentFields(
  projectId: string,
  idToken: string,
  collectionName: string,
  documentId: string,
  fields: Record<string, unknown>,
): Promise<boolean> {
  const mask = Object.keys(fields).map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`);
  const url =
    `/${projectId}/databases/(default)/documents/${collectionName}/${documentId}` +
    (mask.length ? `?${mask.join('&')}` : '');
  const res = await call('PATCH', url, idToken, {
    fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, toRestValue(v)])),
  });
  return res.ok;
}

/** Deletes a document. */
export async function deleteDocument(
  projectId: string,
  idToken: string,
  collectionName: string,
  documentId: string,
): Promise<boolean> {
  const res = await call(
    'DELETE',
    `/${projectId}/databases/(default)/documents/${collectionName}/${documentId}`,
    idToken,
  );
  return res.ok;
}
