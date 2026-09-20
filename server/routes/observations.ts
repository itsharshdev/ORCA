import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ingestionService } from '../services/ingestionService.js';
import type { ObservationCategory } from '../types.js';

const observationQuerySchema = z.object({
  category: z.enum(['OCEAN', 'WEATHER', 'PFZ', 'GEO_SAFETY', 'VESSEL_TRAFFIC', 'HAZARD']).optional(),
  dataset: z.string().optional(),
  variableName: z.string().optional(),
  region: z.string().optional(),
  status: z.enum(['LIVE', 'INTEGRATED', 'DEMO_SNAPSHOT', 'CACHED', 'STALE', 'UNAVAILABLE', 'VERIFIED']).optional(),
  limit: z.coerce.number().min(1).max(200).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const observationRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /observations
   * Retrieves normalized, persisted observations from Supabase.
   */
  fastify.get('/observations', async (request, reply) => {
    const parseResult = observationQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid observation query filters.',
          details: parseResult.error.flatten(),
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const { category, dataset, variableName, region, status, limit, offset } = parseResult.data;

    try {
      const result = await ingestionService.getObservations({
        category: category as ObservationCategory | undefined,
        datasetIdentifier: dataset,
        variableName,
        region,
        status,
        limit,
        offset,
      });

      return reply.status(200).send({
        success: true,
        count: result.count,
        total: result.total,
        limit,
        offset,
        filters: {
          category: category || null,
          dataset: dataset || null,
          variableName: variableName || null,
          region: region || null,
          status: status || null,
        },
        observations: result.observations,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to query observations';
      return reply.status(500).send({
        error: {
          code: 'QUERY_FAILURE',
          message,
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });
};
