import { describe, it, expect, beforeEach } from 'vitest';
import { VesselCapabilityService } from '../services/vesselCapabilityService.js';
import { buildApp } from '../app.js';
import type { FastifyInstance } from 'fastify';

describe('ORCA Phase 12 — Vessel Capability Model Tests', () => {
  let capabilityService: VesselCapabilityService;
  let app: FastifyInstance;

  beforeEach(async () => {
    capabilityService = VesselCapabilityService.getInstance();
    app = await buildApp();
  });

  // --------------------------------------------------------------------------
  // 1. Vessel Profile Retrieval & Schema Integrity
  // --------------------------------------------------------------------------
  describe('1. Vessel Capability Schema & Retrieval', () => {
    it('should retrieve a valid vessel capability profile with explicit provenance metadata', async () => {
      const profile = await capabilityService.getCapability('VESSEL-001');
      expect(profile).toBeDefined();
      expect(profile?.vesselId).toBe('VESSEL-001');
      expect(profile?.name).toBe('Matsya Sagar 1');
      expect(profile?.operatingRangeNm).toBeGreaterThan(0);
      expect(profile?.enduranceHours).toBeGreaterThan(0);
      expect(profile?.maxWaveToleranceMeters).toBeGreaterThan(0);
      expect(profile?.maxWindToleranceKnots).toBeGreaterThan(0);
      expect(profile?.safetyEquipment).toBeInstanceOf(Array);
      expect(profile?.provenance).toBeDefined();
      expect(profile?.provenance.wave?.status).toBe('PROTOTYPE_ASSUMPTION');
      expect(profile?.provenance.crew?.status).toBe('OFFICIAL_SOURCED');
    });

    it('should return null for non-existent vessel ID', async () => {
      const profile = await capabilityService.getCapability('NON_EXISTENT_VESSEL_9999');
      expect(profile).toBeNull();
    });

    it('should update capability fields and threshold provenance cleanly', async () => {
      const updated = await capabilityService.updateCapability('VESSEL-001', {
        operatingRangeNm: 35.0,
        provenance: {
          wave: {
            status: 'PROTOTYPE_ASSUMPTION',
            source: 'Updated Prototype Heuristic Test',
          },
          wind: {
            status: 'PROTOTYPE_ASSUMPTION',
            source: 'Updated Wind Rule',
          },
          range: {
            status: 'VESSEL_SPECIFIC',
            source: 'Calibrated Tank & Engine Test',
          },
          endurance: {
            status: 'VESSEL_SPECIFIC',
            source: 'Trial Run Data',
          },
        },
      });

      expect(updated.operatingRangeNm).toBe(35.0);
      expect(updated.provenance.range.source).toBe('Calibrated Tank & Engine Test');
    });
  });

  // --------------------------------------------------------------------------
  // 2. Deterministic Physical & Operational Constraint Evaluations
  // --------------------------------------------------------------------------
  describe('2. Deterministic Capability Evaluations', () => {
    it('evaluates operating range: PASS when distance is well within limit', async () => {
      const res = await capabilityService.evaluateCapability({
        vesselId: 'VESSEL-001',
        missionDistanceNm: 10.0, // Limit is 35.0 (or 25.0)
      });

      const rangeEval = res.evaluations.find((e) => e.category === 'RANGE');
      expect(rangeEval).toBeDefined();
      expect(rangeEval?.status).toBe('PASS');
      expect(rangeEval?.severity).toBe('INFO');
    });

    it('evaluates operating range: FAIL when distance exceeds vessel limit', async () => {
      const res = await capabilityService.evaluateCapability({
        vesselId: 'VESSEL-001',
        missionDistanceNm: 60.0, // Exceeds limit
      });

      const rangeEval = res.evaluations.find((e) => e.category === 'RANGE');
      expect(rangeEval).toBeDefined();
      expect(rangeEval?.status).toBe('FAIL');
      expect(rangeEval?.severity).toBe('CRITICAL');
      expect(res.hasCriticalFailure).toBe(true);
      expect(res.allPassed).toBe(false);
    });

    it('evaluates endurance: PASS when duration is within endurance limit', async () => {
      const res = await capabilityService.evaluateCapability({
        vesselId: 'VESSEL-001',
        missionDurationHours: 4.0, // Limit is 10.0 hrs
      });

      const enduranceEval = res.evaluations.find((e) => e.category === 'ENDURANCE');
      expect(enduranceEval).toBeDefined();
      expect(enduranceEval?.status).toBe('PASS');
    });

    it('evaluates endurance: FAIL when duration exceeds endurance limit', async () => {
      const res = await capabilityService.evaluateCapability({
        vesselId: 'VESSEL-001',
        missionDurationHours: 15.0, // Exceeds 10.0 hrs
      });

      const enduranceEval = res.evaluations.find((e) => e.category === 'ENDURANCE');
      expect(enduranceEval).toBeDefined();
      expect(enduranceEval?.status).toBe('FAIL');
      expect(res.hasCriticalFailure).toBe(true);
    });

    it('evaluates wave tolerance: PASS when sea state wave height is within limit', async () => {
      const res = await capabilityService.evaluateCapability({
        vesselId: 'VESSEL-001',
        environmentalContext: {
          waveHeightMeters: 1.0, // Limit is 1.8m
        },
      });

      const waveEval = res.evaluations.find((e) => e.category === 'WAVE');
      expect(waveEval).toBeDefined();
      expect(waveEval?.status).toBe('PASS');
    });

    it('evaluates wave tolerance: FAIL when wave height exceeds vessel seaworthiness limit', async () => {
      const res = await capabilityService.evaluateCapability({
        vesselId: 'VESSEL-001',
        environmentalContext: {
          waveHeightMeters: 2.5, // Exceeds 1.8m
        },
      });

      const waveEval = res.evaluations.find((e) => e.category === 'WAVE');
      expect(waveEval).toBeDefined();
      expect(waveEval?.status).toBe('FAIL');
      expect(waveEval?.severity).toBe('CRITICAL');
    });

    it('evaluates wind tolerance: PASS when wind speed is within limit', async () => {
      const res = await capabilityService.evaluateCapability({
        vesselId: 'VESSEL-001',
        environmentalContext: {
          windSpeedKnots: 12.0, // Limit is 18.0 kts
        },
      });

      const windEval = res.evaluations.find((e) => e.category === 'WIND');
      expect(windEval).toBeDefined();
      expect(windEval?.status).toBe('PASS');
    });

    it('evaluates wind tolerance: FAIL when wind speed exceeds limit', async () => {
      const res = await capabilityService.evaluateCapability({
        vesselId: 'VESSEL-001',
        environmentalContext: {
          windSpeedKnots: 24.0, // Exceeds 18.0 kts
        },
      });

      const windEval = res.evaluations.find((e) => e.category === 'WIND');
      expect(windEval).toBeDefined();
      expect(windEval?.status).toBe('FAIL');
    });

    it('evaluates crew constraint: FAIL if below minimum or above maximum manning limit', async () => {
      // Under minimum
      const underCrew = await capabilityService.evaluateCapability({
        vesselId: 'VESSEL-001',
        plannedCrewCount: 1, // Min is 2
      });
      const crewEvalUnder = underCrew.evaluations.find((e) => e.category === 'CREW');
      expect(crewEvalUnder?.status).toBe('FAIL');

      // Over maximum
      const overCrew = await capabilityService.evaluateCapability({
        vesselId: 'VESSEL-001',
        plannedCrewCount: 8, // Max is 4
      });
      const crewEvalOver = overCrew.evaluations.find((e) => e.category === 'CREW');
      expect(crewEvalOver?.status).toBe('FAIL');

      // Valid crew
      const validCrew = await capabilityService.evaluateCapability({
        vesselId: 'VESSEL-001',
        plannedCrewCount: 3, // Valid (2-4)
      });
      const crewEvalValid = validCrew.evaluations.find((e) => e.category === 'CREW');
      expect(crewEvalValid?.status).toBe('PASS');
    });

    it('evaluates safety equipment constraint: FAIL if mandatory item missing', async () => {
      const missingEq = await capabilityService.evaluateCapability({
        vesselId: 'VESSEL-001',
        requiredEquipment: ['VHF_RADIO', 'LIFE_JACKETS', 'EPIRB_BEACON_406MHZ'], // EPIRB missing on VESSEL-001
      });

      const eqEval = missingEq.evaluations.find((e) => e.category === 'SAFETY_EQUIPMENT');
      expect(eqEval?.status).toBe('FAIL');
      expect(eqEval?.reason).toContain('Missing mandatory safety equipment');
    });

    it('returns UNKNOWN status when environmental observations are unsupplied', async () => {
      const unsupplied = await capabilityService.evaluateCapability({
        vesselId: 'VESSEL-001',
        environmentalContext: {}, // No wave or wind provided
      });

      const waveEval = unsupplied.evaluations.find((e) => e.category === 'WAVE');
      const windEval = unsupplied.evaluations.find((e) => e.category === 'WIND');
      expect(waveEval?.status).toBe('UNKNOWN');
      expect(windEval?.status).toBe('UNKNOWN');
      expect(unsupplied.summary.unknownCount).toBeGreaterThanOrEqual(2);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Threshold Provenance & Differential Evaluation Across Vessels
  // --------------------------------------------------------------------------
  describe('3. Provenance Transparency & Differential Seaworthiness', () => {
    it('accurately counts threshold provenance breakdown (statutory vs assumption vs vessel-specific)', async () => {
      const res = await capabilityService.evaluateCapability({
        vesselId: 'VESSEL-001',
        missionDistanceNm: 15.0,
        missionDurationHours: 6.0,
        environmentalContext: {
          waveHeightMeters: 1.2,
          windSpeedKnots: 14.0,
        },
        plannedCrewCount: 3,
      });

      expect(res.provenance.thresholdBreakdown.prototypeAssumption).toBeGreaterThanOrEqual(2);
      expect(res.provenance.thresholdBreakdown.officialSourced).toBeGreaterThanOrEqual(1);
      expect(res.provenance.thresholdBreakdown.vesselSpecific).toBeGreaterThanOrEqual(2);
    });

    it('produces identical deterministic outputs for identical inputs', async () => {
      const req = {
        vesselId: 'VESSEL-001',
        missionDistanceNm: 12.0,
        missionDurationHours: 5.0,
        environmentalContext: { waveHeightMeters: 1.4, windSpeedKnots: 15.0 },
      };

      const res1 = await capabilityService.evaluateCapability(req);
      const res2 = await capabilityService.evaluateCapability(req);

      expect(res1.allPassed).toBe(res2.allPassed);
      expect(res1.evaluations.length).toBe(res2.evaluations.length);
      expect(res1.summary).toEqual(res2.summary);
    });

    it('produces DIFFERENT constraint evaluations for DIFFERENT vessels in the EXACT SAME marine environment', async () => {
      const identicalEnvironment = {
        missionDistanceNm: 30.0,
        missionDurationHours: 12.0,
        environmentalContext: {
          waveHeightMeters: 2.2,
          windSpeedKnots: 22.0,
        },
      };

      // 1. Traditional Canoe (VESSEL-TRAD-01) in rough swell
      const canoeRes = await capabilityService.evaluateCapability({
        vesselId: 'VESSEL-TRAD-01',
        ...identicalEnvironment,
      });

      // 2. Mechanized Trawler (VESSEL-MECH-01) in the same swell
      const trawlerRes = await capabilityService.evaluateCapability({
        vesselId: 'VESSEL-MECH-01',
        ...identicalEnvironment,
      });

      // Canoe should FAIL wave (limit 0.9m) and wind (limit 12.0 kts) and range
      expect(canoeRes.hasCriticalFailure).toBe(true);
      const canoeWave = canoeRes.evaluations.find((e) => e.category === 'WAVE');
      expect(canoeWave?.status).toBe('FAIL');

      // Trawler should PASS wave (limit 2.8m) and wind (limit 28.0 kts) and range (limit 80 NM)
      expect(trawlerRes.hasCriticalFailure).toBe(false);
      const trawlerWave = trawlerRes.evaluations.find((e) => e.category === 'WAVE');
      expect(trawlerWave?.status).toBe('PASS');
    });
  });

  // --------------------------------------------------------------------------
  // 4. HTTP API Endpoints & Validation
  // --------------------------------------------------------------------------
  describe('4. Fastify Vessel HTTP API Endpoints', () => {
    it('GET /api/v1/vessels/:id/capability returns vessel profile and 200 OK', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/vessels/VESSEL-001/capability',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.vesselId).toBe('VESSEL-001');
      expect(body.operatingRangeNm).toBeDefined();
      expect(body.provenance).toBeDefined();
    });

    it('GET /api/v1/vessels/:id/capability returns 404 for missing vessel', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/vessels/NON_EXISTENT_ID_999/capability',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error?.code).toBe('NOT_FOUND');
    });

    it('POST /api/v1/vessels/evaluate-capability executes evaluation and returns 200 OK', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/vessels/evaluate-capability',
        payload: {
          vesselId: 'VESSEL-001',
          missionDistanceNm: 15.0,
          missionDurationHours: 4.0,
          environmentalContext: {
            waveHeightMeters: 1.1,
            windSpeedKnots: 12.0,
          },
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.vesselId).toBe('VESSEL-001');
      expect(body.evaluations).toBeInstanceOf(Array);
      expect(body.provenance.engine).toBe('ORCA_DETERMINISTIC_CAPABILITY_V1');
    });

    it('POST /api/v1/vessels/evaluate-capability rejects malformed inputs with 400 Bad Request', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/vessels/evaluate-capability',
        payload: {
          missionDistanceNm: -50.0, // Invalid negative distance
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error?.code).toBe('VALIDATION_ERROR');
    });
  });
});
