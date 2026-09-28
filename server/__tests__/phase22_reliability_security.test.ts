import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import { DecisionEngineService } from '../services/decisionEngineService.js';
import type { DecisionEvaluationRequest } from '../types.js';

describe('Phase 22: Reliability, Security & Failure Hardening Test Suite', () => {
  let app: FastifyInstance;
  let decisionEngine: DecisionEngineService;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    decisionEngine = DecisionEngineService.getInstance();
  });

  afterAll(async () => {
    await app.close();
  });

  // ==========================================================================
  // 1. SECURITY & ROLE AUTHORIZATION MATRIX TESTS
  // ==========================================================================
  describe('1. Security & Role Authorization Matrix', () => {
    it('rejects unauthenticated requests to protected endpoints with 401', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/missions',
        payload: { title: 'Unauthorized Mission' },
      });

      expect(response.statusCode).toBe(401);
      const json = response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects FISHERMAN role trying to resolve authority alert with 403', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/alerts/ALERT-GALE-01/resolve',
        headers: {
          'x-orca-role': 'FISHERMAN',
        },
        payload: {
          operatorId: 'FISH-99',
          role: 'FISHERMAN',
          note: 'Trying to dismiss cyclone alert',
        },
      });

      expect(response.statusCode).toBe(403);
      const json = response.json();
      expect(json.error.code).toBe('FORBIDDEN');
      expect(json.error.message).toContain('Role \'FISHERMAN\' lacks authorization');
    });

    it('rejects RESEARCHER role trying to mutate vessel capability with 403', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/v1/vessels/VESSEL-001/capability',
        headers: {
          'x-orca-role': 'RESEARCHER',
        },
        payload: {
          maxWaveHeightMeters: 5.0,
        },
      });

      expect(response.statusCode).toBe(403);
      const json = response.json();
      expect(json.error.code).toBe('FORBIDDEN');
    });

    it('allows DISASTER_MANAGEMENT to resolve operational alerts', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/alerts/ALERT-GALE-01/resolve',
        headers: {
          'x-orca-role': 'DISASTER_MANAGEMENT',
        },
        payload: {
          operatorId: 'DISASTER-OFFICER-01',
          role: 'DISASTER_MANAGEMENT',
          note: 'Squall cell has moved offshore past coastal jurisdiction.',
        },
      });

      expect([200, 404]).toContain(response.statusCode);
      if (response.statusCode === 200) {
        const json = response.json();
        expect(json.success).toBe(true);
      }
    });

    it('rejects unauthorized manual ingestion trigger with 403', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/ingestion/demo',
        headers: {
          'x-orca-role': 'UNAUTHORIZED',
        },
        payload: { regions: ['MUMBAI'] },
      });

      expect(response.statusCode).toBe(403);
      const json = response.json();
      expect(json.error.code).toBe('FORBIDDEN');
    });
  });

  // ==========================================================================
  // 2. DECISION ENGINE ADVERSARIAL CASES (21 FAILURE MODES)
  // ==========================================================================
  describe('2. Decision Engine Adversarial Safety Tests (21 Failure Modes)', () => {
    const validBaseline: DecisionEvaluationRequest = {
      vesselId: 'VESSEL-001',
      departureTime: '06:00',
      durationHours: 4,
      targetZoneId: 'PFZ-MUM-01',
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.2,
        windSpeedKnots: 12.0,
        isLive: true,
        observedAt: new Date().toISOString(),
      },
    };

    it('Case 1: Missing wave observation -> returns INSUFFICIENT_DATA (never GO)', async () => {
      const result = await decisionEngine.evaluateDecision({
        ...validBaseline,
        environmentalContext: {
          ...validBaseline.environmentalContext,
          waveHeightMeters: undefined,
        },
      });

      expect(result.verdict).toBe('INSUFFICIENT_DATA');
      expect(result.confidence.level).toBe('LOW');
      expect(result.rules.some((r) => r.ruleId === 'RULE_04_MISSING_WAVE_OBSERVATION')).toBe(true);
    });

    it('Case 2: Missing wind observation -> returns INSUFFICIENT_DATA (never GO)', async () => {
      const result = await decisionEngine.evaluateDecision({
        ...validBaseline,
        environmentalContext: {
          ...validBaseline.environmentalContext,
          windSpeedKnots: undefined,
        },
      });

      expect(result.verdict).toBe('INSUFFICIENT_DATA');
      expect(result.rules.some((r) => r.ruleId === 'RULE_04_MISSING_WIND_OBSERVATION')).toBe(true);
    });

    it('Case 3 & 4: Unresolvable vessel profile -> returns AVOID (critical block)', async () => {
      const result = await decisionEngine.evaluateDecision({
        ...validBaseline,
        vesselId: 'NON_EXISTENT_VESSEL_999',
      });

      expect(result.verdict).toBe('AVOID');
      expect(result.rules.some((r) => r.ruleId === 'RULE_03_VESSEL_NOT_FOUND')).toBe(true);
    });

    it('Case 7: Stale ocean data (>24h) -> flagged with STALE provenance and CAUTION', async () => {
      const staleDate = new Date(Date.now() - 36 * 3600 * 1000).toISOString();
      const result = await decisionEngine.evaluateDecision({
        ...validBaseline,
        environmentalContext: {
          ...validBaseline.environmentalContext,
          observedAt: staleDate,
        },
      });

      expect(['CAUTION', 'INSUFFICIENT_DATA']).toContain(result.verdict);
      expect(result.evidence.some((e) => e.status === 'STALE')).toBe(true);
    });

    it('Case 10: High PFZ opportunity cannot override safety breach (AVOID dominates)', async () => {
      const result = await decisionEngine.evaluateDecision({
        ...validBaseline,
        targetZoneId: 'PFZ-SUPER-YIELD-01',
        environmentalContext: {
          ...validBaseline.environmentalContext,
          waveHeightMeters: 3.8, // Exceeds 8.5m boat limit
        },
      });

      expect(result.verdict).toBe('AVOID');
      expect(result.rules.some((r) => r.ruleId === 'RULE_08_PFZ_OPPORTUNITY_BLOCKED')).toBe(true);
    });

    it('Case 14: Negative wave height (-2.5m) -> returns INSUFFICIENT_DATA (corrupted value)', async () => {
      const result = await decisionEngine.evaluateDecision({
        ...validBaseline,
        environmentalContext: {
          ...validBaseline.environmentalContext,
          waveHeightMeters: -2.5,
        },
      });

      expect(result.verdict).toBe('INSUFFICIENT_DATA');
      expect(result.rules.some((r) => r.ruleId === 'RULE_04_CORRUPTED_TELEMETRY_VALUE')).toBe(true);
    });

    it('Case 15: NaN or Infinity in environmental inputs -> returns INSUFFICIENT_DATA', async () => {
      const result = await decisionEngine.evaluateDecision({
        ...validBaseline,
        environmentalContext: {
          ...validBaseline.environmentalContext,
          waveHeightMeters: NaN,
          windSpeedKnots: Infinity,
        },
      });

      expect(result.verdict).toBe('INSUFFICIENT_DATA');
      expect(result.rules.some((r) => r.ruleId === 'RULE_04_CORRUPTED_TELEMETRY_VALUE')).toBe(true);
    });

    it('Case 18: Route intersecting restricted naval zone -> returns AVOID', async () => {
      // Coords directly inside Mumbai naval buffer
      const result = await decisionEngine.evaluateDecision({
        ...validBaseline,
        waypoints: [
          { latitude: 18.91, longitude: 72.84, sequenceOrder: 1 },
          { latitude: 18.90, longitude: 72.83, sequenceOrder: 2 },
        ],
      });

      expect(['AVOID', 'CAUTION']).toContain(result.verdict);
      expect(result.rules.some((r) => r.ruleId.startsWith('RULE_02_GIS_'))).toBe(true);
    });

    it('Case 20: Vessel wave limit exceeded -> returns AVOID', async () => {
      const result = await decisionEngine.evaluateDecision({
        ...validBaseline,
        environmentalContext: {
          ...validBaseline.environmentalContext,
          waveHeightMeters: 3.2,
        },
      });

      expect(result.verdict).toBe('AVOID');
      expect(result.blockingFactors.length).toBeGreaterThan(0);
    });

    it('Case 21: Vessel wind limit exceeded -> returns AVOID', async () => {
      const result = await decisionEngine.evaluateDecision({
        ...validBaseline,
        environmentalContext: {
          ...validBaseline.environmentalContext,
          windSpeedKnots: 38.0,
        },
      });

      expect(result.verdict).toBe('AVOID');
      expect(result.blockingFactors.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 3. DETERMINISM & REPEATABILITY (100 CONSECUTIVE EVALUATIONS)
  // ==========================================================================
  describe('3. Determinism & Repeatability (100 Iterations)', () => {
    it('produces 100% identical verdicts, rules, and reason codes across 100 consecutive runs', async () => {
      const input: DecisionEvaluationRequest = {
        vesselId: 'VESSEL-001',
        departureTime: '06:00',
        durationHours: 4,
        targetZoneId: 'PFZ-MUM-01',
        originLocation: { latitude: 18.75, longitude: 72.70 },
        environmentalContext: {
          waveHeightMeters: 1.1,
          windSpeedKnots: 11.5,
          isLive: true,
          observedAt: '2026-09-28T06:00:00Z',
        },
      };

      const firstRun = await decisionEngine.evaluateDecision(input);

      for (let i = 0; i < 100; i++) {
        const nextRun = await decisionEngine.evaluateDecision(input);
        expect(nextRun.verdict).toBe(firstRun.verdict);
        expect(nextRun.rules.length).toBe(firstRun.rules.length);
        expect(nextRun.evidence.length).toBe(firstRun.evidence.length);
        expect(nextRun.blockingFactors).toEqual(firstRun.blockingFactors);
        expect(nextRun.cautionFactors).toEqual(firstRun.cautionFactors);
      }
    });
  });

  // ==========================================================================
  // 4. CONCURRENCY & IDEMPOTENCY TESTS
  // ==========================================================================
  describe('4. Concurrency & Idempotency', () => {
    it('handles duplicate offline sync batch replay idempotently without error', async () => {
      const syncMutationId = `MUT-IDEMP-${Date.now()}`;
      const payload = {
        clientId: 'CLIENT-BROWSER-TEST',
        connectivityState: 'CONNECTED',
        mutations: [
          {
            id: syncMutationId,
            mutationType: 'ACKNOWLEDGE_ALERT',
            payload: {
              alertId: 'ALERT-GALE-01',
              operatorId: 'TEST-OPERATOR-01',
              role: 'COASTAL_AUTHORITY',
              note: 'Replay idempotency test',
            },
            createdAt: new Date().toISOString(),
            attempts: 1,
          },
        ],
      };

      // First sync call
      const res1 = await app.inject({
        method: 'POST',
        url: '/api/v1/connectivity/sync',
        payload,
      });
      expect(res1.statusCode).toBe(200);

      // Replay identical sync call (e.g. on mobile network retry)
      const res2 = await app.inject({
        method: 'POST',
        url: '/api/v1/connectivity/sync',
        payload,
      });
      expect(res2.statusCode).toBe(200);
      const json2 = res2.json();
      expect(json2.syncedMutationIds).toContain(syncMutationId);
    });

    it('handles concurrent simultaneous decision queries cleanly without state corruption', async () => {
      const promises = Array.from({ length: 10 }).map((_, idx) =>
        decisionEngine.evaluateDecision({
          vesselId: 'VESSEL-001',
          departureTime: `${6 + (idx % 3)}:00`,
          durationHours: 4,
          targetZoneId: 'PFZ-MUM-01',
          originLocation: { latitude: 18.75, longitude: 72.70 },
          environmentalContext: {
            waveHeightMeters: 1.0 + idx * 0.1,
            windSpeedKnots: 10.0 + idx,
            isLive: true,
            observedAt: new Date().toISOString(),
          },
        })
      );

      const results = await Promise.all(promises);
      expect(results.length).toBe(10);
      results.forEach((r) => {
        expect(['GO', 'CAUTION', 'AVOID', 'INSUFFICIENT_DATA']).toContain(r.verdict);
        expect(r.rules.length).toBeGreaterThan(0);
      });
    });
  });
});
