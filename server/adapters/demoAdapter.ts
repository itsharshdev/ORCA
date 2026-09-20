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
    const regionName = region === 'tamil_nadu' ? 'Tamil Nadu Coast' : 'Maharashtra Coast';

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
        metadata: {
          region,
          regionName,
          dedup_key: `${region}_significant_wave_height`,
          sensorType: 'BUOY_SIMULATION',
          periodSeconds: weather.currentConditions.wavePeriodSeconds,
        },
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
          region,
          regionName,
          dedup_key: `${region}_sustained_wind_speed`,
          gustKnots: weather.currentConditions.windGustKnots,
          directionCompass: weather.currentConditions.windDirection,
          directionDegrees: weather.currentConditions.windDirectionDegrees,
        },
      });
    }

    // 3. Weather: Air Temperature
    if (typeof weather.currentConditions?.airTemperatureCelsius === 'number') {
      const cond = (weather.currentConditions as Record<string, unknown>)?.weatherCondition || (weather.currentConditions as Record<string, unknown>)?.seaState || 'Fair';
      normalizedObservations.push({
        category: 'WEATHER',
        variableName: 'air_temperature',
        numericValue: weather.currentConditions.airTemperatureCelsius,
        unit: 'degC',
        location: {
          lat: weather.currentConditions.location.latitude,
          lon: weather.currentConditions.location.longitude,
        },
        observedAt,
        validUntil,
        status: 'DEMO_SNAPSHOT',
        qualityLevel: 'HIGH',
        metadata: {
          region,
          regionName,
          dedup_key: `${region}_air_temperature`,
          condition: cond,
        },
      });
    }

    // 4. Weather: Visibility
    if (typeof weather.currentConditions?.visibilityKm === 'number') {
      normalizedObservations.push({
        category: 'WEATHER',
        variableName: 'visibility_distance',
        numericValue: weather.currentConditions.visibilityKm,
        unit: 'km',
        location: {
          lat: weather.currentConditions.location.latitude,
          lon: weather.currentConditions.location.longitude,
        },
        observedAt,
        validUntil,
        status: 'DEMO_SNAPSHOT',
        qualityLevel: 'HIGH',
        metadata: {
          region,
          regionName,
          dedup_key: `${region}_visibility_distance`,
        },
      });
    }

    // 5. Ocean: Sea Surface Temperature
    if (typeof ocean.parameters?.seaSurfaceTemperatureCelsius === 'number') {
      normalizedObservations.push({
        category: 'OCEAN',
        variableName: 'sea_surface_temperature',
        numericValue: ocean.parameters.seaSurfaceTemperatureCelsius,
        unit: 'degC',
        location: {
          lat: weather.currentConditions.location.latitude,
          lon: weather.currentConditions.location.longitude,
        },
        observedAt: ocean.metadata?.updatedAt || observedAt,
        validUntil: ocean.metadata?.validUntil || validUntil,
        status: 'DEMO_SNAPSHOT',
        qualityLevel: 'HIGH',
        metadata: {
          region,
          regionName,
          dedup_key: `${region}_sea_surface_temperature`,
          sstAnomaly: ocean.parameters.sstAnomalyCelsius,
        },
      });
    }

    // 6. Ocean: Chlorophyll Concentration
    if (typeof ocean.parameters?.chlorophyllConcentrationMgM3 === 'number') {
      normalizedObservations.push({
        category: 'PFZ',
        variableName: 'chlorophyll_concentration',
        numericValue: ocean.parameters.chlorophyllConcentrationMgM3,
        unit: 'mg/m3',
        location: {
          lat: weather.currentConditions.location.latitude,
          lon: weather.currentConditions.location.longitude,
        },
        observedAt: ocean.metadata?.updatedAt || observedAt,
        validUntil: ocean.metadata?.validUntil || validUntil,
        status: 'DEMO_SNAPSHOT',
        qualityLevel: 'HIGH',
        metadata: {
          region,
          regionName,
          dedup_key: `${region}_chlorophyll_concentration`,
          gradient: ocean.parameters.chlorophyllGradient,
        },
      });
    }

    // 7. Ocean: Surface Currents
    if (typeof ocean.parameters?.surfaceCurrentKnots === 'number') {
      normalizedObservations.push({
        category: 'OCEAN',
        variableName: 'surface_current_velocity',
        numericValue: ocean.parameters.surfaceCurrentKnots,
        unit: 'knots',
        location: {
          lat: weather.currentConditions.location.latitude,
          lon: weather.currentConditions.location.longitude,
        },
        observedAt: ocean.metadata?.updatedAt || observedAt,
        validUntil: ocean.metadata?.validUntil || validUntil,
        status: 'DEMO_SNAPSHOT',
        qualityLevel: 'HIGH',
        metadata: {
          region,
          regionName,
          dedup_key: `${region}_surface_current_velocity`,
          direction: ocean.parameters.currentDirection,
          salinityPsu: ocean.parameters.salinityPsu,
          mixedLayerDepthMeters: ocean.parameters.mixedLayerDepthMeters,
        },
      });
    }

    // 8. Ocean: Tidal Forecast (if present)
    const tideForecast = (ocean as Record<string, unknown>).tideForecast as { datum?: string; highTideHeightMeters?: number } | undefined;
    if (tideForecast) {
      normalizedObservations.push({
        category: 'OCEAN',
        variableName: 'tidal_forecast',
        numericValue: tideForecast.highTideHeightMeters ?? null,
        unit: 'm',
        structuredValue: tideForecast as Record<string, unknown>,
        observedAt: ocean.metadata?.updatedAt || observedAt,
        validUntil: ocean.metadata?.validUntil || validUntil,
        status: 'DEMO_SNAPSHOT',
        qualityLevel: 'HIGH',
        metadata: {
          region,
          regionName,
          dedup_key: `${region}_tidal_forecast`,
          datum: tideForecast.datum,
        },
      });
    }

    // 9. Weather: Cyclone Alert Flag
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
      metadata: {
        region,
        regionName,
        dedup_key: `${region}_cyclone_alert_active`,
        agency: 'IMD_SIMULATED',
      },
    });

    // 10. PFZ: Zones
    if (Array.isArray(pfz.zones)) {
      for (const zone of pfz.zones) {
        normalizedObservations.push({
          category: 'PFZ',
          variableName: 'potential_fishing_zone',
          numericValue: typeof zone.distanceKmFromPort === 'number' ? zone.distanceKmFromPort : null,
          unit: 'km',
          structuredValue: zone as Record<string, unknown>,
          location: {
            lat: zone.location.latitude,
            lon: zone.location.longitude,
          },
          observedAt: pfz.metadata?.updatedAt || observedAt,
          validUntil: pfz.metadata?.validUntil || validUntil,
          status: 'DEMO_SNAPSHOT',
          qualityLevel: 'HIGH',
          metadata: {
            region,
            regionName,
            dedup_key: `${region}_${zone.id}`,
            zoneId: zone.id,
            zoneName: zone.zoneName,
            potentialScore: zone.potentialScore,
            recommendedFishTypes: zone.recommendedFishTypes,
          },
        });
      }
    }

    // 11. Hazards: Marine Alerts
    if (Array.isArray(hazards.alerts)) {
      for (const alert of hazards.alerts) {
        normalizedObservations.push({
          category: 'HAZARD',
          variableName: 'coastal_hazard_alert',
          numericValue: null,
          unit: null,
          structuredValue: alert as Record<string, unknown>,
          observedAt: hazards.metadata?.updatedAt || observedAt,
          validUntil: hazards.metadata?.validUntil || validUntil,
          status: 'DEMO_SNAPSHOT',
          qualityLevel: 'HIGH',
          metadata: {
            region,
            regionName,
            dedup_key: `${region}_${alert.id}`,
            alertId: alert.id,
            title: alert.title,
            severity: alert.severity,
            hazardType: alert.hazardType,
            isActive: alert.isActive,
          },
        });
      }
    }

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
