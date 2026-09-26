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
// Official IMD API Response Validation Schemas (Zod)
// Supporting official IMD API endpoints:
// - GET /api/v1/coastalbulletin
// - GET /api/v1/seabulletin
// - GET /api/v1/fishermenwarning
// - GET /api/v1/current_wx
// - GET /api/v1/portwarning
// ============================================================================

/**
 * Flexible Station Weather Item (handles official IMD casing & field conventions)
 */
export const imdStationWeatherItemSchema = z.object({
  Station_Code: z.union([z.string(), z.number()]).optional(),
  station_code: z.union([z.string(), z.number()]).optional(),
  stationId: z.union([z.string(), z.number()]).optional(),
  Station_Name: z.string().optional(),
  station_name: z.string().optional(),
  stationName: z.string().optional(),
  Latitude: z.number().optional(),
  latitude: z.number().optional(),
  lat: z.number().optional(),
  Longitude: z.number().optional(),
  longitude: z.number().optional(),
  lon: z.number().optional(),
  Date: z.string().optional(),
  Time: z.string().optional(),
  observedAt: z.string().optional(),
  observed_at: z.string().optional(),
  Temp: z.number().optional(),
  Temperature: z.number().optional(),
  temperature: z.number().optional(),
  temperatureC: z.number().optional(),
  Humidity: z.number().optional(),
  humidity: z.number().optional(),
  humidityPercent: z.number().optional(),
  Wind_Speed: z.number().optional(),
  WIND_SPEED: z.number().optional(),
  wind_speed: z.number().optional(),
  windSpeedKmph: z.number().optional(),
  windSpeedKnots: z.number().optional(),
  Wind_Direction: z.union([z.string(), z.number()]).optional(),
  WIND_DIRECTION: z.union([z.string(), z.number()]).optional(),
  wind_direction: z.union([z.string(), z.number()]).optional(),
  windDirectionDeg: z.number().optional(),
  windDirectionCompass: z.string().optional(),
  Gust: z.number().optional(),
  gustSpeedKnots: z.number().optional(),
  Rainfall: z.number().optional(),
  rainfall: z.number().optional(),
  rainfallMm: z.number().optional(),
  Pressure: z.number().optional(),
  pressure: z.number().optional(),
  pressureHpa: z.number().optional(),
  Visibility: z.number().optional(),
  visibility: z.number().optional(),
  visibilityKm: z.number().optional(),
  Weather_Condition: z.string().optional(),
  weather_condition: z.string().optional(),
  weatherCondition: z.string().optional(),
});

/**
 * Flexible Marine Warning / Coastal Bulletin Item
 */
export const imdMarineWarningItemSchema = z.object({
  Bulletin_Id: z.string().optional(),
  bulletin_id: z.string().optional(),
  bulletinId: z.string().optional(),
  Area: z.string().optional(),
  coastal_zone: z.string().optional(),
  coastalZone: z.string().optional(),
  Issued_Date: z.string().optional(),
  issue_date: z.string().optional(),
  issuedAt: z.string().optional(),
  issued_at: z.string().optional(),
  Valid_From: z.string().optional(),
  valid_from: z.string().optional(),
  validFrom: z.string().optional(),
  Valid_Upto: z.string().optional(),
  Valid_To: z.string().optional(),
  valid_to: z.string().optional(),
  validUntil: z.string().optional(),
  valid_until: z.string().optional(),
  Warning_Level: z.string().optional(),
  warning_level: z.string().optional(),
  warningLevel: z.string().optional(),
  Category: z.string().optional(),
  warningCategory: z.string().optional(),
  warning_category: z.string().optional(),
  Sea_Condition: z.string().optional(),
  sea_condition: z.string().optional(),
  seaCondition: z.string().optional(),
  Wind: z.union([z.string(), z.number()]).optional(),
  wind_warning: z.union([z.string(), z.number()]).optional(),
  windWarningKnotsMin: z.number().optional(),
  windWarningKnotsMax: z.number().optional(),
  Warning: z.string().optional(),
  Warning_Text: z.string().optional(),
  advisory_text: z.string().optional(),
  advisoryText: z.string().optional(),
  Fishermen_Warning: z.union([z.boolean(), z.string()]).optional(),
  isFishermenAdvisedToAvoidSea: z.boolean().optional(),
  avoid_sea: z.boolean().optional(),
  activeSystems: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      location: z.object({ lat: z.number().optional(), lon: z.number().optional() }).optional(),
      movement: z.string().optional(),
    })
  ).optional(),
});

/**
 * Composite IMD Payload Schema (handles direct array from official APIs or composite JSON)
 */
export const imdWeatherPayloadSchema = z.union([
  z.array(z.union([imdStationWeatherItemSchema, imdMarineWarningItemSchema])),
  z.object({
    source: z.string().optional().default('IMD_WEATHER'),
    region: z.string().optional(),
    stationWeather: imdStationWeatherItemSchema.optional(),
    marineWarning: imdMarineWarningItemSchema.optional(),
    bulletins: z.array(imdMarineWarningItemSchema).optional(),
    data: z.array(z.union([imdStationWeatherItemSchema, imdMarineWarningItemSchema])).optional(),
  }),
]);

export type ImdRawPayload = z.infer<typeof imdWeatherPayloadSchema> | Record<string, unknown>;

export interface ImdWeatherQuery extends AdapterQuery {
  stationCode?: string;
  coastalSector?: string;
  includeWarnings?: boolean;
  endpoint?: 'coastalbulletin' | 'seabulletin' | 'fishermenwarning' | 'current_wx' | 'composite';
}

/**
 * Official IMD (India Meteorological Department) Weather & Marine Warning Adapter
 * Implements DataAdapter<ImdWeatherQuery, ImdRawPayload>
 * Connects to official IMD API Management Platform (https://api.imd.gov.in/api/v1/...)
 */
export class ImdWeatherAdapter implements DataAdapter<ImdWeatherQuery, ImdRawPayload> {
  readonly source = 'IMD_WEATHER';
  readonly dataset = 'coastal_marine_weather';
  readonly sourceType = 'IMD_WEATHER' as const;

  private baseUrl: string;
  private apiKey?: string;
  private authToken?: string;

  constructor(baseUrl?: string, apiKey?: string, authToken?: string) {
    this.baseUrl = (baseUrl || process.env.IMD_API_BASE_URL || 'https://api.imd.gov.in').replace(/\/+$/, '');
    this.apiKey = apiKey || process.env.IMD_API_KEY;
    this.authToken = authToken || process.env.IMD_AUTH_TOKEN;
  }

  async checkHealth(): Promise<{ status: AdapterStatus; latencyMs: number; message: string }> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      // Official IMD reference portal check
      const res = await fetch(`${this.baseUrl}/public/api_reference.html`, {
        signal: controller.signal,
        headers: { 'Accept': 'text/html,application/json' },
      });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - start;
      if (res.ok) {
        return {
          status: 'READY',
          latencyMs,
          message: 'Official IMD Weather API service portal is reachable.',
        };
      }

      return {
        status: 'DEGRADED',
        latencyMs,
        message: `IMD service portal responded with HTTP ${res.status}.`,
      };
    } catch (err) {
      const latencyMs = Date.now() - start;
      const msg = err instanceof Error ? err.message : 'Unknown network error';
      return {
        status: 'UNAVAILABLE',
        latencyMs,
        message: `Official IMD API unreachable: ${msg}`,
      };
    }
  }

  async fetch(query: ImdWeatherQuery = {}): Promise<AdapterResponse<ImdRawPayload>> {
    const timeoutMs = query.timeoutMs ?? 6000;

    try {
      return await withTimeout(this.executeFetch(query, timeoutMs), timeoutMs);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'IMD adapter execution error';
      const isTimeout = message.toLowerCase().includes('timed out');
      return createErrorAdapterResponse(
        this.source,
        this.dataset,
        this.sourceType,
        isTimeout ? 'TIMEOUT' : 'UNAVAILABLE',
        {
          code: isTimeout ? 'IMD_TIMEOUT' : 'IMD_UNAVAILABLE',
          message,
        },
        { query, baseUrl: this.baseUrl }
      );
    }
  }

  private async executeFetch(query: ImdWeatherQuery, timeoutMs: number): Promise<AdapterResponse<ImdRawPayload>> {
    const lat = query.latitude ?? (query.regionId?.toLowerCase() === 'tamil_nadu' ? 10.76 : 18.92);
    const lon = query.longitude ?? (query.regionId?.toLowerCase() === 'tamil_nadu' ? 79.84 : 72.83);
    const region = query.regionId || (lat < 14 ? 'tamil_nadu' : 'maharashtra');
    const retrievedAt = new Date().toISOString();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs - 500);

    const stationParam = query.stationCode || (region === 'tamil_nadu' ? '43347' : '43003');
    
    // Official IMD API endpoints:
    // 1. /api/v1/coastalbulletin (Coastal marine bulletin and weather warnings)
    // 2. /api/v1/current_wx?id={stationCode} (Station surface observations)
    const targetEndpoint = query.endpoint || 'coastalbulletin';
    let url = `${this.baseUrl}/api/v1/${targetEndpoint}`;
    if (targetEndpoint === 'current_wx') {
      url += `?id=${stationParam}`;
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'ORCA-Marine-Intelligence/1.0 (SIH26176)',
    };

    if (this.apiKey) {
      headers['X-Api-Key'] = this.apiKey;
    }
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    } else if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    let rawResponse: Response;
    try {
      rawResponse = await fetch(url, {
        signal: controller.signal,
        headers,
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
          code: isAbort ? 'IMD_TIMEOUT' : 'IMD_NETWORK_FAILURE',
          message: isAbort ? `Request to IMD timed out after ${timeoutMs}ms` : `Could not connect to official IMD API: ${msg}`,
        },
        { requestedLocation: { lat, lon }, region, targetUrl: url }
      );
    } finally {
      clearTimeout(timer);
    }

    if (!rawResponse.ok) {
      return createErrorAdapterResponse(
        this.source,
        this.dataset,
        this.sourceType,
        rawResponse.status === 429 ? 'RATE_LIMITED' : rawResponse.status === 401 || rawResponse.status === 403 ? 'UNAVAILABLE' : 'UNAVAILABLE',
        {
          code: `IMD_HTTP_${rawResponse.status}`,
          message: `Official IMD API (${targetEndpoint}) returned HTTP ${rawResponse.status} ${rawResponse.statusText}`,
          statusCode: rawResponse.status,
        },
        { requestedLocation: { lat, lon }, targetUrl: url }
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
          code: 'IMD_INVALID_JSON',
          message: `Failed to parse JSON response from IMD: ${parseErr instanceof Error ? parseErr.message : ''}`,
        },
        { requestedLocation: { lat, lon }, targetUrl: url }
      );
    }

    return this.normalizeImdPayload(parsedJson, { lat, lon, region, retrievedAt });
  }

  /**
   * Normalizes an IMD weather/warning payload into standard NormalizedObservationPayload format.
   * Public to allow deterministic unit testing of parsing logic.
   */
  public normalizeImdPayload(
    payload: unknown,
    context: {
      lat: number;
      lon: number;
      region: string;
      retrievedAt: string;
    }
  ): AdapterResponse<ImdRawPayload> {
    const parseResult = imdWeatherPayloadSchema.safeParse(payload);

    if (!parseResult.success) {
      return createErrorAdapterResponse(
        this.source,
        this.dataset,
        this.sourceType,
        'INVALID_RESPONSE',
        {
          code: 'IMD_SCHEMA_VALIDATION_FAILED',
          message: 'Received IMD payload did not match schema specifications.',
          details: parseResult.error.flatten(),
        },
        { context }
      );
    }

    const normalizedObservations: NormalizedObservationPayload[] = [];
    const now = new Date();
    const regionName = context.region === 'tamil_nadu' ? 'Tamil Nadu Coast' : 'Maharashtra Coast';

    let observedAt = context.retrievedAt;
    let validUntil: string | null = null;

    // Collect all station weather items & warning items
    const stationItems: z.infer<typeof imdStationWeatherItemSchema>[] = [];
    const warningItems: z.infer<typeof imdMarineWarningItemSchema>[] = [];

    if (Array.isArray(payload)) {
      for (const item of payload) {
        if (typeof item === 'object' && item !== null) {
          const rec = item as Record<string, unknown>;
          if (rec.Temp !== undefined || rec.Temperature !== undefined || rec.temperatureC !== undefined || rec.Wind_Speed !== undefined || rec.WIND_SPEED !== undefined || rec.windSpeedKnots !== undefined) {
            stationItems.push(rec as z.infer<typeof imdStationWeatherItemSchema>);
          }
          if (rec.Warning_Level !== undefined || rec.warningLevel !== undefined || rec.Sea_Condition !== undefined || rec.advisoryText !== undefined || rec.Warning !== undefined || rec.Fishermen_Warning !== undefined) {
            warningItems.push(rec as z.infer<typeof imdMarineWarningItemSchema>);
          }
        }
      }
    } else if (typeof payload === 'object' && payload !== null) {
      const obj = payload as Record<string, unknown>;
      if (obj.stationWeather) {
        stationItems.push(obj.stationWeather as z.infer<typeof imdStationWeatherItemSchema>);
      }
      if (obj.marineWarning) {
        warningItems.push(obj.marineWarning as z.infer<typeof imdMarineWarningItemSchema>);
      }
      if (Array.isArray(obj.bulletins)) {
        warningItems.push(...(obj.bulletins as z.infer<typeof imdMarineWarningItemSchema>[]));
      }
      if (Array.isArray(obj.data)) {
        for (const item of obj.data) {
          const rec = item as Record<string, unknown>;
          if (rec.Temp !== undefined || rec.Temperature !== undefined || rec.temperatureC !== undefined || rec.Wind_Speed !== undefined || rec.WIND_SPEED !== undefined) {
            stationItems.push(rec as z.infer<typeof imdStationWeatherItemSchema>);
          }
          if (rec.Warning_Level !== undefined || rec.warningLevel !== undefined || rec.Sea_Condition !== undefined || rec.Warning !== undefined) {
            warningItems.push(rec as z.infer<typeof imdMarineWarningItemSchema>);
          }
        }
      }
    }

    // 1. Process Station Weather Items
    for (const sw of stationItems) {
      const obsTime = sw.observedAt || sw.observed_at || (sw.Date && sw.Time ? `${sw.Date}T${sw.Time}Z` : context.retrievedAt);
      observedAt = obsTime;
      const obsLoc = {
        lat: sw.Latitude || sw.latitude || sw.lat || context.lat,
        lon: sw.Longitude || sw.longitude || sw.lon || context.lon,
      };

      const stationName = sw.Station_Name || sw.station_name || sw.stationName || 'Coastal Observatory';

      // Sustained Wind Speed (knots standard)
      const rawWindSpeed = sw.windSpeedKnots ?? sw.Wind_Speed ?? sw.WIND_SPEED ?? sw.wind_speed ?? (sw.windSpeedKmph ? Number((sw.windSpeedKmph * 0.539957).toFixed(1)) : undefined);
      if (rawWindSpeed !== undefined) {
        const knots = Number(rawWindSpeed);
        normalizedObservations.push({
          category: 'WEATHER',
          variableName: 'sustained_wind_speed',
          numericValue: knots,
          unit: 'knots',
          location: obsLoc,
          observedAt: obsTime,
          validUntil: null,
          status: 'LIVE',
          qualityLevel: 'HIGH',
          uncertaintyRange: { min: Math.max(0, knots - 2), max: knots + 2 },
          metadata: {
            agency: 'IMD',
            stationName,
            region: context.region,
            regionName,
            dedup_key: `${context.region}_imd_wind_speed`,
            windDirectionDeg: sw.Wind_Direction ?? sw.windDirectionDeg,
            windDirectionCompass: sw.windDirectionCompass,
          },
        });
      }

      // Wind Gusts
      const gust = sw.gustSpeedKnots ?? sw.Gust;
      if (gust !== undefined && gust > 0) {
        normalizedObservations.push({
          category: 'WEATHER',
          variableName: 'wind_gust_speed',
          numericValue: Number(gust),
          unit: 'knots',
          location: obsLoc,
          observedAt: obsTime,
          validUntil: null,
          status: 'LIVE',
          qualityLevel: 'HIGH',
          metadata: {
            agency: 'IMD',
            stationName,
            region: context.region,
            regionName,
            dedup_key: `${context.region}_imd_wind_gust`,
          },
        });
      }

      // Temperature
      const temp = sw.temperatureC ?? sw.Temp ?? sw.Temperature ?? sw.temperature;
      if (temp !== undefined) {
        normalizedObservations.push({
          category: 'WEATHER',
          variableName: 'air_temperature',
          numericValue: Number(temp),
          unit: 'degC',
          location: obsLoc,
          observedAt: obsTime,
          validUntil: null,
          status: 'LIVE',
          qualityLevel: 'HIGH',
          metadata: {
            agency: 'IMD',
            stationName,
            region: context.region,
            regionName,
            dedup_key: `${context.region}_imd_air_temperature`,
          },
        });
      }

      // Relative Humidity
      const humidity = sw.humidityPercent ?? sw.Humidity ?? sw.humidity;
      if (humidity !== undefined) {
        normalizedObservations.push({
          category: 'WEATHER',
          variableName: 'relative_humidity',
          numericValue: Number(humidity),
          unit: '%',
          location: obsLoc,
          observedAt: obsTime,
          validUntil: null,
          status: 'LIVE',
          qualityLevel: 'HIGH',
          metadata: {
            agency: 'IMD',
            stationName,
            region: context.region,
            regionName,
            dedup_key: `${context.region}_imd_humidity`,
          },
        });
      }

      // Visibility
      const visibility = sw.visibilityKm ?? sw.Visibility ?? sw.visibility;
      if (visibility !== undefined) {
        normalizedObservations.push({
          category: 'WEATHER',
          variableName: 'surface_visibility',
          numericValue: Number(visibility),
          unit: 'km',
          location: obsLoc,
          observedAt: obsTime,
          validUntil: null,
          status: 'LIVE',
          qualityLevel: 'HIGH',
          metadata: {
            agency: 'IMD',
            stationName,
            region: context.region,
            regionName,
            dedup_key: `${context.region}_imd_visibility`,
          },
        });
      }

      // Rainfall
      const rain = sw.rainfallMm ?? sw.Rainfall ?? sw.rainfall;
      if (rain !== undefined) {
        normalizedObservations.push({
          category: 'WEATHER',
          variableName: 'accumulated_rainfall',
          numericValue: Number(rain),
          unit: 'mm',
          location: obsLoc,
          observedAt: obsTime,
          validUntil: null,
          status: 'LIVE',
          qualityLevel: 'HIGH',
          metadata: {
            agency: 'IMD',
            stationName,
            region: context.region,
            regionName,
            dedup_key: `${context.region}_imd_rainfall`,
          },
        });
      }
    }

    // 2. Process Marine Warnings & Coastal Bulletins
    for (const warn of warningItems) {
      const issuedAt = warn.issuedAt || warn.issued_at || warn.Issued_Date || warn.issue_date || context.retrievedAt;
      const validFrom = warn.validFrom || warn.valid_from || warn.Valid_From || issuedAt;
      const until = warn.validUntil || warn.valid_until || warn.Valid_Upto || warn.Valid_To || warn.valid_to || new Date(new Date(issuedAt).getTime() + 24 * 60 * 60 * 1000).toISOString();
      validUntil = until;

      const rawLevel = (warn.warningLevel || warn.Warning_Level || warn.warning_level || 'GREEN').toUpperCase();
      const advisoryText = warn.advisoryText || warn.advisory_text || warn.Warning || warn.Warning_Text || 'No severe coastal warning.';
      const seaCondition = warn.seaCondition || warn.sea_condition || warn.Sea_Condition || 'Moderate';
      
      const isAvoidSea = typeof warn.Fishermen_Warning === 'boolean' 
        ? warn.Fishermen_Warning 
        : typeof warn.Fishermen_Warning === 'string' && warn.Fishermen_Warning.toLowerCase().includes('avoid')
        ? true
        : warn.isFishermenAdvisedToAvoidSea || warn.avoid_sea || false;

      // Temporal validity check
      const validUntilDate = new Date(until);
      const isExpired = !isNaN(validUntilDate.getTime()) && validUntilDate < now;
      const isWarningActive = !isExpired && (rawLevel !== 'NONE' && rawLevel !== 'GREEN');

      normalizedObservations.push({
        category: 'HAZARD',
        variableName: 'imd_marine_warning',
        numericValue: isWarningActive ? 1 : 0,
        unit: 'level',
        structuredValue: {
          warningLevel: rawLevel,
          warningCategory: warn.warningCategory || warn.Category || 'FISHERMEN_WARNING',
          advisoryText,
          seaCondition,
          windWarningKnotsMin: warn.windWarningKnotsMin,
          windWarningKnotsMax: warn.windWarningKnotsMax,
          isFishermenAdvisedToAvoidSea: isAvoidSea,
          isWarningActive,
          isExpired,
          activeSystems: warn.activeSystems || [],
          issuedAt,
          validFrom,
          validUntil: until,
        },
        location: { lat: context.lat, lon: context.lon },
        observedAt: issuedAt,
        validUntil: until,
        status: isExpired ? 'STALE' : 'LIVE',
        qualityLevel: isExpired ? 'DEGRADED' : 'HIGH',
        metadata: {
          agency: 'IMD',
          bulletinId: warn.bulletinId || warn.Bulletin_Id || warn.bulletin_id || `IMD-COASTAL-${context.region}`,
          region: context.region,
          regionName,
          dedup_key: `${context.region}_imd_marine_warning`,
          disclaimer: 'Official India Meteorological Department (IMD) Coastal Fishermen & Sea Bulletin.',
        },
      });
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
      payload: payload as ImdRawPayload,
      normalizedObservations,
      error: null,
      metadata: {
        agency: 'IMD',
        sourceType: 'OFFICIAL_IMD_WEATHER',
        requestedLocation: { lat: context.lat, lon: context.lon },
        region: context.region,
        disclaimer: 'Official Weather & Marine Advisory from India Meteorological Department (IMD).',
      },
    };
  }
}
