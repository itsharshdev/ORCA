import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import { GisSafetyService } from '../services/gisSafetyService.js';
import type { RouteEvaluationRequest } from '../types.js';

describe('Phase 11 — Deterministic GIS Safety Layer & Precedence Engine', () => {
  let app: FastifyInstance;
  let gisService: GisSafetyService;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    gisService = GisSafetyService.getInstance();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Spatial Point-in-Polygon Evaluation', () => {
    it('detects point directly inside Naval Anchorage Restricted Polygon', async () => {
      // Coordinates inside [72.82..72.88, 18.91..18.96]
      const input: RouteEvaluationRequest = {
        vesselPosition: {
          latitude: 18.93,
          longitude: 72.85,
        },
      };

      const result = await gisService.evaluateRoute(input);

      expect(result.status).toBe('RESTRICTED');
      expect(result.safetyClearance).toBe(false);
      expect(result.overallVerdict).toBe('AVOID');
      expect(result.restrictions.some((r) => r.intersects && r.bufferBreached)).toBe(true);
      expect(result.summary).toContain('CRITICAL');
    });

    it('clears point far outside all restricted polygons and hazards', async () => {
      // Safe point in open Arabian Sea far from restricted polygons
      const input: RouteEvaluationRequest = {
        vesselPosition: {
          latitude: 18.70,
          longitude: 72.50,
        },
      };

      const result = await gisService.evaluateRoute(input);

      expect(result.status).toBe('CLEAR');
      expect(result.safetyClearance).toBe(true);
      expect(result.overallVerdict).toBe('PASS');
      expect(result.restrictions.every((r) => !r.bufferBreached)).toBe(true);
    });
  });

  describe('2. Route LineString Intersection Evaluation', () => {
    it('detects when planned multi-point route crosses a restricted polygon boundary', async () => {
      // Route starting at Sassoon Docks (18.92, 72.84) crossing into Naval Anchorage
      const input: RouteEvaluationRequest = {
        vesselPosition: { latitude: 18.88, longitude: 72.80 },
        waypoints: [
          { sequenceOrder: 1, latitude: 18.94, longitude: 72.86, label: 'Naval Sector Crossing' },
          { sequenceOrder: 2, latitude: 18.98, longitude: 72.90, label: 'North Harbor' },
        ],
      };

      const result = await gisService.evaluateRoute(input);

      expect(result.status).toBe('RESTRICTED');
      expect(result.safetyClearance).toBe(false);
      expect(result.overallVerdict).toBe('AVOID');
      expect(result.routeIntersections.length).toBeGreaterThan(0);
      expect(result.routeIntersections[0].zoneName).toContain('Naval');
    });

    it('verifies safe clearance when route navigates around restricted boundaries', async () => {
      // Route remaining in safe southern coastal channel
      const input: RouteEvaluationRequest = {
        vesselPosition: { latitude: 18.75, longitude: 72.65 },
        waypoints: [
          { sequenceOrder: 1, latitude: 18.70, longitude: 72.60, label: 'Waypoint 1' },
          { sequenceOrder: 2, latitude: 18.65, longitude: 72.55, label: 'Waypoint 2' },
        ],
      };

      const result = await gisService.evaluateRoute(input);

      expect(result.status).toBe('CLEAR');
      expect(result.safetyClearance).toBe(true);
      expect(result.overallVerdict).toBe('PASS');
      expect(result.routeIntersections.length).toBe(0);
    });
  });

  describe('3. Proximity Checks & Configurable Safety Buffers', () => {
    it('triggers CAUTION status when route approaches within caution buffer (2.5 km)', async () => {
      // Point close to boundary (e.g. ~1.8 km outside Naval Anchorage)
      const input: RouteEvaluationRequest = {
        vesselPosition: { latitude: 18.91, longitude: 72.80 },
        safetyBufferKm: 1.0,
        cautionBufferKm: 2.5,
      };

      const result = await gisService.evaluateRoute(input);

      expect(['CAUTION', 'RESTRICTED']).toContain(result.status);
      if (result.status === 'CAUTION') {
        expect(result.safetyClearance).toBe(true);
        expect(result.overallVerdict).toBe('CAUTION');
        expect(result.summary).toContain('CAUTION');
      }
    });

    it('triggers RESTRICTED status when vessel enters strict 1.0 km safety buffer', async () => {
      // Point very close to boundary (~0.3 km)
      const input: RouteEvaluationRequest = {
        vesselPosition: { latitude: 18.9105, longitude: 72.818 },
        safetyBufferKm: 1.0,
      };

      const result = await gisService.evaluateRoute(input);

      expect(result.status).toBe('RESTRICTED');
      expect(result.safetyClearance).toBe(false);
      expect(result.overallVerdict).toBe('AVOID');
    });
  });

  describe('4. Projected Route Checks', () => {
    it('detects projected track entering restricted zone based on heading and speed', async () => {
      // Vessel at (18.85, 72.85) heading North (0 degrees) at 15 knots for 1 hour -> will enter Naval zone
      const input: RouteEvaluationRequest = {
        vesselPosition: { latitude: 18.85, longitude: 72.85 },
        projectedHeadingDegrees: 0,
        projectedSpeedKnots: 15,
        projectedDurationHours: 1.0,
      };

      const result = await gisService.evaluateRoute(input);

      expect(result.projectedRouteChecks).toBeDefined();
      expect(result.projectedRouteChecks?.intersectsRestricted).toBe(true);
      expect(result.status).toBe('RESTRICTED');
      expect(result.safetyClearance).toBe(false);
    });
  });

  describe('5. Safety Precedence Engine: PFZ Opportunity vs GIS Safety Constraint', () => {
    it('CRITICAL: PFZ opportunity in or crossing restricted area CANNOT override safety constraint', async () => {
      // User targets a PFZ near Malvan MPA or Naval zone, but route breaches restricted zone
      const input: RouteEvaluationRequest = {
        vesselPosition: { latitude: 18.92, longitude: 72.84 },
        waypoints: [
          { sequenceOrder: 1, latitude: 18.94, longitude: 72.85, label: 'PFZ Target in Anchorage' },
        ],
        targetPfzUid: 'INCOIS-PFZ-TEST-999',
      };

      const result = await gisService.evaluateRoute(input);

      // Must be RESTRICTED / AVOID regardless of PFZ
      expect(result.status).toBe('RESTRICTED');
      expect(result.safetyClearance).toBe(false);
      expect(result.overallVerdict).toBe('AVOID');
      expect(result.opportunityConflict).toBeDefined();
      expect(result.opportunityConflict?.isTargetBlocked).toBe(true);
      expect(result.opportunityConflict?.conflictingReason).toContain('Safety constraint overrides fishing opportunity');
    });

    it('PFZ opportunity in safe open waters with clear corridor receives safety clearance', async () => {
      const input: RouteEvaluationRequest = {
        vesselPosition: { latitude: 18.75, longitude: 72.60 },
        waypoints: [
          { sequenceOrder: 1, latitude: 18.70, longitude: 72.50, label: 'Open Sea PFZ Target' },
        ],
        targetPfzUid: 'INCOIS-PFZ-SAFE-001',
      };

      const result = await gisService.evaluateRoute(input);

      expect(result.status).toBe('CLEAR');
      expect(result.safetyClearance).toBe(true);
      expect(result.overallVerdict).toBe('PASS');
      expect(result.opportunityConflict?.isTargetBlocked).toBe(false);
    });
  });

  describe('6. Deterministic Repeatability & Edge Cases', () => {
    it('repeated evaluations of identical input produce identical output', async () => {
      const input: RouteEvaluationRequest = {
        vesselPosition: { latitude: 18.78, longitude: 72.72 },
        waypoints: [{ sequenceOrder: 1, latitude: 18.74, longitude: 72.67 }],
      };

      const run1 = await gisService.evaluateRoute(input);
      const run2 = await gisService.evaluateRoute(input);

      expect(run1.status).toBe(run2.status);
      expect(run1.overallVerdict).toBe(run2.overallVerdict);
      expect(run1.safetyClearance).toBe(run2.safetyClearance);
      expect(run1.restrictions.length).toBe(run2.restrictions.length);
      expect(run1.proximityChecks.nearestRestrictedZone?.distanceKm).toBe(
        run2.proximityChecks.nearestRestrictedZone?.distanceKm
      );
    });

    it('handles empty / missing coordinate input gracefully as INSUFFICIENT_SPATIAL_DATA', async () => {
      const input: RouteEvaluationRequest = {};

      const result = await gisService.evaluateRoute(input);

      expect(result.status).toBe('INSUFFICIENT_SPATIAL_DATA');
      expect(result.safetyClearance).toBe(false);
      expect(result.overallVerdict).toBe('AVOID');
    });
  });

  describe('7. HTTP API Route Integration', () => {
    it('POST /api/v1/gis/evaluate-route responds with 200 and structured GIS payload', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/gis/evaluate-route',
        payload: {
          vesselPosition: { latitude: 18.75, longitude: 72.65 },
          waypoints: [{ sequenceOrder: 1, latitude: 18.70, longitude: 72.60 }],
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.status).toBe('CLEAR');
      expect(json.safetyClearance).toBe(true);
      expect(json.provenance).toBeDefined();
      expect(json.provenance.rulesEnforced).toContain('RULE_RESTRICTED_ZONE_BREACH');
    });

    it('GET /api/v1/gis/restricted-zones responds with active maritime restricted zones', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/gis/restricted-zones',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.count).toBeGreaterThan(0);
      expect(Array.isArray(json.zones)).toBe(true);
      expect(json.zones[0].zone_type).toBeDefined();
    });
  });
});
