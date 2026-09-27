import type {
  RouteEvaluationRequest,
  GisSafetyEvaluationResponse,
  RestrictedZoneRecord,
} from '@/types/contract';
import { getApiBaseUrl } from './apiConfig';

export const gisSafetyService = {
  /**
   * Evaluates route waypoints and vessel position against spatial boundaries and hazards.
   */
  async evaluateRoute(req: RouteEvaluationRequest): Promise<GisSafetyEvaluationResponse> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/gis/evaluate-route`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(req),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to evaluate route safety`);
      }

      const data = (await response.json()) as GisSafetyEvaluationResponse;
      return data;
    } catch (err) {
      console.warn('GIS Safety Evaluation API call failed, generating fallback:', err);
      // Honest fallback when backend is unreachable
      return {
        status: 'CAUTION',
        safetyClearance: false,
        overallVerdict: 'CAUTION',
        summary: 'GIS safety service temporarily unreachable — clearance unverified.',
        explanation: 'Authoritative backend GIS spatial evaluation could not be contacted. Exercise caution.',
        restrictions: [],
        hazards: [],
        proximityChecks: {
          nearestRestrictedZone: {
            name: 'Restricted Zones (Unverified)',
            distanceKm: 0,
            bufferKm: 1.0,
            isBreached: false,
          },
        },
        routeIntersections: [],
        evaluatedAt: new Date().toISOString(),
        provenance: {
          engine: 'CLIENT_OFFLINE_UNVERIFIED',
          evaluatedZonesCount: 0,
          evaluatedHazardsCount: 0,
          rulesEnforced: ['RULE_BACKEND_REACHABILITY_CHECK'],
          isLiveSpatialData: false,
        },
      };
    }
  },

  /**
   * Fetches active maritime restricted zones for map visualization.
   */
  async fetchRestrictedZones(): Promise<RestrictedZoneRecord[]> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/gis/restricted-zones`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      return (json.zones || []) as RestrictedZoneRecord[];
    } catch (err) {
      console.warn('Failed to load restricted zones from server:', err);
      return [];
    }
  },
};
