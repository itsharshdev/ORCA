import type { FastifyPluginAsync } from 'fastify';
import { AlertService } from '../services/alertService.js';
import {
  alertIdParamSchema,
  alertFilterQuerySchema,
  alertAcknowledgeBodySchema,
  alertResolveBodySchema,
  alertEvaluateBodySchema,
} from '../schemas/apiSchemas.js';
import type { AlertDetailResponse } from '../types.js';

export const alertRoutes: FastifyPluginAsync = async (fastify) => {
  const alertService = AlertService.getInstance();

  /**
   * GET /alerts or /api/v1/alerts
   * Query all alerts with optional criteria filtering (severity, status, type, role, mission, vessel)
   */
  fastify.get('/alerts', async (request, reply) => {
    const parsedQuery = alertFilterQuerySchema.safeParse(request.query);
    if (!parsedQuery.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid alert filter query parameters.',
          details: parsedQuery.error.format(),
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    try {
      const alerts = await alertService.getAlerts(parsedQuery.data as any);
      return reply.status(200).send({
        alerts,
        total: alerts.length,
        retrievedAt: new Date().toISOString(),
      });
    } catch (err) {
      fastify.log.error(err, 'Failed to retrieve alerts');
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve alert records.',
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  /**
   * GET /alerts/:id or /api/v1/alerts/:id
   * Progressive disclosure: Level 1 (What/Where/Severity/Action), Level 2 (Why), Level 3 (Evidence), Level 4 (Rule Trace)
   */
  fastify.get<{ Params: { id: string } }>('/alerts/:id', async (request, reply) => {
    const parseResult = alertIdParamSchema.safeParse(request.params);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid alert ID parameter format.',
          details: parseResult.error.format(),
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const { id } = parseResult.data;
    const detail: AlertDetailResponse | null = await alertService.getAlertDetail(id);

    if (!detail) {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: `Alert record with ID '${id}' was not found.`,
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return reply.status(200).send(detail);
  });

  /**
   * POST /alerts/:id/acknowledge or /api/v1/alerts/:id/acknowledge
   * Transitions alert to ACKNOWLEDGED with operator audit logging.
   */
  fastify.post<{ Params: { id: string } }>('/alerts/:id/acknowledge', async (request, reply) => {
    const parseParam = alertIdParamSchema.safeParse(request.params);
    if (!parseParam.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid alert ID parameter format.',
          details: parseParam.error.format(),
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const parseBody = alertAcknowledgeBodySchema.safeParse(request.body || {});
    if (!parseBody.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid alert acknowledgement request body.',
          details: parseBody.error.format(),
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const { id } = parseParam.data;
    const { operatorId, role, note } = parseBody.data;

    // Check for unauthorized mutation role
    if (role === 'UNAUTHORIZED' || role === 'ANONYMOUS_UNVERIFIED') {
      return reply.status(403).send({
        error: {
          code: 'FORBIDDEN',
          message: 'Caller lacks authorization to mutate operational alert state.',
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    try {
      const updated = await alertService.acknowledgeAlert(id, {
        id: operatorId,
        role: role || 'COASTAL_OPERATOR',
        note,
      });

      return reply.status(200).send({
        success: true,
        alert: updated,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to acknowledge alert';
      const statusCode = message.includes('not found') ? 404 : 400;
      return reply.status(statusCode).send({
        error: {
          code: statusCode === 404 ? 'NOT_FOUND' : 'WORKFLOW_ERROR',
          message,
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  /**
   * POST /alerts/:id/resolve or /api/v1/alerts/:id/resolve
   * Transitions alert to RESOLVED with operator audit logging.
   */
  fastify.post<{ Params: { id: string } }>('/alerts/:id/resolve', async (request, reply) => {
    const parseParam = alertIdParamSchema.safeParse(request.params);
    if (!parseParam.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid alert ID parameter format.',
          details: parseParam.error.format(),
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const parseBody = alertResolveBodySchema.safeParse(request.body || {});
    if (!parseBody.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid alert resolution request body.',
          details: parseBody.error.format(),
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const { id } = parseParam.data;
    const { operatorId, role, note } = parseBody.data;

    // Check for unauthorized mutation role
    if (role === 'UNAUTHORIZED' || role === 'ANONYMOUS_UNVERIFIED') {
      return reply.status(403).send({
        error: {
          code: 'FORBIDDEN',
          message: 'Caller lacks authorization to resolve operational alert state.',
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    try {
      const updated = await alertService.resolveAlert(id, {
        id: operatorId,
        role: role || 'DISASTER_MANAGER',
        note,
      });

      return reply.status(200).send({
        success: true,
        alert: updated,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resolve alert';
      const statusCode = message.includes('not found') ? 404 : 400;
      return reply.status(statusCode).send({
        error: {
          code: statusCode === 404 ? 'NOT_FOUND' : 'WORKFLOW_ERROR',
          message,
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  /**
   * POST /alerts/evaluate or /api/v1/alerts/evaluate
   * Internal / evaluation endpoint to evaluate conditions and generate deterministic alerts.
   */
  fastify.post('/alerts/evaluate', async (request, reply) => {
    const parseResult = alertEvaluateBodySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid alert evaluation input payload.',
          details: parseResult.error.format(),
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    try {
      const alerts = await alertService.evaluateAndGenerateAlerts(parseResult.data as any);
      return reply.status(200).send({
        success: true,
        evaluatedAlerts: alerts,
        count: alerts.length,
      });
    } catch (err) {
      fastify.log.error(err, 'Alert evaluation error');
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: err instanceof Error ? err.message : 'Alert evaluation failed',
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });
};
