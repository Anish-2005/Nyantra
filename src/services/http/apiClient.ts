/**
 * HTTP client for server-boundary mutations. Attaches the caller's Firebase
 * ID token so Route Handlers can re-verify identity + role server-side.
 */
export interface TokenProvider {
  getIdToken(): Promise<string | null>;
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T = unknown>(
  tokenProvider: TokenProvider,
  method: 'POST' | 'PATCH' | 'DELETE',
  url: string,
  body?: unknown,
): Promise<T> {
  const token = await tokenProvider.getIdToken();
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      // ignore body parse issues
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json().catch(() => null)) as T;
}

export function createHttpMutations(tokenProvider: TokenProvider) {
  return {
    post: <T>(url: string, body?: unknown) => request<T>(tokenProvider, 'POST', url, body),
    patch: <T>(url: string, body?: unknown) => request<T>(tokenProvider, 'PATCH', url, body),
    delete: <T>(url: string) => request<T>(tokenProvider, 'DELETE', url),
  };
}

export type HttpMutations = ReturnType<typeof createHttpMutations>;
