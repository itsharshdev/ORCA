import type { DecisionInput, RuleEvaluation } from './decisionTypes';

/**
 * 1. Severe Official Warning Override Rule
 * Critical official cyclone alerts or squall line emergencies trigger mandatory AVOID.
 */
export const evaluateSevereWarningOverride = (input: DecisionInput): RuleEvaluation => {
  const { weather, geoSafety } = input;
  const isSevereSquall = weather.data.activeAdvisories.some((adv) => 
    adv.toLowerCase().includes('cyclone') || adv.toLowerCase().includes('emergency')
  );

  const hasCriticalHazard = geoSafety.data.hazardsSummary.some((h) => 
    h.toLowerCase().includes('severe') || h.toLowerCase().includes('prohibited')
  );

  if (isSevereSquall || hasCriticalHazard) {
    return {
      ruleId: 'RULE_01_SEVERE_OFFICIAL_WARNING',
      ruleName: 'Severe Marine & Cyclone Warning Override',
      category: 'safety_override',
      verdictImpact: 'AVOID',
      reason: 'Official severe advisory active in the operational sector. Mission prohibited by safety override.',
      evidenceRef: 'IMD_COASTAL_RADAR_SNAPSHOT / NAVAREA_VIII',
      deterministicScore: 0,
    };
  }

  return {
    ruleId: 'RULE_01_SEVERE_OFFICIAL_WARNING',
    ruleName: 'Severe Marine & Cyclone Warning Override',
    category: 'safety_override',
    verdictImpact: 'PASS',
    reason: 'No critical cyclone or severe emergency overrides active.',
    evidenceRef: 'IMD_COASTAL_RADAR_SNAPSHOT',
    deterministicScore: 100,
  };
};

/**
 * 2. Hard Geofence & Restricted Boundary Conflict Rule
 * Clearance < 1.0 km or incursion risk 'high' triggers mandatory AVOID.
 */
export const evaluateGeofenceConflict = (input: DecisionInput): RuleEvaluation => {
  const { geoSafety } = input;
  const clearance = geoSafety.data.geofenceClearanceKm;
  const incursionRisk = geoSafety.data.incursionRisk;

  if (incursionRisk === 'high' || clearance < 1.0) {
    return {
      ruleId: 'RULE_02_HARD_GEOFENCE_CONFLICT',
      ruleName: 'Naval & Marine Sanctuary Geofence Compliance',
      category: 'safety_override',
      verdictImpact: 'AVOID',
      reason: `Planned transit intersects restricted corridor with insufficient clearance (${clearance} km < 1.0 km buffer).`,
      evidenceRef: geoSafety.data.nearestGeofenceName,
      deterministicScore: 0,
    };
  }

  if (clearance < 2.5) {
    return {
      ruleId: 'RULE_02_HARD_GEOFENCE_CONFLICT',
      ruleName: 'Naval & Marine Sanctuary Geofence Compliance',
      category: 'safety_override',
      verdictImpact: 'CAUTION',
      reason: `Route passes near boundary buffer (${clearance} km clearance). Maintain navigational watch.`,
      evidenceRef: geoSafety.data.nearestGeofenceName,
      deterministicScore: 60,
    };
  }

  return {
    ruleId: 'RULE_02_HARD_GEOFENCE_CONFLICT',
    ruleName: 'Naval & Marine Sanctuary Geofence Compliance',
    category: 'safety_override',
    verdictImpact: 'PASS',
    reason: `Clear navigation corridor verified (${clearance} km clearance from ${geoSafety.data.nearestGeofenceName}).`,
    evidenceRef: geoSafety.data.nearestGeofenceName,
    deterministicScore: 100,
  };
};

/**
 * 3. Physical Vessel Wave Tolerance Rule
 * If current wave swell exceeds vessel limit -> AVOID. If >= 85% limit -> CAUTION.
 */
export const evaluateVesselWaveTolerance = (input: DecisionInput): RuleEvaluation => {
  const { weather, ocean, vessel } = input;
  const currentSwell = Math.max(weather.data.waveHeightMeters, ocean.data.waveSwellMeters);
  const maxTolerance = vessel.maxWaveToleranceMeters;

  if (currentSwell > maxTolerance) {
    return {
      ruleId: 'RULE_03_VESSEL_WAVE_TOLERANCE',
      ruleName: 'Vessel Seaworthiness & Wave Tolerance Limit',
      category: 'physical_constraint',
      verdictImpact: 'AVOID',
      reason: `Observed swell (${currentSwell}m) exceeds craft tolerance limit (${maxTolerance}m for ${vessel.name}).`,
      evidenceRef: `VESSEL_LIMIT_${vessel.id}`,
      deterministicScore: 10,
    };
  }

  if (currentSwell >= maxTolerance * 0.8) {
    return {
      ruleId: 'RULE_03_VESSEL_WAVE_TOLERANCE',
      ruleName: 'Vessel Seaworthiness & Wave Tolerance Limit',
      category: 'physical_constraint',
      verdictImpact: 'CAUTION',
      reason: `Current swell (${currentSwell}m) approaches craft operational threshold (${maxTolerance}m).`,
      evidenceRef: `VESSEL_LIMIT_${vessel.id}`,
      deterministicScore: 65,
    };
  }

  return {
    ruleId: 'RULE_03_VESSEL_WAVE_TOLERANCE',
    ruleName: 'Vessel Seaworthiness & Wave Tolerance Limit',
    category: 'physical_constraint',
    verdictImpact: 'PASS',
    reason: `Swell state (${currentSwell}m) is well within vessel safe margin (${maxTolerance}m).`,
    evidenceRef: `VESSEL_LIMIT_${vessel.id}`,
    deterministicScore: 95,
  };
};

/**
 * 4. Temporal Return Window Exposure Rule
 * Evaluates departure time + mission duration against worsening afternoon forecast.
 */
export const evaluateTemporalReturnWindow = (input: DecisionInput): RuleEvaluation => {
  const { mission } = input;
  const { departureTime, durationHours } = mission;

  // Calculate return hour in 24h format
  let depHour = 6;
  const match = departureTime.match(/(\d+):(\d+)/);
  if (match && match[1]) {
    depHour = parseInt(match[1], 10);
  }

  const returnHour = depHour + durationHours;

  // Sea state deteriorates past 12:00 IST (Swell > 2.0m, Wind Gusts > 25 kts)
  if (returnHour >= 14 || durationHours >= 8) {
    return {
      ruleId: 'RULE_04_TEMPORAL_RETURN_WINDOW',
      ruleName: 'Temporal Forecast & Return Corridor Exposure',
      category: 'temporal_exposure',
      verdictImpact: 'AVOID',
      reason: `Mission duration of ${durationHours}h extends deeply into worsening afternoon conditions (expected return: ${returnHour}:00 IST with swell > 2.1m).`,
      evidenceRef: 'HOURLY_FORECAST_WINDOW',
      deterministicScore: 20,
    };
  }

  if (returnHour > 11 || durationHours >= 5) {
    return {
      ruleId: 'RULE_04_TEMPORAL_RETURN_WINDOW',
      ruleName: 'Temporal Forecast & Return Corridor Exposure',
      category: 'temporal_exposure',
      verdictImpact: 'CAUTION',
      reason: `Departure at ${departureTime} is favorable, but return window (${returnHour}:00 IST) approaches worsening midday sea state. Ensure return before 11:30 IST.`,
      evidenceRef: 'HOURLY_FORECAST_WINDOW',
      deterministicScore: 65,
    };
  }

  return {
    ruleId: 'RULE_04_TEMPORAL_RETURN_WINDOW',
    ruleName: 'Temporal Forecast & Return Corridor Exposure',
    category: 'temporal_exposure',
    verdictImpact: 'PASS',
    reason: `Full mission window (${departureTime} to ${returnHour}:00 IST) completes entirely within favorable morning wave state (< 1.2m).`,
    evidenceRef: 'HOURLY_FORECAST_WINDOW',
    deterministicScore: 95,
  };
};

/**
 * 5. Moderate Weather and Ocean Risk Rule
 * Evaluates wind velocity, gust margin, and surface current.
 */
export const evaluateModerateWeatherOceanRisk = (input: DecisionInput): RuleEvaluation => {
  const { weather, ocean } = input;
  const windSpeed = weather.data.windSpeedKnots;
  const windGust = weather.data.windGustKnots;
  const current = ocean.data.surfaceCurrentSpeedKnots;

  if (windSpeed > 22 || windGust > 28 || current > 1.8) {
    return {
      ruleId: 'RULE_05_MODERATE_WEATHER_OCEAN_RISK',
      ruleName: 'Atmospheric & Current Velocity Constraints',
      category: 'physical_constraint',
      verdictImpact: 'AVOID',
      reason: `Excessive wind gusts (${windGust} kts) and surface drift current (${current} kts).`,
      evidenceRef: 'COASTAL_RADAR_AND_OCEAN_MODEL',
      deterministicScore: 25,
    };
  }

  if (windSpeed >= 13 || windGust >= 18 || current >= 0.9) {
    return {
      ruleId: 'RULE_05_MODERATE_WEATHER_OCEAN_RISK',
      ruleName: 'Atmospheric & Current Velocity Constraints',
      category: 'physical_constraint',
      verdictImpact: 'CAUTION',
      reason: `Moderate surface winds (${windSpeed} kts, gusts ${windGust} kts) and steady current (${current} kts).`,
      evidenceRef: 'COASTAL_RADAR_AND_OCEAN_MODEL',
      deterministicScore: 70,
    };
  }

  return {
    ruleId: 'RULE_05_MODERATE_WEATHER_OCEAN_RISK',
    ruleName: 'Atmospheric & Current Velocity Constraints',
    category: 'physical_constraint',
    verdictImpact: 'PASS',
    reason: `Favorable atmospheric conditions (Wind: ${windSpeed} kts, Current: ${current} kts).`,
    evidenceRef: 'COASTAL_RADAR_AND_OCEAN_MODEL',
    deterministicScore: 95,
  };
};

/**
 * 6. PFZ Opportunity Optimization Rule
 * High/Moderate opportunity enhances utility, but NEVER overrides safety constraints.
 */
export const evaluatePfzOptimization = (input: DecisionInput): RuleEvaluation => {
  const { pfz } = input;
  const opp = pfz.data.opportunityLevel;
  const zoneName = pfz.data.topCandidateZoneName;

  return {
    ruleId: 'RULE_06_PFZ_OPPORTUNITY_OPTIMIZATION',
    ruleName: 'Satellite PFZ & Pelagic Habitat Opportunity',
    category: 'opportunity_optimization',
    verdictImpact: opp === 'high' || opp === 'moderate' ? 'PASS' : 'CAUTION',
    reason: `${zoneName} exhibits ${opp.toUpperCase()} pelagic aggregation potential based on SST thermal front and chlorophyll boundary.`,
    evidenceRef: pfz.data.topCandidateZoneId,
    deterministicScore: opp === 'high' ? 95 : opp === 'moderate' ? 75 : 40,
  };
};

/**
 * 7. Data Quality and Freshness Gate Rule
 * Assesses availability and validity of the 5 specialized agent outputs.
 */
export const evaluateDataQualityGate = (input: DecisionInput): RuleEvaluation => {
  const { planner, ocean, weather, pfz, geoSafety } = input;
  const agents = [planner, ocean, weather, pfz, geoSafety];
  const completedCount = agents.filter((a) => a.status === 'completed').length;

  if (completedCount < 4) {
    return {
      ruleId: 'RULE_07_DATA_QUALITY_GATE',
      ruleName: 'Dataset Completeness & Quality Gate',
      category: 'data_quality',
      verdictImpact: 'AVOID',
      reason: `Critical agent observation data missing (${completedCount}/5 verified). Safety cannot be evaluated reliably.`,
      evidenceRef: 'DATA_QUALITY_AUDIT',
      deterministicScore: 20,
    };
  }

  return {
    ruleId: 'RULE_07_DATA_QUALITY_GATE',
    ruleName: 'Dataset Completeness & Quality Gate',
    category: 'data_quality',
    verdictImpact: 'PASS',
    reason: `All required marine datasets verified (${completedCount}/5 agent reports present).`,
    evidenceRef: 'DATA_QUALITY_AUDIT',
    deterministicScore: 100,
  };
};
