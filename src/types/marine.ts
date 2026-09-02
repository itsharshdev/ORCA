/**
 * ORCA — Marine Ecosystem Reasoning with Collaborative Agents
 * Foundational TypeScript definitions for marine intelligence, observations,
 * safety constraints, and decision support.
 */

export type DataStatus = 'demo_snapshot' | 'cached' | 'live' | 'degraded';

export type DecisionVerdict = 'GO' | 'CAUTION' | 'AVOID';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface DataSourceMetadata {
  source: string;
  sourceId?: string;
  timestamp: string; // ISO string
  validUntil?: string; // ISO string
  status: DataStatus;
  confidence?: number; // 0.0 - 1.0
  notes?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  name?: string;
  depthMeters?: number;
}

export interface MarineObservation extends DataSourceMetadata {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  location: GeoLocation;
}

export interface WeatherObservation extends DataSourceMetadata {
  location: GeoLocation;
  windSpeedKnots: number;
  windDirectionDegrees: number;
  waveHeightMeters: number;
  visibilityKm: number;
  airTemperatureCelsius: number;
  weatherCondition: string;
  lightningAlert: boolean;
  cycloneAlert: boolean;
}

export interface OceanObservation extends DataSourceMetadata {
  location: GeoLocation;
  seaSurfaceTemperatureCelsius: number;
  chlorophyllMgM3: number;
  salinityPsu?: number;
  surfaceCurrentSpeedKnots: number;
  currentDirectionDegrees: number;
  tideLevelMeters?: number;
}

export interface PFZRecord extends DataSourceMetadata {
  id: string;
  zoneName: string;
  location: GeoLocation;
  potentialScore: 'high' | 'moderate' | 'low';
  chlorophyllIndicator: string;
  sstIndicator: string;
  recommendedFishTypes?: string[];
  distanceKmFromPort?: number;
}

export interface HazardAlert extends DataSourceMetadata {
  id: string;
  title: string;
  severity: RiskLevel;
  hazardType: 'weather' | 'wave' | 'boundary' | 'cyclone' | 'military' | 'shallow_water';
  areaDescription: string;
  affectedCoordinates: [number, number][]; // [lat, lng] array
  advisoryAction: string;
  isActive: boolean;
}

export interface BoundaryZone {
  id: string;
  name: string;
  zoneType: 'restricted' | 'international_border' | 'marine_protected' | 'military' | 'safe_corridor';
  severityOnIncursion: RiskLevel;
  coordinates: [number, number][][]; // Polygons
}

export interface VesselProfile {
  id: string;
  name: string;
  lengthMeters: number;
  vesselType: 'traditional_motorized' | 'small_mechanized' | 'artisanal_canoe';
  maxWaveToleranceMeters: number;
  maxWindToleranceKnots: number;
  cruisingSpeedKnots: number;
  fuelCapacityHours: number;
  homePort: GeoLocation;
  currentLocation: GeoLocation;
  currentHeadingDegrees: number;
}

export interface DecisionFactor {
  category: 'weather' | 'ocean' | 'fisheries' | 'geofence' | 'vessel' | 'mission';
  name: string;
  value: string | number;
  assessment: 'favorable' | 'cautionary' | 'adverse';
  impactOnDecision: string;
  source: string;
}

export interface DecisionResult {
  id: string;
  createdAt: string;
  verdict: DecisionVerdict;
  recommendedDepartureTime?: string;
  recommendedReturnTime?: string;
  recommendedZoneId?: string;
  summaryExplanation: string;
  overallConfidence: number; // 0.0 - 1.0
  factors: DecisionFactor[];
  safetyOverrideApplied: boolean;
  dataFreshness: DataStatus;
}
