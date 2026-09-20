import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ingestionService } from '../services/ingestionService.js';

const demoIngestionSchema = z.object({
  regions: z.array(z.string()).optional(),
  forceRefresh: z.boolean().optional().default(false),
});

export const ingestionRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /ingestion/demo
   * Triggers normalization and persistence of demo environmental feeds into Supabase.
   */
  fastify.post('/ingestion/demo', async (request, reply) => {
    const parseResult = demoIngestionSchema.safeParse(request.body || {});
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid demo ingestion request parameters.',
          details: parseResult.error.flatten(),
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    try {
      const summary = await ingestionService.ingestDemoData({
        regions: parseResult.data.regions,
      });

      return reply.status(200).send({
        success: summary.success,
        summary: {
          totalProcessed: summary.totalObservationsProcessed,
          inserted: summary.totalInserted,
          updated: summary.totalUpdated,
          skipped: summary.totalSkipped,
          regions: summary.regionsProcessed,
          executedAt: summary.executedAt,
          durationMs: summary.durationMs,
        },
        resultsByRegion: summary.resultsByRegion,
        errors: summary.errors,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ingestion pipeline failure';
      return reply.status(500).send({
        error: {
          code: 'INGESTION_FAILURE',
          message,
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });
};
