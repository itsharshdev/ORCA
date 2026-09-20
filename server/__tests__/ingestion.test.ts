import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import { ingestionService } from '../services/ingestionService.js';
import { DemoDataAdapter } from '../adapters/demoAdapter.js';

describe('ORCA Phase 7 — Demo Data Normalization & Ingestion Pipeline', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Ingestion Service & Data Adapter Normalization', () => {
    it('normalizes demo data into complete observation records with honest DEMO_SNAPSHOT status', async () => {
      const adapter = new DemoDataAdapter('demo_marine_conditions');
      const response = await adapter.fetch({ regionId: 'maharashtra' });

      expect(response.status).toBe('READY');
      expect(response.isLive).toBe(false);
      expect(response.source).toBe('ORCA_DEMO');
      expect(response.sourceType).toBe('DEMO');
      expect(response.normalizedObservations.length).toBeGreaterThan(0);

      // Verify each observation conforms to contract
      for (const obs of response.normalizedObservations) {
        expect(obs.status).toBe('DEMO_SNAPSHOT');
        expect(obs.status).not.toBe('LIVE');
        expect(obs.qualityLevel).toBe('HIGH');
        expect(obs.observedAt).toBeDefined();
        expect(obs.metadata?.region).toBe('maharashtra');
        expect(obs.metadata?.dedup_key).toBeDefined();
      }

      // Check specific parameters
      const waveObs = response.normalizedObservations.find((o) => o.variableName === 'significant_wave_height');
      expect(waveObs).toBeDefined();
      expect(waveObs?.category).toBe('OCEAN');
      expect(waveObs?.numericValue).toBe(1.4);
      expect(waveObs?.unit).toBe('m');

      const windObs = response.normalizedObservations.find((o) => o.variableName === 'sustained_wind_speed');
      expect(windObs).toBeDefined();
      expect(windObs?.category).toBe('WEATHER');
      expect(windObs?.numericValue).toBe(12.5);
      expect(windObs?.unit).toBe('knots');
    });

    it('normalizes Tamil Nadu regional demo data accurately', async () => {
      const adapter = new DemoDataAdapter('demo_marine_conditions');
      const response = await adapter.fetch({ regionId: 'tamil_nadu' });

      expect(response.status).toBe('READY');
      expect(response.metadata.region).toBe('tamil_nadu');

      const waveObs = response.normalizedObservations.find((o) => o.variableName === 'significant_wave_height');
      expect(waveObs).toBeDefined();
      expect(waveObs?.numericValue).toBe(1.3);
    });

    it('ingests and normalizes demo data across multiple regions via IngestionService', async () => {
      const summary = await ingestionService.ingestDemoData({
        regions: ['maharashtra', 'tamil_nadu'],
      });

      expect(summary.success).toBe(true);
      expect(summary.regionsProcessed).toContain('maharashtra');
      expect(summary.regionsProcessed).toContain('tamil_nadu');
      expect(summary.totalObservationsProcessed).toBeGreaterThan(10);
      expect(summary.errors).toHaveLength(0);
    });

    it('guarantees idempotency: repeated ingestion updates or preserves rows without doubling count', async () => {
      // First run
      const firstRun = await ingestionService.ingestDemoData({ regions: ['maharashtra'] });
      expect(firstRun.success).toBe(true);

      // Query count after first run
      const countAfterFirst = await ingestionService.getObservations({ region: 'maharashtra' });

      // Second run immediately after
      const secondRun = await ingestionService.ingestDemoData({ regions: ['maharashtra'] });
      expect(secondRun.success).toBe(true);

      // Query count after second run
      const countAfterSecond = await ingestionService.getObservations({ region: 'maharashtra' });

      // Count of unique observations must remain unchanged
      expect(countAfterSecond.total).toBe(countAfterFirst.total);
    });
  });

  describe('2. Ingestion API Endpoints', () => {
    it('POST /api/v1/ingestion/demo triggers ingestion successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/ingestion/demo',
        payload: {
          regions: ['maharashtra', 'tamil_nadu'],
        },
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.success).toBe(true);
      expect(json.summary.totalProcessed).toBeGreaterThan(0);
      expect(json.summary.regions).toEqual(['maharashtra', 'tamil_nadu']);
      expect(json.resultsByRegion.maharashtra).toBeDefined();
      expect(json.resultsByRegion.tamil_nadu).toBeDefined();
    });

    it('POST /ingestion/demo works via unversioned root alias', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ingestion/demo',
        payload: {
          regions: ['maharashtra'],
        },
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.success).toBe(true);
    });

    it('POST /api/v1/ingestion/demo rejects malformed body parameters with 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/ingestion/demo',
        payload: {
          regions: 'not-an-array',
        },
      });

      expect(response.statusCode).toBe(400);
      const json = response.json();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('3. Observation Read API Endpoints', () => {
    it('GET /api/v1/observations returns persisted normalized observations', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/observations',
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.observations)).toBe(true);
      expect(json.observations.length).toBeGreaterThan(0);

      // Validate observation record schema
      const sample = json.observations[0];
      expect(sample.id).toBeDefined();
      expect(sample.category).toBeDefined();
      expect(sample.variable_name).toBeDefined();
      expect(sample.observed_at).toBeDefined();
      expect(sample.status).toBe('DEMO_SNAPSHOT');
    });

    it('GET /api/v1/observations filters by category accurately', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/observations?category=OCEAN',
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.success).toBe(true);
      for (const obs of json.observations) {
        expect(obs.category).toBe('OCEAN');
      }
    });

    it('GET /api/v1/observations filters by region accurately', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/observations?region=tamil_nadu',
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.success).toBe(true);
      for (const obs of json.observations) {
        expect(obs.raw_metadata?.region).toBe('tamil_nadu');
      }
    });

    it('GET /api/v1/observations supports pagination (limit & offset)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/observations?limit=2&offset=0',
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.success).toBe(true);
      expect(json.count).toBeLessThanOrEqual(2);
      expect(json.limit).toBe(2);
      expect(json.offset).toBe(0);
    });

    it('GET /api/v1/observations rejects invalid category with 400', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/observations?category=INVALID_CATEGORY',
      });

      expect(response.statusCode).toBe(400);
      const json = response.json();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
