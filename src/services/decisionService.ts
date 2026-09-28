import type {
  DecisionDetailResponse,
  DecisionEvaluationRequest,
  DecisionEvaluationResponse,
} from '@/types/contract';
import { getApiBaseUrl } from './apiConfig';
import { offlineCacheService } from './offlineCacheService';
import { connectivityService } from './connectivityService';

export const decisionService = {
  /**
   * Evaluates mission decision deterministically through ORCA Decision Engine.
   * OFFLINE SAFETY INVARIANT: If offline or API is unreachable, NEVER creates a fake GO verdict.
   * Returns INSUFFICIENT_DATA with explicit explanation.
   */
  async evaluateDecision(req: DecisionEvaluationRequest): Promise<DecisionEvaluationResponse> {
    const conn = connectivityService.getStatus();

    if (!conn.isOnline || !conn.apiReachable) {
      return createOfflineInsufficientDataResponse(req);
    }

    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/decisions/evaluate`;

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
        throw new Error(`HTTP ${response.status}`);
      }

      const result = (await response.json()) as DecisionEvaluationResponse;

      // Cache successful evaluated decision for offline historical inspection
      if (result.decisionId) {
        offlineCacheService.cacheDecision({
          decision: {
            decisionId: result.decisionId,
            verdict: result.verdict,
            confidence: {
              level: result.confidence.level === 'HIGH' ? 'HIGH' : result.confidence.level === 'LOW' ? 'LOW' : 'MEDIUM',
              score: Math.round((result.confidence.completenessRatio || 0) * 100),
              reasons: result.confidence.reasons || [],
            },
            primaryDriver: result.primaryDriver,
            explanation: result.explanation,
            recommendedDeparture: result.recommendedDeparture,
            recommendedReturn: result.recommendedReturn,
            recommendedZone: result.recommendedZone,
            ruleEvaluations: (result.rules || []).map((r) => ({
              ruleId: r.ruleId,
              ruleName: r.ruleName,
              category: 'SAFETY_OVERRIDE' as const,
              verdictImpact: r.result === 'FAIL' ? 'AVOID' : r.result === 'CAUTION' ? 'CAUTION' : 'PASS',
              reason: r.reason,
              evidenceRef: r.evidenceRef || 'EVID-SYS',
              deterministicScore: r.result === 'PASS' ? 100 : r.result === 'CAUTION' ? 60 : 0,
            })),
            safetyOverridesTriggered: result.blockingFactors || [],
            positiveFactors: result.opportunityFactors || [],
            riskFactors: result.cautionFactors || [],
            dataQuality: {
              status: result.dataStatus.status,
              requiredSources: result.dataStatus.requiredSourcesCount,
              availableSources: result.dataStatus.availableSourcesCount,
              staleSources: result.dataStatus.staleSourcesCount,
              completenessScore: 100,
            },
            evaluatedAt: result.evaluatedAt,
          },
          missionContext: {
            activity: 'FISHING',
            departureTime: result.recommendedDeparture,
            durationHours: 6,
            vessel: {
              vesselId: result.vesselId || req.vesselId,
              name: result.vesselName || 'Primary Vessel',
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
          fullEvidenceLog: [],
        }).catch(console.warn);
      }

      return result;
    } catch (err) {
      console.warn('Backend decision evaluation unreachable, returning conservative INSUFFICIENT_DATA:', err);
      return createOfflineInsufficientDataResponse(req);
    }
  },

  /**
   * Fetches full audited decision details by ID.
   * If offline or API fails, attempts lookup in controlled offline cache.
   */
  async fetchDecisionById(decisionId: string): Promise<DecisionDetailResponse> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/decisions/${encodeURIComponent(decisionId)}`;

    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        const data = (await response.json()) as DecisionDetailResponse;
        offlineCacheService.cacheDecision(data).catch(console.warn);
        return data;
      }
    } catch {
      // network fetch failed, proceed to offline cache lookup
    }

    // Check offline cache for previously persisted decision
    const cached = await offlineCacheService.getItem<DecisionDetailResponse>('decisions', decisionId);
    if (cached && cached.data) {
      return {
        ...cached.data,
        isCachedReplay: true,
        cachedAt: cached.cachedAt,
      } as DecisionDetailResponse & { isCachedReplay: boolean; cachedAt: string };
    }

    throw new Error(
      `Decision '${decisionId}' could not be retrieved from the network or local offline cache.`
    );
  },
};

/**
 * Generates a strictly conservative INSUFFICIENT_DATA response when offline.
 */
function createOfflineInsufficientDataResponse(
  req: DecisionEvaluationRequest
): DecisionEvaluationResponse {
  const now = new Date().toISOString();
  return {
    decisionId: `DEC-OFFLINE-${Date.now()}`,
    verdict: 'INSUFFICIENT_DATA',
    state: 'INSUFFICIENT_DATA',
    summary: 'Offline Mode: Live oceanographic and meteorological telemetry is unavailable. Trip safety cannot be validated.',
    explanation: 'Offline Mode: Live oceanographic and meteorological telemetry is unavailable. Under maritime safety rules, trip departure cannot be cleared on unverified or expired data.',
    primaryDriver: 'OFFLINE_SAFETY_LOCK: Real-time swell, wind gust, and coastal advisory telemetry cannot be confirmed without connectivity.',
    evaluatedAt: now,
    vesselId: req.vesselId,
    missionId: req.missionId,
    recommendedDeparture: 'Hold departure until connectivity is restored or Port Authority clearance is obtained',
    recommendedReturn: 'Departure not cleared',
    recommendedZone: null,
    rules: [
      {
        ruleId: 'RULE_DATA_01_OFFLINE_SAFETY_GUARD',
        ruleName: 'Offline Missing Telemetry Safety Precaution',
        category: 'DATA_QUALITY',
        input: { connectivity: 'OFFLINE' },
        threshold: { requiredStatus: 'LIVE' },
        thresholdSource: 'OFFLINE_SAFETY_POLICY',
        result: 'FAIL',
        severity: 'CRITICAL',
        reason: 'Live wave forecast and weather telemetry unavailable in offline mode.',
        evidenceRef: 'LOCAL_NETWORK_OFFLINE',
      },
    ],
    blockingFactors: ['OFFLINE_SAFETY_PRECAUTION_ENGAGED'],
    cautionFactors: [
      'Live INCOIS wave forecast unavailable offline',
      'Live coastal weather radar unavailable offline',
    ],
    opportunityFactors: [],
    confidence: {
      level: 'LOW',
      reasons: ['No live connectivity to marine sensor streams'],
      missingRequiredEvidence: ['INCOIS_OSF_SWELL', 'IMD_WEATHER_RADAR'],
      unresolvedConflictsCount: 0,
      staleEvidenceCount: 0,
      freshEvidenceCount: 0,
      totalEvidenceCount: 0,
      completenessRatio: 0,
    },
    evidence: [],
    evidenceSummary: {
      totalCount: 0,
      freshCount: 0,
      staleCount: 0,
      demoCount: 0,
      accessPendingCount: 0,
      conflictsCount: 0,
      unresolvedConflictsCount: 0,
      groups: [],
    },
    conflicts: [],
    dataStatus: {
      status: 'UNAVAILABLE',
      requiredSourcesCount: 4,
      availableSourcesCount: 0,
      staleSourcesCount: 0,
      hasConflicts: false,
      conflictSummary: 'Offline mode — 0 sources reachable',
    },
    provenance: {
      engine: 'decision-engine-v2',
      version: '2.0.0',
      evaluatedAt: now,
      rulesEvaluatedCount: 1,
      precedenceEnforced: ['RULE_DATA_01_OFFLINE_SAFETY_GUARD'],
    },
  };
}
