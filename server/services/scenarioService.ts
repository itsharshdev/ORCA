import { OrchestrationService } from './orchestrationService.js';
import { DecisionEngineService } from './decisionEngineService.js';
import { GisSafetyService } from './gisSafetyService.js';
import { VesselCapabilityService } from './vesselCapabilityService.js';
import { LlmService } from '../llm/llmService.js';
import type {
  ScenarioEvaluationRequest,
  ScenarioEvaluationResponse,
  ScenarioType,
  ScenarioInputDelta,
  ScenarioRuleDeltaItem,
  ScenarioEvidenceComparison,
  AuditedEvidenceItem,
  DecisionEvaluationResponse,
} from '../../src/types/contract.js';

export class ScenarioService {
  private static instance: ScenarioService;

  private orchestrator: OrchestrationService;
  private decisionEngineService: DecisionEngineService;
  private gisSafetyService: GisSafetyService;
  private vesselCapabilityService: VesselCapabilityService;
  private llmService: LlmService;

  private constructor() {
    this.orchestrator = OrchestrationService.getInstance();
    this.decisionEngineService = DecisionEngineService.getInstance();
    this.gisSafetyService = GisSafetyService.getInstance();
    this.vesselCapabilityService = VesselCapabilityService.getInstance();
    this.llmService = LlmService.getInstance();
  }

  public static getInstance(): ScenarioService {
    if (!ScenarioService.instance) {
      ScenarioService.instance = new ScenarioService();
    }
    return ScenarioService.instance;
  }

  /**
   * Evaluates a What-If scenario against a baseline mission or query.
   */
  public async evaluateScenario(
    request: ScenarioEvaluationRequest
  ): Promise<ScenarioEvaluationResponse> {
    const evaluatedAt = new Date().toISOString();
    const scenarioId = `SCN-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 1. Establish Baseline Context
    const baselineRegion = request.regionId || request.modifications?.regionId || 'maharashtra';
    let baselineQueryText = 'Can I go fishing today near Mumbai for 5 hours?';
    if (baselineRegion === 'tamil_nadu' || (request.naturalLanguageScenario && request.naturalLanguageScenario.toLowerCase().includes('nagapattinam'))) {
      baselineQueryText = 'Can I go fishing today near Nagapattinam in Samudra Sevak for 4 hours departing at 06:00?';
    }

    // Run baseline through orchestrator if not provided
    const baselineResult = await this.orchestrator.orchestrateQuery({
      queryText: baselineQueryText,
      regionId: baselineRegion,
      operatorRole: request.operatorRole || 'FISHERMAN',
      conversationId: request.conversationId,
    });

    const baselineDecision = baselineResult.orchestrationResult.decision;
    const baselineIntent = baselineResult.llmIntent;
    const baselineDeparture = baselineIntent?.departureWindow.timeString || '06:00 IST';
    const baselineDuration = baselineIntent?.durationHours || 5;
    const baselineVessel = baselineIntent?.vessel.vesselId || 'VESSEL-001';
    const baselineRegionId = baselineIntent?.location.regionId || baselineRegion;

    // 2. Parse Natural Language Scenario or Structured Modifications
    let scenarioDeparture = baselineDeparture;
    let scenarioDuration = baselineDuration;
    let scenarioVessel = baselineVessel;
    let scenarioRegion = baselineRegionId;
    let scenarioAvoidRestricted = false;
    let isHypotheticalAssumption = false;
    let hypotheticalWave: number | undefined;
    let hypotheticalWind: number | undefined;

    // Extract natural language scenario changes if provided
    if (request.naturalLanguageScenario) {
      const nl = request.naturalLanguageScenario.toLowerCase();
      if (nl.includes('2 pm') || nl.includes('14:00') || nl.includes('2:00 pm')) {
        scenarioDeparture = '14:00 IST';
      } else if (nl.includes('3 pm') || nl.includes('15:00')) {
        scenarioDeparture = '15:00 IST';
      } else if (nl.includes('afternoon')) {
        scenarioDeparture = '13:00 IST';
      } else if (nl.includes('6 am') || nl.includes('06:00')) {
        scenarioDeparture = '06:00 IST';
      } else if (nl.includes('8 am') || nl.includes('08:00')) {
        scenarioDeparture = '08:00 IST';
      }

      const durMatch = nl.match(/\b(\d+)\s*(?:hours|hour|hrs|hr|h)\b/);
      if (durMatch && durMatch[1]) {
        scenarioDuration = parseInt(durMatch[1], 10);
      }

      if (nl.includes('vessel-002') || nl.includes('samudra') || nl.includes('trawler')) {
        scenarioVessel = 'VESSEL-002';
      } else if (nl.includes('vessel-003') || nl.includes('patrol craft')) {
        scenarioVessel = 'VESSEL-003';
      } else if (nl.includes('vessel-001') || nl.includes('matsya sagar')) {
        scenarioVessel = 'VESSEL-001';
      }

      if (
        nl.includes('avoid restricted') ||
        nl.includes('avoid naval') ||
        nl.includes('avoid the restricted') ||
        nl.includes('avoid this restricted') ||
        nl.includes('avoid zone')
      ) {
        scenarioAvoidRestricted = true;
      }

      const waveMatch =
        nl.match(/(\d+(?:\.\d+)?)\s*(?:m|meter|meters|metre|metres)\s*wave/i) ||
        nl.match(/wave(?:s)?\s*(?:height\s*)?(?:increase to|increases to|are|reach|of)?\s*(\d+(?:\.\d+)?)/i);
      if (waveMatch && waveMatch[1]) {
        hypotheticalWave = parseFloat(waveMatch[1]);
        isHypotheticalAssumption = true;
      }

      const windMatch = nl.match(/(\d+(?:\.\d+)?)\s*(?:kts|knots)\s*wind/i);
      if (windMatch && windMatch[1]) {
        hypotheticalWind = parseFloat(windMatch[1]);
        isHypotheticalAssumption = true;
      }
    }

    // Apply explicit structured modification overrides
    if (request.modifications) {
      if (request.modifications.departureTime) scenarioDeparture = request.modifications.departureTime;
      if (request.modifications.durationHours) scenarioDuration = request.modifications.durationHours;
      if (request.modifications.vesselId) scenarioVessel = request.modifications.vesselId;
      if (request.modifications.regionId) scenarioRegion = request.modifications.regionId;
      if (request.modifications.avoidRestrictedZones !== undefined) scenarioAvoidRestricted = request.modifications.avoidRestrictedZones;
      if (request.modifications.assumptions) {
        if (request.modifications.assumptions.waveHeightMeters !== undefined) {
          hypotheticalWave = request.modifications.assumptions.waveHeightMeters;
          isHypotheticalAssumption = true;
        }
        if (request.modifications.assumptions.windSpeedKnots !== undefined) {
          hypotheticalWind = request.modifications.assumptions.windSpeedKnots;
          isHypotheticalAssumption = true;
        }
      }
    }

    // 3. Classify Scenario Type
    let scenarioType: ScenarioType = 'CUSTOM';
    const changedFields: string[] = [];
    const fieldDeltas: ScenarioInputDelta['fieldDeltas'] = {};

    if (scenarioDeparture !== baselineDeparture) {
      changedFields.push('departureTime');
      fieldDeltas['departureTime'] = {
        from: baselineDeparture,
        to: scenarioDeparture,
        label: 'Departure Time',
      };
      scenarioType = 'TIME_CHANGE';
    }

    if (scenarioDuration !== baselineDuration) {
      changedFields.push('durationHours');
      fieldDeltas['durationHours'] = {
        from: `${baselineDuration}h`,
        to: `${scenarioDuration}h`,
        label: 'Trip Duration',
      };
      scenarioType = scenarioType === 'TIME_CHANGE' ? 'COMBINED_CHANGE' : 'DURATION_CHANGE';
    }

    if (scenarioVessel !== baselineVessel) {
      changedFields.push('vesselId');
      fieldDeltas['vesselId'] = {
        from: baselineVessel,
        to: scenarioVessel,
        label: 'Operating Vessel',
      };
      scenarioType = scenarioType !== 'CUSTOM' ? 'COMBINED_CHANGE' : 'VESSEL_CHANGE';
    }

    if (scenarioAvoidRestricted) {
      changedFields.push('avoidRestrictedZones');
      fieldDeltas['avoidRestrictedZones'] = {
        from: 'Direct Vector (Crosses Naval Boundary)',
        to: 'Transit Corridor (Avoids Restricted Anchorage)',
        label: 'Navigation Route',
      };
      scenarioType = scenarioType !== 'CUSTOM' ? 'COMBINED_CHANGE' : 'ROUTE_CHANGE';
    }

    if (isHypotheticalAssumption) {
      if (hypotheticalWave !== undefined) {
        changedFields.push('assumptions.waveHeightMeters');
        fieldDeltas['assumptions.waveHeightMeters'] = {
          from: 'Observed INCOIS OSF (1.4m)',
          to: `Hypothetical Assumption (${hypotheticalWave}m)`,
          label: 'Significant Wave Height',
        };
      }
      scenarioType = 'ENVIRONMENTAL_ASSUMPTION';
    }

    // 4. Re-run Specialists & Deterministic Decision Engine for Scenario
    const originLocation = scenarioRegion === 'tamil_nadu'
      ? { latitude: 10.76, longitude: 79.85, name: 'Nagapattinam Harbour' }
      : { latitude: 18.92, longitude: 72.84, name: 'Sassoon Docks / Mumbai' };

    // When scenario avoids restricted zones, adjust route waypoints outside naval polygon
    const waypoints = scenarioAvoidRestricted
      ? [
          { latitude: 18.92, longitude: 72.84, name: 'Port Departure' },
          { latitude: 18.80, longitude: 72.65, name: 'Outer Safe Channel Waypoint (Clear of Anchorage)' },
          { latitude: 18.72, longitude: 72.58, name: 'PFZ Target Alpha' },
        ]
      : (scenarioRegion === 'tamil_nadu'
          ? [
              { latitude: 10.76, longitude: 79.85, name: 'Port Origin' },
              { latitude: 10.72, longitude: 79.98, name: 'Outer Shelf Corridor' },
              { latitude: 10.65, longitude: 80.12, name: 'PFZ Target Alpha' },
            ]
          : [
              { latitude: 18.92, longitude: 72.84, name: 'Port Origin' },
              { latitude: 18.85, longitude: 72.78, name: 'Naval Clearance Waypoint' },
              { latitude: 18.78, longitude: 72.72, name: 'PFZ Target Alpha' },
            ]);

    // Fetch baseline environmental conditions or apply assumptions
    const baseWave = (typeof hypotheticalWave === 'number' ? hypotheticalWave : ((baselineResult.orchestrationResult.specialists.OCEANOGRAPHY.data as Record<string, unknown>)?.waveHeightMeters as number)) || 1.4;
    const baseWind = (typeof hypotheticalWind === 'number' ? hypotheticalWind : ((baselineResult.orchestrationResult.specialists.METEOROLOGY.data as Record<string, unknown>)?.windSpeedKnots as number)) || 12.0;

    // Re-evaluate Deterministic Decision Engine
    const scenarioDecisionResponse: DecisionEvaluationResponse = await this.decisionEngineService.evaluateDecision({
      regionId: scenarioRegion,
      vesselId: scenarioVessel,
      departureTime: scenarioDeparture,
      durationHours: scenarioDuration,
      originLocation,
      waypoints,
      targetZoneId: scenarioRegion === 'tamil_nadu' ? 'PFZ-TN-01' : 'PFZ-MUM-01',
      mustReturnBeforeSunset: true,
      environmentalContext: {
        waveHeightMeters: baseWave,
        windSpeedKnots: baseWind,
        windGustKnots: baseWind * 1.3,
        seaSurfaceTemperatureCelsius: 28.2,
        currentSpeedKnots: 0.8,
        visibilityKm: 8.5,
        activeWarnings: [],
        observedAt: evaluatedAt,
        isLive: !isHypotheticalAssumption,
      },
    });

    // 5. Compare Baseline vs Scenario Rules & Evidence
    const baselineRules = baselineDecision.rules || [];
    const scenarioRules = scenarioDecisionResponse.rules || [];

    const newlyTriggeredRules: ScenarioRuleDeltaItem[] = [];
    const noLongerTriggeredRules: ScenarioRuleDeltaItem[] = [];
    const persistingRules: ScenarioRuleDeltaItem[] = [];

    const baselineRuleMap = new Map(baselineRules.map((r) => [r.ruleId, r]));
    const scenarioRuleMap = new Map(scenarioRules.map((r) => [r.ruleId, r]));

    for (const sRule of scenarioRules) {
      const bRule = baselineRuleMap.get(sRule.ruleId);
      if (!bRule || (bRule.result === 'PASS' && sRule.result !== 'PASS')) {
        newlyTriggeredRules.push({
          ruleId: sRule.ruleId,
          ruleName: sRule.ruleName,
          category: sRule.category,
          verdictImpact: sRule.result === 'FAIL' ? 'AVOID' : (sRule.result as any),
          reason: sRule.reason,
        });
      } else if (bRule.result === sRule.result) {
        persistingRules.push({
          ruleId: sRule.ruleId,
          ruleName: sRule.ruleName,
          category: sRule.category,
          verdictImpact: sRule.result === 'FAIL' ? 'AVOID' : (sRule.result as any),
          reason: sRule.reason,
        });
      }
    }

    for (const bRule of baselineRules) {
      const sRule = scenarioRuleMap.get(bRule.ruleId);
      if (bRule.result !== 'PASS' && (!sRule || sRule.result === 'PASS')) {
        noLongerTriggeredRules.push({
          ruleId: bRule.ruleId,
          ruleName: bRule.ruleName,
          category: bRule.category,
          verdictImpact: bRule.result === 'FAIL' ? 'AVOID' : (bRule.result as any),
          reason: bRule.reason,
        });
      }
    }

    // Compute Evidence Comparison
    const scenarioEvidence: AuditedEvidenceItem[] = scenarioDecisionResponse.evidence.map((e) => ({
      ...e,
      status: isHypotheticalAssumption ? 'DEMO' : e.status,
      notes: isHypotheticalAssumption ? 'HYPOTHETICAL ASSUMPTION' : e.notes,
    }));

    const changedEvidence: ScenarioEvidenceComparison['changedEvidence'] = [];

    if (scenarioDeparture !== baselineDeparture) {
      changedEvidence.push({
        variable: 'departureWindow',
        baselineValue: baselineDeparture,
        scenarioValue: scenarioDeparture,
        impactDelta: 'TEMPORAL_WINDOW_SHIFT',
        isHypothetical: false,
      });
    }

    if (scenarioDuration !== baselineDuration) {
      changedEvidence.push({
        variable: 'durationHours',
        baselineValue: baselineDuration,
        scenarioValue: scenarioDuration,
        unit: 'hours',
        impactDelta: scenarioDuration < baselineDuration ? 'REDUCED_MISSION_EXPOSURE' : 'EXTENDED_EXPOSURE',
        isHypothetical: false,
      });
    }

    if (scenarioVessel !== baselineVessel) {
      changedEvidence.push({
        variable: 'operatingVessel',
        baselineValue: baselineVessel,
        scenarioValue: scenarioVessel,
        impactDelta: 'VESSEL_CAPABILITY_SHIFT',
        isHypothetical: false,
      });
    }

    if (isHypotheticalAssumption && hypotheticalWave !== undefined) {
      changedEvidence.push({
        variable: 'significantWaveHeight',
        baselineValue: 1.4,
        scenarioValue: hypotheticalWave,
        unit: 'm',
        impactDelta: hypotheticalWave > 1.8 ? 'ADVERSE_LIMIT_BREACH' : 'NEUTRAL',
        isHypothetical: true,
      });
    }

    // 6. Generate Grounded Verdict Change Reason & Actionable Advice
    let verdictChangeReason: string;
    const baselineVerdict = baselineDecision.verdict;
    const scenarioVerdict = scenarioDecisionResponse.verdict;

    if (baselineVerdict === scenarioVerdict) {
      verdictChangeReason = `Verdict remains ${scenarioVerdict}. The scenario modifications do not alter the decisive safety constraints (${scenarioDecisionResponse.primaryDriver}).`;
    } else if (baselineVerdict === 'AVOID' && (scenarioVerdict === 'CAUTION' || scenarioVerdict === 'GO')) {
      verdictChangeReason = `Verdict upgraded from ${baselineVerdict} to ${scenarioVerdict}. ${
        scenarioAvoidRestricted
          ? 'Re-routing outside naval boundary successfully cleared restricted zone barrier.'
          : 'Modifications resolved previous safety override.'
      }`;
    } else if (scenarioVerdict === 'AVOID') {
      verdictChangeReason = `Verdict downgraded to AVOID. Decisive rule triggered: ${scenarioDecisionResponse.primaryDriver}.`;
    } else if (scenarioVerdict === 'CAUTION') {
      verdictChangeReason = `Verdict altered from ${baselineVerdict} to CAUTION due to operating window or environmental limits: ${scenarioDecisionResponse.primaryDriver}.`;
    } else {
      verdictChangeReason = `Verdict changed from ${baselineVerdict} to ${scenarioVerdict} following deterministic re-evaluation.`;
    }

    const actionableAdvice: string[] = [];
    if (scenarioVerdict === 'AVOID') {
      actionableAdvice.push('Do not execute this hypothetical scenario without resolving the blocking safety constraint.');
      actionableAdvice.push(`Primary Blocker: ${scenarioDecisionResponse.primaryDriver}.`);
    } else if (scenarioVerdict === 'CAUTION') {
      actionableAdvice.push(`Target departure at ${scenarioDeparture} with strict return before ${scenarioDecisionResponse.recommendedReturn || '18:00 IST'}.`);
      actionableAdvice.push('Carry active VHF transceiver and maintain visual lookout.');
    } else {
      actionableAdvice.push('Scenario is verified CLEAR. Proceed as planned under standard navigation protocol.');
    }

    return {
      scenarioId,
      scenarioType,
      naturalLanguagePrompt: request.naturalLanguageScenario,
      baseline: {
        queryId: baselineResult.queryId,
        verdict: baselineDecision.verdict,
        confidence: {
          level: baselineDecision.confidence.level as any,
          score: baselineDecision.confidence.level === 'HIGH' ? 95 : 75,
          reasons: baselineDecision.confidence.reasons,
        },
        primaryDriver: baselineDecision.primaryDriver,
        summary: baselineResult.shortAnswer || baselineDecision.explanation || `Baseline evaluation: ${baselineDecision.verdict}`,
        departureTime: baselineDeparture,
        durationHours: baselineDuration,
        vesselId: baselineVessel,
        regionId: baselineRegionId,
      },
      scenario: {
        verdict: scenarioVerdict,
        confidence: {
          level: scenarioDecisionResponse.confidence.level as any,
          score: scenarioDecisionResponse.confidence.level === 'HIGH' ? 95 : 75,
          reasons: scenarioDecisionResponse.confidence.reasons,
        },
        primaryDriver: scenarioDecisionResponse.primaryDriver,
        summary: scenarioDecisionResponse.explanation || `Scenario evaluation: ${scenarioVerdict} (${scenarioDecisionResponse.primaryDriver})`,
        actionableAdvice,
        departureTime: scenarioDeparture,
        durationHours: scenarioDuration,
        vesselId: scenarioVessel,
        regionId: scenarioRegion,
      },
      delta: {
        changedFields,
        fieldDeltas,
      },
      ruleComparison: {
        newlyTriggeredRules,
        noLongerTriggeredRules,
        persistingRules,
      },
      evidenceComparison: {
        newEvidence: scenarioEvidence,
        changedEvidence,
      },
      evidence: scenarioEvidence,
      verdictChangeReason,
      isHypotheticalAssumption,
      intelligenceMode: 'DETERMINISTIC_FALLBACK',
      evaluatedAt,
    };
  }
}
