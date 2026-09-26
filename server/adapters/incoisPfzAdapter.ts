import { z } from 'zod';
import type {
  DataAdapter,
  AdapterQuery,
  AdapterResponse,
  NormalizedObservationPayload,
  AdapterStatus,
} from './types.js';
import { withTimeout, createErrorAdapterResponse } from './errorBoundary.js';

// ============================================================================
// Official INCOIS PFZ WFS GeoJSON Validation Schemas (Zod)
// Layer: PFZ_Automation:pfzlines & PFZ_LandingCentres:LandingCenters_29Apr2024
// ============================================================================

export const pfzFeaturePropertiesSchema = z.object({
  State_Name: z.string().optional(),
  state_name: z.string().optional(),
  State: z.string().optional(),
  Julian_day: z.union([z.string(), z.number()]).optional(),
  julian_day: z.union([z.string(), z.number()]).optional(),
  Year: z.number().optional(),
  year: z.number().optional(),
  UID: z.union([z.string(), z.number()]).optional(),
  uid: z.union([z.string(), z.number()]).optional(),
  Sno: z.union([z.string(), z.number()]).optional(),
  Length: z.number().optional(),
  length: z.number().optional(),
  Shape_Leng: z.number().optional(),
  Shape_Area: z.number().optional(),
  SECTORBOUN: z.union([z.string(), z.number()]).optional(),
  SECTORBO_1: z.union([z.string(), z.number()]).optional(),
}).passthrough();

export const pfzGeoJsonFeatureSchema = z.object({
  type: z.literal('Feature'),
  id: z.string().optional(),
  geometry: z.object({
    type: z.string(),
    coordinates: z.array(z.any()),
  }),
  geometry_name: z.string().optional(),
  properties: pfzFeaturePropertiesSchema.optional().default({}),
});

export const pfzGeoJsonCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(pfzGeoJsonFeatureSchema),
  totalFeatures: z.union([z.number(), z.string()]).optional(),
  numberReturned: z.number().optional(),
  timeStamp: z.string().optional(),
  crs: z.any().optional(),
});

export const landingCentrePropertiesSchema = z.object({
  OBJECTID: z.number().optional(),
  SECTOR_NAM: z.string().optional(),
  SECTOR_ID: z.string().optional(),
  DIST_NAME: z.string().optional(),
  LC_NAME: z.string().optional(),
}).passthrough();

export const landingCentreFeatureSchema = z.object({
  type: z.literal('Feature'),
  id: z.string().optional(),
  geometry: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  properties: landingCentrePropertiesSchema.optional().default({}),
});

export const landingCentreCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(landingCentreFeatureSchema),
});

export type PfzRawPayload = z.infer<typeof pfzGeoJsonCollectionSchema> | Record<string, unknown>;

export interface PfzQuery extends AdapterQuery {
  regionId?: string;
  state?: string;
  maxDistanceKm?: number;
  includeLandingCentres?: boolean;
}

export interface PfzOpportunityRecord {
  uid: string;
  stateName: string;
  advisoryDate: string;
  validFrom: string;
  validUntil: string;
  isExpired: boolean;
  lengthKm: number;
  midpoint: { lat: number; lon: number };
  coordinates: [number, number][]; // [lon, lat]
  distanceKm?: number;
  distanceNm?: number;
  bearingDeg?: number;
  directionCompass?: string;
  nearestLandingCentre?: {
    name: string;
    distanceKm: number;
  };
  spatialRelevanceScore?: number; // 0-100 spatial proximity index
  sstC?: number | null;
  chlorophyllMgM3?: number | null;
}

// Helper: Convert Julian day to standard ISO UTC date (YYYY-MM-DD)
export function julianDayToIsoDate(year: number, dayOfYear: number): string {
  const date = new Date(Date.UTC(year, 0, 1));
  date.setUTCDate(dayOfYear);
  return date.toISOString().split('T')[0];
}

// Helper: Haversine distance in kilometers
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Helper: Initial bearing in degrees (0-360)
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  return Number(((deg + 360) % 360).toFixed(1));
}

// Helper: Degrees to 8-point cardinal direction
export function degreesToCompass(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

// Helper: Extract flat coordinate points from GeoJSON LineString / MultiLineString
export function extractLineCoordinates(geometry: { type: string; coordinates: unknown }): [number, number][] {
  const points: [number, number][] = [];
  if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates)) {
    for (const c of geometry.coordinates) {
      if (Array.isArray(c) && typeof c[0] === 'number' && typeof c[1] === 'number') {
        points.push([c[0], c[1]]);
      }
    }
  } else if (geometry.type === 'MultiLineString' && Array.isArray(geometry.coordinates)) {
    for (const line of geometry.coordinates) {
      if (Array.isArray(line)) {
        for (const c of line) {
          if (Array.isArray(c) && typeof c[0] === 'number' && typeof c[1] === 'number') {
            points.push([c[0], c[1]]);
          }
        }
      }
    }
  }
  return points;
}

// Helper: Calculate midpoint of line coordinate sequence
export function calculateMidpoint(points: [number, number][]): { lat: number; lon: number } {
  if (points.length === 0) return { lat: 0, lon: 0 };
  const midIdx = Math.floor(points.length / 2);
  return {
    lon: points[midIdx][0],
    lat: points[midIdx][1],
  };
}

/**
 * Official INCOIS Potential Fishing Zone (PFZ) Data Adapter.
 * Consumes live vector advisories via official INCOIS GeoServer WFS.
 */
export class IncoisPfzAdapter implements DataAdapter<PfzQuery, PfzRawPayload> {
  readonly source = 'INCOIS_PFZ';
  readonly dataset = 'pfz_advisories';
  readonly sourceType = 'INCOIS_PFZ' as const;

  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl || process.env.INCOIS_PFZ_URL || 'https://incois.gov.in').replace(/\/+$/, '');
  }

  async checkHealth(): Promise<{ status: AdapterStatus; latencyMs: number; message: string }> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const url = `${this.baseUrl}/geoserver/PFZ_Automation/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=PFZ_Automation:pfzlines&maxFeatures=1&outputFormat=application/json`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ORCA-Marine-Intelligence/1.0 (SIH26176)',
        },
      });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - start;
      if (res.ok) {
        return {
          status: 'READY',
          latencyMs,
          message: 'Official INCOIS PFZ GeoServer WFS service is active and responsive.',
        };
      }

      return {
        status: 'DEGRADED',
        latencyMs,
        message: `INCOIS PFZ GeoServer returned HTTP ${res.status}.`,
      };
    } catch (err) {
      const latencyMs = Date.now() - start;
      const msg = err instanceof Error ? err.message : 'Unknown network error';
      return {
        status: 'UNAVAILABLE',
        latencyMs,
        message: `INCOIS PFZ WFS endpoint unreachable: ${msg}`,
      };
    }
  }

  async fetch(query: PfzQuery = {}): Promise<AdapterResponse<PfzRawPayload>> {
    const timeoutMs = query.timeoutMs ?? 8000;

    try {
      return await withTimeout(this.executeFetch(query, timeoutMs), timeoutMs);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'INCOIS PFZ adapter execution error';
      const isTimeout = message.toLowerCase().includes('timed out');
      return createErrorAdapterResponse(
        this.source,
        this.dataset,
        this.sourceType,
        isTimeout ? 'TIMEOUT' : 'UNAVAILABLE',
        {
          code: isTimeout ? 'INCOIS_PFZ_TIMEOUT' : 'INCOIS_PFZ_UNAVAILABLE',
          message,
        },
        { query, baseUrl: this.baseUrl }
      );
    }
  }

  private async executeFetch(query: PfzQuery, timeoutMs: number): Promise<AdapterResponse<PfzRawPayload>> {
    const lat = query.latitude ?? (query.regionId?.toLowerCase() === 'tamil_nadu' ? 10.76 : 18.92);
    const lon = query.longitude ?? (query.regionId?.toLowerCase() === 'tamil_nadu' ? 79.84 : 72.83);
    const region = query.regionId || (lat < 14 ? 'tamil_nadu' : 'maharashtra');
    const retrievedAt = new Date().toISOString();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs - 500);

    const pfzUrl = `${this.baseUrl}/geoserver/PFZ_Automation/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=PFZ_Automation:pfzlines&outputFormat=application/json`;

    let rawResponse: Response;
    try {
      rawResponse = await fetch(pfzUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ORCA-Marine-Intelligence/1.0 (SIH26176)',
        },
      });
    } catch (networkError) {
      clearTimeout(timer);
      const msg = networkError instanceof Error ? networkError.message : 'Network failure';
      const isAbort = networkError instanceof Error && networkError.name === 'AbortError';
      return createErrorAdapterResponse(
        this.source,
        this.dataset,
        this.sourceType,
        isAbort ? 'TIMEOUT' : 'UNAVAILABLE',
        {
          code: isAbort ? 'INCOIS_PFZ_TIMEOUT' : 'INCOIS_PFZ_NETWORK_FAILURE',
          message: isAbort ? `Request to INCOIS PFZ WFS timed out after ${timeoutMs}ms` : `Could not connect to INCOIS PFZ: ${msg}`,
        },
        { requestedLocation: { lat, lon }, region, targetUrl: pfzUrl }
      );
    } finally {
      clearTimeout(timer);
    }

    if (!rawResponse.ok) {
      return createErrorAdapterResponse(
        this.source,
        this.dataset,
        this.sourceType,
        rawResponse.status === 429 ? 'RATE_LIMITED' : 'UNAVAILABLE',
        {
          code: `INCOIS_PFZ_HTTP_${rawResponse.status}`,
          message: `INCOIS PFZ WFS returned HTTP ${rawResponse.status} ${rawResponse.statusText}`,
          statusCode: rawResponse.status,
        },
        { requestedLocation: { lat, lon }, targetUrl: pfzUrl }
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = await rawResponse.json();
    } catch (parseErr) {
      return createErrorAdapterResponse(
        this.source,
        this.dataset,
        this.sourceType,
        'INVALID_RESPONSE',
        {
          code: 'INCOIS_PFZ_INVALID_JSON',
          message: `Failed to parse GeoJSON response from INCOIS PFZ: ${parseErr instanceof Error ? parseErr.message : ''}`,
        },
        { requestedLocation: { lat, lon }, targetUrl: pfzUrl }
      );
    }

    return this.normalizePfzPayload(parsedJson, { lat, lon, region, retrievedAt });
  }

  /**
   * Normalizes raw GeoJSON PFZ collection into standard NormalizedObservationPayload format.
   * Public for deterministic unit testing.
   */
  public normalizePfzPayload(
    payload: unknown,
    context: {
      lat: number;
      lon: number;
      region: string;
      retrievedAt: string;
    }
  ): AdapterResponse<PfzRawPayload> {
    const parseResult = pfzGeoJsonCollectionSchema.safeParse(payload);

    if (!parseResult.success) {
      return createErrorAdapterResponse(
        this.source,
        this.dataset,
        this.sourceType,
        'INVALID_RESPONSE',
        {
          code: 'INCOIS_PFZ_SCHEMA_VALIDATION_FAILED',
          message: 'Received INCOIS PFZ GeoJSON payload did not match schema specifications.',
          details: parseResult.error.flatten(),
        },
        { context }
      );
    }

    const collection = parseResult.data;
    const now = new Date();
    const normalizedObservations: NormalizedObservationPayload[] = [];
    const opportunities: PfzOpportunityRecord[] = [];

    let mostRecentObservedAt = context.retrievedAt;
    let latestValidUntil: string | null = null;

    for (let i = 0; i < collection.features.length; i++) {
      const feat = collection.features[i];
      const props = feat.properties || {};

      const year = typeof props.Year === 'number' ? props.Year : typeof props.year === 'number' ? props.year : now.getUTCFullYear();
      const julian = props.Julian_day !== undefined ? Number(props.Julian_day) : props.julian_day !== undefined ? Number(props.julian_day) : 1;
      const stateName = (props.State_Name || props.state_name || props.State || 'COASTAL_SECTOR').toUpperCase();
      const uid = String(props.UID || props.uid || `${year}${julian}${String(i + 1).padStart(3, '0')}`);
      const lengthKm = Number(props.Length || props.length || props.Shape_Leng || 10);

      const advisoryDateStr = julianDayToIsoDate(year, julian);
      const observedAt = `${advisoryDateStr}T00:00:00Z`;
      
      // INCOIS PFZ advisories are operational for 3 days (72 hours)
      const validUntilDate = new Date(new Date(observedAt).getTime() + 72 * 60 * 60 * 1000);
      const validUntil = validUntilDate.toISOString();

      if (new Date(observedAt) > new Date(mostRecentObservedAt) || mostRecentObservedAt === context.retrievedAt) {
        mostRecentObservedAt = observedAt;
      }
      if (!latestValidUntil || new Date(validUntil) > new Date(latestValidUntil)) {
        latestValidUntil = validUntil;
      }

      const isExpired = validUntilDate < now;
      const coordinates = extractLineCoordinates(feat.geometry);
      const midpoint = calculateMidpoint(coordinates);

      // Distance and bearing from vessel/mission location
      const distanceKm = calculateHaversineDistanceKm(context.lat, context.lon, midpoint.lat, midpoint.lon);
      const distanceNm = Number((distanceKm * 0.539957).toFixed(1));
      const bearingDeg = calculateBearing(context.lat, context.lon, midpoint.lat, midpoint.lon);
      const directionCompass = degreesToCompass(bearingDeg);

      // Deterministic Spatial Relevance (Higher score for closer active opportunities)
      // Note: This is strictly a spatial proximity score, NOT a fish probability or biological claim.
      const spatialRelevanceScore = Math.max(10, Math.min(100, Math.round(100 - distanceKm * 0.5)));

      const opportunity: PfzOpportunityRecord = {
        uid,
        stateName,
        advisoryDate: advisoryDateStr,
        validFrom: observedAt,
        validUntil,
        isExpired,
        lengthKm: Number(lengthKm.toFixed(2)),
        midpoint,
        coordinates,
        distanceKm,
        distanceNm,
        bearingDeg,
        directionCompass,
        spatialRelevanceScore,
        sstC: null,
        chlorophyllMgM3: null,
      };

      opportunities.push(opportunity);

      normalizedObservations.push({
        category: 'PFZ',
        variableName: 'pfz_opportunity_zone',
        numericValue: Number(lengthKm.toFixed(2)),
        unit: 'km',
        structuredValue: {
          uid,
          stateName,
          advisoryDate: advisoryDateStr,
          validFrom: observedAt,
          validUntil,
          isExpired,
          lengthKm: Number(lengthKm.toFixed(2)),
          midpoint,
          coordinates,
          distanceKm,
          distanceNm,
          bearingDeg,
          directionCompass,
          spatialRelevanceScore,
          isSafetyClearance: false, // Explicit safety separation
        },
        location: midpoint,
        observedAt,
        validUntil,
        status: isExpired ? 'STALE' : 'LIVE',
        qualityLevel: isExpired ? 'DEGRADED' : 'HIGH',
        metadata: {
          agency: 'INCOIS',
          sourceType: 'OFFICIAL_INCOIS_PFZ',
          layer: 'PFZ_Automation:pfzlines',
          dedup_key: `pfz_${uid}`,
          stateName,
          region: context.region,
          disclaimer: 'Potential fishing zone advisories are based on satellite SST and chlorophyll features. PFZ intelligence does NOT represent a weather or maritime safety clearance.',
        },
      });
    }

    // Sort opportunities by distance (closest first)
    opportunities.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

    return {
      source: this.source,
      dataset: this.dataset,
      sourceType: this.sourceType,
      status: 'READY',
      retrievedAt: context.retrievedAt,
      observedAt: mostRecentObservedAt,
      validUntil: latestValidUntil,
      quality: 'HIGH',
      isLive: true,
      payload: collection as PfzRawPayload,
      normalizedObservations,
      error: null,
      metadata: {
        agency: 'INCOIS',
        sourceType: 'OFFICIAL_INCOIS_PFZ',
        totalOpportunities: opportunities.length,
        opportunities,
        requestedLocation: { lat: context.lat, lon: context.lon },
        region: context.region,
        disclaimer: 'Official Potential Fishing Zone (PFZ) intelligence from INCOIS.',
      },
    };
  }
}
