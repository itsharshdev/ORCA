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
    regionId?: string;
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

// ============================================================================
// 13. OBSERVATIONS & INGESTION CONTRACT (Phase 7)
// ============================================================================

export type ObservationCategory = 'OCEAN' | 'WEATHER' | 'PFZ' | 'GEO_SAFETY' | 'VESSEL_TRAFFIC' | 'HAZARD';

export interface NormalizedObservationContract {
  id: string;
  source_id?: string | null;
  dataset_identifier: string;
  category: ObservationCategory;
  variable_name: string;
  numeric_value?: number | null;
  unit?: string | null;
  structured_value: Record<string, unknown>;
  location?: unknown;
  observed_at: string;
  retrieved_at: string;
  valid_until?: string | null;
  status: DataStatus | 'VERIFIED';
  quality_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'DEGRADED';
  uncertainty_range?: Record<string, unknown> | null;
  raw_metadata: Record<string, unknown>;
  created_at: string;
}

export interface ObservationsListResponse {
  success: boolean;
  count: number;
  total: number;
  limit: number;
  offset: number;
  filters: {
    category: ObservationCategory | null;
    dataset: string | null;
    variableName: string | null;
    region: string | null;
    status: string | null;
  };
  observations: NormalizedObservationContract[];
  timestamp: string;
}

// ============================================================================
// 10. GIS SAFETY EVALUATION CONTRACTS (Phase 11)
// ============================================================================

export type RestrictedZoneType = 
  | 'MARINE_PROTECTED_AREA'
  | 'MILITARY_DEFENCE_ZONE'
  | 'HIGH_COLLISION_CORRIDOR'
  | 'OFFSHORE_RIG_BUFFER'
  | 'WEATHER_HAZARD_ZONE'
  | 'INTERNATIONAL_BORDER_BUFFER';

export type RestrictedZoneSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'FORBIDDEN';

export interface RestrictedZoneRecord {
  id: string;
  source_id?: string | null;
  code: string;
  name: string;
  zone_type: RestrictedZoneType;
  severity: RestrictedZoneSeverity;
  status: 'ACTIVE' | 'INACTIVE' | 'SEASONAL' | 'DEMO_TEST';
  effective_from?: string | null;
  effective_until?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type GisSafetyStatus = 'CLEAR' | 'CAUTION' | 'RESTRICTED' | 'HAZARD' | 'INSUFFICIENT_SPATIAL_DATA';

export interface RouteWaypointInput {
  latitude: number;
  longitude: number;
  sequenceOrder?: number;
  waypointType?: string;
  label?: string;
}

export interface RouteEvaluationRequest {
  missionId?: string;
  vesselId?: string;
  vesselPosition?: GeoPoint;
  waypoints?: RouteWaypointInput[];
  projectedHeadingDegrees?: number;
  projectedSpeedKnots?: number;
  projectedDurationHours?: number;
  targetPfzUid?: string;
  safetyBufferKm?: number;
  cautionBufferKm?: number;
  region?: string;
}

export interface RestrictionEvaluationItem {
  zoneId: string;
  code: string;
  name: string;
  zoneType: string;
  severity: string;
  distanceKm: number;
  intersects: boolean;
  bufferBreached: boolean;
  description?: string;
}

export interface HazardEvaluationItem {
  alertId: string;
  title: string;
  alertType: string;
  severity: string;
  distanceKm: number;
  intersects: boolean;
  description?: string;
}

export interface RouteIntersectionItem {
  zoneName: string;
  zoneType: string;
  severity: string;
  segmentIndex: number;
  coordinates?: [number, number];
}

export interface GisSafetyEvaluationResponse {
  status: GisSafetyStatus;
  safetyClearance: boolean;
  overallVerdict: 'PASS' | 'CAUTION' | 'AVOID';
  summary: string;
  explanation: string;
  restrictions: RestrictionEvaluationItem[];
  hazards: HazardEvaluationItem[];
  proximityChecks: {
    nearestRestrictedZone?: {
      name: string;
      distanceKm: number;
      bufferKm: number;
      isBreached: boolean;
    };
    nearestHazardZone?: {
      name: string;
      distanceKm: number;
      isIntersecting: boolean;
    };
  };
  routeIntersections: RouteIntersectionItem[];
  projectedRouteChecks?: {
    projectedEndpoint?: [number, number];
    projectedDistanceKm?: number;
    intersectsRestricted: boolean;
    conflictingZoneName?: string;
  };
  opportunityConflict?: {
    targetPfzUid?: string;
    isTargetBlocked: boolean;
    conflictingReason?: string;
  };
  evaluatedAt: string;
  provenance: {
    engine: 'POSTGIS_SERVER' | 'TURF_DETERMINISTIC_FALLBACK' | 'CLIENT_OFFLINE_UNVERIFIED';
    evaluatedZonesCount: number;
    evaluatedHazardsCount: number;
    rulesEnforced: string[];
    isLiveSpatialData: boolean;
  };
}

// ============================================================================
// 17. PHASE 12: VESSEL CAPABILITY MODEL CONTRACTS
// ============================================================================

export type ThresholdProvenanceStatus = 
  | 'OFFICIAL_SOURCED'
  | 'VESSEL_SPECIFIC'
  | 'PROTOTYPE_ASSUMPTION'
  | 'UNKNOWN';

export interface ThresholdProvenanceMeta {
  status: ThresholdProvenanceStatus;
  source: string;
  officialReference?: string;
  notes?: string;
}

export interface VesselCapabilityContract {
  vesselId: string;
  name: string;
  registrationNumber?: string;
  vesselType: VesselType | string;
  lengthMeters: number;
  beamMeters: number;
  draftMeters: number;
  engineHp: number;
  operatingRangeNm: number;
  maxOperatingDistanceNm: number;
  enduranceHours: number;
  fuelCapacityLiters: number;
  fuelBurnRateLph: number;
  cruisingSpeedKnots: number;
  maxWaveToleranceMeters: number;
  maxWindToleranceKnots: number;
  minCrew: number;
  maxCrew: number;
  safetyEquipment: string[];
  capabilityProfileStatus: 'ACTIVE' | 'PENDING_SURVEY' | 'RESTRICTED' | 'INCOMPLETE';
  provenance: {
    wave: ThresholdProvenanceMeta;
    wind: ThresholdProvenanceMeta;
    range: ThresholdProvenanceMeta;
    endurance: ThresholdProvenanceMeta;
    fuel?: ThresholdProvenanceMeta;
    crew?: ThresholdProvenanceMeta;
    safetyEquipment?: ThresholdProvenanceMeta;
  };
  updatedAt: string;
}

export type CapabilityConstraintCategory =
  | 'RANGE'
  | 'DISTANCE_FROM_PORT'
  | 'ENDURANCE'
  | 'FUEL'
  | 'CREW'
  | 'WAVE'
  | 'WIND'
  | 'SAFETY_EQUIPMENT'
  | 'CERTIFICATION';

export type CapabilityConstraintStatus =
  | 'PASS'
  | 'CAUTION'
  | 'FAIL'
  | 'UNKNOWN'
  | 'NOT_APPLICABLE';

export interface ConstraintEvaluationItem {
  constraintId: string;
  category: CapabilityConstraintCategory;
  input: {
    name: string;
    value: number | string | boolean | string[] | null;
    unit?: string;
  };
  configuredLimit: {
    value: number | string | boolean | string[] | null;
    unit?: string;
  };
  actualValue: number | string | boolean | string[] | null;
  unit?: string;
  status: CapabilityConstraintStatus;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  reason: string;
  sourceStatus: ThresholdProvenanceStatus;
  sourceDescription?: string;
}

export interface CapabilityEvaluationRequest {
  vesselId?: string;
  vesselOverrides?: Partial<VesselCapabilityContract>;
  missionDistanceNm?: number;
  maxDistanceFromPortNm?: number;
  missionDurationHours?: number;
  plannedCrewCount?: number;
  environmentalContext?: {
    waveHeightMeters?: number;
    windSpeedKnots?: number;
    windGustKnots?: number;
    visibilityKm?: number;
    seaState?: string;
  };
  requiredEquipment?: string[];
}

export interface CapabilityEvaluationResponse {
  vesselId: string;
  vesselName: string;
  vesselType: string;
  evaluatedAt: string;
  allPassed: boolean;
  hasCriticalFailure: boolean;
  hasWarnings: boolean;
  evaluations: ConstraintEvaluationItem[];
  summary: {
    passedCount: number;
    cautionCount: number;
    failedCount: number;
    unknownCount: number;
    notApplicableCount: number;
  };
  provenance: {
    engine: string;
    rulesEvaluatedCount: number;
    thresholdBreakdown: {
      officialSourced: number;
      vesselSpecific: number;
      prototypeAssumption: number;
      unknown: number;
    };
  };
}

// ============================================================================
// 18. PHASE 13: DETERMINISTIC DECISION ENGINE V2 CONTRACTS
// ============================================================================

export type DecisionRuleSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type DeterministicRuleCategory =
  | 'WARNING'
  | 'GIS_SAFETY'
  | 'VESSEL_CAPABILITY'
  | 'OCEAN'
  | 'WEATHER'
  | 'TEMPORAL'
  | 'MISSION'
  | 'DATA_QUALITY'
  | 'OPPORTUNITY';

export type DeterministicRuleResult =
  | 'PASS'
  | 'CAUTION'
  | 'FAIL'
  | 'UNKNOWN'
  | 'NOT_APPLICABLE';

export interface DeterministicRuleEvaluation {
  ruleId: string;
  ruleName: string;
  category: DeterministicRuleCategory;
  input: Record<string, unknown>;
  threshold?: Record<string, unknown> | null;
  thresholdSource: ThresholdProvenanceStatus | string;
  result: DeterministicRuleResult;
  severity: DecisionRuleSeverity;
  reason: string;
  evidenceRef?: string;
}

export interface DecisionEvaluationRequest {
  missionId?: string;
  vesselId?: string;
  regionId?: string;
  departureTime?: string;
  durationHours?: number;
  targetZoneId?: string;
  originLocation?: { latitude: number; longitude: number };
  waypoints?: Array<{ latitude: number; longitude: number; sequenceOrder?: number; label?: string }>;
  environmentalContext?: {
    waveHeightMeters?: number;
    wavePeriodSeconds?: number;
    windSpeedKnots?: number;
    windGustKnots?: number;
    visibilityKm?: number;
    seaSurfaceTemperatureCelsius?: number;
    currentSpeedKnots?: number;
    activeWarnings?: Array<{
      alertId: string;
      severity: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'CRITICAL' | string;
      warningType: string;
      description: string;
      validFrom?: string;
      validUntil?: string;
    }>;
    observedAt?: string;
    validUntil?: string;
    isLive?: boolean;
  };
  requiredEquipment?: string[];
  vesselOverrides?: Partial<VesselCapabilityContract>;
  mustReturnBeforeSunset?: boolean;
}

// ============================================================================
// 12. PHASE 14: EVIDENCE, CONFIDENCE & CONFLICT HANDLING CONTRACTS
// ============================================================================

export type EvidenceCategory = 'SAFETY' | 'VESSEL' | 'OCEAN' | 'WEATHER' | 'GIS' | 'MISSION' | 'OPPORTUNITY';
export type SpatialRelevanceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_APPLICABLE';
export type TemporalRelevanceLevel = 'CURRENT' | 'VALID_FOR_MISSION' | 'PARTIALLY_VALID' | 'EXPIRED' | 'UNKNOWN';
export type DataQualityGrade = 'GOOD' | 'DEGRADED' | 'POOR' | 'UNKNOWN';
export type FreshnessState =
  | 'LIVE'
  | 'FRESH'
  | 'CACHED'
  | 'AGING'
  | 'STALE'
  | 'EXPIRED'
  | 'UNAVAILABLE'
  | 'ACCESS_PENDING'
  | 'DEMO'
  | 'DETERMINISTIC';
export type EvidenceDecisionImpact = 'POSITIVE' | 'NEUTRAL' | 'CAUTION' | 'CRITICAL_BLOCKER';
export type ConfidenceLevel = 'HIGH' | 'MODERATE' | 'LOW';

export interface SourceConflictRecord {
  conflictId: string;
  variable: string;
  sourceA: {
    source: string;
    dataset?: string;
    value: unknown;
    unit?: string | null;
    observedAt: string;
    quality: DataQualityGrade;
  };
  sourceB: {
    source: string;
    dataset?: string;
    value: unknown;
    unit?: string | null;
    observedAt: string;
    quality: DataQualityGrade;
  };
  discrepancyDescription: string;
  resolutionPolicy: 'PREFER_AUTHORITATIVE_SENSOR' | 'CONSERVATIVE_MAX_RISK' | 'UNRESOLVED_DOWNGRADE_CONFIDENCE';
  resolvedValue?: unknown;
  unresolved: boolean;
}

export interface AuditedEvidenceItem {
  evidenceId: string;
  category: EvidenceCategory;
  source: string;
  dataset: string;
  variable: string;
  value: string | number | boolean | string[] | Record<string, unknown>;
  unit?: string | null;
  geometry?: { type: string; coordinates: unknown } | null;
  observedAt: string;
  issuedAt?: string | null;
  validUntil?: string | null;
  retrievedAt: string;
  spatialRelevance: SpatialRelevanceLevel;
  spatialDistanceKm?: number | null;
  temporalRelevance: TemporalRelevanceLevel;
  quality: DataQualityGrade;
  status: FreshnessState;
  transformation?: string | null;
  ruleIds: string[];
  decisionImpact: EvidenceDecisionImpact;
  notes?: string;
}

export interface ExplainableDecisionConfidence {
  level: ConfidenceLevel;
  reasons: string[];
  missingRequiredEvidence: string[];
  unresolvedConflictsCount: number;
  staleEvidenceCount: number;
  freshEvidenceCount: number;
  totalEvidenceCount: number;
  completenessRatio: number;
}

export interface EvidenceGroupSummary {
  category: EvidenceCategory;
  label: string;
  count: number;
  status: FreshnessState;
  summary: string;
  items: AuditedEvidenceItem[];
}

export interface EvidenceSummary {
  totalCount: number;
  freshCount: number;
  staleCount: number;
  demoCount: number;
  accessPendingCount: number;
  conflictsCount: number;
  unresolvedConflictsCount: number;
  groups: EvidenceGroupSummary[];
}

export interface DecisionEvaluationResponse {
  decisionId: string;
  state: DecisionVerdict;
  verdict: DecisionVerdict;
  summary: string;
  explanation: string;
  primaryDriver: string;
  evaluatedAt: string;

  missionId?: string;
  vesselId?: string;
  vesselName?: string;

  recommendedDeparture: string;
  recommendedReturn: string;
  recommendedZone?: {
    id: string;
    name: string;
    distanceKm: number;
    bearingDegrees: number;
    opportunityLevel: 'HIGH' | 'MODERATE' | 'LOW';
  } | null;

  rules: DeterministicRuleEvaluation[];

  blockingFactors: string[];
  cautionFactors: string[];
  opportunityFactors: string[];

  confidence: ExplainableDecisionConfidence;
  evidence: AuditedEvidenceItem[];
  evidenceSummary: EvidenceSummary;
  conflicts: SourceConflictRecord[];

  dataStatus: {
    status: DataStatus;
    requiredSourcesCount: number;
    availableSourcesCount: number;
    staleSourcesCount: number;
    hasConflicts: boolean;
    conflictSummary?: string;
  };

  gisResult?: GisSafetyEvaluationResponse;
  vesselResult?: CapabilityEvaluationResponse;

  provenance: {
    engine: 'decision-engine-v2';
    version: '2.0.0';
    evaluatedAt: string;
    rulesEvaluatedCount: number;
    precedenceEnforced: string[];
  };
}

// ============================================================================
// PHASE 15: AGENTIC ORCHESTRATION & SPECIALIST COORDINATION
// ============================================================================

export type SpecialistType =
  | 'MISSION_PLANNER'
  | 'OCEANOGRAPHY'
  | 'METEOROLOGY'
  | 'PFZ_FISHERIES'
  | 'GEO_SAFETY'
  | 'VESSEL_CAPABILITY';

export type SpecialistStatus =
  | 'READY'
  | 'RUNNING'
  | 'COMPLETED'
  | 'DEGRADED'
  | 'FAILED'
  | 'UNAVAILABLE'
  | 'SKIPPED';

export interface SpecialistTaskResult<T = Record<string, unknown>> {
  taskId: string;
  specialist: SpecialistType;
  displayName: string;
  role: string;
  status: SpecialistStatus;
  startedAt: string;
  completedAt: string;
  executionDurationMs: number;
  sourceStatus: DataStatus;
  summary: string;
  data: T;
  evidence: AuditedEvidenceItem[];
  warnings: string[];
  errors?: string[];
  provenance: {
    adapter?: string;
    source: string;
    datasetName?: string;
    retrievedAt: string;
    isLive: boolean;
  };
}

export interface OrchestrationStep {
  stepNumber: number;
  stepName: string;
  specialist?: SpecialistType;
  description: string;
  durationMs: number;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface OrchestrationTrace {
  traceId: string;
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
  dependencyGraph: Record<string, string[]>;
  steps: OrchestrationStep[];
}

export interface OrchestratedDecisionResult {
  queryId: string;
  queryText?: string;
  evaluatedAt: string;
  orchestration: OrchestrationTrace;
  specialists: Record<SpecialistType, SpecialistTaskResult>;
  decision: DecisionEvaluationResponse;
  evidence: AuditedEvidenceItem[];
  confidence: ExplainableDecisionConfidence;
  provenance: {
    orchestratorVersion: string;
    decisionEngineVersion: string;
    timestamp: string;
  };
}

// ============================================================================
// 12. PHASE 16 — LLM INTELLIGENCE & NATURAL LANGUAGE REASONING LAYER
// ============================================================================

export type UserActivityType =
  | 'FISHING'
  | 'SURVEY'
  | 'PATROL'
  | 'TRANSIT'
  | 'UNKNOWN';

export type QuestionClassificationType =
  | 'FEASIBILITY'
  | 'SAFETY'
  | 'OPPORTUNITY'
  | 'EXPLANATION'
  | 'ROUTE'
  | 'CONDITIONS'
  | 'ALERT'
  | 'WHAT_IF'
  | 'GENERAL_INFORMATION'
  | 'UNKNOWN';

export type LlmProviderType =
  | 'GEMINI'
  | 'OPENAI'
  | 'MOCK'
  | 'DETERMINISTIC_FALLBACK';

export interface LlmStructuredIntent {
  intentId: string;
  rawQuery: string;
  activity: UserActivityType;
  questionType: QuestionClassificationType;
  location: {
    regionId: string;
    sectorName?: string;
    portName?: string;
    coordinates?: [number, number];
  };
  departureWindow: {
    timeString: string;
    isEstimated: boolean;
    requestedDate?: string;
  };
  durationHours: number;
  vessel: {
    vesselId?: string;
    vesselType?: string;
    isExplicit: boolean;
  };
  targetZoneId?: string | null;
  constraints: string[];
  requiresClarification: boolean;
  clarificationPrompts?: LlmClarificationPrompt[];
  confidenceScore: number;
  extractedEntities: Record<string, unknown>;
}

export interface LlmClarificationPrompt {
  promptId: string;
  fieldTargeted: string;
  question: string;
  suggestedOptions: string[];
}

export interface LlmExplanationResult {
  summary: string;
  detailedReasoning: string;
  actionableAdvisories: string[];
  citedEvidenceIds: string[];
  providerUsed: LlmProviderType;
  modelUsed: string;
  generatedAt: string;
  isFallback: boolean;
  tokensUsed?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface ConversationTurnRecord {
  turnId: string;
  timestamp: string;
  userQuery: string;
  structuredIntent: LlmStructuredIntent;
  verdict: DecisionVerdict;
  explanation: LlmExplanationResult;
}

export interface ServerConversationContext {
  conversationId: string;
  createdAt: string;
  updatedAt: string;
  role: 'FISHERMAN' | 'AUTHORITY' | 'DISASTER' | 'RESEARCHER' | 'OPERATOR';
  turns: ConversationTurnRecord[];
  activeMissionContext?: {
    regionId: string;
    activity: UserActivityType;
    departureTime: string;
    durationHours: number;
    vesselId: string;
    targetZoneId?: string | null;
  };
}

export interface Phase16OrcaQueryResponse extends OrcaQueryResponse {
  conversationId?: string;
  turnId?: string;
  llmIntent?: LlmStructuredIntent;
  llmExplanation?: LlmExplanationResult;
  clarifications?: LlmClarificationPrompt[];
  inheritedContext?: {
    wasContextInherited: boolean;
    inheritedFields: string[];
    previousVerdict?: DecisionVerdict;
  };
  shortAnswer?: string;
  primaryDriver?: string;
  actionableAdvice?: string[];
  intelligenceMode?: LlmProviderType;
  sourceStatus?: Record<string, string>;
}

export interface Phase17OrcaQueryResponse extends Phase16OrcaQueryResponse {
  productionPipelineVersion: string;
}

// ============================================================================
// 13. PHASE 18 — WHAT-IF / SCENARIO INTELLIGENCE CONTRACTS
// ============================================================================

export type ScenarioType =
  | 'TIME_CHANGE'
  | 'DURATION_CHANGE'
  | 'VESSEL_CHANGE'
  | 'ROUTE_CHANGE'
  | 'ENVIRONMENTAL_ASSUMPTION'
  | 'COMBINED_CHANGE'
  | 'CUSTOM';

export interface ScenarioAssumption {
  waveHeightMeters?: number;
  windSpeedKnots?: number;
  seaSurfaceTemperatureCelsius?: number;
  currentSpeedKnots?: number;
  notes?: string;
}

export interface ScenarioModificationInput {
  departureTime?: string;
  durationHours?: number;
  vesselId?: string;
  regionId?: string;
  activity?: UserActivityType;
  targetZoneId?: string | null;
  avoidRestrictedZones?: boolean;
  waypoints?: Array<{ latitude: number; longitude: number; name?: string | null; depthMeters?: number | null }>;
  assumptions?: ScenarioAssumption;
}

export interface ScenarioInputDelta {
  changedFields: string[];
  fieldDeltas: Record<
    string,
    {
      from: string | number | boolean;
      to: string | number | boolean;
      label: string;
    }
  >;
}

export interface ScenarioRuleDeltaItem {
  ruleId: string;
  ruleName: string;
  category: string;
  verdictImpact: 'PASS' | 'CAUTION' | 'AVOID' | 'INSUFFICIENT_DATA';
  reason: string;
}

export interface ScenarioRuleComparison {
  newlyTriggeredRules: ScenarioRuleDeltaItem[];
  noLongerTriggeredRules: ScenarioRuleDeltaItem[];
  persistingRules: ScenarioRuleDeltaItem[];
}

export interface ScenarioEvidenceComparison {
  newEvidence: AuditedEvidenceItem[];
  changedEvidence: Array<{
    variable: string;
    baselineValue: string | number;
    scenarioValue: string | number;
    unit?: string;
    impactDelta: string;
    isHypothetical: boolean;
  }>;
}

export interface ScenarioEvaluationRequest {
  baselineQueryId?: string;
  conversationId?: string;
  naturalLanguageScenario?: string;
  modifications?: ScenarioModificationInput;
  operatorRole?: 'FISHERMAN' | 'AUTHORITY' | 'DISASTER' | 'RESEARCHER' | 'OPERATOR';
  regionId?: string;
}

export interface ScenarioEvaluationResponse {
  scenarioId: string;
  scenarioType: ScenarioType;
  naturalLanguagePrompt?: string;
  baseline: {
    queryId?: string;
    verdict: DecisionVerdict;
    confidence: DecisionConfidenceMeta;
    primaryDriver: string;
    summary: string;
    departureTime: string;
    durationHours: number;
    vesselId: string;
    regionId: string;
  };
  scenario: {
    verdict: DecisionVerdict;
    confidence: DecisionConfidenceMeta;
    primaryDriver: string;
    summary: string;
    actionableAdvice: string[];
    departureTime: string;
    durationHours: number;
    vesselId: string;
    regionId: string;
  };
  delta: ScenarioInputDelta;
  ruleComparison: ScenarioRuleComparison;
  evidenceComparison: ScenarioEvidenceComparison;
  evidence: AuditedEvidenceItem[];
  verdictChangeReason: string;
  isHypotheticalAssumption: boolean;
  intelligenceMode: LlmProviderType;
  evaluatedAt: string;
}

// ============================================================================
// 19. PHASE 19 — ALERTS & DISASTER INTELLIGENCE DOMAIN MODEL
// ============================================================================

export type AlertCategory = 'WEATHER_MARINE' | 'GIS_SAFETY' | 'MISSION' | 'CONNECTIVITY';

export type AlertType =
  // WEATHER / MARINE
  | 'SEVERE_WEATHER_WARNING'
  | 'HIGH_WAVE_CONDITION'
  | 'HIGH_WIND_CONDITION'
  | 'CYCLONE_COASTAL_WARNING'
  // GIS / SAFETY
  | 'RESTRICTED_ZONE_INCURSION'
  | 'ROUTE_INTERSECTION'
  | 'VESSEL_LIMIT_BREACH'
  // MISSION
  | 'RETURN_WINDOW_RISK'
  | 'STALE_CRITICAL_DATA'
  | 'DEGRADED_DATA_COVERAGE'
  | 'MISSION_CONFLICT'
  // CONNECTIVITY
  | 'DEGRADED_CONNECTIVITY'
  | 'OFFLINE_STATE'
  | 'SAFETY_MESSAGE_RECEIVED'
  // Backwards compatibility legacy aliases
  | 'CYCLONE_WARNING'
  | 'HIGH_WAVE_SWELL'
  | 'GALE_WIND'
  | 'BORDER_PROXIMITY'
  | 'RESTRICTED_ZONE_BREACH'
  | 'COMMUNICATION_DROPOUT';

export type AlertSeverity = 'INFO' | 'ADVISORY' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'EXPIRED' | 'SUPPRESSED';

export interface AlertArea {
  name: string;
  coordinates?: [number, number][]; // Polygon [[lng, lat], ...]
  center?: [number, number]; // [lng, lat]
  radiusKm?: number;
  bufferMeters?: number;
}

export interface AlertAcknowledgement {
  acknowledgedAt: string;
  acknowledgedBy: string;
  role?: string;
  note?: string;
}

export interface AlertResolution {
  resolvedAt: string;
  resolvedBy: string;
  role?: string;
  note?: string;
}

export interface AlertProvenance {
  isLive: boolean;
  status: 'LIVE' | 'DEMO' | 'ACCESS_PENDING' | 'CACHED' | 'STALE' | 'VERIFIED';
  sourceReliability: 'OFFICIAL_TELEMETRY' | 'SATELLITE_MODEL' | 'INSTITUTIONAL_FALLBACK' | 'GEOSPATIAL_ENGINE';
  sourceName: string;
}

export interface AlertConfidence {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  explanation: string;
}

export interface AlertItem {
  id: string;
  fingerprint: string;
  alertType: AlertType;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  actionRecommendation: string;
  source: string;
  dataset: string;
  evidenceIds: string[];
  ruleIds: string[];
  affectedArea: AlertArea;
  affectedMissionIds: string[];
  affectedVesselIds: string[];
  issuedAt: string;
  validFrom: string;
  validUntil: string | null;
  status: AlertStatus;
  acknowledgement?: AlertAcknowledgement | null;
  resolution?: AlertResolution | null;
  createdAt: string;
  updatedAt: string;
  provenance: AlertProvenance;
  confidence: AlertConfidence;
  whyExplanation: string;
  metadata?: Record<string, unknown>;
}

export interface AlertDetailResponse {
  alert: AlertItem;
  evidence: AuditedEvidenceItem[];
  ruleEvaluations: DeterministicRuleEvaluation[];
}

export interface AlertFilterOptions {
  status?: AlertStatus | 'ALL';
  severity?: AlertSeverity;
  alertType?: AlertType;
  category?: AlertCategory;
  missionId?: string;
  vesselId?: string;
  role?: UserRole | string;
}

// ============================================================================
// 18. PHASE 21: OFFLINE / DEGRADED CONNECTIVITY & PROVENANCE CACHE CONTRACTS
// ============================================================================

/**
 * Formal 4-state connectivity model per Phase 21 North Star.
 * CONNECTED: Full bidirectional Internet & backend reachability.
 * DEGRADED: Partial reachability, timeout, high latency, or cellular dropout.
 * OFFLINE: Zero Internet connectivity (local shell & cached store active).
 * SAFETY_MESSAGE_RECEIVED: Emergency broadcast received (e.g. NavIC) while data network is degraded/offline.
 */
export type ConnectivityState =
  | 'CONNECTED'
  | 'DEGRADED'
  | 'OFFLINE'
  | 'SAFETY_MESSAGE_RECEIVED';

/**
 * Physical network transport bearer.
 */
export type NetworkBearer =
  | 'CELLULAR_4G_5G'
  | 'CELLULAR_2G'
  | 'NAVIC_RECEIVER'
  | 'SATELLITE_MSG'
  | 'BLUETOOTH_MESH'
  | 'NONE';

/**
 * Hardware GNSS/GPS sensor fix state (strictly separated from Internet connectivity and IP geolocation).
 * - GNSS_FIX_ACQUIRED: Verified satellite 3D fix from orbital constellation (NavIC / GPS).
 * - SEARCHING: GNSS receiver actively acquiring satellite orbital ephemeris.
 * - SENSOR_UNAVAILABLE: No dedicated hardware GNSS receiver detected on device.
 * - IP_GEOLOCATION_ONLY: Approximate location estimated from cellular/Wi-Fi/IP (NOT satellite GNSS).
 * - SIMULATED: Virtualized testbed satellite fix.
 */
export type GpsStatus =
  | 'GNSS_FIX_ACQUIRED'
  | 'SEARCHING'
  | 'SENSOR_UNAVAILABLE'
  | 'IP_GEOLOCATION_ONLY'
  | 'SIMULATED'
  | 'FIX_ACQUIRED'
  | 'UNAVAILABLE';

/**
 * Emergency broadcast message received via NavIC or coastal safety broadcast.
 */
export interface SafetyBroadcastMessage {
  id: string;
  sender: string;
  headline: string;
  body: string;
  severity: 'CRITICAL' | 'WARNING' | 'ADVISORY';
  broadcastBearer: 'NAVIC_SATELLITE' | 'VHF_COASTAL_RADIO_RELAY' | 'EMERGENCY_CELL_BROADCAST';
  receivedAt: string;
  validUntil?: string | null;
}

/**
 * Comprehensive connectivity status contract.
 */
export interface ConnectivityStatus {
  state: ConnectivityState;
  bearer: NetworkBearer | string;
  isOnline: boolean;
  apiReachable: boolean;
  gpsStatus: GpsStatus | string;
  lastSuccessfulContact: string | null;
  lastSuccessfulSync: string | null;
  pendingSyncCount: number;
  safetyMessage?: SafetyBroadcastMessage | null;
  isSimulated?: boolean;
  sourceReachability?: Record<string, string>;
  sources?: Record<string, unknown>;
  serverTimestamp?: string;
  status?: string;
}

/**
 * Cache envelope preserving complete provenance metadata for offline records.
 */
export interface OfflineCachedItem<T = unknown> {
  id: string;
  entityType: 'decision' | 'mission' | 'alert' | 'observation' | 'vessel' | 'restricted_zone';
  data: T;
  source: string;
  dataset?: string;
  retrievedAt: string;
  observedAt: string;
  validUntil: string | null;
  cachedAt: string;
  status: FreshnessState;
  qualityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'DEGRADED';
}

/**
 * Queued offline mutation for reconnection synchronization.
 */
export interface SyncMutationItem {
  id: string;
  mutationType: 'ACKNOWLEDGE_ALERT' | 'RESOLVE_ALERT' | 'CREATE_MISSION' | 'UPDATE_MISSION' | 'TELEMETRY_LOG';
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
  lastAttemptAt?: string;
  error?: string;
}

/**
 * Synchronization batch envelope for POST /api/v1/connectivity/sync.
 */
export interface SyncBatchRequest {
  clientId: string;
  mutations: SyncMutationItem[];
  connectivityState: ConnectivityState;
  lastSyncTimestamp?: string | null;
}

export interface SyncBatchResponse {
  syncedMutationIds: string[];
  failedMutations: Array<{ id: string; error: string }>;
  serverTimestamp: string;
  state: ConnectivityState;
  message: string;
}



