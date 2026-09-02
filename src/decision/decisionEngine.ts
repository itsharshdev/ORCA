import type { DecisionInput, DecisionResult, RuleEvaluation, DecisionVerdict } from './decisionTypes';
import {
  evaluateSevereWarningOverride,
  evaluateGeofenceConflict,
  evaluateVesselWaveTolerance,
  evaluateTemporalReturnWindow,
  evaluateModerateWeatherOceanRisk,
  evaluatePfzOptimization,
  evaluateDataQualityGate,
} from './decisionRules';

/**
 * Pure Deterministic Decision Engine: Evaluates multi-agent inputs and mission parameters
 * against transparent safety rules and constraints.
 * 
 * STRICT GUARANTEE: Same inputs ALWAYS produce the exact same verdict and explanation.
 * ZERO Math.random().
 */
export const evaluateMission = (input: DecisionInput): DecisionResult => {
  const { mission, pfz } = input;

  // 1. Run all rule evaluators deterministically
  const ruleEvaluations: RuleEvaluation[] = [
    evaluateSevereWarningOverride(input),
    evaluateGeofenceConflict(input),
    evaluateDataQualityGate(input),
    evaluateVesselWaveTolerance(input),
    evaluateTemporalReturnWindow(input),
    evaluateModerateWeatherOceanRisk(input),
    evaluatePfzOptimization(input),
  ];

  // 2. Track triggered safety overrides and factors
  const safetyOverridesTriggered: string[] = [];
  const positiveFactors: string[] = [];
  const riskFactors: string[] = [];

  ruleEvaluations.forEach((rule) => {
    if (rule.category === 'safety_override' && rule.verdictImpact === 'AVOID') {
      safetyOverridesTriggered.push(rule.reason);
    }
    if (rule.verdictImpact === 'PASS' && rule.deterministicScore >= 80) {
      positiveFactors.push(rule.reason);
    } else if (rule.verdictImpact === 'CAUTION') {
      riskFactors.push(rule.reason);
    } else if (rule.verdictImpact === 'AVOID') {
      riskFactors.push(rule.reason);
    }
  });

  // 3. Determine Verdict according to strict Safety Priority Hierarchy
  let verdict: DecisionVerdict;
  let primaryDriver: string;

  const hasOverrideAvoid = ruleEvaluations.some(
    (r) => r.category === 'safety_override' && r.verdictImpact === 'AVOID'
  );
  const hasConstraintAvoid = ruleEvaluations.some(
    (r) => (r.category === 'physical_constraint' || r.category === 'temporal_exposure' || r.category === 'data_quality') && r.verdictImpact === 'AVOID'
  );
  const hasCaution = ruleEvaluations.some((r) => r.verdictImpact === 'CAUTION');

  if (hasOverrideAvoid) {
    verdict = 'AVOID';
    const overrideRule = ruleEvaluations.find((r) => r.category === 'safety_override' && r.verdictImpact === 'AVOID');
    primaryDriver = overrideRule ? overrideRule.reason : 'Mandatory safety override active.';
  } else if (hasConstraintAvoid) {
    verdict = 'AVOID';
    const constraintRule = ruleEvaluations.find(
      (r) => (r.category === 'physical_constraint' || r.category === 'temporal_exposure' || r.category === 'data_quality') && r.verdictImpact === 'AVOID'
    );
    primaryDriver = constraintRule ? constraintRule.reason : 'Physical vessel constraint or late return window exceeded.';
  } else if (hasCaution) {
    verdict = 'CAUTION';
    const cautionRule = ruleEvaluations.find((r) => r.verdictImpact === 'CAUTION');
    primaryDriver = cautionRule ? cautionRule.reason : 'Moderate coastal risk during mission corridor.';
  } else {
    verdict = 'GO';
    primaryDriver = 'Departure and return windows satisfy all safety margins with high fishing potential.';
  }

  // 4. Calculate Deterministic Confidence Score
  const ruleScoreAvg = ruleEvaluations.reduce((acc, r) => acc + r.deterministicScore, 0) / ruleEvaluations.length;
  const rawConfidence = 50 + 20 + (ruleScoreAvg * 0.15); // ranges ~75% to 92% deterministically
  const confidenceScore = Math.min(95, Math.max(60, Math.round(rawConfidence * 10) / 10));

  // 5. Calculate expected return time string
  let depHour = 6;
  const match = mission.departureTime.match(/(\d+):(\d+)/);
  if (match && match[1]) {
    depHour = parseInt(match[1], 10);
  }
  const retHour = depHour + mission.durationHours;
  const recommendedDeparture = mission.departureTime;
  const recommendedReturn = `${retHour.toString().padStart(2, '0')}:00 IST`;

  // 6. Generate Contextual Explanation
  let explanation: string;
  if (verdict === 'GO') {
    explanation = `Overall trip highly favorable between ${recommendedDeparture} and ${recommendedReturn}. PFZ opportunity at ${pfz.data.topCandidateZoneName} is strong with calm sea state (< 1.2m) throughout.`;
  } else if (verdict === 'CAUTION') {
    explanation = `Trip feasible for early departure at ${recommendedDeparture}, but mission duration of ${mission.durationHours}h approaches worsening midday swell (> 2.0m post-12:00 IST). Conclude operations before midday.`;
  } else {
    explanation = `Mission not recommended (AVOID). ${primaryDriver}`;
  }

  return {
    verdict,
    confidenceScore,
    primaryDriver,
    explanation,
    recommendedDeparture,
    recommendedReturn,
    recommendedZone: {
      id: pfz.data.topCandidateZoneId,
      name: pfz.data.topCandidateZoneName,
      distanceKm: pfz.data.distanceKm,
      bearing: pfz.data.bearingDegrees,
      opportunity: pfz.data.opportunityLevel,
    },
    ruleEvaluations,
    safetyOverridesTriggered,
    positiveFactors,
    riskFactors,
    dataQuality: {
      status: 'demo_snapshot',
      completenessScore: 100,
      evaluatedSourcesCount: 5,
      totalRequiredSources: 5,
    },
    evaluatedAt: new Date().toISOString(),
  };
};
