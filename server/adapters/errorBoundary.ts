import type { AdapterResponse, AdapterErrorDetail } from './types.js';

/**
 * Executes an async task with an enforced timeout in milliseconds.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = `Operation timed out after ${timeoutMs}ms`
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Creates a structured error AdapterResponse for failed adapter operations.
 */
export function createErrorAdapterResponse<T = unknown>(
  source: string,
  dataset: string,
  sourceType: any,
  status: 'TIMEOUT' | 'UNAVAILABLE' | 'INVALID_RESPONSE' | 'RATE_LIMITED' | 'DEGRADED',
  errorDetail: AdapterErrorDetail,
  metadata: Record<string, unknown> = {}
): AdapterResponse<T> {
  const now = new Date().toISOString();
  return {
    source,
    dataset,
    sourceType,
    status,
    retrievedAt: now,
    observedAt: now,
    validUntil: null,
    quality: 'DEGRADED',
    isLive: false,
    payload: null,
    normalizedObservations: [],
    error: errorDetail,
    metadata: {
      ...metadata,
      handledByErrorBoundary: true,
    },
  };
}
