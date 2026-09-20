import fastify, { type FastifyInstance, type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health.js';
import { meRoutes } from './routes/me.js';
import { orcaQueryRoutes } from './routes/orcaQuery.js';
import { decisionRoutes } from './routes/decisions.js';
import { missionRoutes } from './routes/missions.js';
import { config } from './config.js';
import type { ApiErrorEnvelope } from './types.js';

/**
 * Build and configure the Fastify application instance
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: {
      level: config.LOG_LEVEL,
    },
    genReqId: () => `req-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
  });

  // Enable CORS
  await app.register(cors, {
    origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Custom Not Found (404) Handler conforming to ApiErrorEnvelope
  app.setNotFoundHandler((request, reply) => {
    const errorResponse: ApiErrorEnvelope = {
      error: {
        code: 'NOT_FOUND',
        message: `Route '${request.method} ${request.url}' not found.`,
        details: null,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    };
    reply.status(404).send(errorResponse);
  });

  // Global Error Handler conforming to ApiErrorEnvelope
  app.setErrorHandler((error: FastifyError, request, reply) => {
    app.log.error(error);

    const statusCode = error.statusCode || 500;
    const errorResponse: ApiErrorEnvelope = {
      error: {
        code: statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR',
        message: error.message || 'An unexpected internal server error occurred.',
        details: ((error as unknown as Record<string, unknown>).details as Record<string, unknown> | null) || null,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    };

    reply.status(statusCode).send(errorResponse);
  });

  // Register API routes under root prefix and /api/v1 prefix
  await app.register(healthRoutes);
  await app.register(meRoutes);
  await app.register(orcaQueryRoutes);
  await app.register(decisionRoutes);
  await app.register(missionRoutes);

  // Also support /api/v1 versioned prefix
  await app.register(
    async (v1) => {
      await v1.register(healthRoutes);
      await v1.register(meRoutes);
      await v1.register(orcaQueryRoutes);
      await v1.register(decisionRoutes);
      await v1.register(missionRoutes);
    },
    { prefix: '/api/v1' }
  );

  return app;
}
