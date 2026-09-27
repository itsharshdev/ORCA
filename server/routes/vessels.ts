import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { VesselCapabilityService } from '../services/vesselCapabilityService.js';
import { optionalAuth } from '../plugins/auth.js';
import type { CapabilityEvaluationRequest, VesselCapabilityContract } from '../types.js';

const evaluateCapabilitySchema = z.object({
  vesselId: z.string().optional(),
  vesselOverrides: z.record(z.string(), z.unknown()).optional(),
  missionDistanceNm: z.number().nonnegative().optional(),
  maxDistanceFromPortNm: z.number().nonnegative().optional(),
  missionDurationHours: z.number().nonnegative().optional(),
  plannedCrewCount: z.number().int().positive().optional(),
  environmentalContext: z
    .object({
      waveHeightMeters: z.number().nonnegative().optional(),
      windSpeedKnots: z.number().nonnegative().optional(),
      windGustKnots: z.number().nonnegative().optional(),
      visibilityKm: z.number().nonnegative().optional(),
      seaState: z.string().optional(),
    })
    .optional(),
  requiredEquipment: z.array(z.string()).optional(),
});

export const vesselRoutes: FastifyPluginAsync = async (app) => {
  const capabilityService = VesselCapabilityService.getInstance();

  /**
   * GET /vessels/:id/capability or /api/v1/vessels/:id/capability
   * Returns full capability profile with threshold provenance metadata.
   */
  app.get<{ Params: { id: string } }>(
    '/vessels/:id/capability',
    { preHandler: [optionalAuth] },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const capability = await capabilityService.getCapability(id);
        if (!capability) {
          return reply.status(404).send({
            error: {
              code: 'NOT_FOUND',
              message: `Vessel with ID '${id}' was not found.`,
              details: null,
              requestId: request.id,
              timestamp: new Date().toISOString(),
            },
          });
        }
        return reply.status(200).send(capability);
      } catch (err) {
        app.log.error(err, 'Failed to fetch vessel capability');
        return reply.status(500).send({
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: err instanceof Error ? err.message : 'Internal server error',
            details: null,
            requestId: request.id,
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
  );

  /**
   * PATCH /vessels/:id/capability or /api/v1/vessels/:id/capability
   * Updates capability fields and threshold provenance metadata.
   */
  app.patch<{ Params: { id: string }; Body: Partial<VesselCapabilityContract> }>(
    '/vessels/:id/capability',
    { preHandler: [optionalAuth] },
    async (request, reply) => {
      const { id } = request.params;
      const updates = request.body || {};

      try {
        const updated = await capabilityService.updateCapability(id, updates);
        return reply.status(200).send(updated);
      } catch (err) {
        app.log.error(err, 'Failed to update vessel capability');
        const isNotFound = err instanceof Error && err.message.includes('not found');
        return reply.status(isNotFound ? 404 : 500).send({
          error: {
            code: isNotFound ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: err instanceof Error ? err.message : 'Failed to update vessel capability',
            details: null,
            requestId: request.id,
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
  );

  /**
   * POST /vessels/evaluate-capability or /api/v1/vessels/evaluate-capability
   * Deterministically evaluates mission and environmental parameters against vessel capability model.
   */
  app.post<{ Body: CapabilityEvaluationRequest }>(
    '/vessels/evaluate-capability',
    { preHandler: [optionalAuth] },
    async (request, reply) => {
      const parsed = evaluateCapabilitySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid capability evaluation request parameters',
            details: parsed.error.format(),
            requestId: request.id,
            timestamp: new Date().toISOString(),
          },
        });
      }

      try {
        const evaluation = await capabilityService.evaluateCapability(
          parsed.data as CapabilityEvaluationRequest
        );
        return reply.status(200).send(evaluation);
      } catch (err) {
        app.log.error(err, 'Failed to evaluate vessel capability');
        return reply.status(500).send({
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: err instanceof Error ? err.message : 'Capability evaluation failure',
            details: null,
            requestId: request.id,
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
  );

  /**
   * POST /vessels/:id/evaluate-capability or /api/v1/vessels/:id/evaluate-capability
   */
  app.post<{ Params: { id: string }; Body: CapabilityEvaluationRequest }>(
    '/vessels/:id/evaluate-capability',
    { preHandler: [optionalAuth] },
    async (request, reply) => {
      const { id } = request.params;
      const body = (request.body || {}) as CapabilityEvaluationRequest;
      body.vesselId = id;

      const parsed = evaluateCapabilitySchema.safeParse(body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid capability evaluation request parameters',
            details: parsed.error.format(),
            requestId: request.id,
            timestamp: new Date().toISOString(),
          },
        });
      }

      try {
        const evaluation = await capabilityService.evaluateCapability(
          parsed.data as CapabilityEvaluationRequest
        );
        return reply.status(200).send(evaluation);
      } catch (err) {
        app.log.error(err, 'Failed to evaluate vessel capability');
        return reply.status(500).send({
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: err instanceof Error ? err.message : 'Capability evaluation failure',
            details: null,
            requestId: request.id,
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
  );
};
