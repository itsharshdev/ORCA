import { z } from 'zod';

/**
 * GeoPoint Schema
 */
export const geoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  depthMeters: z.number().optional().nullable(),
  name: z.string().optional().nullable(),
});

/**
 * Structured Mission Input Schema
 */
export const structuredMissionSchema = z.object({
  activity: z.enum(['FISHING', 'SURVEY', 'PATROL'], {
    message: "Activity must be one of 'FISHING', 'SURVEY', or 'PATROL'",
  }),
  vesselId: z.string().min(1).optional(),
  targetZoneId: z.string().optional().nullable(),
  departureTime: z.string().optional(),
  durationHours: z.number().min(1, 'Duration must be at least 1 hour').max(24, 'Duration cannot exceed 24 hours').optional(),
  sectorId: z.string().optional(),
  mustReturnBeforeSunset: z.boolean().optional(),
});

/**
 * POST /orca/query Request Body Schema
 */
export const orcaQueryRequestSchema = z.object({
  queryText: z.string().min(1, 'Query text cannot be empty').optional(),
  structuredMission: structuredMissionSchema.optional(),
  regionId: z.string().default('maharashtra'),
  operatorLocation: geoPointSchema.optional(),
  conversationId: z.string().optional(),
  operatorRole: z.enum(['FISHERMAN', 'AUTHORITY', 'DISASTER', 'RESEARCHER', 'OPERATOR']).default('FISHERMAN').optional(),
}).refine(
  (data) => data.queryText !== undefined || data.structuredMission !== undefined,
  {
    message: 'Either queryText or structuredMission must be provided',
    path: ['queryText'],
  }
);

export type ValidatedOrcaQueryRequest = z.infer<typeof orcaQueryRequestSchema>;

/**
 * GET /decisions/:id Param Schema
 */
export const decisionIdParamSchema = z.object({
  id: z.string().min(1, 'Decision ID is required'),
});

export type ValidatedDecisionIdParam = z.infer<typeof decisionIdParamSchema>;

/**
 * POST /api/v1/scenarios/evaluate Request Body Schema (Phase 18)
 */
export const scenarioAssumptionSchema = z.object({
  waveHeightMeters: z.number().min(0).max(20).optional(),
  windSpeedKnots: z.number().min(0).max(100).optional(),
  seaSurfaceTemperatureCelsius: z.number().min(0).max(45).optional(),
  currentSpeedKnots: z.number().min(0).max(20).optional(),
  notes: z.string().optional(),
});

export const scenarioModificationSchema = z.object({
  departureTime: z.string().optional(),
  durationHours: z.number().min(1).max(72).optional(),
  vesselId: z.string().optional(),
  regionId: z.string().optional(),
  activity: z.enum(['FISHING', 'SURVEY', 'PATROL', 'TRANSIT', 'UNKNOWN']).optional(),
  targetZoneId: z.string().optional().nullable(),
  avoidRestrictedZones: z.boolean().optional(),
  waypoints: z.array(geoPointSchema).optional(),
  assumptions: scenarioAssumptionSchema.optional(),
});

export const scenarioEvaluationRequestSchema = z.object({
  baselineQueryId: z.string().optional(),
  conversationId: z.string().optional(),
  naturalLanguageScenario: z.string().min(1).optional(),
  modifications: scenarioModificationSchema.optional(),
  operatorRole: z.enum(['FISHERMAN', 'AUTHORITY', 'DISASTER', 'RESEARCHER', 'OPERATOR']).default('FISHERMAN').optional(),
  regionId: z.string().default('maharashtra').optional(),
}).refine(
  (data) => data.naturalLanguageScenario !== undefined || data.modifications !== undefined,
  {
    message: 'Either naturalLanguageScenario or modifications must be provided',
    path: ['naturalLanguageScenario'],
  }
);

export type ValidatedScenarioEvaluationRequest = z.infer<typeof scenarioEvaluationRequestSchema>;

/**
 * Phase 19: Alert System Schemas
 */
export const alertIdParamSchema = z.object({
  id: z.string().min(1, 'Alert ID is required'),
});

export const alertFilterQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'EXPIRED', 'SUPPRESSED', 'ALL']).optional(),
  severity: z.enum(['INFO', 'ADVISORY', 'WARNING', 'CRITICAL']).optional(),
  alertType: z.string().optional(),
  category: z.enum(['WEATHER_MARINE', 'GIS_SAFETY', 'MISSION', 'CONNECTIVITY']).optional(),
  missionId: z.string().optional(),
  vesselId: z.string().optional(),
  role: z.string().optional(),
});

export const alertAcknowledgeBodySchema = z.object({
  operatorId: z.string().min(1, 'Operator ID is required').default('OP-USER-01'),
  role: z.string().optional(),
  note: z.string().max(500).optional(),
});

export const alertResolveBodySchema = z.object({
  operatorId: z.string().min(1, 'Operator ID is required').default('OP-USER-01'),
  role: z.string().optional(),
  note: z.string().max(500).optional(),
});

export const alertEvaluateBodySchema = z.object({
  regionId: z.string().optional(),
  missionId: z.string().optional(),
  vesselId: z.string().optional(),
  routeCoordinates: z.array(z.tuple([z.number(), z.number()])).optional(),
  environmentalContext: z.object({
    waveHeightMeters: z.number().min(0).optional(),
    windSpeedKnots: z.number().min(0).optional(),
    windGustKnots: z.number().min(0).optional(),
    visibilityKm: z.number().min(0).optional(),
    observedAt: z.string().optional(),
    validUntil: z.string().nullable().optional(),
    isLive: z.boolean().optional(),
    activeWarnings: z.array(
      z.object({
        alertId: z.string(),
        severity: z.string(),
        warningType: z.string(),
        description: z.string(),
        validFrom: z.string().optional(),
        validUntil: z.string().optional(),
        source: z.string().optional(),
      })
    ).optional(),
  }).optional(),
  connectivityEvent: z.object({
    state: z.enum(['CONNECTED', 'DEGRADED', 'OFFLINE', 'SAFETY_MESSAGE_RECEIVED']),
    bearer: z.enum(['CELLULAR_4G_5G', 'CELLULAR_2G', 'NAVIC_RECEIVER', 'SATELLITE_MSG', 'BLUETOOTH_MESH', 'NONE']).optional(),
    message: z.string().optional(),
  }).optional(),
});

