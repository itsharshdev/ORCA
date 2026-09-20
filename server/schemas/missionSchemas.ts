import { z } from 'zod';

export const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

export const createMissionSchema = z.object({
  title: z.string().min(1, 'Mission title is required').max(120),
  missionType: z.enum(['FISHING', 'TRANSIT', 'SURVEY', 'TRAINING']).default('FISHING'),
  status: z.enum(['DRAFT', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ABORTED']).default('DRAFT'),
  vesselId: z.string().uuid().optional().nullable(),
  targetZoneId: z.string().optional().nullable(),
  departureTime: z.string().datetime({ offset: true }).optional().nullable(),
  durationHours: z.number().positive().max(168).optional().nullable(),
  maxDistanceKm: z.number().positive().max(1000).optional().nullable(),
  originLocation: coordinateSchema.optional().nullable(),
  destinationLocation: coordinateSchema.optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export type CreateMissionInput = z.infer<typeof createMissionSchema>;

export const updateMissionSchema = createMissionSchema.partial();
export type UpdateMissionInput = z.infer<typeof updateMissionSchema>;
