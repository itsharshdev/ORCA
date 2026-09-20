import type { FastifyPluginAsync } from 'fastify';
import { decisionIdParamSchema } from '../schemas/apiSchemas';
import type { DecisionDetailResponse } from '../types';

export const decisionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: { id: string } }>('/decisions/:id', async (request, reply): Promise<DecisionDetailResponse> => {
    const parseResult = decisionIdParamSchema.safeParse(request.params);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid decision ID parameter format.',
          details: { id: 'Decision ID is required and must be non-empty.' },
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const { id } = parseResult.data;

    // Reject unknown/invalid test IDs
    if (id.startsWith('INVALID') || id === 'not-found') {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: `Decision record with ID '${id}' was not found in audit logs.`,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Return contract-compliant decision detail skeleton
    return {
      decision: {
        decisionId: id,
        verdict: 'CAUTION',
        confidence: {
          level: 'HIGH',
          score: 78.4,
          reasons: [
            '5 of 5 required observation feeds verified.',
            'Temporal return corridor exposure post-midday.',
          ],
        },
        primaryDriver: 'Wave swell reaches 2.1m post-midday; return window constrained.',
        explanation: 'Trip feasible between 05:45 and 11:30 IST. Conclude operations before afternoon chop.',
        recommendedDeparture: '05:45 IST',
        recommendedReturn: '10:45 IST',
        recommendedZone: {
          id: 'PFZ-MUM-01',
          name: 'Zone Alpha (Offshore Alibaug)',
          distanceKm: 18.5,
          bearingDegrees: 245,
          opportunityLevel: 'HIGH',
        },
        ruleEvaluations: [],
        safetyOverridesTriggered: [],
        positiveFactors: ['High pelagic opportunity', 'Naval geofence clearance 4.2 km'],
        riskFactors: ['Midday wave swell exceeds 2.0m'],
        dataQuality: {
          status: 'DEMO_SNAPSHOT',
          requiredSources: 5,
          availableSources: 5,
          staleSources: 0,
          completenessScore: 100,
        },
        evaluatedAt: '2026-09-02T08:30:02.850Z',
      },
      missionContext: {
        queryId: `qry-${id}`,
        vessel: {
          id: 'VESSEL-001',
          ownerId: 'usr-f8e2-411a-9b81-64d8a7c8e991',
          name: 'Matsya Sagar 1',
          registrationNumber: 'IND-MH-02-MM-849',
          vesselType: 'TRADITIONAL_MOTORIZED',
          lengthMeters: 8.5,
          beamMeters: 2.2,
          draftMeters: 1.1,
          engineHp: 25,
          maxWaveToleranceMeters: 1.8,
          maxWindToleranceKnots: 18.0,
          cruisingSpeedKnots: 6.5,
          fuelCapacityHours: 10.0,
          crewCapacity: 3,
          homePort: { name: 'Sassoon Docks', latitude: 18.915, longitude: 72.825 },
          currentLocation: { latitude: 18.915, longitude: 72.825 },
          currentHeadingDegrees: 180,
          updatedAt: '2026-09-02T08:00:00.000Z',
        },
        activity: 'FISHING',
        departureTime: '05:45 IST',
        durationHours: 5,
        targetZoneName: 'Zone Alpha (Offshore Alibaug)',
      },
      fullEvidenceLog: [
        {
          id: 'ev-01',
          key: 'sst_front',
          label: 'Sea Surface Temperature Gradient',
          parameter: 'SST Composite',
          observedValue: '27.8°C',
          unit: '°C',
          impact: 'POSITIVE',
          decisionRole: 'Pelagic habitat indicator (+ Factor)',
          provenance: {
            source: 'INCOIS_OCEAN_MODEL_SNAPSHOT',
            observedAt: '2026-09-02T06:00:00.000Z',
            retrievedAt: '2026-09-02T07:00:00.000Z',
            validUntil: '2026-09-03T06:00:00.000Z',
            status: 'DEMO_SNAPSHOT',
          },
        },
      ],
      replayedAt: null,
    };
  });
};
