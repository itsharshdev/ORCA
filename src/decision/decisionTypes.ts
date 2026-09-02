import type { 
  PlannerResult, 
  OceanResult, 
  WeatherResult, 
  PfzResult, 
  GeoSafetyResult 
} from '@/types/agents';
import type { VesselProfile, DataStatus, DecisionVerdict } from '@/types/marine';

export type { DecisionVerdict };

export type RuleId = 
  | 'RULE_01_SEVERE_OFFICIAL_WARNING'
  | 'RULE_02_HARD_GEOFENCE_CONFLICT'
  | 'RULE_03_VESSEL_WAVE_TOLERANCE'
  | 'RULE_04_TEMPORAL_RETURN_WINDOW'
  | 'RULE_05_MODERATE_WEATHER_OCEAN_RISK'
  | 'RULE_06_PFZ_OPPORTUNITY_OPTIMIZATION'
  | 'RULE_07_DATA_QUALITY_GATE';

export interface RuleEvaluation {
  ruleId: RuleId;
  ruleName: string;
  category: 'safety_override' | 'physical_constraint' | 'temporal_exposure' | 'opportunity_optimization' | 'data_quality';
  verdictImpact: 'PASS' | 'CAUTION' | 'AVOID';
  reason: string;
  evidenceRef: string;
  deterministicScore: number; // 0 (Worst) to 100 (Best)
}

export interface DecisionMissionContext {
  activity: 'fishing' | 'survey' | 'patrol';
  departureTime: string;
  durationHours: number;
  expectedReturnTime: string;
  regionId: string;
}

export interface DecisionInput {
  mission: DecisionMissionContext;
  planner: PlannerResult;
  ocean: OceanResult;
  weather: WeatherResult;
  pfz: PfzResult;
  geoSafety: GeoSafetyResult;
  vessel: VesselProfile;
}

export interface DecisionResult {
  verdict: DecisionVerdict;
  confidenceScore: number;
  primaryDriver: string;
  explanation: string;
  recommendedDeparture: string;
  recommendedReturn: string;
  recommendedZone: {
    id: string;
    name: string;
    distanceKm: number;
    bearing: number;
    opportunity: string;
  };
  ruleEvaluations: RuleEvaluation[];
  safetyOverridesTriggered: string[];
  positiveFactors: string[];
  riskFactors: string[];
  dataQuality: {
    status: DataStatus;
    completenessScore: number;
    evaluatedSourcesCount: number;
    totalRequiredSources: number;
  };
  evaluatedAt: string;
}
