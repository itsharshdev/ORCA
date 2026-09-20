import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app';

describe('ORCA Backend API Skeleton Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. GET /health', () => {
    it('should return 200 OK and status HEALTHY', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('HEALTHY');
      expect(body.version).toBe('1.0.0');
      expect(body.services).toBeDefined();
      expect(body.services.apiServer).toBe(true);
      expect(body.services.database).toBe(false); // Honest Phase 3 placeholder
      expect(body.timestamp).toBeDefined();
    });

    it('should return 200 OK on /api/v1/health', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('HEALTHY');
    });
  });

  describe('2. GET /me', () => {
    it('should return authenticated profile skeleton adhering to contract', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/me',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.user).toBeDefined();
      expect(body.user.role).toBe('FISHERMAN');
      expect(body.activeVessel).toBeDefined();
      expect(body.activeVessel.maxWaveToleranceMeters).toBeGreaterThan(0);
      expect(body.permissions).toContain('query:orca');
    });
  });

  describe('3. POST /orca/query', () => {
    it('should accept a valid contract-shaped request and return decision trace', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/orca/query',
        payload: {
          queryText: 'Can I go fishing tomorrow morning for 5 hours from Sassoon Docks?',
          structuredMission: {
            activity: 'FISHING',
            vesselId: 'VESSEL-001',
            departureTime: '05:45',
            durationHours: 5,
            sectorId: 'maharashtra',
            mustReturnBeforeSunset: true,
          },
          regionId: 'maharashtra',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      // Verify contract fields
      expect(body.queryId).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.parsedIntent).toBeDefined();
      expect(body.parsedIntent.activity).toBe('FISHING');
      expect(body.parsedIntent.durationHours).toBe(5);

      // Verify 5 specialist agent trace
      expect(body.agentTrace).toBeDefined();
      expect(body.agentTrace.planner).toBeDefined();
      expect(body.agentTrace.oceanography).toBeDefined();
      expect(body.agentTrace.meteorology).toBeDefined();
      expect(body.agentTrace.pfzFisheries).toBeDefined();
      expect(body.agentTrace.geoSafety).toBeDefined();

      // Verify Decision verdict conforms to contract
      expect(body.decision).toBeDefined();
      expect(['GO', 'CAUTION', 'AVOID', 'INSUFFICIENT_DATA']).toContain(body.decision.verdict);
      expect(body.decision.confidence.score).toBeGreaterThan(0);
      expect(body.decision.ruleEvaluations).toBeInstanceOf(Array);
      expect(body.decision.dataQuality).toBeDefined();

      // Verify Evidence & Map Context
      expect(body.evidence).toBeInstanceOf(Array);
      expect(body.mapContext).toBeDefined();
      expect(body.mapContext.sectorId).toBe('maharashtra');
    });

    it('should reject malformed input with invalid activity enum', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/orca/query',
        payload: {
          structuredMission: {
            activity: 'INVALID_ACTIVITY_TYPE',
            durationHours: 5,
          },
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.requestId).toBeDefined();
      expect(body.error.details['structuredMission.activity']).toBeDefined();
    });

    it('should reject payload with empty query and missing structuredMission', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/orca/query',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('4. GET /decisions/:id', () => {
    it('should return decision details for valid ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/decisions/DEC-20260902-001',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.decision).toBeDefined();
      expect(body.decision.decisionId).toBe('DEC-20260902-001');
      expect(body.missionContext).toBeDefined();
      expect(body.fullEvidenceLog).toBeInstanceOf(Array);
    });

    it('should return 404 NOT_FOUND for unknown decision ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/decisions/INVALID-DECISION-999',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
      expect(body.error.code).toBe('NOT_FOUND');
      expect(body.error.message).toContain('not found');
      expect(body.error.requestId).toBeDefined();
    });
  });

  describe('5. Unknown Routes & Error Handling', () => {
    it('should return standard 404 ApiErrorEnvelope for unknown route', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/non-existent-route',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
      expect(body.error.code).toBe('NOT_FOUND');
      expect(body.error.message).toBe("Route 'GET /api/v1/non-existent-route' not found.");
      expect(body.error.requestId).toBeDefined();
      expect(body.error.timestamp).toBeDefined();
    });
  });
});
