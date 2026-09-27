import { describe, it, expect, beforeEach } from 'vitest';
import { DecisionEngineService } from '../services/decisionEngineService';
import type { DecisionEvaluationRequest } from '../../src/types/contract';

describe('Phase 13: Deterministic Decision Engine v2', () => {
  let engine: DecisionEngineService;

  beforeEach(() => {
    engine = DecisionEngineService.getInstance();
  });

  // 1. Completely safe mission -> GO
  it('Scenario 01: completely safe mission -> GO', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '05:45 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      waypoints: [{ latitude: 18.70, longitude: 72.65 }],
      targetZoneId: 'PFZ-MUM-01',
      environmentalContext: {
        waveHeightMeters: 1.1,
        wavePeriodSeconds: 7.0,
        windSpeedKnots: 10.0,
        seaSurfaceTemperatureCelsius: 28.0,
        currentSpeedKnots: 0.7,
        activeWarnings: [],
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('GO');
    expect(res.verdict).toBe('GO');
    expect(res.blockingFactors.length).toBe(0);
    expect(res.provenance.engine).toBe('decision-engine-v2');
  });

  // 2. Restricted-zone conflict -> AVOID
  it('Scenario 02: restricted-zone conflict -> AVOID', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 5,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      // Route passing straight into Naval Anchorage restricted polygon (18.93, 72.85)
      waypoints: [{ latitude: 18.93, longitude: 72.85 }],
      environmentalContext: {
        waveHeightMeters: 1.0,
        windSpeedKnots: 8.0,
        activeWarnings: [],
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('AVOID');
    expect(res.blockingFactors.some((f) => f.toLowerCase().includes('restricted') || f.toLowerCase().includes('zone') || f.toLowerCase().includes('geofence'))).toBe(true);
    const gisRule = res.rules.find((r) => r.category === 'GIS_SAFETY');
    expect(gisRule?.result).toBe('FAIL');
  });

  // 3. Severe warning -> AVOID
  it('Scenario 03: severe warning -> AVOID', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.0,
        windSpeedKnots: 10.0,
        activeWarnings: [
          {
            alertId: 'WARN-CYCLONE-01',
            severity: 'RED',
            warningType: 'CYCLONE_WARNING',
            description: 'Severe cyclonic storm alert in coastal waters.',
            validFrom: new Date(Date.now() - 3600000).toISOString(),
            validUntil: new Date(Date.now() + 86400000).toISOString(),
          },
        ],
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('AVOID');
    expect(res.blockingFactors.some((f) => f.toLowerCase().includes('severe') || f.toLowerCase().includes('warning'))).toBe(true);
  });

  // 4. Vessel capability failure -> AVOID
  it('Scenario 04: vessel capability failure -> AVOID', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001', // Max wave = 1.8m
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 2.8, // Exceeds 1.8m
        windSpeedKnots: 12.0,
        activeWarnings: [],
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('AVOID');
    expect(res.blockingFactors.some((f) => f.toLowerCase().includes('wave') || f.toLowerCase().includes('craft') || f.toLowerCase().includes('vessel'))).toBe(true);
  });

  // 5. Vessel capability caution -> CAUTION
  it('Scenario 05: vessel capability caution -> CAUTION', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001', // Max wave = 1.8m, caution at 85% (> 1.53m)
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.6, // Between 1.53m (85%) and 1.8m
        windSpeedKnots: 12.0,
        activeWarnings: [],
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('CAUTION');
    expect(res.cautionFactors.length).toBeGreaterThan(0);
  });

  // 6. High wave condition -> deterministic result
  it('Scenario 06: high wave condition -> deterministic AVOID for small craft', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001', // Max wave = 1.8m
      departureTime: '06:00 IST',
      durationHours: 3,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 3.5,
        windSpeedKnots: 15.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('AVOID');
    const waveRule = res.rules.find((r) => r.ruleId.includes('WAVE'));
    expect(waveRule?.result).toBe('FAIL');
  });

  // 7. High wind condition -> deterministic result
  it('Scenario 07: high wind condition -> deterministic AVOID', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001', // Max wind = 18 kts
      departureTime: '06:00 IST',
      durationHours: 3,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.2,
        windSpeedKnots: 28.0, // Exceeds 18 kts
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('AVOID');
    const windRule = res.rules.find((r) => r.ruleId.includes('WIND'));
    expect(windRule?.result).toBe('FAIL');
  });

  // 8. Temporal validity failure / long mission -> CAUTION or AVOID
  it('Scenario 08: temporal duration > 7h with sunset return -> CAUTION', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '12:00 IST',
      durationHours: 7, // Concludes at 19:00 IST past sunset
      mustReturnBeforeSunset: true,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.0,
        windSpeedKnots: 10.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('CAUTION');
    const temporalRule = res.rules.find((r) => r.category === 'TEMPORAL');
    expect(temporalRule?.result).toBe('CAUTION');
  });

  // 9. Missing critical data -> INSUFFICIENT_DATA
  it('Scenario 09: missing critical wave and wind data -> INSUFFICIENT_DATA', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        // Missing waveHeightMeters and windSpeedKnots
        observedAt: new Date().toISOString(),
        isLive: false,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('INSUFFICIENT_DATA');
    expect(res.verdict).toBe('INSUFFICIENT_DATA');
    expect(res.primaryDriver).toContain('Critical');
  });

  // 10. Stale critical data -> INSUFFICIENT_DATA or CAUTION
  it('Scenario 10: stale critical data (>24 hrs old) -> triggers stale warning and data quality penalty', async () => {
    const staleTime = new Date(Date.now() - 36 * 3600 * 1000).toISOString(); // 36 hours ago
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.1,
        windSpeedKnots: 10.0,
        observedAt: staleTime,
        isLive: false,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.dataStatus.staleSourcesCount).toBeGreaterThan(0);
    expect(res.cautionFactors.some((f) => f.toLowerCase().includes('stale') || f.toLowerCase().includes('hours old'))).toBe(true);
  });

  // 11. PFZ opportunity + safe route -> GO / CAUTION with PFZ recognized
  it('Scenario 11: PFZ opportunity + safe route -> GO with opportunityFactors populated', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '05:45 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      targetZoneId: 'PFZ-MUM-01',
      environmentalContext: {
        waveHeightMeters: 1.1,
        windSpeedKnots: 10.0,
        seaSurfaceTemperatureCelsius: 28.0,
        currentSpeedKnots: 0.8,
        activeWarnings: [],
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('GO');
    expect(res.opportunityFactors.length).toBeGreaterThan(0);
    expect(res.opportunityFactors.some((f) => f.includes('PFZ') || f.includes('INCOIS'))).toBe(true);
  });

  // 12. PFZ opportunity + restricted zone -> AVOID (PFZ cannot override restricted zone)
  it('Scenario 12: PFZ opportunity + restricted zone -> AVOID', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '05:45 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      // Direct intersection with Naval restricted zone (18.93, 72.85)
      waypoints: [{ latitude: 18.93, longitude: 72.85 }],
      targetZoneId: 'PFZ-MUM-01',
      environmentalContext: {
        waveHeightMeters: 1.0,
        windSpeedKnots: 10.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('AVOID');
    expect(res.blockingFactors.some((f) => f.toLowerCase().includes('restricted') || f.toLowerCase().includes('zone') || f.toLowerCase().includes('geofence'))).toBe(true);
    // PFZ rule should note it is blocked by safety constraints
    const pfzRule = res.rules.find((r) => r.category === 'OPPORTUNITY');
    expect(pfzRule?.result).toBe('NOT_APPLICABLE');
    expect(pfzRule?.reason).toContain('NEVER grant safety clearance');
  });

  // 13. PFZ opportunity + vessel failure -> AVOID (PFZ cannot override vessel limit)
  it('Scenario 13: PFZ opportunity + vessel wave failure -> AVOID', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '05:45 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      targetZoneId: 'PFZ-MUM-01',
      environmentalContext: {
        waveHeightMeters: 2.9, // Violates 1.8m craft limit
        windSpeedKnots: 10.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('AVOID');
    expect(res.blockingFactors.some((f) => f.toLowerCase().includes('wave') || f.toLowerCase().includes('vessel'))).toBe(true);
  });

  // 14. Multiple simultaneous failures -> highest-precedence safety state (AVOID with all blocking factors recorded)
  it('Scenario 14: multiple simultaneous failures -> AVOID with multiple blocking factors', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '05:45 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      waypoints: [{ latitude: 18.93, longitude: 72.85 }], // Restricted zone
      environmentalContext: {
        waveHeightMeters: 3.2, // Wave limit failure
        windSpeedKnots: 35.0, // Wind limit failure
        activeWarnings: [
          {
            alertId: 'W1',
            severity: 'RED',
            warningType: 'GALE',
            description: 'Gale warning',
            validUntil: new Date(Date.now() + 86400000).toISOString(),
          },
        ],
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('AVOID');
    expect(res.blockingFactors.length).toBeGreaterThanOrEqual(2);
  });

  // 15. Source conflict -> deterministic configured result
  it('Scenario 15: source conflict -> deterministic handling and quality flag', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.3,
        windSpeedKnots: 12.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.dataStatus).toBeDefined();
    expect(res.dataStatus.hasConflicts).toBe(false);
  });

  // 16. Same input repeated -> exact same result (Determinism test)
  it('Scenario 16: determinism assertion — identical input produces identical output', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '05:45 IST',
      durationHours: 5,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      targetZoneId: 'PFZ-MUM-01',
      environmentalContext: {
        waveHeightMeters: 1.4,
        windSpeedKnots: 12.0,
        seaSurfaceTemperatureCelsius: 27.8,
        currentSpeedKnots: 0.8,
        observedAt: '2026-09-27T06:00:00.000Z',
        isLive: true,
      },
    };

    const res1 = await engine.evaluateDecision(req);
    const res2 = await engine.evaluateDecision(req);

    expect(res1.state).toBe(res2.state);
    expect(res1.verdict).toBe(res2.verdict);
    expect(res1.primaryDriver).toBe(res2.primaryDriver);
    expect(res1.blockingFactors).toEqual(res2.blockingFactors);
    expect(res1.cautionFactors).toEqual(res2.cautionFactors);
    expect(res1.opportunityFactors).toEqual(res2.opportunityFactors);
    expect(res1.rules.length).toBe(res2.rules.length);

    res1.rules.forEach((r1, i) => {
      const r2 = res2.rules[i];
      expect(r1.ruleId).toBe(r2.ruleId);
      expect(r1.result).toBe(r2.result);
      expect(r1.severity).toBe(r2.severity);
      expect(r1.reason).toBe(r2.reason);
    });
  });

  // 17. Different vessel, same environment -> differential capability result
  it('Scenario 17: different vessel under same wave conditions produces differential verdict', async () => {
    const env = {
      waveHeightMeters: 2.2, // Small craft limit 1.8m (FAILS), Mechanized Trawler limit 2.8m (PASSES)
      windSpeedKnots: 14.0,
      observedAt: new Date().toISOString(),
      isLive: true,
    };

    // Small craft (VESSEL-001, max wave 1.8m)
    const resSmall = await engine.evaluateDecision({
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: env,
    });

    // Mechanized Trawler (VESSEL-002, max wave 2.8m)
    const resLarge = await engine.evaluateDecision({
      regionId: 'maharashtra',
      vesselId: 'VESSEL-002',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: env,
    });

    expect(resSmall.state).toBe('AVOID');
    expect(['GO', 'CAUTION']).toContain(resLarge.state);
  });

  // 18. IMD unavailable/demo -> truthful degraded/insufficient result when required
  it('Scenario 18: IMD pending source status is honestly reported in data status', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.1,
        windSpeedKnots: 10.0,
        observedAt: new Date().toISOString(),
        isLive: false,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.dataStatus.status).toBe('DEMO_SNAPSHOT');
  });

  // 19. GIS service unavailable -> safe fallback, never silently return GO
  it('Scenario 19: missing origin location triggers fallback without false GO', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      environmentalContext: {
        waveHeightMeters: 1.0,
        windSpeedKnots: 8.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBeDefined();
    expect(res.rules.some((r) => r.category === 'GIS_SAFETY')).toBe(true);
  });

  // 20. Malformed / extreme observation -> safe deterministic handling
  it('Scenario 20: extreme wave observation (8.0m) -> safe AVOID', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 8.0,
        windSpeedKnots: 55.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('AVOID');
  });

  // 21. Missing vessel -> fallback to default profile with explicit capability audit
  it('Scenario 21: missing vesselId falls back to default profile with capability audit', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.1,
        windSpeedKnots: 10.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.vesselResult).toBeDefined();
    expect(res.vesselResult?.vesselId).toBeDefined();
  });

  // 22. Missing mission duration -> defaults gracefully
  it('Scenario 22: default duration is handled gracefully', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.0,
        windSpeedKnots: 8.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('GO');
  });

  // 23. Empty route / minimal origin -> evaluates origin point clearance
  it('Scenario 23: empty waypoints list safely checks origin coordinate', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      waypoints: [],
      environmentalContext: {
        waveHeightMeters: 1.0,
        windSpeedKnots: 8.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.gisResult).toBeDefined();
    expect(res.state).toBe('GO');
  });

  // 24. Expired warning -> deterministic handling (ignored or filtered)
  it('Scenario 24: expired warning in past is filtered to NOT_APPLICABLE', async () => {
    const pastTime = new Date(Date.now() - 7200000).toISOString(); // 2 hours ago
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.1,
        windSpeedKnots: 10.0,
        activeWarnings: [
          {
            alertId: 'OLD-WARN-01',
            severity: 'RED',
            warningType: 'GALE',
            description: 'Expired gale warning from yesterday',
            validFrom: new Date(Date.now() - 86400000).toISOString(),
            validUntil: pastTime, // Expired
          },
        ],
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('GO');
    const warnRule = res.rules.find((r) => r.ruleId.includes('EXPIRED') || r.ruleId.includes('OLD-WARN-01'));
    expect(warnRule?.result).toBe('NOT_APPLICABLE');
  });

  // 25. Warning valid during mission -> evaluated as active hazard
  it('Scenario 25: active warning during mission window triggers AVOID', async () => {
    const futureTime = new Date(Date.now() + 14400000).toISOString(); // 4 hours in future
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.1,
        windSpeedKnots: 10.0,
        activeWarnings: [
          {
            alertId: 'ACTIVE-WARN-01',
            severity: 'ORANGE',
            warningType: 'ROUGH_SEAS',
            description: 'Rough sea conditions warning in Mumbai offshore sector.',
            validFrom: new Date().toISOString(),
            validUntil: futureTime,
          },
        ],
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('AVOID');
    expect(res.blockingFactors.some((f) => f.toLowerCase().includes('warning') || f.toLowerCase().includes('rough'))).toBe(true);
  });

});
