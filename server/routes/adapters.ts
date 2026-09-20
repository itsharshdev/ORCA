import type { FastifyPluginAsync } from 'fastify';
import { adapterRegistry } from '../adapters/registry.js';
import { adapterQuerySchema } from '../adapters/types.js';

export const adapterRoutes: FastifyPluginAsync = async (fastify) => {
  // LIST REGISTERED ADAPTERS & HEALTH
  fastify.get('/adapters', async () => {
    const healthSummary = await adapterRegistry.checkAllHealth();
    return {
      count: healthSummary.length,
      adapters: healthSummary,
      timestamp: new Date().toISOString(),
      frameworkVersion: '1.0.0-phase6',
    };
  });

  // QUERY ADAPTER DATA & GET NORMALIZED OBSERVATIONS
  fastify.post<{
    Params: { source: string; dataset: string };
  }>('/adapters/:source/:dataset/fetch', async (request, reply) => {
    const { source, dataset } = request.params;

    if (!adapterRegistry.has(source, dataset)) {
      return reply.status(404).send({
        error: {
          code: 'ADAPTER_NOT_FOUND',
          message: `No data adapter registered for source '${source}' and dataset '${dataset}'.`,
          availableAdapters: adapterRegistry.list(),
        },
      });
    }

    const parseResult = adapterQuerySchema.safeParse(request.body || {});
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid adapter query payload',
          details: parseResult.error.issues,
        },
      });
    }

    const adapter = adapterRegistry.get(source, dataset);
    const response = await adapter.fetch(parseResult.data);

    return response;
  });
};
