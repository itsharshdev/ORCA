import type { FastifyPluginAsync } from 'fastify';
import { orcaQueryRequestSchema } from '../schemas/apiSchemas';
import type { OrcaQueryResponse } from '../types';

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
        decisionId: `DEC-${Date.now().toString().slice(-8)}`,
        verdict: duration > 7 ? 'AVOID' : 'CAUTION',
        confidence: {
          level: 'HIGH',
          score: 78.4,
          reasons: [
            'All 5 required marine observation streams verified.',
            'Deterministic physical wave threshold rule satisfied for morning departure.',
            'Temporal return window approaches 2.1m midday swell boundary.',
          ],
        },
        primaryDriver: duration > 7 
          ? 'Mission duration exceeds safe operating window; afternoon squall risk.' 
          : 'Departure is favorable, but return window approaches worsening midday sea state (> 2.0m swell post-12:00 IST).',
        explanation: duration > 7
          ? 'Mission not recommended (AVOID). Extended duration enters squall conditions.'
          : `Trip feasible for early departure at ${departure}. Conclude operations before midday.`,
        recommendedDeparture: departure,
        recommendedReturn: '10:45 IST',
        recommendedZone: {
          id: 'PFZ-MUM-01',
          name: 'Alibaug Outer Bank (PFZ-MUM-01)',
          distanceKm: 18.5,
          bearingDegrees: 245,
          opportunityLevel: 'HIGH',
        },
        ruleEvaluations: [
          {
            ruleId: 'RULE_01_SEVERE_OFFICIAL_WARNING',
            ruleName: 'Severe Marine & Cyclone Warning Override',
            category: 'SAFETY_OVERRIDE',
            verdictImpact: 'PASS',
            reason: 'No critical cyclone or severe emergency overrides active.',
            evidenceRef: 'IMD_COASTAL_RADAR_SNAPSHOT',
            deterministicScore: 100,
          },
          {
            ruleId: 'RULE_02_HARD_GEOFENCE_CONFLICT',
            ruleName: 'Naval & Marine Sanctuary Geofence Compliance',
            category: 'SAFETY_OVERRIDE',
            verdictImpact: 'PASS',
            reason: 'Clear navigation corridor verified (4.2 km clearance from Naval Anchorage).',
            evidenceRef: 'GEO-RESTRICTED-01',
            deterministicScore: 100,
          },
          {
            ruleId: 'RULE_03_VESSEL_WAVE_TOLERANCE',
            ruleName: 'Vessel Seaworthiness & Wave Tolerance Limit',
            category: 'PHYSICAL_CONSTRAINT',
            verdictImpact: 'PASS',
            reason: 'Morning wave swell (1.4m) is within craft tolerance margin (1.8m).',
            evidenceRef: 'VESSEL-001',
            deterministicScore: 95,
          },
          {
            ruleId: 'RULE_04_TEMPORAL_RETURN_WINDOW',
            ruleName: 'Temporal Forecast & Return Corridor Exposure',
            category: 'TEMPORAL_EXPOSURE',
            verdictImpact: duration > 7 ? 'AVOID' : 'CAUTION',
            reason: duration > 7 
              ? `Mission duration of ${duration}h extends deeply into worsening afternoon conditions.`
              : `Departure at ${departure} is favorable, but return window approaches worsening midday sea state.`,
            evidenceRef: 'HOURLY_FORECAST_WINDOW',
            deterministicScore: duration > 7 ? 20 : 65,
          },
          {
            ruleId: 'RULE_06_PFZ_OPPORTUNITY_OPTIMIZATION',
            ruleName: 'Satellite PFZ & Pelagic Habitat Opportunity',
            category: 'OPPORTUNITY_OPTIMIZATION',
            verdictImpact: 'PASS',
            reason: 'Zone Alpha exhibits HIGH pelagic aggregation potential.',
            evidenceRef: 'PFZ-MUM-01',
            deterministicScore: 95,
          },
          {
            ruleId: 'RULE_07_DATA_QUALITY_GATE',
            ruleName: 'Dataset Completeness & Quality Gate',
            category: 'DATA_QUALITY_GATE',
            verdictImpact: 'PASS',
            reason: 'All required marine datasets verified (5/5 agent reports present).',
            evidenceRef: 'DATA_QUALITY_AUDIT',
            deterministicScore: 100,
          },
        ],
        safetyOverridesTriggered: [],
        positiveFactors: [
          'Alibaug Outer Bank shows high pelagic aggregation potential based on SST thermal front.',
          'Clear navigation corridor verified (4.2 km clearance from Naval Anchorage Security Geofence).',
          'All required marine datasets verified (5/5 agent reports present).',
        ],
        riskFactors: [
          'Departure is favorable, but return window approaches worsening midday sea state.',
        ],
        dataQuality: {
          status: 'DEMO_SNAPSHOT',
          requiredSources: 5,
          availableSources: 5,
          staleSources: 0,
          completenessScore: 100,
        },
        evaluatedAt: now,
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
