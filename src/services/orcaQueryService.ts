import type { 
  OrcaQueryRequest, 
  Phase16OrcaQueryResponse, 
  DecisionDetailResponse,
  LlmStructuredIntent,
  LlmExplanationResult
} from '@/types/contract';
import { getApiBaseUrl } from './apiConfig';
import { connectivityService } from './connectivityService';
import { offlineCacheService } from './offlineCacheService';

export interface ExtendedOrcaQueryRequest extends OrcaQueryRequest {
  conversationId?: string;
  operatorRole?: 'FISHERMAN' | 'AUTHORITY' | 'DISASTER' | 'RESEARCHER' | 'OPERATOR';
}

export const orcaQueryService = {
  /**
   * Executes a multi-agent decision evaluation query against the ORCA backend.
   * Offline Safety Invariant: When offline, Ask ORCA NEVER invents real-time weather or clears a trip.
   * Returns INSUFFICIENT_DATA or inspects valid cached decision history with explicit labeling.
   */
  async queryOrca(payload: ExtendedOrcaQueryRequest): Promise<Phase16OrcaQueryResponse> {
    const conn = connectivityService.getStatus();
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/orca/query`;

    if (conn.isOnline && conn.apiReachable) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = (await response.json()) as Phase16OrcaQueryResponse;

          // Pre-cache decision for offline inspection
          if (result.decision) {
            offlineCacheService.cacheDecision({
              decision: result.decision,
              missionContext: {
                activity: result.parsedIntent?.activity || 'FISHING',
                departureTime: result.parsedIntent?.departureTime || new Date().toISOString(),
                durationHours: result.parsedIntent?.durationHours || 6,
                vessel: {
                  vesselId: result.parsedIntent?.vesselId || 'DEFAULT',
                  name: 'Default Vessel',
                  vesselType: 'MOTORIZED',
                  lengthMeters: 9,
                  maxDraftMeters: 1.2,
                  maxSpeedKnots: 10,
                  cruisingSpeedKnots: 7,
                  fuelCapacityLiters: 100,
                  fuelBurnRateLitersPerHour: 6,
                  operationalEnvelope: {
                    maxWaveHeightMeters: 1.8,
                    maxWindSpeedKnots: 20,
                    maxDistanceOffshoreKm: 30,
                  },
                } as any,
              },
              fullEvidenceLog: result.evidence || [],
            }).catch(console.warn);
          }

          return result;
        }
      } catch (err) {
        console.warn('Network orca query failed, utilizing offline safety handler:', err);
      }
    }

    // Offline Handling
    return handleOfflineOrcaQuery(payload);
  },
};

/**
 * Deterministically evaluates Ask ORCA queries under OFFLINE conditions without hallucinating.
 */
async function handleOfflineOrcaQuery(
  payload: ExtendedOrcaQueryRequest
): Promise<Phase16OrcaQueryResponse> {
  const queryLower = (payload.queryText || '').toLowerCase();
  const cachedDecisions = await offlineCacheService.getAll<DecisionDetailResponse>('decisions');

  const isHistoricalInquiry =
    queryLower.includes('last decision') ||
    queryLower.includes('previous') ||
    queryLower.includes('past trip') ||
    queryLower.includes('history') ||
    queryLower.includes('what was');

  if (isHistoricalInquiry && cachedDecisions.length > 0) {
    const latest = cachedDecisions[cachedDecisions.length - 1].data;
    const dec = latest.decision;
    const explanationText = `[CACHED HISTORICAL REPLAY] Showing your last evaluated mission (${dec.decisionId}) evaluated at ${dec.evaluatedAt}. The verdict was ${dec.verdict}: ${dec.explanation}. Note: Real-time telemetry is currently offline.`;

    const llmIntent: LlmStructuredIntent = {
      intentId: `INTENT-OFFLINE-${Date.now()}`,
      rawQuery: payload.queryText || 'What was my last decision?',
      activity: 'FISHING',
      questionType: 'EXPLANATION',
      location: {
        regionId: 'mumbai',
      },
      departureWindow: {
        timeString: dec.recommendedDeparture || 'Previous Mission',
        isEstimated: false,
      },
      durationHours: 6,
      vessel: {
        isExplicit: false,
      },
      constraints: [],
      requiresClarification: false,
      confidenceScore: 95,
      extractedEntities: {},
    };

    const llmExplanation: LlmExplanationResult = {
      summary: `[CACHED HISTORICAL REPLAY] Last verdict: ${dec.verdict}`,
      detailedReasoning: explanationText,
      actionableAdvisories: [
        'Historical record only. Telemetry is not current.',
        'Obtain live meteorological update before making voyage decisions.',
      ],
      citedEvidenceIds: [],
      providerUsed: 'DETERMINISTIC_FALLBACK',
      modelUsed: 'orca-deterministic-offline-v1',
      generatedAt: new Date().toISOString(),
      isFallback: true,
    };

    return {
      queryId: `QRY-OFFLINE-HIST-${Date.now()}`,
      conversationId: payload.conversationId || 'CONV-OFFLINE',
      turnId: 'TURN-OFFLINE-01',
      llmIntent,
      llmExplanation,
      shortAnswer: explanationText,
      parsedIntent: {
        activity: 'FISHING',
        departureTime: dec.recommendedDeparture,
        durationHours: 6,
        locationContext: 'Mumbai Coastal Sector',
        vesselId: 'VESSEL-01',
      },
      decision: dec,
      evidence: [],
      mapContext: {
        sectorId: 'mumbai-inshore',
        centerCoordinates: [18.92, 72.83],
        recommendedRouteCoordinates: [],
        activeWarningCount: 0,
      },
      agentTrace: {
        planner: {
          agentId: 'PLANNER',
          agentName: 'Mission Planner (Offline Cache)',
          role: 'Historical Cache Retrieval',
          status: 'COMPLETED',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          executionDurationMs: 2,
          confidenceScore: 90,
          provenanceStatus: 'CACHED',
          summary: `Retrieved historical decision ${dec.decisionId} from local offline storage.`,
          evidence: [],
          data: {},
          warnings: ['Displaying cached decision replay.'],
        },
        oceanography: {
          agentId: 'OCEANOGRAPHY',
          agentName: 'Oceanography (Cached)',
          role: 'Historical Telemetry',
          status: 'COMPLETED',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          executionDurationMs: 2,
          confidenceScore: 80,
          provenanceStatus: 'CACHED',
          summary: 'Cached ocean state from previous evaluation.',
          evidence: [],
          data: {},
          warnings: [],
        },
        meteorology: {
          agentId: 'METEOROLOGY',
          agentName: 'Meteorology (Cached)',
          role: 'Historical Forecast',
          status: 'COMPLETED',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          executionDurationMs: 2,
          confidenceScore: 75,
          provenanceStatus: 'CACHED',
          summary: 'Cached weather bulletin from previous evaluation.',
          evidence: [],
          data: {},
          warnings: [],
        },
        pfzFisheries: {
          agentId: 'PFZ_FISHERIES',
          agentName: 'PFZ Fisheries (Cached)',
          role: 'Historical Opportunity',
          status: 'COMPLETED',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          executionDurationMs: 2,
          confidenceScore: 85,
          provenanceStatus: 'CACHED',
          summary: 'Cached PFZ coordinates.',
          evidence: [],
          data: {},
          warnings: [],
        },
        geoSafety: {
          agentId: 'GEO_SAFETY',
          agentName: 'GeoSafety (Deterministic)',
          role: 'Restricted Zones',
          status: 'COMPLETED',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          executionDurationMs: 2,
          confidenceScore: 100,
          provenanceStatus: 'DEMO_SNAPSHOT',
          summary: 'Static maritime security polygons.',
          evidence: [],
          data: {},
          warnings: [],
        },
      },
      timestamp: new Date().toISOString(),
      executionTimeMs: 15,
    };
  }

  // Safety Query while Offline ("Can I go fishing today?") -> INSUFFICIENT_DATA
  const now = new Date().toISOString();
  const offlineSafetyReasoning =
    'OFFLINE DATA UNAVAILABLE: Live oceanographic and weather streams cannot be reached. Under maritime safety rules, trip departure cannot be evaluated without current wave and wind telemetry. Please hold departure or consult local port authorities.';

  const llmIntent: LlmStructuredIntent = {
    intentId: `INTENT-OFFLINE-${Date.now()}`,
    rawQuery: payload.queryText || 'Can I go fishing today?',
    activity: 'FISHING',
    questionType: 'FEASIBILITY',
    location: {
      regionId: 'mumbai',
    },
    departureWindow: {
      timeString: 'Now',
      isEstimated: false,
    },
    durationHours: 6,
    vessel: {
      isExplicit: false,
    },
    constraints: [],
    requiresClarification: false,
    confidenceScore: 100,
    extractedEntities: {},
  };

  const llmExplanation: LlmExplanationResult = {
    summary: 'Offline: Real-time marine data unavailable. Verdict is INSUFFICIENT_DATA.',
    detailedReasoning: offlineSafetyReasoning,
    actionableAdvisories: [
      'Hold departure until connectivity is restored.',
      'Check local VHF maritime weather bulletins if at sea.',
    ],
    citedEvidenceIds: [],
    providerUsed: 'DETERMINISTIC_FALLBACK',
    modelUsed: 'orca-deterministic-offline-v1',
    generatedAt: now,
    isFallback: true,
  };

  return {
    queryId: `QRY-OFFLINE-SAFETY-${Date.now()}`,
    conversationId: payload.conversationId || 'CONV-OFFLINE',
    turnId: 'TURN-OFFLINE-01',
    llmIntent,
    llmExplanation,
    shortAnswer: offlineSafetyReasoning,
    parsedIntent: {
      activity: 'FISHING',
      departureTime: 'Immediate',
      durationHours: 6,
      locationContext: 'Coastal Waters',
      vesselId: 'VESSEL-01',
    },
    evidence: [],
    mapContext: {
      sectorId: 'mumbai-inshore',
      centerCoordinates: [18.92, 72.83],
      recommendedRouteCoordinates: [],
      activeWarningCount: 0,
    },
    decision: {
      decisionId: `DEC-OFFLINE-${Date.now()}`,
      verdict: 'INSUFFICIENT_DATA',
      confidence: {
        score: 0,
        level: 'LOW',
        reasons: ['Real-time telemetry feeds are offline. Operational safety cannot be guaranteed.'],
      },
      primaryDriver: 'OFFLINE_SAFETY_LOCK: Real-time environmental telemetry unavailable.',
      explanation: 'Departure clearance requires verified current wave height and wind gust data. Operating offline enforces conservative INSUFFICIENT_DATA.',
      recommendedDeparture: 'Hold departure until connectivity is restored',
      recommendedReturn: 'Departure not cleared',
      recommendedZone: null,
      safetyOverridesTriggered: ['OFFLINE_TELEMETRY_UNAVAILABLE'],
      positiveFactors: [],
      riskFactors: ['Missing live INCOIS wave forecast', 'Missing live IMD marine bulletin'],
      dataQuality: {
        status: 'UNAVAILABLE',
        completenessScore: 0,
        availableSources: 0,
        requiredSources: 4,
        staleSources: 0,
      },
      evaluatedAt: now,
      ruleEvaluations: [
        {
          ruleId: 'RULE_DATA_01_OFFLINE_SAFETY_GUARD',
          ruleName: 'Offline Missing Telemetry Safety Precaution',
          category: 'SAFETY_OVERRIDE',
          verdictImpact: 'INSUFFICIENT_DATA',
          deterministicScore: 0,
          reason: 'Live wave forecast and weather telemetry unavailable in offline mode.',
          evidenceRef: 'LOCAL_OFFLINE_CACHE',
        },
      ],
    },
    agentTrace: {
      planner: {
        agentId: 'PLANNER',
        agentName: 'Planner',
        role: 'Mission Tasking',
        status: 'FAILED',
        startedAt: now,
        completedAt: now,
        executionDurationMs: 1,
        confidenceScore: 0,
        provenanceStatus: 'UNAVAILABLE',
        summary: 'Offline mode active',
        evidence: [],
        data: {},
        warnings: ['Offline mode: Cannot schedule departure.'],
      },
      oceanography: {
        agentId: 'OCEANOGRAPHY',
        agentName: 'Oceanography',
        role: 'Wave Swell',
        status: 'FAILED',
        startedAt: now,
        completedAt: now,
        executionDurationMs: 1,
        confidenceScore: 0,
        provenanceStatus: 'UNAVAILABLE',
        summary: 'Live feed unavailable',
        evidence: [],
        data: {},
        warnings: ['Live INCOIS OSF stream unreachable.'],
      },
      meteorology: {
        agentId: 'METEOROLOGY',
        agentName: 'Meteorology',
        role: 'Weather',
        status: 'FAILED',
        startedAt: now,
        completedAt: now,
        executionDurationMs: 1,
        confidenceScore: 0,
        provenanceStatus: 'UNAVAILABLE',
        summary: 'Live feed unavailable',
        evidence: [],
        data: {},
        warnings: ['Live IMD weather stream unreachable.'],
      },
      pfzFisheries: {
        agentId: 'PFZ_FISHERIES',
        agentName: 'PFZ Fisheries',
        role: 'Opportunity',
        status: 'FAILED',
        startedAt: now,
        completedAt: now,
        executionDurationMs: 1,
        confidenceScore: 0,
        provenanceStatus: 'UNAVAILABLE',
        summary: 'Live feed unavailable',
        evidence: [],
        data: {},
        warnings: ['Live PFZ WFS layer unreachable.'],
      },
      geoSafety: {
        agentId: 'GEO_SAFETY',
        agentName: 'GeoSafety',
        role: 'Restricted Zones',
        status: 'COMPLETED',
        startedAt: now,
        completedAt: now,
        executionDurationMs: 1,
        confidenceScore: 100,
        provenanceStatus: 'DEMO_SNAPSHOT',
        summary: 'Static boundaries active',
        evidence: [],
        data: {},
        warnings: [],
      },
    },
    timestamp: now,
    executionTimeMs: 14,
  };
}
