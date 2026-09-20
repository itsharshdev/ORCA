import type {
  NormalizedObservationContract,
  ObservationsListResponse,
  ObservationCategory,
} from '../types/contract';

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // If running with Vite dev server on port 5173, point directly to backend at port 3000 if not proxied
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  }
  return import.meta.env.VITE_API_BASE_URL || '/api/v1';
};

export interface FetchObservationsParams {
  category?: ObservationCategory;
  dataset?: string;
  variableName?: string;
  region?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface ObservationServiceResult {
  success: boolean;
  observations: NormalizedObservationContract[];
  total: number;
  isPersistedBackend: boolean;
  error?: string | null;
}

/**
 * Service to retrieve normalized environmental observations from ORCA backend.
 */
export const observationService = {
  async fetchObservations(
    params: FetchObservationsParams = {}
  ): Promise<ObservationServiceResult> {
    const baseUrl = getApiBaseUrl();
    const queryParams = new URLSearchParams();

    if (params.category) queryParams.set('category', params.category);
    if (params.dataset) queryParams.set('dataset', params.dataset);
    if (params.variableName) queryParams.set('variableName', params.variableName);
    if (params.region) queryParams.set('region', params.region);
    if (params.status) queryParams.set('status', params.status);
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.offset) queryParams.set('offset', String(params.offset));

    const url = `${baseUrl}/observations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          observations: [],
          total: 0,
          isPersistedBackend: false,
          error: `Backend returned HTTP ${response.status}`,
        };
      }

      const data = (await response.json()) as ObservationsListResponse;
      return {
        success: true,
        observations: data.observations || [],
        total: data.total || 0,
        isPersistedBackend: true,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return {
        success: false,
        observations: [],
        total: 0,
        isPersistedBackend: false,
        error: msg,
      };
    }
  },

  async triggerDemoIngestion(regions?: string[]): Promise<{
    success: boolean;
    totalProcessed?: number;
    inserted?: number;
    updated?: number;
    error?: string;
  }> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/ingestion/demo`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ regions }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
        };
      }

      const result = await response.json();
      return {
        success: result.success,
        totalProcessed: result.summary?.totalProcessed,
        inserted: result.summary?.inserted,
        updated: result.summary?.updated,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to trigger ingestion',
      };
    }
  },

  async triggerIncoisIngestion(params: {
    latitude?: number;
    longitude?: number;
    region?: string;
    allowFallback?: boolean;
  } = {}): Promise<{
    success: boolean;
    source?: string;
    dataset?: string;
    isLive?: boolean;
    fallbackUsed?: boolean;
    totalReceived?: number;
    inserted?: number;
    updated?: number;
    error?: string;
  }> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/ingestion/incois`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
        };
      }

      const result = await response.json();
      return {
        success: result.success,
        source: result.source,
        dataset: result.dataset,
        isLive: result.isLive,
        fallbackUsed: result.fallbackUsed,
        totalReceived: result.summary?.totalReceived,
        inserted: result.summary?.inserted,
        updated: result.summary?.updated,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to trigger INCOIS ingestion',
      };
    }
  },
};
