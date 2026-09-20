import type {
  DataAdapter,
  AdapterQuery,
  AdapterResponse,
  NormalizedObservationPayload,
  AdapterStatus,
} from './types.js';
import { withTimeout, createErrorAdapterResponse } from './errorBoundary.js';

// Import raw demo datasets
import oceanMh from '../../data/demo/ocean.json';
import weatherMh from '../../data/demo/weather.json';
import pfzMh from '../../data/demo/pfz.json';
import hazardsMh from '../../data/demo/hazards.json';

import oceanTn from '../../data/demo/regions/tamil_nadu/ocean.json';
import weatherTn from '../../data/demo/regions/tamil_nadu/weather.json';
import pfzTn from '../../data/demo/regions/tamil_nadu/pfz.json';
import hazardsTn from '../../data/demo/regions/tamil_nadu/hazards.json';

export class DemoDataAdapter implements DataAdapter<AdapterQuery, Record<string, unknown>> {
  readonly source = 'ORCA_DEMO';
  readonly dataset: string;
  readonly sourceType = 'DEMO' as const;

  constructor(dataset = 'demo_marine_conditions') {
    this.dataset = dataset;
  }

  async checkHealth(): Promise<{ status: AdapterStatus; latencyMs: number; message: string }> {
    const start = Date.now();
    return {
      status: 'READY',
      latencyMs: Date.now() - start,
      message: 'Demo static dataset is loaded and available for evaluation.',
    };
  }

  async fetch(query: AdapterQuery = {}): Promise<AdapterResponse<Record<string, unknown>>> {
    const timeoutMs = query.timeoutMs ?? 5000;

    try {
      return await withTimeout(this.executeFetch(query), timeoutMs);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown adapter error';
      const isTimeout = message.toLowerCase().includes('timed out');
      return createErrorAdapterResponse(
        this.source,
        this.dataset,
        this.sourceType,
        isTimeout ? 'TIMEOUT' : 'UNAVAILABLE',
        {
          code: isTimeout ? 'ADAPTER_TIMEOUT' : 'FETCH_FAILURE',
          message,
        },
        { query }
      );
    }
  }

  private async executeFetch(query: AdapterQuery): Promise<AdapterResponse<Record<string, unknown>>> {
    const region = (query.regionId?.toLowerCase() === 'tamil_nadu') ? 'tamil_nadu' : 'maharashtra';
    const ocean = region === 'tamil_nadu' ? oceanTn : oceanMh;
    const weather = region === 'tamil_nadu' ? weatherTn : weatherMh;
    const pfz = region === 'tamil_nadu' ? pfzTn : pfzMh;
    const hazards = region === 'tamil_nadu' ? hazardsTn : hazardsMh;

    const retrievedAt = new Date().toISOString();
    const observedAt = weather.metadata?.updatedAt || '2026-09-02T06:30:00Z';
    const validUntil = weather.metadata?.validUntil || '2026-09-03T06:30:00Z';

    const normalizedObservations: NormalizedObservationPayload[] = [];

    // 1. Weather: Wave Height
    if (typeof weather.currentConditions?.waveHeightMeters === 'number') {
      normalizedObservations.push({
        category: 'OCEAN',
        variableName: 'significant_wave_height',
        numericValue: weather.currentConditions.waveHeightMeters,
        unit: 'm',
        location: {
          lat: weather.currentConditions.location.latitude,
          lon: weather.currentConditions.location.longitude,
        },
        observedAt,
        validUntil,
        status: 'DEMO_SNAPSHOT',
        qualityLevel: 'HIGH',
        uncertaintyRange: { min: weather.currentConditions.waveHeightMeters - 0.2, max: weather.currentConditions.waveHeightMeters + 0.2 },
        metadata: { sensorType: 'BUOY_SIMULATION', periodSeconds: weather.currentConditions.wavePeriodSeconds },
      });
    }

    // 2. Weather: Wind Speed & Gusts
    if (typeof weather.currentConditions?.windSpeedKnots === 'number') {
      normalizedObservations.push({
        category: 'WEATHER',
        variableName: 'sustained_wind_speed',
        numericValue: weather.currentConditions.windSpeedKnots,
        unit: 'knots',
        location: {
          lat: weather.currentConditions.location.latitude,
          lon: weather.currentConditions.location.longitude,
        },
        observedAt,
        validUntil,
        status: 'DEMO_SNAPSHOT',
        qualityLevel: 'HIGH',
        metadata: {
          gustKnots: weather.currentConditions.windGustKnots,
          directionCompass: weather.currentConditions.windDirection,
          directionDegrees: weather.currentConditions.windDirectionDegrees,
        },
      });
    }

    // 3. Ocean: Sea Surface Temperature
    if (typeof ocean.parameters?.seaSurfaceTemperatureCelsius === 'number') {
      normalizedObservations.push({
        category: 'OCEAN',
        variableName: 'sea_surface_temperature',
        numericValue: ocean.parameters.seaSurfaceTemperatureCelsius,
        unit: 'degC',
        observedAt: ocean.metadata?.updatedAt || observedAt,
        validUntil: ocean.metadata?.validUntil || validUntil,
        status: 'DEMO_SNAPSHOT',
        qualityLevel: 'HIGH',
        metadata: { sstAnomaly: ocean.parameters.sstAnomalyCelsius },
      });
    }

    // 4. Ocean: Chlorophyll
    if (typeof ocean.parameters?.chlorophyllConcentrationMgM3 === 'number') {
      normalizedObservations.push({
        category: 'PFZ',
        variableName: 'chlorophyll_concentration',
        numericValue: ocean.parameters.chlorophyllConcentrationMgM3,
        unit: 'mg/m3',
        observedAt: ocean.metadata?.updatedAt || observedAt,
        validUntil: ocean.metadata?.validUntil || validUntil,
        status: 'DEMO_SNAPSHOT',
        qualityLevel: 'HIGH',
        metadata: { gradient: ocean.parameters.chlorophyllGradient },
      });
    }

    // 5. Weather: Cyclone Alert Flag
    normalizedObservations.push({
      category: 'WEATHER',
      variableName: 'cyclone_alert_active',
      numericValue: weather.currentConditions?.cycloneAlert ? 1 : 0,
      unit: 'boolean',
      structuredValue: {
        active: Boolean(weather.currentConditions?.cycloneAlert),
        lightningAlert: Boolean((weather.currentConditions as Record<string, unknown>)?.lightningAlert),
      },
      observedAt,
      validUntil,
      status: 'DEMO_SNAPSHOT',
      qualityLevel: 'HIGH',
      metadata: { agency: 'IMD_SIMULATED' },
    });

    const rawPayload = {
      region,
      ocean,
      weather,
      pfz,
      hazards,
    };

    return {
      source: this.source,
      dataset: this.dataset,
      sourceType: this.sourceType,
      status: 'READY',
      retrievedAt,
      observedAt,
      validUntil,
      quality: 'HIGH',
      isLive: false,
      payload: rawPayload,
      normalizedObservations,
      error: null,
      metadata: {
        region,
        isSimulated: true,
        disclaimer: 'Deterministic simulated dataset for SIH26176 evaluation. Not live telemetry.',
      },
    };
  }
}
