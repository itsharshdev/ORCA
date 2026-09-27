import type { FastifyPluginAsync } from 'fastify';
import { orcaQueryRequestSchema } from '../schemas/apiSchemas.js';
import type { OrcaQueryResponse } from '../types.js';
import { OrchestrationService } from '../services/orchestrationService.js';

export const orcaQueryRoutes: FastifyPluginAsync = async (fastify) => {
  const orchestrator = OrchestrationService.getInstance();

  fastify.post('/orca/query', async (request, reply): Promise<OrcaQueryResponse> => {
    const parseResult = orcaQueryRequestSchema.safeParse(request.body);

    if (!parseResult.success) {
      const errorDetails: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path.join('.') || 'body';
        errorDetails[path] = issue.message;
      });

      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid ORCA query payload. Please verify input fields.',
          details: errorDetails,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    try {
      const data = parseResult.data;
      const response = await orchestrator.orchestrateQuery({
        ...data,
        structuredMission: data.structuredMission
          ? {
              ...data.structuredMission,
              targetZoneId: data.structuredMission.targetZoneId || undefined,
            }
          : undefined,
      });
      return response;
    } catch (err) {
      fastify.log.error(err, 'Orchestration execution error');
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: err instanceof Error ? err.message : 'Orchestrator failure during specialist execution.',
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });
};
