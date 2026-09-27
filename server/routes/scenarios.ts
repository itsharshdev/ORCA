import type { FastifyPluginAsync } from 'fastify';
import { scenarioEvaluationRequestSchema } from '../schemas/apiSchemas.js';
import type { ScenarioEvaluationResponse } from '../../src/types/contract.js';
import { ScenarioService } from '../services/scenarioService.js';

export const scenarioRoutes: FastifyPluginAsync = async (fastify) => {
  const scenarioService = ScenarioService.getInstance();

  fastify.post('/scenarios/evaluate', async (request, reply): Promise<ScenarioEvaluationResponse> => {
    const parseResult = scenarioEvaluationRequestSchema.safeParse(request.body);

    if (!parseResult.success) {
      const errorDetails: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path.join('.') || 'body';
        errorDetails[path] = issue.message;
      });

      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid scenario evaluation payload. Please verify input fields.',
          details: errorDetails,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    try {
      const result = await scenarioService.evaluateScenario(parseResult.data);
      return result;
    } catch (err) {
      fastify.log.error(err, 'Scenario evaluation error');
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: err instanceof Error ? err.message : 'Scenario evaluation failure.',
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });
};
