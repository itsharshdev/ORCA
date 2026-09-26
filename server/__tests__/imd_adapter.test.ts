import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ImdWeatherAdapter } from '../adapters/imdWeatherAdapter.js';
import { adapterRegistry } from '../adapters/registry.js';
import { IngestionService } from '../services/ingestionService.js';
import { buildApp } from '../app.js';
import type { FastifyInstance } from 'fastify';

describe('ORCA Phase 9.1 — Official IMD Weather & Marine Warning Integration Audit', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp();
    await app.ready();
    IngestionService.getInstance().clearInMemoryObservations();
  });

  afterEach(async () => {
    await app.close();
    vi.restoreAllMocks();
  });

  describe('1. ImdWeatherAdapter Contract & Official Endpoint Alignment', () => {
    it('implements DataAdapter interface with correct identity and metadata', () => {
      const adapter = new ImdWeatherAdapter();
      expect(adapter.source).toBe('IMD_WEATHER');
      expect(adapter.dataset).toBe('coastal_marine_weather');
      expect(adapter.sourceType).toBe('IMD_WEATHER');
    });

    it('is registered in adapterRegistry with isLive = true', () => {
      expect(adapterRegistry.has('IMD_WEATHER', 'coastal_marine_weather')).toBe(true);
      const adapter = adapterRegistry.get('IMD_WEATHER', 'coastal_marine_weather');
      expect(adapter).toBeInstanceOf(ImdWeatherAdapter);
    });

    it('normalizes official IMD /api/v1/current_wx PascalCase station payload accurately', () => {
      const adapter = new ImdWeatherAdapter();
      // Direct array payload as returned by official IMD /api/v1/current_wx endpoint
      const officialCurrentWxPayload = [
        {
          Station_Code: '43003',
          Station_Name: 'Colaba Coastal Observatory',
          Latitude: 18.91,
          Longitude: 72.82,
          Date: '2026-09-25',
          Time: '06:00:00',
          Temp: 29.4,
          Humidity: 78,
          Wind_Speed: 13.0, // knots
          Wind_Direction: 240,
          Gust: 18.0,
          Rainfall: 4.5,
          Visibility: 8.0,
          Weather_Condition: 'Partly Cloudy with Coastal Breeze',
        },
      ];

      const response = adapter.normalizeImdPayload(officialCurrentWxPayload, {
        lat: 18.91,
        lon: 72.82,
        region: 'maharashtra',
        retrievedAt: '2026-09-25T06:05:00Z',
      });

      expect(response.status).toBe('READY');
      expect(response.isLive).toBe(true);
      expect(response.source).toBe('IMD_WEATHER');
      expect(response.normalizedObservations.length).toBeGreaterThanOrEqual(5);

      // Verify wind speed normalized to knots
      const windObs = response.normalizedObservations.find((o) => o.variableName === 'sustained_wind_speed');
      expect(windObs).toBeDefined();
      expect(windObs?.category).toBe('WEATHER');
      expect(windObs?.unit).toBe('knots');
      expect(windObs?.numericValue).toBe(13.0);
      expect(windObs?.qualityLevel).toBe('HIGH');
      expect(windObs?.status).toBe('LIVE');
      expect(windObs?.metadata?.stationName).toBe('Colaba Coastal Observatory');

      // Verify temperature
      const tempObs = response.normalizedObservations.find((o) => o.variableName === 'air_temperature');
      expect(tempObs?.numericValue).toBe(29.4);
      expect(tempObs?.unit).toBe('degC');

      // Verify humidity
      const humObs = response.normalizedObservations.find((o) => o.variableName === 'relative_humidity');
      expect(humObs?.numericValue).toBe(78);
      expect(humObs?.unit).toBe('%');

      // Verify visibility
      const visObs = response.normalizedObservations.find((o) => o.variableName === 'surface_visibility');
      expect(visObs?.numericValue).toBe(8.0);
      expect(visObs?.unit).toBe('km');

      // Verify rainfall
      const rainObs = response.normalizedObservations.find((o) => o.variableName === 'accumulated_rainfall');
      expect(rainObs?.numericValue).toBe(4.5);
      expect(rainObs?.unit).toBe('mm');
    });

    it('normalizes official IMD /api/v1/coastalbulletin and fishermenwarning payloads', () => {
      const adapter = new ImdWeatherAdapter();
      const futureValidUntil = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
      const pastIssuedAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

      // Direct array payload as returned by official IMD /api/v1/coastalbulletin
      const officialCoastalBulletinPayload = [
        {
          Bulletin_Id: 'IMD-WARN-TN-2026-0925-01',
          Area: 'Tamil Nadu & Puducherry Coast',
          Issued_Date: pastIssuedAt,
          Valid_From: pastIssuedAt,
          Valid_Upto: futureValidUntil,
          Warning_Level: 'YELLOW',
          Category: 'FISHERMEN_WARNING',
          Sea_Condition: 'Rough to Very Rough',
          Wind: 40,
          Warning: 'Squally weather with wind speed reaching 35-45 kmph likely along and off Tamil Nadu coast. Fishermen advised not to venture into sea.',
          Fishermen_Warning: true,
        },
      ];

      const response = adapter.normalizeImdPayload(officialCoastalBulletinPayload, {
        lat: 10.76,
        lon: 79.84,
        region: 'tamil_nadu',
        retrievedAt: new Date().toISOString(),
      });

      expect(response.status).toBe('READY');
      expect(response.isLive).toBe(true);

      const warningObs = response.normalizedObservations.find((o) => o.variableName === 'imd_marine_warning');
      expect(warningObs).toBeDefined();
      expect(warningObs?.category).toBe('HAZARD');
      expect(warningObs?.numericValue).toBe(1); // Active warning
      expect(warningObs?.status).toBe('LIVE');
      expect(warningObs?.qualityLevel).toBe('HIGH');
      expect(warningObs?.structuredValue?.warningLevel).toBe('YELLOW');
      expect(warningObs?.structuredValue?.isFishermenAdvisedToAvoidSea).toBe(true);
      expect(warningObs?.structuredValue?.isWarningActive).toBe(true);
      expect(warningObs?.structuredValue?.isExpired).toBe(false);
    });

    it('marks expired warnings as STALE and DEGRADED quality without treating as active', () => {
      const adapter = new ImdWeatherAdapter();
      const pastTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const olderTime = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

      const mockExpiredPayload = [
        {
          Bulletin_Id: 'IMD-WARN-EXPIRED',
          Area: 'Maharashtra Coast',
          Issued_Date: olderTime,
          Valid_From: olderTime,
          Valid_Upto: pastTime, // Expired yesterday
          Warning_Level: 'ORANGE',
          Category: 'SQUALL_ALERT',
          Warning: 'Old squall alert from previous day',
          Fishermen_Warning: false,
        },
      ];

      const response = adapter.normalizeImdPayload(mockExpiredPayload, {
        lat: 18.92,
        lon: 72.83,
        region: 'maharashtra',
        retrievedAt: new Date().toISOString(),
      });

      const warningObs = response.normalizedObservations.find((o) => o.variableName === 'imd_marine_warning');
      expect(warningObs).toBeDefined();
      expect(warningObs?.status).toBe('STALE');
      expect(warningObs?.qualityLevel).toBe('DEGRADED');
      expect(warningObs?.numericValue).toBe(0); // Not active
      expect(warningObs?.structuredValue?.isWarningActive).toBe(false);
      expect(warningObs?.structuredValue?.isExpired).toBe(true);
    });

    it('returns INVALID_RESPONSE and isLive = false when payload is malformed', () => {
      const adapter = new ImdWeatherAdapter();
      const malformedPayload = {
        invalidKey: 'totally malformed json without weather fields',
        corrupted: [1, 2, 3],
        stationWeather: {
          latitude: 'not-a-number', // violates number constraint
        },
      };

      const response = adapter.normalizeImdPayload(malformedPayload, {
        lat: 18.92,
        lon: 72.83,
        region: 'maharashtra',
        retrievedAt: new Date().toISOString(),
      });

      expect(response.status).toBe('INVALID_RESPONSE');
      expect(response.isLive).toBe(false);
      expect(response.error?.code).toBe('IMD_SCHEMA_VALIDATION_FAILED');
      expect(response.normalizedObservations).toHaveLength(0);
    });

    it('gracefully handles network failure with UNAVAILABLE or TIMEOUT status and isLive = false', async () => {
      const adapter = new ImdWeatherAdapter('https://unreachable-imd-mock.gov.in');
      const response = await adapter.fetch({ timeoutMs: 1000 });

      expect(['UNAVAILABLE', 'TIMEOUT']).toContain(response.status);
      expect(response.isLive).toBe(false);
      expect(response.error).toBeDefined();
    });
  });

  describe('2. IngestionService with IMD Feed & Fallback', () => {
    it('persists normalized IMD observations into Supabase/in-memory store', async () => {
      const mockAdapter = new ImdWeatherAdapter();
      mockAdapter.fetch = async () => {
        return mockAdapter.normalizeImdPayload(
          [
            {
              Station_Code: '43003',
              Station_Name: 'Colaba Observatory',
              Latitude: 18.91,
              Longitude: 72.82,
              Date: '2026-09-25',
              Time: '06:00:00',
              Temp: 28.6,
              Humidity: 82,
              Wind_Speed: 11.5,
              Visibility: 10.0,
            },
          ],
          {
            lat: 18.91,
            lon: 72.82,
            region: 'maharashtra',
            retrievedAt: new Date().toISOString(),
          }
        );
      };

      const ingestion = IngestionService.getInstance();
      const result = await ingestion.ingestImdData({
        region: 'maharashtra',
        latitude: 18.91,
        longitude: 72.82,
        adapter: mockAdapter,
      });

      expect(result.success).toBe(true);
      expect(result.isLive).toBe(true);
      expect(result.fallbackUsed).toBe(false);
      expect(result.result.totalReceived).toBeGreaterThanOrEqual(4);

      // Verify retrieval through getObservations
      const stored = await ingestion.getObservations({
        datasetIdentifier: 'coastal_marine_weather',
        region: 'maharashtra',
      });

      expect(stored.count).toBeGreaterThanOrEqual(4);
      expect(stored.observations.some((o) => o.variable_name === 'air_temperature')).toBe(true);
      expect(stored.observations.some((o) => o.variable_name === 'sustained_wind_speed')).toBe(true);
    });

    it('performs idempotent updates on duplicate ingestion without duplicating rows', async () => {
      const mockAdapter = new ImdWeatherAdapter();
      const fixedObsTime = '2026-09-25T06:00:00Z';

      mockAdapter.fetch = async () => {
        return mockAdapter.normalizeImdPayload(
          {
            source: 'IMD_WEATHER',
            region: 'maharashtra',
            stationWeather: {
              stationId: '43003',
              stationName: 'Colaba Observatory',
              latitude: 18.91,
              longitude: 72.82,
              observedAt: fixedObsTime,
              temperatureC: 28.6,
              humidityPercent: 82,
              windSpeedKnots: 11.5,
            },
          },
          {
            lat: 18.91,
            lon: 72.82,
            region: 'maharashtra',
            retrievedAt: new Date().toISOString(),
          }
        );
      };

      const ingestion = IngestionService.getInstance();
      
      // Ingest first time
      const res1 = await ingestion.ingestImdData({
        region: 'maharashtra',
        adapter: mockAdapter,
      });
      expect(res1.success).toBe(true);

      const beforeCount = (await ingestion.getObservations({ datasetIdentifier: 'coastal_marine_weather', region: 'maharashtra' })).count;

      // Ingest second time with same observation timestamp (dedup key matching)
      const res2 = await ingestion.ingestImdData({
        region: 'maharashtra',
        adapter: mockAdapter,
      });
      expect(res2.success).toBe(true);

      const afterCount = (await ingestion.getObservations({ datasetIdentifier: 'coastal_marine_weather', region: 'maharashtra' })).count;
      expect(afterCount).toBe(beforeCount);
    });

    it('engages demo fallback cleanly when IMD is unreachable and allowFallback is true', async () => {
      const mockFailingAdapter = new ImdWeatherAdapter();
      mockFailingAdapter.fetch = async () => {
        return {
          source: 'IMD_WEATHER',
          dataset: 'coastal_marine_weather',
          sourceType: 'IMD_WEATHER',
          status: 'UNAVAILABLE',
          retrievedAt: new Date().toISOString(),
          observedAt: new Date().toISOString(),
          validUntil: null,
          quality: 'DEGRADED',
          isLive: false,
          payload: null,
          normalizedObservations: [],
          error: { code: 'IMD_UNAVAILABLE', message: 'Mock offline' },
          metadata: {},
        };
      };

      const ingestion = IngestionService.getInstance();
      const result = await ingestion.ingestImdData({
        region: 'maharashtra',
        allowFallback: true,
        adapter: mockFailingAdapter,
      });

      expect(result.success).toBe(true);
      expect(result.isLive).toBe(false);
      expect(result.fallbackUsed).toBe(true);
      expect(result.source).toBe('ORCA_DEMO');
      expect(result.result.totalReceived).toBeGreaterThan(0);
    });
  });

  describe('3. POST /api/v1/ingestion/imd API Endpoint', () => {
    it('POST /api/v1/ingestion/imd triggers ingestion and returns structured summary', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/ingestion/imd',
        payload: {
          latitude: 18.92,
          longitude: 72.83,
          region: 'maharashtra',
          allowFallback: true,
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json).toHaveProperty('success');
      expect(json).toHaveProperty('source');
      expect(json).toHaveProperty('dataset');
      expect(json).toHaveProperty('isLive');
      expect(json).toHaveProperty('summary');
      expect(json.summary).toHaveProperty('totalReceived');
      expect(json.summary).toHaveProperty('observedAt');
    });

    it('POST /ingestion/imd root alias works seamlessly', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/ingestion/imd',
        payload: {
          latitude: 10.76,
          longitude: 79.84,
          region: 'tamil_nadu',
          allowFallback: true,
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
    });

    it('POST /api/v1/ingestion/imd rejects invalid coordinates with 400', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/ingestion/imd',
        payload: {
          latitude: 999, // Out of range [-90, 90]
          longitude: 72.83,
        },
      });

      expect(res.statusCode).toBe(400);
      const json = JSON.parse(res.payload);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
