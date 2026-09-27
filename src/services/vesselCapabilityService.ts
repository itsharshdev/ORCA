import type {
  VesselCapabilityContract,
  CapabilityEvaluationRequest,
  CapabilityEvaluationResponse,
} from '@/types/contract';
import { getApiBaseUrl } from './apiConfig';

export const vesselCapabilityService = {
  /**
   * Fetches full capability profile with threshold provenance metadata for a vessel.
   */
  async fetchCapability(vesselId: string): Promise<VesselCapabilityContract> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/vessels/${encodeURIComponent(vesselId)}/capability`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch capability for vessel '${vesselId}'`);
    }

    return (await response.json()) as VesselCapabilityContract;
  },

  /**
   * Updates capability fields and threshold provenance metadata.
   */
  async updateCapability(
    vesselId: string,
    updates: Partial<VesselCapabilityContract>
  ): Promise<VesselCapabilityContract> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/vessels/${encodeURIComponent(vesselId)}/capability`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to update vessel capability`);
    }

    return (await response.json()) as VesselCapabilityContract;
  },

  /**
   * Deterministically evaluates mission and environmental parameters against vessel capability model.
   */
  async evaluateCapability(req: CapabilityEvaluationRequest): Promise<CapabilityEvaluationResponse> {
    const baseUrl = getApiBaseUrl();
    const url = req.vesselId
      ? `${baseUrl}/vessels/${encodeURIComponent(req.vesselId)}/evaluate-capability`
      : `${baseUrl}/vessels/evaluate-capability`;

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
        throw new Error(`HTTP ${response.status}: Failed to evaluate vessel capability`);
      }

      return (await response.json()) as CapabilityEvaluationResponse;
    } catch (err) {
      console.warn('Vessel capability evaluation API call failed, generating fallback response:', err);
      // Fallback evaluation if backend is temporarily unreachable
      return {
        vesselId: req.vesselId || 'LOCAL-FALLBACK',
        vesselName: req.vesselOverrides?.name || 'Local Vessel Profile',
        vesselType: req.vesselOverrides?.vesselType || 'TRADITIONAL_MOTORIZED',
        evaluatedAt: new Date().toISOString(),
        allPassed: false,
        hasCriticalFailure: false,
        hasWarnings: true,
        evaluations: [
          {
            constraintId: 'CONST-OFFLINE-01',
            category: 'CERTIFICATION',
            input: { name: 'connectivity', value: 'OFFLINE' },
            configuredLimit: { value: 'ONLINE_AUTHORITATIVE' },
            actualValue: 'OFFLINE',
            status: 'CAUTION',
            severity: 'WARNING',
            reason: 'Backend capability service unreachable; offline client fallback.',
            sourceStatus: 'UNKNOWN',
            sourceDescription: 'Client Fallback',
          },
        ],
        summary: {
          passedCount: 0,
          cautionCount: 1,
          failedCount: 0,
          unknownCount: 0,
          notApplicableCount: 0,
        },
        provenance: {
          engine: 'CLIENT_OFFLINE_FALLBACK',
          rulesEvaluatedCount: 1,
          thresholdBreakdown: {
            officialSourced: 0,
            vesselSpecific: 0,
            prototypeAssumption: 0,
            unknown: 1,
          },
        },
      };
    }
  },
};
