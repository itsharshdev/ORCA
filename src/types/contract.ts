/**
 * ORCA — Core API Contract & Shared Domain Types
 * Phase 2 — Contract First
 * 
 * Defines the stable interface between the frontend application,
 * the backend API, the multi-agent orchestration layer, and database schemas.
 */

// ============================================================================
// 1. DATA ENVELOPE & STATUS ENUMS
// ============================================================================

/**
 * Lifecycle and verification status of any ingested or served data payload.
 */
export type DataStatus =
  | 'LIVE'           // Real-time live feed directly from source
  | 'INTEGRATED'     // Live multi-source correlated dataset
  | 'DEMO_SNAPSHOT'  // Static deterministic sample snapshot
  | 'CACHED'         // Valid cached copy within acceptable freshness TTL
  | 'STALE'          // Expired cache beyond validity window (warning status)
  | 'UNAVAILABLE';   // Source unreachable or feed missing

/**
 * Standard metadata header accompanying data records and agent observations.
 */
export interface DataProvenanceMeta {
  source: string;              // e.g. "INCOIS_PFZ_ADVISORY", "IMD_WEATHER_RADAR", "MOSDAC_SST"
  datasetName?: string;        // Specific sub-dataset or model identifier
  observedAt: string;          // ISO 8601 UTC timestamp of observation
  retrievedAt: string;         // ISO 8601 UTC timestamp when ORCA ingested the datum
  validUntil?: string | null;  // ISO 8601 UTC expiration timestamp
  status: DataStatus;          // Data verification state
  qualityLevel?: 'HIGH' | 'MEDIUM' | 'LOW' | 'DEGRADED';
  spatialRelevanceKm?: number; // Distance in km from query centroid
  temporalLatencyMinutes?: number; // Elapsed minutes between observation and retrieval
}

// ============================================================================
// 2. ROLES & ACTORS
// ============================================================================

export type UserRole =
  | 'FISHERMAN'          // Artisanal & commercial vessel operators
  | 'COASTAL_AUTHORITY'  // Coast Guard, Port Authorities, Fisheries Dept
  | 'DISASTER_MANAGER'   // State/National Disaster Management Authorities (NDRF/SDMA)
  | 'RESEARCHER'         // Oceanographers, Marine Ecologists, INCOIS/ISRO analysts
  | 'MARITIME_OPERATOR'; // Commercial tugs, passenger ferries, coastal survey

export interface UserProfile {
  id: string;                  // Unique UUID
  email: string;
  fullName: string;
  role: UserRole;
  harborId?: string | null;
  harborName?: string | null;
  assignedVesselIds?: string[];
  preferredLanguage: 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'gu';
  createdAt: string;           // ISO 8601 UTC
  updatedAt: string;           // ISO 8601 UTC
}

// ============================================================================
// 3. VESSEL ASSET PROFILE
// ============================================================================

export type VesselType =
  | 'TRADITIONAL_MOTORIZED' // Outboard/inboard wooden/FRP craft (6-10m)
  | 'SMALL_MECHANIZED'      // Trawler / gillnetter (10-18m)
  | 'DEEP_SEA_COMMERCIAL'   // Multi-day pelagic vessel (>18m)
  | 'PATROL_SURVEY';        // High-speed coastal craft

export interface GeoPoint {
  latitude: number;   // WGS84 Decimal degrees (-90.0 to 90.0)
  longitude: number;  // WGS84 Decimal degrees (-180.0 to 180.0)
  depthMeters?: number | null;
  name?: string | null;
}

export interface VesselContract {
  id: string;                       // e.g. "VESSEL-001" or UUID
  ownerId: string;
  name: string;
  registrationNumber: string;       // e.g. "IND-MH-02-MM-849"
  vesselType: VesselType;
  lengthMeters: number;             // Length overall (LOA) in meters
  beamMeters: number;               // Width in meters
  draftMeters: number;              // Submerged depth in meters
  engineHp: number;                 // Brake horsepower
  maxWaveToleranceMeters: number;   // Hard physical safety limit for significant wave height
  maxWindToleranceKnots: number;    // Hard physical safety limit for sustained wind
  cruisingSpeedKnots: number;       // Average transit velocity
  fuelCapacityHours: number;        // Maximum operational range at cruising speed
  crewCapacity: number;
  homePort: GeoPoint;
  currentLocation: GeoPoint;
  currentHeadingDegrees: number;    // 0 to 360 degrees
  updatedAt: string;                // ISO 8601 UTC
}

// ============================================================================
// 4. OBSERVATIONS & TELEMETRY
// ============================================================================

export interface WeatherObservationContract {
  location: GeoPoint;
  windSpeedKnots: number;
  windGustKnots: number;
  windDirectionDegrees: number;     // 0 to 360 degrees
  windDirectionCompass: string;     // e.g. "WNW", "SSE"
  waveHeightMeters: number;         // Significant wave height (Hs)
  wavePeriodSeconds: number;        // Peak wave period (Tp)
  visibilityKm: number;
  airTemperatureCelsius: number;
  atmosphericPressureHpa: number;
  precipitationProbabilityPct: number;
  weatherConditionText: string;
  cycloneAlertActive: boolean;
  squallWarningActive: boolean;
  provenance: DataProvenanceMeta;
}

export interface OceanObservationContract {
  location: GeoPoint;
  seaSurfaceTemperatureCelsius: number; // SST in °C
  sstAnomalyCelsius: number;            // Anomaly relative to climatological mean
  chlorophyllMgM3: number;              // Chlorophyll-a concentration
  chlorophyllFrontDetected: boolean;
  surfaceCurrentSpeedKnots: number;
  surfaceCurrentDirectionDegrees: number;
  mixedLayerDepthMeters: number;
  thermoclineDepthMeters: number;
  salinityPsu?: number | null;
  upwellingIndicator?: 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE';
  provenance: DataProvenanceMeta;
}

export interface PfzZoneContract {
  id: string;                           // e.g. "PFZ-MUM-01"
  zoneName: string;
  centroid: GeoPoint;
  potentialScore: 'HIGH' | 'MODERATE' | 'LOW';
  chlorophyllIndicator: string;
  sstIndicator: string;
  distanceKmFromPort: number;
  bearingDegreesFromPort: number;
  recommendedFishTypes: string[];
  depthEnvelopeMeters: {
    min: number;
    max: number;
  };
  provenance: DataProvenanceMeta;
}

// ============================================================================
// 5. MARITIME BOUNDARIES & HAZARD ALERTS
// ============================================================================

export type ZoneType =
  | 'RESTRICTED_MILITARY'
  | 'PORT_SECURITY_ANCHORAGE'
  | 'MARINE_PROTECTED_SANCTUARY'
  | 'INTERNATIONAL_MARITIME_BOUNDARY'
  | 'SAFE_CORRIDOR';

export interface BoundaryFeatureContract {
  id: string;                           // e.g. "GEO-RESTRICTED-01"
  name: string;
  zoneType: ZoneType;
  severityOnIncursion: 'CRITICAL' | 'HIGH' | 'MODERATE';
  restrictionDescription: string;
  bufferDistanceMeters: number;         // Mandatory buffer zone (e.g. 500m)
  coordinates: number[][][];            // GeoJSON Polygon coordinates [[lng, lat], ...]
  provenance: DataProvenanceMeta;
}

export interface HazardAlertContract {
  id: string;                           // e.g. "HAZ-2026-0902-01"
  title: string;
  hazardType: 'SQUALL' | 'CYCLONE' | 'SHALLOW_SHOAL' | 'HIGH_WAVE_SWELL' | 'MILITARY_EXERCISE';
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  areaDescription: string;
  affectedCoordinates: [number, number][]; // Polygon/Point array [lat, lng]
  advisoryAction: string;               // Mandatory operator advisory
  isActive: boolean;
  provenance: DataProvenanceMeta;
}

// ============================================================================
// 6. EVIDENCE & PROVENANCE
// ============================================================================

export interface EvidenceRecord {
  id: string;                           // Unique evidence UUID
  key: string;                          // Normalized machine key, e.g. "sst_thermal_front"
  label: string;                        // Human-readable title
  parameter: string;                    // Observation parameter name
  observedValue: string | number;       // Exact reading e.g. "27.8°C", "1.4m"
  unit?: string | null;                 // Unit of measurement
  impact: 'POSITIVE' | 'CAUTIONARY' | 'ADVERSE' | 'NEUTRAL';
  decisionRole: string;                 // Explanation of role in decision logic
  provenance: DataProvenanceMeta;
}

// ============================================================================
// 7. SPECIALIST AGENT RESULT
// ============================================================================

export type AgentDomainId = 'PLANNER' | 'OCEANOGRAPHY' | 'METEOROLOGY' | 'PFZ_FISHERIES' | 'GEO_SAFETY';

export type AgentExecutionStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'DEGRADED';

export interface BaseAgentResponse<T = Record<string, unknown>> {
  agentId: AgentDomainId;
  agentName: string;
  role: string;
  status: AgentExecutionStatus;
  startedAt: string;                    // ISO 8601 UTC
  completedAt: string;                  // ISO 8601 UTC
  executionDurationMs: number;
  summary: string;
  confidenceScore: number;              // 0 to 100
  data: T;
  evidence: EvidenceRecord[];
  warnings: string[];
  provenanceStatus: DataStatus;
  error?: string | null;
}

// ============================================================================
// 8. DETERMINISTIC DECISION ENGINE
// ============================================================================

/**
 * STRICT REQUIREMENT: The four immutable decision states of ORCA.
 */
export type DecisionVerdict =
  | 'GO'                 // All safety constraints clear, high/moderate utility
  | 'CAUTION'            // Feasible with strict temporal/spatial advisory
  | 'AVOID'              // Safety override or physical limit violation (Prohibited)
  | 'INSUFFICIENT_DATA'; // Missing critical observation data; safety cannot be assured

export interface RuleEvaluationContract {
  ruleId: string;                       // e.g. "RULE_01_SEVERE_OFFICIAL_WARNING"
  ruleName: string;
  category:
    | 'SAFETY_OVERRIDE'
    | 'PHYSICAL_CONSTRAINT'
    | 'TEMPORAL_EXPOSURE'
    | 'OPPORTUNITY_OPTIMIZATION'
    | 'DATA_QUALITY_GATE';
  verdictImpact: 'PASS' | 'CAUTION' | 'AVOID' | 'INSUFFICIENT_DATA';
  reason: string;
  evidenceRef: string;
  deterministicScore: number;           // 0 (Worst) to 100 (Best)
}

export interface DecisionConfidenceMeta {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;                        // Deterministic algorithm confidence (60.0 - 98.0%)
  reasons: string[];                    // Transparent explanation of score factors
}

export interface DecisionContract {
  decisionId: string;                   // e.g. "DEC-20260902-001" or UUID
  verdict: DecisionVerdict;
  confidence: DecisionConfidenceMeta;
  primaryDriver: string;                // The decisive rule trigger
  explanation: string;                  // Plain-language synthesis for operator
  recommendedDeparture: string;         // ISO 8601 or formatted local time
  recommendedReturn: string;            // ISO 8601 or formatted local time
  recommendedZone?: {
    id: string;
    name: string;
    distanceKm: number;
    bearingDegrees: number;
    opportunityLevel: 'HIGH' | 'MODERATE' | 'LOW';
  } | null;
  ruleEvaluations: RuleEvaluationContract[];
  safetyOverridesTriggered: string[];
  positiveFactors: string[];
  riskFactors: string[];
  dataQuality: {
    status: DataStatus;
    requiredSources: number;
    availableSources: number;
    staleSources: number;
    completenessScore: number;          // 0 to 100%
  };
  evaluatedAt: string;                  // ISO 8601 UTC
}

// ============================================================================
// 9. MAP LAYER CONTRACT
// ============================================================================

export interface MapLayersStateContract {
  userLocation: boolean;
  vessel: boolean;
  pfzZones: boolean;
  weatherRisk: boolean;
  hazards: boolean;
  boundaries: boolean;
  recommendedRoute: boolean;
  safeCorridor: boolean;
  riskAreas: boolean;
}

export interface MapSnapshotResponse {
  sectorId: string;
  sectorName: string;
  seaBody: string;
  mapCenter: [number, number];          // [lat, lng]
  defaultZoom: number;
  vessels: VesselContract[];
  pfzZones: PfzZoneContract[];
  hazards: HazardAlertContract[];
  boundaries: BoundaryFeatureContract[];
  weatherSnapshot: WeatherObservationContract;
  oceanSnapshot: OceanObservationContract;
  recommendedRouteGeoJson?: {
    type: 'Feature';
    geometry: {
      type: 'LineString';
      coordinates: [number, number][];  // [[lng, lat], ...]
    };
    properties: Record<string, unknown>;
  } | null;
  dataStatus: DataStatus;
  updatedAt: string;                    // ISO 8601 UTC
}

// ============================================================================
// 10. SYSTEM CONNECTIVITY & HEALTH
// ============================================================================

export interface ConnectivityStateContract {
  isOnline: boolean;
  networkType?: 'COASTAL_MESH' | '4G_CELLULAR' | 'SATELLITE_NAVIX' | 'OFFLINE_LOCAL';
  backendConnected: boolean;
  databaseConnected: boolean;
  activeDataFeedStatus: {
    incoisPfz: DataStatus;
    imdWeather: DataStatus;
    mosdacOcean: DataStatus;
    coastGuardAlerts: DataStatus;
  };
  lastSyncedAt: string;                 // ISO 8601 UTC
}

// ============================================================================
// 11. ENDPOINT REQUEST & RESPONSE PAYLOADS
// ============================================================================

/**
 * GET /health
 */
export interface HealthResponse {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  version: string;
  timestamp: string;
  services: {
    apiServer: boolean;
    database: boolean;
    dataIngestionScheduler: boolean;
    agentOrchestrator: boolean;
  };
  environment: 'development' | 'staging' | 'production' | 'demo';
}

/**
 * GET /me
 */
export interface MeResponse {
  user: UserProfile;
  activeVessel?: VesselContract | null;
  assignedHarbor?: GeoPoint | null;
  permissions: string[];
}

/**
 * POST /orca/query
 * Core orchestrator inquiry endpoint.
 */
export interface OrcaQueryRequest {
  queryText?: string;                   // Natural-language query string
  structuredMission?: {
    activity: 'FISHING' | 'SURVEY' | 'PATROL';
    vesselId?: string;
    targetZoneId?: string;
    departureTime?: string;             // ISO 8601 or local "HH:mm"
    durationHours?: number;
    sectorId?: string;
    mustReturnBeforeSunset?: boolean;
  };
  regionId?: string;                    // e.g. "maharashtra" | "tamil_nadu"
  operatorLocation?: GeoPoint;
}

export interface OrcaQueryResponse {
  queryId: string;                      // Query UUID for audit tracing
  timestamp: string;                    // ISO 8601 UTC
  executionTimeMs: number;
  parsedIntent: {
    activity: 'FISHING' | 'SURVEY' | 'PATROL';
    departureTime: string;
    durationHours: number;
    locationContext: string;
    vesselId: string;
  };
  agentTrace: {
    planner: BaseAgentResponse;
    oceanography: BaseAgentResponse;
    meteorology: BaseAgentResponse;
    pfzFisheries: BaseAgentResponse;
    geoSafety: BaseAgentResponse;
  };
  decision: DecisionContract;
  evidence: EvidenceRecord[];
  mapContext: {
    sectorId: string;
    centerCoordinates: [number, number];
    recommendedRouteCoordinates: [number, number][];
    activeWarningCount: number;
  };
}

/**
 * GET /decisions/{id}
 */
export interface DecisionDetailResponse {
  decision: DecisionContract;
  missionContext: {
    queryId?: string;
    vessel: VesselContract;
    activity: string;
    departureTime: string;
    durationHours: number;
    targetZoneName?: string;
  };
  fullEvidenceLog: EvidenceRecord[];
  replayedAt?: string | null;
}

// ============================================================================
// 12. STANDARDIZED API ERROR ENVELOPE
// ============================================================================

export type ApiErrorCode =
  | 'UNAUTHENTICATED'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'SOURCE_UNAVAILABLE'
  | 'INSUFFICIENT_OBSERVATION_DATA'
  | 'ORCHESTRATION_TIMEOUT'
  | 'INTERNAL_SERVER_ERROR';

export interface ApiErrorEnvelope {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown> | null;
    requestId: string;
    timestamp: string;                  // ISO 8601 UTC
  };
}
