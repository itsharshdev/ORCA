import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ingestionService } from '../services/ingestionService.js';

const demoIngestionSchema = z.object({
  regions: z.array(z.string()).optional(),
  forceRefresh: z.boolean().optional().default(false),
});

const incoisIngestionSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  region: z.string().optional(),
  allowFallback: z.boolean().optional().default(true),
});

const imdIngestionSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  region: z.string().optional(),
  stationCode: z.string().optional(),
  allowFallback: z.boolean().optional().default(true),
});

const pfzIngestionSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  region: z.string().optional(),
  state: z.string().optional(),
  allowFallback: z.boolean().optional().default(true),
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

  /**
   * POST /ingestion/incois
   * Triggers official INCOIS Ocean State Forecast (OSF) retrieval, normalization, and persistence.
   */
  fastify.post('/ingestion/incois', async (request, reply) => {
    const parseResult = incoisIngestionSchema.safeParse(request.body || {});
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid INCOIS ingestion request parameters.',
          details: parseResult.error.flatten(),
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    try {
      const response = await ingestionService.ingestIncoisData({
        latitude: parseResult.data.latitude,
        longitude: parseResult.data.longitude,
        region: parseResult.data.region,
        allowFallback: parseResult.data.allowFallback,
      });

      return reply.status(200).send({
        success: response.success,
        source: response.source,
        dataset: response.dataset,
        isLive: response.isLive,
        fallbackUsed: response.fallbackUsed,
        summary: {
          totalReceived: response.result.totalReceived,
          inserted: response.result.inserted,
          updated: response.result.updated,
          skipped: response.result.skipped,
          observedAt: response.result.observedAt,
          retrievedAt: response.result.retrievedAt,
        },
        errors: response.errors,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'INCOIS ingestion failed';
      return reply.status(500).send({
        error: {
          code: 'INCOIS_INGESTION_FAILURE',
          message,
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  /**
   * POST /ingestion/imd
   * Triggers official IMD Weather & Marine Warning retrieval, normalization, and persistence.
   */
  fastify.post('/ingestion/imd', async (request, reply) => {
    const parseResult = imdIngestionSchema.safeParse(request.body || {});
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid IMD ingestion request parameters.',
          details: parseResult.error.flatten(),
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    try {
      const response = await ingestionService.ingestImdData({
        latitude: parseResult.data.latitude,
        longitude: parseResult.data.longitude,
        region: parseResult.data.region,
        stationCode: parseResult.data.stationCode,
        allowFallback: parseResult.data.allowFallback,
      });

      return reply.status(200).send({
        success: response.success,
        source: response.source,
        dataset: response.dataset,
        isLive: response.isLive,
        fallbackUsed: response.fallbackUsed,
        summary: {
          totalReceived: response.result.totalReceived,
          inserted: response.result.inserted,
          updated: response.result.updated,
          skipped: response.result.skipped,
          observedAt: response.result.observedAt,
          retrievedAt: response.result.retrievedAt,
        },
        errors: response.errors,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'IMD ingestion failed';
      return reply.status(500).send({
        error: {
          code: 'IMD_INGESTION_FAILURE',
          message,
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  /**
   * POST /ingestion/pfz
   * Triggers official INCOIS Potential Fishing Zone (PFZ) intelligence retrieval, normalization, and persistence.
   */
  fastify.post('/ingestion/pfz', async (request, reply) => {
    const parseResult = pfzIngestionSchema.safeParse(request.body || {});
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid PFZ ingestion request parameters.',
          details: parseResult.error.flatten(),
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    try {
      const response = await ingestionService.ingestPfzData({
        latitude: parseResult.data.latitude,
        longitude: parseResult.data.longitude,
        region: parseResult.data.region,
        state: parseResult.data.state,
        allowFallback: parseResult.data.allowFallback,
      });

      return reply.status(200).send({
        success: response.success,
        source: response.source,
        dataset: response.dataset,
        isLive: response.isLive,
        fallbackUsed: response.fallbackUsed,
        summary: {
          totalReceived: response.result.totalReceived,
          inserted: response.result.inserted,
          updated: response.result.updated,
          skipped: response.result.skipped,
          observedAt: response.result.observedAt,
          retrievedAt: response.result.retrievedAt,
        },
        errors: response.errors,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'PFZ ingestion failed';
      return reply.status(500).send({
        error: {
          code: 'PFZ_INGESTION_FAILURE',
          message,
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });
};
