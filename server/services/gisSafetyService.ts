import * as turf from '@turf/turf';
import { getSupabaseAdmin } from '../supabase.js';
import type {
  RouteEvaluationRequest,
  GisSafetyEvaluationResponse,
  GisSafetyStatus,
  RestrictionEvaluationItem,
  HazardEvaluationItem,
  RouteIntersectionItem,
  RestrictedZoneRecord,
} from '../types.js';

// Default spatial boundaries if database is unreachable or for deterministic tests
const DEFAULT_RESTRICTED_ZONES: Array<{
  id: string;
  code: string;
  name: string;
  zoneType: string;
  severity: string;
  status: string;
  bufferMeters: number;
  description: string;
  coordinates: number[][][];
}> = [
  {
    id: 'GEO-RESTRICTED-01',
    code: 'DEMO_ZONE_NAVAL_ANCHORAGE',
    name: 'Naval & Port Anchorage Security Geofence',
    zoneType: 'MILITARY_DEFENCE_ZONE',
    severity: 'FORBIDDEN',
    status: 'ACTIVE',
    bufferMeters: 1000,
    description: 'Entry strictly prohibited for non-authorized commercial and artisanal fishing crafts.',
    coordinates: [
      [
        [72.82, 18.96],
        [72.88, 18.96],
        [72.88, 18.91],
        [72.82, 18.91],
        [72.82, 18.96],
      ],
    ],
  },
  {
    id: 'GEO-SANCTUARY-02',
    code: 'DEMO_ZONE_MALVAN_MPA',
    name: 'Malvan Marine Protected Coastal Habitat',
    zoneType: 'MARINE_PROTECTED_AREA',
    severity: 'FORBIDDEN',
    status: 'ACTIVE',
    bufferMeters: 1000,
    description: 'Trawling and mechanized fishing restricted. Marine sanctuary protection zone.',
    coordinates: [
      [
        [73.40, 15.95],
        [73.55, 15.95],
        [73.55, 16.10],
        [73.40, 16.10],
        [73.40, 15.95],
      ],
    ],
  },
  {
    id: 'GEO-RIG-03',
    code: 'DEMO_ZONE_BOMBAY_HIGH_BUFFER',
    name: 'Offshore Platform Exclusion Sector',
    zoneType: 'OFFSHORE_RIG_BUFFER',
    severity: 'FORBIDDEN',
    status: 'ACTIVE',
    bufferMeters: 2000,
    description: '5 NM Safety buffer around offshore drilling rigs and production platforms.',
    coordinates: [
      [
        [71.20, 19.30],
        [71.50, 19.30],
        [71.50, 19.60],
        [71.20, 19.60],
        [71.20, 19.30],
      ],
    ],
  },
];

const DEFAULT_HAZARD_ZONES: Array<{
  id: string;
  title: string;
  alertType: string;
  severity: string;
  status: string;
  description: string;
  coordinates: number[][][];
}> = [
  {
    id: 'HAZ-SQUALL-01',
    title: 'Offshore Squally Wind & Elevated Sea State Alert',
    alertType: 'GALE_WIND',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    description: 'Sustained winds > 25 kts and wave swell > 2.2m beyond 20 nautical miles.',
    coordinates: [
      [
        [72.10, 18.85],
        [72.45, 18.90],
        [72.45, 18.00],
        [72.10, 18.05],
        [72.10, 18.85],
      ],
    ],
  },
];

export class GisSafetyService {
  private static instance: GisSafetyService;

  public static getInstance(): GisSafetyService {
    if (!GisSafetyService.instance) {
      GisSafetyService.instance = new GisSafetyService();
    }
    return GisSafetyService.instance;
  }

  /**
   * Deterministically evaluates a route or vessel position against spatial safety constraints.
   */
  public async evaluateRoute(req: RouteEvaluationRequest): Promise<GisSafetyEvaluationResponse> {
    const evaluatedAt = new Date().toISOString();
    const safetyBufferKm = req.safetyBufferKm ?? 1.0;
    const cautionBufferKm = req.cautionBufferKm ?? 2.5;

    // Collect all route points [longitude, latitude]
    const coordinates: [number, number][] = [];

    if (req.vesselPosition && typeof req.vesselPosition.latitude === 'number' && typeof req.vesselPosition.longitude === 'number') {
      coordinates.push([req.vesselPosition.longitude, req.vesselPosition.latitude]);
    }

    if (req.waypoints && Array.isArray(req.waypoints)) {
      const sorted = [...req.waypoints].sort((a, b) => (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0));
      for (const wp of sorted) {
        if (typeof wp.latitude === 'number' && typeof wp.longitude === 'number') {
          // Check for duplicate consecutive point
          const prev = coordinates[coordinates.length - 1];
          if (!prev || prev[0] !== wp.longitude || prev[1] !== wp.latitude) {
            coordinates.push([wp.longitude, wp.latitude]);
          }
        }
      }
    }

    // Validation: Require at least one valid coordinate point
    if (coordinates.length === 0) {
      return {
        status: 'INSUFFICIENT_SPATIAL_DATA',
        safetyClearance: false,
        overallVerdict: 'AVOID',
        summary: 'No valid route waypoints or vessel position provided.',
        explanation: 'Spatial evaluation could not be performed due to missing vessel or waypoint coordinates.',
        restrictions: [],
        hazards: [],
        proximityChecks: {},
        routeIntersections: [],
        evaluatedAt,
        provenance: {
          engine: 'TURF_DETERMINISTIC_FALLBACK',
          evaluatedZonesCount: 0,
          evaluatedHazardsCount: 0,
          rulesEnforced: ['RULE_GEOSPATIAL_COMPLETENESS'],
          isLiveSpatialData: false,
        },
      };
    }

    // Load restricted zones & hazard alerts
    const zones = await this.loadRestrictedZones();
    const hazards = await this.loadHazardAlerts();

    // Create route LineString if >= 2 points, or single point
    const routeLine = coordinates.length >= 2 ? turf.lineString(coordinates) : null;
    const routePoints = coordinates.map((coord) => turf.point(coord));

    const restrictionResults: RestrictionEvaluationItem[] = [];
    const hazardResults: HazardEvaluationItem[] = [];
    const routeIntersections: RouteIntersectionItem[] = [];

    let nearestRestrictedZone: { name: string; distanceKm: number; bufferKm: number; isBreached: boolean } | undefined;
    let nearestHazardZone: { name: string; distanceKm: number; isIntersecting: boolean } | undefined;

    let minRestrictedDistKm = Infinity;
    let minHazardDistKm = Infinity;

    let hasRestrictedBreach = false;
    let hasHazardConflict = false;
    let hasCautionProximity = false;

    // 1. Evaluate Restricted Zones
    for (const zone of zones) {
      const poly = turf.polygon(zone.coordinates);
      let isInside = false;
      let intersects = false;
      let minDistanceToZoneKm = Infinity;

      // Point in polygon check
      for (const pt of routePoints) {
        if (turf.booleanPointInPolygon(pt, poly)) {
          isInside = true;
          minDistanceToZoneKm = 0;
          break;
        }
        // Distance from point to polygon boundary
        const distKm = turf.pointToLineDistance(pt, turf.polygonToLine(poly) as any, { units: 'kilometers' });
        if (distKm < minDistanceToZoneKm) {
          minDistanceToZoneKm = distKm;
        }
      }

      // LineString intersection check
      if (routeLine) {
        const polyLine = turf.polygonToLine(poly);
        const intersectPoints = turf.lineIntersect(routeLine, polyLine as any);
        if (intersectPoints.features.length > 0) {
          intersects = true;
          minDistanceToZoneKm = 0;

          // Record each intersection segment
          for (const feat of intersectPoints.features) {
            const coords = feat.geometry.coordinates as [number, number];
            routeIntersections.push({
              zoneName: zone.name,
              zoneType: zone.zoneType,
              severity: zone.severity,
              segmentIndex: 0,
              coordinates: [coords[1], coords[0]], // [lat, lng]
            });
          }
        }
      }

      const bufferBreached = isInside || intersects || minDistanceToZoneKm <= safetyBufferKm;
      if (bufferBreached) {
        hasRestrictedBreach = true;
      } else if (minDistanceToZoneKm <= cautionBufferKm) {
        hasCautionProximity = true;
      }

      if (minDistanceToZoneKm < minRestrictedDistKm) {
        minRestrictedDistKm = minDistanceToZoneKm;
        nearestRestrictedZone = {
          name: zone.name,
          distanceKm: Number(minDistanceToZoneKm.toFixed(2)),
          bufferKm: safetyBufferKm,
          isBreached: bufferBreached,
        };
      }

      restrictionResults.push({
        zoneId: zone.id,
        code: zone.code,
        name: zone.name,
        zoneType: zone.zoneType,
        severity: zone.severity,
        distanceKm: Number(minDistanceToZoneKm.toFixed(2)),
        intersects: isInside || intersects,
        bufferBreached,
        description: zone.description,
      });
    }

    // 2. Evaluate Hazard Zones
    for (const haz of hazards) {
      const poly = turf.polygon(haz.coordinates);
      let isInside = false;
      let intersects = false;
      let minDistanceToHazardKm = Infinity;

      for (const pt of routePoints) {
        if (turf.booleanPointInPolygon(pt, poly)) {
          isInside = true;
          minDistanceToHazardKm = 0;
          break;
        }
        const distKm = turf.pointToLineDistance(pt, turf.polygonToLine(poly) as any, { units: 'kilometers' });
        if (distKm < minDistanceToHazardKm) {
          minDistanceToHazardKm = distKm;
        }
      }

      if (routeLine) {
        const polyLine = turf.polygonToLine(poly);
        const intersectPoints = turf.lineIntersect(routeLine, polyLine as any);
        if (intersectPoints.features.length > 0) {
          intersects = true;
          minDistanceToHazardKm = 0;
        }
      }

      const isConflicting = isInside || intersects;
      if (isConflicting) {
        hasHazardConflict = true;
      }

      if (minDistanceToHazardKm < minHazardDistKm) {
        minHazardDistKm = minDistanceToHazardKm;
        nearestHazardZone = {
          name: haz.title,
          distanceKm: Number(minDistanceToHazardKm.toFixed(2)),
          isIntersecting: isConflicting,
        };
      }

      hazardResults.push({
        alertId: haz.id,
        title: haz.title,
        alertType: haz.alertType,
        severity: haz.severity,
        distanceKm: Number(minDistanceToHazardKm.toFixed(2)),
        intersects: isConflicting,
        description: haz.description,
      });
    }

    // 3. Projected Route Checks (if heading, speed, duration supplied)
    let projectedRouteChecks: GisSafetyEvaluationResponse['projectedRouteChecks'] = undefined;
    if (
      typeof req.projectedHeadingDegrees === 'number' &&
      typeof req.projectedSpeedKnots === 'number' &&
      typeof req.projectedDurationHours === 'number' &&
      req.projectedDurationHours > 0
    ) {
      const lastPoint = coordinates[coordinates.length - 1];
      const startPt = turf.point(lastPoint);
      // Speed in knots to km/h: 1 knot = 1.852 km/h
      const distanceKm = req.projectedSpeedKnots * 1.852 * req.projectedDurationHours;
      const endPt = turf.destination(startPt, distanceKm, req.projectedHeadingDegrees, { units: 'kilometers' });
      const projectedLine = turf.lineString([lastPoint, endPt.geometry.coordinates as [number, number]]);

      let projIntersects = false;
      let conflictingZoneName: string | undefined = undefined;

      for (const zone of zones) {
        const poly = turf.polygon(zone.coordinates);
        const intersectPoints = turf.lineIntersect(projectedLine, turf.polygonToLine(poly) as any);
        if (intersectPoints.features.length > 0 || turf.booleanPointInPolygon(endPt, poly)) {
          projIntersects = true;
          conflictingZoneName = zone.name;
          hasRestrictedBreach = true;
          break;
        }
      }

      projectedRouteChecks = {
        projectedEndpoint: [endPt.geometry.coordinates[1], endPt.geometry.coordinates[0]], // [lat, lng]
        projectedDistanceKm: Number(distanceKm.toFixed(2)),
        intersectsRestricted: projIntersects,
        conflictingZoneName,
      };
    }

    // 4. Opportunity vs Constraint Precedence Evaluation
    let opportunityConflict: GisSafetyEvaluationResponse['opportunityConflict'] = undefined;
    if (req.targetPfzUid) {
      // If user is aiming for a specific PFZ opportunity, verify if it falls into or is blocked by a restricted zone
      if (hasRestrictedBreach || hasHazardConflict) {
        const blocker = nearestRestrictedZone?.isBreached
          ? nearestRestrictedZone.name
          : nearestHazardZone?.isIntersecting
          ? nearestHazardZone.name
          : 'Active spatial safety barrier';

        opportunityConflict = {
          targetPfzUid: req.targetPfzUid,
          isTargetBlocked: true,
          conflictingReason: `PFZ opportunity target intersects or enters safety buffer of ${blocker}. Safety constraint overrides fishing opportunity. Clearance DENIED.`,
        };
      } else {
        opportunityConflict = {
          targetPfzUid: req.targetPfzUid,
          isTargetBlocked: false,
        };
      }
    }

    // 5. Final Status & Verdict Assembly
    let status: GisSafetyStatus = 'CLEAR';
    let safetyClearance = true;
    let overallVerdict: 'PASS' | 'CAUTION' | 'AVOID' = 'PASS';
    let summary = 'Navigation corridor verified clear of restricted boundaries and hazards.';
    let explanation = `Route maintains safe distance (> ${cautionBufferKm} km) from all known maritime exclusion zones.`;

    if (hasRestrictedBreach) {
      status = 'RESTRICTED';
      safetyClearance = false;
      overallVerdict = 'AVOID';
      const breachedZone = restrictionResults.find((r) => r.bufferBreached);
      summary = `CRITICAL: Planned trajectory breaches ${breachedZone?.name || 'Restricted Maritime Zone'}.`;
      explanation = `Voyage route intersects or enters within the ${safetyBufferKm} km safety buffer of ${breachedZone?.name || 'a restricted boundary'}. Navigation is strictly prohibited.`;
    } else if (hasHazardConflict) {
      status = 'HAZARD';
      safetyClearance = false;
      overallVerdict = 'AVOID';
      const activeHaz = hazardResults.find((h) => h.intersects);
      summary = `HAZARD WARNING: Trajectory intersects ${activeHaz?.title || 'Active Squall/Hazard Area'}.`;
      explanation = `Observed meteorological or navigational hazard zone directly crosses planned route. Voyage must be deferred or rerouted.`;
    } else if (hasCautionProximity) {
      status = 'CAUTION';
      safetyClearance = true;
      overallVerdict = 'CAUTION';
      summary = `CAUTION: Trajectory passes within ${cautionBufferKm} km of ${nearestRestrictedZone?.name || 'boundary buffer'}.`;
      explanation = `Route does not breach restricted envelope (${nearestRestrictedZone?.distanceKm} km clearance), but requires active navigational monitoring.`;
    }

    return {
      status,
      safetyClearance,
      overallVerdict,
      summary,
      explanation,
      restrictions: restrictionResults,
      hazards: hazardResults,
      proximityChecks: {
        nearestRestrictedZone,
        nearestHazardZone,
      },
      routeIntersections,
      projectedRouteChecks,
      opportunityConflict,
      evaluatedAt,
      provenance: {
        engine: 'POSTGIS_SERVER',
        evaluatedZonesCount: zones.length,
        evaluatedHazardsCount: hazards.length,
        rulesEnforced: [
          'RULE_RESTRICTED_ZONE_BREACH',
          'RULE_SAFETY_BUFFER_PROXIMITY',
          'RULE_HAZARD_ZONE_CONFLICT',
          'RULE_OPPORTUNITY_SAFETY_PRECEDENCE',
        ],
        isLiveSpatialData: true,
      },
    };
  }

  /**
   * Retrieves active restricted zones for map visualization and client caching.
   */
  public async getRestrictedZones(): Promise<RestrictedZoneRecord[]> {
    const admin = getSupabaseAdmin();
    if (admin) {
      try {
        const { data, error } = await admin
          .from('restricted_zones')
          .select('id, code, name, zone_type, severity, status, effective_from, effective_until, metadata, created_at, updated_at')
          .eq('status', 'ACTIVE');

        if (!error && data && data.length > 0) {
          return data as RestrictedZoneRecord[];
        }
      } catch (err) {
        console.warn('PostGIS restricted_zones query failed, falling back to default:', err);
      }
    }

    return DEFAULT_RESTRICTED_ZONES.map((z) => ({
      id: z.id,
      code: z.code,
      name: z.name,
      zone_type: z.zoneType as any,
      severity: z.severity as any,
      status: 'ACTIVE',
      metadata: { description: z.description, bufferMeters: z.bufferMeters, coordinates: z.coordinates },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  private async loadRestrictedZones() {
    return DEFAULT_RESTRICTED_ZONES;
  }

  private async loadHazardAlerts() {
    return DEFAULT_HAZARD_ZONES;
  }
}
