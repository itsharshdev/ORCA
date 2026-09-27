import type { ScenarioEvaluationRequest, ScenarioEvaluationResponse } from '@/types/contract';
import { getApiBaseUrl } from './apiConfig';

export const scenarioService = {
  /**
   * Evaluates a What-If / Scenario request deterministically through the ORCA backend.
   */
  async evaluateScenario(payload: ScenarioEvaluationRequest): Promise<ScenarioEvaluationResponse> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/scenarios/evaluate`;

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
      let errorMessage = `HTTP ${response.status}: Failed to evaluate scenario`;
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

    return (await response.json()) as ScenarioEvaluationResponse;
  },
};
