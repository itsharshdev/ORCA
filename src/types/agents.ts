import type { DataStatus } from './marine';

export type AgentId = 'planner' | 'ocean' | 'weather' | 'pfz' | 'geoSafety';

export type AgentExecutionStatus = 'idle' | 'queued' | 'running' | 'completed' | 'failed' | 'degraded';

export interface AgentEvidenceItem {
  key: string;
  label: string;
  value: string | number;
  impact: 'positive' | 'cautionary' | 'adverse' | 'neutral';
  provenance: {
    source: string;
    timestamp: string;
    status: DataStatus;
  };
}

export interface BaseAgentResult<T = Record<string, any>> {
  agentId: AgentId;
  agentName: string;
  role: string;
  status: AgentExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  summary: string;
  data: T;
  evidence: AgentEvidenceItem[];
  confidence: number;
  sourceStatus: DataStatus;
  error?: string;
}

// 1. Planner Agent Output
export interface PlannerOutput {
  intent: string;
  activity: 'fishing' | 'survey' | 'patrol';
  requestedPeriod: string;
  departureTime: string;
  durationHours: number;
  locationContext: string;
  vesselRequired: boolean;
  assignedTasks: AgentId[];
}

// 2. Ocean Agent Output
export interface OceanAnalysisOutput {
  seaSurfaceTemperatureCelsius: number;
  sstAnomalyCelsius: number;
  surfaceCurrentSpeedKnots: number;
  surfaceCurrentDirection: string;
  mixedLayerDepthMeters: number;
  thermoclineDepthMeters: number;
  chlorophyllConcentrationMgM3: number;
  waveSwellMeters: number;
  oceanRiskLevel: 'low' | 'moderate' | 'high';
  favorableFishingConditions: boolean;
}

// 3. Weather Agent Output
export interface WeatherAnalysisOutput {
  windSpeedKnots: number;
  windGustKnots: number;
  windDirection: string;
  waveHeightMeters: number;
  wavePeriodSeconds: number;
  visibilityKm: number;
  airTemperatureCelsius: number;
  atmosphericPressureHpa: number;
  precipitationProbabilityPercent: number;
  activeAdvisories: string[];
  weatherRiskLevel: 'low' | 'moderate' | 'high';
}

// 4. PFZ Agent Output
export interface PfzAnalysisOutput {
  topCandidateZoneId: string;
  topCandidateZoneName: string;
  opportunityLevel: 'high' | 'moderate' | 'low';
  distanceKm: number;
  bearingDegrees: number;
  targetFishTypes: string[];
  chlorophyllIndicator: string;
  sstIndicator: string;
  totalZonesEvaluated: number;
}

// 5. Geo / Safety Agent Output
export interface GeoSafetyAnalysisOutput {
  boundaryStatus: 'clear' | 'warning' | 'restricted';
  nearestGeofenceName: string;
  geofenceClearanceKm: number;
  incursionRisk: 'none' | 'moderate' | 'high';
  activeHazardsCount: number;
  hazardsSummary: string[];
  safeCorridorVerified: boolean;
}

export type PlannerResult = BaseAgentResult<PlannerOutput>;
export type OceanResult = BaseAgentResult<OceanAnalysisOutput>;
export type WeatherResult = BaseAgentResult<WeatherAnalysisOutput>;
export type PfzResult = BaseAgentResult<PfzAnalysisOutput>;
export type GeoSafetyResult = BaseAgentResult<GeoSafetyAnalysisOutput>;

export interface OrchestrationPackage {
  orchestrationId: string;
  requestedQuery: string;
  timestamp: string;
  executionTimeMs: number;
  analysisStatus: 'idle' | 'running' | 'ready' | 'degraded' | 'failed';
  planner: PlannerResult;
  ocean: OceanResult;
  weather: WeatherResult;
  pfz: PfzResult;
  geoSafety: GeoSafetyResult;
}
