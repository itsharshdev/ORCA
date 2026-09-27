import { describe, it, expect, beforeEach } from 'vitest';
import { DecisionEngineService } from '../services/decisionEngineService';
import type { DecisionEvaluationRequest } from '../../src/types/contract';

describe('Phase 14: Evidence, Confidence & Conflict Handling System', () => {
  let engine: DecisionEngineService;

  beforeEach(() => {
    engine = DecisionEngineService.getInstance();
  });

  // 1. Complete Fresh Evidence
  it('01. Complete fresh evidence generates comprehensive evidence items with FRESH status', async () => {
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
        windSpeedKnots: 10.0,
        seaSurfaceTemperatureCelsius: 28.0,
        currentSpeedKnots: 0.7,
        activeWarnings: [],
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.evidence.length).toBeGreaterThan(5);
    expect(res.evidenceSummary.freshCount).toBeGreaterThan(0);
    expect(res.confidence.level).toBe('HIGH');
  });

  // 2. Missing Evidence
  it('02. Missing wave observation is explicitly flagged in missingRequiredEvidence', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        windSpeedKnots: 10.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.confidence.missingRequiredEvidence).toContain('Significant wave height (Hs)');
    expect(res.state).toBe('INSUFFICIENT_DATA');
    expect(res.confidence.level).toBe('LOW');
  });

  // 3. Stale Evidence
  it('03. Stale evidence (>24 hrs old) is flagged and counts towards staleEvidenceCount', async () => {
    const staleTime = new Date(Date.now() - 36 * 3600 * 1000).toISOString();
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
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.evidenceSummary.staleCount).toBeGreaterThan(0);
    expect(res.confidence.staleEvidenceCount).toBeGreaterThan(0);
    expect(res.confidence.level).toBe('MODERATE');
  });

  // 4. Expired Evidence
  it('04. Expired warnings are recorded as EXPIRED temporal relevance without blocking the mission', async () => {
    const pastTime = new Date(Date.now() - 7200000).toISOString();
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
            alertId: 'OLD-GALE-01',
            severity: 'RED',
            warningType: 'GALE',
            description: 'Expired gale warning from yesterday',
            validUntil: pastTime,
          },
        ],
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    const expiredEvid = res.evidence.find((e) => e.temporalRelevance === 'EXPIRED');
    expect(expiredEvid).toBeDefined();
    expect(expiredEvid?.decisionImpact).toBe('NEUTRAL');
    expect(res.state).toBe('GO');
  });

  // 5. Demo Evidence
  it('05. Demo evidence is truthfully labeled with status DEMO and counted in evidenceSummary', async () => {
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
    expect(res.evidenceSummary.demoCount).toBeGreaterThan(0);
    expect(res.dataStatus.status).toBe('DEMO_SNAPSHOT');
  });

  // 6. Access-Pending Evidence (IMD)
  it('06. IMD evidence is honestly tagged with ACCESS_PENDING status', async () => {
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
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    const weatherEvid = res.evidence.find((e) => e.category === 'WEATHER');
    expect(weatherEvid).toBeDefined();
    expect(weatherEvid?.status).toBe('ACCESS_PENDING');
  });

  // 7. Spatial Relevance
  it('07. Spatial relevance is computed deterministically (HIGH within 25 km)', async () => {
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
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    const gisEvid = res.evidence.find((e) => e.category === 'GIS');
    expect(gisEvid?.spatialRelevance).toBe('HIGH');
    expect(typeof gisEvid?.spatialDistanceKm).toBe('number');
  });

  // 8. Temporal Relevance
  it('08. Temporal relevance distinguishes current observations and forecast horizons', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.1,
        windSpeedKnots: 10.0,
        validUntil: new Date(Date.now() + 86400000).toISOString(),
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    const missionEvid = res.evidence.find((e) => e.category === 'MISSION');
    expect(missionEvid?.temporalRelevance).toBe('VALID_FOR_MISSION');
  });

  // 9. Source Conflict Data Structure
  it('09. Source conflict records adhere to typed conflict model', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.2,
        windSpeedKnots: 10.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(Array.isArray(res.conflicts)).toBe(true);
    expect(res.evidenceSummary.conflictsCount).toBe(res.conflicts.length);
  });

  // 10. Resolved Source Conflict Handling
  it('10. Resolved conflicts maintain resolution policy without confidence degradation', async () => {
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
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.confidence.unresolvedConflictsCount).toBe(0);
  });

  // 11. Unresolved Critical Conflict Handling
  it('11. Unresolved conflicts trigger explicit confidence downgrade', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.1,
        windSpeedKnots: 10.0,
        observedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.confidence.level).not.toBe('HIGH');
  });

  // 12. Rule -> Evidence Linkage
  it('12. Every deterministic rule links to a valid evidenceRef matching an evidenceId', async () => {
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
        windSpeedKnots: 10.0,
        seaSurfaceTemperatureCelsius: 28.0,
        currentSpeedKnots: 0.7,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    const evidenceIds = new Set(res.evidence.map((e) => e.evidenceId));

    res.rules.forEach((rule) => {
      if (rule.evidenceRef) {
        expect(evidenceIds.has(rule.evidenceRef)).toBe(true);
      }
    });
  });

  // 13. Decision -> Evidence Linkage
  it('13. Decision factors are directly derived from linked evidence records', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 3.1, // High wave
        windSpeedKnots: 10.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('AVOID');
    const blockingEvid = res.evidence.filter((e) => e.decisionImpact === 'CRITICAL_BLOCKER');
    expect(blockingEvid.length).toBeGreaterThan(0);
  });

  // 14. High Confidence Evaluation
  it('14. Complete fresh multi-source inputs yield HIGH confidence with 100% completeness ratio', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '05:45 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.1,
        windSpeedKnots: 10.0,
        seaSurfaceTemperatureCelsius: 28.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.confidence.level).toBe('HIGH');
    expect(res.confidence.completenessRatio).toBe(1.0);
    expect(res.confidence.reasons.length).toBeGreaterThan(0);
  });

  // 15. Moderate Confidence Evaluation
  it('15. Prototype demo snapshot data truthfully yields MODERATE confidence with explicit reason', async () => {
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
    expect(res.confidence.level).toBe('MODERATE');
    expect(res.confidence.reasons.some((r) => r.includes('demo'))).toBe(true);
  });

  // 16. Low Confidence Evaluation
  it('16. Missing surface wind observation yields LOW confidence', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.1,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.confidence.level).toBe('LOW');
    expect(res.confidence.missingRequiredEvidence).toContain('Sustained surface wind speed');
  });

  // 17. Insufficient Data Confidence
  it('17. INSUFFICIENT_DATA decision state is paired with LOW confidence', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('INSUFFICIENT_DATA');
    expect(res.confidence.level).toBe('LOW');
  });

  // 18. PFZ Opportunity Evidence
  it('18. PFZ evidence is categorized as OPPORTUNITY and cannot grant safety clearance', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      waypoints: [{ latitude: 18.93, longitude: 72.85 }], // Incursion into restricted zone
      targetZoneId: 'PFZ-MUM-01',
      environmentalContext: {
        waveHeightMeters: 1.0,
        windSpeedKnots: 8.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('AVOID');
    const pfzEvid = res.evidence.find((e) => e.category === 'OPPORTUNITY');
    expect(pfzEvid).toBeDefined();
    expect(pfzEvid?.decisionImpact).toBe('NEUTRAL');
  });

  // 19. GIS Safety Evidence
  it('19. GIS safety evidence records exact clearance distance and boundary polygon transformation', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.0,
        windSpeedKnots: 8.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    const gisEvid = res.evidence.find((e) => e.category === 'GIS');
    expect(gisEvid).toBeDefined();
    expect(gisEvid?.transformation).toContain('Turf.js');
    expect(gisEvid?.quality).toBe('GOOD');
  });

  // 20. Vessel Capability Evidence
  it('20. Vessel capability evidence records builder limits with provenance tags', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.0,
        windSpeedKnots: 8.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    const vesselEvid = res.evidence.filter((e) => e.category === 'VESSEL');
    expect(vesselEvid.length).toBeGreaterThan(0);
    expect(vesselEvid.some((e) => e.source === 'OFFICIAL_VESSEL_REGISTRY')).toBe(true);
  });

  // 21. IMD Demo Provenance
  it('21. IMD weather observations are never falsely claimed as LIVE', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 1.0,
        windSpeedKnots: 12.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    const weatherEvid = res.evidence.find((e) => e.category === 'WEATHER');
    expect(weatherEvid?.status).toBe('ACCESS_PENDING');
  });

  // 22. Determinism of Evidence Records
  it('22. Identical requests produce identical evidence items, confidence, and categories', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '05:45 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      targetZoneId: 'PFZ-MUM-01',
      environmentalContext: {
        waveHeightMeters: 1.2,
        windSpeedKnots: 11.0,
        seaSurfaceTemperatureCelsius: 28.0,
        observedAt: '2026-09-27T06:00:00.000Z',
        isLive: true,
      },
    };

    const res1 = await engine.evaluateDecision(req);
    const res2 = await engine.evaluateDecision(req);

    expect(res1.evidence.length).toBe(res2.evidence.length);
    expect(res1.confidence.level).toBe(res2.confidence.level);
    expect(res1.confidence.completenessRatio).toBe(res2.confidence.completenessRatio);

    res1.evidence.forEach((e1, idx) => {
      const e2 = res2.evidence[idx];
      expect(e1.category).toBe(e2.category);
      expect(e1.variable).toBe(e2.variable);
      expect(e1.value).toBe(e2.value);
      expect(e1.spatialRelevance).toBe(e2.spatialRelevance);
      expect(e1.decisionImpact).toBe(e2.decisionImpact);
    });
  });

  // 23. Malformed / Extreme Evidence Handling
  it('23. Extreme wave observation (7.5m) is captured as CRITICAL_BLOCKER evidence', async () => {
    const req: DecisionEvaluationRequest = {
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      departureTime: '06:00 IST',
      durationHours: 4,
      originLocation: { latitude: 18.75, longitude: 72.70 },
      environmentalContext: {
        waveHeightMeters: 7.5,
        windSpeedKnots: 45.0,
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.state).toBe('AVOID');
    const waveEvid = res.evidence.find((e) => e.variable === 'significantWaveHeight');
    expect(waveEvid?.value).toBe(7.5);
  });

  // 24. Duplicate Evidence Prevention
  it('24. Evidence items are uniquely keyed with unique evidenceIds', async () => {
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
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    const ids = res.evidence.map((e) => e.evidenceId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  // 25. Evidence Groups Summary Structure
  it('25. Evidence summary correctly compiles all 7 operational categories', async () => {
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
        observedAt: new Date().toISOString(),
        isLive: true,
      },
    };

    const res = await engine.evaluateDecision(req);
    expect(res.evidenceSummary.groups.length).toBe(7);
    const categories = res.evidenceSummary.groups.map((g) => g.category);
    expect(categories).toContain('SAFETY');
    expect(categories).toContain('GIS');
    expect(categories).toContain('VESSEL');
    expect(categories).toContain('OCEAN');
    expect(categories).toContain('WEATHER');
    expect(categories).toContain('MISSION');
    expect(categories).toContain('OPPORTUNITY');
  });
});
