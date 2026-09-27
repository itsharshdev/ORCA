import type { FastifyPluginAsync } from 'fastify';
import { orcaQueryRequestSchema } from '../schemas/apiSchemas';
import type { OrcaQueryResponse } from '../types';
import { DecisionEngineService } from '../services/decisionEngineService';

export const orcaQueryRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/orca/query', async (request, reply): Promise<OrcaQueryResponse> => {
    const parseResult = orcaQueryRequestSchema.safeParse(request.body);

    if (!parseResult.success) {
      const errorDetails: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path.join('.') || 'body';
        errorDetails[path] = issue.message;
      });

      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid ORCA query payload. Please verify input fields.',
          details: errorDetails,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const body = parseResult.data;
    const now = new Date().toISOString();
    const duration = body.structuredMission?.durationHours || 5;
    const departure = body.structuredMission?.departureTime || '05:45 IST';
    const activity = body.structuredMission?.activity || 'FISHING';
    const sector = body.regionId || 'maharashtra';
    const vesselId = body.structuredMission?.vesselId || 'VESSEL-001';

    // Execute authoritative deterministic decision evaluation
    const engineDecision = await DecisionEngineService.getInstance().evaluateDecision({
      regionId: sector,
      vesselId,
      departureTime: departure,
      durationHours: duration,
      originLocation: sector === 'tamil_nadu' ? { latitude: 10.76, longitude: 79.84 } : { latitude: 18.915, longitude: 72.825 },
      targetZoneId: 'PFZ-MUM-01',
      environmentalContext: {
        waveHeightMeters: duration > 7 ? 2.3 : 1.4,
        windSpeedKnots: 12.5,
        windGustKnots: 18.5,
        seaSurfaceTemperatureCelsius: 27.8,
        currentSpeedKnots: 0.8,
        activeWarnings: [],
        observedAt: now,
        isLive: true,
      },
    });

    // Contract-compliant skeleton response demonstrating multi-agent output format
    return {
      queryId: `qry-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now,
      executionTimeMs: 420,
      parsedIntent: {
        activity,
        departureTime: departure,
        durationHours: duration,
        locationContext: sector === 'tamil_nadu' ? 'Nagapattinam Coastal Sector / Bay of Bengal' : 'Alibaug Coastal Sector / Arabian Sea',
        vesselId: body.structuredMission?.vesselId || 'VESSEL-001',
      },
      agentTrace: {
        planner: {
          agentId: 'PLANNER',
          agentName: 'Mission Planner Agent',
          role: 'Intent Deconstruction & Task Delegation',
          status: 'COMPLETED',
          startedAt: now,
          completedAt: now,
          executionDurationMs: 120,
          summary: `Parsed ${activity} mission • ${departure} departure (${duration}h duration) • Sector: ${sector}.`,
          confidenceScore: 95.0,
          data: {
            intent: 'fishing_trip_assessment',
            activity,
            departureTime: departure,
            durationHours: duration,
            vesselRequired: true,
          },
          evidence: [
            {
              id: 'ev-plan-01',
              key: 'parsed_intent',
              label: 'Mission Objective',
              parameter: 'Activity Target',
              observedValue: `${activity} (${duration} hours)`,
              unit: null,
              impact: 'NEUTRAL',
              decisionRole: 'Sets temporal exposure window for forecast intersection',
              provenance: {
                source: 'ORCA_PLANNER_AGENT',
                observedAt: now,
                retrievedAt: now,
                validUntil: null,
                status: 'LIVE',
              },
            },
          ],
          warnings: [],
          provenanceStatus: 'LIVE',
        },
        oceanography: {
          agentId: 'OCEANOGRAPHY',
          agentName: 'Oceanography Agent',
          role: 'Hydrographic & Thermal Front Analysis',
          status: 'COMPLETED',
          startedAt: now,
          completedAt: now,
          executionDurationMs: 150,
          summary: 'SST 27.8°C (Thermal front favorable) • Chlorophyll 1.84 mg/m³ • Current 0.8 kts SSE • Ocean Risk: MODERATE.',
          confidenceScore: 88.0,
          data: {
            seaSurfaceTemperatureCelsius: 27.8,
            sstAnomalyCelsius: 0.6,
            surfaceCurrentSpeedKnots: 0.8,
            mixedLayerDepthMeters: 28,
            chlorophyllConcentrationMgM3: 1.84,
            waveSwellMeters: 1.4,
            oceanRiskLevel: 'MODERATE',
          },
          evidence: [
            {
              id: 'ev-ocn-01',
              key: 'sst_front',
              label: 'Sea Surface Temperature',
              parameter: 'SST Composite',
              observedValue: '27.8°C (Anomaly: +0.6°C)',
              unit: '°C',
              impact: 'POSITIVE',
              decisionRole: 'Favorable thermal range for pelagic aggregation',
              provenance: {
                source: 'INCOIS_OCEAN_MODEL_SNAPSHOT',
                datasetName: 'DAILY_SST_CORRELATED',
                observedAt: '2026-09-02T06:00:00.000Z',
                retrievedAt: now,
                validUntil: '2026-09-03T06:00:00.000Z',
                status: 'DEMO_SNAPSHOT',
              },
            },
          ],
          warnings: [],
          provenanceStatus: 'DEMO_SNAPSHOT',
        },
        meteorology: {
          agentId: 'METEOROLOGY',
          agentName: 'Meteorology Agent',
          role: 'Atmospheric & Wave Swell Evaluation',
          status: 'COMPLETED',
          startedAt: now,
          completedAt: now,
          executionDurationMs: 140,
          summary: 'Wind 12.5 kts WNW • Gusts 18.5 kts • Wave Swell 1.4m rising post-12:00 IST.',
          confidenceScore: 91.0,
          data: {
            windSpeedKnots: 12.5,
            windGustKnots: 18.5,
            waveHeightMeters: 1.4,
            wavePeriodSeconds: 7.2,
            visibilityKm: 8.5,
            weatherRiskLevel: 'MODERATE',
          },
          evidence: [
            {
              id: 'ev-met-01',
              key: 'wave_swell_forecast',
              label: 'Coastal Wave Swell',
              parameter: 'Significant Wave Height',
              observedValue: '1.4m (Morning) -> 2.1m (Post-12:00 IST)',
              unit: 'm',
              impact: 'CAUTIONARY',
              decisionRole: 'Restricts operational departure window to before midday',
              provenance: {
                source: 'IMD_COASTAL_RADAR_SNAPSHOT',
                observedAt: '2026-09-02T06:00:00.000Z',
                retrievedAt: now,
                validUntil: '2026-09-03T06:00:00.000Z',
                status: 'DEMO_SNAPSHOT',
              },
            },
          ],
          warnings: ['Midday wave swell reaches 2.1m exceeding small craft tolerance.'],
          provenanceStatus: 'DEMO_SNAPSHOT',
        },
        pfzFisheries: {
          agentId: 'PFZ_FISHERIES',
          agentName: 'PFZ / Fisheries Agent',
          role: 'Potential Fishing Zone Scoring',
          status: 'COMPLETED',
          startedAt: now,
          completedAt: now,
          executionDurationMs: 130,
          summary: 'Identified Zone Alpha (PFZ-MUM-01) at 18.5 km, 245° WSW • Opportunity: HIGH.',
          confidenceScore: 89.0,
          data: {
            topCandidateZoneId: 'PFZ-MUM-01',
            topCandidateZoneName: 'Alibaug Outer Bank (PFZ-MUM-01)',
            opportunityLevel: 'HIGH',
            distanceKm: 18.5,
            bearingDegrees: 245,
            targetFishTypes: ['Indian Mackerel', 'Ribbonfish', 'Sardines'],
          },
          evidence: [
            {
              id: 'ev-pfz-01',
              key: 'pfz_zone_alpha',
              label: 'Candidate Fishing Zone',
              parameter: 'Chlorophyll-SST Front',
              observedValue: 'Zone Alpha (18.5 km, 245° WSW)',
              unit: 'km',
              impact: 'POSITIVE',
              decisionRole: 'Provides primary commercial fishing utility opportunity',
              provenance: {
                source: 'INCOIS_PFZ_ADVISORY_SNAPSHOT',
                observedAt: '2026-09-02T06:00:00.000Z',
                retrievedAt: now,
                validUntil: '2026-09-03T06:00:00.000Z',
                status: 'DEMO_SNAPSHOT',
              },
            },
          ],
          warnings: [],
          provenanceStatus: 'DEMO_SNAPSHOT',
        },
        geoSafety: {
          agentId: 'GEO_SAFETY',
          agentName: 'Geo / Safety Agent',
          role: 'Geofence Compliance & Hazard Corridor Evaluation',
          status: 'COMPLETED',
          startedAt: now,
          completedAt: now,
          executionDurationMs: 125,
          summary: 'Boundary Status: CLEAR • Naval Anchorage clearance: 4.2 km • Safe corridor verified.',
          confidenceScore: 94.0,
          data: {
            boundaryStatus: 'CLEAR',
            nearestGeofenceName: 'Naval Anchorage Security Geofence',
            geofenceClearanceKm: 4.2,
            incursionRisk: 'NONE',
            activeHazardsCount: 2,
            safeCorridorVerified: true,
          },
          evidence: [
            {
              id: 'ev-geo-01',
              key: 'geofence_clearance',
              label: 'Naval Geofence Clearance',
              parameter: 'Buffer Distance',
              observedValue: '4.2 km clearance',
              unit: 'km',
              impact: 'POSITIVE',
              decisionRole: 'Verifies transit line is clear of restricted zone buffer',
              provenance: {
                source: 'NATIONAL_HYDROGRAPHIC_OFFICE_SNAPSHOT',
                observedAt: '2026-09-02T06:00:00.000Z',
                retrievedAt: now,
                validUntil: '2026-12-31T23:59:59.000Z',
                status: 'DEMO_SNAPSHOT',
              },
            },
          ],
          warnings: [],
          provenanceStatus: 'DEMO_SNAPSHOT',
        },
      },
      decision: {
        decisionId: engineDecision.decisionId,
        verdict: engineDecision.verdict,
        confidence: {
          level: 'HIGH',
          score: engineDecision.verdict === 'GO' ? 92.0 : engineDecision.verdict === 'CAUTION' ? 78.4 : 35.0,
          reasons: [
            ...engineDecision.blockingFactors,
            ...engineDecision.cautionFactors,
          ].slice(0, 3),
        },
        primaryDriver: engineDecision.primaryDriver,
        explanation: engineDecision.explanation,
        recommendedDeparture: engineDecision.recommendedDeparture,
        recommendedReturn: engineDecision.recommendedReturn,
        recommendedZone: engineDecision.recommendedZone || {
          id: 'PFZ-MUM-01',
          name: 'Alibaug Outer Bank (PFZ-MUM-01)',
          distanceKm: 18.5,
          bearingDegrees: 245,
          opportunityLevel: 'HIGH',
        },
        ruleEvaluations: engineDecision.rules.map((r) => ({
          ruleId: r.ruleId,
          ruleName: r.ruleName,
          category: r.category === 'GIS_SAFETY' || r.category === 'WARNING' ? 'SAFETY_OVERRIDE' : r.category === 'OCEAN' || r.category === 'WEATHER' || r.category === 'VESSEL_CAPABILITY' ? 'PHYSICAL_CONSTRAINT' : r.category === 'TEMPORAL' ? 'TEMPORAL_EXPOSURE' : r.category === 'OPPORTUNITY' ? 'OPPORTUNITY_OPTIMIZATION' : 'DATA_QUALITY_GATE',
          verdictImpact: (r.result === 'UNKNOWN' ? 'INSUFFICIENT_DATA' : r.result === 'NOT_APPLICABLE' ? 'PASS' : r.result) as 'PASS' | 'CAUTION' | 'AVOID' | 'INSUFFICIENT_DATA',
          reason: r.reason,
          evidenceRef: r.evidenceRef || r.ruleId,
          deterministicScore: r.result === 'PASS' ? 100 : r.result === 'CAUTION' ? 65 : 0,
        })),
        safetyOverridesTriggered: engineDecision.blockingFactors,
        positiveFactors: engineDecision.opportunityFactors.length > 0 ? engineDecision.opportunityFactors : ['Verified clear navigation corridor in coastal waters.'],
        riskFactors: [...engineDecision.blockingFactors, ...engineDecision.cautionFactors],
        dataQuality: {
          status: engineDecision.dataStatus.status,
          requiredSources: engineDecision.dataStatus.requiredSourcesCount,
          availableSources: engineDecision.dataStatus.availableSourcesCount,
          staleSources: engineDecision.dataStatus.staleSourcesCount,
          completenessScore: engineDecision.dataStatus.availableSourcesCount >= engineDecision.dataStatus.requiredSourcesCount ? 100 : 50,
        },
        evaluatedAt: engineDecision.evaluatedAt,
      },

      evidence: [
        {
          id: 'ev-01',
          key: 'sst_front',
          label: 'Sea Surface Temperature Gradient',
          parameter: 'SST Composite',
          observedValue: '27.8°C',
          unit: '°C',
          impact: 'POSITIVE',
          decisionRole: 'Positive pelagic habitat driver',
          provenance: {
            source: 'INCOIS_OCEAN_MODEL_SNAPSHOT',
            observedAt: '2026-09-02T06:00:00.000Z',
            retrievedAt: now,
            validUntil: '2026-09-03T06:00:00.000Z',
            status: 'DEMO_SNAPSHOT',
          },
        },
      ],
      mapContext: {
        sectorId: sector,
        centerCoordinates: sector === 'tamil_nadu' ? [10.76, 80.00] : [18.78, 72.72],
        recommendedRouteCoordinates: [
          [18.915, 72.825],
          [18.847, 72.737],
          [18.72, 72.65],
        ],
        activeWarningCount: 2,
      },
    };
  });
};
