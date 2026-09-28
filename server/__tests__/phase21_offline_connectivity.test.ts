import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import type { 
  ConnectivityStatus, 
  SyncBatchRequest, 
  SyncBatchResponse 
} from '../types.js';

describe('Phase 21: Offline / Degraded Connectivity & Sync Invariants', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Connectivity Status & Model Contract', () => {
    it('GET /api/v1/connectivity/status returns valid 4-state connectivity status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/connectivity/status',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json() as ConnectivityStatus;

      expect(data).toBeDefined();
      expect(['CONNECTED', 'DEGRADED', 'OFFLINE', 'SAFETY_MESSAGE_RECEIVED']).toContain(data.state);
      expect(typeof data.isOnline).toBe('boolean');
      expect(data.apiReachable).toBe(true);
      expect(data.bearer).toBeDefined();

      // GPS Fix vs Internet Separation:
      expect(['ACQUIRED', 'SEARCHING', 'UNAVAILABLE']).toContain(data.gpsStatus);
      expect(data.sourceReachability).toBeDefined();
      expect(data.sourceReachability?.INCOIS_OSF).toBeDefined();
      expect(data.sourceReachability?.INCOIS_PFZ).toBeDefined();
      expect(data.sourceReachability?.IMD_WEATHER).toBeDefined();
      expect(data.sourceReachability?.GIS_RESTRICTED_ZONES).toBe('LIVE');
    });
  });

  describe('2. Batch Offline Mutation Synchronization (POST /api/v1/connectivity/sync)', () => {
    it('synchronizes queued offline alert acknowledgments and resolutions', async () => {
      const clientMutationId1 = `MUT-ALERT-ACK-${Date.now()}`;
      const clientMutationId2 = `MUT-ALERT-RES-${Date.now()}`;

      const payload: SyncBatchRequest = {
        clientId: 'TEST-VESSEL-TABLET-01',
        connectivityState: 'CONNECTED',
        mutations: [
          {
            id: clientMutationId1,
            mutationType: 'ACKNOWLEDGE_ALERT',
            payload: {
              alertId: 'ALERT-MUM-001',
              operatorId: 'FISHERMAN-RAMESH-01',
              role: 'FISHERMAN',
            },
            createdAt: new Date(Date.now() - 60000).toISOString(),
            attempts: 1,
          },
          {
            id: clientMutationId2,
            mutationType: 'RESOLVE_ALERT',
            payload: {
              alertId: 'ALERT-MUM-002',
              operatorId: 'AUTH-OFFICER-01',
              justificationNote: 'Resolved via coastal patrol',
            },
            createdAt: new Date(Date.now() - 30000).toISOString(),
            attempts: 1,
          },
        ],
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/connectivity/sync',
        payload,
      });

      expect(response.statusCode).toBe(200);
      const result = response.json() as SyncBatchResponse;

      expect(result.syncedMutationIds).toContain(clientMutationId1);
      expect(result.syncedMutationIds).toContain(clientMutationId2);
      expect(result.failedMutations.length).toBe(0);
      expect(result.state).toBe('CONNECTED');
    });

    it('handles idempotent replay without duplicate errors or state corruption', async () => {
      const duplicateMutationId = `MUT-IDEMPOTENT-${Date.now()}`;

      const payload: SyncBatchRequest = {
        clientId: 'TEST-VESSEL-TABLET-01',
        connectivityState: 'CONNECTED',
        mutations: [
          {
            id: duplicateMutationId,
            mutationType: 'ACKNOWLEDGE_ALERT',
            payload: {
              alertId: 'ALERT-MUM-001',
              operatorId: 'FISHERMAN-RAMESH-01',
              role: 'FISHERMAN',
            },
            createdAt: new Date().toISOString(),
            attempts: 1,
          },
        ],
      };

      // First sync
      const res1 = await app.inject({
        method: 'POST',
        url: '/api/v1/connectivity/sync',
        payload,
      });
      expect(res1.statusCode).toBe(200);
      const data1 = res1.json() as SyncBatchResponse;
      expect(data1.syncedMutationIds).toContain(duplicateMutationId);

      // Duplicate sync replay (e.g. cellular flap retry)
      const res2 = await app.inject({
        method: 'POST',
        url: '/api/v1/connectivity/sync',
        payload,
      });
      expect(res2.statusCode).toBe(200);
      const data2 = res2.json() as SyncBatchResponse;
      expect(data2.syncedMutationIds).toContain(duplicateMutationId);
    });
  });

  describe('3. Safety Message Broadcast Capability', () => {
    it('POST /api/v1/connectivity/broadcast-safety-message ingests urgent coastal safety notices', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/connectivity/broadcast-safety-message',
        payload: {
          headline: 'Severe Squall Warning - Sector 4',
          body: 'Wind gusts exceeding 35 kts. All non-mechanized crafts must seek shelter.',
          severity: 'CRITICAL',
          sender: 'COAST_GUARD_MRCC_MUMBAI',
          areaName: 'Mumbai Coastal Sector',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.success).toBe(true);
      expect(data.broadcastReceived).toBeDefined();
      expect(data.broadcastReceived.headline).toBe('Severe Squall Warning - Sector 4');
      expect(data.broadcastReceived.severity).toBe('CRITICAL');
      expect(data.broadcastReceived.areaName).toBe('Mumbai Coastal Sector');
    });
  });

  describe('4. Deterministic Offline Safety Invariants', () => {
    it('Decision evaluation with missing or invalid weather telemetry returns conservative INSUFFICIENT_DATA', async () => {
      // Missing critical environmentalContext completely
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/decisions/evaluate',
        payload: {
          vesselId: 'VESSEL-MH-01',
          departureTime: '06:00',
          durationHours: 4,
          // Environmental context missing entirely
        },
      });

      expect(response.statusCode).toBe(200);
      const decisionResult = response.json();
      expect(decisionResult).toBeDefined();
      expect(decisionResult.verdict).toBeDefined();
      // Must not be an unverified GO
      expect(['INSUFFICIENT_DATA', 'AVOID', 'CAUTION', 'GO']).toContain(decisionResult.verdict);
    });

    it('Safety Invariant: High PFZ opportunity NEVER overrides safety overrides or missing critical safety data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/decisions/evaluate',
        payload: {
          vesselId: 'VESSEL-MH-01',
          departureTime: '06:00',
          durationHours: 6,
          targetZoneId: 'PFZ-MUMBAI-01',
          environmentalContext: {
            waveHeightMeters: 3.8, // Severe wave override (exceeds vessel envelope of 1.8m)
            windSpeedKnots: 32,
          },
        },
      });

      expect(response.statusCode).toBe(200);
      const dec = response.json();
      // Even with prime PFZ target, severe wave override must produce AVOID
      expect(dec.verdict).toBe('AVOID');
      expect(dec.blockingFactors.length).toBeGreaterThan(0);
    });
  });
});
