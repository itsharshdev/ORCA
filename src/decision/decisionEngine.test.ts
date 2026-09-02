import { evaluateMission } from './decisionEngine';
import type { DecisionInput } from './decisionTypes';
import { getRegionData } from '@/data';

/**
 * Deterministic Test Suite verifying all 11 explicit Phase 5 test cases.
 */
export const runDecisionEngineVerification = () => {
  const mhData = getRegionData('maharashtra');
  const tnData = getRegionData('tamil_nadu');

  const baseInput: DecisionInput = {
    mission: {
      activity: 'fishing',
      departureTime: '05:45 IST',
      durationHours: 5,
      expectedReturnTime: '10:45 IST',
      regionId: 'maharashtra',
    },
    planner: {
      agentId: 'planner',
      agentName: 'Planner',
      role: 'Planning',
      status: 'completed',
      summary: '5h fishing mission',
      data: {
        intent: 'fishing_trip_assessment',
        activity: 'fishing',
        requestedPeriod: 'tomorrow_morning',
        departureTime: '05:45 IST',
        durationHours: 5,
        locationContext: 'Alibaug',
        vesselRequired: true,
        assignedTasks: ['ocean', 'weather', 'pfz', 'geoSafety'],
      },
      evidence: [],
      confidence: 95,
      sourceStatus: 'demo_snapshot',
    },
    ocean: {
      agentId: 'ocean',
      agentName: 'Oceanography',
      role: 'Ocean analysis',
      status: 'completed',
      summary: 'Moderate swell',
      data: {
        seaSurfaceTemperatureCelsius: 27.8,
        sstAnomalyCelsius: 0.6,
        surfaceCurrentSpeedKnots: 0.8,
        surfaceCurrentDirection: 'SSE',
        mixedLayerDepthMeters: 28,
        thermoclineDepthMeters: 45,
        chlorophyllConcentrationMgM3: 1.84,
        waveSwellMeters: 1.4,
        oceanRiskLevel: 'moderate',
        favorableFishingConditions: true,
      },
      evidence: [],
      confidence: 88,
      sourceStatus: 'demo_snapshot',
    },
    weather: {
      agentId: 'weather',
      agentName: 'Meteorology',
      role: 'Weather analysis',
      status: 'completed',
      summary: 'Wind 12.5 kts',
      data: {
        windSpeedKnots: 12.5,
        windGustKnots: 18.5,
        windDirection: 'WNW',
        waveHeightMeters: 1.4,
        wavePeriodSeconds: 7.2,
        visibilityKm: 8.5,
        airTemperatureCelsius: 29.4,
        atmosphericPressureHpa: 1013.2,
        precipitationProbabilityPercent: 15,
        activeAdvisories: ['Moderate wave swell 1.4m rising to 2.1m post-12:00'],
        weatherRiskLevel: 'moderate',
      },
      evidence: [],
      confidence: 91,
      sourceStatus: 'demo_snapshot',
    },
    pfz: {
      agentId: 'pfz',
      agentName: 'PFZ Agent',
      role: 'PFZ analysis',
      status: 'completed',
      summary: 'High potential Zone Alpha',
      data: {
        topCandidateZoneId: 'PFZ-MUM-01',
        topCandidateZoneName: 'Zone Alpha',
        opportunityLevel: 'high',
        distanceKm: 18.5,
        bearingDegrees: 245,
        targetFishTypes: ['Indian Mackerel', 'Ribbonfish'],
        chlorophyllIndicator: '1.82 mg/m³',
        sstIndicator: '27.8°C',
        totalZonesEvaluated: 3,
      },
      evidence: [],
      confidence: 89,
      sourceStatus: 'demo_snapshot',
    },
    geoSafety: {
      agentId: 'geoSafety',
      agentName: 'GeoSafety',
      role: 'Safety check',
      status: 'completed',
      summary: 'Naval clearance 4.2 km',
      data: {
        boundaryStatus: 'clear',
        nearestGeofenceName: 'Naval Anchorage Security Geofence',
        geofenceClearanceKm: 4.2,
        incursionRisk: 'none',
        activeHazardsCount: 2,
        hazardsSummary: ['Squall warning post-13:00'],
        safeCorridorVerified: true,
      },
      evidence: [],
      confidence: 94,
      sourceStatus: 'demo_snapshot',
    },
    vessel: mhData.vesselsData.profiles[0],
  };

  const results = [];

  // TEST 1 & 2: Base mission (5h departure at 05:45) -> CAUTION (due to return window nearing midday)
  const res1 = evaluateMission(baseInput);
  results.push({ test: 'TEST 1 & 2 (Base 5h Maharashtra)', pass: res1.verdict === 'CAUTION' });

  // TEST 3: Severe warning override -> AVOID
  const severeInput: DecisionInput = {
    ...baseInput,
    weather: {
      ...baseInput.weather,
      data: {
        ...baseInput.weather.data,
        activeAdvisories: ['IMD Official Emergency: Severe Cyclone Alert Moving Inland'],
      },
    },
  };
  const res3 = evaluateMission(severeInput);
  results.push({ test: 'TEST 3 (Severe Cyclone Warning Override)', pass: res3.verdict === 'AVOID' });

  // TEST 4: Hard geofence conflict -> AVOID
  const geofenceInput: DecisionInput = {
    ...baseInput,
    geoSafety: {
      ...baseInput.geoSafety,
      data: {
        ...baseInput.geoSafety.data,
        geofenceClearanceKm: 0.3,
        incursionRisk: 'high',
      },
    },
  };
  const res4 = evaluateMission(geofenceInput);
  results.push({ test: 'TEST 4 (Hard Geofence Conflict < 1.0 km)', pass: res4.verdict === 'AVOID' });

  // TEST 5: Longer mission (8h) extending into worsening conditions -> AVOID
  const longMissionInput: DecisionInput = {
    ...baseInput,
    mission: {
      ...baseInput.mission,
      durationHours: 8,
    },
  };
  const res5 = evaluateMission(longMissionInput);
  results.push({ test: 'TEST 5 (Long 8h Mission Overlapping Squall)', pass: res5.verdict === 'AVOID' });

  // TEST 6: Shorter mission (3h) staying inside morning window -> GO
  const shortMissionInput: DecisionInput = {
    ...baseInput,
    mission: {
      ...baseInput.mission,
      durationHours: 3,
    },
    weather: {
      ...baseInput.weather,
      data: {
        ...baseInput.weather.data,
        windSpeedKnots: 9.0,
        windGustKnots: 12.0,
        waveHeightMeters: 0.9,
      },
    },
    ocean: {
      ...baseInput.ocean,
      data: {
        ...baseInput.ocean.data,
        waveSwellMeters: 0.9,
        surfaceCurrentSpeedKnots: 0.5,
      },
    },
  };
  const res6 = evaluateMission(shortMissionInput);
  results.push({ test: 'TEST 6 (Short 3h Mission in Favorable Sea)', pass: res6.verdict === 'GO' });

  // TEST 7: High PFZ + High Swell (2.4m > 1.4m vessel limit) -> Safety wins (AVOID)
  const highSwellInput: DecisionInput = {
    ...baseInput,
    weather: {
      ...baseInput.weather,
      data: {
        ...baseInput.weather.data,
        waveHeightMeters: 2.4,
      },
    },
    ocean: {
      ...baseInput.ocean,
      data: {
        ...baseInput.ocean.data,
        waveSwellMeters: 2.4,
      },
    },
  };
  const res7 = evaluateMission(highSwellInput);
  results.push({ test: 'TEST 7 (High PFZ Opportunity + High Swell 2.4m -> Safety Wins)', pass: res7.verdict === 'AVOID' });

  // TEST 8: Missing critical data -> Degraded / AVOID
  const missingDataInput: DecisionInput = {
    ...baseInput,
    weather: {
      ...baseInput.weather,
      status: 'failed',
    },
    ocean: {
      ...baseInput.ocean,
      status: 'failed',
    },
  };
  const res8 = evaluateMission(missingDataInput);
  results.push({ test: 'TEST 8 (Missing Critical Datasets -> Quality Gate)', pass: res8.verdict === 'AVOID' });

  // TEST 9: Exact same input evaluated twice -> 100% Identical output
  const res9a = evaluateMission(baseInput);
  const res9b = evaluateMission(baseInput);
  results.push({ 
    test: 'TEST 9 (Deterministic Invariance)', 
    pass: res9a.verdict === res9b.verdict && res9a.confidenceScore === res9b.confidenceScore 
  });

  // TEST 10 & 11: Tamil Nadu Dataset
  const tnInput: DecisionInput = {
    ...baseInput,
    mission: {
      ...baseInput.mission,
      regionId: 'tamil_nadu',
    },
    vessel: tnData.vesselsData.profiles[0],
    pfz: {
      ...baseInput.pfz,
      data: {
        topCandidateZoneId: 'PFZ-TN-01',
        topCandidateZoneName: 'Nagai Deep Pelagic Front',
        opportunityLevel: 'high',
        distanceKm: 28.4,
        bearingDegrees: 115,
        targetFishTypes: ['Yellowfin Tuna', 'Indian Mackerel'],
        chlorophyllIndicator: '1.95 mg/m³',
        sstIndicator: '28.4°C',
        totalZonesEvaluated: 3,
      },
    },
  };
  const res11 = evaluateMission(tnInput);
  results.push({ test: 'TEST 11 (Tamil Nadu Nagapattinam Evaluation)', pass: res11.verdict === 'CAUTION' });

  return results;
};
