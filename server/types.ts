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

export type AlertType = 
  | 'CYCLONE_WARNING'
  | 'HIGH_WAVE_SWELL'
  | 'GALE_WIND'
  | 'BORDER_PROXIMITY'
  | 'RESTRICTED_ZONE_BREACH'
  | 'PFZ_OPPORTUNITY'
  | 'COMMUNICATION_DROPOUT';

export type AlertSeverity = 'INFO' | 'ADVISORY' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';

export interface AlertRecord {
  id: string;
  source_id?: string | null;
  mission_id?: string | null;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'EXPIRED';
  valid_from: string;
  valid_until?: string | null;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type ConnectivityState = 'CONNECTED' | 'DEGRADED' | 'OFFLINE' | 'SAFETY_MESSAGE_RECEIVED';
export type NetworkBearer = 'CELLULAR_4G_5G' | 'CELLULAR_2G' | 'NAVIC_RECEIVER' | 'SATELLITE_MSG' | 'BLUETOOTH_MESH' | 'NONE';

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
