import type { FastifyPluginAsync } from 'fastify';
import type { HealthResponse } from '../types';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async (): Promise<HealthResponse> => {
    return {
      status: 'HEALTHY',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        apiServer: true,
        database: false, // Phase 3 honest placeholder: database not yet initialized
        dataIngestionScheduler: false, // Phase 3 honest placeholder: data adapters pending Phase 4
        agentOrchestrator: false, // Phase 3 honest placeholder: backend agent workers pending Phase 5
      },
      environment: (process.env.NODE_ENV as any) || 'development',
    };
  });
};
