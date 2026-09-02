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
  timestamp?: string; // ISO string
  updatedAt?: string;
  validUntil?: string; // ISO string
  status: DataStatus;
  confidence?: number; // 0.0 - 1.0
  confidenceScore?: number;
  notes?: string;
  region?: string;
  isLive?: boolean;
  generatedAt?: string;
  disclaimer?: string;
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
  bearingDegrees?: number;
}

export interface HazardAlert extends DataSourceMetadata {
  id: string;
  title: string;
  severity: RiskLevel | string;
  hazardType: string;
  areaDescription: string;
  affectedCoordinates: [number, number][]; // [lat, lng] array
  advisoryAction: string;
  isActive: boolean;
}

export interface BoundaryZone {
  id: string;
  name: string;
  zoneType: 'restricted' | 'international_border' | 'marine_protected' | 'military' | 'safe_corridor' | string;
  severityOnIncursion: RiskLevel | string;
  coordinates: [number, number][][]; // Polygons
}

export interface VesselProfile {
  id: string;
  name: string;
  registrationNo?: string;
  vesselType: string;
  lengthMeters: number;
  beamMeters?: number;
  draftMeters?: number;
  engineHp?: number;
  maxWaveToleranceMeters: number;
  maxWindToleranceKnots?: number;
  cruisingSpeedKnots: number;
  fuelCapacityHours: number;
  crewCapacity?: number;
  homePort: GeoLocation;
  currentLocation: GeoLocation;
  currentHeadingDegrees: number;
}

export interface PfzDataset {
  metadata: DataSourceMetadata;
  zones: PFZRecord[];
}

export interface WeatherData {
  metadata: DataSourceMetadata;
  currentConditions: {
    location: GeoLocation;
    windSpeedKnots: number;
    windGustKnots: number;
    windDirection: string;
    windDirectionDegrees: number;
    waveHeightMeters: number;
    wavePeriodSeconds: number;
    airTemperatureCelsius: number;
    humidityPercent?: number;
    visibilityKm: number;
    seaState: string;
    cycloneAlert: boolean;
  };
  hourlyForecast: Array<{
    time: string;
    windSpeedKnots: number;
    windGustKnots: number;
    waveHeightMeters: number;
    riskLevel: string;
  }>;
}

export interface OceanographicData {
  metadata: DataSourceMetadata;
  parameters: {
    seaSurfaceTemperatureCelsius: number;
    sstAnomalyCelsius: number;
    chlorophyllConcentrationMgM3: number;
    chlorophyllGradient?: string;
    surfaceCurrentKnots: number;
    currentDirection: string;
    salinityPsu?: number;
    mixedLayerDepthMeters: number;
    upwellingIndex?: string;
  };
}

export interface HazardsDataset {
  metadata: DataSourceMetadata;
  alerts: HazardAlert[];
}

export interface VesselProfilesData {
  metadata: DataSourceMetadata;
  profiles: VesselProfile[];
}

export interface BoundaryFeatureCollection {
  type: 'FeatureCollection';
  metadata: DataSourceMetadata;
  features: Array<{
    type: 'Feature';
    id: string;
    geometry: {
      type: string;
      coordinates: any;
    };
    properties: {
      name: string;
      zoneType: string;
      restrictionDescription: string;
      severityOnIncursion: string;
      bufferDistanceMeters?: number;
    };
  }>;
}
