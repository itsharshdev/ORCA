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
