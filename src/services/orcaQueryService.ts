import type { OrcaQueryRequest, Phase16OrcaQueryResponse } from '@/types/contract';
import { getApiBaseUrl } from './apiConfig';

export interface ExtendedOrcaQueryRequest extends OrcaQueryRequest {
  conversationId?: string;
  operatorRole?: 'FISHERMAN' | 'AUTHORITY' | 'DISASTER' | 'RESEARCHER' | 'OPERATOR';
}

export const orcaQueryService = {
  /**
   * Executes a multi-agent decision evaluation query against the ORCA backend.
   */
  async queryOrca(payload: ExtendedOrcaQueryRequest): Promise<Phase16OrcaQueryResponse> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/orca/query`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: Failed to process ORCA query`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // use fallback errorMessage
      }
      throw new Error(errorMessage);
    }

    return (await response.json()) as Phase16OrcaQueryResponse;
  },
};

