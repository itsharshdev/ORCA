import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { IncoisPfzAdapter, type PfzOpportunityRecord } from '../adapters/incoisPfzAdapter.js';
import { DemoDataAdapter } from '../adapters/demoAdapter.js';

const pfzQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  region: z.string().optional().default('maharashtra'),
  state: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  allowFallback: z.enum(['true', 'false']).optional().default('true'),
});

export const pfzRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /pfz
   * Returns mission-relevant Potential Fishing Zone (PFZ) intelligence.
   */
  fastify.get('/pfz', async (request, reply) => {
    const parseResult = pfzQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid PFZ query parameters.',
          details: parseResult.error.flatten(),
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const { latitude, longitude, region, state, limit, allowFallback } = parseResult.data;
    const shouldFallback = allowFallback === 'true';

    try {
      const adapter = new IncoisPfzAdapter();
      const response = await adapter.fetch({
        latitude,
        longitude,
        regionId: region,
        state,
      });

      if (response.status === 'READY' && response.normalizedObservations.length > 0) {
        const metadata = response.metadata as { opportunities?: PfzOpportunityRecord[] };
        let opportunities = metadata.opportunities || [];

        if (state) {
          opportunities = opportunities.filter(
            (o) => o.stateName.toLowerCase() === state.toLowerCase()
          );
        }

        const paginated = opportunities.slice(0, limit);

        return reply.status(200).send({
          success: true,
          source: response.source,
          dataset: response.dataset,
          isLive: true,
          status: 'LIVE',
          retrievedAt: response.retrievedAt,
          observedAt: response.observedAt,
          validUntil: response.validUntil,
          total: opportunities.length,
          count: paginated.length,
          opportunities: paginated,
          nearestOpportunity: paginated[0] || null,
          disclaimer:
            'Official Potential Fishing Zone (PFZ) intelligence from INCOIS. PFZ advisories identify potential oceanographic features (SST/Chlorophyll fronts) and DO NOT represent weather, wave, or safety clearance.',
          safetySeparation: {
            isSafetyClearance: false,
            mandatoryCheck: 'Check IMD Marine Warnings and INCOIS Ocean Wave/Current Forecast before voyage.',
          },
          timestamp: new Date().toISOString(),
        });
      }

      // If live retrieval failed or empty and fallback enabled
      if (shouldFallback) {
        const demoAdapter = new DemoDataAdapter('demo_pfz_advisories');
        const demoResponse = await demoAdapter.fetch({ regionId: region });

        return reply.status(200).send({
          success: true,
          source: 'ORCA_DEMO',
          dataset: 'demo_pfz_advisories',
          isLive: false,
          status: 'DEMO_SNAPSHOT',
          retrievedAt: demoResponse.retrievedAt,
          observedAt: demoResponse.observedAt,
          validUntil: demoResponse.validUntil,
          total: demoResponse.normalizedObservations.length,
          count: demoResponse.normalizedObservations.length,
          opportunities: demoResponse.normalizedObservations.map((obs) => ({
            uid: (obs.metadata?.dedup_key as string) || 'DEMO-PFZ-01',
            stateName: region.toUpperCase(),
            advisoryDate: obs.observedAt.split('T')[0],
            validFrom: obs.observedAt,
            validUntil: obs.validUntil || obs.observedAt,
            isExpired: false,
            lengthKm: obs.numericValue || 15.0,
            midpoint: obs.location || { lat: 18.92, lon: 72.83 },
            coordinates: [[obs.location?.lon || 72.83, obs.location?.lat || 18.92]],
            distanceKm: 18.5,
            distanceNm: 10.0,
            bearingDeg: 245.0,
            directionCompass: 'SW',
            spatialRelevanceScore: 88,
          })),
          nearestOpportunity: {
            uid: 'DEMO-PFZ-01',
            stateName: region.toUpperCase(),
            advisoryDate: new Date().toISOString().split('T')[0],
            distanceKm: 18.5,
            distanceNm: 10.0,
            bearingDeg: 245.0,
            directionCompass: 'SW',
            spatialRelevanceScore: 88,
          },
          disclaimer:
            'DEMO SNAPSHOT — INCOIS live service unavailable. Simulated PFZ data for demonstration only.',
          safetySeparation: {
            isSafetyClearance: false,
            mandatoryCheck: 'Check IMD Marine Warnings and INCOIS Ocean Wave/Current Forecast before voyage.',
          },
          timestamp: new Date().toISOString(),
        });
      }

      return reply.status(503).send({
        error: {
          code: 'UPSTREAM_UNAVAILABLE',
          message: 'Official INCOIS PFZ service is currently unreachable and fallback was disabled.',
          details: response.error,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'PFZ query execution error';
      return reply.status(500).send({
        error: {
          code: 'PFZ_QUERY_ERROR',
          message,
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });
};
