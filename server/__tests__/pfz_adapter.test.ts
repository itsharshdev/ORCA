import { describe, it, expect, beforeEach } from 'vitest';
import {
  IncoisPfzAdapter,
  calculateHaversineDistanceKm,
  calculateBearing,
  degreesToCompass,
  julianDayToIsoDate,
  calculateMidpoint,
  extractLineCoordinates,
} from '../adapters/incoisPfzAdapter.js';
import { adapterRegistry } from '../adapters/registry.js';
import { ingestionService } from '../services/ingestionService.js';
import { buildApp } from '../app.js';
import type { FastifyInstance } from 'fastify';

// Representative real INCOIS GeoServer WFS response fixture (PFZ_Automation:pfzlines)
const mockIncoisPfzGeoJson = {
  type: 'FeatureCollection',
  totalFeatures: 2,
  features: [
    {
      type: 'Feature',
      id: 'pfzlines.1',
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [72.5563894, 19.77209204],
            [72.5000000, 19.70000000],
            [72.4400000, 19.65000000],
          ],
        ],
      },
      geometry_name: 'the_geom',
      properties: {
        Shape_Leng: 15.0799208815,
        Shape_Area: 13.8834494587,
        State_Name: 'MAHARASHTRA',
        SECTORBOUN: '3',
        SECTORBO_1: '3',
        Julian_day: '268',
        Sno: '001',
        Year: 2026,
        UID: '2026268001',
        Length: 29.1574278377,
      },
    },
    {
      type: 'Feature',
      id: 'pfzlines.2',
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [72.3500000, 19.45000000],
            [72.3000000, 19.40000000],
          ],
        ],
      },
      geometry_name: 'the_geom',
      properties: {
        Shape_Leng: 12.5,
        State_Name: 'MAHARASHTRA',
        Julian_day: '268',
        Sno: '002',
        Year: 2026,
        UID: '2026268002',
        Length: 18.5,
      },
    },
  ],
};

describe('ORCA Phase 10 — Official INCOIS PFZ Integration', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    ingestionService.clearInMemoryObservations();
  });

  // --------------------------------------------------------------------------
  // 1. Math & Coordinate Helper Functions
  // --------------------------------------------------------------------------
  describe('1. Math & Coordinate Utilities', () => {
    it('correctly converts Julian day of year to ISO calendar date', () => {
      // 2026 is non-leap year (Day 268 = Sept 25, 2026)
      const date268 = julianDayToIsoDate(2026, 268);
      expect(date268).toBe('2026-09-25');

      const date1 = julianDayToIsoDate(2026, 1);
      expect(date1).toBe('2026-01-01');
    });

    it('calculates accurate Haversine distances in kilometers', () => {
      // Distance between Mumbai (18.92, 72.83) and Satpati (19.72, 72.70) is ~89 km
      const distance = calculateHaversineDistanceKm(18.92, 72.83, 19.72, 72.70);
      expect(distance).toBeGreaterThan(80);
      expect(distance).toBeLessThan(100);
    });

    it('calculates initial bearing and 8-point compass cardinal directions', () => {
      // Due North
      const bearingNorth = calculateBearing(10.0, 70.0, 11.0, 70.0);
      expect(bearingNorth).toBeCloseTo(0, 0);
      expect(degreesToCompass(bearingNorth)).toBe('N');

      // Southwest bearing
      const bearingSW = calculateBearing(18.92, 72.83, 18.50, 72.30);
      expect(degreesToCompass(bearingSW)).toBe('SW');
    });

    it('extracts flat line coordinates and calculates midpoint', () => {
      const coords = extractLineCoordinates(mockIncoisPfzGeoJson.features[0].geometry);
      expect(coords.length).toBe(3);
      expect(coords[0]).toEqual([72.5563894, 19.77209204]);

      const midpoint = calculateMidpoint(coords);
      expect(midpoint.lat).toBe(19.7);
      expect(midpoint.lon).toBe(72.5);
    });
  });

  // --------------------------------------------------------------------------
  // 2. IncoisPfzAdapter Contract & Normalization
  // --------------------------------------------------------------------------
  describe('2. IncoisPfzAdapter Contract & Normalization', () => {
    it('implements DataAdapter interface with correct identity and metadata', () => {
      const adapter = new IncoisPfzAdapter();
      expect(adapter.source).toBe('INCOIS_PFZ');
      expect(adapter.dataset).toBe('pfz_advisories');
      expect(adapter.sourceType).toBe('INCOIS_PFZ');
      expect(typeof adapter.fetch).toBe('function');
      expect(typeof adapter.checkHealth).toBe('function');
    });

    it('is registered in the global adapterRegistry', () => {
      expect(adapterRegistry.has('INCOIS_PFZ', 'pfz_advisories')).toBe(true);
      const adapter = adapterRegistry.get('INCOIS_PFZ', 'pfz_advisories');
      expect(adapter).toBeInstanceOf(IncoisPfzAdapter);
    });

    it('normalizes real INCOIS WFS GeoJSON into standardized NormalizedObservationPayload', () => {
      const adapter = new IncoisPfzAdapter();
      const context = {
        lat: 18.92,
        lon: 72.83,
        region: 'maharashtra',
        retrievedAt: '2026-09-26T06:00:00Z',
      };

      const response = adapter.normalizePfzPayload(mockIncoisPfzGeoJson, context);

      expect(response.status).toBe('READY');
      expect(response.isLive).toBe(true);
      expect(response.normalizedObservations.length).toBe(2);

      const obs1 = response.normalizedObservations[0];
      expect(obs1.category).toBe('PFZ');
      expect(obs1.variableName).toBe('pfz_opportunity_zone');
      expect(obs1.numericValue).toBe(29.16); // lengthKm
      expect(obs1.unit).toBe('km');
      expect(obs1.observedAt).toBe('2026-09-25T00:00:00Z');
      expect(obs1.metadata?.agency).toBe('INCOIS');
      expect(obs1.metadata?.dedup_key).toBe('pfz_2026268001');

      // Structured Value contains rich mission-aware fields
      const sv = obs1.structuredValue as Record<string, unknown>;
      expect(sv.uid).toBe('2026268001');
      expect(sv.stateName).toBe('MAHARASHTRA');
      expect(sv.distanceKm).toBeDefined();
      expect(sv.bearingDeg).toBeDefined();
      expect(sv.directionCompass).toBeDefined();
      expect(sv.isSafetyClearance).toBe(false); // Safety separation
    });

    it('rejects malformed GeoJSON payload with INVALID_RESPONSE status', () => {
      const adapter = new IncoisPfzAdapter();
      const context = {
        lat: 18.92,
        lon: 72.83,
        region: 'maharashtra',
        retrievedAt: '2026-09-26T06:00:00Z',
      };

      const malformedPayload = { invalid: 'payload', notAFeatureCollection: true };
      const response = adapter.normalizePfzPayload(malformedPayload, context);

      expect(response.status).toBe('INVALID_RESPONSE');
      expect(response.error?.code).toBe('INCOIS_PFZ_SCHEMA_VALIDATION_FAILED');
      expect(response.normalizedObservations.length).toBe(0);
    });

    it('detects and marks expired PFZ advisories as STALE / DEGRADED', () => {
      const adapter = new IncoisPfzAdapter();
      const oldGeoJson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 'pfzlines.old',
            geometry: {
              type: 'LineString',
              coordinates: [[72.5, 19.7], [72.4, 19.6]],
            },
            properties: {
              Year: 2024,
              Julian_day: '100', // Long expired
              UID: '2024100001',
              Length: 15.0,
            },
          },
        ],
      };

      const response = adapter.normalizePfzPayload(oldGeoJson, {
        lat: 18.92,
        lon: 72.83,
        region: 'maharashtra',
        retrievedAt: '2026-09-26T06:00:00Z',
      });

      expect(response.normalizedObservations.length).toBe(1);
      const obs = response.normalizedObservations[0];
      expect(obs.status).toBe('STALE');
      expect(obs.qualityLevel).toBe('DEGRADED');
    });
  });

  // --------------------------------------------------------------------------
  // 3. IngestionService & Persistence Verification
  // --------------------------------------------------------------------------
  describe('3. IngestionService PFZ Ingestion', () => {
    it('ingests PFZ observations into storage with idempotent deduplication', async () => {
      // Mock adapter to return deterministic fixture
      class MockPfzAdapter extends IncoisPfzAdapter {
        async fetch() {
          return this.normalizePfzPayload(mockIncoisPfzGeoJson, {
            lat: 18.92,
            lon: 72.83,
            region: 'maharashtra',
            retrievedAt: '2026-09-26T06:00:00Z',
          });
        }
      }

      const mockAdapter = new MockPfzAdapter();

      // First Ingestion
      const res1 = await ingestionService.ingestPfzData({
        region: 'maharashtra',
        adapter: mockAdapter,
      });

      expect(res1.success).toBe(true);
      expect(res1.isLive).toBe(true);
      expect(res1.result.totalReceived).toBe(2);
      expect(res1.result.inserted).toBe(2);

      // Verify Query
      const queryRes = await ingestionService.getObservations({ category: 'PFZ' });
      expect(queryRes.count).toBe(2);
      expect(queryRes.observations[0].category).toBe('PFZ');
      expect(queryRes.observations[0].variable_name).toBe('pfz_opportunity_zone');

      // Second Ingestion (Idempotent update/deduplication)
      const res2 = await ingestionService.ingestPfzData({
        region: 'maharashtra',
        adapter: mockAdapter,
      });

      expect(res2.success).toBe(true);
      expect(res2.result.totalReceived).toBe(2);
    });

    it('falls back to demo snapshot if upstream fails and fallback is enabled', async () => {
      class FailingPfzAdapter extends IncoisPfzAdapter {
        async fetch(): Promise<any> {
          return {
            source: 'INCOIS_PFZ',
            dataset: 'pfz_advisories',
            sourceType: 'INCOIS_PFZ',
            status: 'UNAVAILABLE',
            retrievedAt: new Date().toISOString(),
            observedAt: new Date().toISOString(),
            validUntil: null,
            quality: 'LOW',
            isLive: false,
            payload: null,
            normalizedObservations: [],
            error: { code: 'INCOIS_UNAVAILABLE', message: 'GeoServer offline' },
            metadata: {},
          };
        }
      }

      const res = await ingestionService.ingestPfzData({
        region: 'maharashtra',
        allowFallback: true,
        adapter: new FailingPfzAdapter(),
      });

      expect(res.success).toBe(true);
      expect(res.isLive).toBe(false);
      expect(res.fallbackUsed).toBe(true);
      expect(res.source).toBe('ORCA_DEMO');
      expect(res.dataset).toBe('demo_pfz_advisories');
    });
  });

  // --------------------------------------------------------------------------
  // 4. HTTP API Endpoints (GET /api/v1/pfz & POST /api/v1/ingestion/pfz)
  // --------------------------------------------------------------------------
  describe('4. HTTP API Endpoints', () => {
    beforeEach(async () => {
      app = await buildApp();
    });

    it('GET /api/v1/pfz returns mission-relevant opportunities with safety separation', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/pfz?latitude=18.92&longitude=72.83&region=maharashtra',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.source).toBeDefined();
      expect(body.opportunities).toBeInstanceOf(Array);
      expect(body.safetySeparation).toBeDefined();
      expect(body.safetySeparation.isSafetyClearance).toBe(false);
      expect(body.safetySeparation.mandatoryCheck).toContain('IMD Marine Warnings');
    });

    it('POST /api/v1/ingestion/pfz triggers ingestion and returns structured summary', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/ingestion/pfz',
        payload: {
          region: 'maharashtra',
          allowFallback: true,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.source).toBeDefined();
      expect(body.dataset).toBeDefined();
      expect(body.summary).toBeDefined();
    });

    it('rejects invalid ingestion payload with 400 Validation Error', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/ingestion/pfz',
        payload: {
          latitude: 999, // Invalid latitude
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
