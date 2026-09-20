import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import { adapterRegistry } from '../adapters/registry.js';
import { DemoDataAdapter } from '../adapters/demoAdapter.js';
import { withTimeout, createErrorAdapterResponse } from '../adapters/errorBoundary.js';
import type { DataAdapter, AdapterQuery, AdapterResponse } from '../adapters/types.js';

describe('ORCA Phase 6 — Data Adapter Framework Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Adapter Registry & Lookup', () => {
    it('should have pre-registered demo adapters', () => {
      expect(adapterRegistry.has('ORCA_DEMO', 'demo_marine_conditions')).toBe(true);
      expect(adapterRegistry.has('ORCA_DEMO', 'demo_pfz_advisories')).toBe(true);
    });

    it('should retrieve a registered adapter successfully', () => {
      const adapter = adapterRegistry.get('ORCA_DEMO', 'demo_marine_conditions');
      expect(adapter).toBeDefined();
      expect(adapter.source).toBe('ORCA_DEMO');
      expect(adapter.dataset).toBe('demo_marine_conditions');
    });

    it('should throw clear error when requested adapter does not exist', () => {
      expect(() => {
        adapterRegistry.get('UNKNOWN_AGENCY', 'non_existent_dataset');
      }).toThrowError(/not found for source 'UNKNOWN_AGENCY'/);
    });

    it('should list all registered adapters with honest live status', () => {
      const list = adapterRegistry.list();
      expect(list.length).toBeGreaterThanOrEqual(2);
      const demoAdapters = list.filter((a) => a.sourceType === 'DEMO');
      expect(demoAdapters.every((a) => a.isLive === false)).toBe(true);
      const incoisAdapter = list.find((a) => a.source === 'INCOIS_OSF');
      if (incoisAdapter) {
        expect(incoisAdapter.isLive).toBe(true);
      }
    });
  });

  describe('2. Demo Data Adapter & Normalization', () => {
    const demoAdapter = new DemoDataAdapter('demo_marine_conditions');

    it('should return honest non-live metadata and READY status', async () => {
      const res = await demoAdapter.fetch({ regionId: 'maharashtra' });
      expect(res.source).toBe('ORCA_DEMO');
      expect(res.dataset).toBe('demo_marine_conditions');
      expect(res.sourceType).toBe('DEMO');
      expect(res.status).toBe('READY');
      expect(res.isLive).toBe(false);
      expect(res.quality).toBe('HIGH');
      expect(res.retrievedAt).toBeDefined();
      expect(res.observedAt).toBeDefined();
      expect(res.metadata.isSimulated).toBe(true);
    });

    it('should normalize raw ocean and weather parameters into standard observations', async () => {
      const res = await demoAdapter.fetch({ regionId: 'maharashtra' });
      expect(res.normalizedObservations).toBeInstanceOf(Array);
      expect(res.normalizedObservations.length).toBeGreaterThanOrEqual(4);

      // Check wave height observation
      const waveObs = res.normalizedObservations.find((o) => o.variableName === 'significant_wave_height');
      expect(waveObs).toBeDefined();
      expect(waveObs?.category).toBe('OCEAN');
      expect(waveObs?.unit).toBe('m');
      expect(waveObs?.numericValue).toBe(1.4);
      expect(waveObs?.status).toBe('DEMO_SNAPSHOT');

      // Check wind speed observation
      const windObs = res.normalizedObservations.find((o) => o.variableName === 'sustained_wind_speed');
      expect(windObs).toBeDefined();
      expect(windObs?.category).toBe('WEATHER');
      expect(windObs?.unit).toBe('knots');
      expect(windObs?.numericValue).toBe(12.5);

      // Check SST observation
      const sstObs = res.normalizedObservations.find((o) => o.variableName === 'sea_surface_temperature');
      expect(sstObs).toBeDefined();
      expect(sstObs?.category).toBe('OCEAN');
      expect(sstObs?.numericValue).toBe(27.8);
    });

    it('should handle region switching to Tamil Nadu seamlessly', async () => {
      const res = await demoAdapter.fetch({ regionId: 'tamil_nadu' });
      expect(res.status).toBe('READY');
      expect(res.metadata.region).toBe('tamil_nadu');
      expect(res.normalizedObservations.length).toBeGreaterThanOrEqual(4);
    });

    it('should report health check status accurately', async () => {
      const health = await demoAdapter.checkHealth();
      expect(health.status).toBe('READY');
      expect(health.latencyMs).toBeGreaterThanOrEqual(0);
      expect(health.message).toContain('Demo static dataset');
    });
  });

  describe('3. Error Boundary & Failure Handling', () => {
    it('should enforce timeout on slow adapters without crashing', async () => {
      // Mock slow adapter
      const slowPromise = new Promise((resolve) => setTimeout(resolve, 200));
      await expect(withTimeout(slowPromise, 50, 'Timeout triggered')).rejects.toThrowError('Timeout triggered');
    });

    it('should format structured error responses on failure', () => {
      const errorRes = createErrorAdapterResponse(
        'MOCK_FAILING_SOURCE',
        'failing_dataset',
        'INCOIS_OSF',
        'UNAVAILABLE',
        {
          code: 'UPSTREAM_503',
          message: 'Upstream gateway timed out',
        }
      );

      expect(errorRes.status).toBe('UNAVAILABLE');
      expect(errorRes.isLive).toBe(false);
      expect(errorRes.quality).toBe('DEGRADED');
      expect(errorRes.normalizedObservations).toEqual([]);
      expect(errorRes.error?.code).toBe('UPSTREAM_503');
      expect(errorRes.metadata.handledByErrorBoundary).toBe(true);
    });

    it('should gracefully handle malformed source payloads', async () => {
      class MalformedAdapter implements DataAdapter {
        readonly source = 'MALFORMED_SRC';
        readonly dataset = 'broken_feed';
        readonly sourceType = 'IMD_WEATHER' as const;

        async checkHealth() {
          return { status: 'DEGRADED' as const, latencyMs: 5, message: 'Broken feed' };
        }

        async fetch(query: AdapterQuery = {}): Promise<AdapterResponse> {
          void query;
          try {
            // Simulate malformed JSON parse failure
            JSON.parse('{ invalid json ');
            return {} as any;
          } catch (err) {
            return createErrorAdapterResponse(
              this.source,
              this.dataset,
              this.sourceType,
              'INVALID_RESPONSE',
              { code: 'JSON_PARSE_ERROR', message: (err as Error).message }
            );
          }
        }
      }

      const brokenAdapter = new MalformedAdapter();
      const res = await brokenAdapter.fetch({});
      expect(res.status).toBe('INVALID_RESPONSE');
      expect(res.error?.code).toBe('JSON_PARSE_ERROR');
    });
  });

  describe('4. Adapter Framework HTTP API Endpoints', () => {
    it('GET /api/v1/adapters should return registered adapter inventory', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/adapters',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.count).toBeGreaterThanOrEqual(2);
      expect(body.adapters).toBeInstanceOf(Array);
      expect(body.frameworkVersion).toBe('1.0.0-phase6');

      const demoEntry = body.adapters.find((a: any) => a.source === 'ORCA_DEMO');
      expect(demoEntry).toBeDefined();
      expect(demoEntry.status).toBe('READY');
    });

    it('POST /api/v1/adapters/ORCA_DEMO/demo_marine_conditions/fetch should return normalized observations', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/adapters/ORCA_DEMO/demo_marine_conditions/fetch',
        payload: {
          regionId: 'maharashtra',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.source).toBe('ORCA_DEMO');
      expect(body.status).toBe('READY');
      expect(body.isLive).toBe(false);
      expect(body.normalizedObservations).toBeInstanceOf(Array);
      expect(body.normalizedObservations.length).toBeGreaterThanOrEqual(4);
    });

    it('POST /api/v1/adapters/NON_EXISTENT/feed/fetch should return 404 ADAPTER_NOT_FOUND', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/adapters/NON_EXISTENT/feed/fetch',
        payload: {},
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
      expect(body.error.code).toBe('ADAPTER_NOT_FOUND');
    });
  });
});
