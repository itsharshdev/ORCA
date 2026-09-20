import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import * as supabaseModule from '../supabase.js';

describe('ORCA Phase 4 — Missions & Authentication Tests', () => {
  let app: FastifyInstance;

  // Mock users
  const userA: supabaseModule.AuthenticatedUser = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'fisherman.ramesh@orca.marine',
    displayName: 'Ramesh Patel',
    role: 'fisherman',
  };

  const userB: supabaseModule.AuthenticatedUser = {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'fisherman.anand@orca.marine',
    displayName: 'Anand Kumar',
    role: 'fisherman',
  };

  // In-memory mission store for deterministic test verification
  const inMemoryMissions: Array<{
    id: string;
    owner_id: string;
    title: string;
    mission_type: string;
    status: string;
    target_zone_id?: string | null;
    departure_time?: string | null;
    duration_hours?: number | null;
    max_distance_km?: number | null;
    created_at: string;
    updated_at: string;
  }> = [];

  beforeAll(async () => {
    // Spy on verifyAuthToken
    vi.spyOn(supabaseModule, 'verifyAuthToken').mockImplementation(async (token: string) => {
      if (token === 'token-user-a') return userA;
      if (token === 'token-user-b') return userB;
      return null;
    });

    // Mock admin database client for mock test execution
    vi.spyOn(supabaseModule, 'getSupabaseAdmin').mockImplementation(() => {
      return {
        from: (table: string) => {
          if (table === 'missions') {
            return {
              insert: (record: Record<string, unknown>) => ({
                select: () => ({
                  single: async () => {
                    const id = `mission-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                    const newRecord = {
                      id,
                      owner_id: record.owner_id,
                      title: record.title,
                      mission_type: record.mission_type,
                      status: record.status,
                      target_zone_id: record.target_zone_id || null,
                      departure_time: record.departure_time || null,
                      duration_hours: record.duration_hours || null,
                      max_distance_km: record.max_distance_km || null,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    };
                    inMemoryMissions.push(newRecord as any);
                    return { data: newRecord, error: null };
                  },
                }),
              }),
              select: () => ({
                eq: (field1: string, val1: string) => ({
                  order: () => {
                    const filtered = inMemoryMissions.filter((m: any) => m[field1] === val1);
                    return Promise.resolve({ data: filtered, error: null });
                  },
                  eq: (field2: string, val2: string) => ({
                    maybeSingle: async () => {
                      const item = inMemoryMissions.find((m: any) => m[field1] === val1 && m[field2] === val2);
                      return { data: item || null, error: null };
                    },
                  }),
                }),
              }),
              delete: () => ({
                eq: (field1: string, val1: string) => ({
                  eq: (field2: string, val2: string) => ({
                    select: async () => {
                      const idx = inMemoryMissions.findIndex((m: any) => m[field1] === val1 && m[field2] === val2);
                      if (idx >= 0) {
                        const deleted = inMemoryMissions.splice(idx, 1);
                        return { data: deleted, error: null };
                      }
                      return { data: [], error: null };
                    },
                  }),
                }),
              }),
            } as any;
          }
          if (table === 'profiles') {
            return {
              select: () => ({
                eq: (_f: string, idVal: string) => ({
                  single: async () => ({
                    data: {
                      id: idVal,
                      display_name: idVal === userA.id ? userA.displayName : userB.displayName,
                      role: 'fisherman',
                      home_port: 'Sassoon Docks',
                      created_at: '2026-09-01T00:00:00Z',
                      updated_at: '2026-09-01T00:00:00Z',
                    },
                    error: null,
                  }),
                }),
              }),
            } as any;
          }
          if (table === 'vessels') {
            return {
              select: () => ({
                eq: () => ({
                  limit: () => ({
                    maybeSingle: async () => ({
                      data: {
                        id: 'vessel-001',
                        owner_id: userA.id,
                        name: 'Matsya Sagar',
                        vessel_type: 'FRP_BOAT',
                        length_meters: 9.2,
                        engine_hp: 40,
                        max_safe_wind_knots: 20,
                        max_safe_wave_meters: 2.0,
                        updated_at: '2026-09-01T00:00:00Z',
                      },
                      error: null,
                    }),
                  }),
                }),
              }),
            } as any;
          }
          return {} as any;
        },
      } as any;
    });

    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    vi.restoreAllMocks();
  });

  describe('1. Protected Route Authentication Checks', () => {
    it('should reject unauthenticated request to POST /api/v1/missions with 401 UNAUTHORIZED', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/missions',
        payload: {
          title: 'Morning Fishing Trip',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
      expect(body.error.code).toBe('UNAUTHORIZED');
      expect(body.error.message).toContain('token is required');
    });

    it('should reject invalid token with 401 UNAUTHORIZED', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/missions',
        headers: {
          authorization: 'Bearer invalid-token-xyz',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('UNAUTHORIZED');
      expect(body.error.message).toContain('Invalid or expired');
    });
  });

  describe('2. Mission Validation', () => {
    it('should reject empty title with 400 VALIDATION_ERROR', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/missions',
        headers: {
          authorization: 'Bearer token-user-a',
        },
        payload: {
          title: '',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.details.some((d: any) => d.field === 'title')).toBe(true);
    });

    it('should reject invalid missionType with 400 VALIDATION_ERROR', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/missions',
        headers: {
          authorization: 'Bearer token-user-a',
        },
        payload: {
          title: 'Offshore Expedition',
          missionType: 'SPACE_EXPLORATION',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.details.some((d: any) => d.field === 'missionType')).toBe(true);
    });
  });

  describe('3. Mission Persistence & Cross-User Isolation (RLS / Ownership)', () => {
    let createdMissionIdUserA: string;

    it('should allow User A to create a mission', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/missions',
        headers: {
          authorization: 'Bearer token-user-a',
        },
        payload: {
          title: 'TN-PFZ Zone Alpha Run',
          missionType: 'FISHING',
          targetZoneId: 'TN-PFZ-01',
          durationHours: 6.5,
          maxDistanceKm: 30,
          originLocation: { lat: 18.915, lon: 72.825 },
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.mission).toBeDefined();
      expect(body.mission.title).toBe('TN-PFZ Zone Alpha Run');
      expect(body.mission.owner_id).toBe(userA.id);
      expect(body.mission.id).toBeDefined();
      createdMissionIdUserA = body.mission.id;
    });

    it('should allow User A to retrieve their created mission list', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/missions',
        headers: {
          authorization: 'Bearer token-user-a',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.missions).toBeInstanceOf(Array);
      expect(body.count).toBeGreaterThanOrEqual(1);
      expect(body.missions.some((m: any) => m.id === createdMissionIdUserA)).toBe(true);
    });

    it('should allow User A to get single mission by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/missions/${createdMissionIdUserA}`,
        headers: {
          authorization: 'Bearer token-user-a',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.mission).toBeDefined();
      expect(body.mission.id).toBe(createdMissionIdUserA);
      expect(body.mission.owner_id).toBe(userA.id);
    });

    it('should DENY User B access to User A mission (Cross-User Isolation)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/missions/${createdMissionIdUserA}`,
        headers: {
          authorization: 'Bearer token-user-b',
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('MISSION_NOT_FOUND');
      expect(body.error.message).toContain('not found or you do not have permission');
    });

    it('should allow User A to delete their own mission', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/missions/${createdMissionIdUserA}`,
        headers: {
          authorization: 'Bearer token-user-a',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
  });

  describe('4. Authenticated /me Integration', () => {
    it('should return real authenticated profile details when token is provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/me',
        headers: {
          authorization: 'Bearer token-user-a',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.user.id).toBe(userA.id);
      expect(body.user.fullName).toBe(userA.displayName);
      expect(body.user.email).toBe(userA.email);
      expect(body.activeVessel).toBeDefined();
      expect(body.permissions).toContain('missions:create');
    });
  });
});
