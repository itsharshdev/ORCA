import type { AuditedEvidenceItem, DeterministicRuleEvaluation } from '../src/types/contract.js';
export * from '../src/types/contract.js';

// ============================================================================
// Phase 5 Database Domain Entity Types
// ============================================================================

export type WaypointType = 'ORIGIN' | 'TRANSIT' | 'FISHING_SPOT' | 'HAZARD_AVOIDANCE' | 'DESTINATION' | 'PORT';

export interface MissionWaypointRecord {
  id: string;
  mission_id: string;
  sequence_order: number;
  latitude: number;
  longitude: number;
  waypoint_type: WaypointType;
  label?: string | null;
  planned_eta?: string | null;
  planned_etd?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type RegionType = 'COASTAL_OPERATIONAL' | 'FISHING_ZONE' | 'RESEARCH' | 'ADMINISTRATIVE' | 'PORT_APPROACH';

export interface RegionRecord {
  id: string;
  code: string;
  name: string;
  region_type: RegionType;
  status: 'ACTIVE' | 'INACTIVE' | 'DEMO_TEST';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

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

export type ObservationCategory = 'OCEAN' | 'WEATHER' | 'PFZ' | 'GEO_SAFETY' | 'VESSEL_TRAFFIC' | 'HAZARD';

export interface ObservationRecord {
  id: string;
  source_id?: string | null;
  dataset_identifier: string;
  category: ObservationCategory;
  variable_name: string;
  numeric_value?: number | null;
  unit?: string | null;
  structured_value: Record<string, unknown>;
  observed_at: string;
  retrieved_at: string;
  valid_until?: string | null;
  status: 'LIVE' | 'INTEGRATED' | 'DEMO_SNAPSHOT' | 'CACHED' | 'STALE' | 'UNAVAILABLE' | 'VERIFIED';
  quality_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'DEGRADED';
  uncertainty_range?: Record<string, unknown> | null;
  raw_metadata: Record<string, unknown>;
  created_at: string;
}

export type AlertCategory = 'WEATHER_MARINE' | 'GIS_SAFETY' | 'MISSION' | 'CONNECTIVITY';

export type AlertType = 
  // Weather / Marine
  | 'SEVERE_WEATHER_WARNING'
  | 'HIGH_WAVE_CONDITION'
  | 'HIGH_WIND_CONDITION'
  | 'CYCLONE_COASTAL_WARNING'
  // GIS / Safety
  | 'RESTRICTED_ZONE_INCURSION'
  | 'ROUTE_INTERSECTION'
  | 'VESSEL_LIMIT_BREACH'
  // Mission
  | 'RETURN_WINDOW_RISK'
  | 'STALE_CRITICAL_DATA'
  | 'DEGRADED_DATA_COVERAGE'
  | 'MISSION_CONFLICT'
  // Connectivity
  | 'DEGRADED_CONNECTIVITY'
  | 'OFFLINE_STATE'
  | 'SAFETY_MESSAGE_RECEIVED'
  // Legacy / DB backwards compatibility
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

export interface AlertRecord {
  id: string;
  source_id?: string | null;
  mission_id?: string | null;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  status: AlertStatus;
  valid_from: string;
  valid_until?: string | null;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AlertDetailResponse {
  alert: AlertItem;
  evidence: AuditedEvidenceItem[];
  ruleEvaluations: DeterministicRuleEvaluation[];
}

export interface AlertEvaluationInput {
  regionId?: string;
  missionId?: string;
  vesselId?: string;
  routeCoordinates?: [number, number][];
  environmentalContext?: {
    waveHeightMeters?: number;
    windSpeedKnots?: number;
    windGustKnots?: number;
    visibilityKm?: number;
    observedAt?: string;
    validUntil?: string | null;
    isLive?: boolean;
    activeWarnings?: Array<{
      alertId: string;
      severity: string;
      warningType: string;
      description: string;
      validFrom?: string;
      validUntil?: string;
      source?: string;
    }>;
  };
  connectivityEvent?: {
    state: ConnectivityState;
    bearer?: NetworkBearer;
    message?: string;
  };
}

export type ConnectivityState = 'CONNECTED' | 'DEGRADED' | 'OFFLINE' | 'SAFETY_MESSAGE_RECEIVED';
export type NetworkBearer = 'CELLULAR_4G_5G' | 'CELLULAR_2G' | 'NAVIC_RECEIVER' | 'SATELLITE_MSG' | 'BLUETOOTH_MESH' | 'NONE';
export type GpsStatus = 'GNSS_FIX_ACQUIRED' | 'SEARCHING' | 'SENSOR_UNAVAILABLE' | 'IP_GEOLOCATION_ONLY' | 'SIMULATED' | 'FIX_ACQUIRED' | 'UNAVAILABLE';
export type FreshnessState = 'LIVE' | 'FRESH' | 'CACHED' | 'AGING' | 'STALE' | 'EXPIRED' | 'UNAVAILABLE' | 'ACCESS_PENDING' | 'DEMO' | 'DETERMINISTIC';

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

export interface SyncMutationItem {
  id: string;
  mutationType: 'ACKNOWLEDGE_ALERT' | 'RESOLVE_ALERT' | 'CREATE_MISSION' | 'UPDATE_MISSION' | 'TELEMETRY_LOG';
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
  lastAttemptAt?: string;
  error?: string;
}

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

export interface ConnectivityEventRecord {
  id: string;
  profile_id?: string | null;
  mission_id?: string | null;
  connectivity_state: ConnectivityState;
  network_bearer?: NetworkBearer | null;
  occurred_at: string;
  recovered_at?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

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

export type DecisionRuleCategory = 
  | 'SAFETY_OVERRIDE'
  | 'VESSEL_CAPABILITY'
  | 'METEOROLOGY'
  | 'OCEANOGRAPHY'
  | 'GEOSPATIAL_BOUNDARY'
  | 'FISHERIES_UTILITY'
  | 'DATA_INTEGRITY';

export interface DecisionRuleRecord {
  id: string;
  rule_code: string;
  name: string;
  category: DecisionRuleCategory;
  priority_order: number;
  is_enabled: boolean;
  version: string;
  parameters: Record<string, unknown>;
  description: string;
  created_at: string;
  updated_at: string;
}

export type RuleEvaluationResult = 'PASSED' | 'FAILED' | 'WARNING' | 'SKIPPED' | 'INSUFFICIENT_DATA';

export interface DecisionRuleEvaluationRecord {
  id: string;
  decision_id: string;
  rule_id: string;
  evaluation_result: RuleEvaluationResult;
  input_summary: Record<string, unknown>;
  threshold_evaluated?: Record<string, unknown> | null;
  reason: string;
  evaluated_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type ReplayEventType = 
  | 'ORCA_QUERY_EXECUTED'
  | 'DECISION_EVALUATED'
  | 'ALERT_TRIGGERED'
  | 'ROUTE_WAYPOINT_REACHED'
  | 'CONNECTIVITY_TRANSITION';

export interface ReplayRecord {
  id: string;
  mission_id: string;
  decision_id?: string | null;
  execution_run_id: string;
  event_type: ReplayEventType;
  recorded_at: string;
  input_snapshot: Record<string, unknown>;
  output_snapshot: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
}

