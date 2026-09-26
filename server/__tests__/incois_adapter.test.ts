import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import { IncoisOsfAdapter } from '../adapters/incoisOsfAdapter.js';
import { adapterRegistry } from '../adapters/registry.js';
import { ingestionService } from '../services/ingestionService.js';

describe('ORCA Phase 8 — Official INCOIS Oceanography Data Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. IncoisOsfAdapter Contract & Normalization', () => {
    it('implements DataAdapter interface with correct identity and metadata', () => {
      const adapter = new IncoisOsfAdapter();
      expect(adapter.source).toBe('INCOIS_OSF');
      expect(adapter.dataset).toBe('ocean_state_forecast');
      expect(adapter.sourceType).toBe('INCOIS_OSF');
    });

    it('is registered in adapterRegistry with isLive = true', () => {
      expect(adapterRegistry.has('INCOIS_OSF', 'ocean_state_forecast')).toBe(true);
      const adapter = adapterRegistry.get('INCOIS_OSF', 'ocean_state_forecast');
      expect(adapter).toBeInstanceOf(IncoisOsfAdapter);

      const list = adapterRegistry.list();
      const incoisEntry = list.find((e) => e.source === 'INCOIS_OSF');
      expect(incoisEntry).toBeDefined();
      expect(incoisEntry?.isLive).toBe(true);
    });

    it('normalizes standard official INCOIS ERDDAP TableDAP JSON payload accurately', () => {
      const adapter = new IncoisOsfAdapter();

      // Sample mock response conforming to official INCOIS ERDDAP schema
      const mockErddapJson = {
        table: {
          columnNames: [
            'time',
            'latitude',
            'longitude',
            'significant_wave_height',
            'wave_period',
            'swell_wave_height',
            'swell_period',
            'sea_surface_temperature',
            'surface_current_speed',
            'wind_speed',
          ],
          columnUnits: ['UTC', 'degrees_north', 'degrees_east', 'm', 's', 'm', 's', 'degree_C', 'm s-1', 'm s-1'],
          columnTypes: ['String', 'float', 'float', 'float', 'float', 'float', 'float', 'float', 'float', 'float'],
          rows: [
            ['2026-09-20T06:00:00Z', 18.9, 72.8, 1.45, 6.8, 1.1, 8.5, 28.2, 0.5, 6.0],
          ],
        },
      };

      const response = adapter.normalizeIncoisPayload(mockErddapJson, {
        lat: 18.92,
        lon: 72.83,
        gridLat: 18.9,
        gridLon: 72.8,
        region: 'maharashtra',
        retrievedAt: '2026-09-20T06:15:00.000Z',
      });

      expect(response.status).toBe('READY');
      expect(response.isLive).toBe(true);
      expect(response.source).toBe('INCOIS_OSF');
      expect(response.observedAt).toBe('2026-09-20T06:00:00Z');
      expect(response.validUntil).toBeDefined();
      expect(response.normalizedObservations.length).toBe(6);

      // Verify Significant Wave Height (Hs)
      const swh = response.normalizedObservations.find((o) => o.variableName === 'significant_wave_height');
      expect(swh).toBeDefined();
      expect(swh?.category).toBe('OCEAN');
      expect(swh?.numericValue).toBe(1.45);
      expect(swh?.unit).toBe('m');
      expect(swh?.status).toBe('LIVE');
      expect(swh?.metadata?.agency).toBe('INCOIS');
      expect(swh?.metadata?.sourceGrid).toEqual({ lat: 18.9, lon: 72.8 });

      // Verify Sea Surface Temperature (SST)
      const sst = response.normalizedObservations.find((o) => o.variableName === 'sea_surface_temperature');
      expect(sst).toBeDefined();
      expect(sst?.category).toBe('OCEAN');
      expect(sst?.numericValue).toBe(28.2);
      expect(sst?.unit).toBe('degC');
      expect(sst?.status).toBe('LIVE');

      // Verify Surface Current Velocity (converted m/s -> knots: 0.5 * 1.94384 = 0.97 knots)
      const current = response.normalizedObservations.find((o) => o.variableName === 'surface_current_velocity');
      expect(current).toBeDefined();
      expect(current?.category).toBe('OCEAN');
      expect(current?.numericValue).toBe(0.97);
      expect(current?.unit).toBe('knots');

      // Verify Wind Speed (converted m/s -> knots: 6.0 * 1.94384 = 11.7 knots)
      const wind = response.normalizedObservations.find((o) => o.variableName === 'sustained_wind_speed');
      expect(wind).toBeDefined();
      expect(wind?.category).toBe('WEATHER');
      expect(wind?.numericValue).toBe(11.7);
      expect(wind?.unit).toBe('knots');
    });

    it('returns INVALID_RESPONSE and isLive = false when payload is malformed', () => {
      const adapter = new IncoisOsfAdapter();
      const malformedPayload = { unexpectedFormat: true, data: [1, 2, 3] };

      const response = adapter.normalizeIncoisPayload(malformedPayload, {
        lat: 18.92,
        lon: 72.83,
        gridLat: 18.9,
        gridLon: 72.8,
        region: 'maharashtra',
        retrievedAt: new Date().toISOString(),
      });

      expect(response.status).toBe('INVALID_RESPONSE');
      expect(response.isLive).toBe(false);
      expect(response.error?.code).toBe('INCOIS_SCHEMA_VALIDATION_FAILED');
      expect(response.normalizedObservations).toHaveLength(0);
    });

    it('gracefully handles network failure with UNAVAILABLE or TIMEOUT status and isLive = false', async () => {
      // Create adapter pointing to invalid unreachable domain
      const adapter = new IncoisOsfAdapter('https://unreachable-incois-mock.gov.in');
      const response = await adapter.fetch({ timeoutMs: 1000 });

      expect(['UNAVAILABLE', 'TIMEOUT']).toContain(response.status);
      expect(response.isLive).toBe(false);
      expect(response.error).toBeDefined();
    });
  });

  describe('2. IngestionService with INCOIS Feed & Fallback', () => {
    it('persists normalized INCOIS observations into Supabase/in-memory store', async () => {
      // Mock adapter that returns valid ERDDAP response
      const mockAdapter = new IncoisOsfAdapter();
      mockAdapter.fetch = async () => {
        return mockAdapter.normalizeIncoisPayload(
          {
            table: {
              columnNames: ['time', 'significant_wave_height', 'sea_surface_temperature', 'wind_speed'],
              rows: [['2026-09-20T06:00:00Z', 1.6, 28.5, 7.5]],
            },
          },
          {
            lat: 13.08,
            lon: 80.27,
            gridLat: 13.1,
            gridLon: 80.3,
            region: 'tamil_nadu',
            retrievedAt: new Date().toISOString(),
          }
        );
      };

      const result = await ingestionService.ingestIncoisData({
        adapter: mockAdapter,
        region: 'tamil_nadu',
      });

      expect(result.success).toBe(true);
      expect(result.isLive).toBe(true);
      expect(result.source).toBe('INCOIS_OSF');
      expect(result.result.inserted + result.result.updated).toBeGreaterThan(0);

      // Verify observation query returns the persisted INCOIS observation
      const queryResult = await ingestionService.getObservations({
        region: 'tamil_nadu',
        category: 'OCEAN',
        variableName: 'significant_wave_height',
      });

      expect(queryResult.count).toBeGreaterThan(0);
    });

    it('engages demo fallback cleanly when INCOIS is unreachable and allowFallback is true', async () => {
      const failingAdapter = new IncoisOsfAdapter('https://unreachable-incois.gov.in');
      failingAdapter.fetch = async () => {
        return {
          source: 'INCOIS_OSF',
          dataset: 'ocean_state_forecast',
          sourceType: 'INCOIS_OSF',
          status: 'UNAVAILABLE',
          retrievedAt: new Date().toISOString(),
          observedAt: new Date().toISOString(),
          quality: 'DEGRADED',
          isLive: false,
          payload: null,
          normalizedObservations: [],
          error: { code: 'NETWORK_ERROR', message: 'Connection refused' },
          metadata: {},
        };
      };

      const result = await ingestionService.ingestIncoisData({
        adapter: failingAdapter,
        region: 'maharashtra',
        allowFallback: true,
      });

      expect(result.success).toBe(true);
      expect(result.isLive).toBe(false);
      expect(result.fallbackUsed).toBe(true);
      expect(result.source).toBe('ORCA_DEMO');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('3. POST /api/v1/ingestion/incois API Endpoint', () => {
    it('POST /api/v1/ingestion/incois triggers ingestion and returns structured summary', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/ingestion/incois',
        payload: {
          region: 'maharashtra',
          latitude: 18.92,
          longitude: 72.83,
          allowFallback: true,
        },
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.success).toBe(true);
      expect(json.source).toBeDefined();
      expect(json.summary).toBeDefined();
      expect(typeof json.summary.totalReceived).toBe('number');
    });

    it('POST /ingestion/incois root alias works seamlessly', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ingestion/incois',
        payload: {
          region: 'tamil_nadu',
          allowFallback: true,
        },
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.success).toBe(true);
    });

    it('POST /api/v1/ingestion/incois rejects invalid coordinates with 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/ingestion/incois',
        payload: {
          latitude: 999.0, // Invalid latitude > 90
        },
      });

      expect(response.statusCode).toBe(400);
      const json = response.json();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
