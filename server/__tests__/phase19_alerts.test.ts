import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { AlertService } from '../services/alertService.js';
import { buildApp } from '../app.js';
import type { FastifyInstance } from 'fastify';
// Phase 19 alert test imports

describe('Phase 19 — Alerts + Disaster Intelligence Test Suite', () => {
  let alertService: AlertService;
  let app: FastifyInstance;

  beforeAll(async () => {
    alertService = AlertService.getInstance();
    app = await buildApp();
    await app.ready();
  });

  beforeEach(() => {
    alertService.resetToSeed();
  });

  // Test 1: Alert created from verified hazard
  it('1. Alert created from verified hazard', async () => {
    const alerts = await alertService.evaluateAndGenerateAlerts({
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      environmentalContext: {
        waveHeightMeters: 2.0, // Exceeds VESSEL-001 tolerance (1.8m) by ~11% -> WARNING
        isLive: true,
      },
    });

    expect(alerts.length).toBeGreaterThan(0);
    const waveAlert = alerts.find((a) => a.alertType === 'HIGH_WAVE_CONDITION');
    expect(waveAlert).toBeDefined();
    expect(waveAlert?.severity).toBe('WARNING');
    expect(waveAlert?.title).toContain('High Wave Condition');
    expect(waveAlert?.affectedVesselIds).toContain('VESSEL-001');
    expect(waveAlert?.provenance.status).toBe('LIVE');
  });

  // Test 2: No alert from safe condition
  it('2. No alert from safe condition', async () => {
    const alerts = await alertService.evaluateAndGenerateAlerts({
      regionId: 'maharashtra',
      vesselId: 'VESSEL-001',
      environmentalContext: {
        waveHeightMeters: 1.1, // Well below 1.8m
        windSpeedKnots: 10.0, // Well below 18 kts
        isLive: true,
      },
    });

    expect(alerts.length).toBe(0);
  });

  // Test 3: Severity classification
  it('3. Severity classification', async () => {
    // Wave height greatly exceeding tolerance (> 25% excess: 1.8 * 1.25 = 2.25)
    const criticalAlerts = await alertService.evaluateAndGenerateAlerts({
      vesselId: 'VESSEL-001',
      environmentalContext: {
        waveHeightMeters: 2.8, // 55% excess -> CRITICAL
      },
    });
    const criticalWave = criticalAlerts.find((a) => a.alertType === 'HIGH_WAVE_CONDITION');
    expect(criticalWave?.severity).toBe('CRITICAL');

    // Moderate excess (1.9m) -> WARNING
    alertService.resetToSeed();
    const warningAlerts = await alertService.evaluateAndGenerateAlerts({
      vesselId: 'VESSEL-001',
      environmentalContext: {
        waveHeightMeters: 1.9, // < 25% excess -> WARNING
      },
    });
    const warningWave = warningAlerts.find((a) => a.alertType === 'HIGH_WAVE_CONDITION');
    expect(warningWave?.severity).toBe('WARNING');
  });

  // Test 4: Alert fingerprint/deduplication
  it('4. Alert fingerprint/deduplication', async () => {
    const fp1 = alertService.generateFingerprint('INCOIS_OSF', 'HIGH_WAVE_CONDITION', 'Mumbai Sector', 'RULE_03', '2026-09-28T12:00:00Z');
    const fp2 = alertService.generateFingerprint('INCOIS_OSF', 'HIGH_WAVE_CONDITION', 'Mumbai Sector', 'RULE_03', '2026-09-28T12:00:00Z');
    expect(fp1).toBe(fp2);

    // Initial evaluation
    const alerts1 = await alertService.evaluateAndGenerateAlerts({
      vesselId: 'VESSEL-001',
      environmentalContext: { waveHeightMeters: 2.2 },
    });
    const countAfterFirst = (await alertService.getAlerts()).length;

    // Second evaluation with identical condition
    const alerts2 = await alertService.evaluateAndGenerateAlerts({
      vesselId: 'VESSEL-001',
      environmentalContext: { waveHeightMeters: 2.2 },
    });
    const countAfterSecond = (await alertService.getAlerts()).length;

    // Deduplication should prevent duplicate insertion
    expect(countAfterSecond).toBe(countAfterFirst);
    expect(alerts1[0].fingerprint).toBe(alerts2[0].fingerprint);
  });

  // Test 5: Alert refresh
  it('5. Alert refresh', async () => {
    const initialAlerts = await alertService.evaluateAndGenerateAlerts({
      vesselId: 'VESSEL-001',
      environmentalContext: {
        waveHeightMeters: 2.2,
        validUntil: '2026-09-28T12:00:00Z',
      },
    });
    const originalCreated = initialAlerts[0].createdAt;

    // Simulate time elapsed and re-evaluate with extended validUntil
    const refreshedAlerts = await alertService.evaluateAndGenerateAlerts({
      vesselId: 'VESSEL-001',
      environmentalContext: {
        waveHeightMeters: 2.2,
        validUntil: '2026-09-28T18:00:00Z',
      },
    });

    expect(refreshedAlerts[0].id).toBe(initialAlerts[0].id);
    expect(refreshedAlerts[0].validUntil).toBe('2026-09-28T18:00:00Z');
    expect(refreshedAlerts[0].createdAt).toBe(originalCreated);
  });

  // Test 6: Alert expiry
  it('6. Alert expiry', async () => {
    alertService.markExpired('ALT-2026-001');

    const activeAlerts = await alertService.getAlerts({ status: 'ACTIVE' });
    const expiredAlert = activeAlerts.find((a) => a.id === 'ALT-2026-001');
    expect(expiredAlert).toBeUndefined();

    const allAlerts = await alertService.getAlerts({ status: 'ALL' });
    const foundExpired = allAlerts.find((a) => a.id === 'ALT-2026-001');
    expect(foundExpired?.status).toBe('EXPIRED');
  });

  // Test 7: Acknowledge
  it('7. Acknowledge alert workflow transition', async () => {
    const acknowledged = await alertService.acknowledgeAlert('ALT-2026-001', {
      id: 'OFFICER-MH-42',
      role: 'COASTAL_AUTHORITY',
      note: 'Coastal radar patrol dispatched to monitor corridor.',
    });

    expect(acknowledged.status).toBe('ACKNOWLEDGED');
    expect(acknowledged.acknowledgement?.acknowledgedBy).toBe('OFFICER-MH-42');
    expect(acknowledged.acknowledgement?.role).toBe('COASTAL_AUTHORITY');
    expect(acknowledged.acknowledgement?.note).toContain('Coastal radar patrol');
    // Severity and evidence remain immutable
    expect(acknowledged.severity).toBe('WARNING');
    expect(acknowledged.ruleIds).toContain('RULE_03_VESSEL_WAVE_LIMIT');
  });

  // Test 8: Resolve
  it('8. Resolve alert workflow transition', async () => {
    const resolved = await alertService.resolveAlert('ALT-2026-001', {
      id: 'COMMAND-01',
      role: 'DISASTER_MANAGER',
      note: 'Significant wave swell subsided below 1.4m. Corridor verified clear.',
    });

    expect(resolved.status).toBe('RESOLVED');
    expect(resolved.resolution?.resolvedBy).toBe('COMMAND-01');
    expect(resolved.resolution?.note).toContain('subsided below 1.4m');
  });

  // Test 9: Evidence linkage
  it('9. Evidence linkage', async () => {
    const detail = await alertService.getAlertDetail('ALT-2026-001');
    expect(detail).not.toBeNull();
    expect(detail!.evidence.length).toBeGreaterThan(0);
    const ev = detail!.evidence[0];
    expect(ev.evidenceId).toBe('EVID-OSF-WAVE-001');
    expect(ev.category).toBe('OCEAN');
    expect(ev.value).toBe(2.1);
    expect(ev.unit).toBe('m');
    expect(ev.source).toBe('INCOIS_OSF');
  });

  // Test 10: Rule linkage
  it('10. Rule linkage', async () => {
    const detail = await alertService.getAlertDetail('ALT-2026-001');
    expect(detail).not.toBeNull();
    expect(detail!.ruleEvaluations.length).toBeGreaterThan(0);
    const rule = detail!.ruleEvaluations[0];
    expect(rule.ruleId).toBe('RULE_03_VESSEL_WAVE_LIMIT');
    expect(rule.category).toBe('VESSEL_CAPABILITY');
    expect(rule.thresholdSource).toBe('DG_SHIPPING_CLASS_IV');
    expect(rule.result).toBe('CAUTION');
  });

  // Test 11: Mission linkage
  it('11. Mission linkage', async () => {
    const alerts = await alertService.getAlerts({ missionId: 'MISSION-DEMO-01' });
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts.every((a) => a.affectedMissionIds.includes('MISSION-DEMO-01') || a.affectedMissionIds.length === 0)).toBe(true);
  });

  // Test 12: Vessel linkage
  it('12. Vessel linkage', async () => {
    const alerts = await alertService.getAlerts({ vesselId: 'VESSEL-001' });
    expect(alerts.length).toBeGreaterThan(0);
    const vesselAlert = alerts.find((a) => a.affectedVesselIds.includes('VESSEL-001'));
    expect(vesselAlert).toBeDefined();
  });

  // Test 13: GIS alert
  it('13. GIS alert from restricted zone proximity and incursion', async () => {
    // Route intersecting the Naval Anchorage boundary (around 72.85, 18.93)
    const alerts = await alertService.evaluateAndGenerateAlerts({
      vesselId: 'VESSEL-001',
      routeCoordinates: [
        [72.81, 18.90],
        [72.84, 18.93], // Directly inside Naval & Port Anchorage
        [72.86, 18.95],
      ],
    });

    const incursion = alerts.find((a) => a.category === 'GIS_SAFETY');
    expect(incursion).toBeDefined();
    expect(incursion?.severity).toBe('CRITICAL');
    expect(incursion?.title).toContain('Restricted Zone Incursion');
  });

  // Test 14: Vessel capability alert
  it('14. Vessel capability alert', async () => {
    // Traditional canoe (VESSEL-TRAD-01) with maxWaveTolerance 0.9m
    const alerts = await alertService.evaluateAndGenerateAlerts({
      vesselId: 'VESSEL-TRAD-01',
      environmentalContext: {
        waveHeightMeters: 1.5, // Exceeds 0.9m
      },
    });

    const capAlert = alerts.find((a) => a.alertType === 'HIGH_WAVE_CONDITION');
    expect(capAlert).toBeDefined();
    expect(capAlert?.affectedVesselIds).toContain('VESSEL-TRAD-01');
    expect(capAlert?.whyExplanation).toContain('exceeds registered physical seaworthiness');
  });

  // Test 15: Stale-data alert
  it('15. Stale-data alert integrity check', async () => {
    const detail = await alertService.getAlertDetail('ALT-2026-004');
    expect(detail).not.toBeNull();
    expect(detail!.alert.alertType).toBe('STALE_CRITICAL_DATA');
    expect(detail!.alert.provenance.status).toBe('ACCESS_PENDING');
    expect(detail!.alert.category).toBe('MISSION');
  });

  // Test 16: Connectivity alert
  it('16. Connectivity offline state alert', async () => {
    const alerts = await alertService.evaluateAndGenerateAlerts({
      vesselId: 'VESSEL-001',
      connectivityEvent: {
        state: 'OFFLINE',
        bearer: 'NONE',
        message: 'Cellular and satellite signal attenuated. Offline cache activated.',
      },
    });

    const connAlert = alerts.find((a) => a.category === 'CONNECTIVITY');
    expect(connAlert).toBeDefined();
    expect(connAlert?.alertType).toBe('OFFLINE_STATE');
    expect(connAlert?.severity).toBe('WARNING');
    expect(connAlert?.actionRecommendation).toContain('NAVIC safety receiver');
  });

  // Test 17: IMD ACCESS_PENDING remains honest
  it('17. IMD ACCESS_PENDING remains honest', async () => {
    const alerts = await alertService.getAlerts();
    const imdAlerts = alerts.filter((a) => a.source.includes('IMD'));
    expect(imdAlerts.length).toBeGreaterThan(0);
    // Every IMD alert must declare DEMO or ACCESS_PENDING
    for (const alt of imdAlerts) {
      expect(['DEMO', 'ACCESS_PENDING']).toContain(alt.provenance.status);
      expect(alt.provenance.isLive).toBe(false);
    }
  });

  // Test 18: PFZ opportunity does not become a safety alert
  it('18. PFZ opportunity does not become a safety alert', async () => {
    const alerts = await alertService.getAlerts();
    // Safety alerts must never contain ecological opportunity signals
    const pfzAlerts = alerts.filter((a) => (a.alertType as string) === 'PFZ_OPPORTUNITY');
    expect(pfzAlerts.length).toBe(0);
  });

  // Test 19: Unauthorized alert mutation rejected
  it('19. Unauthorized alert mutation rejected via HTTP API', async () => {
    // Attempt acknowledgement with unauthorized role
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/alerts/ALT-2026-001/acknowledge',
      payload: {
        operatorId: 'ROGUE-USER',
        role: 'UNAUTHORIZED',
        note: 'Attempting unauthorized status change',
      },
    });

    expect(response.statusCode).toBe(403);
    const body = JSON.parse(response.body);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  // Test 20: Deterministic repeatability
  it('20. Deterministic repeatability across identical evaluations', async () => {
    alertService.resetToSeed();
    const res1 = await alertService.evaluateAndGenerateAlerts({
      vesselId: 'VESSEL-001',
      environmentalContext: {
        waveHeightMeters: 2.4,
        windSpeedKnots: 22.0,
      },
    });

    alertService.resetToSeed();
    const res2 = await alertService.evaluateAndGenerateAlerts({
      vesselId: 'VESSEL-001',
      environmentalContext: {
        waveHeightMeters: 2.4,
        windSpeedKnots: 22.0,
      },
    });

    expect(res1.length).toBe(res2.length);
    for (let i = 0; i < res1.length; i++) {
      expect(res1[i].fingerprint).toBe(res2[i].fingerprint);
      expect(res1[i].alertType).toBe(res2[i].alertType);
      expect(res1[i].severity).toBe(res2[i].severity);
      expect(res1[i].ruleIds).toEqual(res2[i].ruleIds);
    }
  });
});
