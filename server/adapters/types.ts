import { z } from 'zod';

// ============================================================================
// ORCA Data Adapter Framework Types (Phase 6)
// ============================================================================

export type AdapterStatus = 
  | 'READY'            // Adapter ready and operating normally
  | 'DEGRADED'         // Operating with partial data or high latency
  | 'UNAVAILABLE'      // Upstream source unreachable or feed offline
  | 'INVALID_RESPONSE' // Upstream returned malformed/unparseable payload
  | 'TIMEOUT'          // Upstream fetch timed out before response
  | 'RATE_LIMITED';    // Upstream API rejected request due to quota limits

export type AdapterSourceType = 
  | 'DEMO'                 // Static deterministic simulated snapshot
  | 'INCOIS_OSF'           // Ocean State Forecast (Wave, Swell, Currents)
  | 'IMD_WEATHER'          // India Meteorological Dept (Wind, Gusts, Cyclones)
  | 'INCOIS_PFZ'           // Potential Fishing Zone Advisories (Chlorophyll, SST)
  | 'MOSDAC_SST'           // ISRO MOSDAC Satellite SST / Ocean Colour
  | 'GEOSAFETY_REGISTRY';  // Maritime safety boundaries and protected zones

export interface AdapterQuery {
  regionId?: string;
  latitude?: number;
  longitude?: number;
  targetZoneId?: string;
  timestamp?: string;
  timeoutMs?: number;
}

export const adapterQuerySchema = z.object({
  regionId: z.string().optional().default('maharashtra'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  targetZoneId: z.string().optional(),
  timestamp: z.string().datetime({ offset: true }).optional(),
  timeoutMs: z.number().positive().max(30000).optional().default(5000),
});

export interface AdapterErrorDetail {
  code: string;
  message: string;
  statusCode?: number;
  details?: unknown;
}

export interface NormalizedObservationPayload {
  category: 'OCEAN' | 'WEATHER' | 'PFZ' | 'GEO_SAFETY' | 'VESSEL_TRAFFIC' | 'HAZARD';
  variableName: string;
  numericValue?: number | null;
  unit?: string | null;
  structuredValue?: Record<string, unknown>;
  location?: { lat: number; lon: number };
  observedAt: string;
  validUntil?: string | null;
  status: 'LIVE' | 'INTEGRATED' | 'DEMO_SNAPSHOT' | 'CACHED' | 'STALE' | 'UNAVAILABLE' | 'VERIFIED';
  qualityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'DEGRADED';
  uncertaintyRange?: { min?: number; max?: number };
  metadata?: Record<string, unknown>;
}

export interface AdapterResponse<T = unknown> {
  source: string;              // e.g. "ORCA_DEMO"
  dataset: string;             // e.g. "demo_marine_conditions"
  sourceType: AdapterSourceType;
  status: AdapterStatus;
  retrievedAt: string;         // ISO 8601 UTC timestamp of retrieval
  observedAt: string;          // ISO 8601 UTC timestamp of actual observation
  validUntil?: string | null;  // ISO 8601 UTC validity expiration
  quality: 'HIGH' | 'MEDIUM' | 'LOW' | 'DEGRADED';
  isLive: boolean;             // Explicitly false for demo/simulated datasets
  payload: T | null;           // Raw or parsed source payload
  normalizedObservations: NormalizedObservationPayload[];
  error?: AdapterErrorDetail | null;
  metadata: Record<string, unknown>;
}

/**
 * Standard Data Adapter Interface.
 * Every external feed (INCOIS, IMD, MOSDAC, Demo) must implement this contract.
 */
export interface DataAdapter<TQuery extends AdapterQuery = AdapterQuery, TResult = unknown> {
  readonly source: string;
  readonly dataset: string;
  readonly sourceType: AdapterSourceType;
  fetch(query: TQuery): Promise<AdapterResponse<TResult>>;
  checkHealth(): Promise<{ status: AdapterStatus; latencyMs: number; message: string }>;
}
