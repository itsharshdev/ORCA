import { getApiBaseUrl } from './apiConfig';

export interface AdapterHealthInfo {
  source: string;
  dataset: string;
  healthy: boolean;
  status: string;
  isLive: boolean;
  latencyMs: number;
  lastChecked: string;
  message?: string;
}

export interface AdapterListResponse {
  count: number;
  adapters: AdapterHealthInfo[];
  timestamp: string;
  frameworkVersion: string;
}

export const adapterService = {
  /**
   * Fetches health and registration status of all backend data adapters.
   */
  async fetchAdapters(): Promise<AdapterListResponse> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/adapters`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        count: 0,
        adapters: [],
        timestamp: new Date().toISOString(),
        frameworkVersion: '1.0.0',
      };
    }

    return (await response.json()) as AdapterListResponse;
  },
};
