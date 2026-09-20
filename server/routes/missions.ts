import type { FastifyPluginAsync } from 'fastify';
import { requireAuth } from '../plugins/auth.js';
import { createMissionSchema } from '../schemas/missionSchemas.js';
import { getSupabaseAdmin, createScopedClient } from '../supabase.js';

export const missionRoutes: FastifyPluginAsync = async (fastify) => {
  // CREATE MISSION
  fastify.post('/missions', { preHandler: [requireAuth] }, async (request, reply) => {
    const parseResult = createMissionSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid mission creation payload',
          details: parseResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
      });
    }

    const user = request.user!;
    const input = parseResult.data;
    const admin = getSupabaseAdmin();

    if (!admin) {
      return reply.status(503).send({
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Database persistence service is not configured.',
        },
      });
    }

    // Format spatial points if provided (WKT format POINT(lon lat))
    const originPoint = input.originLocation
      ? `POINT(${input.originLocation.lon} ${input.originLocation.lat})`
      : null;
    const destinationPoint = input.destinationLocation
      ? `POINT(${input.destinationLocation.lon} ${input.destinationLocation.lat})`
      : null;

    // Use scoped client if token available to enforce RLS, or fallback to admin
    const client = (request.accessToken && createScopedClient(request.accessToken)) || admin;

    const { data: mission, error } = await client
      .from('missions')
      .insert({
        owner_id: user.id,
        title: input.title,
        mission_type: input.missionType,
        status: input.status,
        vessel_id: input.vesselId || null,
        target_zone_id: input.targetZoneId || null,
        departure_time: input.departureTime || null,
        duration_hours: input.durationHours || null,
        max_distance_km: input.maxDistanceKm || null,
        origin_location: originPoint,
        destination_location: destinationPoint,
        metadata: input.metadata || {},
      })
      .select()
      .single();

    if (error) {
      request.log.error(error, 'Failed to insert mission into database');
      return reply.status(500).send({
        error: {
          code: 'PERSISTENCE_ERROR',
          message: error.message || 'Failed to persist mission record.',
        },
      });
    }

    return reply.status(201).send({
      mission,
      message: 'Mission created successfully',
    });
  });

  // LIST USER'S MISSIONS
  fastify.get('/missions', { preHandler: [requireAuth] }, async (request, reply) => {
    const user = request.user!;
    const admin = getSupabaseAdmin();

    if (!admin) {
      return reply.status(503).send({
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Database persistence service is not configured.',
        },
      });
    }

    const client = (request.accessToken && createScopedClient(request.accessToken)) || admin;

    const { data: missions, error } = await client
      .from('missions')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      request.log.error(error, 'Failed to retrieve missions');
      return reply.status(500).send({
        error: {
          code: 'QUERY_ERROR',
          message: error.message || 'Failed to query missions.',
        },
      });
    }

    return {
      missions: missions || [],
      count: missions ? missions.length : 0,
    };
  });

  // GET SINGLE MISSION BY ID
  fastify.get<{ Params: { id: string } }>('/missions/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params;
    const user = request.user!;
    const admin = getSupabaseAdmin();

    if (!admin) {
      return reply.status(503).send({
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Database persistence service is not configured.',
        },
      });
    }

    const client = (request.accessToken && createScopedClient(request.accessToken)) || admin;

    const { data: mission, error } = await client
      .from('missions')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (error) {
      request.log.error(error, 'Failed to fetch mission');
      return reply.status(500).send({
        error: {
          code: 'QUERY_ERROR',
          message: error.message || 'Failed to fetch mission.',
        },
      });
    }

    if (!mission) {
      return reply.status(404).send({
        error: {
          code: 'MISSION_NOT_FOUND',
          message: `Mission with ID '${id}' was not found or you do not have permission to view it.`,
        },
      });
    }

    return {
      mission,
    };
  });

  // DELETE MISSION
  fastify.delete<{ Params: { id: string } }>('/missions/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params;
    const user = request.user!;
    const admin = getSupabaseAdmin();

    if (!admin) {
      return reply.status(503).send({
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Database persistence service is not configured.',
        },
      });
    }

    const client = (request.accessToken && createScopedClient(request.accessToken)) || admin;

    const { data, error } = await client
      .from('missions')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id)
      .select();

    if (error) {
      request.log.error(error, 'Failed to delete mission');
      return reply.status(500).send({
        error: {
          code: 'DELETE_ERROR',
          message: error.message || 'Failed to delete mission.',
        },
      });
    }

    if (!data || data.length === 0) {
      return reply.status(404).send({
        error: {
          code: 'MISSION_NOT_FOUND',
          message: `Mission with ID '${id}' not found or not owned by user.`,
        },
      });
    }

    return {
      success: true,
      message: 'Mission deleted successfully',
    };
  });
};
