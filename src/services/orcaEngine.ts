import type {
  DecisionCardData,
  WhatIfParams,
  PfzSector,
  VesselProfile,
  SafetyLevel,
  AgentTrace,
  ScheduleMilestone
} from '../types/orca';
import { MOCK_INITIAL_DECISION, MOCK_PFZ_SECTORS, MOCK_VESSEL } from '../data/mockData';

export class OrcaDecisionEngine {
  public static evaluateQuestion(
    questionText: string,
    vessel: VesselProfile = MOCK_VESSEL,
    selectedSector?: PfzSector
  ): DecisionCardData {
    const text = questionText.toLowerCase();
    const sector = selectedSector || MOCK_PFZ_SECTORS[0];

    if (text.includes('where') || text.includes('good') || text.includes('zone') || text.includes('pfz')) {
      return {
        id: `dec-${Date.now()}`,
        question: questionText,
        safetyLevel: 'SAFE',
        headline: `PFZ Sector Alpha (7.4 NM East) has high shoal density for Sardinella & Mackerel.`,
        subtext: `${sector.name} • Depth ${sector.depthMeters} • Safe return window until ${sector.safeUntilTime}`,
        narrative: `INCOIS satellite data shows high chlorophyll (${sector.chlorophyllMgM3} mg/m³) and optimal SST (${sector.sstCelsius}°C). Best catch potential is between 05:30 AM and 09:30 AM. Sea condition is calm.`,
        locationName: sector.zoneCode,
        targetSectorId: sector.id,
        safeReturnWindow: `Return by ${sector.safeUntilTime} for safe passage`,
        recommendedDepartureTime: '04:30 AM',
        recommendedReturnTime: '11:30 AM',
        windSpeedKts: 11,
        windDirection: 'SW',
        waveHeightMeters: 0.8,
        seaState: 'Calm early, light chop later',
        pfzDistanceNm: sector.distanceNm,
        targetSpecies: sector.expectedSpecies,
        schedule: [
          { time: '04:30 AM', label: 'Depart', subtext: 'Calm Sea', type: 'depart', status: 'safe' },
          { time: '06:00 AM', label: 'Arrive PFZ', subtext: 'Shoal Peak', type: 'tide', status: 'safe' },
          { time: '10:30 AM', label: 'Start Return', subtext: 'Wind 12kts', type: 'return', status: 'safe' },
          { time: '12:00 PM', label: 'Harbor', subtext: 'Safe Port', type: 'harbor', status: 'safe' }
        ],
        agentTraces: this.generateAgentTraces('SAFE', 96),
        telemetrySources: ['INCOIS ERDDAP', 'MOSDAC SST', 'IMD Wind Radar'],
        crossSourceConflicts: [],
        whatIfSuggestions: [
          'What if I stay 2 extra hours at the PFZ?',
          'What if wind increases to 18 kts?'
        ],
        confidenceScore: 96,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
      };
    }

    if (text.includes('afternoon') || text.includes('weather') || text.includes('safe') || text.includes('wind')) {
      return {
        id: `dec-${Date.now()}`,
        question: questionText,
        safetyLevel: 'CAUTION',
        headline: 'Sea conditions worsen after 11:30 AM due to 18 kts SW wind chop.',
        subtext: 'Rameswaram South • Recommended return window by 11:30 AM',
        narrative: 'Early morning from 04:30 AM to 10:30 AM offers calm 0.8m seas. However, a localized SW wind shear will cause 1.4m steep waves after noon. Heading back by 11:30 AM ensures zero risk to craft.',
        locationName: 'Palk Bay & Dhanushkodi Coast',
        targetSectorId: 'pfz-alpha',
        safeReturnWindow: 'Must reach harbor entrance before 12:00 PM',
        recommendedDepartureTime: '04:30 AM',
        recommendedReturnTime: '11:30 AM',
        windSpeedKts: 18,
        windDirection: 'SW',
        waveHeightMeters: 1.4,
        seaState: 'Choppy after 11:30 AM',
        pfzDistanceNm: 7.4,
        targetSpecies: ['Sardinella', 'Mackerel'],
        schedule: [
          { time: '04:30 AM', label: 'Depart', subtext: 'Calm', type: 'depart', status: 'safe' },
          { time: '08:20 AM', label: 'High Tide', subtext: 'Max Depth', type: 'tide', status: 'safe' },
          { time: '10:30 AM', label: 'Head Back', subtext: 'Wind Rises', type: 'return', status: 'caution' },
          { time: '12:00 PM', label: 'Harbor', subtext: 'Safe Port', type: 'harbor', status: 'critical' }
        ],
        agentTraces: this.generateAgentTraces('CAUTION', 91),
        telemetrySources: ['IMD Coastal Radar', 'INCOIS Wave Watch', 'Coast Guard Patrol'],
        crossSourceConflicts: [
          'OpenMeteo indicates 14 kts; IMD Doppler detects 18 kts wind gust vector at Dhanushkodi channel. Reconciled to 18 kts.'
        ],
        whatIfSuggestions: [
          'What if I delay departure to 07:00 AM?',
          'What if I use the sheltered coastal corridor?'
        ],
        confidenceScore: 91,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
      };
    }

    return MOCK_INITIAL_DECISION;
  }

  public static simulateWhatIf(
    baseDecision: DecisionCardData,
    params: WhatIfParams,
    vessel: VesselProfile = MOCK_VESSEL
  ): DecisionCardData {
    let baseWind = baseDecision.windSpeedKts + params.windSpeedOffsetKts;
    let effectiveSpeed = vessel.cruiseSpeedKts * (params.enginePowerPercent / 100);

    let baseDelay = params.departureDelayHours;
    let updatedSafety: SafetyLevel = baseDecision.safetyLevel;

    if (baseDelay >= 3 || baseWind >= 20 || params.fuelLevelPercent < 30 || params.enginePowerPercent < 60) {
      updatedSafety = 'UNSAFE';
    } else if (baseDelay >= 1.5 || baseWind >= 15 || params.fuelLevelPercent < 50) {
      updatedSafety = 'CAUTION';
    } else {
      updatedSafety = 'SAFE';
    }

    let depHour = 4 + baseDelay;
    let depTimeStr = `${Math.floor(depHour).toString().padStart(2, '0')}:${(Math.round((depHour % 1) * 60)).toString().padStart(2, '0')} AM`;
    let returnHour = 11.5;
    let returnTimeStr = `${Math.floor(returnHour).toString().padStart(2, '0')}:${(Math.round((returnHour % 1) * 60)).toString().padStart(2, '0')} AM`;

    let headline = '';
    let narrative = '';

    if (updatedSafety === 'UNSAFE') {
      headline = `UNSAFE: Delayed departure or high wind (${baseWind} kts) violates return safety window!`;
      narrative = `Departing at ${depTimeStr} with ${baseWind} kts SW wind and ${params.enginePowerPercent}% engine power will force your vessel into 1.8m rough seas after noon, leaving insufficient fuel reserve (${params.fuelLevelPercent}%). Recommendation: Cancel or stay within 2 NM harbor zone.`;
    } else if (updatedSafety === 'CAUTION') {
      headline = `CAUTION: Narrowed safety window. Must depart by ${depTimeStr} and return by ${returnTimeStr}.`;
      narrative = `Departing at ${depTimeStr} is possible, but sea chop increases after 11:30 AM due to ${baseWind} kts SW wind. Cruise speed is ${effectiveSpeed.toFixed(1)} kts. Keep route inside the Safe Corridor.`;
    } else {
      headline = `SAFE: Conditions remain favorable for trip departing at ${depTimeStr}.`;
      narrative = `Conditions are calm with ${baseWind} kts wind. Fuel level at ${params.fuelLevelPercent}% is plenty for a ${baseDecision.pfzDistanceNm} NM round trip.`;
    }

    const updatedSchedule: ScheduleMilestone[] = [
      { time: depTimeStr, label: 'Depart', subtext: 'Simulated', type: 'depart', status: updatedSafety === 'UNSAFE' ? 'critical' : 'safe' },
      { time: '08:20 AM', label: 'High Tide', subtext: 'Max Depth', type: 'tide', status: 'safe' },
      { time: returnTimeStr, label: 'Head Back', subtext: `Wind ${baseWind}kts`, type: 'return', status: updatedSafety === 'UNSAFE' ? 'critical' : 'caution' },
      { time: '12:15 PM', label: 'Harbor', subtext: 'Port Entry', type: 'harbor', status: updatedSafety === 'UNSAFE' ? 'critical' : 'safe' }
    ];

    return {
      ...baseDecision,
      id: `sim-${Date.now()}`,
      safetyLevel: updatedSafety,
      headline,
      narrative,
      recommendedDepartureTime: depTimeStr,
      recommendedReturnTime: returnTimeStr,
      windSpeedKts: baseWind,
      schedule: updatedSchedule,
      confidenceScore: updatedSafety === 'UNSAFE' ? 78 : 92,
      agentTraces: this.generateAgentTraces(updatedSafety, updatedSafety === 'UNSAFE' ? 78 : 92),
      timestamp: `Simulated at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    };
  }

  private static generateAgentTraces(safety: SafetyLevel, confidence: number): AgentTrace[] {
    return [
      {
        agentName: 'Planner Agent',
        role: 'Schedule synthesis & fuel margin engine',
        status: safety === 'UNSAFE' ? 'CAUTION' : 'COMPLETED',
        confidenceScore: confidence,
        summary: safety === 'UNSAFE'
          ? 'Flagged safety margin violation: Return buffer under 20 minutes.'
          : 'Validated departure window and fuel reserve threshold.',
        rawInputs: { safetyLevel: safety },
        timestamp: 'Just now'
      },
      {
        agentName: 'Weather Agent',
        role: 'Wind vector & wave height forecaster',
        status: safety === 'UNSAFE' ? 'CAUTION' : 'COMPLETED',
        confidenceScore: confidence - 2,
        summary: 'Cross-analyzed IMD Doppler radar and ECMWF wind vectors.',
        rawInputs: { radarSync: true },
        timestamp: 'Just now'
      },
      {
        agentName: 'Ocean Agent',
        role: 'INCOIS ERDDAP SST & Chlorophyll monitor',
        status: 'COMPLETED',
        confidenceScore: 95,
        summary: 'Chlorophyll-a density 1.85 mg/m³ confirmed at PFZ Alpha.',
        rawInputs: { erddapSync: true },
        timestamp: 'Just now'
      },
      {
        agentName: 'Fisheries/PFZ Agent',
        role: 'Catch yield estimator',
        status: 'COMPLETED',
        confidenceScore: 92,
        summary: 'Target pelagic species shoal density verified high.',
        rawInputs: { species: 'Sardinella/Mackerel' },
        timestamp: 'Just now'
      },
      {
        agentName: 'Geo/Safety Agent',
        role: 'IMBL boundary & safe corridor geofencer',
        status: safety === 'UNSAFE' ? 'CAUTION' : 'COMPLETED',
        confidenceScore: 98,
        summary: 'Active buffer margin calculated at 2.4 NM from international boundary.',
        rawInputs: { bufferNm: 2.4 },
        timestamp: 'Just now'
      }
    ];
  }
}
