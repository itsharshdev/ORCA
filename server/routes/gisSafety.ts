import type { FastifyPluginAsync } from 'fastify';
import { GisSafetyService } from '../services/gisSafetyService.js';
import type { RouteEvaluationRequest } from '../types.js';

export const gisSafetyRoutes: FastifyPluginAsync = async (app) => {
  const gisService = GisSafetyService.getInstance();

  /**
   * POST /gis/evaluate-route or /api/v1/gis/evaluate-route
   * Deterministic spatial safety evaluation of route waypoints / vessel position.
   */
  app.post<{ Body: RouteEvaluationRequest }>('/gis/evaluate-route', async (request, reply) => {
    try {
      const body = request.body || {};
      const result = await gisService.evaluateRoute(body);
      return reply.status(200).send(result);
    } catch (err) {
      app.log.error(err, 'GIS Safety Evaluation error');
      return reply.status(500).send({
        error: {
          code: 'GIS_EVALUATION_ERROR',
          message: err instanceof Error ? err.message : 'Failed to evaluate spatial safety route',
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  /**
   * GET /gis/restricted-zones or /api/v1/gis/restricted-zones
   * Returns authoritative list of active maritime restricted zones.
   */
  app.get('/gis/restricted-zones', async (request, reply) => {
    try {
      const zones = await gisService.getRestrictedZones();
      return reply.status(200).send({
        success: true,
        count: zones.length,
        zones,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      app.log.error(err, 'Error retrieving restricted zones');
      return reply.status(500).send({
        error: {
          code: 'RESTRICTED_ZONES_ERROR',
          message: err instanceof Error ? err.message : 'Failed to retrieve restricted zones',
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });
};
