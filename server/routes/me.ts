import type { FastifyPluginAsync } from 'fastify';
import type { MeResponse } from '../types.js';
import { optionalAuth } from '../plugins/auth.js';
import { getSupabaseAdmin } from '../supabase.js';

export const meRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/me', { preHandler: [optionalAuth] }, async (request): Promise<MeResponse> => {
    // If authenticated user is present via Supabase Auth
    if (request.user) {
      const admin = getSupabaseAdmin();
      let profile = null;
      let vessel = null;

      if (admin) {
        const { data: p } = await admin
          .from('profiles')
          .select('*')
          .eq('id', request.user.id)
          .single();
        profile = p;

        const { data: v } = await admin
          .from('vessels')
          .select('*')
          .eq('owner_id', request.user.id)
          .limit(1)
          .maybeSingle();
        vessel = v;
      }

      return {
        user: {
          id: request.user.id,
          email: request.user.email || 'user@orca.marine',
          fullName: profile?.display_name || request.user.displayName || 'ORCA User',
          role: 'FISHERMAN',
          harborId: 'PORT-IND-01',
          harborName: profile?.home_port || 'Default Harbor',
          assignedVesselIds: vessel ? [vessel.id] : [],
          preferredLanguage: 'en',
          createdAt: profile?.created_at || new Date().toISOString(),
          updatedAt: profile?.updated_at || new Date().toISOString(),
        },
        activeVessel: vessel ? {
          id: vessel.id,
          ownerId: vessel.owner_id,
          name: vessel.name,
          registrationNumber: vessel.registration_number || 'REG-PENDING',
          vesselType: 'TRADITIONAL_MOTORIZED',
          lengthMeters: vessel.length_meters ? Number(vessel.length_meters) : 8.5,
          beamMeters: 2.2,
          draftMeters: 1.1,
          engineHp: vessel.engine_hp ? Number(vessel.engine_hp) : 25,
          maxWaveToleranceMeters: vessel.max_safe_wave_meters ? Number(vessel.max_safe_wave_meters) : 2.0,
          maxWindToleranceKnots: vessel.max_safe_wind_knots ? Number(vessel.max_safe_wind_knots) : 20.0,
          cruisingSpeedKnots: 6.5,
          fuelCapacityHours: 10.0,
          crewCapacity: 3,
          homePort: {
            name: profile?.home_port || 'Default Harbor',
            latitude: 18.915,
            longitude: 72.825,
          },
          currentLocation: {
            latitude: 18.915,
            longitude: 72.825,
          },
          currentHeadingDegrees: 180,
          updatedAt: vessel.updated_at,
        } : null,
        permissions: ['query:orca', 'view:pfz', 'view:map', 'plan:trip', 'missions:create', 'missions:view'],
      };
    }

    // Default skeleton / unauthenticated demo response
    return {
      user: {
        id: 'usr-f8e2-411a-9b81-64d8a7c8e991',
        email: 'operator.alibaug@orca.incois.gov.in',
        fullName: 'Suresh Tandel',
        role: 'FISHERMAN',
        harborId: 'PORT-BOM-01',
        harborName: 'Sassoon Docks, Mumbai',
        assignedVesselIds: ['VESSEL-001'],
        preferredLanguage: 'mr',
        createdAt: '2026-08-15T04:00:00.000Z',
        updatedAt: '2026-09-02T06:00:00.000Z',
      },
      activeVessel: {
        id: 'VESSEL-001',
        ownerId: 'usr-f8e2-411a-9b81-64d8a7c8e991',
        name: 'Matsya Sagar 1',
        registrationNumber: 'IND-MH-02-MM-849',
        vesselType: 'TRADITIONAL_MOTORIZED',
        lengthMeters: 8.5,
        beamMeters: 2.2,
        draftMeters: 1.1,
        engineHp: 25,
        maxWaveToleranceMeters: 1.8,
        maxWindToleranceKnots: 18.0,
        cruisingSpeedKnots: 6.5,
        fuelCapacityHours: 10.0,
        crewCapacity: 3,
        homePort: {
          name: 'Sassoon Docks',
          latitude: 18.915,
          longitude: 72.825,
        },
        currentLocation: {
          latitude: 18.915,
          longitude: 72.825,
        },
        currentHeadingDegrees: 180,
        updatedAt: '2026-09-02T08:00:00.000Z',
      },
      permissions: ['query:orca', 'view:pfz', 'view:map', 'plan:trip'],
    };
  });
};
