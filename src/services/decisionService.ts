import type { DecisionDetailResponse } from '@/types/contract';
import { getApiBaseUrl } from './apiConfig';

export const decisionService = {
  /**
   * Fetches full audited decision details by ID from the ORCA backend.
   */
  async fetchDecisionById(decisionId: string): Promise<DecisionDetailResponse> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/decisions/${encodeURIComponent(decisionId)}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: Decision '${decisionId}' could not be retrieved.`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // fallback
      }
      throw new Error(errorMessage);
    }

    return (await response.json()) as DecisionDetailResponse;
  },
};
