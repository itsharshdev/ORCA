export const ORCA_TYPES_VERSION = '1.0';

export type SafetyLevel = 'SAFE' | 'CAUTION' | 'UNSAFE';

export type ConnectivityState = 'CONNECTED' | 'DEGRADED' | 'OFFLINE';

export type SupportedLanguage = 'en' | 'ta' | 'te' | 'ml' | 'gu' | 'bn' | 'hi';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export interface VesselProfile {
  id: string;
  name: string;
  registrationNumber: string;
  type: string;
  lengthMeters: number;
  engineHp: number;
  fuelCapacityLiters: number;
  fuelCurrentLiters: number;
  fuelConsumptionRateLph: number;
  maxSpeedKts: number;
  cruiseSpeedKts: number;
  homePort: string;
  gearType: string;
  crewCount: number;
  maxRangeNm: number;
  isGpsActive: boolean;
  gpsAccuracyMeters: number;
  lat: number;
  lng: number;
}

export interface ScheduleMilestone {
  time: string;
  label: string;
  subtext: string;
  type: 'depart' | 'tide' | 'return' | 'harbor';
  status: 'safe' | 'caution' | 'critical';
}

export interface AgentTrace {
  agentName: 'Planner Agent' | 'Ocean Agent' | 'Weather Agent' | 'Fisheries/PFZ Agent' | 'Geo/Safety Agent';
  role: string;
  status: 'COMPLETED' | 'RUNNING' | 'CAUTION';
  confidenceScore: number;
  summary: string;
  rawInputs: Record<string, string | number | boolean>;
  timestamp: string;
}

export interface DecisionCardData {
  id: string;
  question: string;
  safetyLevel: SafetyLevel;
  headline: string;
  subtext: string;
  narrative: string;
  locationName: string;
  targetSectorId?: string;
  safeReturnWindow: string;
  recommendedDepartureTime: string;
  recommendedReturnTime: string;
  windSpeedKts: number;
  windDirection: string;
  waveHeightMeters: number;
  seaState: string;
  pfzDistanceNm: number;
  targetSpecies: string[];
  schedule: ScheduleMilestone[];
  agentTraces: AgentTrace[];
  telemetrySources: string[];
  crossSourceConflicts?: string[];
  whatIfSuggestions: string[];
  confidenceScore: number;
  timestamp: string;
}

export interface PfzSector {
  id: string;
  name: string;
  zoneCode: string;
  lat: number;
  lng: number;
  depthMeters: string;
  expectedSpecies: string[];
  density: 'High' | 'Medium' | 'Low';
  distanceNm: number;
  etaMinutes: number;
  safeUntilTime: string;
  sstCelsius: number;
  chlorophyllMgM3: number;
  validity: string;
}

export interface WeatherCondition {
  windSpeedKts: number;
  windDirection: string;
  waveHeightMeters: number;
  swellPeriodSec: number;
  visibilityKm: number;
  barometricHpa: number;
  tidePhase: string;
  nextHighTide: string;
  warningAlert?: string;
}

export interface SafetyAlert {
  id: string;
  type: 'BOUNDARY_GUARDIAN' | 'RETURN_WINDOW' | 'WEATHER_WARNING' | 'EQUIPMENT' | 'SYSTEM';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  location?: string;
  distanceToBoundaryNm?: number;
  recommendedAction: string;
  acknowledged: boolean;
}

export interface NewsAdvisory {
  id: string;
  type: 'PFZ_BULLETIN' | 'WEATHER_RADAR' | 'COAST_GUARD' | 'HARBOR_NOTICE';
  title: string;
  source: string;
  summary: string;
  timestamp: string;
  badge?: string;
  isUrgent?: boolean;
}

export interface TripPlan {
  id: string;
  destinationSector: PfzSector;
  vessel: VesselProfile;
  crewCount: number;
  gearType: string;
  departureTime: string;
  estimatedReturnTime: string;
  routeDistanceNm: number;
  fuelRequiredLiters: number;
  fuelReservePercentage: number;
  safeCorridorActive: boolean;
  imblBufferMarginNm: number;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ABORTED';
}

export interface WhatIfParams {
  departureDelayHours: number;
  windSpeedOffsetKts: number;
  enginePowerPercent: number;
  fuelLevelPercent: number;
  stayDurationHours: number;
}
