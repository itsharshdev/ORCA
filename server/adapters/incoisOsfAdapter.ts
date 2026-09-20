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
// Official INCOIS ERDDAP / OSF Response Validation Schemas
// ============================================================================

export const incoisErddapTableSchema = z.object({
  table: z.object({
    columnNames: z.array(z.string()),
    columnUnits: z.array(z.string()).optional(),
    columnTypes: z.array(z.string()).optional(),
    rows: z.array(z.array(z.union([z.string(), z.number(), z.null()]))),
  }),
});

export const incoisDirectOsfSchema = z.object({
  metadata: z.object({
    source: z.string().optional().default('INCOIS_OSF'),
    region: z.string().optional(),
    forecastDate: z.string().optional(),
    issueTime: z.string().optional(),
    validUntil: z.string().optional(),
  }).optional(),
  data: z.array(
    z.object({
      latitude: z.number(),
      longitude: z.number(),
      time: z.string().optional(),
      significantWaveHeight: z.number().optional(),
      peakWavePeriod: z.number().optional(),
      swellWaveHeight: z.number().optional(),
      swellPeriod: z.number().optional(),
      seaSurfaceTemperature: z.number().optional(),
      surfaceCurrentSpeed: z.number().optional(),
      surfaceCurrentDirection: z.union([z.string(), z.number()]).optional(),
      windSpeed: z.number().optional(),
      windDirection: z.union([z.string(), z.number()]).optional(),
    })
  ).optional(),
});

export type IncoisRawPayload = 
  | z.infer<typeof incoisErddapTableSchema>
  | z.infer<typeof incoisDirectOsfSchema>
  | Record<string, unknown>;

export interface IncoisOsfQuery extends AdapterQuery {
  stationCode?: string;
  gridResolutionDeg?: number;
  allowFallback?: boolean;
}

/**
 * Official INCOIS Ocean State Forecast (OSF) Data Adapter
 * Connects to official INCOIS oceanography data feeds (ERDDAP / REST web services).
 */
export class IncoisOsfAdapter implements DataAdapter<IncoisOsfQuery, IncoisRawPayload> {
  readonly source = 'INCOIS_OSF';
  readonly dataset = 'ocean_state_forecast';
  readonly sourceType = 'INCOIS_OSF' as const;

  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.INCOIS_ERDDAP_URL || 'https://erddap.incois.gov.in/erddap';
  }

  async checkHealth(): Promise<{ status: AdapterStatus; latencyMs: number; message: string }> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${this.baseUrl}/info/index.json`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - start;
      if (res.ok) {
        return {
          status: 'READY',
          latencyMs,
          message: 'Official INCOIS ERDDAP service is online and reachable.',
        };
      }

      return {
        status: 'DEGRADED',
        latencyMs,
        message: `INCOIS ERDDAP returned HTTP status ${res.status}.`,
      };
    } catch (err) {
      const latencyMs = Date.now() - start;
      const msg = err instanceof Error ? err.message : 'Unknown network failure';
      return {
        status: 'UNAVAILABLE',
        latencyMs,
        message: `Official INCOIS endpoint unreachable: ${msg}`,
      };
    }
  }

  async fetch(query: IncoisOsfQuery = {}): Promise<AdapterResponse<IncoisRawPayload>> {
    const timeoutMs = query.timeoutMs ?? 6000;

    try {
      return await withTimeout(this.executeFetch(query), timeoutMs);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'INCOIS adapter execution error';
      const isTimeout = message.toLowerCase().includes('timed out');
      return createErrorAdapterResponse(
        this.source,
        this.dataset,
        this.sourceType,
        isTimeout ? 'TIMEOUT' : 'UNAVAILABLE',
        {
          code: isTimeout ? 'INCOIS_TIMEOUT' : 'INCOIS_UNAVAILABLE',
          message,
        },
        { query, baseUrl: this.baseUrl }
      );
    }
  }

  private async executeFetch(query: IncoisOsfQuery): Promise<AdapterResponse<IncoisRawPayload>> {
    const lat = query.latitude ?? (query.regionId?.toLowerCase() === 'tamil_nadu' ? 10.76 : 18.92);
    const lon = query.longitude ?? (query.regionId?.toLowerCase() === 'tamil_nadu' ? 79.84 : 72.83);
    const region = query.regionId || (lat < 14 ? 'tamil_nadu' : 'maharashtra');

    const gridLat = Number(lat.toFixed(2));
    const gridLon = Number(lon.toFixed(2));
    const retrievedAt = new Date().toISOString();

    // Construct ERDDAP URL for Indian Ocean Coastal State Forecast
    const url = `${this.baseUrl}/tabledap/incois_osf_coastal.json?time,latitude,longitude,significant_wave_height,wave_period,swell_wave_height,swell_period,sea_surface_temperature,surface_current_speed,wind_speed&latitude>=${gridLat - 0.25}&latitude<=${gridLat + 0.25}&longitude>=${gridLon - 0.25}&longitude<=${gridLon + 0.25}&orderByLimit("time/desc,1")`;

    let rawResponse: Response;
    try {
      rawResponse = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ORCA-Marine-Intelligence/1.0 (SIH26176)',
        },
      });
    } catch (networkError) {
      const msg = networkError instanceof Error ? networkError.message : 'Network failure';
      return createErrorAdapterResponse(
        this.source,
        this.dataset,
        this.sourceType,
        'UNAVAILABLE',
        {
          code: 'INCOIS_NETWORK_FAILURE',
          message: `Could not connect to official INCOIS server: ${msg}`,
        },
        { requestedLocation: { lat, lon }, gridLocation: { gridLat, gridLon }, region }
      );
    }

    if (!rawResponse.ok) {
      return createErrorAdapterResponse(
        this.source,
        this.dataset,
        this.sourceType,
        rawResponse.status === 429 ? 'RATE_LIMITED' : 'UNAVAILABLE',
        {
          code: `INCOIS_HTTP_${rawResponse.status}`,
          message: `Official INCOIS API returned HTTP ${rawResponse.status} ${rawResponse.statusText}`,
          statusCode: rawResponse.status,
        },
        { requestedLocation: { lat, lon }, gridLocation: { gridLat, gridLon } }
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
          code: 'INCOIS_INVALID_JSON',
          message: `Failed to parse JSON response from INCOIS: ${parseErr instanceof Error ? parseErr.message : ''}`,
        },
        { requestedLocation: { lat, lon } }
      );
    }

    // Parse and normalize ERDDAP or direct payload
    return this.normalizeIncoisPayload(parsedJson, { lat, lon, gridLat, gridLon, region, retrievedAt });
  }

  /**
   * Normalizes an INCOIS payload into canonical NormalizedObservationPayload format.
   * Public to allow deterministic unit testing of parsing logic.
   */
  public normalizeIncoisPayload(
    payload: unknown,
    context: {
      lat: number;
      lon: number;
      gridLat: number;
      gridLon: number;
      region: string;
      retrievedAt: string;
    }
  ): AdapterResponse<IncoisRawPayload> {
    const erddapParse = incoisErddapTableSchema.safeParse(payload);
    const directParse = incoisDirectOsfSchema.safeParse(payload);

    if (!erddapParse.success && !directParse.success) {
      return createErrorAdapterResponse(
        this.source,
        this.dataset,
        this.sourceType,
        'INVALID_RESPONSE',
        {
          code: 'INCOIS_SCHEMA_VALIDATION_FAILED',
          message: 'Received INCOIS payload did not match ERDDAP or OSF JSON specifications.',
          details: erddapParse.error.flatten(),
        },
        { context }
      );
    }

    const normalizedObservations: NormalizedObservationPayload[] = [];
    let observedAt = new Date().toISOString();
    let validUntil: string | null = null;
    const regionName = context.region === 'tamil_nadu' ? 'Tamil Nadu Coast' : 'Maharashtra Coast';

    if (erddapParse.success) {
      const table = erddapParse.data.table;
      const colMap = new Map<string, number>();
      table.columnNames.forEach((name, idx) => colMap.set(name.toLowerCase(), idx));

      const row = table.rows[0];
      if (row && row.length > 0) {
        const timeIdx = colMap.get('time');
        if (timeIdx !== undefined && typeof row[timeIdx] === 'string') {
          observedAt = row[timeIdx] as string;
          // Standard OSF validity is 24 hours from model run
          const obsDate = new Date(observedAt);
          if (!isNaN(obsDate.getTime())) {
            validUntil = new Date(obsDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
          }
        }

        // 1. Significant Wave Height (Hs)
        const swhIdx = colMap.get('significant_wave_height') ?? colMap.get('swh') ?? colMap.get('wave_height');
        if (swhIdx !== undefined && typeof row[swhIdx] === 'number') {
          const val = Number(row[swhIdx]);
          normalizedObservations.push({
            category: 'OCEAN',
            variableName: 'significant_wave_height',
            numericValue: val,
            unit: 'm',
            location: { lat: context.gridLat, lon: context.gridLon },
            observedAt,
            validUntil,
            status: 'LIVE',
            qualityLevel: 'HIGH',
            uncertaintyRange: { min: Math.max(0, val - 0.15), max: val + 0.15 },
            metadata: {
              region: context.region,
              regionName,
              dedup_key: `${context.region}_significant_wave_height`,
              agency: 'INCOIS',
              sourceGrid: { lat: context.gridLat, lon: context.gridLon },
              model: 'INCOIS_WAVEWATCH_III',
            },
          });
        }

        // 2. Wave Period (Tp)
        const wpIdx = colMap.get('wave_period') ?? colMap.get('peak_wave_period');
        if (wpIdx !== undefined && typeof row[wpIdx] === 'number') {
          normalizedObservations.push({
            category: 'OCEAN',
            variableName: 'peak_wave_period',
            numericValue: Number(row[wpIdx]),
            unit: 's',
            location: { lat: context.gridLat, lon: context.gridLon },
            observedAt,
            validUntil,
            status: 'LIVE',
            qualityLevel: 'HIGH',
            metadata: {
              region: context.region,
              regionName,
              dedup_key: `${context.region}_peak_wave_period`,
              agency: 'INCOIS',
            },
          });
        }

        // 3. Swell Wave Height
        const swellIdx = colMap.get('swell_wave_height') ?? colMap.get('swell_height');
        if (swellIdx !== undefined && typeof row[swellIdx] === 'number') {
          normalizedObservations.push({
            category: 'OCEAN',
            variableName: 'swell_wave_height',
            numericValue: Number(row[swellIdx]),
            unit: 'm',
            location: { lat: context.gridLat, lon: context.gridLon },
            observedAt,
            validUntil,
            status: 'LIVE',
            qualityLevel: 'HIGH',
            metadata: {
              region: context.region,
              regionName,
              dedup_key: `${context.region}_swell_wave_height`,
              agency: 'INCOIS',
            },
          });
        }

        // 4. Sea Surface Temperature (SST)
        const sstIdx = colMap.get('sea_surface_temperature') ?? colMap.get('sst');
        if (sstIdx !== undefined && typeof row[sstIdx] === 'number') {
          normalizedObservations.push({
            category: 'OCEAN',
            variableName: 'sea_surface_temperature',
            numericValue: Number(row[sstIdx]),
            unit: 'degC',
            location: { lat: context.gridLat, lon: context.gridLon },
            observedAt,
            validUntil,
            status: 'LIVE',
            qualityLevel: 'HIGH',
            metadata: {
              region: context.region,
              regionName,
              dedup_key: `${context.region}_sea_surface_temperature`,
              agency: 'INCOIS',
            },
          });
        }

        // 5. Surface Current Velocity
        const curIdx = colMap.get('surface_current_speed') ?? colMap.get('current_speed');
        if (curIdx !== undefined && typeof row[curIdx] === 'number') {
          // If unit is m/s, convert to knots: 1 m/s = 1.94384 knots
          const rawSpeed = Number(row[curIdx]);
          const knotsSpeed = Number((rawSpeed * 1.94384).toFixed(2));
          normalizedObservations.push({
            category: 'OCEAN',
            variableName: 'surface_current_velocity',
            numericValue: knotsSpeed,
            unit: 'knots',
            location: { lat: context.gridLat, lon: context.gridLon },
            observedAt,
            validUntil,
            status: 'LIVE',
            qualityLevel: 'HIGH',
            metadata: {
              region: context.region,
              regionName,
              dedup_key: `${context.region}_surface_current_velocity`,
              agency: 'INCOIS',
              rawMetersPerSec: rawSpeed,
            },
          });
        }

        // 6. Sustained Wind Speed
        const windIdx = colMap.get('wind_speed') ?? colMap.get('surface_wind');
        if (windIdx !== undefined && typeof row[windIdx] === 'number') {
          const rawWind = Number(row[windIdx]);
          const knotsWind = Number((rawWind * 1.94384).toFixed(1));
          normalizedObservations.push({
            category: 'WEATHER',
            variableName: 'sustained_wind_speed',
            numericValue: knotsWind,
            unit: 'knots',
            location: { lat: context.gridLat, lon: context.gridLon },
            observedAt,
            validUntil,
            status: 'LIVE',
            qualityLevel: 'HIGH',
            metadata: {
              region: context.region,
              regionName,
              dedup_key: `${context.region}_sustained_wind_speed`,
              agency: 'INCOIS_OSF',
              rawMetersPerSec: rawWind,
            },
          });
        }
      }
    }

    return {
      source: this.source,
      dataset: this.dataset,
      sourceType: this.sourceType,
      status: 'READY',
      retrievedAt: context.retrievedAt,
      observedAt,
      validUntil,
      quality: 'HIGH',
      isLive: true,
      payload: payload as IncoisRawPayload,
      normalizedObservations,
      error: null,
      metadata: {
        agency: 'INCOIS',
        sourceType: 'OFFICIAL_ERDDAP',
        requestedLocation: { lat: context.lat, lon: context.lon },
        gridLocation: { lat: context.gridLat, lon: context.gridLon },
        region: context.region,
        disclaimer: 'Official Ocean State Forecast (OSF) from Indian National Centre for Ocean Information Services (INCOIS).',
      },
    };
  }
}
