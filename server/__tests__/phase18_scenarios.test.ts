import { describe, it, expect, beforeAll } from 'vitest';
import { ScenarioService } from '../services/scenarioService.js';
import { OrchestrationService } from '../services/orchestrationService.js';
import { buildApp } from '../app.js';
import type { FastifyInstance } from 'fastify';

describe('Phase 18 — What-If / Scenario Intelligence Suite', () => {
  let scenarioService: ScenarioService;
  let orchestrator: OrchestrationService;
  let app: FastifyInstance;

  beforeAll(async () => {
    scenarioService = ScenarioService.getInstance();
    orchestrator = OrchestrationService.getInstance();
    app = await buildApp();
    await app.ready();
  });

  // Test 1: Deterministic Repeatability
  it('1. Same scenario inputs produce identical deterministic output', async () => {
    const baseline = await orchestrator.orchestrateQuery({
      queryText: 'Can I go fishing tomorrow morning for 5 hours departing at 06:00?',
      regionId: 'maharashtra',
    });

    const res1 = await scenarioService.evaluateScenario({
      baselineQueryId: baseline.queryId,
      modifications: {
        departureTime: '14:00',
        durationHours: 5,
      },
    });

    const res2 = await scenarioService.evaluateScenario({
      baselineQueryId: baseline.queryId,
      modifications: {
        departureTime: '14:00',
        durationHours: 5,
      },
    });

    expect(res1.scenario.verdict).toBe(res2.scenario.verdict);
    expect(res1.scenario.primaryDriver).toBe(res2.scenario.primaryDriver);
    expect(res1.ruleComparison.newlyTriggeredRules.length).toBe(res2.ruleComparison.newlyTriggeredRules.length);
    expect(res1.delta.changedFields).toEqual(res2.delta.changedFields);
  });

  // Test 2: Departure Time Change
  it('2. Evaluates departure time change scenario (06:00 -> 14:00)', async () => {
    const baseline = await orchestrator.orchestrateQuery({
      queryText: 'Can I go fishing at 06:00 for 4 hours?',
      regionId: 'maharashtra',
    });

    const result = await scenarioService.evaluateScenario({
      baselineQueryId: baseline.queryId,
      naturalLanguageScenario: 'What if I leave at 2 PM instead?',
    });

    expect(result.scenarioType).toBe('TIME_CHANGE');
    expect(result.delta.changedFields).toContain('departureTime');
    expect(result.scenario.departureTime).toMatch(/14:00|2 PM/i);
    expect(result.ruleComparison).toBeDefined();
    expect(result.verdictChangeReason).toBeDefined();
  });

  // Test 3: Duration Change
  it('3. Evaluates trip duration change scenario (5h -> 3h)', async () => {
    const baseline = await orchestrator.orchestrateQuery({
      queryText: 'Can I go fishing at 06:00 for 5 hours?',
      regionId: 'maharashtra',
    });

    const result = await scenarioService.evaluateScenario({
      baselineQueryId: baseline.queryId,
      naturalLanguageScenario: 'What if the trip is only 3 hours?',
    });

    expect(result.scenarioType).toBe('DURATION_CHANGE');
    expect(result.delta.changedFields).toContain('durationHours');
    expect(result.scenario.durationHours).toBe(3);
    expect(result.scenario.verdict).toBeDefined();
  });

  // Test 4: Vessel Change
  it('4. Evaluates vessel change scenario (VESSEL-001 -> VESSEL-002)', async () => {
    const baseline = await orchestrator.orchestrateQuery({
      queryText: 'Can I go fishing at 06:00 for 5 hours with VESSEL-001?',
      regionId: 'maharashtra',
    });

    const result = await scenarioService.evaluateScenario({
      baselineQueryId: baseline.queryId,
      naturalLanguageScenario: 'What if I use VESSEL-002?',
    });

    expect(result.scenarioType).toBe('VESSEL_CHANGE');
    expect(result.delta.changedFields).toContain('vesselId');
    expect(result.scenario.vesselId).toBe('VESSEL-002');
  });

  // Test 5: Route Change (Avoid Restricted Zones)
  it('5. Evaluates route change avoiding restricted naval zone', async () => {
    const baseline = await orchestrator.orchestrateQuery({
      queryText: 'Can I transit near Mumbai Naval Anchorage at 06:00?',
      regionId: 'maharashtra',
    });

    const result = await scenarioService.evaluateScenario({
      baselineQueryId: baseline.queryId,
      naturalLanguageScenario: 'What if I avoid this restricted area?',
    });

    expect(result.scenarioType).toBe('ROUTE_CHANGE');
    expect(result.delta.changedFields).toContain('avoidRestrictedZones');
    expect(result.scenario.verdict).toBeDefined();
  });

  // Test 6: Combined Changes
  it('6. Evaluates combined departure time and vessel changes', async () => {
    const baseline = await orchestrator.orchestrateQuery({
      queryText: 'Can I fish at 06:00 for 5 hours with VESSEL-001?',
      regionId: 'maharashtra',
    });

    const result = await scenarioService.evaluateScenario({
      baselineQueryId: baseline.queryId,
      naturalLanguageScenario: 'What if I leave at 2 PM and use VESSEL-002?',
    });

    expect(result.scenarioType).toBe('COMBINED_CHANGE');
    expect(result.delta.changedFields).toContain('departureTime');
    expect(result.delta.changedFields).toContain('vesselId');
  });

  // Test 7: Scenario Transition GO -> CAUTION
  it('7. Correctly captures transition from GO to CAUTION when departing into afternoon window', async () => {
    const baseline = await orchestrator.orchestrateQuery({
      queryText: 'Can I go fishing today near Nagapattinam in Samudra Sevak for 4 hours departing at 06:00?',
      regionId: 'tamil_nadu',
    });

    const result = await scenarioService.evaluateScenario({
      baselineQueryId: baseline.queryId,
      regionId: 'tamil_nadu',
      modifications: {
        departureTime: '14:00',
        durationHours: 4,
      },
    });

    expect(result.scenario.verdict).toMatch(/CAUTION|AVOID/);
    expect(result.ruleComparison.newlyTriggeredRules.length).toBeGreaterThanOrEqual(1);
    expect(result.verdictChangeReason).toMatch(/operating window|limits|CAUTION/);
  });

  // Test 8: Scenario Transition GO -> AVOID
  it('8. Correctly captures transition from GO to AVOID on night departure with sunset violation', async () => {
    const baseline = await orchestrator.orchestrateQuery({
      queryText: 'Can I go fishing at 06:00 for 3 hours?',
      regionId: 'maharashtra',
    });

    const result = await scenarioService.evaluateScenario({
      baselineQueryId: baseline.queryId,
      modifications: {
        departureTime: '18:00',
        durationHours: 6,
      },
    });

    expect(result.scenario.verdict).toBe('AVOID');
    expect(result.ruleComparison.newlyTriggeredRules.some(r => r.ruleId.includes('NIGHT') || r.ruleId.includes('SUNSET') || r.ruleId.includes('TEMPORAL'))).toBe(true);
  });

  // Test 9: Safety Invariant — High PFZ Opportunity Cannot Override Safety AVOID
  it('9. Safety Invariant: High PFZ cannot override deterministic AVOID verdict', async () => {
    const baseline = await orchestrator.orchestrateQuery({
      queryText: 'Can I go fishing at 06:00 for 5 hours?',
      regionId: 'maharashtra',
    });

    const result = await scenarioService.evaluateScenario({
      baselineQueryId: baseline.queryId,
      modifications: {
        departureTime: '18:00',
        durationHours: 8,
        assumptions: {
          waveHeightMeters: 3.5, // Dangerous waves
        },
      },
    });

    expect(result.scenario.verdict).toBe('AVOID');
    // Even if PFZ has opportunity, safety AVOID must stand
    expect(result.scenario.verdict).not.toBe('GO');
  });

  // Test 10: Missing Data / Edge Cases
  it('10. Handles missing baseline query gracefully with default fallback baseline', async () => {
    const result = await scenarioService.evaluateScenario({
      naturalLanguageScenario: 'What if I leave at 2 PM?',
      regionId: 'maharashtra',
    });

    expect(result.scenarioId).toBeDefined();
    expect(result.scenario.departureTime).toMatch(/14:00|2 PM/i);
    expect(result.scenario.verdict).toBeDefined();
  });

  // Test 11: Hypothetical Wave Assumption Isolation
  it('11. Hypothetical wave assumption is isolated and explicitly flagged', async () => {
    const baseline = await orchestrator.orchestrateQuery({
      queryText: 'Can I go fishing at 06:00 for 5 hours?',
      regionId: 'maharashtra',
    });

    const result = await scenarioService.evaluateScenario({
      baselineQueryId: baseline.queryId,
      naturalLanguageScenario: 'What if wave height increases to 2.5 metres?',
    });

    expect(result.isHypotheticalAssumption).toBe(true);
    expect(result.scenarioType).toBe('ENVIRONMENTAL_ASSUMPTION');
    expect(result.delta.changedFields).toContain('assumptions.waveHeightMeters');
    
    // Check evidence item notes
    const waveEv = result.evidence.find(e => e.variable.toLowerCase().includes('wave') || e.category === 'OCEAN');
    expect(waveEv).toBeDefined();
    expect(waveEv?.notes).toContain('HYPOTHETICAL');
  });

  // Test 12: Invalid Scenario Input Validation
  it('12. API rejects invalid scenario payloads with 400 validation error', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/scenarios/evaluate',
      payload: {}, // missing both naturalLanguageScenario and modifications
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  // Test 13: Ambiguous Natural-Language Handling
  it('13. Handles ambiguous queries by falling back to baseline parameters cleanly', async () => {
    const baseline = await orchestrator.orchestrateQuery({
      queryText: 'Can I go fishing at 06:00 for 5 hours?',
      regionId: 'maharashtra',
    });

    const result = await scenarioService.evaluateScenario({
      baselineQueryId: baseline.queryId,
      naturalLanguageScenario: 'What if something changes tomorrow?',
    });

    expect(result.scenarioId).toBeDefined();
    expect(result.scenario.verdict).toBeDefined();
  });

  // Test 14: Evidence Delta Tracking
  it('14. Tracks evidence differences between baseline and scenario', async () => {
    const baseline = await orchestrator.orchestrateQuery({
      queryText: 'Can I go fishing at 06:00 for 5 hours?',
      regionId: 'maharashtra',
    });

    const result = await scenarioService.evaluateScenario({
      baselineQueryId: baseline.queryId,
      modifications: {
        departureTime: '14:00',
        durationHours: 3,
      },
    });

    expect(result.evidenceComparison.changedEvidence.length).toBeGreaterThanOrEqual(1);
    expect(result.evidence.length).toBeGreaterThanOrEqual(1);
  });

  // Test 15: Rule Delta Classification
  it('15. Categorizes rules into newly triggered, no longer triggered, and persisting', async () => {
    const baseline = await orchestrator.orchestrateQuery({
      queryText: 'Can I go fishing at 06:00 for 5 hours?',
      regionId: 'maharashtra',
    });

    const result = await scenarioService.evaluateScenario({
      baselineQueryId: baseline.queryId,
      modifications: {
        departureTime: '14:00',
      },
    });

    expect(result.ruleComparison.persistingRules).toBeInstanceOf(Array);
    expect(result.ruleComparison.newlyTriggeredRules).toBeInstanceOf(Array);
    expect(result.ruleComparison.noLongerTriggeredRules).toBeInstanceOf(Array);
  });

  // Test 16: Provenance Preservation
  it('16. Preserves specialist provenance in scenario evaluations', async () => {
    const baseline = await orchestrator.orchestrateQuery({
      queryText: 'Can I fish at 06:00 for 5 hours?',
      regionId: 'maharashtra',
    });

    const result = await scenarioService.evaluateScenario({
      baselineQueryId: baseline.queryId,
      modifications: {
        departureTime: '14:00',
      },
    });

    expect(result.evidence.every(e => e.source && e.dataset)).toBe(true);
    expect(result.scenario.confidence).toBeDefined();
  });

  // Test 17: IMD ACCESS_PENDING Preservation
  it('17. Preserves IMD ACCESS_PENDING status honestly in scenario evidence', async () => {
    const result = await scenarioService.evaluateScenario({
      naturalLanguageScenario: 'What if I leave at 2 PM?',
      regionId: 'maharashtra',
    });

    const imdEvidence = result.evidence.filter(e => e.source === 'IMD');
    if (imdEvidence.length > 0) {
      expect(imdEvidence.every(e => e.status === 'ACCESS_PENDING' || e.status === 'DEMO')).toBe(true);
    }
  });

  // Test 18: Multi-Turn Conversation Context Follow-Up
  it('18. Multi-turn conversation context inherits baseline across turns', async () => {
    const turn1 = await orchestrator.orchestrateQuery({
      queryText: 'Can I go fishing tomorrow morning near Mumbai for 5 hours?',
      regionId: 'maharashtra',
    });

    const turn2Scenario = await scenarioService.evaluateScenario({
      conversationId: turn1.conversationId,
      naturalLanguageScenario: 'What if I leave at 2 PM instead?',
    });

    expect(turn2Scenario.baseline.durationHours).toBe(5);
    expect(turn2Scenario.scenario.departureTime).toMatch(/14:00|2 PM/i);
  });

  // Test 19: Full HTTP Route Integration
  it('19. POST /api/v1/scenarios/evaluate responds with valid 200 payload', async () => {
    const baseline = await orchestrator.orchestrateQuery({
      queryText: 'Can I go fishing at 06:00 for 5 hours?',
      regionId: 'maharashtra',
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/scenarios/evaluate',
      payload: {
        baselineQueryId: baseline.queryId,
        naturalLanguageScenario: 'What if I leave at 2 PM?',
        operatorRole: 'FISHERMAN',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.scenarioId).toBeDefined();
    expect(body.baseline.verdict).toBeDefined();
    expect(body.scenario.verdict).toBeDefined();
    expect(body.ruleComparison).toBeDefined();
    expect(body.verdictChangeReason).toBeDefined();
  });

  // Test 20: Fallback LLM Provider Determinism
  it('20. Works reliably under deterministic fallback provider without external API keys', async () => {
    const result = await scenarioService.evaluateScenario({
      naturalLanguageScenario: 'What if I leave at 2 PM and duration is 3 hours?',
      regionId: 'maharashtra',
    });

    expect(result.intelligenceMode).toBeDefined();
    expect(result.scenario.durationHours).toBe(3);
    expect(result.scenario.departureTime).toMatch(/14:00|2 PM/i);
    expect(result.scenario.verdict).toBeDefined();
  });
});
